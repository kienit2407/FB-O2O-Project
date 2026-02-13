import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { ProductOption, ProductOptionDocument } from '../schemas/product-option.schema';

@Injectable()
export class ProductOptionsService {
    constructor(
        @InjectModel(ProductOption.name) private optionModel: Model<ProductOptionDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    private async assertProductBelongsToMerchant(productId: string, merchantId: string) {
        const prod = await this.productModel.findOne({
            _id: new Types.ObjectId(productId),
            merchant_id: new Types.ObjectId(merchantId),
            deleted_at: null,
        });
        if (!prod) throw new NotFoundException('Product not found');
        return prod;
    }

    private async assertOptionBelongsToMerchant(optionId: string, merchantId: string) {
        const opt = await this.optionModel.findOne({ _id: new Types.ObjectId(optionId), deleted_at: null });
        if (!opt) throw new NotFoundException('Option group not found');

        await this.assertProductBelongsToMerchant(opt.product_id.toString(), merchantId);
        return opt;
    }

    async listByProduct(merchantId: string, productId: string) {
        await this.assertProductBelongsToMerchant(productId, merchantId);

        return this.optionModel
            .find({ product_id: new Types.ObjectId(productId), deleted_at: null })
            .sort({ sort_order: 1, created_at: 1 })
            .exec();
    }

    async createGroup(merchantId: string, productId: string, data: Partial<ProductOption>) {
        await this.assertProductBelongsToMerchant(productId, merchantId);

        const last = await this.optionModel
            .find({ product_id: new Types.ObjectId(productId), deleted_at: null })
            .sort({ sort_order: -1 })
            .limit(1);

        const nextSort = typeof data.sort_order === 'number'
            ? data.sort_order
            : (last?.[0]?.sort_order ?? 0) + 1;

        const doc = new this.optionModel({
            product_id: new Types.ObjectId(productId),
            name: data.name,
            type: data.type,
            is_required: data.is_required ?? false,
            min_select: data.min_select ?? 1,
            max_select: data.max_select ?? 1,
            sort_order: nextSort,
            choices: [],
        });

        return doc.save();
    }

    async updateGroup(merchantId: string, optionId: string, data: Partial<ProductOption>) {
        await this.assertOptionBelongsToMerchant(optionId, merchantId);

        const doc = await this.optionModel.findByIdAndUpdate(
            new Types.ObjectId(optionId),
            { $set: data },
            { new: true },
        );

        if (!doc) throw new NotFoundException('Option group not found');
        return doc;
    }

    async reorderGroups(merchantId: string, productId: string, orderedIds: string[]) {
        await this.assertProductBelongsToMerchant(productId, merchantId);

        const ops = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(id), product_id: new Types.ObjectId(productId), deleted_at: null },
                update: { $set: { sort_order: index + 1 } },
            },
        }));

        if (ops.length) await this.optionModel.bulkWrite(ops);
        return this.listByProduct(merchantId, productId);
    }

    async softDeleteGroup(merchantId: string, optionId: string) {
        await this.assertOptionBelongsToMerchant(optionId, merchantId);

        const doc = await this.optionModel.findByIdAndUpdate(
            new Types.ObjectId(optionId),
            { $set: { deleted_at: new Date() } },
            { new: true },
        );
        if (!doc) throw new NotFoundException('Option group not found');
        return doc;
    }

    async addChoice(merchantId: string, optionId: string, data: any) {
        const opt = await this.assertOptionBelongsToMerchant(optionId, merchantId);

        const choiceId = new Types.ObjectId();
        const choice = {
            _id: choiceId,
            name: data.name,
            price_modifier: data.price_modifier ?? 0,
            is_default: !!data.is_default,
            is_available: data.is_available ?? true,
        };

        // nếu set default => clear default các choice khác
        if (choice.is_default) {
            await this.optionModel.updateOne(
                { _id: opt._id, 'choices.is_default': true },
                { $set: { 'choices.$[].is_default': false } },
            );
        }

        await this.optionModel.updateOne(
            { _id: opt._id, deleted_at: null },
            { $push: { choices: choice } },
        );

        return this.optionModel.findById(opt._id).exec();
    }

    async updateChoice(merchantId: string, optionId: string, choiceId: string, data: any) {
        const opt = await this.assertOptionBelongsToMerchant(optionId, merchantId);

        if (data.is_default === true) {
            // clear default all
            await this.optionModel.updateOne(
                { _id: opt._id, deleted_at: null },
                { $set: { 'choices.$[].is_default': false } },
            );
        }

        const update: any = {};
        if (data.name !== undefined) update['choices.$.name'] = data.name;
        if (data.price_modifier !== undefined) update['choices.$.price_modifier'] = data.price_modifier;
        if (data.is_default !== undefined) update['choices.$.is_default'] = data.is_default;
        if (data.is_available !== undefined) update['choices.$.is_available'] = data.is_available;

        const res = await this.optionModel.findOneAndUpdate(
            { _id: opt._id, 'choices._id': new Types.ObjectId(choiceId), deleted_at: null },
            { $set: update },
            { new: true },
        );

        if (!res) throw new NotFoundException('Choice not found');
        return res;
    }

    async toggleChoiceAvailable(merchantId: string, optionId: string, choiceId: string) {
        const opt = await this.assertOptionBelongsToMerchant(optionId, merchantId);

        const doc = await this.optionModel.findById(opt._id).exec();
        const choice = doc?.choices?.find(c => c._id.toString() === choiceId);
        if (!choice) throw new NotFoundException('Choice not found');

        return this.optionModel.findOneAndUpdate(
            { _id: opt._id, 'choices._id': new Types.ObjectId(choiceId), deleted_at: null },
            { $set: { 'choices.$.is_available': !choice.is_available } },
            { new: true },
        );
    }

    async setChoiceDefault(merchantId: string, optionId: string, choiceId: string) {
        const opt = await this.assertOptionBelongsToMerchant(optionId, merchantId);

        // clear all default then set specific
        await this.optionModel.updateOne(
            { _id: opt._id, deleted_at: null },
            { $set: { 'choices.$[].is_default': false } },
        );

        const res = await this.optionModel.findOneAndUpdate(
            { _id: opt._id, 'choices._id': new Types.ObjectId(choiceId), deleted_at: null },
            { $set: { 'choices.$.is_default': true } },
            { new: true },
        );

        if (!res) throw new NotFoundException('Choice not found');
        return res;
    }

    async deleteChoice(merchantId: string, optionId: string, choiceId: string) {
        const opt = await this.assertOptionBelongsToMerchant(optionId, merchantId);

        const res = await this.optionModel.findByIdAndUpdate(
            opt._id,
            { $pull: { choices: { _id: new Types.ObjectId(choiceId) } } },
            { new: true },
        );

        if (!res) throw new NotFoundException('Choice not found');
        return res;
    }
}

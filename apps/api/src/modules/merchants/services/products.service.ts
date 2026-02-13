import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Topping, ToppingDocument } from '../schemas/topping.schema';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(Topping.name) private toppingModel: Model<ToppingDocument>,
    ) { }

    async list(
        merchantId: string,
        query?: { q?: string; categoryId?: string; status?: 'all' | 'available' | 'unavailable' },
    ) {
        const q: any = { merchant_id: new Types.ObjectId(merchantId), deleted_at: null };

        if (query?.q) q.name = { $regex: query.q, $options: 'i' };
        if (query?.categoryId) q.category_id = new Types.ObjectId(query.categoryId);
        if (query?.status === 'available') q.is_available = true;
        if (query?.status === 'unavailable') q.is_available = false;

        return this.productModel.find(q).sort({ sort_order: 1, created_at: -1 }).exec();
    }

    async create(merchantId: string, data: Partial<Product>) {
        // validate category belongs to merchant
        const cat = await this.categoryModel.findOne({
            _id: new Types.ObjectId(data.category_id as any),
            merchant_id: new Types.ObjectId(merchantId),
            deleted_at: null,
        });
        if (!cat) throw new BadRequestException('Category không hợp lệ');

        // validate toppings belong to merchant
        if (data.topping_ids?.length) {
            const count = await this.toppingModel.countDocuments({
                _id: { $in: data.topping_ids.map(id => new Types.ObjectId(id as any)) },
                merchant_id: new Types.ObjectId(merchantId),
                deleted_at: null,
            });
            if (count !== data.topping_ids.length) throw new BadRequestException('Topping không hợp lệ');
        }

        const last = await this.productModel
            .find({ merchant_id: new Types.ObjectId(merchantId), deleted_at: null })
            .sort({ sort_order: -1 })
            .limit(1);

        const nextSort = typeof data.sort_order === 'number'
            ? data.sort_order
            : (last?.[0]?.sort_order ?? 0) + 1;

        const doc = new this.productModel({
            merchant_id: new Types.ObjectId(merchantId),
            category_id: new Types.ObjectId(data.category_id as any),
            name: data.name,
            description: data.description,
            image_urls: data.image_urls ?? [],
            base_price: data.base_price,
            sale_price: data.sale_price ?? 0,
            is_available: data.is_available ?? true,
            is_active: data.is_active ?? true,
            sort_order: nextSort,
            topping_ids: (data.topping_ids ?? []).map(id => new Types.ObjectId(id as any)),
        });

        return doc.save();
    }

    async update(merchantId: string, id: string, data: Partial<Product>) {
        if (data.category_id) {
            const cat = await this.categoryModel.findOne({
                _id: new Types.ObjectId(data.category_id as any),
                merchant_id: new Types.ObjectId(merchantId),
                deleted_at: null,
            });
            if (!cat) throw new BadRequestException('Category không hợp lệ');
        }

        if (data.topping_ids) {
            const count = await this.toppingModel.countDocuments({
                _id: { $in: data.topping_ids.map(t => new Types.ObjectId(t as any)) },
                merchant_id: new Types.ObjectId(merchantId),
                deleted_at: null,
            });
            if (count !== data.topping_ids.length) throw new BadRequestException('Topping không hợp lệ');
            data.topping_ids = data.topping_ids.map(t => new Types.ObjectId(t as any)) as any;
        }

        const doc = await this.productModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                merchant_id: new Types.ObjectId(merchantId),
                deleted_at: null,
            },
            { $set: data },
            { new: true },
        );

        if (!doc) throw new NotFoundException('Product not found');
        return doc;
    }

    async toggleAvailable(merchantId: string, id: string) {
        const doc = await this.productModel.findOne({
            _id: new Types.ObjectId(id),
            merchant_id: new Types.ObjectId(merchantId),
            deleted_at: null,
        });
        if (!doc) throw new NotFoundException('Product not found');

        return this.productModel.findByIdAndUpdate(
            doc._id,
            { $set: { is_available: !doc.is_available } },
            { new: true },
        );
    }

    async reorder(merchantId: string, orderedIds: string[]) {
        const merchantObjectId = new Types.ObjectId(merchantId);
        const ops = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(id), merchant_id: merchantObjectId, deleted_at: null },
                update: { $set: { sort_order: index + 1 } },
            },
        }));
        if (ops.length) await this.productModel.bulkWrite(ops);
        return this.list(merchantId);
    }

    async softDelete(merchantId: string, id: string) {
        const doc = await this.productModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                merchant_id: new Types.ObjectId(merchantId),
                deleted_at: null,
            },
            { $set: { deleted_at: new Date() } },
            { new: true },
        );
        if (!doc) throw new NotFoundException('Product not found');
        return doc;
    }
}

import { IsBoolean, IsEnum, IsInt, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { OptionType } from '../schemas/product-option.schema';

export class CreateOptionGroupDto {
    @IsString()
    @MaxLength(120)
    name: string;

    @IsOptional()
    @IsEnum(OptionType)
    type?: OptionType;

    @IsOptional()
    @IsBoolean()
    is_required?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    min_select?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    max_select?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    sort_order?: number;
}

export class UpdateOptionGroupDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;

    @IsOptional()
    @IsEnum(OptionType)
    type?: OptionType;

    @IsOptional()
    @IsBoolean()
    is_required?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    min_select?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    max_select?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    sort_order?: number;
}

export class CreateChoiceDto {
    @IsString()
    @MaxLength(120)
    name: string;

    @IsOptional()
    @IsNumber()
    price_modifier?: number;

    @IsOptional()
    @IsBoolean()
    is_default?: boolean;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;
}

export class UpdateChoiceDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    name?: string;

    @IsOptional()
    @IsNumber()
    price_modifier?: number;

    @IsOptional()
    @IsBoolean()
    is_default?: boolean;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;
}

export class ReorderDto {
    @IsMongoId()
    productId: string;

    orderedIds: string[];
}

import { IsArray, IsBoolean, IsInt, IsMongoId, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
    @IsMongoId()
    category_id: string;

    @IsString()
    @MaxLength(160)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsNumber()
    @Min(0)
    base_price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    sale_price?: number;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    sort_order?: number;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    topping_ids?: string[];
}

export class UpdateProductDto {
    @IsOptional()
    @IsMongoId()
    category_id?: string;

    @IsOptional()
    @IsString()
    @MaxLength(160)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    base_price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    sale_price?: number;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    sort_order?: number;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    topping_ids?: string[];
}

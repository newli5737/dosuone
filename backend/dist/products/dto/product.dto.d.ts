declare class ProductImageDto {
    image_url: string;
    sort_order?: number;
    is_primary?: boolean;
}
declare class ProductSpecDto {
    spec_key: string;
    spec_value: string;
    sort_order?: number;
}
export declare class CreateProductDto {
    category_id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    sale_price?: number;
    stock?: number;
    brand?: string;
    thumbnail_url?: string;
    is_featured?: boolean;
    images?: ProductImageDto[];
    specs?: ProductSpecDto[];
}
export declare class UpdateProductDto {
    category_id?: string;
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    sale_price?: number;
    stock?: number;
    brand?: string;
    thumbnail_url?: string;
    is_featured?: boolean;
    is_active?: boolean;
}
export declare class ProductQueryDto {
    page?: number;
    limit?: number;
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
}
export {};

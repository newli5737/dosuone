import { Product } from './product.entity';
export declare class ProductImage {
    id: string;
    productId: string;
    product: Product;
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
}

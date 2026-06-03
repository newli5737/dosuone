import { Product } from './product.entity';
export declare class Category {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
    products: Product[];
}

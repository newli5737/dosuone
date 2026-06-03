import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { ProductSpec } from './product-spec.entity';
import { Review } from './review.entity';
export declare class Product {
    id: string;
    categoryId: string;
    category: Category;
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice: number;
    stock: number;
    brand: string;
    thumbnailUrl: string;
    isFeatured: boolean;
    isActive: boolean;
    avgRating: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
    images: ProductImage[];
    specs: ProductSpec[];
    reviews: Review[];
}

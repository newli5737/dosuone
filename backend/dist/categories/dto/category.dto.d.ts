export declare class CreateCategoryDto {
    name: string;
    slug: string;
    image_url?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    slug?: string;
    image_url?: string;
    is_active?: boolean;
}

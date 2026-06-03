import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesController {
    private service;
    constructor(service: CategoriesService);
    findAll(): Promise<import("../entities").Category[]>;
    findBySlug(slug: string): Promise<import("../entities").Category>;
    create(dto: CreateCategoryDto): Promise<import("../entities").Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("../entities").Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

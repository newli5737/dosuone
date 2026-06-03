"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let CategoriesService = class CategoriesService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll() {
        return this.repo.find({ where: { isActive: true }, order: { name: 'ASC' } });
    }
    async findBySlug(slug) {
        const cat = await this.repo.findOne({ where: { slug, isActive: true } });
        if (!cat)
            throw new common_1.NotFoundException('Danh mục không tồn tại');
        return cat;
    }
    create(dto) {
        return this.repo.save(this.repo.create({
            name: dto.name,
            slug: dto.slug,
            imageUrl: dto.image_url,
        }));
    }
    async update(id, dto) {
        const cat = await this.repo.findOne({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Danh mục không tồn tại');
        if (dto.name)
            cat.name = dto.name;
        if (dto.slug)
            cat.slug = dto.slug;
        if (dto.image_url !== undefined)
            cat.imageUrl = dto.image_url;
        if (dto.is_active !== undefined)
            cat.isActive = dto.is_active;
        return this.repo.save(cat);
    }
    async remove(id) {
        const cat = await this.repo.findOne({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Danh mục không tồn tại');
        await this.repo.remove(cat);
        return { message: 'Đã xóa danh mục' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map
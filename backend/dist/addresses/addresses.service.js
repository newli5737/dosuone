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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let AddressesService = class AddressesService {
    constructor(repo) {
        this.repo = repo;
    }
    findAll(userId) {
        return this.repo.find({
            where: { userId },
            order: { isDefault: 'DESC', fullName: 'ASC' },
        });
    }
    async create(userId, dto) {
        if (dto.isDefault) {
            await this.repo.update({ userId }, { isDefault: false });
        }
        const count = await this.repo.count({ where: { userId } });
        const address = this.repo.create({
            userId,
            fullName: dto.fullName,
            phone: dto.phone,
            province: dto.province,
            district: dto.district,
            ward: dto.ward,
            addressDetail: dto.addressDetail,
            isDefault: dto.isDefault ?? count === 0,
        });
        return this.repo.save(address);
    }
    async update(userId, id, dto) {
        const address = await this.repo.findOne({ where: { id, userId } });
        if (!address)
            throw new common_1.NotFoundException('Địa chỉ không tồn tại');
        if (dto.isDefault)
            await this.repo.update({ userId }, { isDefault: false });
        Object.assign(address, dto);
        return this.repo.save(address);
    }
    async remove(userId, id) {
        const address = await this.repo.findOne({ where: { id, userId } });
        if (!address)
            throw new common_1.NotFoundException('Địa chỉ không tồn tại');
        await this.repo.remove(address);
        return { message: 'Đã xóa địa chỉ' };
    }
    async setDefault(userId, id) {
        const address = await this.repo.findOne({ where: { id, userId } });
        if (!address)
            throw new common_1.NotFoundException('Địa chỉ không tồn tại');
        await this.repo.update({ userId }, { isDefault: false });
        address.isDefault = true;
        return this.repo.save(address);
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Address)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const class_transformer_1 = require("class-transformer");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let AuthService = class AuthService {
    constructor(usersRepo, jwt, config) {
        this.usersRepo = usersRepo;
        this.jwt = jwt;
        this.config = config;
    }
    sanitize(user) {
        return (0, class_transformer_1.instanceToPlain)(user);
    }
    async tokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = await this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN'),
        });
        const refresh_token = await this.jwt.signAsync(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
        });
        await this.usersRepo.update(user.id, { refreshToken: refresh_token });
        return { access_token, refresh_token, user: this.sanitize(user) };
    }
    async register(dto) {
        const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email đã tồn tại');
        const hash = await bcrypt.hash(dto.password, 10);
        const user = this.usersRepo.create({
            email: dto.email,
            password: hash,
            fullName: dto.full_name,
            role: entities_1.UserRole.CUSTOMER,
        });
        await this.usersRepo.save(user);
        return this.tokens(user);
    }
    async login(dto) {
        const user = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (!user.isActive)
            throw new common_1.UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
        return this.tokens(user);
    }
    async refresh(refreshToken) {
        try {
            const payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.get('JWT_SECRET'),
            });
            const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
            if (!user || user.refreshToken !== refreshToken) {
                throw new common_1.UnauthorizedException();
            }
            return this.tokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ');
        }
    }
    async logout(userId) {
        await this.usersRepo.update(userId, { refreshToken: null });
        return { message: 'Đăng xuất thành công' };
    }
    async me(user) {
        return this.sanitize(user);
    }
    async updateProfile(user, dto) {
        if (dto.full_name)
            user.fullName = dto.full_name;
        if (dto.phone !== undefined)
            user.phone = dto.phone;
        if (dto.avatar_url !== undefined)
            user.avatarUrl = dto.avatar_url;
        await this.usersRepo.save(user);
        return this.sanitize(user);
    }
    async changePassword(user, dto) {
        const ok = await bcrypt.compare(dto.old_password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Mật khẩu cũ không đúng');
        user.password = await bcrypt.hash(dto.new_password, 10);
        await this.usersRepo.save(user);
        return { message: 'Đổi mật khẩu thành công' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
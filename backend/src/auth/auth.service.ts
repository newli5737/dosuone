import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private sanitize(user: User) {
    return instanceToPlain(user);
  }

  private async tokens(user: User) {
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

  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã tồn tại');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      password: hash,
      fullName: dto.full_name,
      role: UserRole.CUSTOMER,
    });
    await this.usersRepo.save(user);
    return this.tokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    return this.tokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }
      return this.tokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshToken: null });
    return { message: 'Đăng xuất thành công' };
  }

  async me(user: User) {
    return this.sanitize(user);
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    if (dto.full_name) user.fullName = dto.full_name;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.avatar_url !== undefined) user.avatarUrl = dto.avatar_url;
    await this.usersRepo.save(user);
    return this.sanitize(user);
  }

  async changePassword(user: User, dto: ChangePasswordDto) {
    const ok = await bcrypt.compare(dto.old_password, user.password);
    if (!ok) throw new UnauthorizedException('Mật khẩu cũ không đúng');
    user.password = await bcrypt.hash(dto.new_password, 10);
    await this.usersRepo.save(user);
    return { message: 'Đổi mật khẩu thành công' };
  }
}

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
export declare class AuthService {
    private usersRepo;
    private jwt;
    private config;
    constructor(usersRepo: Repository<User>, jwt: JwtService, config: ConfigService);
    private sanitize;
    private tokens;
    register(dto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: Record<string, any>;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: Record<string, any>;
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: Record<string, any>;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    me(user: User): Promise<Record<string, any>>;
    updateProfile(user: User, dto: UpdateProfileDto): Promise<Record<string, any>>;
    changePassword(user: User, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}

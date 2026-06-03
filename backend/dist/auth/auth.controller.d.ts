import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RefreshDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { User } from '../entities';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: Record<string, any>;
    }>;
    logout(user: User): Promise<{
        message: string;
    }>;
    me(user: User): Promise<Record<string, any>>;
    updateProfile(user: User, dto: UpdateProfileDto): Promise<Record<string, any>>;
    changePassword(user: User, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}

export declare class RegisterDto {
    email: string;
    password: string;
    full_name: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refresh_token: string;
}
export declare class UpdateProfileDto {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
}
export declare class ChangePasswordDto {
    old_password: string;
    new_password: string;
}

import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: number;
        email: string;
        nickname: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            nickname: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    logout(user: {
        id: number;
    }, res: Response): Promise<null>;
    refresh(req: Request): Promise<{
        accessToken: string;
    }>;
}

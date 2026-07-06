import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly config;
    constructor(authService: AuthService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        memberProfile: {
            displayName: string;
        };
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        ok: boolean;
    }>;
    refresh(req: any, res: Response): Promise<{
        ok: boolean;
    }>;
    logout(res: Response): {
        ok: boolean;
    };
    me(req: any): Promise<{
        id: string;
        createdAt: Date;
        memberProfile: {
            displayName: string;
        };
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    private setCookies;
    private verifyRefresh;
}

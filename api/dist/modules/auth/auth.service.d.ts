import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export type TokenPair = {
    access_token: string;
    refresh_token: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        memberProfile: {
            displayName: string;
        };
        username: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    login(dto: LoginDto): Promise<TokenPair>;
    refresh(userId: string): Promise<TokenPair>;
    me(userId: string): Promise<{
        memberProfile: {
            displayName: string;
        };
        username: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    private generateTokens;
}

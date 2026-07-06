import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    username?: string;
    password: string;
    role?: Role;
    displayName?: string;
}

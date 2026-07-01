import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    email?: string;
    username?: string;
    password?: string;
    role?: Role;
    displayName?: string;
}

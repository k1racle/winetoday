import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type AdminUserOutput = {
    id: string;
    email: string;
    username: string | null;
    role: Role;
    createdAt: Date;
    displayName: string | null;
    authorId: string | null;
    authorName: string | null;
};
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<AdminUserOutput[]>;
    findById(id: string): Promise<AdminUserOutput>;
    create(data: {
        email: string;
        username?: string;
        password: string;
        role?: Role;
        displayName?: string;
    }): Promise<AdminUserOutput>;
    update(id: string, data: {
        email?: string;
        username?: string | null;
        role?: Role;
        displayName?: string;
        password?: string;
    }): Promise<AdminUserOutput>;
    delete(id: string): Promise<void>;
    updateRole(userId: string, role: Role): Promise<AdminUserOutput>;
}

import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
declare class UpdateRoleDto {
    role: Role;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./users.service").AdminUserOutput[]>;
    findOne(id: string): Promise<import("./users.service").AdminUserOutput>;
    create(dto: CreateUserDto): Promise<import("./users.service").AdminUserOutput>;
    update(id: string, dto: UpdateUserDto): Promise<import("./users.service").AdminUserOutput>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<import("./users.service").AdminUserOutput>;
    remove(id: string): Promise<void>;
}
export {};

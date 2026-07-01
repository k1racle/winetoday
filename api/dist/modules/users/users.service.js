"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                memberProfile: {
                    select: {
                        displayName: true,
                        authorId: true,
                    },
                },
            },
        });
        return users.map((u) => ({
            ...u,
            displayName: u.memberProfile?.displayName ?? null,
            authorId: u.memberProfile?.authorId ?? null,
        }));
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                memberProfile: {
                    select: {
                        displayName: true,
                        authorId: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            ...user,
            displayName: user.memberProfile?.displayName ?? null,
            authorId: user.memberProfile?.authorId ?? null,
        };
    }
    async create(data) {
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already registered');
        }
        if (data.username) {
            const existingUsername = await this.prisma.user.findUnique({
                where: { username: data.username },
            });
            if (existingUsername) {
                throw new common_1.ConflictException('Username already taken');
            }
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                username: data.username || null,
                passwordHash,
                role: data.role ?? client_1.Role.member,
                memberProfile: {
                    create: {
                        displayName: data.displayName || data.username || data.email.split('@')[0],
                    },
                },
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                memberProfile: {
                    select: {
                        displayName: true,
                        authorId: true,
                    },
                },
            },
        });
        return {
            ...user,
            displayName: user.memberProfile?.displayName ?? null,
            authorId: user.memberProfile?.authorId ?? null,
        };
    }
    async update(id, data) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (data.email && data.email !== user.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existing) {
                throw new common_1.ConflictException('Email already registered');
            }
        }
        if (data.username && data.username !== user.username) {
            const existing = await this.prisma.user.findUnique({
                where: { username: data.username },
            });
            if (existing) {
                throw new common_1.ConflictException('Username already taken');
            }
        }
        const updateData = {
            email: data.email,
            username: data.username === null ? null : data.username ?? user.username,
            role: data.role,
        };
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...updateData,
                memberProfile: {
                    upsert: {
                        create: {
                            displayName: data.displayName || data.username || user.email.split('@')[0],
                        },
                        update: {
                            displayName: data.displayName,
                        },
                    },
                },
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                memberProfile: {
                    select: {
                        displayName: true,
                        authorId: true,
                    },
                },
            },
        });
        return {
            ...updated,
            displayName: updated.memberProfile?.displayName ?? null,
            authorId: updated.memberProfile?.authorId ?? null,
        };
    }
    async delete(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.delete({ where: { id } });
    }
    async updateRole(userId, role) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
                memberProfile: {
                    select: {
                        displayName: true,
                        authorId: true,
                    },
                },
            },
        });
        return {
            ...updated,
            displayName: updated.memberProfile?.displayName ?? null,
            authorId: updated.memberProfile?.authorId ?? null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
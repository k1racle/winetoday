"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService, jwtService, config) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async login(dto, res) {
        const tokens = await this.authService.login(dto);
        this.setCookies(res, tokens);
        return { ok: true };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refresh_token;
        const payload = this.verifyRefresh(refreshToken);
        const tokens = await this.authService.refresh(payload.sub);
        this.setCookies(res, tokens);
        return { ok: true };
    }
    logout(res) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { ok: true };
    }
    async me(req) {
        return this.authService.me(req.user.userId);
    }
    setCookies(res, tokens) {
        const isProduction = this.config.get('NODE_ENV') === 'production';
        const secure = this.config.get('COOKIE_SECURE') !== undefined
            ? this.config.get('COOKIE_SECURE') === 'true'
            : isProduction;
        res.cookie('access_token', tokens.access_token, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            domain: this.config.get('COOKIE_DOMAIN') || undefined,
        });
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: this.config.get('COOKIE_DOMAIN') || undefined,
        });
    }
    verifyRefresh(token) {
        if (!token) {
            throw new common_1.UnauthorizedException();
        }
        try {
            return this.jwtService.verify(token, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
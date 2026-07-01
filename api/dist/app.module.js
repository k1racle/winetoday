"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const health_controller_1 = require("./health.controller");
const auth_module_1 = require("./modules/auth/auth.module");
const content_module_1 = require("./modules/content/content.module");
const editor_module_1 = require("./modules/editor/editor.module");
const media_module_1 = require("./modules/media/media.module");
const settings_module_1 = require("./modules/settings/settings.module");
const community_module_1 = require("./modules/community/community.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const watermark_module_1 = require("./modules/watermark/watermark.module");
const search_module_1 = require("./modules/search/search.module");
const users_module_1 = require("./modules/users/users.module");
const prisma_module_1 = require("./modules/prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            content_module_1.ContentModule,
            editor_module_1.EditorModule,
            media_module_1.MediaModule,
            settings_module_1.SettingsModule,
            community_module_1.CommunityModule,
            analytics_module_1.AnalyticsModule,
            watermark_module_1.WatermarkModule,
            search_module_1.SearchModule,
            users_module_1.UsersModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const media_avif_middleware_1 = require("./modules/media/media-avif.middleware");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const UPLOADS_DIR = '/app/uploads';
const BACKEND_UPLOADS_DIR = '/app/public/uploads';
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.use('/uploads', (0, media_avif_middleware_1.createMediaAvifMiddleware)([UPLOADS_DIR, BACKEND_UPLOADS_DIR]));
    app.useStaticAssets(UPLOADS_DIR, {
        prefix: '/uploads',
        setHeaders: avifContentTypeHeader,
    });
    app.useStaticAssets(BACKEND_UPLOADS_DIR, {
        prefix: '/uploads',
        setHeaders: avifContentTypeHeader,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const corsOrigin = process.env.CORS_ORIGIN;
    app.enableCors({
        origin: corsOrigin
            ? corsOrigin.split(',').map((o) => o.trim())
            : true,
        credentials: true,
    });
    app.setGlobalPrefix('api', {
        exclude: ['health'],
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT', 4000);
    await app.listen(port);
    console.log(`API listening on http://localhost:${port}`);
}
function avifContentTypeHeader(res, filePath) {
    if (filePath.toLowerCase().endsWith('.avif')) {
        res.setHeader('Content-Type', 'image/avif');
    }
}
bootstrap();
//# sourceMappingURL=main.js.map
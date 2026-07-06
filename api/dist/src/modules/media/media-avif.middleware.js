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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMediaAvifMiddleware = createMediaAvifMiddleware;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const AVIF_QUALITY = 80;
const AVIF_EFFORT = 4;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
function createMediaAvifMiddleware(uploadsDir) {
    const logger = new common_1.Logger('MediaAvifMiddleware');
    return async (req, res, next) => {
        const urlPath = decodeURIComponent(req.originalUrl || req.url);
        const ext = path.extname(urlPath).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) {
            return next();
        }
        const relativePath = urlPath.replace(/^\/uploads\//, '').replace(/^\//, '');
        const originalFile = path.join(uploadsDir, relativePath);
        const avifFile = ext ? `${originalFile.slice(0, -ext.length)}.avif` : `${originalFile}.avif`;
        try {
            const avifStats = await fs.stat(avifFile);
            if (avifStats.isFile()) {
                res.setHeader('Content-Type', 'image/avif');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                return res.sendFile(avifFile);
            }
        }
        catch {
        }
        try {
            const originalStats = await fs.stat(originalFile);
            if (!originalStats.isFile()) {
                return next();
            }
            logger.log(`Generating AVIF on-the-fly: ${urlPath}`);
            await (0, sharp_1.default)(originalFile, { animated: false })
                .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
                .toFile(avifFile);
            res.setHeader('Content-Type', 'image/avif');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return res.sendFile(avifFile);
        }
        catch (err) {
            logger.warn(`AVIF conversion failed for ${urlPath}: ${err?.message || err}`);
            return next();
        }
    };
}
//# sourceMappingURL=media-avif.middleware.js.map
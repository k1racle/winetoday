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
const AVIF_QUALITY = 75;
const AVIF_EFFORT = 4;
const MAX_WIDTH = 1920;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.jpe', '.png', '.webp', '.jfif']);
function createMediaAvifMiddleware(uploadsDirs) {
    const logger = new common_1.Logger('MediaAvifMiddleware');
    const normalizedDirs = uploadsDirs.map((d) => path.resolve(d));
    return async (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }
        const rawUrl = decodeURIComponent(req.originalUrl || req.url);
        const urlPath = rawUrl.split('?')[0];
        const ext = path.extname(urlPath).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) {
            return next();
        }
        const relativePath = urlPath.replace(/^\//, '').replace(/^uploads\//, '');
        const normalizedRelative = path.normalize(relativePath);
        if (path.isAbsolute(normalizedRelative) || normalizedRelative.startsWith('..')) {
            return next();
        }
        const baseName = ext ? normalizedRelative.slice(0, -ext.length) : normalizedRelative;
        const avifRelativePath = `${baseName}.avif`;
        try {
            for (const uploadsDir of normalizedDirs) {
                const originalFile = path.join(uploadsDir, normalizedRelative);
                const avifFile = path.join(uploadsDir, avifRelativePath);
                try {
                    const avifStats = await fs.stat(avifFile);
                    if (avifStats.isFile()) {
                        return serveAvif(res, avifFile);
                    }
                }
                catch {
                }
                try {
                    const originalStats = await fs.stat(originalFile);
                    if (!originalStats.isFile()) {
                        continue;
                    }
                    logger.log(`Generating AVIF on-the-fly: ${urlPath}`);
                    await (0, sharp_1.default)(originalFile, { animated: false })
                        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                        .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
                        .toFile(avifFile);
                    return serveAvif(res, avifFile);
                }
                catch {
                }
            }
        }
        catch (err) {
            logger.warn(`AVIF conversion failed for ${urlPath}: ${err?.message || err}`);
        }
        return next();
    };
}
function serveAvif(res, filePath) {
    res.setHeader('Content-Type', 'image/avif');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
}
//# sourceMappingURL=media-avif.middleware.js.map
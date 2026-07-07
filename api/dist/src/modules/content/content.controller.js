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
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
const content_service_1 = require("./content.service");
const list_content_dto_1 = require("./dto/list-content.dto");
const react_dto_1 = require("./dto/react.dto");
const create_comment_dto_1 = require("./dto/create-comment.dto");
let ContentController = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    listContent(query) {
        return this.contentService.findMany(query);
    }
    listArticles(query) {
        query.type = client_1.ContentType.article;
        return this.contentService.findMany(query);
    }
    articleDetail(slug, preview) {
        return this.contentService.findBySlug(client_1.ContentType.article, slug, { preview });
    }
    listNews(query) {
        query.type = client_1.ContentType.news;
        return this.contentService.findMany(query);
    }
    newsDetail(slug, preview) {
        return this.contentService.findBySlug(client_1.ContentType.news, slug, { preview });
    }
    listVideos(query) {
        query.type = client_1.ContentType.video;
        return this.contentService.findMany(query);
    }
    videoDetail(slug, preview) {
        return this.contentService.findBySlug(client_1.ContentType.video, slug, { preview });
    }
    listGalleries(query) {
        query.type = client_1.ContentType.gallery;
        return this.contentService.findMany(query);
    }
    galleryDetail(slug, preview) {
        return this.contentService.findBySlug(client_1.ContentType.gallery, slug, { preview });
    }
    categories() {
        return this.contentService.findCategories();
    }
    tags() {
        return this.contentService.findTags();
    }
    latestByCategory(limit) {
        return this.contentService.findLatestByCategory(limit ? parseInt(limit, 10) : 5);
    }
    homepage() {
        return this.contentService.findHomepageContent();
    }
    reactions(id, req) {
        return this.contentService.getReactions(id, req.user?.userId);
    }
    react(id, req, dto) {
        return this.contentService.react(id, req.user.userId, dto.type);
    }
    comments(id) {
        return this.contentService.getComments(id);
    }
    createComment(id, req, dto) {
        return this.contentService.createComment(id, req.user.userId, dto.body);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Get)('content'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_content_dto_1.ListContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "listContent", null);
__decorate([
    (0, common_1.Get)('articles'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_content_dto_1.ListContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "listArticles", null);
__decorate([
    (0, common_1.Get)('articles/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('preview', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "articleDetail", null);
__decorate([
    (0, common_1.Get)('news'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_content_dto_1.ListContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "listNews", null);
__decorate([
    (0, common_1.Get)('news/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('preview', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "newsDetail", null);
__decorate([
    (0, common_1.Get)('videos'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_content_dto_1.ListContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "listVideos", null);
__decorate([
    (0, common_1.Get)('videos/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('preview', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "videoDetail", null);
__decorate([
    (0, common_1.Get)('galleries'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_content_dto_1.ListContentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "listGalleries", null);
__decorate([
    (0, common_1.Get)('galleries/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('preview', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "galleryDetail", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('tags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "tags", null);
__decorate([
    (0, common_1.Get)('latest-by-category'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "latestByCategory", null);
__decorate([
    (0, common_1.Get)('homepage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "homepage", null);
__decorate([
    (0, common_1.Get)('content/:id/reactions'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "reactions", null);
__decorate([
    (0, common_1.Post)('content/:id/react'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, react_dto_1.ReactDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "react", null);
__decorate([
    (0, common_1.Get)('content/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "comments", null);
__decorate([
    (0, common_1.Post)('content/:id/comments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", void 0)
], ContentController.prototype, "createComment", null);
exports.ContentController = ContentController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map
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
exports.EditorController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const editor_service_1 = require("./editor.service");
const create_draft_dto_1 = require("./dto/create-draft.dto");
let EditorController = class EditorController {
    constructor(editorService) {
        this.editorService = editorService;
    }
    saveDraft(dto, req) {
        return this.editorService.saveDraft(req.user, dto);
    }
    getDraft(id, req) {
        return this.editorService.findDraft(req.user, id);
    }
    listMaterials(req, type, status, search, authorId, authorName, limit, offset, sort, order) {
        return this.editorService.listMaterials(req.user, {
            type,
            status,
            search,
            authorId,
            authorName,
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
            sort,
            order,
        });
    }
    listAuthors() {
        return this.editorService.listAuthors();
    }
};
exports.EditorController = EditorController;
__decorate([
    (0, common_1.Post)('drafts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_draft_dto_1.CreateDraftDto, Object]),
    __metadata("design:returntype", void 0)
], EditorController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Get)('drafts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EditorController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Get)('materials'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('authorId')),
    __param(5, (0, common_1.Query)('authorName')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('offset')),
    __param(8, (0, common_1.Query)('sort')),
    __param(9, (0, common_1.Query)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], EditorController.prototype, "listMaterials", null);
__decorate([
    (0, common_1.Get)('authors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EditorController.prototype, "listAuthors", null);
exports.EditorController = EditorController = __decorate([
    (0, common_1.Controller)('editor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.admin, client_1.Role.editor, client_1.Role.author),
    __metadata("design:paramtypes", [editor_service_1.EditorService])
], EditorController);
//# sourceMappingURL=editor.controller.js.map
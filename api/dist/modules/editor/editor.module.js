"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorModule = void 0;
const common_1 = require("@nestjs/common");
const editor_service_1 = require("./editor.service");
const editor_controller_1 = require("./editor.controller");
const admin_authors_controller_1 = require("./admin-authors.controller");
const media_module_1 = require("../media/media.module");
let EditorModule = class EditorModule {
};
exports.EditorModule = EditorModule;
exports.EditorModule = EditorModule = __decorate([
    (0, common_1.Module)({
        imports: [media_module_1.MediaModule],
        controllers: [editor_controller_1.EditorController, admin_authors_controller_1.AdminAuthorsController],
        providers: [editor_service_1.EditorService],
        exports: [editor_service_1.EditorService],
    })
], EditorModule);
//# sourceMappingURL=editor.module.js.map
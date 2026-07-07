import { ContentService } from './content.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class AdminContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    adminCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        parentId: string;
    }[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        parentId: string;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        parentId: string;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        parentId: string | null;
        updatedAt: Date;
    }>;
    adminTags(): Promise<{
        id: string;
        name: string;
        slug: string;
    }[]>;
    createTag(dto: CreateTagDto): Promise<{
        id: string;
        name: string;
        slug: string;
    }>;
    updateTag(id: string, dto: UpdateTagDto): Promise<{
        id: string;
        name: string;
        slug: string;
    }>;
    deleteTag(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        updatedAt: Date;
    }>;
}

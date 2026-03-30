import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
export declare class SectionsController {
    private sectionsService;
    constructor(sectionsService: SectionsService);
    create(courseId: number, dto: CreateSectionDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: number;
    }>;
    update(courseId: number, id: number, dto: UpdateSectionDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        courseId: number;
    }>;
    remove(courseId: number, id: number): Promise<null>;
}

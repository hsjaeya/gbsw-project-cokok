import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
export declare class LecturesController {
    private lecturesService;
    constructor(lecturesService: LecturesService);
    create(sectionId: number, dto: CreateLectureDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        youtubeVideoId: string;
        durationSeconds: number | null;
        isPreview: boolean;
        sectionId: number;
    }>;
    findOne(id: number): Promise<{
        section: {
            course: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                thumbnailUrl: string | null;
                level: import("@prisma/client").$Enums.Level;
                categoryId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            order: number;
            courseId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        youtubeVideoId: string;
        durationSeconds: number | null;
        isPreview: boolean;
        sectionId: number;
    }>;
    update(sectionId: number, id: number, dto: UpdateLectureDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        order: number;
        youtubeVideoId: string;
        durationSeconds: number | null;
        isPreview: boolean;
        sectionId: number;
    }>;
    remove(sectionId: number, id: number): Promise<null>;
}

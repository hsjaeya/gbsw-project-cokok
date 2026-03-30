import { Level } from '@prisma/client';
export declare class CreateCourseDto {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    level: Level;
    categoryId: number;
}

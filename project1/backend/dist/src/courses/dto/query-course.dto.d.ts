import { Level } from '@prisma/client';
export declare class QueryCourseDto {
    page?: number;
    limit?: number;
    categoryId?: number;
    level?: Level;
    keyword?: string;
}

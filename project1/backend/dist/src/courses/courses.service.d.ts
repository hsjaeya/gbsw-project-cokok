import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryCourseDto): Promise<{
        courses: {
            thumbnailUrl: string | null;
            category: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            level: import("@prisma/client").$Enums.Level;
            categoryId: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        thumbnailUrl: string | null;
        category: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
        sections: ({
            lectures: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                order: number;
                youtubeVideoId: string;
                durationSeconds: number | null;
                isPreview: boolean;
                sectionId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            order: number;
            courseId: number;
        })[];
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        level: import("@prisma/client").$Enums.Level;
        categoryId: number;
    }>;
    create(dto: CreateCourseDto): Promise<{
        category: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        thumbnailUrl: string | null;
        level: import("@prisma/client").$Enums.Level;
        categoryId: number;
    }>;
    update(id: number, dto: UpdateCourseDto): Promise<{
        category: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        thumbnailUrl: string | null;
        level: import("@prisma/client").$Enums.Level;
        categoryId: number;
    }>;
    remove(id: number): Promise<null>;
}

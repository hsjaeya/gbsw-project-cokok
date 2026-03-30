import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
export declare class SectionsService {
    private prisma;
    constructor(prisma: PrismaService);
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

import { PrismaService } from '../prisma/prisma.service';
export declare class EnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    autoEnroll(userId: number, courseId: number): Promise<{
        enrollmentId: number;
        courseId: number;
    }>;
    getMyEnrollments(userId: number): Promise<{
        courseId: number;
        title: string;
        thumbnailUrl: string | null;
        progressRate: number;
    }[]>;
}

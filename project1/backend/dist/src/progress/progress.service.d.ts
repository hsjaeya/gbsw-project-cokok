import { PrismaService } from '../prisma/prisma.service';
import { CompleteLectureDto } from './dto/complete-lecture.dto';
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    completeLecture(userId: number, dto: CompleteLectureDto): Promise<{
        lectureId: number;
        isCompleted: boolean;
        progressRate: number;
    }>;
    getCourseProgress(userId: number, courseId: number): Promise<{
        totalLectures: number;
        completedLectures: number;
        progressRate: number;
        completedLectureIds: number[];
    }>;
}

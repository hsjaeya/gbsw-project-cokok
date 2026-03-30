import { ProgressService } from './progress.service';
import { CompleteLectureDto } from './dto/complete-lecture.dto';
export declare class ProgressController {
    private progressService;
    constructor(progressService: ProgressService);
    completeLecture(user: {
        id: number;
    }, dto: CompleteLectureDto): Promise<{
        lectureId: number;
        isCompleted: boolean;
        progressRate: number;
    }>;
    getCourseProgress(user: {
        id: number;
    }, courseId: number): Promise<{
        totalLectures: number;
        completedLectures: number;
        progressRate: number;
        completedLectureIds: number[];
    }>;
}

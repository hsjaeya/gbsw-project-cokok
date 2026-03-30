import { EnrollmentsService } from './enrollments.service';
import { AutoEnrollDto } from './dto/auto-enroll.dto';
export declare class EnrollmentsController {
    private enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    autoEnroll(user: {
        id: number;
    }, dto: AutoEnrollDto): Promise<{
        enrollmentId: number;
        courseId: number;
    }>;
    getMyEnrollments(user: {
        id: number;
    }): Promise<{
        courseId: number;
        title: string;
        thumbnailUrl: string | null;
        progressRate: number;
    }[]>;
}

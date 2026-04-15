import { PartialType } from '@nestjs/swagger';
import { CreateInstructorCourseDto } from './create-instructor-course.dto';

export class UpdateInstructorCourseDto extends PartialType(CreateInstructorCourseDto) {}

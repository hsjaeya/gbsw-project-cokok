import api from './axios';
import type { EnrollmentItem, ProgressResponse } from '../types';

export const autoEnroll = (courseId: number) =>
  api.post<{ data: { enrollmentId: number; courseId: number } }>('/enrollments/auto', { courseId }).then((r) => r.data.data);

export const getMyEnrollments = () =>
  api.get<{ data: EnrollmentItem[] }>('/enrollments/me').then((r) => r.data.data);

export const completeLecture = (lectureId: number, enrollmentId: number) =>
  api.post<{ data: { lectureId: number; isCompleted: boolean; progressRate: number } }>(
    '/progress/complete',
    { lectureId, enrollmentId },
  ).then((r) => r.data.data);

export const getCourseProgress = (courseId: number) =>
  api.get<{ data: ProgressResponse }>(`/progress/course/${courseId}`).then((r) => r.data.data);

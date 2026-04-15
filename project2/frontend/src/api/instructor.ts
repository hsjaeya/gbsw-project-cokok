import api from './axios';
import type { Course, Level } from '../types';

export interface InstructorCoursePayload {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: Level;
  categoryId: number;
}

export const getMyCourses = () =>
  api.get<{ data: Course[] }>('/instructor/courses').then((r) => r.data.data);

export const getMyCourse = (id: number) =>
  api.get<{ data: Course }>(`/instructor/courses/${id}`).then((r) => r.data.data);

export const createMyCourse = (data: InstructorCoursePayload) =>
  api.post<{ data: Course }>('/instructor/courses', data).then((r) => r.data.data);

export const updateMyCourse = (id: number, data: Partial<InstructorCoursePayload>) =>
  api.patch<{ data: Course }>(`/instructor/courses/${id}`, data).then((r) => r.data.data);

export const deleteMyCourse = (id: number) =>
  api.delete(`/instructor/courses/${id}`);

export const submitCourse = (id: number) =>
  api.patch<{ data: Course }>(`/instructor/courses/${id}/submit`).then((r) => r.data.data);

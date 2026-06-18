import api from './axios';
import type { Course, CoursesResponse, Level } from '../types';

export interface CourseQuery {
  page?: number;
  limit?: number;
  categoryId?: number;
  level?: Level;
  keyword?: string;
}

export const getCourses = (params: CourseQuery) =>
  api.get<{ data: CoursesResponse }>('/courses', { params }).then((r) => r.data.data);

export const getCourse = (id: number) =>
  api.get<{ data: Course }>(`/courses/${id}`).then((r) => r.data.data);

export const createCourse = (data: { title: string; description?: string; thumbnailUrl?: string; level: Level; categoryId: number }) =>
  api.post<{ data: Course }>('/courses', data).then((r) => r.data.data);

export const updateCourse = (id: number, data: Partial<{ title: string; description: string; thumbnailUrl: string; level: Level; categoryId: number }>) =>
  api.patch<{ data: Course }>(`/courses/${id}`, data).then((r) => r.data.data);

export const deleteCourse = (id: number) => api.delete(`/courses/${id}`);

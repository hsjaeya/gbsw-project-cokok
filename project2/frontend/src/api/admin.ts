import api from './axios';
import type { User, Course, CourseStatus } from '../types';

export const getUsers = () =>
  api.get<{ data: User[] }>('/admin/users').then((r) => r.data.data);

export const getAdminCourses = (status?: CourseStatus) =>
  api
    .get<{ data: Course[] }>('/admin/courses', { params: status ? { status } : undefined })
    .then((r) => r.data.data);

export const approveCourse = (id: number) =>
  api.patch<{ data: Course }>(`/admin/courses/${id}/approve`).then((r) => r.data.data);

export const rejectCourse = (id: number, reason?: string) =>
  api
    .patch<{ data: Course }>(`/admin/courses/${id}/reject`, { reason })
    .then((r) => r.data.data);

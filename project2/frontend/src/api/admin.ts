import api from './axios';
import type { UsersResponse, Course, CourseStatus } from '../types';

export const getUsers = (page = 1, limit = 30) =>
  api
    .get<{ data: UsersResponse }>('/admin/users', { params: { page, limit } })
    .then((r) => r.data.data);

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

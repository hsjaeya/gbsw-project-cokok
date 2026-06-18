import api from './axios';
import type { UsersResponse, Course, CourseStatus } from '../types';

export interface WebhookLog {
  id: number;
  targetUrl: string;
  isSuccess: boolean;
  statusCode: number | null;
  retryCount: number;
  responseMs: number | null;
  courseId: number | null;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  action: string;
  targetType: string;
  targetId: number | null;
  detail: Record<string, unknown>;
  createdAt: string;
  admin: { nickname: string; email: string };
}

export const getUsers = (page = 1, limit = 30) =>
  api
    .get<{ data: UsersResponse }>('/admin/users', { params: { page, limit } })
    .then((r) => r.data.data);

export const getAdminCourses = (status?: CourseStatus) =>
  api
    .get<{ data: Course[] }>('/admin/courses', { params: status ? { status } : undefined })
    .then((r) => r.data.data);

export const getAdminCourse = (id: number) =>
  api.get<{ data: Course }>(`/admin/courses/${id}`).then((r) => r.data.data);

export const approveCourse = (id: number) =>
  api.patch<{ data: Course }>(`/admin/courses/${id}/approve`).then((r) => r.data.data);

export const rejectCourse = (id: number, reason?: string) =>
  api
    .patch<{ data: Course }>(`/admin/courses/${id}/reject`, { reason })
    .then((r) => r.data.data);

export const getWebhookLogs = (page = 1, limit = 20) =>
  api
    .get<{ data: { items: WebhookLog[]; total: number; page: number; limit: number } }>(
      '/admin/webhook-logs',
      { params: { page, limit } },
    )
    .then((r) => r.data.data);

export const getAuditLogs = (page = 1, limit = 20) =>
  api
    .get<{ data: { items: AuditLog[]; total: number; page: number; limit: number } }>(
      '/admin/audit-logs',
      { params: { page, limit } },
    )
    .then((r) => r.data.data);

export const changeUserRole = (id: number, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') =>
  api.patch<{ data: { id: number; role: string } }>(`/admin/users/${id}/role`, { role }).then((r) => r.data.data);

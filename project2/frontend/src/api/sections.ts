import api from './axios';
import type { Section } from '../types';

export const createSection = (courseId: number, data: { title: string; order: number }) =>
  api.post<{ data: Section }>(`/courses/${courseId}/sections`, data).then((r) => r.data.data);

export const updateSection = (courseId: number, id: number, data: { title?: string; order?: number }) =>
  api.patch<{ data: Section }>(`/courses/${courseId}/sections/${id}`, data).then((r) => r.data.data);

export const deleteSection = (courseId: number, id: number) =>
  api.delete(`/courses/${courseId}/sections/${id}`);

import api from './axios';
import type { Lecture } from '../types';

export const createLecture = (
  sectionId: number,
  data: { title: string; youtubeUrl: string; order: number; isPreview?: boolean; durationSeconds?: number },
) => api.post<{ data: Lecture }>(`/sections/${sectionId}/lectures`, data).then((r) => r.data.data);

export const updateLecture = (
  sectionId: number,
  id: number,
  data: Partial<{ title: string; youtubeUrl: string; order: number; isPreview: boolean; durationSeconds: number }>,
) => api.patch<{ data: Lecture }>(`/sections/${sectionId}/lectures/${id}`, data).then((r) => r.data.data);

export const deleteLecture = (sectionId: number, id: number) =>
  api.delete(`/sections/${sectionId}/lectures/${id}`);

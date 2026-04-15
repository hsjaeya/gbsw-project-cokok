import api from './axios';
import type { Category } from '../types';

export const getCategories = () =>
  api.get<{ data: Category[] }>('/categories').then((r) => r.data.data);

export const createCategory = (name: string) =>
  api.post<{ data: Category }>('/categories', { name }).then((r) => r.data.data);

export const updateCategory = (id: number, name: string) =>
  api.patch<{ data: Category }>(`/categories/${id}`, { name }).then((r) => r.data.data);

export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);

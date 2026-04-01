import api from './axios';
import type { Review, ReviewsResponse } from '../types';

export const getReviews = (courseId: number) =>
  api.get<{ data: ReviewsResponse }>('/reviews', { params: { courseId } }).then((r) => r.data.data);

export const getMyReview = (courseId: number) =>
  api.get<{ data: Review | null }>('/reviews/my', { params: { courseId } }).then((r) => r.data.data);

export const createReview = (data: { courseId: number; rating: number; content?: string }) =>
  api.post<{ data: Review }>('/reviews', data).then((r) => r.data.data);

export const updateReview = (id: number, data: { rating?: number; content?: string }) =>
  api.patch<{ data: Review }>(`/reviews/${id}`, data).then((r) => r.data.data);

export const deleteReview = (id: number) => api.delete(`/reviews/${id}`);

export const getMyReviews = () =>
  api.get<{ data: import('../types').MyReviewItem[] }>('/reviews/mine').then((r) => r.data.data);

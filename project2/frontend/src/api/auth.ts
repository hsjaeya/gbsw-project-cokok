import api from './axios';
import type { User } from '../types';

export const register = (data: { email: string; password: string; nickname: string }) =>
  api.post('/auth/register', data).then((r) => r.data.data);

export const login = (data: { email: string; password: string }) =>
  api.post<{ data: { accessToken: string; user: User } }>('/auth/login', data).then((r) => r.data.data);

export const logout = () => api.post('/auth/logout');

export const refreshToken = () =>
  api.post<{ data: { accessToken: string } }>('/auth/refresh').then((r) => r.data.data);


import api from './axios';
import type { User } from '../types';

export const getMe = () =>
  api.get<{ data: User }>('/users/me').then((r) => r.data.data);

export const updateProfile = (data: { nickname?: string; email?: string; password?: string }) =>
  api.patch<{ data: User }>('/users/me', data).then((r) => r.data.data);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append('avatar', file);
  return api
    .post<{ data: User }>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data);
};

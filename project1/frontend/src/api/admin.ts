import api from './axios';
import type { User } from '../types';

export const getUsers = () =>
  api.get<{ data: User[] }>('/admin/users').then((r) => r.data.data);

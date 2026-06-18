import api from './axios';

export interface Subscription {
  id: number;
  type: 'EMAIL' | 'DISCORD';
  email: string | null;
  discordWebhookUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export async function subscribeEmail(email: string): Promise<Subscription> {
  const res = await api.post<{ data: Subscription }>('/subscriptions/email', { email });
  return res.data.data;
}

export async function unsubscribeEmail(): Promise<void> {
  await api.delete('/subscriptions/email');
}

export async function subscribeDiscord(discordWebhookUrl: string): Promise<Subscription> {
  const res = await api.post<{ data: Subscription }>('/subscriptions/discord', { discordWebhookUrl });
  return res.data.data;
}

export async function unsubscribeDiscord(): Promise<void> {
  await api.delete('/subscriptions/discord');
}

export async function getMySubscriptions(): Promise<Subscription[]> {
  const res = await api.get<{ data: Subscription[] }>('/subscriptions/my');
  return res.data.data;
}

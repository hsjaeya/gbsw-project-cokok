import api from './axios';

export interface Payment {
  id: number;
  orderId: string;
  paymentKey: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt: string | null;
  refundedAt: string | null;
  courseId: number;
  course: { title: string; thumbnailUrl: string | null };
  createdAt: string;
}

export interface ConfirmPaymentDto {
  paymentKey: string;
  orderId: string;
  amount: number;
  courseId: number;
}

export async function confirmPayment(dto: ConfirmPaymentDto): Promise<Payment> {
  const res = await api.post<{ data: Payment }>('/payments/confirm', dto);
  return res.data.data;
}

export async function getMyPayments(): Promise<Payment[]> {
  const res = await api.get<{ data: Payment[] }>('/payments/my');
  return res.data.data;
}

export async function getAllPayments(page = 1, limit = 20): Promise<{ items: Payment[]; total: number }> {
  const res = await api.get<{ data: { items: Payment[]; total: number } }>('/payments', {
    params: { page, limit },
  });
  return res.data.data;
}

export async function refundPayment(id: number): Promise<Payment> {
  const res = await api.post<{ data: Payment }>(`/payments/${id}/refund`);
  return res.data.data;
}

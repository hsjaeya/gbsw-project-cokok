import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEnrollments } from '../../api/enrollments';
import { getMyReviews } from '../../api/reviews';
import { getMyPayments } from '../../api/payments';
import {
  getMySubscriptions,
  subscribeEmail,
  unsubscribeEmail,
  subscribeDiscord,
  unsubscribeDiscord,
} from '../../api/subscriptions';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import { Star } from 'lucide-react';

type Tab = 'courses' | 'reviews' | 'payments' | 'subscriptions';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: '처리 중',
  PAID: '결제 완료',
  FAILED: '실패',
  REFUNDED: '환불',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
};

export default function MyPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('courses');
  const [emailInput, setEmailInput] = useState('');
  const [discordInput, setDiscordInput] = useState('');
  const [subMsg, setSubMsg] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const { data: enrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: getMyEnrollments,
    enabled: !!user,
  });

  const { data: reviews, isLoading: reviewLoading } = useQuery({
    queryKey: ['reviews', 'mine'],
    queryFn: getMyReviews,
    enabled: !!user && tab === 'reviews',
  });

  const { data: payments, isLoading: paymentLoading } = useQuery({
    queryKey: ['payments', 'my'],
    queryFn: getMyPayments,
    enabled: !!user && tab === 'payments',
  });

  const { data: subscriptions, isLoading: subLoading } = useQuery({
    queryKey: ['subscriptions', 'my'],
    queryFn: getMySubscriptions,
    enabled: !!user && tab === 'subscriptions',
  });

  const emailSub = subscriptions?.find((s) => s.type === 'EMAIL' && s.isActive);
  const discordSub = subscriptions?.find((s) => s.type === 'DISCORD' && s.isActive);

  const subscribeMutation = useMutation({
    mutationFn: () => subscribeEmail(emailInput),
    onSuccess: () => {
      setSubMsg('이메일 구독이 완료되었습니다.');
      setEmailInput('');
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
    onError: () => setSubMsg('구독에 실패했습니다.'),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: unsubscribeEmail,
    onSuccess: () => {
      setSubMsg('이메일 구독이 해지되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
    onError: () => setSubMsg('해지에 실패했습니다.'),
  });

  const discordSubMutation = useMutation({
    mutationFn: () => subscribeDiscord(discordInput),
    onSuccess: () => {
      setSubMsg('디스코드 구독이 완료되었습니다.');
      setDiscordInput('');
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
    onError: () => setSubMsg('디스코드 구독에 실패했습니다.'),
  });

  const discordUnsubMutation = useMutation({
    mutationFn: unsubscribeDiscord,
    onSuccess: () => {
      setSubMsg('디스코드 구독이 해지되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'my'] });
    },
    onError: () => setSubMsg('해지에 실패했습니다.'),
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'courses', label: '수강 중인 강의' },
    { key: 'reviews', label: '내가 쓴 리뷰' },
    { key: 'payments', label: '결제 내역' },
    { key: 'subscriptions', label: '구독 관리' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">마이페이지</h1>
          <p className="text-gray-500 text-sm mt-1">안녕하세요, {user?.nickname}님!</p>
        </div>
        <Link
          to="/profile"
          className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          프로필 수정
        </Link>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-100 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 수강 목록 탭 */}
      {tab === 'courses' && (
        <>
          {enrollLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : enrollments?.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="mb-3">수강 중인 강의가 없습니다.</p>
              <Link to="/" className="text-orange-500 hover:underline text-sm">강의 둘러보기</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments?.map((item) => (
                <Link
                  key={item.courseId}
                  to={`/courses/${item.courseId}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="w-20 h-14 rounded-lg bg-orange-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.textContent = '🍳';
                        }}
                      />
                    ) : '🍳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.title}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>진도율</span>
                        <span className={item.progressRate === 100 ? 'text-orange-500 font-semibold' : ''}>
                          {item.progressRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.progressRate === 100 ? 'bg-orange-500' : 'bg-orange-400'
                          }`}
                          style={{ width: `${item.progressRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {item.progressRate === 100 && (
                    <span className="shrink-0 text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
                      완강 ✓
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* 리뷰 탭 */}
      {tab === 'reviews' && (
        <>
          {reviewLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reviews?.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="mb-3">작성한 리뷰가 없습니다.</p>
              <Link to="/" className="text-orange-500 hover:underline text-sm">강의 둘러보기</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews?.map((review) => (
                <Link
                  key={review.id}
                  to={`/courses/${review.course.id}`}
                  className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="w-16 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {review.course.thumbnailUrl ? (
                      <img
                        src={review.course.thumbnailUrl}
                        alt={review.course.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.textContent = '🍳';
                        }}
                      />
                    ) : '🍳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate mb-1">{review.course.title}</p>
                    <StarDisplay rating={review.rating} />
                    {review.content && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{review.content}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* 결제 내역 탭 */}
      {tab === 'payments' && (
        <>
          {paymentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="mb-3">결제 내역이 없습니다.</p>
              <Link to="/" className="text-orange-500 hover:underline text-sm">강의 둘러보기</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4"
                >
                  <div className="w-16 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {payment.course.thumbnailUrl ? (
                      <img
                        src={payment.course.thumbnailUrl}
                        alt={payment.course.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : '🍳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate text-sm">{payment.course.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString('ko-KR')
                        : new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      {payment.amount.toLocaleString()}원
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        PAYMENT_STATUS_COLORS[payment.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 구독 관리 탭 */}
      {tab === 'subscriptions' && (
        <>
          {subLoading ? (
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">이메일 구독</h2>
                {emailSub ? (
                  <div className="flex items-center justify-between gap-4 p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-700">{emailSub.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">새 강의 승인 시 이메일 알림을 받습니다</p>
                    </div>
                    <button
                      onClick={() => { setSubMsg(''); unsubscribeMutation.mutate(); }}
                      disabled={unsubscribeMutation.isPending}
                      className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      해지
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="알림 받을 이메일 주소"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button
                      onClick={() => { setSubMsg(''); subscribeMutation.mutate(); }}
                      disabled={subscribeMutation.isPending || !emailInput}
                      className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      구독
                    </button>
                  </div>
                )}
                {subMsg && (
                  <p className="text-xs text-gray-500 mt-2">{subMsg}</p>
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">디스코드 구독</h2>
                {discordSub ? (
                  <div className="flex items-center justify-between gap-4 p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-700 truncate max-w-[200px]">{discordSub.discordWebhookUrl}</p>
                      <p className="text-xs text-gray-400 mt-0.5">새 강의 승인 시 디스코드 알림을 받습니다</p>
                    </div>
                    <button
                      onClick={() => { setSubMsg(''); discordUnsubMutation.mutate(); }}
                      disabled={discordUnsubMutation.isPending}
                      className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 shrink-0"
                    >
                      해지
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={discordInput}
                      onChange={(e) => setDiscordInput(e.target.value)}
                      placeholder="Discord Webhook URL"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => { setSubMsg(''); discordSubMutation.mutate(); }}
                      disabled={discordSubMutation.isPending || !discordInput}
                      className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                    >
                      구독
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

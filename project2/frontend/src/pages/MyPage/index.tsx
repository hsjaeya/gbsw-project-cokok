import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEnrollments } from '../../api/enrollments';
import { getMyReviews } from '../../api/reviews';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import { Star } from 'lucide-react';

type Tab = 'courses' | 'reviews';

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

export default function MyPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('courses');

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
        <button
          onClick={() => setTab('courses')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'courses'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          수강 중인 강의
          {enrollments && (
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {enrollments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('reviews')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'reviews'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          내가 쓴 리뷰
          {reviews && (
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {reviews.length}
            </span>
          )}
        </button>
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
    </div>
  );
}

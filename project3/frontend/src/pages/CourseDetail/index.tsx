import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourse } from '../../api/courses';
import { getReviews, getMyReview, createReview, updateReview, deleteReview } from '../../api/reviews';
import { getMyEnrollments } from '../../api/enrollments';
import { useAuthStore } from '../../store/authStore';
import { LEVEL_LABELS } from '../../types';
import { ChevronDown, PlayCircle, Lock, Star } from 'lucide-react';
import { useState } from 'react';
import DOMPurify from 'dompurify';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const interactive = !!onChange;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={`${
            star <= (interactive ? hovered || value : value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
        />
      ))}
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [imgError, setImgError] = useState(false);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(courseId),
  });

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => getReviews(courseId),
  });

  const { data: myReview } = useQuery({
    queryKey: ['myReview', courseId],
    queryFn: () => getMyReview(courseId),
    enabled: !!user && !!accessToken,
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: getMyEnrollments,
    enabled: !!user,
  });
  const isEnrolled = myEnrollments?.some((e) => e.courseId === courseId) ?? false;

  const invalidateReviews = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews', courseId] });
    queryClient.invalidateQueries({ queryKey: ['myReview', courseId] });
    queryClient.invalidateQueries({ queryKey: ['course', id] });
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  };

  const createMutation = useMutation({
    mutationFn: () => createReview({ courseId, rating, content: content.trim() || undefined }),
    onSuccess: () => {
      setRating(5);
      setContent('');
      invalidateReviews();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateReview(editingId!, { rating: editRating, content: editContent.trim() || undefined }),
    onSuccess: () => {
      setEditingId(null);
      invalidateReviews();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => invalidateReviews(),
  });

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleStartCourse = () => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }
    const firstLecture = course?.sections?.[0]?.lectures?.[0];
    if (!firstLecture) {
      alert('아직 등록된 강의 단위가 없습니다.');
      return;
    }
    navigate(`/courses/${id}/watch/${firstLecture.id}`);
  };

  const startEdit = (review: { id: number; rating: number; content?: string }) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditContent(review.content ?? '');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!course) return <div className="text-center py-20 text-gray-400">강의를 찾을 수 없습니다.</div>;

  const totalLectures = course.sections?.reduce((s, sec) => s + sec.lectures.length, 0) ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex gap-8 flex-col md:flex-row">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              {course.category.name}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {LEVEL_LABELS[course.level]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{course.title}</h1>
          {course.description && (
            <p
              className="text-gray-600 text-sm leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(course.description) }}
            />
          )}

          <div className="flex items-center gap-4 mb-4">
            {course.avgRating != null && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(course.avgRating)} />
                <span className="font-semibold text-gray-800">{course.avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({course.reviewCount}개 리뷰)</span>
              </div>
            )}
            {!!course.enrollmentCount && (
              <span className="text-sm text-gray-400">{course.enrollmentCount.toLocaleString()}명 수강</span>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-6">총 {totalLectures}개 강의</p>

          {/* 커리큘럼 */}
          <div className="bg-white rounded-xl border border-gray-200 mb-8">
            <h2 className="text-base font-semibold text-gray-800 px-5 py-4 border-b border-gray-100">
              커리큘럼
            </h2>
            {totalLectures === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">
                등록된 강의 단위가 없습니다.
              </p>
            ) : (
              course.sections?.map((section, idx) => (
                <div key={section.id} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => toggleSection(idx)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700">{section.title}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${expandedSections.has(idx) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedSections.has(idx) && (
                    <div className="bg-gray-50">
                      {section.lectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          className="flex items-center gap-3 px-7 py-2.5 text-sm text-gray-600"
                        >
                          {lecture.isPreview ? (
                            <PlayCircle size={14} className="text-orange-400 shrink-0" />
                          ) : (
                            <Lock size={14} className="text-gray-300 shrink-0" />
                          )}
                          <span>{lecture.title}</span>
                          {lecture.isPreview && (
                            <span className="text-xs text-orange-500 ml-auto">미리보기</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 수강평 섹션 */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                수강평
                {reviewData && reviewData.totalCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    {reviewData.totalCount}개
                  </span>
                )}
              </h2>
              {reviewData?.avgRating != null && (
                <div className="flex items-center gap-1.5">
                  <StarRating value={Math.round(reviewData.avgRating)} />
                  <span className="font-semibold text-gray-700">
                    {reviewData.avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* 리뷰 작성 폼 */}
            {user && !myReview && (
              <div className="px-5 py-4 border-b border-gray-100 bg-orange-50">
                <p className="text-sm font-medium text-gray-700 mb-3">내 수강평 작성</p>
                <div className="mb-3">
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="강의에 대한 솔직한 리뷰를 남겨주세요. (선택)"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="bg-orange-500 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {createMutation.isPending ? '등록 중...' : '등록'}
                  </button>
                </div>
                {createMutation.isError && (
                  <p className="text-xs text-red-500 mt-1">
                    수강 중인 강의에만 리뷰를 작성할 수 있습니다.
                  </p>
                )}
              </div>
            )}

            {/* 리뷰 목록 */}
            {!reviewData || reviewData.reviews.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">
                아직 수강평이 없습니다.
              </p>
            ) : (
              <ul>
                {reviewData.reviews.map((review) => (
                  <li key={review.id} className="px-5 py-4 border-b border-gray-100 last:border-0">
                    {editingId === review.id ? (
                      <div>
                        <div className="mb-2">
                          <StarRating value={editRating} onChange={setEditRating} />
                        </div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                          rows={3}
                          maxLength={1000}
                        />
                        <div className="flex gap-2 justify-end mt-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-sm text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending}
                            className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {/* 프로필 사진 */}
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                              {review.user.profileImageUrl ? (
                                <img src={review.user.profileImageUrl} alt={review.user.nickname} className="w-full h-full object-cover" />
                              ) : (
                                review.user.nickname.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {review.user.nickname}
                            </span>
                            <StarRating value={review.rating} />
                          </div>
                          {user?.id === review.userId && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(review)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => deleteMutation.mutate(review.id)}
                                className="text-xs text-red-400 hover:text-red-600"
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                        {review.content && (
                          <p
                            className="text-sm text-gray-600 mt-1"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.content) }}
                          />
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="md:w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {course.thumbnailUrl && !imgError ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-40 object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-40 bg-orange-50 flex items-center justify-center text-5xl">🍳</div>
            )}
            <div className="p-4 space-y-2">
              {(course.avgRating != null || !!course.enrollmentCount) && (
                <div className="flex flex-col gap-1 pb-2 border-b border-gray-100">
                  {course.avgRating != null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-gray-800">{course.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({course.reviewCount}개 리뷰)</span>
                    </div>
                  )}
                  {!!course.enrollmentCount && (
                    <span className="text-xs text-gray-400">{course.enrollmentCount.toLocaleString()}명 수강</span>
                  )}
                </div>
              )}
              {course.price > 0 && (
                <div className="pb-2 border-b border-gray-100">
                  <p className="text-lg font-bold text-gray-900">
                    {course.price.toLocaleString()}원
                  </p>
                </div>
              )}
              {isEnrolled || course.price === 0 ? (
                <button
                  onClick={handleStartCourse}
                  disabled={totalLectures === 0}
                  className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {totalLectures === 0 ? '준비 중' : '강의 시작'}
                </button>
              ) : course.price > 0 && user ? (
                <button
                  onClick={async () => {
                    try {
                      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY as string;
                      const tossPayments = await loadTossPayments(clientKey);
                      const payment = tossPayments.payment({ customerKey: ANONYMOUS });
                      const orderId = `course-${course.id}-${Date.now()}`;
                      await payment.requestPayment({
                        method: 'CARD',
                        amount: { currency: 'KRW', value: course.price },
                        orderId,
                        orderName: course.title,
                        successUrl: `${window.location.origin}/payment/success?courseId=${course.id}`,
                        failUrl: `${window.location.origin}/payment/fail`,
                      });
                    } catch (e: any) {
                      if (e?.code !== 'USER_CANCEL') {
                        alert(e?.message ?? '결제 요청에 실패했습니다.');
                      }
                    }
                  }}
                  className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600"
                >
                  결제하기
                </button>
              ) : null}
              {!user && (
                <p className="text-xs text-center text-gray-400">로그인 후 수강 가능합니다</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

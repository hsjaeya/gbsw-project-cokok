import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminCourses, getAdminCourse, approveCourse, rejectCourse } from '../../api/admin';
import { LEVEL_LABELS, COURSE_STATUS_LABELS, COURSE_STATUS_COLORS, type CourseStatus } from '../../types';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Play, Clock } from 'lucide-react';

const STATUS_TABS: { value: CourseStatus | 'ALL'; label: string }[] = [
  { value: 'PENDING', label: '심의 대기' },
  { value: 'ALL', label: '전체' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '반려됨' },
  { value: 'DRAFT', label: '초안' },
];

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function CourseDetailPanel({ courseId }: { courseId: number }) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['admin-course-detail', courseId],
    queryFn: () => getAdminCourse(courseId),
  });

  if (isLoading) {
    return (
      <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 text-xs text-gray-400">
        강의 내용 불러오는 중...
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3">
      {/* 기본 정보 */}
      <div className="space-y-1">
        {detail.description && (
          <p className="text-xs text-gray-600 leading-relaxed">{detail.description}</p>
        )}
        <div className="flex gap-4 text-xs text-gray-400 mt-1">
          <span>생성일: {new Date(detail.createdAt).toLocaleDateString('ko-KR')}</span>
          {detail.instructor && <span>강사 이메일: {detail.instructor.email}</span>}
          <span>
            가격: {detail.price === 0 ? '무료' : `${detail.price.toLocaleString()}원`}
          </span>
        </div>
      </div>

      {/* 섹션 / 강의 목록 */}
      {detail.sections && detail.sections.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-700">
            커리큘럼 ({detail.sections.length}개 섹션 ·{' '}
            {detail.sections.reduce((acc, s) => acc + (s.lectures?.length ?? 0), 0)}개 강의)
          </p>
          {detail.sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* 섹션 헤더 */}
              <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">
                  {section.order}섹션. {section.title}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {section.lectures?.length ?? 0}개 강의
                </span>
              </div>

              {/* 강의 목록 */}
              {section.lectures && section.lectures.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {section.lectures.map((lecture) => (
                    <div key={lecture.id} className="flex items-center gap-3 px-3 py-2">
                      {/* YouTube 썸네일 */}
                      <a
                        href={`https://www.youtube.com/watch?v=${lecture.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 relative group"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${lecture.youtubeVideoId}/mqdefault.jpg`}
                          alt={lecture.title}
                          className="w-20 h-[45px] object-cover rounded border border-gray-200 group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={18} className="text-white drop-shadow" />
                        </div>
                      </a>

                      {/* 강의 정보 */}
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://www.youtube.com/watch?v=${lecture.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-800 hover:text-blue-600 hover:underline truncate block"
                        >
                          {lecture.order}. {lecture.title}
                        </a>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lecture.isPreview && (
                            <span className="text-xs text-orange-500 font-medium">미리보기</span>
                          )}
                          {lecture.durationSeconds && (
                            <span className="text-xs text-gray-400 flex items-center gap-0.5">
                              <Clock size={10} />
                              {formatDuration(lecture.durationSeconds)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 px-3 py-2">등록된 강의가 없습니다.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">등록된 섹션/강의가 없습니다.</p>
      )}
    </div>
  );
}

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<CourseStatus | 'ALL'>('PENDING');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: courses } = useQuery({
    queryKey: ['admin-courses', activeStatus],
    queryFn: () => getAdminCourses(activeStatus === 'ALL' ? undefined : activeStatus),
  });

  const approveMut = useMutation({
    mutationFn: approveCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => rejectCourse(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setRejectingId(null);
      setRejectReason('');
    },
  });

  return (
    <div>
      {/* 상태 탭 */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeStatus === tab.value
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {courses?.length === 0 && (
        <p className="text-center text-gray-400 py-12 text-sm">해당 상태의 강의가 없습니다.</p>
      )}

      <div className="space-y-2">
        {courses?.map((course) => {
          const status = course.status ?? 'DRAFT';
          return (
            <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => setExpanded(expanded === course.id ? null : course.id)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  {expanded === course.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">
                    {course.category.name} · {LEVEL_LABELS[course.level]}
                    {course.instructor && (
                      <span className="ml-2 text-blue-400">강사: {course.instructor.nickname}</span>
                    )}
                  </p>
                </div>

                {/* 상태 뱃지 */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COURSE_STATUS_COLORS[status]}`}>
                  {COURSE_STATUS_LABELS[status]}
                </span>

                {/* PENDING 상태인 경우만 승인/반려 버튼 표시 */}
                {status === 'PENDING' && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => approveMut.mutate(course.id)}
                      disabled={approveMut.isPending}
                      className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      <CheckCircle size={13} />
                      승인
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(course.id);
                        setRejectReason('');
                      }}
                      className="flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600"
                    >
                      <XCircle size={13} />
                      반려
                    </button>
                  </div>
                )}
              </div>

              {/* 반려 사유 입력 폼 */}
              {rejectingId === course.id && (
                <div className="px-4 pb-3 bg-red-50 border-t border-red-100">
                  <label className="block text-xs text-red-600 mb-1 mt-2">반려 사유 (선택)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="반려 사유를 입력하세요"
                    className="w-full border border-red-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        rejectMut.mutate({ id: course.id, reason: rejectReason || undefined })
                      }
                      disabled={rejectMut.isPending}
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      반려 확인
                    </button>
                    <button
                      onClick={() => setRejectingId(null)}
                      className="border border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 반려 사유 표시 */}
              {status === 'REJECTED' && course.rejectionReason && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">
                  반려 사유: {course.rejectionReason}
                </div>
              )}

              {/* 강의 상세 내용 (섹션/강의 포함) */}
              {expanded === course.id && <CourseDetailPanel courseId={course.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

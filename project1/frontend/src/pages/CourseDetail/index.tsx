import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCourse } from '../../api/courses';
import { useAuthStore } from '../../store/authStore';
import { LEVEL_LABELS } from '../../types';
import { ChevronDown, PlayCircle, Lock } from 'lucide-react';
import { useState } from 'react';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [imgError, setImgError] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(Number(id)),
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
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{course.description}</p>
          )}
          <p className="text-sm text-gray-500 mb-6">총 {totalLectures}개 강의</p>

          <div className="bg-white rounded-xl border border-gray-200">
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
        </div>

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
              <button
                onClick={handleStartCourse}
                disabled={totalLectures === 0}
                className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {totalLectures === 0 ? '준비 중' : '강의 시작'}
              </button>
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

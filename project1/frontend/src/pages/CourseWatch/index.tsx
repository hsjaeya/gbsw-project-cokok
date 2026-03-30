import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourse } from '../../api/courses';
import { autoEnroll, completeLecture, getCourseProgress } from '../../api/enrollments';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, PlayCircle } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CourseWatch() {
  const { courseId, lectureId } = useParams<{ courseId: string; lectureId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const enrollmentIdRef = useRef<number | null>(null);
  const [ytReady, setYtReady] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(Number(courseId)),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => getCourseProgress(Number(courseId)),
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: () => autoEnroll(Number(courseId)),
    onSuccess: (data) => {
      enrollmentIdRef.current = data.enrollmentId;
    },
  });

  const completeMutation = useMutation({
    mutationFn: (lId: number) => completeLecture(lId, enrollmentIdRef.current!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    enrollMutation.mutate();
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => setYtReady(true);
    } else {
      setYtReady(true);
    }
  }, []);

  const currentLecture = course?.sections
    ?.flatMap((s) => s.lectures)
    .find((l) => l.id === Number(lectureId));

  useEffect(() => {
    if (!ytReady || !currentLecture || !playerContainerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId: currentLecture.youtubeVideoId,
      width: '100%',
      height: '100%',
      playerVars: { autoplay: 1, rel: 0 },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED && enrollmentIdRef.current) {
            completeMutation.mutate(currentLecture.id);
          }
        },
      },
    });
  }, [ytReady, currentLecture?.id]);

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  const completedIds = new Set(progress?.completedLectureIds ?? []);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 영상 영역 */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {/* 영상: 남은 높이를 모두 차지, iframe이 내부를 꽉 채움 */}
        <div className="flex-1 min-h-0 relative">
          <div
            ref={playerContainerRef}
            className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full"
          />
        </div>
        {/* 현재 강의 정보 */}
        <div className="bg-gray-900 text-white px-6 py-3 shrink-0">
          <p className="text-sm font-medium truncate">{currentLecture?.title}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{course.title}</p>
        </div>
      </div>

      {/* 사이드바 */}
      <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">커리큘럼</h3>
          {progress && (
            <p className="text-xs text-gray-400 mt-0.5">
              {progress.completedLectures}/{progress.totalLectures} 완료 ({progress.progressRate}%)
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {course.sections?.map((section) => (
            <div key={section.id}>
              <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 sticky top-0 border-b border-gray-100">
                {section.title}
              </div>
              {section.lectures.map((lecture) => {
                const isActive = lecture.id === Number(lectureId);
                const isDone = completedIds.has(lecture.id);
                return (
                  <button
                    key={lecture.id}
                    onClick={() => navigate(`/courses/${courseId}/watch/${lecture.id}`)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 ${isActive ? 'bg-orange-50' : ''}`}
                  >
                    {isDone ? (
                      <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <PlayCircle size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-300'}`} />
                    )}
                    <span className={`text-xs leading-relaxed ${isActive ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                      {lecture.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

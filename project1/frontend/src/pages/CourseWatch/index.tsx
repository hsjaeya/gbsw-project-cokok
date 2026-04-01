import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourse } from "../../api/courses";
import {
  autoEnroll,
  completeLecture,
  getCourseProgress,
} from "../../api/enrollments";
import { useAuthStore } from "../../store/authStore";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  CheckCircle2,
  Trophy,
  X,
} from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function formatSeconds(sec?: number) {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const HIDE_DELAY = 1000;

export default function CourseWatch() {
  const { courseId, lectureId } = useParams<{
    courseId: string;
    lectureId: string;
  }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const enrollmentIdRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(true);

  const [ytReady, setYtReady] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [showControls, setShowControls] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(Number(courseId)),
  });

  const { data: progress } = useQuery({
    queryKey: ["progress", courseId],
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["progress", courseId] });
      if (result.progressRate === 100) {
        setShowCompletionModal(true);
      }
    },
  });

  // 현재 강의가 속한 섹션 자동 열기
  useEffect(() => {
    if (!course) return;
    const idx = course.sections?.findIndex((s) =>
      s.lectures.some((l) => l.id === Number(lectureId)),
    );
    if (idx !== undefined && idx >= 0) setExpandedSections(new Set([idx]));
  }, [course, lectureId]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    enrollMutation.mutate();
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => setYtReady(true);
    } else {
      setYtReady(true);
    }
  }, []);

  const allLectures = course?.sections?.flatMap((s) => s.lectures) ?? [];
  const currentIndex = allLectures.findIndex((l) => l.id === Number(lectureId));
  const currentLecture = allLectures[currentIndex];
  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture =
    currentIndex < allLectures.length - 1
      ? allLectures[currentIndex + 1]
      : null;

  // 컨트롤 표시 & 타이머 리셋
  const revealControls = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isPausedRef.current) {
      hideTimerRef.current = setTimeout(
        () => setShowControls(false),
        HIDE_DELAY,
      );
    }
  };

  useEffect(() => {
    if (!ytReady || !currentLecture || !playerContainerRef.current) return;
    if (playerRef.current) playerRef.current.destroy();

    playerRef.current = new window.YT.Player(playerContainerRef.current, {
      videoId: currentLecture.youtubeVideoId,
      width: "100%",
      height: "100%",
      playerVars: { autoplay: 1, rel: 0 },
      events: {
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            isPausedRef.current = false;
            // 재생 시작 → 2.5초 후 숨김
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            hideTimerRef.current = setTimeout(
              () => setShowControls(false),
              HIDE_DELAY,
            );
          } else if (
            state === window.YT.PlayerState.PAUSED ||
            state === window.YT.PlayerState.ENDED
          ) {
            isPausedRef.current = true;
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            setShowControls(true);
            if (
              state === window.YT.PlayerState.ENDED &&
              enrollmentIdRef.current
            ) {
              completeMutation.mutate(currentLecture.id);
            }
          }
        },
      },
    });

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [ytReady, currentLecture?.id]);

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleComplete = () => {
    if (!currentLecture || !enrollmentIdRef.current) return;
    completeMutation.mutate(currentLecture.id);
  };

  const completedIds = new Set(progress?.completedLectureIds ?? []);
  const isCurrentDone = completedIds.has(Number(lectureId));

  if (!course) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#111]">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#111]">
      {/* 완강 축하 모달 */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center relative">
            <button
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-5">
              <Trophy size={40} className="text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">완강을 축하해요! 🎉</h2>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-semibold text-gray-700">{course.title}</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">모든 강의를 완료했습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  navigate(`/courses/${courseId}`);
                }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                강의 페이지로
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                계속 학습
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── 좌측: 탑바 + 영상 + 하단 네비 ── */}
      <div
        className="flex-1 flex flex-col min-w-0 bg-black"
        onMouseMove={revealControls}
        style={{ cursor: showControls ? "default" : "none" }}
      >
        {/* 탑바 — 숨길 때 h-0으로 접힘 */}
        <div
          className={`shrink-0 overflow-hidden bg-[#1a1a1a] border-b border-white/5 transition-all duration-300 ${
            showControls ? "h-12 opacity-100" : "h-0 opacity-0"
          }`}
        >
          <div className="h-12 flex items-center justify-between px-5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-200 font-medium truncate">
                {currentLecture?.title ?? ""}
              </span>
            </div>
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors shrink-0 ml-4"
            >
              <Star size={13} className="fill-yellow-400" />
              수강평 작성하기
            </button>
          </div>
        </div>

        {/* 영상 — 남은 공간 전부 차지 */}
        <div className="flex-1 min-h-0 relative bg-black">
          <div
            ref={playerContainerRef}
            className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full"
          />
        </div>

        {/* 하단 네비 — 숨길 때 h-0으로 접힘 */}
        <div
          className={`shrink-0 overflow-hidden bg-[#1a1a1a] border-t border-white/5 transition-all duration-300 ${
            showControls ? "h-14 opacity-100" : "h-0 opacity-0"
          }`}
        >
          <div className="h-14 flex items-center justify-center gap-3 px-6">
            <button
              onClick={() =>
                prevLecture &&
                navigate(`/courses/${courseId}/watch/${prevLecture.id}`)
              }
              disabled={!prevLecture}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
              이전
            </button>

            <button
              onClick={() =>
                nextLecture &&
                navigate(`/courses/${courseId}/watch/${nextLecture.id}`)
              }
              disabled={!nextLecture}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              다음
              <ChevronRight size={15} />
            </button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <button
              onClick={handleComplete}
              disabled={isCurrentDone || completeMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isCurrentDone
                  ? "bg-orange-500/20 text-orange-400 cursor-default"
                  : "bg-orange-500 text-white hover:bg-orange-400"
              }`}
            >
              <Check size={15} />
              {isCurrentDone ? "완료됨" : "봤어요"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 우측 사이드바 ── */}
      <div className="w-80 shrink-0 bg-white flex flex-col overflow-hidden border-l border-gray-200">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-gray-900 mb-1">커리큘럼</h3>
          <p className="text-xs text-gray-400 truncate">{course.title}</p>

          {progress && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                  <span className="text-xs text-gray-600 font-medium">
                    진도율{" "}
                    <span className="text-orange-500 font-bold">
                      {progress.completedLectures}
                    </span>
                    /{progress.totalLectures}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {progress.progressRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections?.map((section, sIdx) => {
            const isOpen = expandedSections.has(sIdx);
            const totalMin = Math.round(
              section.lectures.reduce(
                (s, l) => s + (l.durationSeconds ?? 0),
                0,
              ) / 60,
            );

            return (
              <div key={section.id} className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection(sIdx)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700 leading-snug pr-2">
                    {section.title}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {section.lectures.length}강
                      {totalMin > 0 && ` · ${totalMin}분`}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <ul>
                    {section.lectures.map((lecture) => {
                      const isActive = lecture.id === Number(lectureId);
                      const isDone = completedIds.has(lecture.id);
                      return (
                        <li key={lecture.id}>
                          <button
                            onClick={() =>
                              navigate(
                                `/courses/${courseId}/watch/${lecture.id}`,
                              )
                            }
                            className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors border-l-2 ${
                              isActive
                                ? "bg-orange-50 border-orange-500"
                                : "hover:bg-gray-50 border-transparent"
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isDone ? (
                                <CheckCircle2
                                  size={16}
                                  className="text-orange-500"
                                />
                              ) : (
                                <div
                                  className={`w-4 h-4 rounded-full border-2 ${isActive ? "border-orange-400" : "border-gray-300"}`}
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-xs leading-snug ${isActive ? "text-orange-600 font-semibold" : isDone ? "text-gray-500" : "text-gray-700"}`}
                              >
                                {lecture.title}
                              </p>
                              {lecture.durationSeconds && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {formatSeconds(lecture.durationSeconds)}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

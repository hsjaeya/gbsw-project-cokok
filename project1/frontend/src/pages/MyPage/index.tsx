import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEnrollments } from '../../api/enrollments';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function MyPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: getMyEnrollments,
    enabled: !!user,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">마이페이지</h1>
      <p className="text-gray-500 text-sm mb-8">안녕하세요, {user?.nickname}님!</p>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">수강 중인 강의</h2>

      {isLoading ? (
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
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  '🍳'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.title}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>진도율</span>
                    <span>{item.progressRate}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${item.progressRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

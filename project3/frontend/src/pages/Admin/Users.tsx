import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, changeUserRole } from '../../api/admin';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Role } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-orange-100 text-orange-600',
  INSTRUCTOR: 'bg-blue-100 text-blue-600',
  STUDENT: 'bg-gray-100 text-gray-600',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  INSTRUCTOR: '강사',
  STUDENT: '수강생',
};

const ROLES: Role[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const limit = 30;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => getUsers(page, limit),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => changeUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  if (isLoading) {
    return <div className="text-gray-400 text-sm">로딩 중...</div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        총 {data?.total ?? 0}명
        {data && data.totalPages > 1 && (
          <span className="ml-2 text-gray-400">
            ({page} / {data.totalPages} 페이지)
          </span>
        )}
      </p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">이메일</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">닉네임</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">역할</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{user.id}</td>
                <td className="px-4 py-3 text-gray-700">{user.email}</td>
                <td className="px-4 py-3 text-gray-700">{user.nickname}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value as Role })}
                    disabled={roleMutation.isPending}
                    className={`text-xs px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                p === page
                  ? 'bg-orange-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

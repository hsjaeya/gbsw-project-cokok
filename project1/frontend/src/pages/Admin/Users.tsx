import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/admin';

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <div className="text-gray-400 text-sm">로딩 중...</div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">총 {users?.length ?? 0}명</p>
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
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{user.id}</td>
                <td className="px-4 py-3 text-gray-700">{user.email}</td>
                <td className="px-4 py-3 text-gray-700">{user.nickname}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date((user as any).createdAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

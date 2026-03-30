import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';

export default function Header() {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      navigate('/');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-orange-500">
          COKOK
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="text-sm text-gray-600 hover:text-orange-500">
                  관리자
                </Link>
              )}
              <Link to="/mypage" className="text-sm text-gray-600 hover:text-orange-500">
                마이페이지
              </Link>
              <span className="text-sm text-gray-500">{user.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-orange-500"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-orange-500">
                로그인
              </Link>
              <Link
                to="/register"
                className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

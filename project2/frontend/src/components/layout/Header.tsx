import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut, User, ShieldCheck, Settings, BookOpen } from 'lucide-react';
import { ROLE_LABELS } from '../../types';

export default function Header() {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      navigate('/');
      setDropdownOpen(false);
    }
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'shadow-md' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl leading-none">🍳</span>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-orange-500 transition-colors">
            CO<span className="text-orange-500">KOK</span>
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              isActive('/')
                ? 'text-orange-500 bg-orange-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            강의
          </Link>

          {user ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-sm font-bold shadow-sm overflow-hidden">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                  ) : (
                    user.nickname.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden sm:block">
                  {user.nickname}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* 드롭다운 */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* 유저 정보 */}
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                      ) : (
                        user.nickname.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.nickname}</p>
                      <p className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</p>
                    </div>
                  </div>

                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <ShieldCheck size={15} />
                      관리자 페이지
                    </Link>
                  )}

                  {user.role !== 'ADMIN' && (
                    <Link
                      to="/instructor"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive('/instructor')
                          ? 'text-orange-500 bg-orange-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BookOpen size={15} />
                      내 강의
                    </Link>
                  )}

                  <Link
                    to="/mypage"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive('/mypage')
                        ? 'text-orange-500 bg-orange-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User size={15} />
                    마이페이지
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive('/profile')
                        ? 'text-orange-500 bg-orange-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Settings size={15} />
                    프로필 수정
                  </Link>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
              >
                회원가입
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { updateProfile, uploadAvatar } from '../../api/users';
import { Camera, Check, Eye, EyeOff } from 'lucide-react';

function Avatar({ url, nickname, size = 24 }: { url?: string | null; nickname: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (url && !err) {
    return (
      <img
        src={url}
        alt={nickname}
        onError={() => setErr(true)}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <span className="text-white font-bold" style={{ fontSize: size / 2.5 }}>
      {nickname.charAt(0).toUpperCase()}
    </span>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const profileMutation = useMutation({
    mutationFn: () => {
      const data: { nickname?: string; email?: string; password?: string } = {};
      if (nickname !== user?.nickname) data.nickname = nickname;
      if (email !== user?.email) data.email = email;
      if (password) data.password = password;
      return updateProfile(data);
    },
    onSuccess: (updated) => {
      updateUser(updated);
      setPassword('');
      setPasswordConfirm('');
      setSuccessMsg('프로필이 저장되었습니다.');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (e: any) => {
      setErrorMsg(e?.response?.data?.message ?? '저장에 실패했습니다.');
      setSuccessMsg('');
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (updated) => {
      updateUser({ profileImageUrl: updated.profileImageUrl });
      setSuccessMsg('프로필 사진이 변경되었습니다.');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: () => setErrorMsg('이미지 업로드에 실패했습니다.'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    avatarMutation.mutate(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password && password !== passwordConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }
    profileMutation.mutate();
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">프로필 수정</h1>

      {/* 아바타 */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shadow-md">
            <Avatar url={user.profileImageUrl} nickname={user.nickname} size={96} />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarMutation.isPending}
            className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            {avatarMutation.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={14} />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">클릭해서 사진 변경</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            새 비밀번호 <span className="text-gray-400 font-normal">(변경 시에만 입력)</span>
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영문+숫자+특수문자 8자 이상"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* 비밀번호 확인 */}
        {password && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                passwordConfirm && password !== passwordConfirm
                  ? 'border-red-300 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-orange-300'
              }`}
            />
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>
        )}

        {/* 피드백 메시지 */}
        {successMsg && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-xl">
            <Check size={15} />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/mypage')}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {profileMutation.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

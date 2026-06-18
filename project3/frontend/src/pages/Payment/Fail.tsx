import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code') ?? '';
  const errorMessage = searchParams.get('message') ?? '결제에 실패했습니다.';

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">✗</div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">결제에 실패했습니다</h1>
        <p className="text-gray-500 text-sm">{errorMessage}</p>
        {errorCode && (
          <p className="text-xs text-gray-400 mt-1">오류 코드: {errorCode}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          다시 시도
        </button>
        <Link
          to="/"
          className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPayment } from '../../api/payments';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey') ?? '';
    const orderId = searchParams.get('orderId') ?? '';
    const amount = Number(searchParams.get('amount') ?? '0');
    const courseId = Number(searchParams.get('courseId') ?? '0');

    if (!paymentKey || !orderId || !amount || !courseId) {
      setStatus('error');
      setErrorMsg('결제 정보가 올바르지 않습니다.');
      return;
    }

    confirmPayment({ paymentKey, orderId, amount, courseId })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err?.response?.data?.message ?? '결제 확인에 실패했습니다.');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">결제를 처리하고 있습니다...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">✗</div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">결제 확인 실패</h1>
          <p className="text-gray-500 text-sm">{errorMsg}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            뒤로 가기
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✓</div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">결제가 완료되었습니다!</h1>
        <p className="text-gray-500 text-sm">마이페이지에서 결제 내역을 확인할 수 있습니다.</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/mypage"
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          마이페이지
        </Link>
        <Link
          to="/"
          className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
        >
          강의 더 보기
        </Link>
      </div>
    </div>
  );
}

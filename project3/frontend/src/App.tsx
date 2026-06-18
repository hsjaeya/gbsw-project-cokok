import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import api from './api/axios';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const CourseWatch = lazy(() => import('./pages/CourseWatch'));
const MyPage = lazy(() => import('./pages/MyPage'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminLayout = lazy(() => import('./pages/Admin'));
const AdminCourses = lazy(() => import('./pages/Admin/Courses'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories'));
const AdminUsers = lazy(() => import('./pages/Admin/Users'));
const AdminReviews = lazy(() => import('./pages/Admin/Reviews'));
const AdminAuditLogs = lazy(() => import('./pages/Admin/AuditLogs'));
const AdminWebhookLogs = lazy(() => import('./pages/Admin/WebhookLogs'));
const InstructorPage = lazy(() => import('./pages/Instructor'));
const PaymentSuccess = lazy(() => import('./pages/Payment/Success'));
const PaymentFail = lazy(() => import('./pages/Payment/Fail'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 },
  },
});

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AuthInitializer() {
  const { user, accessToken, setAccessToken, logout } = useAuthStore();

  useEffect(() => {
    // user는 있지만 accessToken이 없으면(새로고침) Refresh Token으로 재발급
    if (user && !accessToken) {
      api
        .post<{ data: { accessToken: string } }>('/auth/refresh')
        .then((res) => setAccessToken(res.data.data.accessToken))
        .catch(() => logout());
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/instructor" element={<InstructorPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/reviews" replace />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="webhook-logs" element={<AdminWebhookLogs />} />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses/:courseId/watch/:lectureId" element={<CourseWatch />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

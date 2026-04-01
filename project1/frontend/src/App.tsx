import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CourseDetail from './pages/CourseDetail';
import CourseWatch from './pages/CourseWatch';
import MyPage from './pages/MyPage';
import Profile from './pages/Profile';
import AdminLayout from './pages/Admin';
import AdminCourses from './pages/Admin/Courses';
import AdminCategories from './pages/Admin/Categories';
import AdminUsers from './pages/Admin/Users';
import { useAuthStore } from './store/authStore';
import api from './api/axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 },
  },
});

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
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/courses" replace />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses/:courseId/watch/:lectureId" element={<CourseWatch />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

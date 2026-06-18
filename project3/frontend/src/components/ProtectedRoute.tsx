import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types';

interface Props {
  children: React.ReactNode;
  requiredRole?: Role;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, requiredRole, redirectTo = '/' }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}

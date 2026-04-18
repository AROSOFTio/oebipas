import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, getHomePath } = useContext(AuthContext);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading portal...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role isn't allowed, they might be a customer trying to access admin
    if (user.role === 'Customer') {
      return <Navigate to="/customer" replace />;
    }
    // For unauthorized admin roles trying to access specific sub-routes, redirect to /admin base dashboard
    return <Navigate to="/admin" replace />;
  }

  return children ? children : <Outlet />;
}

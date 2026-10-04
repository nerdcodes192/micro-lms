import { Navigate } from 'react-router-dom';
import { useAuth, homeFor } from '../AuthContext.jsx';

// UX-only guard: the server enforces every rule regardless.
export default function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

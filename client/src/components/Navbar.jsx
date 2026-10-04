import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        <Link to="/" className="font-bold text-slate-800">
          Micro-LMS
        </Link>
        <Link to="/courses" className="text-sm text-slate-600 hover:text-slate-900">
          Catalogue
        </Link>
        {user?.role === 'student' && (
          <Link to="/my-learning" className="text-sm text-slate-600 hover:text-slate-900">
            My Learning
          </Link>
        )}
        {user?.role === 'instructor' && (
          <Link to="/instructor" className="text-sm text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
        )}
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-slate-500">
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link to="/signup" className="text-slate-600 hover:text-slate-900">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

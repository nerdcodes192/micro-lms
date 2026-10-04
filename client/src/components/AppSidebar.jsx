import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import { Badge } from './Badge.jsx';
import { navItemsFor } from './navItems.js';

function NavLink({ to, icon: Icon, active, children }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      <Icon size={17} className={active ? 'text-indigo-600' : 'text-zinc-400'} />
      {children}
    </Link>
  );
}

// Sidebar contents (logo, role-based nav, user block). Used fixed on lg+ and inside MobileNav.
export default function AppSidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 items-center px-5">
        <Link to="/" aria-label="Learnly home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItemsFor(user).map((item) => (
          <NavLink key={item.to} to={item.to} icon={item.icon} active={item.match(pathname)}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">{user.name}</p>
                <Badge tone={user.role === 'instructor' ? 'indigo' : 'zinc'} className="mt-0.5 capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="mt-1 space-y-0.5">
              <NavLink to="/settings" icon={Settings} active={pathname.startsWith('/settings')}>
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <LogOut size={17} className="text-zinc-400" />
                Log out
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 p-1">
            <Button to="/login" variant="secondary">
              Log in
            </Button>
            <Button to="/signup">Sign up</Button>
          </div>
        )}
      </div>
    </div>
  );
}

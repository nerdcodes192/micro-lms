import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';
import MobileNav from './MobileNav.jsx';
import { useCurrentPageTitle } from './PageTitle.jsx';
import { defaultTitle } from './navItems.js';

// Slim sticky bar: hamburger (< lg), contextual page title, user avatar.
export default function TopNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = useCurrentPageTitle(defaultTitle(user, pathname));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-10">
      <MobileNav />
      <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">{title}</h2>
      {user && (
        <Link to="/settings" aria-label="Your profile" className="rounded-full">
          <Avatar name={user.name} />
        </Link>
      )}
    </header>
  );
}

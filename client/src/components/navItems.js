import { Compass, BookOpen, TrendingUp, LayoutDashboard, Library, Users } from 'lucide-react';

// Sidebar entries per role. `match` decides the active state from the pathname.
const student = [
  { label: 'Discover', to: '/', icon: Compass, match: (p) => p === '/' || /^\/courses(\/|$)/.test(p) },
  { label: 'My Learning', to: '/my-learning', icon: BookOpen, match: (p) => p.startsWith('/my-learning') },
  { label: 'Progress', to: '/progress', icon: TrendingUp, match: (p) => p.startsWith('/progress') },
];

const instructor = [
  { label: 'Dashboard', to: '/instructor', icon: LayoutDashboard, match: (p) => p === '/instructor' },
  {
    label: 'My Courses',
    to: '/instructor/courses',
    icon: Library,
    match: (p) => p.startsWith('/instructor/courses') && !p.endsWith('/students'),
  },
  {
    label: 'Students',
    to: '/instructor/students',
    icon: Users,
    match: (p) => p.startsWith('/instructor/students') || /^\/instructor\/courses\/[^/]+\/students$/.test(p),
  },
];

const guest = [student[0]];

export function navItemsFor(user) {
  if (user?.role === 'instructor') return instructor;
  if (user?.role === 'student') return student;
  return guest;
}

// Fallback TopNav title when a page hasn't called usePageTitle.
export function defaultTitle(user, pathname) {
  if (pathname.startsWith('/settings')) return 'Settings';
  return navItemsFor(user).find((item) => item.match(pathname))?.label || 'Learnly';
}

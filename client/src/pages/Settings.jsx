import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';
import Avatar from '../components/Avatar.jsx';
import Button from '../components/Button.jsx';
import { Badge } from '../components/Badge.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';

// Read-only profile + logout.
export default function Settings() {
  usePageTitle('Settings');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const rows = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', <Badge key="role" tone={user.role === 'instructor' ? 'indigo' : 'zinc'} className="capitalize">{user.role}</Badge>],
  ];

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Your account details." />
      <Card>
        <div className="flex items-center gap-4 border-b border-zinc-200 p-6">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight">{user.name}</p>
            <p className="truncate text-sm text-zinc-500">{user.email}</p>
          </div>
        </div>
        <dl className="divide-y divide-zinc-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="truncate font-medium text-zinc-900">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Log out</p>
          <p className="text-sm text-zinc-500">End your session on this device.</p>
        </div>
        <Button variant="secondary" icon={LogOut} onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}

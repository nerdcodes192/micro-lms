import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.jsx';
import TopNav from './TopNav.jsx';
import { PageTitleProvider } from './PageTitle.jsx';

// Layout route: fixed sidebar on lg+, sticky top bar, page content in <Outlet/>.
// Sidebar and top bar are hidden when printing.
export default function AppShell() {
  return (
    <PageTitleProvider>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-zinc-200 lg:block print:hidden">
        <AppSidebar />
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-60 print:pl-0">
        <div className="print:hidden">
          <TopNav />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-10 print:max-w-none print:p-0">
          <Outlet />
        </main>
      </div>
    </PageTitleProvider>
  );
}

import { TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';

// Placeholder — implemented by the student pages pass.
export default function Progress() {
  usePageTitle('Progress');
  return (
    <>
      <PageHeader title="Your progress" subtitle="Track how far you've come." />
      <EmptyState icon={TrendingUp} title="Coming next" text="Your learning stats will appear here." />
    </>
  );
}

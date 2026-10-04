import { Library } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';

// Placeholder — implemented by the instructor pages pass.
export default function InstructorCourses() {
  usePageTitle('My Courses');
  return (
    <>
      <PageHeader title="My Courses" subtitle="Everything you teach, in one place." />
      <EmptyState icon={Library} title="Coming next" text="Your course list will appear here." />
    </>
  );
}

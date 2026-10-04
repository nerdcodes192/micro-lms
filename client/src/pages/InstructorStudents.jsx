import { Users } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';

// Placeholder — implemented by the instructor pages pass.
export default function InstructorStudents() {
  usePageTitle('Students');
  return (
    <>
      <PageHeader title="Students" subtitle="Pick a course to see student progress." />
      <EmptyState icon={Users} title="Coming next" text="Your courses and their students will appear here." />
    </>
  );
}

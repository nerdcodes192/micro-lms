import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Users } from 'lucide-react';
import { useInstructorCourses } from './useInstructorCourses.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Skeleton from '../components/Skeleton.jsx';

// Pick a course → /instructor/courses/:id/students.
export default function InstructorStudents() {
  usePageTitle('Students');
  const { courses, error } = useInstructorCourses();

  return (
    <>
      <PageHeader title="Students" subtitle="Pick a course to see student progress." />
      <ErrorMessage error={error} />

      {!courses && !error && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}

      {courses?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No courses yet"
          text="Students will appear here once you create a course and they enroll."
          action={<Button to="/instructor/courses/new" icon={Plus}>Create Course</Button>}
        />
      )}

      {courses?.length > 0 && (
        <Card as="ul" className="divide-y divide-zinc-100 overflow-hidden">
          {courses.map((c) => (
            <li key={c._id}>
              <Link
                to={`/instructor/courses/${c._id}/students`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Users size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-zinc-900">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {c.studentCount} {c.studentCount === 1 ? 'student' : 'students'} · {c.lessonCount}{' '}
                    {c.lessonCount === 1 ? 'lesson' : 'lessons'}
                  </p>
                </div>
                {c.studentCount > 0 && (
                  <ProgressBar percent={c.avgCompletion} showLabel size="sm" className="hidden w-40 sm:flex" />
                )}
                <ChevronRight size={18} className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </Card>
      )}
    </>
  );
}

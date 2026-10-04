import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Plus, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { useInstructorCourses, courseMenuItems } from './useInstructorCourses.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import StatCard from '../components/StatCard.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import DropdownMenu from '../components/DropdownMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { firstName, greeting } from '../format.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function stats(courses) {
  const published = courses.filter((c) => c.status === 'published').length;
  const students = courses.reduce((sum, c) => sum + c.studentCount, 0);
  const withStudents = courses.filter((c) => c.studentCount > 0);
  const avg = withStudents.length
    ? Math.round(withStudents.reduce((sum, c) => sum + c.avgCompletion, 0) / withStudents.length)
    : null;
  return { published, drafts: courses.length - published, students, withStudents: withStudents.length, avg };
}

export default function InstructorDashboard() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const { courses, error, togglePublish } = useInstructorCourses();
  const createButton = <Button to="/instructor/courses/new" icon={Plus}>Create Course</Button>;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName(user?.name)}`}
        subtitle="Here's how your courses are performing."
        actions={courses?.length > 0 && createButton}
      />
      <ErrorMessage error={error} />

      {!courses && !error && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {courses?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="You haven't created any courses yet."
          text="Create your first course and start teaching."
          action={createButton}
        />
      )}

      {courses?.length > 0 && <Overview courses={courses} togglePublish={togglePublish} />}
    </>
  );
}

function Overview({ courses, togglePublish }) {
  const s = stats(courses);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length}
          context={`${s.published} published · ${plural(s.drafts, 'draft')}`} />
        <StatCard icon={Users} label="Total Students" value={s.students}
          context={`enrollments across ${plural(courses.length, 'course')}`} />
        <StatCard icon={TrendingUp} label="Avg. Completion" value={s.avg === null ? '—' : `${s.avg}%`}
          context={s.avg === null ? 'No enrollments yet' : `across ${plural(s.withStudents, 'course')} with students`} />
        <StatCard icon={CheckCircle2} label="Published" value={s.published}
          context="visible in the catalogue" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-zinc-900">Your Courses</h2>
        {/* Table on md+ (no overflow clipping so the ••• menu can escape); cards below md. */}
        <Card className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Course</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Students</th>
                <th className="px-5 py-3 font-medium">Lessons</th>
                <th className="w-1/4 px-5 py-3 font-medium">Avg. Completion</th>
                <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {courses.map((c) => (
                <tr key={c._id} className="transition-colors hover:bg-zinc-50/60">
                  <td className="px-5 py-3.5">
                    <Link to={`/instructor/courses/${c._id}/edit`} className="font-medium text-zinc-900 hover:text-indigo-700">
                      {c.title}
                    </Link>
                    {c.category && <p className="text-xs text-zinc-500">{c.category}</p>}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-zinc-600 tabular-nums">{c.studentCount}</td>
                  <td className="px-5 py-3.5 text-zinc-600 tabular-nums">{c.lessonCount}</td>
                  <td className="px-5 py-3.5">
                    {c.studentCount > 0
                      ? <ProgressBar percent={c.avgCompletion} showLabel size="sm" />
                      : <span className="text-xs text-zinc-400">No students yet</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu label={`Actions for ${c.title}`} items={courseMenuItems(c, togglePublish)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-3 md:hidden">
          {courses.map((c) => (
            <Card key={c._id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Link to={`/instructor/courses/${c._id}/edit`} className="font-medium text-zinc-900">{c.title}</Link>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <StatusBadge status={c.status} />
                    {plural(c.studentCount, 'student')} · {plural(c.lessonCount, 'lesson')}
                  </p>
                </div>
                <DropdownMenu label={`Actions for ${c.title}`} items={courseMenuItems(c, togglePublish)} />
              </div>
              {c.studentCount > 0 && <ProgressBar percent={c.avgCompletion} showLabel size="sm" className="mt-3" />}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

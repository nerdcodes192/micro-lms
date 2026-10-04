import { Library, Pencil, Plus, Users } from 'lucide-react';
import { useInstructorCourses, courseMenuItems } from './useInstructorCourses.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import DropdownMenu from '../components/DropdownMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Skeleton from '../components/Skeleton.jsx';

export default function InstructorCourses() {
  usePageTitle('My Courses');
  const { courses, error, togglePublish } = useInstructorCourses();
  const createButton = <Button to="/instructor/courses/new" icon={Plus}>Create Course</Button>;

  return (
    <>
      <PageHeader
        title="My Courses"
        subtitle="Everything you teach, in one place."
        actions={courses?.length > 0 && createButton}
      />
      <ErrorMessage error={error} />

      {!courses && !error && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-60 rounded-xl" />)}
        </div>
      )}

      {courses?.length === 0 && (
        <EmptyState
          icon={Library}
          title="You haven't created any courses yet."
          text="Create your first course and start teaching."
          action={createButton}
        />
      )}

      {courses?.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c._id}
              course={c}
              to={`/instructor/courses/${c._id}/edit`}
              badges={<StatusBadge status={c.status} />}
              footer={
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                      <span>{c.studentCount} {c.studentCount === 1 ? 'student' : 'students'}</span>
                      <span>avg. completion</span>
                    </div>
                    <ProgressBar percent={c.avgCompletion} showLabel size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button to={`/instructor/courses/${c._id}/edit`} variant="secondary" size="sm" icon={Pencil}>Edit</Button>
                    <Button to={`/instructor/courses/${c._id}/students`} variant="ghost" size="sm" icon={Users}>Students</Button>
                    <span className="ml-auto">
                      <DropdownMenu label={`Actions for ${c.title}`} items={courseMenuItems(c, togglePublish)} />
                    </span>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

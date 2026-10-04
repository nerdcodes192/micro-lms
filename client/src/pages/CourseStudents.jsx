import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Pencil, Search, TrendingUp, Users } from 'lucide-react';
import { api } from '../api.js';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import StatCard from '../components/StatCard.jsx';
import { StatusBadge } from '../components/Badge.jsx';
import StudentProgressTable from '../components/StudentProgressTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { Input } from '../components/Field.jsx';

export default function CourseStudents() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  usePageTitle(course?.title || 'Students');
  const [lessonCount, setLessonCount] = useState(0);
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api(`/courses/${id}`)
      .then((data) => {
        setCourse(data.course);
        setLessonCount(data.lessons.length);
      })
      .catch((err) => setError(err.message));
    api(`/instructor/courses/${id}/students`)
      .then((data) => setStudents(data.students))
      .catch((err) => setError(err.message));
  }, [id]);

  const avg = students?.length
    ? Math.round(students.reduce((sum, s) => sum + s.percent, 0) / students.length)
    : null;
  const q = query.trim().toLowerCase();
  const visible = students?.filter((s) => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));

  return (
    <>
      <PageHeader
        eyebrow={
          <Link to="/instructor/students" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900">
            <ArrowLeft size={15} /> Back to Students
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            {course ? course.title : 'Course students'}
            {course && <StatusBadge status={course.status} />}
          </span>
        }
        subtitle="Track how each student is progressing."
        actions={students && <Button to={`/instructor/courses/${id}/edit`} variant="secondary" icon={Pencil}>Edit course</Button>}
      />
      <ErrorMessage error={error} />

      {!students && !error && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {students && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Users} label="Students" value={students.length} context="enrolled in this course" />
            <StatCard icon={TrendingUp} label="Avg. Completion" value={avg === null ? '—' : `${avg}%`}
              context={avg === null ? 'No enrollments yet' : 'across all enrolled students'} />
            <StatCard icon={BookOpen} label="Lessons" value={lessonCount} context="in this course" />
          </div>

          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Student progress</h2>
              {students.length > 0 && (
                <div className="relative sm:w-64">
                  <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="search"
                    aria-label="Filter students by name"
                    placeholder="Filter by name…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>
            {students.length === 0 ? (
              <EmptyState icon={Users} title="No students enrolled yet." text="Students will show up here once they enroll." />
            ) : visible.length === 0 ? (
              <EmptyState icon={Search} title="No matching students" text={`Nobody matches "${query}".`} />
            ) : (
              <StudentProgressTable students={visible} />
            )}
          </section>
        </div>
      )}
    </>
  );
}

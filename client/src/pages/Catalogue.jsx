import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { usePageTitle } from '../components/PageTitle.jsx';
import PageHeader from '../components/PageHeader.jsx';
import CourseCard from '../components/CourseCard.jsx';
import Card from '../components/Card.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function CourseCardSkeleton() {
  return (
    <Card className="space-y-3 p-5">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-6 h-4 w-1/2" />
    </Card>
  );
}

export default function Catalogue() {
  usePageTitle('Discover');
  const { user } = useAuth();
  const [courses, setCourses] = useState(null);
  const [percentById, setPercentById] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    api('/courses')
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message));
    // Students: join progress client-side so enrolled cards show a bar.
    if (user?.role === 'student') {
      api('/me/enrollments')
        .then((data) =>
          setPercentById(Object.fromEntries(data.enrollments.map((e) => [e.course._id, e.percent])))
        )
        .catch(() => {}); // cards still render without progress
    }
  }, [user?.role]);

  return (
    <>
      <PageHeader title="Discover courses" subtitle="Learn something new today." />
      <ErrorMessage error={error} />
      {!courses && !error && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <CourseCardSkeleton key={i} />)}
        </div>
      )}
      {courses?.length === 0 && (
        <EmptyState icon={Compass} title="No courses yet" text="New courses will show up here once they're published." />
      )}
      {courses?.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} percent={c.enrolled ? (percentById[c._id] ?? 0) : undefined} />
          ))}
        </div>
      )}
    </>
  );
}

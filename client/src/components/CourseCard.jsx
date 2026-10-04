import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import Card from './Card.jsx';
import Avatar from './Avatar.jsx';
import { Badge } from './Badge.jsx';
import ProgressBar from './ProgressBar.jsx';
import { formatDuration } from '../format.js';

// Catalogue-style course card. The whole card links to `to` (default /courses/:id).
// percent (number) = enrolled → progress bar + "Continue Learning →"; omit for "View Course".
// badges: extra nodes beside the category; footer: replaces the default bottom section.
export default function CourseCard({ course, percent, to, badges, footer }) {
  const href = to || `/courses/${course._id}`;
  const enrolled = typeof percent === 'number';
  return (
    <Card interactive className="group relative flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        {course.category && <Badge tone="indigo">{course.category}</Badge>}
        {badges}
      </div>
      <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight text-zinc-900">
        {/* Stretched link: makes the whole card clickable while footer links stay usable. */}
        <Link to={href} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none">
          {course.title}
        </Link>
      </h3>
      {course.description && <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500">{course.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
        {course.instructor?.name && (
          <span className="flex items-center gap-1.5">
            <Avatar name={course.instructor.name} size="xs" />
            <span className="font-medium text-zinc-700">{course.instructor.name}</span>
          </span>
        )}
        {course.lessonCount != null && (
          <span className="flex items-center gap-1">
            <BookOpen size={13} /> {course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
        )}
        {course.totalDuration != null && (
          <span className="flex items-center gap-1">
            <Clock size={13} /> {formatDuration(course.totalDuration)}
          </span>
        )}
      </div>

      <div className="mt-auto pt-5">
        {footer ? (
          <div className="relative z-10">{footer}</div>
        ) : enrolled ? (
            <div className="space-y-3">
              <ProgressBar percent={percent} showLabel size="sm" />
              <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                {percent === 100 ? 'Review Course' : 'Continue Learning'} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-sm font-medium text-zinc-900">
              View Course <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
      </div>
    </Card>
  );
}

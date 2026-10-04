import Avatar from './Avatar.jsx';
import Card from './Card.jsx';
import ProgressBar from './ProgressBar.jsx';
import { StatusBadge, progressStatus } from './Badge.jsx';

// students: [{ studentId, name, email, completedCount, totalLessons, percent }]
// Table on md+, stacked cards below md.
export default function StudentProgressTable({ students }) {
  return (
    <>
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/60 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="w-1/3 px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Lessons</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {students.map((s) => (
              <tr key={s.studentId} className="transition-colors hover:bg-zinc-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{s.name}</p>
                      <p className="truncate text-xs text-zinc-500">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <ProgressBar percent={s.percent} showLabel size="sm" />
                </td>
                <td className="px-5 py-3.5 text-zinc-600 tabular-nums">
                  {s.completedCount} / {s.totalLessons}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={progressStatus(s.percent)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="space-y-3 md:hidden">
        {students.map((s) => (
          <Card key={s.studentId} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={s.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{s.name}</p>
                <p className="truncate text-xs text-zinc-500">{s.email}</p>
              </div>
              <StatusBadge status={progressStatus(s.percent)} />
            </div>
            <ProgressBar percent={s.percent} showLabel size="sm" className="mt-4" />
            <p className="mt-1 text-xs text-zinc-500 tabular-nums">
              {s.completedCount} / {s.totalLessons} lessons
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}

# Shared components (import from `../components/X.jsx`; icons from `lucide-react`)
Default export unless shown in `{}`. All accept `className` unless noted.

- **Button** `variant` primary|secondary|ghost|danger|success, `size` sm|md|lg|icon, `icon`/`iconRight` (lucide component), `loading`, `to` (renders router Link), plus native props. `<Button to="/instructor/courses/new" icon={Plus}>Create Course</Button>` · `{buttonClass}({variant,size})` for raw class string.
- **Card** `as`, `interactive` (hover border+shadow). `<Card className="p-6">…</Card>`
- **{Badge, StatusBadge, progressStatus}** from Badge.jsx. `<Badge tone="indigo|emerald|amber|zinc|red" icon={X}>Design</Badge>` · `<StatusBadge status="draft|published|unpublished|completed|in-progress|not-started" />` · `progressStatus(percent)` → status key.
- **ProgressBar** `percent`, `showLabel`, `size` sm|md|lg (indigo→violet, emerald at 100, animates width). `<ProgressBar percent={62} showLabel />`
- **StatCard** `icon`, `label`, `value`, `context`. `<StatCard icon={Users} label="Total Students" value={42} context="across 3 courses" />`
- **Avatar** `name`, `size` xs|sm|md|lg (initials, deterministic colour). `<Avatar name={user.name} size="md" />`
- **EmptyState** `icon`, `title`, `text`, `action` (node). `<EmptyState icon={BookOpen} title="…" text="…" action={<Button to="/">Browse Courses</Button>} />`
- **ConfirmDialog** `open`, `title`, `description`, `confirmLabel`, `tone` danger|primary, `loading`, `onConfirm`, `onCancel` (Esc/backdrop cancel). `<ConfirmDialog open={!!target} title="Delete lesson?" confirmLabel="Delete" onConfirm={del} onCancel={() => setTarget(null)} />`
- **{ToastProvider, useToast}** from Toast.jsx — provider already mounted in App. `const toast = useToast(); toast.success('Saved'); toast.error(err.message); toast('Info');`
- **Skeleton** sized by className. `<Skeleton className="h-48 rounded-xl" />`
- **Tooltip** `label`, `side` top|bottom; wraps icon-only buttons. `<Tooltip label="Edit"><Button size="icon" variant="ghost" aria-label="Edit"><Pencil size={16}/></Button></Tooltip>`
- **DropdownMenu** `items` [{label, icon, to} | {label, icon, onClick, danger}] (falsy items skipped), `align` right|left, `label` (aria), `trigger` (node; default •••). `<DropdownMenu items={[{label:'Edit', icon:Pencil, to:`/instructor/courses/${id}/edit`}]} />`
- **PageHeader** `title`, `subtitle`, `actions` (node), `eyebrow` (node above, e.g. back link). Has mb-8. `<PageHeader title="Discover courses" subtitle="Learn something new today." />`
- **{LessonList, LessonRow}** from LessonList.jsx. `<LessonList lessons={lessons} completedIds={progress?.completedLessons} currentId={progress?.nextLessonId} enforceLocks={enrolled} getHref={(l) => canOpen ? `/courses/${id}/lessons/${l._id}` : null} compact />` — state precedence: locked (via lessonLocks.js) > current > completed > incomplete; locked rows never link. `<LessonRow lesson index state="completed|current|locked|incomplete" to compact />`. No outer card — wrap in `<Card className="p-2">`.
- **CourseCard** `course` (catalogue shape: _id,title,description,category,instructor.name,lessonCount,totalDuration — missing fields are hidden), `percent` (number ⇒ enrolled: bar + "Continue Learning →"; omit ⇒ "View Course"), `to` (default /courses/:id), `badges` (node beside category), `footer` (node replacing default bottom; can contain links/buttons). Whole card is clickable (stretched link).
- **StudentProgressTable** `students` (GET /instructor/courses/:id/students shape). Table md+, cards below.
- **{Field, Input, Textarea, Select, inputClass}** from Field.jsx. `<Field label="Title" htmlFor="t" hint="…" error="…"><Input id="t" value={v} onChange={…} /></Field>`
- **ErrorMessage** `error` (string; renders nothing if falsy). **RequireRole** `role` (unchanged).
- **Logo** `inverted`. **AuthLayout** (auth pages only). `ui.js` = legacy class strings for old pages; don't use in new code.

## Shell & titles
AppShell (layout route in App.jsx) = AppSidebar (fixed lg+) + TopNav (sticky, hamburger → MobileNav drawer < lg) + `<main class="max-w-6xl px-6 lg:px-10 py-8">`. Pages render content only (no outer padding/max-width needed). Shell is `print:hidden`.
TopNav title: call `usePageTitle('Discover')` (from PageTitle.jsx) at the top of a page; also sets document.title. Without it, the active nav label is used. No TopNav actions slot — put page actions in PageHeader.
Nav config lives in navItems.js. Student home is `/` (Discover; `/courses` also renders it); instructors land on `/instructor`.

## Helpers (`src/format.js`)
`formatDuration(155)` → "2h 35m" · `greeting()` → "Good morning|afternoon|evening" · `firstName('Priya Sharma')` → "Priya" · `initials(name)` · `lessonNumber(0)` → "01"

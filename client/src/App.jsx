import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import AppShell from './components/AppShell.jsx';
import RequireRole from './components/RequireRole.jsx';
import EmptyState from './components/EmptyState.jsx';
import Button from './components/Button.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Catalogue from './pages/Catalogue.jsx';
import CoursePage from './pages/CoursePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import MyLearning from './pages/MyLearning.jsx';
import Progress from './pages/Progress.jsx';
import Settings from './pages/Settings.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import InstructorCourses from './pages/InstructorCourses.jsx';
import InstructorStudents from './pages/InstructorStudents.jsx';
import CourseEditor from './pages/CourseEditor.jsx';
import CourseStudents from './pages/CourseStudents.jsx';
import Certificate from './pages/Certificate.jsx';

// "/" is Discover for students and guests; instructors land on their dashboard.
function Home() {
  const { user } = useAuth();
  return user?.role === 'instructor' ? <Navigate to="/instructor" replace /> : <Catalogue />;
}

function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      text="The page you're looking for doesn't exist."
      action={<Button to="/">Go home</Button>}
    />
  );
}

const instructorOnly = (page) => <RequireRole role="instructor">{page}</RequireRole>;
const studentOnly = (page) => <RequireRole role="student">{page}</RequireRole>;

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Catalogue />} />
              <Route path="/courses/:id" element={<CoursePage />} />
              <Route path="/courses/:id/lessons/:lessonId" element={<RequireRole><LessonPage /></RequireRole>} />
              <Route path="/courses/:id/certificate" element={studentOnly(<Certificate />)} />
              <Route path="/my-learning" element={studentOnly(<MyLearning />)} />
              <Route path="/progress" element={studentOnly(<Progress />)} />
              <Route path="/settings" element={<RequireRole><Settings /></RequireRole>} />
              <Route path="/instructor" element={instructorOnly(<InstructorDashboard />)} />
              <Route path="/instructor/courses" element={instructorOnly(<InstructorCourses />)} />
              <Route path="/instructor/courses/new" element={instructorOnly(<CourseEditor />)} />
              <Route path="/instructor/courses/:id/edit" element={instructorOnly(<CourseEditor />)} />
              <Route path="/instructor/courses/:id/students" element={instructorOnly(<CourseStudents />)} />
              <Route path="/instructor/students" element={instructorOnly(<InstructorStudents />)} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

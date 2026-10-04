import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth, homeFor } from './AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import RequireRole from './components/RequireRole.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Catalogue from './pages/Catalogue.jsx';
import CoursePage from './pages/CoursePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import MyLearning from './pages/MyLearning.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import CourseEditor from './pages/CourseEditor.jsx';

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user) : '/courses'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="mx-auto max-w-4xl px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/courses" element={<Catalogue />} />
              <Route path="/courses/:id" element={<CoursePage />} />
              <Route path="/courses/:id/lessons/:lessonId" element={<RequireRole><LessonPage /></RequireRole>} />
              <Route path="/my-learning" element={<RequireRole role="student"><MyLearning /></RequireRole>} />
              <Route path="/instructor" element={<RequireRole role="instructor"><InstructorDashboard /></RequireRole>} />
              <Route path="/instructor/courses/new" element={<RequireRole role="instructor"><CourseEditor /></RequireRole>} />
              <Route path="/instructor/courses/:id/edit" element={<RequireRole role="instructor"><CourseEditor /></RequireRole>} />
              <Route path="*" element={<p className="text-slate-500">Page not found.</p>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

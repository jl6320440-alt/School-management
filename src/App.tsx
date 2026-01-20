import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { AIChatbot } from "./components/ai/AIChatbot";
import { SplashScreen } from "./components/SplashScreen";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { ParentDashboard } from "./pages/ParentDashboard";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentIdCardPage } from "./pages/StudentIdCardPage";
import { TeachersPage } from "./pages/TeachersPage";
import { ClassesPage } from "./pages/ClassesPage";
import { FeesPage } from "./pages/FeesPage";
import { LibraryPage } from "./pages/LibraryPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AttendancePage } from "./pages/AttendancePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ExamsPage } from "./pages/ExamsPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      {children}
      <AIChatbot />
    </DashboardLayout>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      
      {/* Dashboard - Role-based redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'teacher' && <TeacherDashboard />}
            {user?.role === 'student' && <StudentDashboard />}
            {user?.role === 'parent' && <ParentDashboard />}
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/students"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/students/:id/id-card"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
            <ProtectedRoute>
              <StudentIdCardPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />
      
      <Route
        path="/teachers"
        element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <ProtectedRoute>
              <TeachersPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/classes"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/subjects"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
            <ProtectedRoute>
              <div className="space-y-6">
                <div>
                  <h1>Subjects</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage subjects and curriculum
                  </p>
                </div>
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">
                    Subject management module - Coming soon!
                  </p>
                </div>
              </div>
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/exams"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
            <ProtectedRoute>
              <ExamsPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/results"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
            <ProtectedRoute>
              <div className="space-y-6">
                <div>
                  <h1>Results</h1>
                  <p className="text-muted-foreground mt-2">
                    View and manage exam results
                  </p>
                </div>
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">
                    Results module - Coming soon!
                  </p>
                </div>
              </div>
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/fees"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'parent', 'student']}>
            <ProtectedRoute>
              <FeesPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/library"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/timetable"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <ProtectedRoute>
              <div className="space-y-6">
                <div>
                  <h1>Timetable</h1>
                  <p className="text-muted-foreground mt-2">
                    View and manage class schedules
                  </p>
                </div>
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">
                    Timetable module - Coming soon!
                  </p>
                </div>
              </div>
            </ProtectedRoute>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize app (demo data is seeded via backend npm run seed)
    const initApp = async () => {
      // Demo data is already seeded in MongoDB, no need to initialize
      setIsInitialized(true);

      // Show splash screen for at least 2.5 seconds
      setTimeout(() => {
        setShowSplash(false);
      }, 2500);
    };

    initApp();
  }, []);

  if (showSplash || !isInitialized) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

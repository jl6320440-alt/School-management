import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AIChatbot } from "./components/ai/AIChatbot";
import { SplashScreen } from "./components/SplashScreen";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { ExamsPage } from "./pages/ExamsPage";
import { FeesPage } from "./pages/FeesPage";
import { LibraryPage } from "./pages/LibraryPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AttendancePage } from "./pages/AttendancePage";
import { SettingsPage } from "./pages/SettingsPage";
import { initializeDemoData } from "./utils/initDemoData";

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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <TeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <div className="space-y-6">
              <div>
                <h1>Classes</h1>
                <p className="text-muted-foreground mt-2">
                  Manage classes and subjects
                </p>
              </div>
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">
                  Class management module - Coming soon!
                </p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
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
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <ExamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
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
        }
      />
      <Route
        path="/fees"
        element={
          <ProtectedRoute>
            <FeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable"
        element={
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
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize demo data on first load
    const initApp = async () => {
      await initializeDemoData();
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

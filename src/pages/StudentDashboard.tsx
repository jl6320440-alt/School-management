import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GraduationCap, Calendar, BookOpen, ClipboardList, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewIdCard = () => {
    if (user?.id) {
      navigate(`/students/${encodeURIComponent(user.id)}/id-card`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-sm text-muted-foreground mt-1">Your academic dashboard</p>
        </div>
        <Button onClick={handleViewIdCard} className="gap-2 w-full sm:w-auto">
          <Printer className="h-4 w-4" />
          View ID Card
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Code</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{user?.studentCode || '—'}</div>
            <p className="text-xs text-muted-foreground">Your unique identifier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Class</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Class 10-A</div>
            <p className="text-xs text-muted-foreground">2024-2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Days present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.85</div>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
          <CardDescription>Your latest test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Mathematics Quiz</span>
              <span className="font-bold">92/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span>English Essay</span>
              <span className="font-bold">88/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Science Practical</span>
              <span className="font-bold">95/100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { User, Calendar, AlertCircle, MessageSquare } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your child's academic progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Under your account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Messages from school</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Children</CardTitle>
          <CardDescription>Monitor your child's progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Alice Johnson</h3>
              <p className="text-sm text-muted-foreground">Class: 10-A | Roll: 15</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Attendance</p>
                  <p className="font-bold">94%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">GPA</p>
                  <p className="font-bold">3.85</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-bold text-green-600">Good</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Important dates and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Parent-Teacher Meeting</p>
                <p className="text-xs text-muted-foreground">December 15, 2024</p>
              </div>
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Annual Exam Results</p>
                <p className="text-xs text-muted-foreground">December 20, 2024</p>
              </div>
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Winter Break Starts</p>
                <p className="text-xs text-muted-foreground">December 22, 2024</p>
              </div>
              <span className="text-sm text-muted-foreground">Upcoming</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

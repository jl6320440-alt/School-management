import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import * as classApi from "../utils/backend/classApi";
import * as studentApi from "../utils/backend/studentApi";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [classesAssigned, setClassesAssigned] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const cls = await classApi.listClasses({ teacherId: user.id });
      setClassesAssigned(cls || []);

      const students = await studentApi.listStudents();
      const classIds = new Set((cls || []).map((c: any) => c.id));
      const count = (students || []).filter((s: any) =>
        classIds.has(s.classId),
      ).length;
      setTotalStudents(count);
    } catch (err: any) {
      console.error("Failed to load teacher dashboard data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchData();

  return (
    <div className="space-y-4 sm:space-y-8 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your teaching dashboard
          </p>
        </div>
        <div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/80 rounded-md shadow-sm hover:scale-105 transition-transform w-full sm:w-auto justify-center sm:justify-start"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "—" : totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Across your classes</p>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Classes
            </CardTitle>
            <BookOpen className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "—" : classesAssigned.length}
            </div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Assignments
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "—" : 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Class Average
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">—</div>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/15 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Classes Assigned
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your current teaching assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-muted-foreground">
                  Loading classes…
                </div>
              ) : classesAssigned.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No classes assigned.
                </div>
              ) : (
                classesAssigned.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-4 bg-white/30 rounded-lg hover:bg-white/40 transition-colors duration-200"
                  >
                    <Link
                      to={`/classes/${encodeURIComponent(c.id)}`}
                      className="font-medium text-gray-800"
                    >
                      {c.name} {c.code ? `(${c.code})` : ""}{" "}
                      {c.grade ? `- ${c.grade}` : ""}
                    </Link>
                    <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-full">
                      {c.capacity ?? "—"} students
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/15 backdrop-blur-lg border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest updates and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-white/20 rounded-r-lg hover:bg-white/30 transition-colors duration-200">
                <p className="font-medium text-sm text-gray-800">
                  Exam Results Published
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-white/20 rounded-r-lg hover:bg-white/30 transition-colors duration-200">
                <p className="font-medium text-sm text-gray-800">
                  Assignment Submitted
                </p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2 bg-white/20 rounded-r-lg hover:bg-white/30 transition-colors duration-200">
                <p className="font-medium text-sm text-gray-800">
                  Class Schedule Updated
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

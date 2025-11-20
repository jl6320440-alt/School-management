import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { StatCard } from "../components/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Star } from "lucide-react";
import CediGlyph from "../components/icons/CediGlyph";
import { Tilt } from "../components/ui/tilt";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as studentApi from "../utils/backend/studentApi";
import { toast } from "sonner";

const attendanceData = [
  { name: "Present", value: 850, color: "#10b981" },
  { name: "Absent", value: 120, color: "#ef4444" },
  { name: "Late", value: 30, color: "#f59e0b" },
];

const feeData = [
  { month: "Jan", collected: 45000, pending: 5000 },
  { month: "Feb", collected: 48000, pending: 4500 },
  { month: "Mar", collected: 50000, pending: 3000 },
  { month: "Apr", collected: 52000, pending: 2500 },
  { month: "May", collected: 55000, pending: 2000 },
  { month: "Jun", collected: 58000, pending: 1500 },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    feesCollected: 0,
  });
  const [lookupCode, setLookupCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState<any[]>([]);

  const [topTeacher, setTopTeacher] = useState<any>({
    name: "Ms. Ama Mensah",
    subject: "Mathematics",
    classes: ["10A"],
  });
  const [pendingTasks, setPendingTasks] = useState<Array<any>>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    dbConnected?: boolean;
    uptime?: string;
    lastChecked?: string;
  } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    setStats({
      totalStudents: 450,
      totalTeachers: 35,
      totalClasses: 18,
      feesCollected: 285000,
    });
    fetchTopTeacher();
    fetchPendingTasks();
    fetchSystemHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTopTeacher = async () => {
    try {
      const res = await fetch(
        `${
          (import.meta.env.VITE_API_URL as string) || ""
        }/api/admin/top-teacher`
      );
      if (!res.ok) throw new Error("no-top-teacher");
      const data = await res.json();
      if (data) setTopTeacher(data);
    } catch (err) {
      console.debug("Top teacher fetch failed:", err);
    }
  };

  const fetchPendingTasks = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch(
        `${
          (import.meta.env.VITE_API_URL as string) || ""
        }/api/admin/pending-tasks`
      );
      if (!res.ok) throw new Error("no-pending-tasks");
      const data = await res.json();
      setPendingTasks(data || []);
    } catch (err) {
      console.debug("Pending tasks fetch failed:", err);
      setPendingTasks([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    setHealthLoading(true);
    try {
      const apiUrl =
        (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/admin/health`);
      if (!res.ok) throw new Error("no-health");
      const data = await res.json();
      const healthStatus = {
        status: data.status || "unknown",
        dbConnected: data.dbConnected === true,
        uptime: data.uptime || "-",
        lastChecked: new Date().toLocaleString(),
      };
      setSystemHealth(healthStatus);
      toast.success(
        `System health checked: ${
          data.status === "ok" ? "All systems operational" : "Degraded status"
        }`
      );
    } catch (err) {
      console.error("Health fetch failed:", err);
      const failedHealth = {
        status: "unreachable",
        dbConnected: false,
        uptime: "-",
        lastChecked: new Date().toLocaleString(),
      };
      setSystemHealth(failedHealth);
      toast.error("Failed to connect to backend health endpoint");
    } finally {
      setHealthLoading(false);
    }
  };

  const handleResetSystemHealth = () => {
    setSystemHealth(null);
    setTimeout(() => {
      fetchSystemHealth();
    }, 300);
  };

  const handleLookupByCode = async () => {
    const code = (lookupCode || "").trim();
    if (!code) {
      toast.error("Enter a student code to look up");
      return;
    }
    try {
      setLookupLoading(true);
      const student = await studentApi.getStudentByCode(code);
      if (!student) {
        toast.error("No student found with that code");
        setLookupResults([]);
        return;
      }
      setLookupResults([student]);
      const id = student.id || (student as any)._id;
      if (id) navigate(`/students/${encodeURIComponent(id)}/id-card`);
    } catch (err) {
      console.error(err);
      toast.error("Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of school metrics and quick actions.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          index={0}
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={GraduationCap}
          trend={{ value: 5, isPositive: true }}
          index={1}
        />
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          index={2}
        />
        <StatCard
          title="Fees Collected"
          value={`₵${stats.feesCollected.toLocaleString()}`}
          icon={CediGlyph}
          trend={{ value: 15, isPositive: true }}
          index={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pending Tasks</CardTitle>
            <div className="text-sm text-muted-foreground">
              {pendingLoading ? "Loading..." : `${pendingTasks.length} pending`}
            </div>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading tasks...
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No pending tasks
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.slice(0, 4).map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {t.title || t.type || "Task"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.summary || t.description || ""}
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        onClick={() => navigate(t.link || "/tasks")}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingTasks.length > 4 && (
                  <div className="text-xs text-muted-foreground">
                    And {pendingTasks.length - 4} more...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>System Health</CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  systemHealth?.dbConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              {healthLoading
                ? "Checking..."
                : systemHealth?.status === "ok"
                ? "Healthy"
                : systemHealth?.status === "degraded"
                ? "Degraded"
                : "Offline"}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Database Connection</div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      systemHealth?.dbConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {systemHealth?.dbConnected ? "Connected" : "Disconnected"}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Server Uptime</div>
                <div className="text-sm font-medium">
                  {systemHealth?.uptime || "Loading..."}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Last Checked</div>
                <div className="text-sm font-medium">
                  {systemHealth?.lastChecked || "Never"}
                </div>
              </div>
              <div className="border-t pt-3 mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={fetchSystemHealth}
                  disabled={healthLoading}
                  className="flex-1"
                >
                  {healthLoading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetSystemHealth}
                  disabled={healthLoading}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Top Teacher</CardTitle>
            <div className="text-sm text-muted-foreground">Dynamic</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{topTeacher.name}</div>
                <div className="text-xs text-muted-foreground">
                  {topTeacher.subject} · {topTeacher.classes?.join(", ")}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" asChild>
                    <Link to="/teachers">Manage</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={fetchTopTeacher}>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Tilt enabled={false} className="overflow-hidden">
          <Card className="overflow-hidden border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Tilt>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
                <Bar dataKey="pending" fill="#ef4444" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Quick ID Card Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Enter student code (e.g. AB123)"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
              />
              <Button onClick={handleLookupByCode} disabled={lookupLoading}>
                {lookupLoading ? "Searching..." : "Lookup"}
              </Button>
            </div>

            {lookupResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm text-muted-foreground">Matches:</div>
                {lookupResults.map((s) => (
                  <div
                    key={s.id || s._id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.studentCode} · {s.className || s.classId || "-"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          navigate(
                            `/students/${encodeURIComponent(
                              s.id || s._id
                            )}/id-card`
                          )
                        }
                      >
                        View ID Card
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

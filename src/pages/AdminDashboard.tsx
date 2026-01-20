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
import {
  Users,
  GraduationCap,
  BookOpen,
  Star,
  Mail,
  Phone,
} from "lucide-react";
import CediGlyph from "../components/icons/CediGlyph";
import { Tilt } from "../components/ui/tilt";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
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

  // UI state for task actions
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [assignAssignee, setAssignAssignee] = useState("");

  const apiUrl =
    (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

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
        }/api/admin/top-teacher`,
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
        }/api/admin/pending-tasks`,
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
        }`,
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

  // Pending task actions
  const openConfirmMarkDone = (task: any) => {
    setSelectedTask(task);
    setConfirmOpen(true);
  };

  const handleMarkDone = async (task: any) => {
    if (!task) return;
    // optimistic update: remove task from list
    setPendingTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      if (task.id) {
        const res = await fetch(
          `${apiUrl}/api/admin/tasks/${encodeURIComponent(task.id)}/complete`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error("complete-failed");
      }
      toast.success("Task completed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete task");
      // revert: re-add task
      setPendingTasks((prev) => [task, ...prev]);
    } finally {
      setConfirmOpen(false);
      setSelectedTask(null);
    }
  };

  const openAssignDialog = (task: any) => {
    setSelectedTask(task);
    setAssignAssignee("");
    setAssignOpen(true);
  };

  const handleAssignConfirm = async () => {
    if (!selectedTask) return;
    const assigneeId = assignAssignee.trim();
    if (!assigneeId) {
      toast.error("Enter an assignee id");
      return;
    }
    try {
      if (selectedTask.id) {
        const res = await fetch(
          `${apiUrl}/api/admin/tasks/${encodeURIComponent(
            selectedTask.id,
          )}/assign`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assigneeId }),
          },
        );
        if (!res.ok) throw new Error("assign-failed");
      }
      toast.success("Task assigned");
      // optionally update tasks list with a note
      setPendingTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, assignedTo: assigneeId } : t,
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign task");
    } finally {
      setAssignOpen(false);
      setSelectedTask(null);
      setAssignAssignee("");
    }
  };

  // Top teacher actions
  const handleFeatureTeacher = async (teacherId?: string) => {
    if (!teacherId) {
      toast.error("No teacher id available");
      return;
    }
    // optimistic
    const prev = topTeacher;
    setTopTeacher((t: any) => ({ ...t, featured: true }));
    try {
      const res = await fetch(
        `${apiUrl}/api/admin/teachers/${encodeURIComponent(teacherId)}/feature`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error("feature-failed");
      toast.success("Teacher featured");
    } catch (err) {
      console.error(err);
      toast.error("Failed to feature teacher");
      setTopTeacher(prev);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of school metrics and quick actions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                    key={t.id || i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {t.title || t.type || "Task"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.summary || t.description || ""}
                      </div>
                      {t.assignedTo && (
                        <div className="text-xs text-muted-foreground">
                          Assigned: {t.assignedTo}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openConfirmMarkDone(t)}
                      >
                        Mark Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignDialog(t)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(t.link || "/tasks")}
                      >
                        Open
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
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div
                  style={{
                    background:
                      "conic-gradient(var(--accent) 0%, var(--accent-2) 100%)",
                  }}
                  className="w-20 h-20 rounded-full p-1"
                >
                  <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        systemHealth?.status === "ok"
                          ? "bg-green-500/20"
                          : systemHealth?.status === "degraded"
                            ? "bg-yellow-400/20"
                            : "bg-red-500/20"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${
                          systemHealth?.status === "ok"
                            ? "bg-green-500"
                            : systemHealth?.status === "degraded"
                              ? "bg-yellow-400"
                              : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Overall</div>
                    <div className="font-semibold text-lg">
                      {healthLoading
                        ? "Checking..."
                        : systemHealth?.status === "ok"
                          ? "Operational"
                          : systemHealth?.status === "degraded"
                            ? "Degraded"
                            : "Offline"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    <div>Last</div>
                    <div className="font-medium">
                      {systemHealth?.lastChecked || "Never"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">DB</div>
                    <div className="mt-1 font-medium">
                      {systemHealth?.dbConnected ? "Connected" : "Down"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Uptime</div>
                    <div className="mt-1 font-medium">
                      {systemHealth?.uptime || "-"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="mt-1 font-medium">
                      {systemHealth?.status || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Top Teacher</CardTitle>
            <div className="text-sm text-muted-foreground">Dynamic</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {topTeacher?.avatar ? (
                  <AvatarImage src={topTeacher.avatar} alt={topTeacher.name} />
                ) : (
                  <AvatarFallback>
                    {(topTeacher.name || "T").slice(0, 1)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {topTeacher.name}
                  {topTeacher.featured && (
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {topTeacher.subject} · {topTeacher.classes?.join(", ")}
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {topTeacher.rating || 4.6}
                  </div>
                  {topTeacher.email && (
                    <a
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                      href={`mailto:${topTeacher.email}`}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  )}
                  {topTeacher.phone && (
                    <a
                      className="flex items-center gap-1 text-xs text-muted-foreground"
                      href={`tel:${topTeacher.phone}`}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" asChild>
                    <Link to="/teachers">Manage</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={fetchTopTeacher}>
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleFeatureTeacher(topTeacher?.id)}
                    disabled={topTeacher?.featured}
                  >
                    Feature
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
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
                              s.id || s._id,
                            )}/id-card`,
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
      {/* Confirm Mark Done Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Complete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this task as completed?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setSelectedTask(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => handleMarkDone(selectedTask)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Enter an assignee id (user id or email) to assign this task.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <Input
              placeholder="Assignee id or email"
              value={assignAssignee}
              onChange={(e) => setAssignAssignee(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAssignOpen(false);
                  setSelectedTask(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssignConfirm}>Assign</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

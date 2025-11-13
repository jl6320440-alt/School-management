import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { StatCard } from "../components/dashboard/StatCard";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserCheck,
  Sparkles,
} from "lucide-react";
import CediGlyph from "../components/icons/CediGlyph";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tilt } from "../components/ui/tilt";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as kv from "../utils/backend/api";

const performanceData = [
  { month: "Jan", score: 75 },
  { month: "Feb", score: 78 },
  { month: "Mar", score: 82 },
  { month: "Apr", score: 85 },
  { month: "May", score: 88 },
  { month: "Jun", score: 90 },
];

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
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    feesCollected: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const students = await kv.getByPrefix("student:");
      const teachers = await kv.getByPrefix("teacher:");
      const classes = await kv.getByPrefix("class:");
      const fees = await kv.getByPrefix("fee:");

      const totalFees = fees
        .filter((fee: any) => fee.status === "paid")
        .reduce((sum: number, fee: any) => sum + fee.amount, 0);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        feesCollected: totalFees,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your school today.
        </p>
      </motion.div>

      {/* AI Insight Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Tilt className="overflow-hidden relative">
          <Card className="border-l-4 border-l-blue-500 bg-linear-to-r from-blue-50 via-blue-50/50 to-transparent dark:from-blue-950/30 dark:via-blue-950/20 dark:to-transparent overflow-hidden relative">
            {/* Animated Background */}
            <motion.div
              className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <CardContent className="p-4 relative">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                </motion.div>
                <div>
                  <h4 className="text-blue-900 dark:text-blue-100">
                    AI Insight
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Overall class performance improved by 8% this month. Grade
                    10 students show exceptional progress in Mathematics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tilt>
      </motion.div>

      {/* Stats Cards */}
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

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Trend (gentle reveal, tilt disabled) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: "easeOut" }}
        >
          <Tilt enabled={false} className="overflow-hidden">
            <Card className="overflow-hidden border-t-4 border-t-purple-500">
              <CardHeader className="bg-linear-to-r from-purple-50 to-transparent dark:from-purple-950/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <defs>
                      <linearGradient
                        id="colorScore"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#colorScore)"
                      dot={{ fill: "#8b5cf6", r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Attendance Distribution (gentle reveal, tilt disabled) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.6, ease: "easeOut" }}
        >
          <Tilt enabled={false} className="overflow-hidden">
            <Card className="overflow-hidden border-t-4 border-t-green-500">
              <CardHeader className="bg-linear-to-r from-green-50 to-transparent dark:from-green-950/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Attendance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Fee Collection (gentle reveal, tilt disabled) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="md:col-span-2"
        >
          <Tilt enabled={false} className="overflow-hidden md:col-span-2">
            <Card className="overflow-hidden border-t-4 border-t-blue-500">
              <CardHeader className="bg-linear-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Fee Collection Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feeData}>
                    <defs>
                      <linearGradient
                        id="colorCollected"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPending"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="collected"
                      fill="url(#colorCollected)"
                      name="Collected"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="pending"
                      fill="url(#colorPending)"
                      name="Pending"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Tilt className="overflow-hidden">
          <Card className="overflow-hidden border-t-4 border-t-amber-500">
            <CardHeader className="bg-linear-to-r from-amber-50 to-transparent dark:from-amber-950/20">
              <CardTitle className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: "John Doe",
                    action: "submitted assignment for Mathematics",
                    time: "5 mins ago",
                    color: "blue",
                  },
                  {
                    user: "Sarah Smith",
                    action: "marked attendance for Grade 10-A",
                    time: "15 mins ago",
                    color: "green",
                  },
                  {
                    user: "Mike Johnson",
                    action: "uploaded exam results for Physics",
                    time: "1 hour ago",
                    color: "purple",
                  },
                  {
                    user: "Emily Brown",
                    action: "created new announcement",
                    time: "2 hours ago",
                    color: "pink",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-start gap-3 border-b pb-3 last:border-b-0 group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-full p-2 bg-${activity.color}-100 dark:bg-${activity.color}-950/30`}
                    >
                      <UserCheck
                        className={`h-4 w-4 text-${activity.color}-600`}
                      />
                    </motion.div>
                    <div className="flex-1">
                      <p>
                        <span className="text-primary font-medium">
                          {activity.user}
                        </span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Tilt>
      </motion.div>
    </div>
  );
};

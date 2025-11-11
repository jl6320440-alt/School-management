import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Award, TrendingUp, Download, FileText } from "lucide-react";
import * as kv from "../utils/supabase/kv_store";
import { Result } from "../types";

const demoResults = [
  {
    studentName: "Alice Johnson",
    rollNumber: "10A-001",
    subject: "Mathematics",
    marks: 85,
    grade: "A",
    percentage: 85,
  },
  {
    studentName: "Alice Johnson",
    rollNumber: "10A-001",
    subject: "Physics",
    marks: 78,
    grade: "B+",
    percentage: 78,
  },
  {
    studentName: "Alice Johnson",
    rollNumber: "10A-001",
    subject: "Chemistry",
    marks: 82,
    grade: "A-",
    percentage: 82,
  },
  {
    studentName: "Alice Johnson",
    rollNumber: "10A-001",
    subject: "English",
    marks: 88,
    grade: "A",
    percentage: 88,
  },
  {
    studentName: "Bob Smith",
    rollNumber: "10A-002",
    subject: "Mathematics",
    marks: 72,
    grade: "B",
    percentage: 72,
  },
  {
    studentName: "Bob Smith",
    rollNumber: "10A-002",
    subject: "Physics",
    marks: 68,
    grade: "C+",
    percentage: 68,
  },
];

const performanceData = [
  { exam: "Test 1", avgScore: 75 },
  { exam: "Test 2", avgScore: 78 },
  { exam: "Mid-Term", avgScore: 82 },
  { exam: "Test 3", avgScore: 80 },
  { exam: "Final", avgScore: 85 },
];

const subjectPerformance = [
  { subject: "Math", average: 78 },
  { subject: "Physics", average: 73 },
  { subject: "Chemistry", average: 82 },
  { subject: "English", average: 85 },
];

export const ResultsPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("class-10a");
  const [selectedExam, setSelectedExam] = useState("mid-term");

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      A: "bg-green-600",
      "A-": "bg-green-500",
      "B+": "bg-blue-600",
      B: "bg-blue-500",
      "C+": "bg-yellow-600",
      C: "bg-yellow-500",
    };
    return (
      <Badge className={gradeColors[grade] || "bg-gray-600"}>{grade}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Results & Performance</h1>
          <p className="text-muted-foreground mt-2">
            View and analyze exam results
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report Cards
        </Button>
      </div>

      <Card className="border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="text-purple-900 dark:text-purple-100">
                AI Performance Insight
              </h4>
              <p className="text-purple-700 dark:text-purple-300 mt-1">
                Class average improved by 7% from last semester. Top performers:
                Alice Johnson (83.25%), Charlie Brown (81.5%). Mathematics shows
                strongest improvement (+12%).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Class Average</p>
                <h3 className="mt-2">78.5%</h3>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-muted-foreground">Highest Score</p>
              <h3 className="mt-2">95%</h3>
              <p className="text-muted-foreground">Sarah Lee - Math</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-muted-foreground">Pass Rate</p>
              <h3 className="mt-2">94%</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-muted-foreground">Top Subject</p>
              <h3 className="mt-2">English</h3>
              <p className="text-muted-foreground">85% avg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Average Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#10b981" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Results</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class-10a">Grade 10-A</SelectItem>
                  <SelectItem value="class-10b">Grade 10-B</SelectItem>
                  <SelectItem value="class-9a">Grade 9-A</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mid-term">Mid-Term</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="test-1">Test 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.rollNumber}</TableCell>
                  <TableCell>{result.studentName}</TableCell>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell>{result.marks}/100</TableCell>
                  <TableCell>{result.percentage}%</TableCell>
                  <TableCell>{getGradeBadge(result.grade)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

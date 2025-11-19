import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, Printer, Download } from "lucide-react";
import * as studentApi from "../utils/backend/studentApi";
import { Student } from "../types";
import { toast } from "sonner";

export const StudentIdCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    if (!id) {
      toast.error("Student ID not provided");
      navigate("/students");
      return;
    }
    try {
      setLoading(true);
      const data = await studentApi.getStudent(id);
      setStudent(data as any);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load student");
      navigate("/students");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Simple approach: generate a data URL and trigger download
    const element = document.getElementById("id-card-content");
    if (!element) return;

    // Use html2canvas if available, otherwise just print
    toast.info("Use Print (Ctrl+P) to save as PDF");
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Student not found</p>
      </div>
    );
  }

  const initials =
    student.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/students")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1" />
        <Button size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      {/* ID Card Content */}
      <div className="flex justify-center">
        <div
          id="id-card-content"
          className="bg-white rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: "360px",
            height: "560px",
            perspective: "1000px",
          }}
        >
          {/* Front of Card */}
          <div className="h-full flex flex-col p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">School ID Card</h2>
              <p className="text-xs text-blue-100">Student Identity</p>
            </div>

            {/* Avatar/Photo Section */}
            <div className="flex justify-center mb-4">
              {student.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-28 h-28 rounded-lg object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-lg bg-white/20 flex items-center justify-center border-4 border-white text-4xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="text-center space-y-2 mb-6 flex-1">
              <div>
                <p className="text-xs text-blue-100">Student Name</p>
                <p className="text-lg font-bold">{student.name}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100">Student Code</p>
                <p className="text-2xl font-bold tracking-widest">
                  {student.studentCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-100">Roll Number</p>
                <p className="text-sm font-semibold">{student.rollNumber}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100">Class</p>
                <p className="text-sm font-semibold">{student.classId}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-white/30 pt-3">
              <p className="text-xs text-blue-100">
                Valid during academic year
              </p>
              <p className="text-xs font-semibold">
                {new Date().getFullYear()}-{new Date().getFullYear() + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 max-w-md mx-auto">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">📋 ID Card Details</h3>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Student Code:</dt>
                <dd className="font-mono font-bold">{student.studentCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name:</dt>
                <dd className="font-semibold">{student.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email:</dt>
                <dd className="font-mono text-xs">{student.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Class:</dt>
                <dd>{student.classId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Roll Number:</dt>
                <dd>{student.rollNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Guardian:</dt>
                <dd>{student.guardianName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Contact:</dt>
                <dd className="font-mono text-xs">{student.guardianPhone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .fixed, .relative:not(#id-card-content *) {
            display: none !important;
          }
          button {
            display: none !important;
          }
          #id-card-content {
            box-shadow: none !important;
            transform: none !important;
          }
          .max-w-md {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentIdCardPage;

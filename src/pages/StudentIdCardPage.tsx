import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  Calendar,
  User,
  Code,
  Mail,
  MapPin,
  Smartphone,
  Star,
  Sparkles,
} from "lucide-react";
import * as studentApi from "../utils/backend/studentApi";
import { Student } from "../types";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";

export const StudentIdCardPage: React.FC = () => {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.log("Student data received:", data);
      console.log("Avatar URL:", data?.avatar);
      setStudent(data as Student | null);
      setImageError(false); // Reset image error on new load
    } catch (err) {
      console.error("Failed to load student:", err);
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

  const schoolName =
    (import.meta.env.VITE_SCHOOL_NAME as string) || "Alpha Montessori";

  const isDark = theme === "dark";

  // Premium color scheme
  const cardBgClass = "bg-white border border-slate-200 shadow-2xl";
  const cardDarkClass = "bg-slate-900 border border-slate-700 shadow-2xl";
  const finalCardClass = isDark ? cardDarkClass : cardBgClass;

  const cardWidth = 360;
  const cardHeight = 580;

  // Generate QR code URL
  const qrCodeUrl = `${
    (import.meta.env.VITE_API_URL as string) || "http://localhost:3000"
  }/student/${student.id}`;

  const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    qrCodeUrl
  )}&qzone=2`;

  const studentCode =
    student.studentCode ||
    `STU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const className = student.className || "N/A";
  const rollNumber = student.rollNumber || "N/A";
  const guardianName = student.guardianName || "N/A";
  const guardianPhone = student.guardianPhone || "N/A";
  const studentDOB = student.dateOfBirth || "Not Provided";
  const studentEmail = student.email || "Not Provided";
  const studentAddress = student.address || "Not Provided";

  const formatDate = (date: any) => {
    if (!date) return "Not Provided";
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  const formattedDOB = formatDate(studentDOB);

  return (
    <div
      className={`min-h-screen py-8 px-4 ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/students")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Container */}
        <div className="flex justify-center items-start gap-8">
          {/* ID Card */}
          <div
            className={`${finalCardClass} rounded-2xl overflow-hidden flex-shrink-0`}
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
            }}
          >
            {/* Premium Card Content */}
            <div className="h-full flex flex-col relative overflow-hidden">
              {/* Decorative Top Accent */}
              <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>

              {/* Header Section */}
              <div
                className={`px-6 pt-6 pb-4 ${
                  isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-900"
                    : "bg-gradient-to-br from-blue-50 to-slate-50"
                } border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}
              >
                <div className="text-center">
                  <h1
                    className={`text-sm font-bold tracking-widest ${
                      isDark ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    {schoolName}
                  </h1>
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Student Identification Card
                  </p>
                </div>
              </div>

              {/* Photo Section with Premium Frame */}
              <div className="px-6 pt-6 pb-4">
                <div className="relative w-24 h-28 mx-auto">
                  {/* Decorative Frame */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-1 shadow-lg">
                    <div
                      className={`w-full h-full rounded-lg ${
                        isDark ? "bg-slate-800" : "bg-white"
                      } flex items-center justify-center`}
                    >
                      {student.avatar && !imageError ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full rounded-lg object-cover"
                          onError={() => {
                            console.error(
                              "Failed to load avatar from:",
                              student.avatar
                            );
                            setImageError(true);
                          }}
                          onLoad={() =>
                            console.log(
                              "Avatar loaded successfully from:",
                              student.avatar
                            )
                          }
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold ${
                            isDark
                              ? "bg-slate-700 text-blue-300"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {student.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Info Section */}
              <div
                className={`px-6 py-4 flex-grow ${
                  isDark ? "bg-slate-900" : "bg-white"
                }`}
              >
                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <p
                      className={`text-xs font-semibold tracking-wide ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      FULL NAME
                    </p>
                    <p
                      className={`text-sm font-bold truncate ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {student.name || "N/A"}
                    </p>
                  </div>

                  {/* Student Code */}
                  <div>
                    <p
                      className={`text-xs font-semibold tracking-wide ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      STUDENT CODE
                    </p>
                    <p
                      className={`text-sm font-mono font-bold ${
                        isDark ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      {studentCode}
                    </p>
                  </div>

                  {/* Class & Roll */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className={`text-xs font-semibold tracking-wide ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        CLASS
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {className}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold tracking-wide ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        ROLL
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {rollNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with QR Code */}
              <div
                className={`px-6 py-4 flex items-center justify-between border-t ${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex-grow">
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Valid: {new Date().getFullYear()} -{" "}
                    {new Date().getFullYear() + 1}
                  </p>
                </div>
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-16 h-16 rounded-lg border-2"
                  style={{
                    borderColor: isDark ? "#475569" : "#e2e8f0",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Information Panel - Right Side */}
          <div className="flex-1 space-y-4 max-w-sm print:hidden">
            {/* Card Title */}
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Student Details
            </h2>

            {/* Personal Information */}
            <Card
              className={`${
                isDark
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <User
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        FULL NAME
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {student.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Code
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        STUDENT CODE
                      </p>
                      <p
                        className={`text-sm font-mono ${
                          isDark ? "text-purple-300" : "text-purple-700"
                        }`}
                      >
                        {studentCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Calendar
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-pink-400" : "text-pink-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        DATE OF BIRTH
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {formattedDOB}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ShieldCheck
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        CLASS
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {className}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card
              className={`${
                isDark
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <CardContent className="pt-6">
                <h3
                  className={`text-sm font-bold mb-4 flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Mail
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        EMAIL
                      </p>
                      <p
                        className={`text-sm truncate ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {studentEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-red-400" : "text-red-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        ADDRESS
                      </p>
                      <p
                        className={`text-sm line-clamp-2 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {studentAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card
              className={`${
                isDark
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <CardContent className="pt-6">
                <h3
                  className={`text-sm font-bold mb-4 flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Guardian Information
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <User
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        GUARDIAN NAME
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {guardianName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Smartphone
                      className={`w-5 h-5 flex-shrink-0 ${
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        PHONE NUMBER
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {guardianPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card
              className={`bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <div className="text-center">
                    <p className="text-xs font-semibold opacity-90">
                      OFFICIAL STUDENT ID
                    </p>
                    <p className="text-xs opacity-75">
                      Valid for {new Date().getFullYear()} -{" "}
                      {new Date().getFullYear() + 1}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

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
  GraduationCap,
  Award,
  Phone,
  Building2,
  Users,
} from "lucide-react";
import * as studentApi from "../utils/backend/studentApi";
import { Student } from "../types";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";

// StudentIdCardPage - Complete Redesign
// Modern, premium student ID card with comprehensive details display
// Features: Multi-section layout, enhanced visuals, responsive design
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
      console.log("========== STUDENT DATA RECEIVED ==========");
      console.log("Full Response:", JSON.stringify(data, null, 2));
      console.log("Avatar URL:", data?.avatar);
      console.log("Avatar Type:", typeof data?.avatar);
      console.log("Avatar Empty?:", !data?.avatar);
      console.log("Avatar Length:", data?.avatar?.length || 0);
      console.log("Name:", data?.name);
      console.log("Email:", data?.email);
      console.log("Student Code:", data?.studentCode);
      console.log("==========================================");
      setStudent(data as Student | null);
      setImageError(false);
    } catch (err) {
      console.error("Failed to load student:", err);
      toast.error("Failed to load student");
      navigate("/students");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleDownload = () => {
    toast.info("Use Print (Ctrl+P) to save as PDF");
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
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

  const cardWidth = 360;
  const cardHeight = 650;

  const qrCodeUrl = `${
    (import.meta.env.VITE_API_URL as string) || "http://localhost:3000"
  }/student/${student.id}`;

  const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    qrCodeUrl
  )}&qzone=2`;

  const studentCode =
    student.studentCode ||
    `STU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Format student code with dash after first two letters (e.g., "ST-U-123ABC")
  const formatStudentCode = (code: string) => {
    const cleaned = code.replace(/-/g, "");
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
  };

  const formatDate = (date: any) => {
    if (!date) return "";
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

  const formattedDOB = formatDate(student.dateOfBirth);
  const initials =
    student.name
      ?.split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className={`min-h-screen py-4 sm:py-8 px-3 sm:px-4 lg:px-6 ${
        isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 to-blue-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/students")}
            className="gap-2 text-sm sm:text-base w-full sm:w-auto justify-start sm:justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Students
          </Button>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button onClick={handlePrint} variant="outline" className="gap-2 flex-1 sm:flex-none text-sm sm:text-base">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-1 sm:flex-none text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Container - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column - ID Card (3D Premium with Glowing Edge) */}
          <div className="lg:col-span-1 flex justify-center print:flex print:justify-center">
            <style>{`
              @keyframes glow {
                0%, 100% {
                  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1);
                }
                50% {
                  box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(139, 92, 246, 0.15);
                }
              }
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .card-glow {
                animation: glow 3s ease-in-out infinite, slideUp 0.6s ease-out;
              }
            `}</style>
            <div
              className={`${
                isDark
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-slate-200"
              } rounded-3xl overflow-hidden border-2 flex-shrink-0 transition-transform duration-300 print:shadow-lg card-glow`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
              }}
            >
              {/* Card Content */}
              <div className="h-full flex flex-col relative">
                {/* Top Accent Bar - Premium */}
                <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl relative overflow-hidden"></div>

                {/* School Header - Elegant */}
                <div
                  className={`px-6 pt-5 pb-3 text-center ${
                    isDark
                      ? "bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900"
                      : "bg-gradient-to-b from-slate-100 via-blue-50 to-white"
                  }`}
                >
                  <p
                    className={`text-xs font-bold tracking-widest ${
                      isDark ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    {schoolName}
                  </p>
                  <p
                    className={`text-xs mt-1.5 font-medium tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    OFFICIAL STUDENT ID
                  </p>
                </div>

                {/* Class & Roll Number Info Banner - Enhanced */}
                <div
                  className={`px-4 py-3 flex justify-around items-center border-b ${
                    isDark
                      ? "bg-slate-800 border-slate-700 bg-opacity-50"
                      : "bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-slate-200"
                  }`}
                >
                  {student.className && (
                    <div className="text-center flex-1">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Class
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isDark
                            ? "text-blue-300"
                            : "text-blue-700"
                        }`}
                      >
                        {student.className}
                      </p>
                    </div>
                  )}
                  {student.rollNumber && (
                    <div
                      className={`h-8 w-px ${
                        isDark ? "bg-slate-700" : "bg-slate-300"
                      }`}
                    ></div>
                  )}
                  {student.rollNumber && (
                    <div className="text-center flex-1">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Roll No.
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isDark
                            ? "text-purple-300"
                            : "text-purple-700"
                        }`}
                      >
                        {student.rollNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Student Photo Section - Elegant Spacing */}
                <div className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
                  {/* Premium Photo Frame - Larger and prominent */}
                  <div className="relative w-full max-w-xs aspect-square">
                    {/* Main Photo Container with gradient border and glow */}
                    <div
                      className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border-2`}
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                          : "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
                        borderImage: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) 1",
                        border: "3px solid",
                      }}
                    >
                      {student.avatar && !imageError ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-full h-full object-cover"
                          onError={() => {
                            console.error(
                              "Avatar failed to load from:",
                              student.avatar
                            );
                            setImageError(true);
                          }}
                          onLoad={() => {
                            console.log(
                              "Avatar loaded successfully from:",
                              student.avatar
                            );
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center text-6xl font-bold ${
                            isDark
                              ? "bg-gradient-to-br from-slate-700 to-slate-800 text-blue-300"
                              : "bg-gradient-to-br from-blue-200 to-purple-100 text-blue-600"
                          }`}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Code Badge - Elegant */}
                  <div
                    className={`mt-3 px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider ${
                      isDark
                        ? "bg-blue-900 bg-opacity-60 text-blue-200 border border-blue-600"
                        : "bg-blue-100 bg-opacity-70 text-blue-700 border border-blue-300"
                    }`}
                  >
                    {formatStudentCode(studentCode)}
                  </div>
                </div>

                {/* QR Code Section - Premium Bottom */}
                <div
                  className={`px-4 py-6 flex flex-col items-center gap-3 border-t ${
                    isDark
                      ? "border-slate-700 border-opacity-50 bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900"
                      : "border-slate-200 bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50"
                  }`}
                >
                  {/* QR Code - Premium with Elegant Frame */}
                  <div
                    className={`p-3 rounded-2xl backdrop-blur-sm ${
                      isDark
                        ? "bg-white bg-opacity-95 border-2 border-blue-500 shadow-2xl"
                        : "bg-white border-2 border-blue-400 shadow-2xl"
                    }`}
                    style={{
                      boxShadow: isDark
                        ? "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.2)"
                        : "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)",
                    }}
                  >
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="w-32 h-32 rounded-lg"
                    />
                  </div>
                  <div
                    className={`text-center ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    <p className="text-xs font-medium">Valid {new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
                    <p className="text-xs mt-0.5 opacity-75">Scan for Details</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Student Details */}
          <div className="lg:col-span-2 print:hidden space-y-6">
            {/* Title Section */}
            <div>
              <h1
                className={`text-4xl font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {student.name}
              </h1>
              <p
                className={`text-lg mt-2 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Student ID:{" "}
                <span className="font-mono font-bold">{formatStudentCode(studentCode)}</span>
              </p>
            </div>

            {/* Academic Information */}
            {(student.className || student.rollNumber) && (
              <Card
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`p-3 rounded-lg ${
                        isDark
                          ? "bg-blue-900 text-blue-300"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h2
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Academic Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {student.className && (
                      <div>
                        <p
                          className={`text-sm font-semibold uppercase tracking-wide ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Class
                        </p>
                        <p
                          className={`text-xl font-bold mt-2 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {student.className}
                        </p>
                      </div>
                    )}
                    {student.rollNumber && (
                      <div>
                        <p
                          className={`text-sm font-semibold uppercase tracking-wide ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Roll Number
                        </p>
                        <p
                          className={`text-xl font-bold mt-2 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {student.rollNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card
              className={`${
                isDark
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              } hover:shadow-lg transition-shadow`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`p-3 rounded-lg ${
                      isDark
                        ? "bg-purple-900 text-purple-300"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <h2
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Personal Details
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {student.dateOfBirth && (
                    <div>
                      <p
                        className={`text-sm font-semibold uppercase tracking-wide ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Date of Birth
                      </p>
                      <p
                        className={`text-lg font-bold mt-2 flex items-center gap-2 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <Calendar className="w-4 h-4 opacity-60" />
                        {formattedDOB}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(student.email || student.phone || student.address) && (
              <Card
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`p-3 rounded-lg ${
                        isDark
                          ? "bg-green-900 text-green-300"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      <Phone className="w-6 h-6" />
                    </div>
                    <h2
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Contact Information
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {student.email && (
                      <div className="flex gap-3">
                        <Mail
                          className={`w-5 h-5 mt-1 flex-shrink-0 ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold uppercase tracking-wide ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Email
                          </p>
                          <p
                            className={`text-sm mt-1 break-all ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {student.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {student.phone && (
                      <div className="flex gap-3">
                        <Smartphone
                          className={`w-5 h-5 mt-1 flex-shrink-0 ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold uppercase tracking-wide ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Phone
                          </p>
                          <p
                            className={`text-sm mt-1 ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {student.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {student.address && (
                      <div className="flex gap-3">
                        <MapPin
                          className={`w-5 h-5 mt-1 flex-shrink-0 ${
                            isDark ? "text-red-400" : "text-red-600"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-semibold uppercase tracking-wide ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            Address
                          </p>
                          <p
                            className={`text-sm mt-1 leading-relaxed ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {student.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guardian Information */}
            {(student.guardianName || student.guardianPhone) && (
              <Card
                className={`${
                  isDark
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                } hover:shadow-lg transition-shadow`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`p-3 rounded-lg ${
                        isDark
                          ? "bg-orange-900 text-orange-300"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      <Users className="w-6 h-6" />
                    </div>
                    <h2
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Guardian Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {student.guardianName && (
                      <div>
                        <p
                          className={`text-sm font-semibold uppercase tracking-wide ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Guardian Name
                        </p>
                        <p
                          className={`text-lg font-bold mt-2 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {student.guardianName}
                        </p>
                      </div>
                    )}

                    {student.guardianPhone && (
                      <div>
                        <p
                          className={`text-sm font-semibold uppercase tracking-wide ${
                            isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          Guardian Phone
                        </p>
                        <p
                          className={`text-lg font-bold mt-2 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {student.guardianPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Badge */}
            <div
              className={`rounded-2xl p-6 border-2 border-dashed ${
                isDark
                  ? "bg-slate-800 border-slate-700"
                  : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className={`w-8 h-8 ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                />
                <div>
                  <p
                    className={`font-bold text-lg ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Official Student ID
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Valid Academic Year {new Date().getFullYear()} -{" "}
                    {new Date().getFullYear() + 1}
                  </p>
                </div>
              </div>
            </div>
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
          .print\\:flex {
            display: flex !important;
          }
          .print\\:justify-center {
            justify-content: center !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

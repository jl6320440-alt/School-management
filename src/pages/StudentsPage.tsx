import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tilt } from "../components/ui/tilt";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  FileText,
  DollarSign,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import * as studentApi from "../utils/backend/studentApi";
import { uploadFile } from "../utils/backend/api";
import * as classApi from "../utils/backend/classApi";
import { Student, Class } from "../types";
import { toast } from "sonner";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const previousPreviewRef = useRef<string | null>(null);
  const [step, setStep] = useState<number>(0); // 0=bio,1=review,2=photo

  const DRAFT_KEY = "student:draft:v1";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    classId: "",
    rollNumber: "",
    dateOfBirth: "",
    guardianName: "",
    guardianPhone: "",
    address: "",
  });

  const [selectedStudent, setSelectedStudent] = useState(
    null as Student | null,
  );
  const navigate = useNavigate();

  const goToFees = (student: Student) => {
    navigate(`/fees?studentId=${encodeURIComponent(student.id)}`);
  };

  const goToRecords = (student: Student) => {
    navigate(`/students/${encodeURIComponent(student.id)}/records`);
  };

  const [studentFeeTotals, setStudentFeeTotals] = useState<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  } | null>(null);

  const statusIsActive = (s?: string | null) => {
    return (s || "Active").toLowerCase() === "active";
  };

  const loadStudentFeeTotals = async (studentId: string) => {
    try {
      // Fees API not yet implemented, skip loading
      setStudentFeeTotals({
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
      });
    } catch (err) {
      console.error(err);
      setStudentFeeTotals(null);
    }
  };

  useEffect(() => {
    loadStudents();
    loadClasses();
    return () => {
      if (previousPreviewRef.current)
        URL.revokeObjectURL(previousPreviewRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autosave draft while the add dialog is open and not editing an existing student
  useEffect(() => {
    if (!isDialogOpen) return;
    if (editingStudent) return; // don't autosave when editing existing student
    const t = setTimeout(() => saveDraft(), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, avatarDataUrl, step, isDialogOpen]);

  // persist draft before window unload
  useEffect(() => {
    const fn = () => {
      if (isDialogOpen && !editingStudent) saveDraft();
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen, formData, avatarDataUrl, editingStudent]);

  const loadStudents = async () => {
    try {
      const data = await studentApi.listStudents();
      // Map API response to frontend Student type
      const mapped = data.map(
        (student: any) =>
          ({
            id: student.id || student._id,
            studentCode: student.studentCode || "",
            name: student.name || "",
            email: student.email || "",
            classId: student.classId || student.className || "",
            rollNumber: student.rollNumber || "",
            dateOfBirth: student.dateOfBirth || student.dob || "",
            guardianName: student.guardianName || "",
            guardianPhone: student.guardianPhone || "",
            address: student.address || "",
            avatar: student.avatar,
            status: student.status,
            enrollmentDate: student.enrollmentDate || new Date().toISOString(),
          }) as Student,
      );
      setStudents(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    }
  };

  const loadClasses = async () => {
    try {
      const data = await classApi.listClasses();
      const mapped = data.map((cls: any) => ({
        ...cls,
        studentCount: cls.studentCount || 0,
      }));
      setClasses(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load classes");
    }
  };

  const generateStudentCode = (existingCodes: Set<string>) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const rand = () =>
      letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 50; i++) {
      const code = `${rand()}${rand()}${String(
        Math.floor(Math.random() * 1000),
      ).padStart(3, "0")}`;
      if (!existingCodes.has(code)) return code;
    }
    return `SC${Date.now().toString().slice(-4)}`;
  };

  const isBioComplete = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.rollNumber.trim() !== "" &&
      formData.classId.trim() !== ""
    );
  };

  const goToStep = (target: number) => {
    if (target > 0 && !isBioComplete()) {
      toast.error("Please complete the bio step before proceeding");
      setStep(0);
      return;
    }
    setStep(target);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      classId: "",
      rollNumber: "",
      dateOfBirth: "",
      guardianName: "",
      guardianPhone: "",
      address: "",
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarDataUrl(null);
    if (previousPreviewRef.current) {
      URL.revokeObjectURL(previousPreviewRef.current);
      previousPreviewRef.current = null;
    }
    setEditingStudent(null);
    setStep(0);
  };

  const handleAvatarChange = (file: File | null) => {
    if (!file) return removeAvatar();
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }
    const url = URL.createObjectURL(file);
    if (previousPreviewRef.current)
      URL.revokeObjectURL(previousPreviewRef.current);
    previousPreviewRef.current = url;
    setAvatarFile(file);
    setAvatarPreview(url);

    // read file as data URL for draft caching
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      setAvatarDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  function dataUrlToFile(dataUrl: string, filename = "avatar.png") {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    try {
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      return new Blob([u8arr], { type: mime });
    }
  }

  const removeAvatar = () => {
    if (previousPreviewRef.current) {
      URL.revokeObjectURL(previousPreviewRef.current);
      previousPreviewRef.current = null;
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarDataUrl(null);
  };

  const openAddDialog = () => {
    resetForm();
    // load draft if present
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (!d.editing) {
          setFormData((fd) => ({ ...fd, ...(d.formData || {}) }));
          setStep(typeof d.step === "number" ? d.step : 0);
          if (d.avatarDataUrl) {
            setAvatarDataUrl(d.avatarDataUrl);
            setAvatarPreview(d.avatarDataUrl);
          }
        }
      } catch (e) {
        console.warn("Invalid draft", e);
      }
    }
    setIsDialogOpen(true);
  };

  const saveDraft = () => {
    try {
      const payload = {
        editing: !!editingStudent,
        formData,
        step,
        avatarDataUrl,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save draft", e);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      classId: student.classId || "",
      rollNumber: student.rollNumber || "",
      dateOfBirth: student.dateOfBirth || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      address: student.address || "",
    });
    setAvatarPreview(student.avatar || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await studentApi.deleteStudent(studentId);
      toast.success("Student deleted");
      loadStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    loadStudentFeeTotals(student.id);
  };

  const goToIdCard = (student: Student) => {
    navigate(`/students/${encodeURIComponent(student.id)}/id-card`);
  };

  const closeProfile = () => setSelectedStudent(null);

  const toggleStatus = async (student: Student) => {
    try {
      const current = student.status || "active";
      const newStatus =
        current.toLowerCase() === "active" ? "inactive" : "active";
      await studentApi.updateStudent(student.id, { status: newStatus });
      setSelectedStudent({ ...student, status: newStatus });
      await loadStudents();
      toast.success("Status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof (e as any).preventDefault === "function")
      (e as any).preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email?.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.classId?.trim()) {
      toast.error("Class is required");
      return;
    }
    if (!formData.rollNumber?.trim()) {
      toast.error("Roll Number is required");
      return;
    }
    if (!formData.dateOfBirth?.trim()) {
      toast.error("Date of Birth is required");
      return;
    }
    if (!formData.guardianName?.trim()) {
      toast.error("Guardian Name is required");
      return;
    }
    if (!formData.guardianPhone?.trim()) {
      toast.error("Guardian Phone is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // If there's an avatar file or data URL, upload it first and get a public URL
      let avatarUrl: string | undefined = undefined;
      if (avatarFile) {
        try {
          const res = await uploadFile(avatarFile);
          avatarUrl = (res && (res.publicUrl || (res as any).url)) || undefined;
        } catch (err) {
          console.error("Avatar upload failed:", err);
          toast.error("Avatar upload failed");
        }
      } else if (avatarDataUrl && avatarDataUrl.startsWith("data:")) {
        try {
          const f = dataUrlToFile(avatarDataUrl);
          const res = await uploadFile(f as File);
          avatarUrl = (res && (res.publicUrl || (res as any).url)) || undefined;
        } catch (err) {
          console.error("Avatar upload failed:", err);
          toast.error("Avatar upload failed");
        }
      }
      // Build clean payload with only allowed fields
      const studentData = {
        name: formData.name,
        email: formData.email,
        classId: formData.classId,
        rollNumber: formData.rollNumber,
        dateOfBirth: formData.dateOfBirth,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        address: formData.address || undefined,
        avatar: avatarUrl || avatarDataUrl || undefined,
        enrollmentDate:
          editingStudent?.enrollmentDate || new Date().toISOString(),
        studentCode:
          editingStudent?.studentCode ||
          generateStudentCode(
            new Set(
              students.map((s) => s.studentCode).filter(Boolean) as string[],
            ),
          ),
      };

      if (editingStudent) {
        // Update existing student
        await studentApi.updateStudent(editingStudent.id, studentData);
        toast.success("Student updated!");
      } else {
        // Create new student
        const response = await studentApi.createStudent(studentData);
        toast.success(`Student added — Student ID: ${response.studentCode || response.id}`);
      }

      clearDraft();
      setIsDialogOpen(false);
      resetForm();
      await loadStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.rollNumber || "").toLowerCase().includes(q) ||
      (s.studentCode || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student profiles and records</p>
        </div>
        <Button onClick={openAddDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          // prevent accidental close while submitting
          if (!open && isSubmitting) return;
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="relative">
          <DialogDescription className="sr-only">
            Student form dialog
          </DialogDescription>
          {isSubmitting && (
            <div className="absolute inset-0 z-50 bg-white/70 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-4 border-t-transparent border-primary animate-spin" />
                <div className="text-sm font-medium">
                  {editingStudent ? "Updating student..." : "Adding student..."}
                </div>
              </div>
            </div>
          )}
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToStep(0)}
                className={`px-3 py-1 rounded ${
                  step === 0 ? "bg-primary text-white" : "bg-muted/20"
                }`}
              >
                1. Bio
              </button>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className={`px-3 py-1 rounded ${
                  step === 1 ? "bg-primary text-white" : "bg-muted/20"
                }`}
              >
                2. Review
              </button>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={`px-3 py-1 rounded ${
                  step === 2 ? "bg-primary text-white" : "bg-muted/20"
                }`}
              >
                3. Photo
              </button>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Roll Number</Label>
                    <Input
                      value={formData.rollNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Class</Label>
                    <Select
                      value={formData.classId || undefined}
                      onValueChange={(v: string) =>
                        setFormData({ ...formData, classId: v })
                      }
                    >
                      <SelectTrigger className="w-full" />
                      <SelectContent>
                        <SelectItem value="__none" disabled>
                          Select a class
                        </SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.code}) - {cls.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Guardian Name</Label>
                    <Input
                      value={formData.guardianName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guardianName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Guardian Phone</Label>
                    <Input
                      value={formData.guardianPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guardianPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="w-full max-w-2xl bg-card p-4 rounded">
                <h3 className="text-lg font-medium mb-2">Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Full name
                    </div>
                    <div className="font-medium">{formData.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{formData.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Roll</div>
                    <div className="font-medium">
                      {formData.rollNumber || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Class</div>
                    <div className="font-medium">{formData.classId || "—"}</div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="w-full flex justify-center py-6">
                <div className="w-full max-w-md bg-card p-6 rounded-xl shadow-md text-center">
                  <div className="mx-auto w-36 h-36 rounded-full overflow-hidden mb-4 border border-muted/20 flex items-center justify-center bg-muted/5">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">No photo</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="avatar"
                      className="inline-flex items-center px-3 py-2 bg-primary/95 hover:bg-primary rounded-lg text-sm text-white cursor-pointer shadow-sm"
                    >
                      {avatarPreview ? "Replace" : "Upload"}
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleAvatarChange(e.target.files?.[0] || null)
                      }
                    />
                  </div>

                  {avatarPreview && (
                    <div className="mb-2 text-xs text-muted-foreground">
                      {avatarFile?.name} ·{" "}
                      {avatarFile ? Math.round(avatarFile.size / 1024) : "—"} KB
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground">
                      {formData.name || "Unnamed Student"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formData.email}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      A clear headshot is recommended. You can add or change
                      this later from the student's profile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!editingStudent && (
                  <>
                    <Button variant="outline" size="sm" onClick={saveDraft}>
                      Save Draft
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        clearDraft();
                        resetForm();
                      }}
                    >
                      Clear Draft
                    </Button>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {step > 0 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => goToStep(step - 1)}
                  >
                    Back
                  </Button>
                )}

                {step < 2 ? (
                  <Button type="button" onClick={() => goToStep(step + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit()}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingStudent
                        ? "Update Student"
                        : "Add Student"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Tilt>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, code, email, or roll number..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.studentCode || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {student.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={student.avatar}
                                  alt={`${student.name} avatar`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <AvatarFallback>
                                  {student.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p>{student.name}</p>
                              <p className="text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>
                          {classes.find((c) => c.id === student.classId)
                            ?.grade ||
                            student.classId ||
                            "—"}
                        </TableCell>
                        <TableCell>{student.guardianName}</TableCell>
                        <TableCell>{student.guardianPhone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(student)}
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => goToIdCard(student)}
                              title="View ID Card"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(student)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(student.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Tilt>
        </div>

        <div className="hidden lg:block">
          {selectedStudent ? (
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Avatar>
                    {selectedStudent.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedStudent.avatar}
                        alt={`${selectedStudent.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        {selectedStudent.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {selectedStudent.name}
                      </h3>
                      <Badge
                        variant={
                          statusIsActive(selectedStudent.status)
                            ? "success"
                            : "danger"
                        }
                      >
                        {selectedStudent.status || "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.studentCode}
                    </p>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={
                          statusIsActive(selectedStudent.status)
                            ? "success"
                            : "danger"
                        }
                      >
                        {selectedStudent.status || "Active"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Class</span>
                      <span className="font-medium">
                        {selectedStudent.classId || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Roll No.</span>
                      <span className="font-medium">
                        {selectedStudent.rollNumber || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">
                        {selectedStudent.email || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Guardian</span>
                      <span className="font-medium">
                        {selectedStudent.guardianName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contact</span>
                      <span className="font-medium">
                        {selectedStudent.guardianPhone || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled</span>
                      <span className="font-medium">
                        {new Date(
                          selectedStudent.enrollmentDate || Date.now(),
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex justify-between pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleEdit(selectedStudent);
                      }}
                    >
                      Edit
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={closeProfile}>
                        Close
                      </Button>
                      <Button onClick={() => goToFees(selectedStudent)}>
                        Fees
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => goToRecords(selectedStudent)}
                      >
                        Records
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm">
                  Select a student to view profile and status.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Profile modal (opens when selectedStudent is set) */}
      <Dialog
        open={Boolean(selectedStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-36 h-36 rounded-full overflow-hidden border bg-muted/5">
                  {selectedStudent.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedStudent.avatar}
                      alt={`${selectedStudent.name} avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-3xl text-muted-foreground">
                      {selectedStudent.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-xl font-semibold">
                    {selectedStudent.name}
                  </h3>
                  <Badge
                    variant={
                      statusIsActive(selectedStudent.status)
                        ? "success"
                        : "danger"
                    }
                  >
                    {selectedStudent.status || "Active"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedStudent.studentCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <Badge
                      variant={
                        statusIsActive(selectedStudent.status)
                          ? "success"
                          : "danger"
                      }
                    >
                      {selectedStudent.status || "Active"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Class</div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-medium">
                      {selectedStudent.classId || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Roll No.</div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-medium">
                      {selectedStudent.rollNumber || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Enrolled</div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-medium">
                      {new Date(
                        selectedStudent.enrollmentDate || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="mt-1">
                    <a
                      className="text-sm text-primary hover:underline"
                      href={`mailto:${selectedStudent.email || ""}`}
                    >
                      {selectedStudent.email || "-"}
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Guardian</div>
                  <div className="mt-1">
                    <span className="text-sm font-medium">
                      {selectedStudent.guardianName || "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Contact</div>
                  <div className="mt-1">
                    {selectedStudent.guardianPhone ? (
                      <a
                        className="text-sm text-primary hover:underline"
                        href={`tel:${selectedStudent.guardianPhone}`}
                      >
                        {selectedStudent.guardianPhone}
                      </a>
                    ) : (
                      <span className="text-sm font-medium">-</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setSelectedStudent(null);
                    goToFees(selectedStudent);
                  }}
                >
                  Fees
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStudent(null);
                    goToRecords(selectedStudent);
                  }}
                >
                  Records
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    window.location.href = `mailto:${
                      selectedStudent.email || ""
                    }`;
                  }}
                >
                  Email
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (selectedStudent.guardianPhone)
                      window.location.href = `tel:${selectedStudent.guardianPhone}`;
                  }}
                >
                  Call Guardian
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleStatus(selectedStudent)}
                >
                  Toggle Status
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedStudent(null);
                    handleEdit(selectedStudent);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { StudentsPage };
export default StudentsPage;

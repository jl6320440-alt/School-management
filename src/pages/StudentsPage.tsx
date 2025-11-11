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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as kv from "../utils/supabase/kv_store";
import { Student } from "../types";
import { toast } from "sonner";
import { supabase } from "../utils/supabase/client";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const previousPreviewRef = useRef<string | null>(null);
  const [step, setStep] = useState<number>(0); // 0=bio,1=review,2=photo

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

  const [selectedStudent, setSelectedStudent] = useState(null as Student | null);
  const navigate = useNavigate();

  const goToFees = (student: Student) => {
    navigate(`/fees?studentId=${encodeURIComponent(student.id)}`);
  };

  const goToRecords = (student: Student) => {
    navigate(`/students/${encodeURIComponent(student.id)}/records`);
  };

  useEffect(() => {
    loadStudents();
    return () => {
      if (previousPreviewRef.current)
        URL.revokeObjectURL(previousPreviewRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async () => {
    try {
      const studentsData = await kv.getByPrefix("student:");
      setStudents(studentsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    }
  };

  const generateStudentCode = (existingCodes: Set<string>) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const rand = () =>
      letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 50; i++) {
      const code = `${rand()}${rand()}${String(
        Math.floor(Math.random() * 1000)
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
  };

  const removeAvatar = () => {
    if (previousPreviewRef.current) {
      URL.revokeObjectURL(previousPreviewRef.current);
      previousPreviewRef.current = null;
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
      await kv.del(studentId);
      toast.success("Student deleted");
      loadStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
  };

  const closeProfile = () => setSelectedStudent(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof (e as any).preventDefault === "function")
      (e as any).preventDefault();

    // Photo is optional by user preference. We require bio to be complete (guarded earlier).
    setIsSubmitting(true);
    try {
      const studentId = editingStudent?.id || `student:${Date.now()}`;
      const baseStudent: Partial<Student> = {
        ...formData,
        id: studentId,
        enrollmentDate:
          editingStudent?.enrollmentDate || new Date().toISOString(),
      };

      let studentCode = editingStudent?.studentCode;
      if (!studentCode) {
        const existingCodes = new Set(
          students.map((s) => s.studentCode).filter(Boolean) as string[]
        );
        studentCode = generateStudentCode(existingCodes);
      }

      const student: Student = { ...(baseStudent as Student), studentCode };

      if (avatarFile) {
        try {
          const ext = (avatarFile.name.split(".").pop() || "jpg").toLowerCase();
          const safeId = String(studentId).replace(/[:\\/\\\s]/g, "-");
          const filePath = `avatars/${safeId}.${ext}`;
          const uploadRes = await supabase.storage
            .from("avatars")
            .upload(filePath, avatarFile, { upsert: true });
          if ((uploadRes as any).error) {
            console.warn("Avatar upload error", (uploadRes as any).error);
          } else {
            const publicRes = await supabase.storage
              .from("avatars")
              .getPublicUrl(filePath);
            const publicUrl = (publicRes as any).data?.publicUrl;
            if (publicUrl) student.avatar = publicUrl;
          }
        } catch (err) {
          console.warn("Failed to upload avatar", err);
        }
      }

      await kv.set(studentId, student);
      toast.success(editingStudent ? "Student updated!" : "Student added!");
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
      (s.rollNumber || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Students</h2>
        <div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
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
                      value={formData.classId}
                      onValueChange={(v: string) =>
                        setFormData({ ...formData, classId: v })
                      }
                    >
                      <SelectTrigger className="w-full" />
                      <SelectContent>
                        <SelectItem value="class-10a">Grade 10-A</SelectItem>
                        <SelectItem value="class-10b">Grade 10-B</SelectItem>
                        <SelectItem value="class-9a">Grade 9-A</SelectItem>
                        <SelectItem value="class-9b">Grade 9-B</SelectItem>
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
          </form>
        </DialogContent>
      </Dialog>

      <Tilt>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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
                            // show image when available
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
                    <TableCell>{student.classId}</TableCell>
                    <TableCell>{student.guardianName}</TableCell>
                    <TableCell>{student.guardianPhone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(student)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id)}
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
  );
};

export { StudentsPage };
export default StudentsPage;

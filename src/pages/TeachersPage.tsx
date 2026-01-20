import React, { useState, useEffect } from "react";
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
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  TrendingUp,
  BookOpen,
  X,
  Copy,
  Sparkles,
} from "lucide-react";
import * as teacherApi from "../utils/backend/teacherApi";
import { uploadFile } from "../utils/backend/api";
import { Teacher } from "../types";
import { toast } from "sonner";

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    subjects: "",
    classes: "",
    salary: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const prevAvatarUrlRef = React.useRef<string | null>(null);

  useEffect(() => {
    loadTeachers();
    return () => {
      if (prevAvatarUrlRef.current) {
        URL.revokeObjectURL(prevAvatarUrlRef.current);
        prevAvatarUrlRef.current = null;
      }
    };
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const teachersData = await teacherApi.listTeachers();
      // small delay for smooth skeleton transition
      await new Promise((r) => setTimeout(r, 300));
      const normalizedTeachers = teachersData.map(
        (teacher: { classes: any }) => ({
          ...teacher,
          classes: Array.isArray(teacher.classes)
            ? teacher.classes
            : teacher.classes
              ? [teacher.classes]
              : undefined,
        }),
      );
      setTeachers(normalizedTeachers);
    } catch (error) {
      console.error("Error loading teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payloadBase: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.phone || "changeme123",
        avatar: (formData as any).avatar || undefined,
        subjects: formData.subjects
          ? formData.subjects.split(",").map((s) => s.trim())
          : [],
        classes: formData.classes
          ? formData.classes.split(",").map((c) => c.trim())
          : [],
        salary: formData.salary ? Number(formData.salary) : undefined,
        gender: (formData as any).gender || undefined,
        dateOfBirth: (formData as any).dateOfBirth || undefined,
        address: (formData as any).address || undefined,
      };

      if (editingTeacher) {
        await teacherApi.updateTeacher(editingTeacher.id, payloadBase);
        toast.success("Teacher updated!");
      } else {
        const created = await teacherApi.createTeacher(payloadBase);
        const staff =
          created &&
          (created.staffId || (created as any).staffID || created.staff);
        toast.success(`Teacher added — Staff ID: ${staff || "(unknown)"}`);
      }

      setIsDialogOpen(false);
      resetForm();
      loadTeachers();
    } catch (error) {
      console.error("create/update teacher error:", error);
      let msg = "Failed to save teacher";
      if (error instanceof Error) {
        msg = error.message;
      } else if (typeof error === "string") {
        msg = error;
      } else if (error && typeof (error as any).message === "string") {
        msg = (error as any).message;
      }
      toast.error(msg);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      avatar: (teacher as any).avatar || "",
      subjects: (teacher.subjects || []).join(", "),
      classes: (teacher.classes || []).join(", "),
      salary: (teacher.salary || 0).toString(),
      gender: (teacher as any).gender || "",
      dateOfBirth: (teacher as any).dateOfBirth
        ? new Date((teacher as any).dateOfBirth).toISOString().slice(0, 10)
        : "",
      address: (teacher as any).address || "",
    });
    // set preview to current avatar URL if available
    setAvatarPreview((teacher as any).avatar || null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      avatar: "",
      subjects: "",
      classes: "",
      salary: "",
      gender: "",
      dateOfBirth: "",
      address: "",
    });
    if (prevAvatarUrlRef.current) {
      URL.revokeObjectURL(prevAvatarUrlRef.current);
      prevAvatarUrlRef.current = null;
    }
    setAvatarPreview(null);
    setAvatarUploading(false);
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(term) ||
      teacher.email.toLowerCase().includes(term) ||
      (teacher.staffId || "").toLowerCase().includes(term) ||
      (teacher.subjects || []).some((s) => s.toLowerCase().includes(term))
    );
  });

  function handleDelete(id: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                Teachers
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage teacher profiles and assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  className="pl-9 pr-3 w-64 bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:scale-105 transition-transform"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Teacher
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4 bg-white/20 backdrop-blur-md border border-white/30 shadow-md hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <h3 className="text-2xl font-bold mt-1">{teachers.length}</h3>
              </div>
              <div className="bg-white/30 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 bg-white/20 backdrop-blur-md border border-white/30 shadow-md hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₵
                  {teachers.length > 0
                    ? Math.round(
                        teachers.reduce((sum, t) => sum + (t.salary || 0), 0) /
                          teachers.length,
                      )
                    : 0}
                </h3>
              </div>
              <div className="bg-white/30 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 bg-white/20 backdrop-blur-md border border-white/30 shadow-md hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₵
                  {teachers
                    .reduce((sum, t) => sum + (t.salary || 0), 0)
                    .toLocaleString()}
                </h3>
              </div>
              <div className="bg-white/30 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading
              ? [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="rounded-xl p-4 bg-white/12 backdrop-blur-md border border-white/10 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 skeleton" />
                      <div className="flex-1">
                        <div className="h-4 w-48 skeleton mb-2" />
                        <div className="h-3 w-36 skeleton" />
                      </div>
                      <div className="w-24 text-right">
                        <div className="h-4 w-20 skeleton ml-auto" />
                      </div>
                    </div>
                  </div>
                ))
              : filteredTeachers.map((teacher, idx) => (
                  <div
                    key={teacher.id}
                    className="rounded-xl p-4 bg-white/20 backdrop-blur-md border border-white/25 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between animate-fade-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setProfileOpen(true);
                      }}
                    >
                      <Avatar className="w-14 h-14 ring-2 ring-white/60">
                        {teacher.avatar ? (
                          <img
                            src={teacher.avatar}
                            alt={`Avatar of ${teacher.name}`}
                            className="object-cover w-full h-full rounded-full"
                          />
                        ) : (
                          <AvatarFallback>
                            {(teacher.name || "").charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800 text-lg">
                            {teacher.name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            • {teacher.email}
                          </span>
                          <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">
                            {teacher.staffId}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />{" "}
                            <span>{teacher.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />{" "}
                            <span className="capitalize">
                              {(teacher.classes || []).slice(0, 2).join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <div className="text-sm text-muted-foreground">
                          Salary
                        </div>
                        <div className="font-semibold">
                          ₵{(teacher.salary || 0).toLocaleString()}/mo
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(teacher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        {/* Add / Edit Teacher Dialog (controlled) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add Teacher"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher
                  ? "Update teacher profile and assignments."
                  : "Create a new teacher account."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
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
              </div>

              {/* Picture upload moved to bottom of the form - uploads local file as data URL */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Salary (GHS)</Label>
                  <Input
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <Input
                    value={(formData as any).gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={(formData as any).dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={(formData as any).address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Subjects (comma separated)</Label>
                <Input
                  value={formData.subjects}
                  onChange={(e) =>
                    setFormData({ ...formData, subjects: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Classes (comma separated)</Label>
                <Input
                  value={formData.classes}
                  onChange={(e) =>
                    setFormData({ ...formData, classes: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Picture (upload from device)</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      const MAX_BYTES = 5 * 1024 * 1024; // 5MB
                      if (f.size > MAX_BYTES) {
                        toast.error("Image too large (max 5MB)");
                        return;
                      }
                      // preview via object URL
                      if (prevAvatarUrlRef.current) {
                        URL.revokeObjectURL(prevAvatarUrlRef.current);
                        prevAvatarUrlRef.current = null;
                      }
                      const url = URL.createObjectURL(f);
                      prevAvatarUrlRef.current = url;
                      setAvatarPreview(url);

                      // upload immediately
                      try {
                        setAvatarUploading(true);
                        const result = await uploadFile(f);
                        if (
                          result &&
                          (result.publicUrl || (result as any).url)
                        ) {
                          const publicUrl =
                            result.publicUrl || (result as any).url;
                          setFormData({ ...formData, avatar: publicUrl });
                          toast.success("Image uploaded");
                        } else {
                          toast.error("Upload failed");
                        }
                      } catch (err) {
                        console.error("Upload error:", err);
                        toast.error("Upload failed");
                      } finally {
                        setAvatarUploading(false);
                      }
                    }}
                  />

                  <div className="flex items-center gap-2">
                    {(avatarPreview || (formData as any).avatar) && (
                      <img
                        src={avatarPreview || (formData as any).avatar}
                        alt="preview"
                        className="w-14 h-14 object-cover rounded-md border"
                      />
                    )}
                    {avatarUploading && (
                      <div className="text-sm text-muted-foreground">
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeacher ? "Save Changes" : "Create Teacher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Profile Dialog */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="w-full max-w-md sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-start justify-between w-full">
                <div>
                  <DialogTitle>Teacher Profile</DialogTitle>
                  <DialogDescription>
                    Full profile and actions
                  </DialogDescription>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setProfileOpen(false)}
                    aria-label="Close profile"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            {selectedTeacher ? (
              <div className="mt-1">
                <div className="bg-white/60 backdrop-blur-sm p-3 rounded-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 w-full">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="rounded-md bg-gradient-to-br from-indigo-50 to-white p-2">
                          <Avatar className="w-24 h-24 md:w-20 md:h-20 shadow-sm">
                            {selectedTeacher.avatar ? (
                              <img
                                src={selectedTeacher.avatar}
                                alt={selectedTeacher.name}
                                className="object-cover w-full h-full rounded-full"
                              />
                            ) : (
                              <AvatarFallback>
                                {selectedTeacher.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm md:text-base font-semibold truncate">
                            {selectedTeacher.name}
                          </h3>
                          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                            {selectedTeacher.staffId}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  selectedTeacher.staffId || "",
                                );
                                toast.success("Staff ID copied");
                              } catch (e) {
                                toast.error("Copy failed");
                              }
                            }}
                            aria-label="Copy staff id"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Sparkles className="h-4 w-4 text-amber-400 ml-1" />
                        </div>

                        <div className="mt-2 text-sm text-muted-foreground flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />{" "}
                            <span className="truncate">
                              {selectedTeacher.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />{" "}
                            <span className="truncate">
                              {selectedTeacher.phone || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center">
                      <Button
                        size="sm"
                        onClick={() => {
                          setProfileOpen(false);
                          setEditingTeacher(selectedTeacher);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleDelete(selectedTeacher.id);
                          setProfileOpen(false);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-slate-700 mb-2">
                        Subjects
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTeacher.subjects || []).length ? (
                          (selectedTeacher.subjects || []).map((s, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-slate-100 rounded"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No subjects assigned
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-slate-700 mb-2">
                        Classes
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTeacher.classes || []).length ? (
                          (selectedTeacher.classes || []).map((c, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-slate-100 rounded"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No classes assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeachersPage;

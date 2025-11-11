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
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import * as kv from "../utils/supabase/kv_store";
import { Teacher } from "../types";
import { toast } from "sonner";

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subjects: "",
    classes: "",
    salary: "",
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const teachersData = await kv.getByPrefix("teacher:");
      setTeachers(teachersData);
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const teacherId = editingTeacher?.id || `teacher:${Date.now()}`;
      const teacher: Teacher = {
        ...formData,
        id: teacherId,
        subjects: formData.subjects.split(",").map((s) => s.trim()),
        classes: formData.classes.split(",").map((c) => c.trim()),
        salary: parseInt(formData.salary),
        joiningDate: editingTeacher?.joiningDate || new Date().toISOString(),
      };

      await kv.set(teacherId, teacher);
      toast.success(editingTeacher ? "Teacher updated!" : "Teacher added!");
      setIsDialogOpen(false);
      resetForm();
      loadTeachers();
    } catch (error) {
      toast.error("Failed to save teacher");
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      try {
        await kv.del(teacherId);
        toast.success("Teacher deleted!");
        loadTeachers();
      } catch (error) {
        toast.error("Failed to delete teacher");
      }
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subjects: teacher.subjects.join(", "),
      classes: teacher.classes.join(", "),
      salary: teacher.salary.toString(),
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subjects: "",
      classes: "",
      salary: "",
    });
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Teachers</h1>
          <p className="text-muted-foreground mt-2">
            Manage teacher profiles and assignments
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open: boolean) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher
                  ? "Update teacher information below."
                  : "Fill in the details to add a new teacher."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Salary (₵)</Label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Subjects (comma-separated)</Label>
                  <Input
                    value={formData.subjects}
                    onChange={(e) =>
                      setFormData({ ...formData, subjects: e.target.value })
                    }
                    placeholder="e.g., Mathematics, Physics"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Classes (comma-separated)</Label>
                  <Input
                    value={formData.classes}
                    onChange={(e) =>
                      setFormData({ ...formData, classes: e.target.value })
                    }
                    placeholder="e.g., class-10a, class-10b"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeacher ? "Update" : "Add"} Teacher
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Tilt>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground">Total Teachers</p>
                <h3 className="mt-2">{teachers.length}</h3>
              </div>
            </CardContent>
          </Card>
        </Tilt>
        <Tilt>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground">Average Salary</p>
                <h3 className="mt-2">
                  ₵{teachers.length > 0
                    ? Math.round(
                        teachers.reduce((sum, t) => sum + t.salary, 0) /
                          teachers.length
                      )
                    : 0}
                </h3>
              </div>
            </CardContent>
          </Card>
        </Tilt>
        <Tilt>
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-muted-foreground">Total Payroll</p>
                <h3 className="mt-2">₵{teachers
                    .reduce((sum, t) => sum + t.salary, 0)
                    .toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </Tilt>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
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
                <TableHead>Teacher</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {teacher.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{teacher.name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{teacher.phone}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((cls, idx) => (
                        <Badge key={idx}>{cls}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>₵{teacher.salary.toLocaleString()}/mo</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(teacher)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(teacher.id)}
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
    </div>
  );
};

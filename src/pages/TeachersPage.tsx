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
  BookOpen,
  X,
} from "lucide-react";
import * as teacherApi from "../utils/backend/teacherApi";
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
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const teachersData = await teacherApi.listTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teacherApi.updateTeacher(editingTeacher.id, {
          ...formData,
          subjects: formData.subjects.split(",").map((s) => s.trim()),
          // classes: formData.classes.split(",").map((c) => c.trim()),
        });
        toast.success("Teacher updated!");
      } else {
        await teacherApi.createTeacher({
          ...formData,
          password: formData.phone || "changeme123", // fallback password
          subjects: formData.subjects.split(",").map((s) => s.trim()),
          // classes: formData.classes.split(",").map((c) => c.trim()),
        });
        toast.success("Teacher added!");
      }
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
        await teacherApi.deleteTeacher(teacherId);
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
      phone: teacher.phone || '',
      subjects: (teacher.subjects || []).join(", "),
      classes: (teacher.classes || []).join(", "),
      salary: (teacher.salary || 0).toString(),
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
      (teacher.subjects || []).some((s) =>
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
            <DialogDescription className="sr-only">Teacher form dialog</DialogDescription>
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
                  <Label>Classes (select one or more)</Label>
                  <select
                    multiple
                    className="w-full border rounded px-2 py-2"
                    value={formData.classes ? formData.classes.split(',').map(s => s.trim()) : []}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setFormData({ ...formData, classes: selected.join(', ') });
                    }}
                    required
                  >
                    <option value="creche">Creche</option>
                    <option value="nursery-1">Nursery 1</option>
                    <option value="nursery-2">Nursery 2</option>
                    <option value="kg1">KG1</option>
                    <option value="kg2">KG2</option>
                    <option value="grade-1">Grade 1</option>
                    <option value="grade-2">Grade 2</option>
                    <option value="grade-3">Grade 3</option>
                    <option value="grade-4">Grade 4</option>
                    <option value="grade-5">Grade 5</option>
                    <option value="grade-6">Grade 6</option>
                    <option value="grade-7">Grade 7</option>
                    <option value="grade-8">Grade 8</option>
                    <option value="grade-9">Grade 9</option>
                  </select>
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
                  ₵
                  {teachers.length > 0
                    ? Math.round(
                        teachers.reduce((sum, t) => sum + (t.salary || 0), 0) /
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
                <h3 className="mt-2">
                  ₵
                  {teachers
                    .reduce((sum, t) => sum + (t.salary || 0), 0)
                    .toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
        </Tilt>
      </div>

      {/* Outstanding Teacher Profile Modal */}
      <Dialog
        open={!!selectedTeacher}
        onOpenChange={(open) => !open && setSelectedTeacher(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogDescription className="sr-only">Teacher profile dialog</DialogDescription>
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSelectedTeacher(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedTeacher.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${selectedTeacher.email}`}
                      className="hover:underline"
                    >
                      {selectedTeacher.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${selectedTeacher.phone}`}
                      className="hover:underline"
                    >
                      {selectedTeacher.phone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Subjects</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedTeacher.subjects || []).map((s, i) => (
                      <Badge key={i} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Classes</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedTeacher.classes || []).map((c, i) => (
                      <Badge key={i}>{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Salary</div>
                  <div className="font-semibold mt-1">
                    ₵{(selectedTeacher.salary || 0).toLocaleString()}/mo
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Joined</div>
                  <div className="mt-1">
                    {selectedTeacher.joiningDate
                      ? new Date(
                          selectedTeacher.joiningDate
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button asChild variant="outline">
                  <a href={`mailto:${selectedTeacher.email}`}>Email</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${selectedTeacher.phone}`}>Call</a>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(selectedTeacher)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedTeacher.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {teacher.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="group-hover:underline font-medium">
                          {teacher.name}
                        </p>
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
                      {(teacher.subjects || []).map((subject, idx) => (
                        <Badge key={idx} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(teacher.classes || []).map((cls, idx) => (
                        <Badge key={idx}>{cls}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>₵{(teacher.salary || 0).toLocaleString()}/mo</TableCell>
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

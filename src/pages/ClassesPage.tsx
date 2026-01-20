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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Archive,
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Filter,
  X,
  FileText,
} from "lucide-react";
import * as classApi from "../utils/backend/classApi";
import * as teacherApi from "../utils/backend/teacherApi";
import { Class, Teacher } from "../types";
import { toast } from "sonner";

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "active" as "active" | "archived" | "all",
    grade: "all",
    subject: "all",
    teacherId: "all",
  });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    grade: "",
    subject: "",
    teacherId: "",
    capacity: 30,
    location: "",
    schedule: [] as Array<{ day: string; startTime: string; endTime: string }>,
  });

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, [filters]);

  const loadClasses = async () => {
    try {
      const apiFilters: any = {};
      if (filters.status !== "all") apiFilters.status = filters.status;
      if (filters.grade !== "all") apiFilters.grade = filters.grade;
      if (filters.subject !== "all") apiFilters.subject = filters.subject;
      if (filters.teacherId !== "all") apiFilters.teacherId = filters.teacherId;

      const data = await classApi.listClasses(apiFilters);
      setClasses(data);
    } catch (error) {
      console.error("Failed to load classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherApi.listTeachers();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      grade: "",
      subject: "",
      teacherId: "none",
      capacity: 30,
      location: "",
      schedule: [],
    });
    setEditingClass(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Class name and code are required");
      return;
    }

    setIsLoading(true);
    try {
      const classData = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        grade: formData.grade,
        subject: formData.subject,
        teacherId:
          formData.teacherId === "none"
            ? undefined
            : formData.teacherId || undefined,
        capacity: formData.capacity,
        location: formData.location.trim() || undefined,
        schedule: formData.schedule,
      };

      if (editingClass) {
        await classApi.updateClass(editingClass.id, classData);
        toast.success("Class updated successfully");
      } else {
        await classApi.createClass(classData);
        toast.success("Class created successfully");
      }

      await loadClasses();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save class:", error);
      toast.error(
        editingClass ? "Failed to update class" : "Failed to create class"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      code: cls.code,
      grade: cls.grade,
      subject: cls.subject,
      teacherId: cls.teacher?._id || "none",
      capacity: cls.capacity,
      location: cls.location || "",
      schedule: cls.schedule || [],
    });
    setIsDialogOpen(true);
  };

  const handleView = (cls: Class) => {
    setSelectedClass(cls);
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "archived" : "active";
    const action = newStatus === "archived" ? "archive" : "unarchive";

    if (!confirm(`Are you sure you want to ${action} this class?`)) return;

    try {
      await classApi.updateClass(id, { status: newStatus });
      toast.success(`Class ${action}d successfully`);
      await loadClasses();
    } catch (error) {
      console.error(`Failed to ${action} class:`, error);
      toast.error(`Failed to ${action} class`);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this class? This action cannot be undone."
      )
    )
      return;

    try {
      await classApi.deleteClass(id);
      toast.success("Class deleted successfully");
      await loadClasses();
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast.error("Failed to delete class");
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const addScheduleItem = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { day: "", startTime: "", endTime: "" }],
    });
  };

  const updateScheduleItem = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeScheduleItem = (index: number) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index),
    });
  };

  const clearFilters = () => {
    setFilters({
      status: "active",
      grade: "all",
      subject: "all",
      teacherId: "all",
    });
  };

  const uniqueGrades = [...new Set(classes.map((cls) => cls.grade))];
  const uniqueSubjects = [...new Set(classes.map((cls) => cls.subject))];

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage classes, subjects, and schedules
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto w-full mx-2 sm:mx-0">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? "Edit Class" : "Add New Class"}
                </DialogTitle>
                <DialogDescription>
                  {editingClass
                    ? "Update the class information below."
                    : "Fill in the details to create a new class."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Mathematics 101"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Class Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g., MATH101"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Grade *</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) =>
                        setFormData({ ...formData, grade: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kindergarten">
                          Kindergarten
                        </SelectItem>
                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                        <SelectItem value="Grade 7">Grade 7</SelectItem>
                        <SelectItem value="Grade 8">Grade 8</SelectItem>
                        <SelectItem value="Grade 9">Grade 9</SelectItem>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subject: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Computer Science">
                          Computer Science
                        </SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Physical Education">
                          Physical Education
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teacherId: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          No teacher assigned
                        </SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 30,
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Room 101"
                  />
                </div>
                <div>
                  <Label>Schedule</Label>
                  <div className="space-y-2">
                    {formData.schedule.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Select
                          value={item.day}
                          onValueChange={(value) =>
                            updateScheduleItem(index, "day", value)
                          }
                        >
                          <SelectTrigger className="w-32">
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monday">Mon</SelectItem>
                            <SelectItem value="Tuesday">Tue</SelectItem>
                            <SelectItem value="Wednesday">Wed</SelectItem>
                            <SelectItem value="Thursday">Thu</SelectItem>
                            <SelectItem value="Friday">Fri</SelectItem>
                            <SelectItem value="Saturday">Sat</SelectItem>
                            <SelectItem value="Sunday">Sun</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={item.startTime}
                          onChange={(e) =>
                            updateScheduleItem(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={item.endTime}
                          onChange={(e) =>
                            updateScheduleItem(index, "endTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScheduleItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addScheduleItem}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Schedule
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? "Saving..."
                      : editingClass
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value: "active" | "archived" | "all") =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="w-full"></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grade</Label>
              <Select
                value={filters.grade}
                onValueChange={(value) =>
                  setFilters({ ...filters, grade: value })
                }
              >
                <SelectTrigger className="w-full"></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select
                value={filters.subject}
                onValueChange={(value) =>
                  setFilters({ ...filters, subject: value })
                }
              >
                <SelectTrigger className="w-full"></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Teacher</Label>
              <Select
                value={filters.teacherId}
                onValueChange={(value) =>
                  setFilters({ ...filters, teacherId: value })
                }
              >
                <SelectTrigger className="w-full">
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{cls.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cls.code}</Badge>
                  </TableCell>
                  <TableCell>{cls.grade}</TableCell>
                  <TableCell>{cls.subject}</TableCell>
                  <TableCell>
                    {cls.teacher ? (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{cls.teacher.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No teacher</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {cls.studentCount}/{cls.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {cls.schedule && cls.schedule.length > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {cls.schedule.length} session
                          {cls.schedule.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No schedule</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        cls.status === "active" ? "default" : "secondary"
                      }
                    >
                      {cls.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(cls)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cls)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(cls.id, cls.status)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cls.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClasses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || Object.values(filters).some((v) => v)
                  ? "No classes found matching your criteria."
                  : "No classes created yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Details Modal */}
      {selectedClass && (
        <Dialog
          open={!!selectedClass}
          onOpenChange={() => setSelectedClass(null)}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedClass.name}</DialogTitle>
              <DialogDescription>
                Class details and management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedClass.studentCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Students
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedClass.capacity}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Capacity
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {selectedClass.schedule?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sessions
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge
                      variant={
                        selectedClass.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedClass.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              {selectedClass.schedule && selectedClass.schedule.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedClass.schedule.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="font-medium">{item.day}</span>
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {selectedClass.location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedClass.location}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tabs for Students, Assignments, etc. */}
              <div className="border-t pt-6">
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Students ({selectedClass.studentCount})
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assignments
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Attendance
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Grades
                  </Button>
                </div>
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-center">
                    Detailed views for Students, Assignments, Attendance, and
                    Grades will be implemented in future updates.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../components/ui/select";
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import CediSign from "../components/icons/CediSign";
import * as feeApi from "../utils/backend/feeApi";
import * as studentApi from "../utils/backend/studentApi";
import { toast } from "sonner";
import { formatCurrency } from "../utils/formatCurrency";

interface Student {
  _id: string;
  id: string;
  name: string;
  email: string;
}

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<feeApi.Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<feeApi.Fee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    student: "",
    feeType: "tuition" as
      | "tuition"
      | "transport"
      | "uniform"
      | "books"
      | "activities"
      | "hostel"
      | "other",
    amount: "",
    dueDate: "",
    notes: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await loadStudents();
        await loadFees();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentApi.listStudents();
      const mapped = data.map((s: any) => ({
        _id: s._id,
        id: s.id || s._id,
        name: s.name,
        email: s.email,
      }));
      setStudents(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    }
  };

  const loadFees = async () => {
    try {
      const data = await feeApi.listFees();
      setFees(data);

      const collected = data
        .filter((f) => f.status === "paid")
        .reduce((sum, f) => sum + (f.paidAmount || 0), 0);

      const pending = data
        .filter((f) => f.status === "pending")
        .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

      const overdue = data
        .filter((f) => f.status === "overdue")
        .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

      setStats({
        totalCollected: collected,
        totalPending: pending,
        totalOverdue: overdue,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load fees");
    }
  };

  const resetForm = () => {
    setFormData({
      student: "",
      feeType: "tuition",
      amount: "",
      dueDate: "",
      notes: "",
    });
    setEditingFee(null);
  };

  const handleOpenDialog = (fee?: feeApi.Fee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        student: fee.studentId,
        feeType: fee.feeType,
        amount: fee.amount.toString(),
        dueDate: fee.dueDate.split("T")[0],
        notes: fee.notes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.student) {
        toast.error("Student is required");
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }
      if (!formData.dueDate) {
        toast.error("Due date is required");
        return;
      }

      const payload = {
        student: formData.student,
        feeType: formData.feeType,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined,
      };

      if (editingFee) {
        await feeApi.updateFee(editingFee._id, payload);
        toast.success("Fee updated successfully!");
      } else {
        await feeApi.createFee(payload);
        toast.success("Fee created successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
      await loadFees();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (feeId: string) => {
    if (!confirm("Are you sure you want to delete this fee?")) return;
    try {
      await feeApi.deleteFee(feeId);
      toast.success("Fee deleted successfully!");
      await loadFees();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete fee");
    }
  };

  const handleMarkAsPaid = async (fee: feeApi.Fee) => {
    try {
      await feeApi.updateFee(fee._id, {
        paidAmount: fee.amount,
        status: "paid" as const,
      });
      toast.success("Payment recorded!");
      await loadFees();
    } catch (err) {
      console.error(err);
      toast.error("Failed to record payment");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "partial":
        return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFeeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tuition: "Tuition",
      transport: "Transport",
      uniform: "Uniform",
      books: "Books",
      activities: "Activities",
      hostel: "Hostel",
      other: "Other",
    };
    return labels[type] || type;
  };

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Loading fees...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fee Management</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and manage student fees</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Fee
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Collected</p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {formatCurrency(stats.totalCollected)}
                    </h3>
                    <p className="text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Revenue</span>
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {formatCurrency(stats.totalPending)}
                    </h3>
                    <p className="text-yellow-600 mt-1">Awaiting Payment</p>
                  </div>
                  <CediSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <h3 className="mt-2 text-2xl font-bold">
                      {formatCurrency(stats.totalOverdue)}
                    </h3>
                    <p className="text-red-600 mt-1">Requires Action</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search student or fee type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                {/* Radix Select requires non-empty values for items; use 'all' sentinel to represent no filter */}
                <Select
                  value={statusFilter ?? "all"}
                  onValueChange={(v) => setStatusFilter(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-40">
                    <span>{statusFilter ? statusFilter : "All Status"}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No fees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFees.map((fee) => (
                      <TableRow key={fee._id}>
                        <TableCell className="font-medium">
                          {fee.studentName}
                        </TableCell>
                        <TableCell>{getFeeTypeLabel(fee.feeType)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(fee.amount)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(fee.paidAmount)}
                        </TableCell>
                        <TableCell>
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {fee.status !== "paid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(fee)}
                              >
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDialog(fee)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(fee._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit Fee Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogDescription className="sr-only">
                Fees dialog
              </DialogDescription>
              <DialogHeader>
                <DialogTitle>
                  {editingFee ? "Edit Fee" : "Add New Fee"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="student">Student *</Label>
                  <Select
                    value={formData.student}
                    onValueChange={(v) =>
                      setFormData({ ...formData, student: v })
                    }
                  >
                    <SelectTrigger>
                      <span>
                        {students.find((s) => s._id === formData.student)
                          ?.name || "Select Student"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name} ({s.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feeType">Fee Type *</Label>
                  <Select
                    value={formData.feeType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, feeType: v as any })
                    }
                  >
                    <SelectTrigger>
                      <span>{getFeeTypeLabel(formData.feeType)}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="uniform">Uniform</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="activities">Activities</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount (GHS) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    placeholder="Additional notes (optional)"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editingFee
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default FeesPage;

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
import { TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import CediSign from "../components/icons/CediSign";
import * as kv from "../utils/supabase/kv_store";
import { Fee } from "../types";
import { toast } from "sonner";
import { formatCurrency } from "../utils/formatCurrency";

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [student, setStudent] = useState<any | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get("studentId");
    if (sid) setStudentFilter(sid);
    loadFees(sid || null);
  }, []);

  const loadFees = async (forStudentId: string | null = null) => {
    try {
      const feesData = await kv.getByPrefix("fee:");
      const allFees = feesData || [];
      setFees(allFees);

      if (forStudentId) {
        // try to load student details
        try {
          const s = await kv.get(forStudentId);
          setStudent(s || null);
        } catch (e) {
          setStudent(null);
        }
      }

      const collected = (feesData || [])
        .filter((f: Fee) => f.status === "paid")
        .reduce((sum: number, f: Fee) => sum + (f.amount || 0), 0);

      const pending = (feesData || [])
        .filter((f: Fee) => f.status === "pending")
        .reduce((sum: number, f: Fee) => sum + (f.amount || 0), 0);

      const overdue = (feesData || [])
        .filter((f: Fee) => f.status === "overdue")
        .reduce((sum: number, f: Fee) => sum + (f.amount || 0), 0);


      setStats({
        totalCollected: collected,
        totalPending: pending,
        totalOverdue: overdue,
      });
    } catch (error) {
      console.error("Error loading fees:", error);
    }
  };

  const handlePayment = async (feeId: string) => {
    try {
      const fee = fees.find((f) => f.id === feeId);
      if (fee) {
        const updatedFee = {
          ...fee,
          status: "paid" as const,
          paidDate: new Date().toISOString(),
        };
        await kv.set(feeId, updatedFee);
        toast.success("Payment recorded successfully!");
        loadFees();
      }
    } catch (error) {
      toast.error("Failed to process payment");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // derive fees to show: if studentFilter present, show only that student's fees
  const feesToShow = studentFilter
    ? fees.filter((f) => f.studentId === studentFilter)
    : fees;

  const studentTotals = studentFilter
    ? feesToShow.reduce(
        (acc, f) => {
          acc.total = acc.total + (f.amount || 0);
          if (f.status === "paid") acc.paid = acc.paid + (f.amount || 0);
          if (f.status === "pending") acc.pending = acc.pending + (f.amount || 0);
          if (f.status === "overdue") acc.overdue = acc.overdue + (f.amount || 0);
          return acc;
        },
        { total: 0, paid: 0, pending: 0, overdue: 0 }
      )
    : null;

  return (
    <div className="space-y-6">
      {studentFilter && (
        <Card>
          <CardHeader>
            <CardTitle>Student Fee Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <h3 className="mt-1">{student?.name || studentFilter}</h3>
                <p className="text-sm text-muted-foreground">{student?.email || ""}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Owed</p>
                <h3 className="mt-1">{formatCurrency(studentTotals?.total || 0)}</h3>
                <p className="text-sm text-muted-foreground">Paid: {formatCurrency(studentTotals?.paid || 0)}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate(`/students/${encodeURIComponent(studentFilter)}`)}>View Profile</Button>
              <Button variant="outline" onClick={() => navigate(`/students/${encodeURIComponent(studentFilter)}/records`)}>View Records</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div>
        <h1>Fee Management</h1>
        <p className="text-muted-foreground mt-2">Track and manage student fees</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Collected</p>
                <h3 className="mt-2">{formatCurrency(stats.totalCollected)}</h3>
                <p className="text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+15%</span>
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
                <p className="text-muted-foreground">Pending</p>
                <h3 className="mt-2">{formatCurrency(stats.totalPending)}</h3>
              </div>
              <CediSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Overdue</p>
                <h3 className="mt-2">{formatCurrency(stats.totalOverdue)}</h3>
                <p className="text-red-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  <span>Urgent</span>
                </p>
              </div>
              <CediSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>{fee.studentId}</TableCell>
                  <TableCell>{fee.description}</TableCell>
                  <TableCell>{formatCurrency(fee.amount)}</TableCell>
                  <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{getStatusBadge(fee.status)}</TableCell>
                  <TableCell className="text-right">
                    {fee.status !== "paid" && (
                      <Button size="sm" onClick={() => handlePayment(fee.id)}>
                        Mark Paid
                      </Button>
                    )}
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

export default FeesPage;

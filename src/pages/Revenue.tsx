import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Revenue {
  id: string;
  amount: number;
  description: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  payment_date: string | null;
  payment_status: string;
  created_at: string;
  projects: {
    name: string;
    clients: {
      name: string;
      company: string;
    };
  };
}

export default function Revenue() {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    overdueRevenue: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from("revenue")
        .select(`
          *,
          projects (
            name,
            clients (
              name,
              company
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setRevenue(data || []);
      
      // Calculate stats
      const total = data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const paid = data?.filter(item => item.payment_status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const pending = data?.filter(item => item.payment_status === 'pending').reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const overdue = data?.filter(item => item.payment_status === 'overdue').reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      setStats({
        totalRevenue: total,
        paidRevenue: paid,
        pendingRevenue: pending,
        overdueRevenue: overdue
      });
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast({
        title: "Error",
        description: "Failed to fetch revenue data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Tracking</h1>
          <p className="text-muted-foreground">Manage and track project revenue</p>
        </div>
        <Button onClick={() => navigate("/revenue/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Revenue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.projects.name}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.projects.clients.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.projects.clients.company}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell>{item.invoice_number || "—"}</TableCell>
                  <TableCell>{formatDate(item.invoice_date)}</TableCell>
                  <TableCell>{formatDate(item.payment_date)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.payment_status)}>
                      {item.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/revenue/${item.id}`)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {revenue.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No revenue records found.</p>
              <Button
                onClick={() => navigate("/revenue/new")}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Revenue Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
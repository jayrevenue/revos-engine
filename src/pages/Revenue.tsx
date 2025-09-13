import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, DollarSign, TrendingUp, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Page from "@/components/layout/Page";
import { format } from "date-fns";

interface Revenue {
  id: string;
  amount: number;
  description: string;
  invoice_number: string;
  invoice_date: string;
  payment_date: string;
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

const Revenue = () => {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paidRevenue, setPaidRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      
      // Calculate totals
      const total = data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const paid = data?.filter(item => item.payment_status === 'paid')
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const pending = data?.filter(item => item.payment_status === 'pending')
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      setTotalRevenue(total);
      setPaidRevenue(paid);
      setPendingRevenue(pending);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("revenue")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Revenue record deleted successfully",
      });
      fetchRevenue();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Page title="Revenue Tracking">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="Revenue Tracking"
      description="Manage invoices and track payments"
      actions={
        <Button onClick={() => navigate("/revenue/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Revenue
        </Button>
      }
    >

      {/* Revenue Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue List */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Records</CardTitle>
          <CardDescription>
            Track all revenue and payment status for your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No revenue records found</h3>
              <p className="text-sm text-muted-foreground">Get started by adding your first revenue record.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revenue.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{item.projects.name}</h3>
                          <Badge className={getStatusColor(item.payment_status)}>
                            {item.payment_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.projects.clients.company} - {item.projects.clients.name}
                        </p>
                        {item.description && (
                          <p className="text-sm">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {item.invoice_number && (
                            <span>Invoice: {item.invoice_number}</span>
                          )}
                          {item.invoice_date && (
                            <span>Date: {format(new Date(item.invoice_date), 'MMM dd, yyyy')}</span>
                          )}
                          {item.payment_date && (
                            <span>Paid: {format(new Date(item.payment_date), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-2xl font-bold">${Number(item.amount).toLocaleString()}</p>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/revenue/${item.id}`)}
                          >
                            Edit
                          </Button>
                          {user && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default Revenue;

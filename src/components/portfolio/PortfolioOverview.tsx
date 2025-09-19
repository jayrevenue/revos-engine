import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Handshake,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Plus,
  Eye,
  Edit
} from "lucide-react";

// Mock data - would come from Supabase in real implementation
const portfolioItems = [
  {
    id: 1,
    type: "ip",
    title: "Revenue Science Framework",
    status: "active",
    value: 45000,
    progress: 85,
    lastUpdated: "2024-01-15",
    nextMilestone: "License to Tech Corp"
  },
  {
    id: 2,
    type: "equity",
    title: "SaaS Startup Partnership",
    status: "negotiating",
    value: 125000,
    progress: 60,
    lastUpdated: "2024-01-12",
    nextMilestone: "Contract signing"
  },
  {
    id: 3,
    type: "acquisition",
    title: "Digital Marketing Agency",
    status: "evaluating",
    value: 250000,
    progress: 30,
    lastUpdated: "2024-01-10",
    nextMilestone: "Due diligence"
  },
  {
    id: 4,
    type: "ip",
    title: "AI Consulting Methodology",
    status: "development",
    value: 75000,
    progress: 45,
    lastUpdated: "2024-01-08",
    nextMilestone: "First pilot client"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "negotiating":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "evaluating":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "development":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "ip":
      return <FileText className="h-4 w-4" />;
    case "equity":
      return <Handshake className="h-4 w-4" />;
    case "acquisition":
      return <ShoppingCart className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case "ip":
      return "IP Asset";
    case "equity":
      return "Equity Deal";
    case "acquisition":
      return "Acquisition";
    default:
      return "Unknown";
  }
};

export function PortfolioOverview() {
  const navigate = useNavigate();

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.value, 0);
  const activeItems = portfolioItems.filter(item => item.status === "active").length;

  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Items</p>
                <p className="text-2xl font-bold">{activeItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{portfolioItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button 
              onClick={() => navigate('/start')}
              className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Add New</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Portfolio Items</CardTitle>
            <Button variant="outline" onClick={() => navigate('/start')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    {/* Item Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{getTypeName(item.type)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>

                    {/* Value */}
                    <div>
                      <p className="font-semibold">${(item.value / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-muted-foreground">Value</p>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Next: {item.nextMilestone}</span>
                      <span className="ml-auto">Updated {item.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
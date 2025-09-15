import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Brush
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  ZoomIn,
  Download,
  Settings,
  Filter,
  Maximize2,
  ArrowLeft,
  Calendar,
  Target
} from 'lucide-react';

export interface ChartDataPoint {
  id: string;
  name: string;
  value: number;
  category?: string;
  date?: string;
  metadata?: any;
  children?: ChartDataPoint[];
}

interface InteractiveChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  chartType?: 'line' | 'area' | 'bar' | 'pie' | 'scatter';
  allowDrillDown?: boolean;
  showPrediction?: boolean;
  showBenchmark?: boolean;
  height?: number;
  colors?: string[];
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  onExport?: () => void;
  className?: string;
}

const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export const InteractiveChart = ({
  title,
  description,
  data,
  chartType = 'line',
  allowDrillDown = true,
  showPrediction = false,
  showBenchmark = false,
  height = 400,
  colors = DEFAULT_COLORS,
  onDataPointClick,
  onExport,
  className = ''
}: InteractiveChartProps) => {
  const [currentData, setCurrentData] = useState(data);
  const [drillPath, setDrillPath] = useState<ChartDataPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [chartView, setChartView] = useState(chartType);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['value']);

  // Process data based on time range and drill path
  const processedData = useMemo(() => {
    let workingData = currentData;

    // Filter by time range if date field exists
    if (selectedTimeRange !== 'all' && workingData.length > 0 && workingData[0].date) {
      const now = new Date();
      const days = parseInt(selectedTimeRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      workingData = workingData.filter(item => 
        item.date && new Date(item.date) >= cutoffDate
      );
    }

    return workingData;
  }, [currentData, selectedTimeRange]);

  // Generate prediction data
  const predictionData = useMemo(() => {
    if (!showPrediction || processedData.length === 0) return [];
    
    // Simple linear regression for prediction
    const lastPoints = processedData.slice(-5);
    if (lastPoints.length < 2) return [];

    const trend = (lastPoints[lastPoints.length - 1].value - lastPoints[0].value) / lastPoints.length;
    const lastValue = lastPoints[lastPoints.length - 1].value;
    
    return Array.from({ length: 5 }, (_, i) => ({
      id: `prediction-${i}`,
      name: `Forecast ${i + 1}`,
      value: lastValue + trend * (i + 1),
      isPrediction: true
    }));
  }, [processedData, showPrediction]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (processedData.length === 0) return null;

    const values = processedData.map(d => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      total,
      average,
      max,
      min,
      trendPercentage,
      count: values.length
    };
  }, [processedData]);

  const handleDataPointClick = (dataPoint: any) => {
    if (onDataPointClick) {
      onDataPointClick(dataPoint);
    }

    // Handle drill down
    if (allowDrillDown && dataPoint.children && dataPoint.children.length > 0) {
      setDrillPath(prev => [...prev, dataPoint]);
      setCurrentData(dataPoint.children);
    }
  };

  const handleDrillUp = (index?: number) => {
    if (index !== undefined) {
      // Drill to specific level
      const newPath = drillPath.slice(0, index + 1);
      setDrillPath(newPath);
      setCurrentData(newPath.length > 0 ? newPath[newPath.length - 1].children || [] : data);
    } else {
      // Drill up one level
      if (drillPath.length > 0) {
        const newPath = drillPath.slice(0, -1);
        setDrillPath(newPath);
        setCurrentData(newPath.length > 0 ? newPath[newPath.length - 1].children || [] : data);
      }
    }
  };

  const renderChart = () => {
    const chartData = [...processedData, ...predictionData];
    
    switch (chartView) {
      case 'line':
        return (
          <LineChart data={chartData} onClick={handleDataPointClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{label}</p>
                      {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                          {entry.dataKey}: {entry.value?.toLocaleString()}
                          {entry.payload?.isPrediction && ' (Predicted)'}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              strokeWidth={2}
              connectNulls={false}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {showPrediction && (
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: colors[0], strokeWidth: 2, r: 3 }}
                connectNulls={false}
              />
            )}
            {showBenchmark && (
              <ReferenceLine 
                y={statistics?.average || 0} 
                stroke="red" 
                strokeDasharray="5 5" 
                label="Average"
              />
            )}
            <Brush dataKey="name" height={30} stroke={colors[0]} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData} onClick={handleDataPointClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData} onClick={handleDataPointClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handleDataPointClick}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={processedData} onClick={handleDataPointClick}>
            <CartesianGrid />
            <XAxis type="number" dataKey="value" name="Value" />
            <YAxis type="number" dataKey="category" name="Category" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Data Points" data={processedData} fill={colors[0]} />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  const chartTypeIcons = {
    line: Activity,
    area: Activity,
    bar: BarChart3,
    pie: PieChartIcon,
    scatter: Target
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50 m-4' : ''} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {drillPath.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => handleDrillUp()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {title}
              {drillPath.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {drillPath.map((item, index) => (
                    <span key={item.id}>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-muted-foreground"
                        onClick={() => handleDrillUp(index)}
                      >
                        {item.name}
                      </Button>
                      {index < drillPath.length - 1 && ' > '}
                    </span>
                  ))}
                </div>
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {statistics && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={statistics.trendPercentage >= 0 ? "default" : "secondary"} className="flex items-center gap-1">
                  {statistics.trendPercentage >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(statistics.trendPercentage).toFixed(1)}%
                </Badge>
                <span className="text-muted-foreground">
                  Avg: {statistics.average.toLocaleString()}
                </span>
              </div>
            )}
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Chart Type Selector */}
          <Tabs value={chartView} onValueChange={(value) => setChartView(value as any)}>
            <TabsList>
              {Object.entries(chartTypeIcons).map(([type, Icon]) => (
                <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Main Chart */}
          <div style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Statistics Summary */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{statistics.total.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{statistics.average.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{statistics.max.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Peak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {statistics.trendPercentage >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  {Math.abs(statistics.trendPercentage).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Trend</div>
              </div>
            </div>
          )}

          {/* Drill-down hint */}
          {allowDrillDown && processedData.some(item => item.children) && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              <ZoomIn className="h-3 w-3 inline mr-1" />
              Click on data points to drill down for more details
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
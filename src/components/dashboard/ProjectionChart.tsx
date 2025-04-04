
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Projection } from "@/types/farm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface ProjectionChartProps {
  twoYearData: Projection[];
  fiveYearData: Projection[];
  tenYearData: Projection[];
  metricKey: keyof Projection;
  title: string;
  yAxisLabel: string;
}

export function ProjectionChart({ 
  twoYearData, 
  fiveYearData, 
  tenYearData, 
  metricKey, 
  title, 
  yAxisLabel 
}: ProjectionChartProps) {
  // Transform data for visualization
  const transformData = (projections: Projection[], key: keyof Projection) => {
    const current = projections.find(p => p.type === "current");
    const regenerative = projections.find(p => p.type === "regenerative");
    
    if (!current || !regenerative) return [];
    
    // Create yearly data points
    const data = [];
    const years = current.year;
    
    // Always include year 0 (current state)
    data.push({
      year: 0,
      current: 0,
      regenerative: 0
    });
    
    // Calculate yearly increments
    const currentIncrement = current[key] as number / years;
    const regenerativeIncrement = regenerative[key] as number / years;
    
    // Generate data for each year
    for (let i = 1; i <= years; i++) {
      data.push({
        year: i,
        current: Number((currentIncrement * i).toFixed(2)),
        regenerative: Number((regenerativeIncrement * i).toFixed(2))
      });
    }
    
    return data;
  };
  
  const twoYearChartData = transformData(twoYearData, metricKey);
  const fiveYearChartData = transformData(fiveYearData, metricKey);
  const tenYearChartData = transformData(tenYearData, metricKey);

  const chartConfig = {
    current: {
      label: "Current Practices",
      theme: {
        light: "#8B5E34",
        dark: "#A77B58"
      }
    },
    regenerative: {
      label: "Regenerative Practices",
      theme: {
        light: "#2D6A4F",
        dark: "#3A8A68"
      }
    }
  };

  const renderChart = (data: any[]) => (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis 
          dataKey="year" 
          label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} 
          axisLine={false} 
          tickLine={false}
        />
        <YAxis 
          label={{ 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle' } 
          }} 
          axisLine={false} 
          tickLine={false}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="current"
          name="Current Practices"
          stroke="var(--color-current)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="regenerative"
          name="Regenerative Practices"
          stroke="var(--color-regenerative)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-xl">{title} Projection</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="five">
          <TabsList className="mb-4">
            <TabsTrigger value="two">2 Year</TabsTrigger>
            <TabsTrigger value="five">5 Year</TabsTrigger>
            <TabsTrigger value="ten">10 Year</TabsTrigger>
          </TabsList>
          
          <TabsContent value="two">
            {renderChart(twoYearChartData)}
          </TabsContent>
          
          <TabsContent value="five">
            {renderChart(fiveYearChartData)}
          </TabsContent>
          
          <TabsContent value="ten">
            {renderChart(tenYearChartData)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

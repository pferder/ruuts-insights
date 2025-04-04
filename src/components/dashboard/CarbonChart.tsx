import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarbonData } from "@/types/farm";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CarbonChartProps {
  carbonData: CarbonData;
}

export function CarbonChart({ carbonData }: CarbonChartProps) {
  const data = [
    {
      name: "Emissions",
      current: carbonData.currentEmissions,
      potential: carbonData.potentialEmissions,
    },
    {
      name: "Capture",
      current: carbonData.currentCapture,
      potential: carbonData.potentialCapture,
    },
    {
      name: "Net Impact",
      current: carbonData.currentCapture - carbonData.currentEmissions,
      potential: carbonData.potentialCapture - carbonData.potentialEmissions,
    },
  ];

  const chartConfig = {
    current: {
      label: "Current Practices",
      theme: {
        light: "#8B5E34",
        dark: "#A77B58",
      },
    },
    potential: {
      label: "Regenerative Potential",
      theme: {
        light: "#2D6A4F",
        dark: "#3A8A68",
      },
    },
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-xl">Carbon Emissions & Capture</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[250px] md:h-[300px] w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                unit=" tons"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="current"
                name="Current Practices"
                fill="var(--color-current)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="potential"
                name="Regenerative Potential"
                fill="var(--color-potential)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

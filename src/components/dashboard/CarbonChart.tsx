
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarbonData } from "@/types/farm";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CarbonChartProps {
  carbonData: CarbonData;
}

export function CarbonChart({ carbonData }: CarbonChartProps) {
  const { t } = useTranslation();
  
  const data = [
    {
      name: t('dashboard.emissions'),
      current: carbonData.currentEmissions,
      potential: carbonData.potentialEmissions,
    },
    {
      name: t('dashboard.capture'),
      current: carbonData.currentCapture,
      potential: carbonData.potentialCapture,
    },
    {
      name: t('dashboard.netImpact'),
      current: carbonData.currentCapture - carbonData.currentEmissions,
      potential: carbonData.potentialCapture - carbonData.potentialEmissions,
    },
  ];

  const chartConfig = {
    current: {
      label: t('dashboard.currentPractices'),
      theme: {
        light: "#D9785F", // Cambiado a un color más brillante
        dark: "#FF9E80", 
      },
    },
    potential: {
      label: t('dashboard.regenerativePotential'),
      theme: {
        light: "#9AC168", // Cambiado a un color más brillante
        dark: "#AED581", 
      },
    },
  };

  return (
    <Card className="dashboard-card card-gradient-blue">
      <CardHeader>
        <CardTitle className="text-xl">{t('dashboard.carbonEmissionsCapture')}</CardTitle>
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
                unit={` ${t('common.tons')}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="current"
                name={t('dashboard.currentPractices')}
                fill="var(--color-current)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="potential"
                name={t('dashboard.regenerativePotential')}
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

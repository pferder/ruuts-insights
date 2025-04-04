
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFarm } from "@/context/FarmContext";
import { FarmComplete } from "@/types/farm";
import { calculateCarbonFootprint, calculateProjectedFootprint, calculateSequestration } from "@/lib/calculations";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { Header } from "@/components/layout/Header";
import { useTranslation } from "react-i18next";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface AnalyticsData {
  year: string;
  carbonFootprint: number;
  projectedFootprint: number;
  sequestration: number;
  regenerative: number;
}

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(undefined);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [yearRange, setYearRange] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const { farms } = useFarm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYearRange(Array.from({ length: 11 }, (_, i) => currentYear - 5 + i));
    setSelectedYear(String(currentYear));
  }, []);

  useEffect(() => {
    if (farms && farms.length > 0) {
      setSelectedFarmId(farms[0].farm.id);
    }
  }, [farms]);

  useEffect(() => {
    if (selectedFarmId && selectedYear) {
      generateAnalyticsData(selectedFarmId, selectedYear);
    }
  }, [selectedFarmId, selectedYear]);

  const generateAnalyticsData = async (farmId: string, selectedYear: string) => {
    setLoading(true);
    const selectedFarm: FarmComplete | undefined = farms?.find(farm => farm.farm.id === farmId);

    if (!selectedFarm) {
      setAnalyticsData([]);
      setLoading(false);
      return;
    }

    const startYear = parseInt(selectedYear) - 5;
    const endYear = parseInt(selectedYear) + 5;
    const data: AnalyticsData[] = [];

    for (let year = startYear; year <= endYear; year++) {
      const carbonFootprint = calculateCarbonFootprint(selectedFarm, String(year));
      const projectedFootprint = calculateProjectedFootprint(selectedFarm, String(year));
      const sequestration = calculateSequestration(selectedFarm, String(year));
      // Calculate regenerative practices score - defaults to a simple score based on pasture practices
      const regenerative = selectedFarm.pasture.rotationsPerSeason + 
                          (selectedFarm.pasture.restingDaysPerPasture / 10) +
                          selectedFarm.pasture.grassTypes.length;

      data.push({
        year: String(year),
        carbonFootprint,
        projectedFootprint,
        sequestration,
        regenerative
      });
    }

    setAnalyticsData(data);
    setLoading(false);
  };

  const chartConfig = {
    carbonFootprint: {
      label: "Carbon Footprint",
      theme: {
        light: "#8884d8",
        dark: "#9995e9"
      }
    },
    projectedFootprint: {
      label: "Projected Footprint",
      theme: {
        light: "#82ca9d",
        dark: "#93dbae"
      }
    },
    sequestration: {
      label: "Sequestration",
      theme: {
        light: "#ffc658",
        dark: "#ffd769"
      }
    }
  };

  return (
    <Layout>
      <Header 
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
      />

      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farm Selection Card */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">{t('analytics.selectFarmYear')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <Label htmlFor="farm" className="block text-sm font-medium text-gray-700">{t('common.farm')}</Label>
                <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={t('analytics.selectFarm')} />
                  </SelectTrigger>
                  <SelectContent>
                    {farms?.map((farm) => (
                      <SelectItem key={farm.farm.id} value={farm.farm.id}>{farm.farm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year" className="block text-sm font-medium text-gray-700">{t('common.year')}</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={t('analytics.selectYear')} />
                  </SelectTrigger>
                  <SelectContent>
                    {yearRange.map((year) => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Current Year Overview Card */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t('analytics.currentYearOverview')} ({selectedYear})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-4 w-[100px]" />
              ) : (
                <>
                  {analyticsData.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-700">{t('analytics.carbonFootprint')}:</div>
                      <div className="text-xl font-bold text-farm-green-700">
                        {typeof analyticsData[5]?.carbonFootprint === 'number' 
                          ? analyticsData[5].carbonFootprint.toFixed(2) 
                          : Number(analyticsData[5]?.carbonFootprint || 0).toFixed(2)} tons
                      </div>
                    </div>
                  )}

                  {analyticsData.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-700">{t('analytics.projectedFootprint')}:</div>
                      <div className="text-xl font-bold text-farm-green-700">
                        {typeof analyticsData[5]?.projectedFootprint === 'number' 
                          ? analyticsData[5].projectedFootprint.toFixed(2) 
                          : Number(analyticsData[5]?.projectedFootprint || 0).toFixed(2)} tons
                      </div>
                    </div>
                  )}

                  {analyticsData.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-700">{t('analytics.sequestration')}:</div>
                      <div className="text-xl font-bold text-farm-green-700">
                        {typeof analyticsData[5]?.sequestration === 'number' 
                          ? analyticsData[5].sequestration.toFixed(2) 
                          : Number(analyticsData[5]?.sequestration || 0).toFixed(2)} tons
                      </div>
                    </div>
                  )}

                  {analyticsData.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-700">{t('analytics.regenerativePractices')}:</div>
                      <div className="text-xl font-bold text-farm-green-700">
                        {typeof analyticsData[5]?.regenerative === 'number'
                          ? analyticsData[5].regenerative.toFixed(2)
                          : Number(analyticsData[5]?.regenerative || 0).toFixed(2)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <Card className="dashboard-card mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">{t('analytics.chart')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[400px]">
                <LineChart
                  data={analyticsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="year" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="carbonFootprint" 
                    name="Carbon Footprint" 
                    stroke="var(--color-carbonFootprint)" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedFootprint" 
                    name="Projected Footprint" 
                    stroke="var(--color-projectedFootprint)" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sequestration" 
                    name="Sequestration" 
                    stroke="var(--color-sequestration)" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;

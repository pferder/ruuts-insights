// src/components/dashboard/ComparativeMetrics.tsx
import { useTranslation } from "react-i18next";
import { FarmComplete } from "@/types/farm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleDashed, Layers, Repeat, Sprout, Leaf, ChartSpline } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ComparativeMetricsProps {
  farm: FarmComplete;
  cardVariant?: "default" | "inner"; // Prop to control rendering
}

export function ComparativeMetrics({ farm, cardVariant = "default" }: ComparativeMetricsProps) {
  const { t } = useTranslation();

  // ... (All calculations remain the same) ...
  const biomassDensity = farm.pasture.currentForageDensity || 0;
  const animalLoad = farm.cattle.totalHead / farm.farm.size;
  const paddockCount = farm.pasture.totalPastures;
  const rotationsCount = farm.pasture.rotationsPerSeason;
  const carbonCapture = farm.carbon ? farm.carbon.currentCapture / farm.farm.size : 0;

  const regional = farm.regionalAverages || {
    biomassDensity: 3500,
    animalLoad: 1.5,
    paddockCount: 6,
    rotationsCount: 3,
    carbonCapture: 5,
    carbonEmissions: 7,
  };

  const biomassPercentage =
    regional.biomassDensity > 0 ? (biomassDensity / regional.biomassDensity) * 100 : 0;
  const animalLoadPercentage =
    regional.animalLoad > 0 ? (animalLoad / regional.animalLoad) * 100 : 0;
  const paddockPercentage =
    regional.paddockCount > 0 ? (paddockCount / regional.paddockCount) * 100 : 0;
  const rotationsPercentage =
    regional.rotationsCount > 0 ? (rotationsCount / regional.rotationsCount) * 100 : 0;
  const capturePercentage =
    regional.carbonCapture > 0 ? (carbonCapture / regional.carbonCapture) * 100 : 0;

  const getColor = (percentage: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      if (percentage >= 110) return "text-farm-green-600";
      if (percentage >= 90) return "text-farm-gold-600";
      return "text-destructive";
    } else {
      if (percentage <= 90) return "text-farm-green-600";
      if (percentage <= 110) return "text-farm-gold-600";
      return "text-destructive";
    }
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };
  // --- End Calculations ---

  // Define the content rendering separately
  const MetricsContent = () => (
    <div className={cn("space-y-4", cardVariant === "inner" ? "p-0" : "")}>
      {" "}
      {/* Remove padding if inner */}
      {/* Biomass Production */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1.5">
            <Sprout className="h-4 w-4 text-farm-green-600" />
            <span className="font-medium">{t("dashboard.biomassDensity")}</span>
          </div>
          <div className={`font-semibold ${getColor(biomassPercentage)}`}>
            {formatPercentage(biomassPercentage)}
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <span>{biomassDensity.toLocaleString()} kg/ha</span>
          <span>vs</span>
          <span>
            {regional.biomassDensity.toLocaleString()} kg/ha {t("dashboard.regionalAvg")}
          </span>
        </div>
        <Progress value={Math.min(biomassPercentage, 200)} className="h-1.5" />
      </div>
      {/* Animal Load */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1.5">
            <CircleDashed className="h-4 w-4 text-farm-brown-600" />
            <span className="font-medium">{t("dashboard.animalLoad")}</span>
          </div>
          <div className={`font-semibold ${getColor(animalLoadPercentage, false)}`}>
            {formatPercentage(animalLoadPercentage)}
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <span>
            {animalLoad.toFixed(2)} {t("dashboard.animalsPerHa")}
          </span>
          <span>vs</span>
          <span>
            {regional.animalLoad.toFixed(2)} {t("dashboard.animalsPerHa")}{" "}
            {t("dashboard.regionalAvg")}
          </span>
        </div>
        <Progress value={Math.min(animalLoadPercentage, 200)} className="h-1.5" />
      </div>
      {/* Paddock Count */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1.5">
            <Layers className="h-4 w-4 text-farm-gold-600" />
            <span className="font-medium">{t("dashboard.paddockCount")}</span>
          </div>
          <div className={`font-semibold ${getColor(paddockPercentage)}`}>
            {formatPercentage(paddockPercentage)}
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <span>
            {paddockCount} {t("dashboard.paddocks")}
          </span>
          <span>vs</span>
          <span>
            {regional.paddockCount} {t("dashboard.paddocks")} {t("dashboard.regionalAvg")}
          </span>
        </div>
        <Progress value={Math.min(paddockPercentage, 200)} className="h-1.5" />
      </div>
      {/* Rotation Count */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1.5">
            <Repeat className="h-4 w-4 text-farm-blue-600" />
            <span className="font-medium">{t("dashboard.rotationsCount")}</span>
          </div>
          <div className={`font-semibold ${getColor(rotationsPercentage)}`}>
            {formatPercentage(rotationsPercentage)}
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <span>
            {rotationsCount} {t("dashboard.rotationsPerSeason")}
          </span>
          <span>vs</span>
          <span>
            {regional.rotationsCount} {t("dashboard.rotationsPerSeason")}{" "}
            {t("dashboard.regionalAvg")}
          </span>
        </div>
        <Progress value={Math.min(rotationsPercentage, 200)} className="h-1.5" />
      </div>
      {/* Carbon Capture */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1.5">
            <Leaf className="h-4 w-4 text-farm-green-700" />
            <span className="font-medium">{t("dashboard.carbonCapture")}</span>
          </div>
          <div className={`font-semibold ${getColor(capturePercentage)}`}>
            {formatPercentage(capturePercentage)}
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <span>
            {carbonCapture.toFixed(2)} {t("dashboard.tonsPerHa")}
          </span>
          <span>vs</span>
          <span>
            {regional.carbonCapture.toFixed(2)} {t("dashboard.tonsPerHa")}{" "}
            {t("dashboard.regionalAvg")}
          </span>
        </div>
        <Progress value={Math.min(capturePercentage, 200)} className="h-1.5" />
      </div>
      <div className="flex justify-center p-4">
        <Button variant="default">
          <ChartSpline className="h-4 w-4 mr-1" />
          {t("dashboard.advancedAnalytics", "Ver Analíticas avanzadas")}
        </Button>
      </div>
    </div>
  );

  // Conditionally render the outer Card based on the variant
  if (cardVariant === "inner") {
    return <MetricsContent />; // Render only the content when embedded
  }

  // Default rendering with Card wrapper
  return (
    <Card className="dashboard-card card-gradient-green neumorph-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t("dashboard.regionalComparison")}</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricsContent />
      </CardContent>
    </Card>
  );
}

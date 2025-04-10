
import { useTranslation } from "react-i18next";
import { FarmComplete } from "@/types/farm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDashed, Layers, Repeat, Sprout, Leaf } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ComparativeMetricsProps {
  farm: FarmComplete;
}

export function ComparativeMetrics({ farm }: ComparativeMetricsProps) {
  const { t } = useTranslation();
  
  // Calculate metrics
  const biomassDensity = farm.pasture.currentForageDensity || 0;
  const animalLoad = farm.cattle.totalHead / farm.farm.size;
  const paddockCount = farm.pasture.totalPastures;
  const rotationsCount = farm.pasture.rotationsPerSeason;
  const carbonCapture = farm.carbon ? (farm.carbon.currentCapture / farm.farm.size) : 0;
  
  // Generate regional averages if not present
  const regional = farm.regionalAverages || {
    biomassDensity: 3500, // Default regional average in kg/hectare
    animalLoad: 1.5, // Default animals per hectare
    paddockCount: 6, // Default paddock count
    rotationsCount: 3, // Default rotations per season
    carbonCapture: 5, // Default tons CO2/year/hectare capture
    carbonEmissions: 7 // Default tons CO2/year/hectare emissions
  };
  
  // Calculate percentages (farm value compared to regional average)
  const biomassPercentage = (biomassDensity / regional.biomassDensity) * 100;
  const animalLoadPercentage = (animalLoad / regional.animalLoad) * 100;
  const paddockPercentage = (paddockCount / regional.paddockCount) * 100;
  const rotationsPercentage = (rotationsCount / regional.rotationsCount) * 100;
  const capturePercentage = (carbonCapture / regional.carbonCapture) * 100;
  
  // Helper function to determine color based on percentage
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
  
  // Format the percentage for display
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };
  
  return (
    <Card className="dashboard-card card-gradient-green neumorph-card">
      <CardHeader>
        <CardTitle className="text-xl">{t('dashboard.regionalComparison')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Biomass Production */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-farm-green-600" />
              <span className="font-medium">{t('dashboard.biomassDensity')}</span>
            </div>
            <div className={`font-bold ${getColor(biomassPercentage)}`}>
              {formatPercentage(biomassPercentage)}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{biomassDensity.toLocaleString()} kg/ha</span>
            <span>vs</span>
            <span>{regional.biomassDensity.toLocaleString()} kg/ha {t('dashboard.regionalAvg')}</span>
          </div>
          <Progress value={Math.min(biomassPercentage, 200)} className="neumorph-inset h-2" />
        </div>
        
        {/* Animal Load */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CircleDashed className="h-5 w-5 text-farm-brown-600" />
              <span className="font-medium">{t('dashboard.animalLoad')}</span>
            </div>
            <div className={`font-bold ${getColor(animalLoadPercentage)}`}>
              {formatPercentage(animalLoadPercentage)}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{animalLoad.toFixed(2)} {t('dashboard.animalsPerHa')}</span>
            <span>vs</span>
            <span>{regional.animalLoad.toFixed(2)} {t('dashboard.animalsPerHa')} {t('dashboard.regionalAvg')}</span>
          </div>
          <Progress value={Math.min(animalLoadPercentage, 200)} className="neumorph-inset h-2" />
        </div>
        
        {/* Paddock Count */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-farm-gold-600" />
              <span className="font-medium">{t('dashboard.paddockCount')}</span>
            </div>
            <div className={`font-bold ${getColor(paddockPercentage)}`}>
              {formatPercentage(paddockPercentage)}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{paddockCount} {t('dashboard.paddocks')}</span>
            <span>vs</span>
            <span>{regional.paddockCount} {t('dashboard.paddocks')} {t('dashboard.regionalAvg')}</span>
          </div>
          <Progress value={Math.min(paddockPercentage, 200)} className="neumorph-inset h-2" />
        </div>
        
        {/* Rotation Count */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-farm-blue-600" />
              <span className="font-medium">{t('dashboard.rotationsCount')}</span>
            </div>
            <div className={`font-bold ${getColor(rotationsPercentage)}`}>
              {formatPercentage(rotationsPercentage)}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{rotationsCount} {t('dashboard.rotationsPerSeason')}</span>
            <span>vs</span>
            <span>{regional.rotationsCount} {t('dashboard.rotationsPerSeason')} {t('dashboard.regionalAvg')}</span>
          </div>
          <Progress value={Math.min(rotationsPercentage, 200)} className="neumorph-inset h-2" />
        </div>
        
        {/* Carbon Capture */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-farm-green-700" />
              <span className="font-medium">{t('dashboard.carbonCapture')}</span>
            </div>
            <div className={`font-bold ${getColor(capturePercentage)}`}>
              {formatPercentage(capturePercentage)}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{carbonCapture.toFixed(2)} {t('dashboard.tonsPerHa')}</span>
            <span>vs</span>
            <span>{regional.carbonCapture.toFixed(2)} {t('dashboard.tonsPerHa')} {t('dashboard.regionalAvg')}</span>
          </div>
          <Progress value={Math.min(capturePercentage, 200)} className="neumorph-inset h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

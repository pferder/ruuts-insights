import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileDown, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { useFarm } from "@/context/FarmContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { exportFarmDataToCsv } from "@/lib/farm-utils";
import { toast } from "sonner";

const ExportData = () => {
  const { t } = useTranslation();
  const { farms, loading } = useFarm();
  const [selectedFarms, setSelectedFarms] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  
  const handleSelectAll = () => {
    const allSelected = farms.every(farm => selectedFarms[farm.farm.id]);
    
    const newSelectedFarms = { ...selectedFarms };
    farms.forEach(farm => {
      newSelectedFarms[farm.farm.id] = !allSelected;
    });
    
    setSelectedFarms(newSelectedFarms);
  };
  
  const handleToggleFarm = (farmId: string) => {
    setSelectedFarms(prev => ({
      ...prev,
      [farmId]: !prev[farmId]
    }));
  };
  
  const handleExportSelected = () => {
    const selectedFarmIds = Object.entries(selectedFarms)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => id);
    
    if (selectedFarmIds.length === 0) {
      toast.error(t('exportData.selectAtLeastOne'));
      return;
    }
    
    setIsExporting(true);
    
    try {
      const selectedFarmData = farms.filter(farm => selectedFarmIds.includes(farm.farm.id));
      
      if (selectedFarmData.length === 1) {
        const farmData = selectedFarmData[0];
        const csvContent = exportFarmDataToCsv(farmData);
        downloadCSV(csvContent, `${farmData.farm.name.replace(/\s+/g, '_')}_data.csv`);
      } else {
        const headers = [
          "Farm Name",
          "Location",
          "Size (ha)",
          "Owner",
          "Cattle Total",
          "Cattle Type",
          "Average Weight (kg)",
          "Method of Raising",
          "Total Pastures",
          "Average Pasture Size (ha)",
          "Rotations Per Season",
          "Resting Days Per Pasture",
          "Grass Types",
          "Soil Health Score",
          "Current CO2 Emissions (tons/year)",
          "Current CO2 Capture (tons/year)",
          "Potential CO2 Emissions (tons/year)",
          "Potential CO2 Capture (tons/year)"
        ].join(",");
        
        const rows = selectedFarmData.map(farm => {
          const { farm: farmData, cattle, pasture, carbon } = farm;
          const carbonData = carbon || { currentEmissions: 0, currentCapture: 0, potentialEmissions: 0, potentialCapture: 0 };
          const grassTypesString = Array.isArray(pasture.grassTypes) 
            ? pasture.grassTypes.join("; ") 
            : pasture.grassTypes;
          
          return [
            farmData.name,
            farmData.location,
            farmData.size,
            farmData.ownerName,
            cattle.totalHead,
            cattle.cattleType,
            cattle.averageWeight,
            cattle.methodOfRaising,
            pasture.totalPastures,
            pasture.averagePastureSize,
            pasture.rotationsPerSeason,
            pasture.restingDaysPerPasture,
            grassTypesString,
            pasture.soilHealthScore || "N/A",
            carbonData.currentEmissions,
            carbonData.currentCapture,
            carbonData.potentialEmissions,
            carbonData.potentialCapture
          ].join(",");
        });
        
        const csvContent = [headers, ...rows].join("\n");
        downloadCSV(csvContent, "farm_data_export.csv");
      }
      
      toast.success(t('exportData.exportSuccess'));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t('exportData.exportError'));
    } finally {
      setIsExporting(false);
    }
  };
  
  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getSelectedCount = () => {
    return Object.values(selectedFarms).filter(Boolean).length;
  };
  
  if (loading) {
    return (
      <Layout>
        <Header title={t('exportData.title')} subtitle={t('exportData.subtitle')} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-700"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Header title={t('exportData.title')} subtitle={t('exportData.subtitle')} />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('exportData.title')}</CardTitle>
          <CardDescription>
            {t('exportData.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={handleSelectAll}
              className="mb-4"
            >
              {farms.every(farm => selectedFarms[farm.farm.id]) ? t('exportData.deselectAll') : t('exportData.selectAll')} 
            </Button>
            
            {farms.length === 0 ? (
              <div className="text-center py-8">
                <FileDown className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">{t('exportData.noFarms')}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('exportData.addFarmsToExport')}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {farms.map(farm => (
                  <div 
                    key={farm.farm.id} 
                    className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox 
                      id={farm.farm.id}
                      checked={selectedFarms[farm.farm.id] || false}
                      onCheckedChange={() => handleToggleFarm(farm.farm.id)}
                      className="mr-4 h-5 w-5"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={farm.farm.id} 
                        className="text-base font-medium cursor-pointer"
                      >
                        {farm.farm.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {farm.farm.location} • {farm.farm.size} hectares • {farm.cattle.totalHead} cattle
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {getSelectedCount()} {t('exportData.farmsSelected')} {farms.length}
          </div>
          <Button 
            onClick={handleExportSelected} 
            disabled={getSelectedCount() === 0 || isExporting}
            className="bg-farm-green-700 hover:bg-farm-green-800"
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                {t('exportData.exporting')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('exportData.exportSelected')}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('exportData.guide')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-farm-green-100 text-farm-green-600">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">{t('exportData.farmInfo')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('exportData.farmInfoDesc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-farm-green-100 text-farm-green-600">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">{t('exportData.cattleData')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('exportData.cattleDataDesc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-farm-green-100 text-farm-green-600">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">{t('exportData.pastureManagement')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('exportData.pastureManagementDesc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-farm-green-100 text-farm-green-600">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">{t('exportData.carbonData')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('exportData.carbonDataDesc')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ExportData;

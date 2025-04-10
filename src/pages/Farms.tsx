
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmGrid } from "@/components/farms/FarmGrid";
import { ComparativeMetrics } from "@/components/dashboard/ComparativeMetrics";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarm } from "@/context/FarmContext";
import { FarmMap } from "@/components/maps/FarmMap";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Farms = () => {
  const { t } = useTranslation();
  const { farms, loading, searchFarms } = useFarm();
  const [selectedFarmIndex, setSelectedFarmIndex] = useState(0);

  return (
    <Layout>
      <Header
        title={t("farms.title")}
        subtitle={t("farms.subtitle")}
      />
      
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder={t("common.search")} 
            className="pl-8 neumorph-inset dark:neumorph-dark-inset" 
            onChange={(e) => searchFarms(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs
        defaultValue="list"
        className="mb-8"
      >
        <TabsList className="neumorph-inset dark:neumorph-dark-inset">
          <TabsTrigger value="list">{t("farms.listView")}</TabsTrigger>
          <TabsTrigger value="map">{t("farms.mapView")}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <FarmGrid
            farms={farms}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="map">
          {farms.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-[600px] w-full border border-border rounded-xl overflow-hidden neumorph-card">
                  <FarmMap
                    farm={farms[selectedFarmIndex]}
                    height="100%"
                    showTooltip={true}
                  />
                </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                <Card className="neumorph-card card-gradient-green">
                  <CardHeader>
                    <CardTitle>{t("farms.farmList")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[260px] overflow-y-auto">
                      {farms.map((farm, index) => (
                        <div
                          key={farm.farm.id}
                          className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted ${selectedFarmIndex === index ? "bg-muted" : ""}`}
                          onClick={() => setSelectedFarmIndex(index)}
                        >
                          <h3 className="font-medium">{farm.farm.name}</h3>
                          <p className="text-sm text-muted-foreground">{farm.farm.location}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{farm.farm.size} ha</span>
                            <span>•</span>
                            <span>
                              {farm.cattle.totalHead} {t("common.cattle")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {farms[selectedFarmIndex] && (
                  <ComparativeMetrics farm={farms[selectedFarmIndex]} />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 neumorph-card card-gradient-green">
              <h3 className="text-xl font-semibold text-farm-green-800">{t("farms.noFarmsYet")}</h3>
              <p className="text-muted-foreground mt-2">{t("farms.addYourFirstFarm")}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Farms;

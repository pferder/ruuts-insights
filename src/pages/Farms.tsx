import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmGrid } from "@/components/farms/FarmGrid";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFarm } from "@/context/FarmContext";
import { FarmMap } from "@/components/maps/FarmMap";

const Farms = () => {
  const { t } = useTranslation();
  const { farms, loading } = useFarm();
  const [selectedFarmIndex, setSelectedFarmIndex] = useState(0);

  return (
    <Layout>
      <Header
        title={t("farms.title")}
        subtitle={t("farms.subtitle")}
        showSearch={true}
      />
      <Tabs
        defaultValue="list"
        className="mb-8"
      >
        <TabsList>
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
                <div className="h-[600px] w-full border border-border rounded-xl overflow-hidden">
                  <FarmMap
                    farm={farms[selectedFarmIndex]}
                    height="100%"
                    showTooltip={true}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("farms.farmList")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[550px] overflow-y-auto">
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
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
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

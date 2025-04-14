
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { FirstFarmGuide } from "@/components/onboarding/FirstFarmGuide";
import { useFarm } from "@/context/FarmContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CircleDollarSign, GraduationCap, Leaf, Plus } from "lucide-react";
import { FarmGrid } from "@/components/farms/FarmGrid";
import { ComparativeMetrics } from "@/components/dashboard/ComparativeMetrics";
import { CarbonChart } from "@/components/dashboard/CarbonChart";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedAction } from "@/types/farm";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farms, hasFarms, loading } = useFarm();

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Skeleton className="h-[180px] rounded-lg" />
              <Skeleton className="h-[180px] rounded-lg" />
              <Skeleton className="h-[180px] rounded-lg" />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!hasFarms) {
    return (
      <ProtectedRoute>
        <Layout>
          <FirstFarmGuide />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">{t("dashboard.welcome", "Bienvenido a su Dashboard")}</h2>
          <p className="text-muted-foreground">
            {t("dashboard.overview", "Aquí tiene un resumen de sus establecimientos y servicios.")}
          </p>

          {/* Mis Establecimientos */}
          <Card className="my-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t("dashboard.myFarms", "Mis Establecimientos")}</CardTitle>
                <CardDescription>{t("dashboard.manageFarms", "Gestione sus establecimientos registrados")}</CardDescription>
              </div>
              <Button 
                onClick={() => navigate("/add-farm")} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.addFarm", "Agregar")}
              </Button>
            </CardHeader>
            <CardContent>
              {farms.length > 0 ? (
                <>
                  <FarmGrid 
                    farms={farms.slice(0, 5)} 
                    viewMode="list" 
                    compact={true} 
                  />
                  {farms.length > 5 && (
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/farms")}
                      className="mt-4"
                    >
                      {t("dashboard.viewAllFarms", "Ver todos los establecimientos")}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">{t("dashboard.noFarms", "No tiene establecimientos registrados")}</p>
                  <Button 
                    onClick={() => navigate("/add-farm")} 
                    className="bg-farm-green-700 hover:bg-farm-green-800"
                  >
                    {t("dashboard.addFirstFarm", "Agregar Primer Establecimiento")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Servicios Contratados */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{t("dashboard.services", "Servicios Contratados")}</CardTitle>
                </div>
                <CardDescription>{t("dashboard.servicesDesc", "Acceda a sus servicios activos")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t("dashboard.noActiveServices", "No tiene servicios contratados")}</p>
                    <Button variant="outline" size="sm">
                      {t("dashboard.exploreServices", "Explorar servicios")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Programas de Carbono */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{t("dashboard.carbonPrograms", "Programas de Carbono")}</CardTitle>
                </div>
                <CardDescription>{t("dashboard.carbonDesc", "Programe capturas de carbono")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t("dashboard.noCarbonPrograms", "No tiene programas de carbono")}</p>
                    <Button variant="outline" size="sm">
                      {t("dashboard.exploreCarbonPrograms", "Explorar programas")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cursos y Capacitaciones */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{t("dashboard.courses", "Cursos y Capacitaciones")}</CardTitle>
                </div>
                <CardDescription>{t("dashboard.coursesDesc", "Aprenda sobre prácticas regenerativas")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">Introducción a la Agricultura Regenerativa</span>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">Pastoreo Regenerativo</span>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </div>
                  <Button variant="link" size="sm" className="text-center w-full">
                    {t("dashboard.viewAllCourses", "Ver todos los cursos")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {farms.length > 0 && (
            <div className="mt-6">
              <ComparativeMetrics farm={farms[0]} />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;

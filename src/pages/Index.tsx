import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { FirstFarmGuide } from "@/components/onboarding/FirstFarmGuide";
import { useFarm } from "@/context/FarmContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headset, Building2, CircleDollarSign, GraduationCap, Leaf, Plus } from "lucide-react";
import { FarmGrid } from "@/components/farms/FarmGrid";
import { ComparativeMetrics } from "@/components/dashboard/ComparativeMetrics";
import { RegenProgramCard } from "@/components/dashboard/RegenProgramCard";
import { CarbonChart } from "@/components/dashboard/CarbonChart";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RecommendedAction } from "@/types/farm";
import { cn } from "@/lib/utils";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farms, hasFarms, loading } = useFarm();

  const showDashboard = !loading && hasFarms;
  const showLoading = loading;
  const showOnboarding = !loading && !hasFarms;

  return (
    <ProtectedRoute>
      <Layout>
        {/* Loading State */}
        {showLoading && (
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Skeleton className="h-[180px] rounded-lg" />
              <Skeleton className="h-[180px] rounded-lg" />
              <Skeleton className="h-[180px] rounded-lg" />
            </div>
          </div>
        )}

        {/* Onboarding State */}
        {showOnboarding && <FirstFarmGuide />}

        {/* Main Dashboard Content - Always Mounted, Hidden with CSS */}
        <div className={cn("space-y-6", !showDashboard && "hidden")}>
          {/* <h2 className="text-3xl font-bold tracking-tight">
            {t("dashboard.welcome", "Bienvenido a su Dashboard")}
          </h2>
          <p className="text-muted-foreground">
            {t("dashboard.overview", "Aquí tiene un resumen de sus establecimientos y servicios.")}
          </p> */}

          {/* Mis Establecimientos */}
          <Card className="my-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t("dashboard.myFarms", "Mis Establecimientos")}</CardTitle>
                <CardDescription>
                  {t("dashboard.manageFarms", "Gestione sus establecimientos registrados")}
                </CardDescription>
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
                  <FarmGrid farms={farms.slice(0, 5)} viewMode="list" compact={true} />
                  {farms.length > 5 && (
                    <Button variant="link" onClick={() => navigate("/farms")} className="mt-4">
                      {t("dashboard.viewAllFarms", "Ver todos los establecimientos")}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {t("dashboard.noFarms", "No tiene establecimientos registrados")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Programas de Carbono */}
          <RegenProgramCard />

          {/* Services sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Asesoramiento gratuito */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Headset className="h-5 w-5" />
                  <CardTitle>{t("dashboard.freeConsultation", "Asesoramiento Gratuito")}</CardTitle>
                </div>
                <CardDescription>
                  {t(
                    "dashboard.consultationDesc",
                    "Hable con nuestros expertos sobre su establecimiento"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium mb-2">
                      {t("dashboard.expertAdvice", "Consulta personalizada")}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(
                        "dashboard.scheduleCallDesc",
                        "Agende una llamada con nuestros expertos para recibir asesoramiento personalizado para su establecimiento."
                      )}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        window.open("https://meetings.hubspot.com/pablo-ferder", "_blank")
                      }
                    >
                      {t("dashboard.scheduleCall", "Agendar llamada")}
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="font-medium mb-2">
                      {t("dashboard.instantSupport", "Soporte inmediato")}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(
                        "dashboard.whatsappDesc",
                        "¿Tiene consultas urgentes? Chatea directamente con nuestro equipo vía WhatsApp."
                      )}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                      onClick={() => window.open("https://wa.me/59899123456", "_blank")}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#25D366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {t("dashboard.startChat", "Iniciar chat")}
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
                  <CardTitle>{t("dashboard.courses", "Aprendé de regeneración")}</CardTitle>
                </div>
                <CardDescription>
                  {t("dashboard.coursesDesc", "Formate en ganadería y agricultura regenerativa")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30 mb-5 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 bg-amber-500/10 w-24 h-24 rounded-full"></div>
                    <div className="absolute right-4 top-4">
                      <div className="bg-amber-500 text-white text-xs font-bold py-1 px-2 rounded-full transform rotate-3">
                        Nuevo
                      </div>
                    </div>
                    <h4 className="font-bold text-base mb-2 flex items-center">
                      <span className="bg-amber-500/20 text-amber-700 p-1 rounded mr-2">
                        <GraduationCap className="h-4 w-4" />
                      </span>
                      MASTERCLASS
                    </h4>
                    <p className="text-sm font-medium mb-1">Regeneración de pastizales naturales</p>
                    <p className="text-xs text-muted-foreground mb-3">Con Pablo Borrelli</p>
                    <div className="flex items-center justify-between">
                      {/* <span className="text-amber-700 font-medium text-sm">Plazas limitadas</span> */}
                      <Button className="bg-amber-600 hover:bg-amber-700" size="sm">
                        Ver clase
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-sm font-medium">
                        Especialización en manejo holístico
                      </span>
                      <p className="text-xs text-muted-foreground">15 de Marzo 2024 - Virtual</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-sm font-medium">Pastoreo Regenerativo</span>
                      <p className="text-xs text-muted-foreground">
                        22 de Marzo 2024 - Presencial (Montevideo)
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-sm font-medium">Agricultura Regenerativa</span>
                      <p className="text-xs text-muted-foreground">
                        5 de Abril 2024 - Presencial (Canelones)
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>
                  <Button variant="link" size="sm" className="text-center w-full">
                    {t("dashboard.viewAllCourses", "Ver todos los cursos")}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Calendario Próximos eventos */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>{t("dashboard.events", "Próximos eventos")}</CardTitle>
                </div>
                <CardDescription>
                  {t("dashboard.eventsDesc", "No te pierdas nuestros próximos eventos")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold py-0.5 px-2 rounded-full">
                      Destacado
                    </div>
                    <h4 className="font-medium mb-1">Jornada de Manejo Regenerativo</h4>
                    <p className="text-xs text-muted-foreground mb-1">15 Marzo, 2024</p>
                    <p className="text-xs text-muted-foreground mb-3">Durazno, Uruguay</p>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Inscribirse
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-sm font-medium">Workshop de Suelos Vivos</span>
                      <p className="text-xs text-muted-foreground">22 Marzo, 2024 - Montevideo</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-sm font-medium">Visita a Campo Modelo</span>
                      <p className="text-xs text-muted-foreground">5 Abril, 2024 - Paysandú</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-sm font-medium">Webinar: Carbono en Ganadería</span>
                      <p className="text-xs text-muted-foreground">12 Abril, 2024 - Virtual</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>

                  <Button variant="link" size="sm" className="text-center w-full">
                    {t("dashboard.viewAllEvents", "Ver todos los eventos")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Servicios Contratados */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t("dashboard.services", "Servicios Contratados")}</CardTitle>
              </div>
              <CardDescription>
                {t("dashboard.servicesDesc", "Acceda a sus servicios activos")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("dashboard.noActiveServices", "No tiene servicios contratados")}
                  </p>
                  <Button variant="outline" size="sm">
                    {t("dashboard.exploreServices", "Explorar servicios")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;

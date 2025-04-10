import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PackagePlus, Leaf, Droplets, LineChart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CarbonChart } from "@/components/dashboard/CarbonChart";
import { ProjectionChart } from "@/components/dashboard/ProjectionChart";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { ComparativeMetrics } from "@/components/dashboard/ComparativeMetrics";
import { Button } from "@/components/ui/button";
import { useFarm } from "@/context/FarmContext";
import { generateDashboardMetrics, generateProjections, generateRecommendedActions } from "@/lib/farm-utils";

const Dashboard = () => {
  const { t } = useTranslation();
  const { farms, loading } = useFarm();
  const navigate = useNavigate();
  
  if (!loading && farms.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <Leaf className="w-16 h-16 text-farm-green-600 mb-4" />
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome')}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            {t('app.subtitle')}
          </p>
          <Button 
            onClick={() => navigate("/add-farm")}
            className="bg-farm-green-700 hover:bg-farm-green-800 text-lg px-8 py-6"
            size="lg"
          >
            {t('dashboard.addYourFirstFarm')}
          </Button>
        </div>
      </Layout>
    );
  }
  
  const farm = farms[0];
  
  if (!farm) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green-700"></div>
        </div>
      </Layout>
    );
  }
  
  const metrics = generateDashboardMetrics(farm);
  const projections = generateProjections(farm);
  const actions = generateRecommendedActions(farm);
  
  return (
    <Layout>
      <Header 
        title={t('dashboard.welcome')} 
        subtitle={t('dashboard.subtitle')}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title={t('dashboard.netCarbonImpact')} 
          current={farm.carbon ? farm.carbon.currentCapture - farm.carbon.currentEmissions : 0}
          potential={farm.carbon ? farm.carbon.potentialCapture - farm.carbon.potentialEmissions : 0}
          difference={metrics[0].improvement}
          unit="tons CO2/yr"
          icon={<Leaf className="h-5 w-5 text-farm-green-600" />}
          colorClass="farm-green"
        />
        
        <MetricCard 
          title={t('dashboard.soilHealthScore')} 
          current={farm.pasture.soilHealthScore || 5}
          potential={Math.min(10, (farm.pasture.soilHealthScore || 5) * 1.5)}
          difference={metrics[1].improvement}
          unit="/10"
          icon={<Droplets className="h-5 w-5 text-farm-brown-600" />}
          colorClass="farm-brown"
        />
        
        <MetricCard 
          title={t('dashboard.cattleProduction')} 
          current={farm.cattle.totalHead * farm.cattle.averageWeight}
          potential={(farm.cattle.totalHead * farm.cattle.averageWeight) * 1.25}
          difference={metrics[2].improvement}
          unit="kg"
          icon={<PackagePlus className="h-5 w-5 text-farm-gold-600" />}
          colorClass="farm-gold"
        />
        
        <MetricCard 
          title={t('dashboard.profitPerHectare')} 
          current={(farm.cattle.totalHead * farm.cattle.averageWeight * 2.5) / farm.farm.size}
          potential={((farm.cattle.totalHead * farm.cattle.averageWeight * 1.25) * 3) / farm.farm.size}
          difference={metrics[3].improvement}
          unit="$/ha"
          icon={<LineChart className="h-5 w-5 text-farm-green-600" />}
          colorClass="farm-green"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <CarbonChart carbonData={farm.carbon!} />
        </div>
        
        <div className="lg:col-span-1">
          <ComparativeMetrics farm={farm} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProjectionChart 
          twoYearData={projections.twoYear}
          fiveYearData={projections.fiveYear}
          tenYearData={projections.tenYear}
          metricKey="netCarbon"
          title={t('dashboard.carbonBalance')}
          yAxisLabel="Net Carbon Balance (tons CO2)"
        />
        
        <ProjectionChart 
          twoYearData={projections.twoYear}
          fiveYearData={projections.fiveYear}
          tenYearData={projections.tenYear}
          metricKey="totalProduction"
          title={t('dashboard.production')}
          yAxisLabel="Total Production (kg)"
        />
        
        <ProjectionChart 
          twoYearData={projections.twoYear}
          fiveYearData={projections.fiveYear}
          tenYearData={projections.tenYear}
          metricKey="profitability"
          title={t('dashboard.profitability')}
          yAxisLabel="Profit ($)"
        />
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-farm-green-800">{t('dashboard.recommendedActions')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {actions.slice(0, 3).map(action => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => navigate(`/farms/${farm.farm.id}`)}
          className="bg-farm-green-700 hover:bg-farm-green-800"
        >
          {t('dashboard.viewFarmDetails')}
        </Button>
      </div>
    </Layout>
  );
};

export default Dashboard;

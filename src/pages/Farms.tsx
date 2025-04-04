
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmGrid } from "@/components/farms/FarmGrid";
import { Separator } from "@/components/ui/separator";
import { useFarm } from "@/context/FarmContext";

const Farms = () => {
  const { t } = useTranslation();
  const { farms, loading } = useFarm();
  
  return (
    <Layout>
      <Header 
        title={t('farms.title')} 
        subtitle={t('farms.subtitle')}
        showSearch={true}
      />
      
      <Separator className="my-6" />
      
      <FarmGrid 
        farms={farms} 
        isLoading={loading}
      />
    </Layout>
  );
};

export default Farms;

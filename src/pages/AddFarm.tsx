
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmForm } from "@/components/forms/FarmForm";

const AddFarm = () => {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <Header 
        title={t('addFarm.title')} 
        subtitle={t('addFarm.subtitle')}
      />
      
      <div className="mt-6">
        <FarmForm />
      </div>
    </Layout>
  );
};

export default AddFarm;

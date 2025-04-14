
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmWizard } from "@/components/forms/FarmWizard";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useNavigate } from "react-router-dom";

const AddFarm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <Layout>
        <Header 
          title={t("addFarm.title", "Agregar Nuevo Establecimiento")}
          subtitle={t("addFarm.subtitle", "Cree un nuevo establecimiento para seguimiento y análisis")}
        />
        <div className="mt-6">
          <FarmWizard onComplete={() => navigate("/farms")} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AddFarm;

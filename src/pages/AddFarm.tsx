
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmWizard } from "@/components/forms/FarmWizard";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const AddFarm = () => {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="mt-6">
          <FarmWizard />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AddFarm;

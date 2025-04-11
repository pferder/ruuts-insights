import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Layout } from "@/components/layout/Layout";
import { FarmWizard } from "@/components/forms/FarmWizard";

const AddFarm = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="mt-6">
        <FarmWizard />
      </div>
    </Layout>
  );
};

export default AddFarm;

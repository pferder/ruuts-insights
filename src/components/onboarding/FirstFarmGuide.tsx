
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FarmWizard } from "@/components/forms/FarmWizard";
import { ArrowRight, Sprout, BarChart4, FileCheck } from "lucide-react";

export function FirstFarmGuide() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "form" | "confirmation">("intro");

  const handleStartClick = () => {
    setStep("form");
  };

  if (step === "intro") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl">
            {t("onboarding.welcome", "¡Bienvenido a Ruuts!")}
          </CardTitle>
          <CardDescription className="text-lg">
            {t("onboarding.getStarted", "Comencemos configurando su primer establecimiento")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-farm-green-100 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-farm-green-700" />
              </div>
              <h3 className="font-medium">{t("onboarding.step1Title", "Agregue su establecimiento")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.step1Desc", "Complete la información básica de su establecimiento")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-farm-green-100 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-farm-green-700" />
              </div>
              <h3 className="font-medium">{t("onboarding.step2Title", "Defina sus prácticas")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.step2Desc", "Configure sus detalles de ganado y pastoreo")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-farm-green-100 flex items-center justify-center">
                <BarChart4 className="w-6 h-6 text-farm-green-700" />
              </div>
              <h3 className="font-medium">{t("onboarding.step3Title", "Obtenga análisis")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.step3Desc", "Reciba análisis detallados y recomendaciones")}
              </p>
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-medium mb-2">{t("onboarding.whyAdd", "¿Por qué agregar su establecimiento?")}</h3>
            <ul className="space-y-2 text-sm">
              <li>• {t("onboarding.benefit1", "Acceda a prácticas recomendadas para su tipo específico de establecimiento")}</li>
              <li>• {t("onboarding.benefit2", "Reciba análisis detallados sobre el rendimiento de su establecimiento")}</li>
              <li>• {t("onboarding.benefit3", "Compare sus métricas con promedios regionales")}</li>
              <li>• {t("onboarding.benefit4", "Aprenda cómo implementar prácticas regenerativas")}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStartClick} 
            className="w-full bg-farm-green-700 hover:bg-farm-green-800"
          >
            {t("onboarding.startButton", "Comenzar")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "form") {
    return <FarmWizard onComplete={() => navigate("/dashboard")} />;
  }

  return null;
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { useFarm } from "@/context/FarmContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FarmData, CattleData, PastureData, RegionalAverages } from "@/types/farm";
import { StepWizard, Step } from "@/components/ui/step-wizard";
import { Info, BarChart, ArrowLeft, ArrowRight, FileUp, Sprout } from "lucide-react";
import Icon from "@mdi/react";
import { mdiCow } from "@mdi/js";

import { GeneralInfoStep } from "./wizard-steps/GeneralInfoStep";
import { CattleInfoStep } from "./wizard-steps/CattleInfoStep";
import { GrazingInfoStep } from "./wizard-steps/GrazingInfoStep";
import { ProductionInfoStep } from "./wizard-steps/ProductionInfoStep";

const formSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  size: z.number().min(1, "Size must be at least 1 hectare"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email").optional(),

  totalHead: z.number().min(1, "Total head must be at least 1"),
  cattleType: z.string().min(2, "Cattle type must be at least 2 characters"),
  averageWeight: z.number().min(100, "Average weight must be at least 100 kg"),
  methodOfRaising: z.enum(["conventional", "regenerative", "mixed"]),

  totalPastures: z.number().min(1, "Total pastures must be at least 1"),
  averagePastureSize: z.number().min(1, "Average pasture size must be at least 1 hectare"),
  rotationsPerSeason: z.number().min(1, "Rotations must be at least 1"),
  restingDaysPerPasture: z.number().min(1, "Resting days must be at least 1"),
  grassTypes: z.string().min(2, "Grass types must be at least 2 characters"),
  soilHealthScore: z.number().min(1, "Soil health score must be at least 1").max(10, "Soil health score must be at most 10").optional(),
  currentForageDensity: z.number().min(1, "Forage density must be at least 1 kg/hectare").optional(),

  productionType: z.enum(["dairy", "livestock"]),
  livestockType: z.enum(["breeding", "rearing", "fattening", "complete_cycle"]).optional(),
  supplementationKg: z.number().min(0, "Supplementation must be at least 0 kg").default(0),

  regionalBiomassDensity: z.number().min(1, "Regional biomass density must be at least 1 kg/hectare").optional(),
  regionalAnimalLoad: z.number().min(0.1, "Regional animal load must be at least 0.1").optional(),
  regionalPaddockCount: z.number().min(1, "Regional paddock count must be at least 1").optional(),
  regionalRotationsCount: z.number().min(1, "Regional rotations count must be at least 1").optional(),
  regionalCarbonCapture: z.number().min(0.1, "Regional carbon capture must be at least 0.1").optional(),
  regionalCarbonEmissions: z.number().min(0.1, "Regional carbon emissions must be at least 0.1").optional(),
});

type FarmFormValues = z.infer<typeof formSchema>;

export type { FarmFormValues };

export function FarmWizard() {
  const { t } = useTranslation();
  const { createFarm } = useFarm();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmGeometry, setFarmGeometry] = useState<GeoJSON.Geometry | null>(null);

  const steps: Step[] = [
    {
      id: "general-info",
      title: t("farmWizard.steps.generalInfo", "General Information"),
      description: t("farmWizard.steps.generalInfoDesc", "Farm details"),
      icon: <Info size={18} />,
    },
    {
      id: "cattle-info",
      title: t("farmWizard.steps.cattleInfo", "Cattle Information"),
      description: t("farmWizard.steps.cattleInfoDesc", "Herd details"),
      icon: (
        <Icon
          path={mdiCow}
          size={1}
        />
      ),
    },
    {
      id: "grazing-info",
      title: t("farmWizard.steps.grazingInfo", "Grazing Management"),
      description: t("farmWizard.steps.grazingInfoDesc", "Pasture details"),
      icon: <Sprout size={18} />,
    },
    {
      id: "production-info",
      title: t("farmWizard.steps.productionInfo", "Production Data"),
      description: t("farmWizard.steps.productionInfoDesc", "Production type"),
      icon: <BarChart size={18} />,
    },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      size: undefined,
      ownerName: "",
      contactEmail: "",
      totalHead: undefined,
      cattleType: "",
      averageWeight: undefined,
      methodOfRaising: "conventional",
      totalPastures: undefined,
      averagePastureSize: undefined,
      rotationsPerSeason: undefined,
      restingDaysPerPasture: undefined,
      grassTypes: "",
      soilHealthScore: 5,
      currentForageDensity: undefined,
      productionType: "livestock",
      livestockType: "complete_cycle",
      supplementationKg: 0,
      regionalBiomassDensity: 3500,
      regionalAnimalLoad: 1.5,
      regionalPaddockCount: 6,
      regionalRotationsCount: 3,
      regionalCarbonCapture: 5,
      regionalCarbonEmissions: 7,
    },
  });

  const goToNextStep = async () => {
    const stepFields = {
      0: ["name", "location", "size", "ownerName", "contactEmail"],
      1: ["totalHead", "cattleType", "averageWeight", "methodOfRaising"],
      2: ["totalPastures", "averagePastureSize", "rotationsPerSeason", "restingDaysPerPasture", "grassTypes", "soilHealthScore", "currentForageDensity"],
      3: ["productionType", "livestockType", "supplementationKg"],
    };

    const result = await form.trigger(stepFields[currentStep as keyof typeof stepFields] as (keyof FarmFormValues)[], { shouldFocus: true });

    if (result) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGeoFileUpload = (geometry: GeoJSON.Geometry) => {
    setFarmGeometry(geometry);
    toast({
      title: t("farmWizard.geoFileUploaded", "Geographic file uploaded"),
      description: t("farmWizard.geoFileUploadSuccess", "Farm boundary uploaded successfully"),
    });
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => {
      setIsSubmitting(true);

      try {
        const farmData: Omit<FarmData, "id" | "createdAt" | "updatedAt" | "coordinates"> = {
          name: data.name,
          location: data.location,
          size: data.size,
          ownerName: data.ownerName,
          ...(farmGeometry && { coordinates: farmGeometry }),
          ...(data.contactEmail && { contactEmail: data.contactEmail }),
        };

        const cattleData: Omit<CattleData, "id" | "farmId"> = {
          totalHead: data.totalHead,
          cattleType: data.cattleType,
          averageWeight: data.averageWeight,
          methodOfRaising: data.methodOfRaising,
        };

        const pastureData: Omit<PastureData, "id" | "farmId"> = {
          totalPastures: data.totalPastures,
          averagePastureSize: data.averagePastureSize,
          rotationsPerSeason: data.rotationsPerSeason,
          restingDaysPerPasture: data.restingDaysPerPasture,
          grassTypes: data.grassTypes.split(",").map((type) => type.trim()),
          soilHealthScore: data.soilHealthScore,
          currentForageDensity: data.currentForageDensity,
        };

        const productionData = {
          productionType: data.productionType,
          livestockType: data.productionType === "livestock" ? data.livestockType : undefined,
          supplementationKg: data.supplementationKg,
        };

        createFarm(farmData, cattleData, pastureData, data.regionalBiomassDensity ? {
          biomassDensity: data.regionalBiomassDensity,
          animalLoad: data.regionalAnimalLoad || 1.5,
          paddockCount: data.regionalPaddockCount || 6,
          rotationsCount: data.regionalRotationsCount || 3,
          carbonCapture: data.regionalCarbonCapture || 5,
          carbonEmissions: data.regionalCarbonEmissions || 7,
        } : undefined, productionData);

        toast({
          title: t("farmWizard.successTitle", "Farm Created"),
          description: t("farmWizard.successDescription", "Your farm has been successfully added."),
        });

        navigate("/farms");
      } catch (error) {
        console.error("Error creating farm:", error);
        toast({
          title: t("farmWizard.errorTitle", "Error"),
          description: t("farmWizard.errorDescription", "There was an error adding your farm. Please try again."),
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <GeneralInfoStep
            form={form}
            onGeoFileUpload={handleGeoFileUpload}
          />
        );
      case 1:
        return <CattleInfoStep form={form} />;
      case 2:
        return <GrazingInfoStep form={form} />;
      case 3:
        return <ProductionInfoStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("farmWizard.title", "Add New Farm")}</CardTitle>
        <CardDescription>{t("farmWizard.description", "Add information about your farm to get started with regenerative insights.")}</CardDescription>
      </CardHeader>

      <CardContent>
        <StepWizard
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <FormProvider {...form}>
          <form className="space-y-6">{renderStepContent()}</form>
        </FormProvider>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 0 ? () => navigate("/farms") : goToPreviousStep}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {currentStep === 0 ? t("common.cancel", "Cancel") : t("common.back", "Back")}
        </Button>

        <Button
          type="button"
          onClick={goToNextStep}
          disabled={isSubmitting}
          className="bg-farm-green-700 hover:bg-farm-green-800 flex items-center gap-2"
        >
          {currentStep === steps.length - 1
            ? isSubmitting
              ? t("common.creating", "Creating...")
              : t("common.create", "Create Farm")
            : t("common.next", "Next")}
          {currentStep < steps.length - 1 && <ArrowRight size={16} />}
        </Button>
      </CardFooter>
    </Card>
  );
}

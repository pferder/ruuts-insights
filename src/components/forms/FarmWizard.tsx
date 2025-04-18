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
import { FarmData, CattleData, PastureData, Coordinates } from "@/types/farm";
import { StepWizard, Step } from "@/components/ui/step-wizard";
import { Info, BarChart, ArrowLeft, ArrowRight, Sprout } from "lucide-react";
import Icon from "@mdi/react";
import { mdiCow } from "@mdi/js";
import { getMapboxToken } from "@/config/mapbox";

import { GeneralInfoStep } from "./wizard-steps/GeneralInfoStep";
import { CattleInfoStep } from "./wizard-steps/CattleInfoStep";
import { GrazingInfoStep } from "./wizard-steps/GrazingInfoStep";
import { ProductionInfoStep } from "./wizard-steps/ProductionInfoStep";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FarmWizardProps {
  onComplete?: () => void;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

export function FarmWizard({ onComplete }: FarmWizardProps) {
  const { t } = useTranslation();
  const { createFarm } = useFarm();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmGeometry, setFarmGeometry] = useState<GeoJSON.Geometry | null>(null);
  const [geoFile, setGeoFile] = useState<File | null>(null);

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

  const formSchema = z.object({
    name: z.string().min(1, { message: t("forms.validation.required") }),
    country: z.string().min(1, { message: t("forms.validation.required") }),
    state: z.string().min(1, { message: t("forms.validation.required") }),
    city: z.string().min(1, { message: t("forms.validation.required") }),
    size: z.number().min(0.01, { message: t("forms.validation.minSize") }),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .required(),
    ownerName: z.string().min(1, { message: t("forms.validation.required") }),
    contactEmail: z
      .string()
      .email({ message: t("forms.validation.invalidEmail") })
      .optional(),

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country: "",
      state: "",
      city: "",
      size: undefined,
      coordinates: {
        lat: 0,
        lng: 0,
      },
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
      0: ["name", "country", "state", "city", "size", "coordinates", "ownerName", "contactEmail"],
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

  const handleGeoFileUpload = async (geometry: GeoJSON.Geometry, file?: File) => {
    setFarmGeometry(geometry);
    if (file) {
      setGeoFile(file);
    }

    // Si la geometría es un polígono, obtener el centroide para geocoding
    if (geometry.type === "Polygon" && geometry.coordinates[0] && geometry.coordinates[0].length > 0) {
      const firstPoint = geometry.coordinates[0][0];
      const center = {
        lat: firstPoint[1],
        lng: firstPoint[0],
      };

      // Actualizar las coordenadas en el formulario
      form.setValue("coordinates", center);

      try {
        // Obtener el token de Mapbox desde Supabase
        const token = await getMapboxToken();

        // Realizar geocoding inverso para obtener la ubicación
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=${token}&language=es`);
        const data = (await response.json()) as MapboxResponse;

        if (data.features && data.features.length > 0) {
          const place = data.features[0];
          const context = place.context || [];

          // Extraer información de ubicación
          const country = context.find((c) => c.id.includes("country"))?.text || "";
          const region = context.find((c) => c.id.includes("region"))?.text || "";
          const placeName = context.find((c) => c.id.includes("place"))?.text || "";

          // Actualizar los campos del formulario
          form.setValue("country", country);
          form.setValue("state", region);
          form.setValue("city", placeName);
        }
      } catch (error) {
        console.error("Error en geocoding inverso:", error);
        toast({
          title: t("farmWizard.geocodingError", "Error en geocoding"),
          description: t("farmWizard.geocodingErrorDesc", "No se pudo obtener la ubicación automáticamente"),
          variant: "default",
        });
      }
    }

    toast({
      title: t("farmWizard.geoFileUploaded", "Archivo geográfico subido"),
      description: t("farmWizard.geoFileUploadSuccess", "Perímetro del establecimiento subido correctamente"),
    });
  };

  const handleSubmit = async () => {
    form.handleSubmit(async (data) => {
      if (!user) {
        toast({
          title: t("farmWizard.errorTitle"),
          description: t("farmWizard.authError"),
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        console.log("Starting farm creation process...");
        console.log("Geometry available:", !!farmGeometry);

        const farmData: Omit<FarmData, "id" | "createdAt" | "updatedAt"> = {
          name: data.name,
          location: `${data.city}, ${data.state}, ${data.country}`,
          size: data.size,
          coordinates: data.coordinates as Coordinates,
          ownerName: data.ownerName,
          contactEmail: data.contactEmail,
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

        const regionalAverages = data.regionalBiomassDensity
          ? {
              biomassDensity: data.regionalBiomassDensity,
              animalLoad: data.regionalAnimalLoad || 1.5,
              paddockCount: data.regionalPaddockCount || 6,
              rotationsCount: data.regionalRotationsCount || 3,
              carbonCapture: data.regionalCarbonCapture || 5,
              carbonEmissions: data.regionalCarbonEmissions || 7,
            }
          : undefined;

        console.log("Creating farm with data:", farmData);
        const newFarm = await createFarm(farmData, cattleData, pastureData, regionalAverages);
        console.log("Farm created successfully:", newFarm);

        // Si tenemos una geometría y una nueva finca fue creada, guardarla
        if (newFarm && farmGeometry) {
          try {
            console.log("Inserting geometry into farm_geospatial table...");
            console.log("Farm ID:", newFarm.farm.id);
            console.log("Geometry type:", farmGeometry.type);

            const { data: geospatialData, error: geospatialError } = await supabase
              .from("farm_geospatial")
              .insert({
                farm_id: newFarm.farm.id,
                file_name: "uploaded_geometry",
                file_type: "geojson",
                geometry: farmGeometry,
              })
              .select()
              .single();

            if (geospatialError) {
              console.error("Error inserting geometry:", geospatialError);
              throw geospatialError;
            }
            console.log("Geometry inserted successfully:", geospatialData);

            toast({
              title: t("farmWizard.geoFileSuccess", "Datos geoespaciales guardados"),
              description: t("farmWizard.geoFileSuccessDesc", "La información geográfica fue guardada correctamente"),
            });
          } catch (geoError) {
            console.error("Error in geospatial data handling:", geoError);
            toast({
              title: t("farmWizard.geoFileError", "Error en archivo geoespacial"),
              description: t("farmWizard.geoFileUploadError", "Hubo un error al guardar la información geográfica"),
              variant: "default",
            });
          }
        } else {
          console.log("Skipping geospatial data upload:", {
            hasNewFarm: !!newFarm,
            hasGeometry: !!farmGeometry,
          });
        }

        toast({
          title: t("farmWizard.successTitle", "Establecimiento Creado"),
          description: t("farmWizard.successDescription", "Su establecimiento ha sido agregado correctamente."),
        });

        if (onComplete) {
          onComplete();
        } else {
          navigate("/farms");
        }
      } catch (error) {
        console.error("Error creando establecimiento:", error);
        toast({
          title: t("farmWizard.errorTitle", "Error"),
          description: t("farmWizard.errorDescription", "Hubo un error al agregar su establecimiento. Por favor intente nuevamente."),
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
        <CardTitle>{t("farmWizard.title", "Agregar Nuevo Establecimiento")}</CardTitle>
        <CardDescription>
          {t("farmWizard.description", "Agregue información sobre su establecimiento para comenzar con los análisis regenerativos.")}
        </CardDescription>
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
          {currentStep === 0 ? t("common.cancel", "Cancelar") : t("common.back", "Atrás")}
        </Button>

        <Button
          type="button"
          onClick={goToNextStep}
          disabled={isSubmitting}
          className="bg-farm-green-700 hover:bg-farm-green-800 flex items-center gap-2"
        >
          {currentStep === steps.length - 1
            ? isSubmitting
              ? t("common.creating", "Creando...")
              : t("common.create", "Crear Establecimiento")
            : t("common.next", "Siguiente")}
          {currentStep < steps.length - 1 && <ArrowRight size={16} />}
        </Button>
      </CardFooter>
    </Card>
  );
}

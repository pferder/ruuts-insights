// src/components/dashboard/RegenProgramCard.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useFarm } from "@/context/FarmContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trees,
  Droplet,
  Leaf,
  Frame,
  Check,
  CheckCircle,
  LoaderCircle,
  FileText,
  Axe,
  Info,
  // MapIcon
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import * as turf from "@turf/turf";

import { checkEligibility } from "@/services/eligibilityService";
import { generatePdfReport } from "@/lib/eligibilityReport";

import type { EligibilityApiResponse, DerivedEligibilityResult } from "../../types/farm";
// import { getMapboxToken } from "@/config/mapbox"; // Keep commented if using env var
// import type { NavigateFunction } from "react-router-dom"; // Para el botón de Inscripción
// import type { EligibilityMap } from "./EligibilityMap"; // Mostrar mapa de elegibilidad desplegable

interface MapLayerProps {
  nameKey: string;
  defaultName: string;
  icon: React.ComponentType<{ className?: string }>; // Added className prop type for icons
  color: string;
  propertyMatch?: string;
  areaPropDerived?: keyof Omit<DerivedEligibilityResult, "message" | "deforestationYears">; // Make this type-safe
}

// Define possible loading states
type LoadingStatus = "idle" | "checking_eligibility" | "success" | "failed";

export function RegenProgramCard() {
  const { t } = useTranslation();
  const { farms, selectedFarm, selectFarm } = useFarm();
  const [eligibilityApiResponse, setEligibilityApiResponse] =
    useState<EligibilityApiResponse | null>(null);
  const [eligibilityCheckRun, setEligibilityCheckRun] = useState(false);
  const [farmGeometry, setFarmGeometry] = useState<turf.Geometry | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle");
  const [errorFetchingGeometry, setErrorFetchingGeometry] = useState<boolean>(false);

  useEffect(() => {
    const currentFarmId = selectedFarm?.farm?.id;
    if (!currentFarmId) {
      setFarmGeometry(null);
      setEligibilityApiResponse(null);
      setLoadingStatus("idle");
      setErrorFetchingGeometry(false);
      if (farms.length > 0 && !selectedFarm) {
        selectFarm(farms[0].farm.id);
      }
      return;
    }

    setFarmGeometry(null);
    setEligibilityApiResponse(null);
    setErrorFetchingGeometry(false);

    const fetchFarmGeometry = async () => {
      try {
        const { data: geospatialData, error: geospatialError } = await supabase
          .from("farm_geospatial")
          .select("geometry")
          .eq("farm_id", currentFarmId)
          .single();

        if (geospatialError) {
          setErrorFetchingGeometry(true);
          if (geospatialError.code !== "PGRST116") {
            console.error("Error fetching farm geometry:", geospatialError);
            toast.error(t("errors.fetchGeometryFailed", "Failed to load farm geometry."));
          } else {
            console.warn("No geometry data found for the selected farm.");
          }
          setLoadingStatus("idle");
          return;
        }

        if (
          !geospatialData?.geometry ||
          typeof geospatialData.geometry !== "object" ||
          !geospatialData.geometry.type ||
          !geospatialData.geometry.coordinates
        ) {
          setErrorFetchingGeometry(true);
          console.warn("No geometry data or invalid format found for farm:", currentFarmId);
          setLoadingStatus("idle");
          return;
        }
        setFarmGeometry(geospatialData.geometry as turf.Geometry);
        setLoadingStatus("idle"); // Geometry loaded, ready for check
      } catch (error) {
        setErrorFetchingGeometry(true);
        console.error("Unexpected error fetching farm geometry:", error);
        toast.error(
          t(
            "errors.fetchGeometryUnexpected",
            "An unexpected error occurred while fetching geometry."
          )
        );
        setLoadingStatus("idle");
      }
    };

    fetchFarmGeometry();
  }, [selectedFarm?.farm?.id, farms, selectFarm, t]);

  const CATEGORY_MAPPING: MapLayerProps[] = useMemo(
    () => [
      {
        nameKey: "dashboard.perimeter",
        defaultName: "Perimeter",
        icon: Frame,
        color: "#e0e000",
      },
      {
        nameKey: "dashboard.deforestation",
        defaultName: "Deforestation",
        icon: Axe,
        color: "#FF4136",
        propertyMatch: "deforestedareas",
        areaPropDerived: "deforestationAreaHa",
      },
      {
        nameKey: "dashboard.forest",
        defaultName: "Forest cover",
        icon: Trees,
        color: "#2ECC40",
        propertyMatch: "forestunion",
        areaPropDerived: "forestAreaHa",
      },
      {
        nameKey: "dashboard.wetlands",
        defaultName: "Wetlands",
        icon: Droplet,
        color: "#0074D9",
        propertyMatch: "wetlandsunion",
        areaPropDerived: "wetlandsAreaHa",
      },
      {
        nameKey: "dashboard.eligibleArea",
        defaultName: "Eligible Area",
        icon: CheckCircle,
        color: "#90EE90",
        propertyMatch: "eligibleareafeature",
        areaPropDerived: "eligibleAreaHa",
      },
    ],
    []
  );

  const getCountry = useCallback(async () => {
    if (!farmGeometry) return null;

    try {
      // const token = await getMapboxToken();
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) {
        console.error("Mapbox token is missing.");
        toast.error(t("errors.mapboxTokenMissing", "Map configuration error."));
        return null;
      }
      const centroid = turf.centroid(farmGeometry).geometry.coordinates;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${centroid[0]},${centroid[1]}.json?access_token=${token}&language=en`
      );
      if (!response.ok) {
        throw new Error(`Mapbox API Error: ${response.statusText}`);
      }
      const data = (await response.json()) as MapboxResponse;

      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        const context = place.context || [];
        const country = context.find((c) => c.id.includes("country"))?.text || "";

        if (!country) {
          toast.error(t("errors.countryNotFound", "Could not determine country from map data."));
          return null;
        }
        return country;
      } else {
        toast.error(t("errors.countryNotFound", "Could not determine country from map data."));
        return null;
      }
    } catch (error) {
      console.error("Error fetching country data:", error);
      toast.error(t("errors.fetchCountryData", "Error determining country for the farm."));
      return null;
    }
  }, [farmGeometry, t]);

  const interpretEligibilityResponse = useCallback(
    (
      apiResponse: EligibilityApiResponse | null,
      totalUploadedAreaHa: number | null
    ): DerivedEligibilityResult | null => {
      if (!apiResponse?.features || !totalUploadedAreaHa) {
        return null;
      }

      const result: DerivedEligibilityResult = {
        message: t("dashboard.analysisPending", "Analysis Pending."),
        totalUploadedAreaHa: totalUploadedAreaHa ?? undefined,
        deforestationAreaHa: 0,
        deforestationYears: [],
        forestAreaHa: 0,
        wetlandsAreaHa: 0,
        eligibleAreaHa: 0,
      };

      const calculateAreaFromApiFeatures = (
        matchString: string
      ): { area: number; years: number[] } => {
        let totalArea = 0;
        const years = new Set<number>();

        apiResponse.features.forEach((feature) => {
          if (!feature?.properties?.name) return;
          if (feature.properties.name.toLowerCase().includes(matchString.toLowerCase())) {
            const propArea = feature.properties?.area_ha;
            if (typeof propArea === "number" && propArea >= 0) {
              totalArea += propArea;
            } else if (feature.geometry) {
              try {
                const calculatedArea = turf.area(feature) / 10000;
                if (calculatedArea > 0) {
                  totalArea += calculatedArea;
                } else {
                  console.warn(
                    `Turf calculated zero or negative area for feature ${feature.properties.name} (${matchString})`
                  );
                }
              } catch (e) {
                console.warn(
                  `Area calculation failed for feature ${feature.properties.name} (${matchString}):`,
                  e
                );
              }
            } else {
              console.warn(
                `No area_ha property and no geometry found for feature ${feature.properties.name} (${matchString})`
              );
            }

            if (matchString === "deforestedareas") {
              const year = feature.properties?.year;
              let parsedYear: number | null = null;
              if (typeof year === "number" && !isNaN(year)) {
                parsedYear = year;
              } else if (typeof year === "string" && year.trim() !== "") {
                const tempYear = parseInt(year, 10);
                if (!isNaN(tempYear)) {
                  parsedYear = tempYear;
                }
              }
              if (parsedYear !== null) {
                if (parsedYear < 100) {
                  parsedYear += 2000;
                }
                years.add(parsedYear);
              }
            }
          }
        });
        return { area: totalArea, years: Array.from(years).sort((a, b) => a - b) };
      };

      const deforResult = calculateAreaFromApiFeatures("deforestedareas");
      result.deforestationAreaHa = deforResult.area;
      result.deforestationYears = deforResult.years;

      result.forestAreaHa = calculateAreaFromApiFeatures("forestunion").area;
      result.wetlandsAreaHa = calculateAreaFromApiFeatures("wetlandsunion").area;
      result.eligibleAreaHa = calculateAreaFromApiFeatures("eligibleareafeature").area;

      const formatHa = (val?: number): string => {
        if (val == null || isNaN(val)) return "N/A";
        return `${val.toLocaleString(t("common.locale", "en-US"), {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ha`;
      };

      const deforestationThreshold = 0.01;
      const isSignificantDeforestation = result.deforestationAreaHa > deforestationThreshold;

      if (result.eligibleAreaHa > 0) {
        result.message = t(
          "dashboard.eligibilitySuccess",
          `¡Su establecimiento tiene ${formatHa(result.eligibleAreaHa)} elegibles!`
        );
      } else if (totalUploadedAreaHa > 0) {
        result.message = t(
          "dashboard.eligibilityFailure",
          "Su establecimiento no tiene area elegible según el análisis."
        );
        if (isSignificantDeforestation) {
          result.message +=
            "\n" +
            t(
              "dashboard.deforestationReason",
              `Causa principal probable: ${formatHa(
                result.deforestationAreaHa
              )} de deforestación detectada.`
            );
        } else if (result.wetlandsAreaHa > totalUploadedAreaHa * 0.8) {
          result.message +=
            "\n" +
            t(
              "dashboard.wetlandsReason",
              `Causa principal probable: Alta proporción de humedales (${formatHa(
                result.wetlandsAreaHa
              )}).`
            );
        } else if (result.forestAreaHa < totalUploadedAreaHa * 0.1) {
          result.message +=
            "\n" +
            t(
              "dashboard.lowForestReason",
              `Causa principal probable: Baja cobertura forestal (${formatHa(
                result.forestAreaHa
              )}).`
            );
        }
      } else {
        result.message = t(
          "dashboard.analysisIncomplete",
          "Analysis incomplete due to missing area data."
        );
      }

      return result;
    },
    [t]
  );

  const derivedEligibility = useMemo<DerivedEligibilityResult | null>(() => {
    if (eligibilityApiResponse) {
      return interpretEligibilityResponse(eligibilityApiResponse, selectedFarm?.farm?.size ?? null);
    }
    return null;
  }, [eligibilityApiResponse, selectedFarm?.farm?.size, interpretEligibilityResponse]); // Dependencies

  const handleEligibilityCheck = useCallback(async () => {
    if (!selectedFarm?.farm) {
      toast.error(t("errors.noFarmSelected", "Please select a farm first."));
      return;
    }
    if (!farmGeometry) {
      toast.error(
        t("errors.noGeometryForCheck", "Farm map data is missing or invalid. Cannot run check.")
      );
      setErrorFetchingGeometry(true);
      return;
    }

    const AREA_LIMIT_HA = 50000; // Podría ir a una config o constants
    if (selectedFarm.farm.size > AREA_LIMIT_HA) {
      const formattedSize = selectedFarm.farm.size.toLocaleString(t("common.locale", "en-US"));
      const formattedLimit = AREA_LIMIT_HA.toLocaleString(t("common.locale", "en-US"));
      console.warn(`Area limit exceeded: ${formattedSize} ha, max. ${formattedLimit} ha`);
      toast.error(
        t(
          "errors.areaLimitExceeded",
          `Area limit exceeded: ${formattedSize} ha, max. ${formattedLimit} ha`
        )
      );
      return;
    }

    setEligibilityApiResponse(null);
    setEligibilityCheckRun(true);

    let fileToSend: File | undefined;
    try {
      const feature = turf.feature(farmGeometry);
      const fileContent = turf.featureCollection([feature]);
      const blob = new Blob([JSON.stringify(fileContent)], {
        type: "application/geo+json",
      });
      const safeFarmName = selectedFarm.farm.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      fileToSend = new File([blob], `${safeFarmName}-${selectedFarm.farm.id}.geojson`, {
        type: "application/geo+json",
      });
    } catch (e: any) {
      console.error("Error creating geometry file:", e);
      toast.error(t("errors.prepGeometryFailed", "Preparing geometry data failed."));
      setEligibilityCheckRun(false);
      return;
    }

    if (!fileToSend) {
      toast.error(t("errors.noFileForCheck", "Could not create file for eligibility check."));
      setEligibilityCheckRun(false);
      return;
    }

    try {
      const country = await getCountry();
      if (!country) {
        console.error("Could not determine country for eligibility check.");
        toast.error(
          t("errors.countryNotFound", "Could not determine country for eligibility check.")
        );
        setEligibilityCheckRun(false);
        return;
      }

      setLoadingStatus("checking_eligibility");

      const apiResponse = await checkEligibility(fileToSend, country, selectedFarm.farm.name);

      setEligibilityApiResponse(apiResponse);
      setLoadingStatus("success");
    } catch (error: any) {
      console.error("Eligibility check failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        t("errors.checkFailed", "Eligibility check failed.");
      toast.error(errorMessage);
      setEligibilityApiResponse(null);
      setLoadingStatus("failed");
    } finally {
      setEligibilityCheckRun(false);
    }
  }, [selectedFarm, farmGeometry, t, getCountry]);

  const handleGenerateReport = useCallback(() => {
    if (selectedFarm?.farm && derivedEligibility) {
      generatePdfReport(selectedFarm.farm, derivedEligibility);
    } else {
      console.error("Cannot generate report: Missing farm data or eligibility results.");
      toast.error(t("errors.reportGenerationFailed", "Could not generate report. Data missing."));
    }
  }, [selectedFarm, derivedEligibility, t]);

  const formatAreaDisplay = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0.00 ha"; // Or "N/A" or "-"
    }
    return `${value.toLocaleString(t("common.locale", "en-US"), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ha`;
  };

  const isCheckDisabled =
    !selectedFarm || !farmGeometry || loadingStatus === "checking_eligibility";

  const showResultsArea = loadingStatus === "checking_eligibility" || derivedEligibility;

  const showSummaryActions = !!derivedEligibility;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{t("dashboard.regenPrograms", "Programas de Regeneración")}</CardTitle>
        </div>
        <CardDescription>
          {t("dashboard.regenDesc", "Monetiza tu mejora ecológica")}
        </CardDescription>
      </CardHeader>
      {selectedFarm && (
        <CardContent>
          {/* Farm Selector */}
          {farms.length > 1 && (
            <div className="mb-4">
              <Select
                onValueChange={(farmId) => selectFarm(farmId)}
                value={
                  selectedFarm?.farm?.id && farms.some((f) => f.farm.id === selectedFarm.farm.id)
                    ? selectedFarm.farm.id
                    : undefined
                }
                disabled={loadingStatus === "checking_eligibility"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dashboard.selectFarm", "Select a farm")} />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.farm.id} value={farm.farm.id}>
                      {farm.farm.name} ({formatAreaDisplay(farm.farm.size)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* --- Conditional Content Area --- */}

          {/* State 1: Initial / Idle / Ready to Check */}
          {loadingStatus === "idle" &&
            !derivedEligibility &&
            selectedFarm &&
            !errorFetchingGeometry && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t(
                      "dashboard.promptCheck",
                      `¿Verificar elegibilidad para ${selectedFarm.farm.name}?`
                    )}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEligibilityCheck}
                    disabled={isCheckDisabled}
                  >
                    {t("dashboard.runCheck", "Check de elegibilidad")}
                  </Button>
                </div>
              </div>
            )}

          {/* State 1b: Error Fetching Geometry or Geometry Missing */}
          {(loadingStatus === "idle" || loadingStatus === "failed") &&
            errorFetchingGeometry &&
            selectedFarm && (
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 text-center">
                <Info className="h-5 w-5 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-orange-700 font-medium">
                  {t("errors.geometryLoadFailedTitle", "Map Data Issue")}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {t(
                    "errors.geometryLoadFailedDesc",
                    "Could not load or access the map data for this farm. Please check the farm's map details or try again later."
                  )}
                </p>
              </div>
            )}

          {/* State 2: Loading Indicator */}
          {loadingStatus === "checking_eligibility" && (
            <div className="p-4 rounded-lg bg-muted/50 text-center space-y-2">
              <LoaderCircle className="h-6 w-6 animate-spin text-primary mx-auto" />
              <p className="text-sm font-medium text-muted-foreground">
                {loadingStatus === "checking_eligibility" &&
                  t("dashboard.loading.checkingEligibility", "Running eligibility check...")}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {loadingStatus === "checking_eligibility" &&
                  t("dashboard.loading.wait", "This may take up to a minute.")}
              </p>
            </div>
          )}

          {/* State 3: Displaying Results Breakdown */}
          {/* Show this section if check is running OR results are available OR check failed */}
          {showResultsArea && selectedFarm && (
            <div className="space-y-3 mt-4">
              {CATEGORY_MAPPING.map((layer) => (
                <div
                  key={layer.nameKey}
                  className="flex items-center justify-between space-x-2 text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <layer.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t(layer.nameKey, layer.defaultName)}
                    </span>
                  </div>

                  {loadingStatus === "checking_eligibility" && layer.defaultName !== "Perimeter" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="font-medium text-right">
                      {layer.defaultName === "Perimeter"
                        ? formatAreaDisplay(selectedFarm.farm.size)
                        : derivedEligibility
                        ? formatAreaDisplay(
                            derivedEligibility?.[
                              layer.areaPropDerived as keyof DerivedEligibilityResult
                            ] as number | undefined
                          )
                        : loadingStatus !== "checking_eligibility"
                        ? "-"
                        : ""}
                      {loadingStatus === "checking_eligibility" &&
                        layer.defaultName !== "Perimeter" && (
                          <span className="inline-block w-4"></span>
                        )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* State 4: Results Summary and Actions */}
          {/* Show this only when derivedEligibility is populated (after success) */}
          {showSummaryActions && derivedEligibility && (
            <div className="space-y-4 mt-6">
              {" "}
              {/* Summary Message */}
              <div
                className={`p-3 rounded-lg border ${
                  derivedEligibility.eligibleAreaHa > 0
                    ? "border-green-500 bg-green-50"
                    : "border-orange-500 bg-orange-50"
                } text-center space-y-1`}
              >
                <p
                  className={`text-sm font-semibold whitespace-pre-line ${
                    derivedEligibility.eligibleAreaHa > 0 ? "text-green-700" : "text-orange-700"
                  }`}
                >
                  {derivedEligibility.message}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-column gap-2 mt-2">
                {" "}
                {derivedEligibility.eligibleAreaHa > 0 && (
                  <Button
                    onClick={() =>
                      toast.info(t("common.notImplemented", "Feature not yet implemented."))
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {t("dashboard.applicateRegenProgram", "Inscribirme a un programa")}
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {t("dashboard.downloadReport", "Reporte de elegibilidad")}
                  <FileText className="h-4 w-4" />
                </Button>
                {/* Map modal view */}
                {/* <Button
                variant="link"
                size="sm"
                onClick={() =>
                  toast.info(t("common.notImplemented", "Feature not yet implemented."))
                }
                className="flex-1 text-xs text-muted-foreground hover:text-foreground justify-center"
              >
                {t("dashboard.eligibilityMapView", "Ver en Mapa")}
                <MapIcon />
              </Button> */}
              </div>
            </div>
          )}

          {/* State 5: Failed Check */}
          {loadingStatus === "failed" && !derivedEligibility && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-center">
              <Info className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700 font-medium">
                {t("dashboard.checkFailedTitle", "Eligibility Check Failed")}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {t(
                  "dashboard.checkFailedDesc",
                  "The eligibility check could not be completed. Please try again later or contact support if the issue persists."
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEligibilityCheck}
                disabled={isCheckDisabled}
                className="mt-3"
              >
                {t("common.retry", "Retry Check")}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

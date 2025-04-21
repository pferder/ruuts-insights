// src/components/dashboard/RegenProgramCard.tsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import * as turf from "@turf/turf";
import type { Geometry, Feature, FeatureCollection } from "geojson";

import { checkEligibility } from "@/services/eligibilityService";
import { generatePdfReport } from "@/lib/eligibilityReport";
import EligibilityMap, { EligibilityMapRef, AreaLayerData } from "../maps/EligibilityMap";

import type { EligibilityApiResponse, DerivedEligibilityResult } from "../../types/farm";

// Interface for Mapbox Geocoding Response (simplified)
interface MapboxContext {
  id: string;
  text: string;
}
interface MapboxFeature {
  id: string;
  place_name: string;
  text?: string; // Added text for country feature
  context?: MapboxContext[];
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}
interface MapboxResponse {
  type: string;
  features: MapboxFeature[];
}

interface MapLayerConfig {
  id: string;
  nameKey: string;
  defaultName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  propertyMatch: string;
  areaPropDerived: keyof Omit<DerivedEligibilityResult, "message" | "deforestationYears">;
}

type LoadingStatus =
  | "idle"
  | "fetching_geometry"
  | "determining_country"
  | "checking_eligibility"
  | "success"
  | "failed";

export function RegenProgramCard() {
  const { t } = useTranslation();
  const { farms, selectedFarm, selectFarm } = useFarm();
  const [eligibilityApiResponse, setEligibilityApiResponse] =
    useState<EligibilityApiResponse | null>(null);
  const [derivedEligibility, setDerivedEligibility] = useState<DerivedEligibilityResult | null>(
    null
  );
  const [farmGeometry, setFarmGeometry] = useState<Geometry | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>("idle");
  const [errorFetchingGeometry, setErrorFetchingGeometry] = useState<boolean>(false);
  const mapRef = useRef<EligibilityMapRef>(null);
  const [mapLayerData, setMapLayerData] = useState<AreaLayerData[] | null>(null);

  // Memoized function to safely format area using toLocaleString
  const safeLocaleFormat = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        // Attempt to use the locale from i18n first
        const locale = t("common.locale", { ns: "translation", defaultValue: "en-US" }); // Provide default
        return value.toLocaleString(locale, options);
      } catch (e) {
        console.warn(`toLocaleString failed with locale from i18n, falling back to en-US:`, e);
        // Fallback to "en-US" if the i18n locale fails
        return value.toLocaleString("en-US", options);
      }
    },
    [t]
  ); // Dependency on t function

  const formatAreaDisplay = useCallback(
    (value: number | undefined | null): string => {
      if (value === undefined || value === null || isNaN(value)) {
        return "0.00 ha";
      }
      const formatted = safeLocaleFormat(value, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${formatted} ha`;
    },
    [safeLocaleFormat]
  ); // Dependency on safeLocaleFormat

  const CATEGORY_MAPPING: MapLayerConfig[] = useMemo(
    () => [
      {
        id: "perimeter",
        nameKey: "dashboard.perimeter",
        defaultName: "Perimeter",
        icon: Frame,
        color: "#e0e000",
        propertyMatch: "perimeter", // Special case
        areaPropDerived: "totalUploadedAreaHa",
      },
      {
        id: "deforestation",
        nameKey: "dashboard.deforestation",
        defaultName: "Deforestation",
        icon: Axe,
        color: "#FF4136",
        propertyMatch: "deforestedareas",
        areaPropDerived: "deforestationAreaHa",
      },
      {
        id: "forest",
        nameKey: "dashboard.forest",
        defaultName: "Forest cover",
        icon: Trees,
        color: "#2ECC40",
        propertyMatch: "forestunion",
        areaPropDerived: "forestAreaHa",
      },
      {
        id: "wetlands",
        nameKey: "dashboard.wetlands",
        defaultName: "Wetlands",
        icon: Droplet,
        color: "#0074D9",
        propertyMatch: "wetlandsunion",
        areaPropDerived: "wetlandsAreaHa",
      },
      {
        id: "eligible",
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

  // --- Farm Geometry Fetching Effect ---
  useEffect(() => {
    const currentFarmId = selectedFarm?.farm?.id;

    setFarmGeometry(null);
    setEligibilityApiResponse(null);
    setDerivedEligibility(null);
    setMapLayerData(null);
    setErrorFetchingGeometry(false);
    setLoadingStatus("idle");

    if (!currentFarmId) {
      if (farms.length > 0 && !selectedFarm) {
        selectFarm(farms[0].farm.id);
      }
      return;
    }

    setLoadingStatus("fetching_geometry");

    const fetchFarmGeometry = async () => {
      try {
        const { data: geospatialData, error: geospatialError } = await supabase
          .from("farm_geospatial")
          .select("geometry")
          .eq("farm_id", currentFarmId)
          .single();

        if (geospatialError || !geospatialData?.geometry) {
          setErrorFetchingGeometry(true);
          setLoadingStatus("idle");
          if (geospatialError && geospatialError.code !== "PGRST116") {
            console.error("Error fetching farm geometry:", geospatialError);
            toast.error(t("errors.fetchGeometryFailed", "Failed to load farm geometry.")); // Restored fallback
          } else {
            console.warn("No geometry data found for the selected farm.");
            // No toast here, handled by UI state
          }
          return;
        }

        // Basic validation of geometry structure
        const geom = geospatialData.geometry as Geometry;
        if (!geom || !geom.type || !geom.coordinates) {
          setErrorFetchingGeometry(true);
          setLoadingStatus("idle");
          console.warn("Invalid geometry structure received for farm:", currentFarmId);
          toast.error(t("errors.fetchGeometryFailed", "Failed to load farm geometry.")); // Restored fallback
          return;
        }

        setFarmGeometry(geom);
        setLoadingStatus("idle");

        const perimeterConfig = CATEGORY_MAPPING.find((c) => c.id === "perimeter");
        if (perimeterConfig) {
          const perimeterLayer: AreaLayerData = {
            id: perimeterConfig.id,
            name: t(perimeterConfig.nameKey, perimeterConfig.defaultName),
            geometry: geom,
            color: perimeterConfig.color,
            area: selectedFarm?.farm?.size,
          };
          setMapLayerData([perimeterLayer]);
        }
      } catch (error) {
        setErrorFetchingGeometry(true);
        console.error("Unexpected error fetching farm geometry:", error);
        toast.error(
          t(
            "errors.fetchGeometryUnexpected",
            "An unexpected error occurred while fetching geometry."
          )
        ); // Restored fallback
        setLoadingStatus("idle");
      }
    };

    fetchFarmGeometry();
  }, [selectedFarm?.farm?.id, farms, selectFarm, t, CATEGORY_MAPPING]); // Farm size added implicitly via selectedFarm

  // --- Country Determination ---
  const getCountry = useCallback(async () => {
    if (!farmGeometry) return null;
    setLoadingStatus("determining_country");

    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token) {
        console.error("Mapbox token is missing.");
        toast.error(t("errors.mapboxTokenMissing", "Map configuration error.")); // Restored fallback
        setLoadingStatus("failed");
        return null;
      }
      const centroid = turf.centroid(farmGeometry).geometry.coordinates;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${centroid[0]},${centroid[1]}.json?access_token=${token}&types=country&language=en`
      );
      if (!response.ok) throw new Error(`Mapbox API Error: ${response.statusText}`);
      const data = (await response.json()) as MapboxResponse;

      const country = data.features?.[0]?.text; // Use 'text' for country name
      if (country) {
        return country;
      } else {
        toast.error(t("errors.countryNotFound", "Could not determine country from map data.")); // Restored fallback
        setLoadingStatus("failed");
        return null;
      }
    } catch (error) {
      console.error("Error fetching country data:", error);
      toast.error(t("errors.fetchCountryData", "Error determining country for the farm.")); // Restored fallback
      setLoadingStatus("failed");
      return null;
    }
  }, [farmGeometry, t]);

  // --- Eligibility Interpretation ---
  const interpretEligibilityResponse = useCallback(
    (
      apiResponse: EligibilityApiResponse | null,
      totalUploadedAreaHa: number | null
    ): DerivedEligibilityResult | null => {
      if (
        !apiResponse?.features ||
        apiResponse.features.length === 0 ||
        totalUploadedAreaHa === null
      ) {
        return null;
      }

      const result: DerivedEligibilityResult = {
        message: t("dashboard.analysisPending", "Analysis Pending."), // Restored fallback
        totalUploadedAreaHa: totalUploadedAreaHa ?? undefined,
        deforestationAreaHa: 0,
        deforestationYears: [],
        forestAreaHa: 0,
        wetlandsAreaHa: 0,
        eligibleAreaHa: 0,
      };

      const featureMap = new Map<string, Feature>();
      apiResponse.features.forEach((f) => {
        if (f?.properties?.name) {
          featureMap.set(f.properties.name.toLowerCase(), f);
        }
      });

      const getAreaAndYears = (matchKey: string): { area: number; years: number[] } => {
        const feature = featureMap.get(matchKey.toLowerCase());
        if (!feature) return { area: 0, years: [] };

        let area = feature.properties?.area_ha ?? 0;
        if ((area <= 0 || area === undefined) && feature.geometry) {
          try {
            const calculatedArea = turf.area(feature) / 10000;
            area = calculatedArea > 0 ? calculatedArea : 0;
            if (area <= 0) console.warn(`Turf area calculation resulted in <= 0 for ${matchKey}`);
          } catch (e) {
            console.warn(`Turf area calculation failed for ${matchKey}:`, e);
            area = 0;
          }
        }
        area = typeof area === "number" && !isNaN(area) ? area : 0;

        let years: number[] = [];
        if (matchKey === "deforestedareas" && feature.properties?.year) {
          const yearData = String(feature.properties.year);
          years = yearData
            .split(",")
            .map((y) => parseInt(y.trim(), 10))
            .filter((y) => !isNaN(y))
            .map((y) => (y < 100 ? y + 2000 : y))
            .sort((a, b) => a - b);
        }
        return { area, years };
      };

      CATEGORY_MAPPING.forEach((config) => {
        if (config.propertyMatch !== "perimeter") {
          const { area, years } = getAreaAndYears(config.propertyMatch);
          if (config.areaPropDerived) {
            result[config.areaPropDerived] = area;
            if (config.id === "deforestation") {
              result.deforestationYears = years;
            }
          }
        }
      });

      // Determine final message using formatAreaDisplay which now uses safeLocaleFormat
      const deforThreshold = 0.01;
      if (result.eligibleAreaHa > 0) {
        result.message = t(
          "dashboard.eligibilitySuccess",
          `¡Su establecimiento tiene ${formatAreaDisplay(result.eligibleAreaHa)} elegibles!`
        );
      } else if (totalUploadedAreaHa > 0) {
        result.message = t(
          "dashboard.eligibilityFailure",
          "Su establecimiento no tiene area elegible según el análisis."
        );
        if (result.deforestationAreaHa > deforThreshold) {
          result.message +=
            "\n" +
            t(
              "dashboard.deforestationReason",
              `Causa principal probable: ${formatAreaDisplay(
                result.deforestationAreaHa
              )} de deforestación detectada.`
            );
        } else if (result.wetlandsAreaHa > totalUploadedAreaHa * 0.8) {
          result.message +=
            "\n" +
            t(
              "dashboard.wetlandsReason",
              `Causa principal probable: Alta proporción de humedales (${formatAreaDisplay(
                result.wetlandsAreaHa
              )}).`
            );
        } else if (result.forestAreaHa < totalUploadedAreaHa * 0.1) {
          result.message +=
            "\n" +
            t(
              "dashboard.lowForestReason",
              `Causa principal probable: Baja cobertura forestal (${formatAreaDisplay(
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
    [t, CATEGORY_MAPPING, formatAreaDisplay] // Added formatAreaDisplay dependency
  );

  // --- Effect to Process API Response and Update Map/UI ---
  useEffect(() => {
    if (eligibilityApiResponse && selectedFarm?.farm?.size !== undefined) {
      const interpreted = interpretEligibilityResponse(
        eligibilityApiResponse,
        selectedFarm.farm.size
      );
      setDerivedEligibility(interpreted);

      const newMapLayers: AreaLayerData[] = [];

      if (farmGeometry) {
        const perimeterConfig = CATEGORY_MAPPING.find((c) => c.id === "perimeter");
        if (perimeterConfig) {
          newMapLayers.push({
            id: perimeterConfig.id,
            name: t(perimeterConfig.nameKey, perimeterConfig.defaultName),
            geometry: farmGeometry,
            color: perimeterConfig.color,
            area: selectedFarm.farm.size,
          });
        }
      }

      const featureMap = new Map<string, Feature>();
      eligibilityApiResponse.features.forEach((f) => {
        if (f?.properties?.name) {
          featureMap.set(f.properties.name.toLowerCase(), f);
        }
      });

      CATEGORY_MAPPING.forEach((config) => {
        if (config.propertyMatch && config.propertyMatch !== "perimeter") {
          const feature = featureMap.get(config.propertyMatch.toLowerCase());
          if (feature?.geometry) {
            const area = interpreted?.[config.areaPropDerived] as number | undefined;
            newMapLayers.push({
              id: config.id,
              name: t(config.nameKey, config.defaultName),
              geometry: feature.geometry,
              color: config.color,
              area: area,
            });
          } else {
          }
        }
      });

      setMapLayerData(newMapLayers);
    } else if (!eligibilityApiResponse && farmGeometry) {
      const perimeterConfig = CATEGORY_MAPPING.find((c) => c.id === "perimeter");
      if (perimeterConfig) {
        setMapLayerData([
          {
            id: perimeterConfig.id,
            name: t(perimeterConfig.nameKey, perimeterConfig.defaultName),
            geometry: farmGeometry,
            color: perimeterConfig.color,
            area: selectedFarm?.farm?.size,
          },
        ]);
      } else {
        setMapLayerData(null); // Ensure map data is cleared if perimeter config not found
      }
    }
  }, [
    eligibilityApiResponse,
    selectedFarm?.farm?.size,
    farmGeometry,
    t,
    CATEGORY_MAPPING,
    interpretEligibilityResponse,
  ]);

  // --- Eligibility Check Handler ---
  const handleEligibilityCheck = useCallback(async () => {
    if (!selectedFarm?.farm) {
      toast.error(t("errors.noFarmSelected", "Please select a farm first."));
      return; // Restored fallback
    }
    if (!farmGeometry) {
      toast.error(
        t("errors.noGeometryForCheck", "Farm map data is missing or invalid. Cannot run check.")
      ); // Restored fallback
      setErrorFetchingGeometry(true);
      return;
    }

    const AREA_LIMIT_HA = 50000;
    if (selectedFarm.farm.size > AREA_LIMIT_HA) {
      // Restored original fallback text structure using interpolation
      const formattedSize = safeLocaleFormat(selectedFarm.farm.size);
      const formattedLimit = safeLocaleFormat(AREA_LIMIT_HA);
      toast.error(
        t(
          "errors.areaLimitExceeded",
          `Area limit exceeded: ${formattedSize} ha, max. ${formattedLimit} ha`
        )
      );
      return;
    }

    setEligibilityApiResponse(null);
    setDerivedEligibility(null);
    const perimeterLayer = mapLayerData?.find((l) => l.id === "perimeter");
    setMapLayerData(perimeterLayer ? [perimeterLayer] : null);

    let fileToSend: File | undefined;
    try {
      const feature = turf.feature(farmGeometry);
      const fileContent: FeatureCollection = turf.featureCollection([feature]);
      const blob = new Blob([JSON.stringify(fileContent)], { type: "application/geo+json" });
      const safeFarmName = selectedFarm.farm.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      fileToSend = new File([blob], `${safeFarmName}-${selectedFarm.farm.id}.geojson`, {
        type: "application/geo+json",
      });
    } catch (e: any) {
      console.error("Error creating geometry file:", e);
      toast.error(t("errors.prepGeometryFailed", "Preparing geometry data failed.")); // Restored fallback
      setLoadingStatus("failed");
      return;
    }

    try {
      const country = await getCountry();
      if (!country) return; // Error handling inside getCountry

      setLoadingStatus("checking_eligibility");

      const apiResponse = await checkEligibility(fileToSend, country, selectedFarm.farm.name);

      if (!apiResponse || typeof apiResponse !== "object" || !Array.isArray(apiResponse.features)) {
        console.error("Invalid API response structure:", apiResponse);
        throw new Error(
          t(
            "errors.invalidApiResponse",
            "Received an invalid response from the eligibility check service."
          )
        );
      }

      setEligibilityApiResponse(apiResponse);
      setLoadingStatus("success");
    } catch (error: any) {
      console.error("Eligibility check failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        t("errors.checkFailed", "Eligibility check failed."); // Restored fallback
      toast.error(errorMessage);
      setEligibilityApiResponse(null);
      setDerivedEligibility(null);
      setLoadingStatus("failed");
    }
  }, [selectedFarm, farmGeometry, t, getCountry, mapLayerData, safeLocaleFormat]);

  const handleGenerateReport = useCallback(() => {
    if (selectedFarm?.farm && derivedEligibility) {
      generatePdfReport(selectedFarm.farm, derivedEligibility);
    } else {
      console.error("Cannot generate report: Missing farm data or derived eligibility results.");
      toast.error(t("errors.reportGenerationFailed", "Could not generate report. Data missing.")); // Restored fallback
    }
  }, [selectedFarm, derivedEligibility, t]);

  const isCheckDisabled =
    !selectedFarm ||
    !farmGeometry ||
    loadingStatus === "fetching_geometry" ||
    loadingStatus === "determining_country" ||
    loadingStatus === "checking_eligibility";
  const showResultsArea =
    loadingStatus === "checking_eligibility" ||
    derivedEligibility ||
    (loadingStatus === "failed" && !eligibilityApiResponse);
  const showSummaryActions = loadingStatus === "success" && !!derivedEligibility;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{t("dashboard.regenPrograms", "Programas de Regeneración")}</CardTitle>{" "}
          {/* Restored fallback */}
        </div>
        <CardDescription>
          {t("dashboard.regenDesc", "Monetiza tu mejora ecológica")}
        </CardDescription>{" "}
        {/* Restored fallback */}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column (Information Panel) */}
          <div className="w-full md:w-1/2 space-y-4">
            {/* Farm Selector */}
            {farms.length > 1 && (
              <div className="mb-4">
                <Select
                  onValueChange={(farmId) => selectFarm(farmId)}
                  value={selectedFarm?.farm?.id ?? undefined}
                  disabled={loadingStatus === "checking_eligibility"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("dashboard.selectFarm", "Select a farm")} />{" "}
                    {/* Restored fallback */}
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
              !errorFetchingGeometry &&
              farmGeometry && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {/* Restored original fallback structure */}
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
                      {t("dashboard.runCheck", "Check de elegibilidad")} {/* Restored fallback */}
                    </Button>
                  </div>
                </div>
              )}

            {/* State 1b: Error Fetching Geometry or Geometry Missing */}
            {(errorFetchingGeometry ||
              (selectedFarm &&
                !farmGeometry &&
                loadingStatus === "idle" &&
                !loadingStatus.startsWith("fetching"))) && (
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 text-center">
                <Info className="h-5 w-5 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-orange-700 font-medium">
                  {errorFetchingGeometry
                    ? t("errors.geometryLoadFailedTitle", "Map Data Issue")
                    : t("dashboard.noGeometryTitle", "Missing Map Data")}{" "}
                  {/* Restored fallback */}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {errorFetchingGeometry
                    ? t(
                        "errors.geometryLoadFailedDesc",
                        "Could not load or access the map data for this farm. Please check the farm's map details or try again later."
                      )
                    : t(
                        "dashboard.noGeometryDesc",
                        "No map data could be found or loaded for this farm. Eligibility check requires map data."
                      )}{" "}
                  {/* Restored fallback */}
                </p>
              </div>
            )}

            {/* State 2: Loading Indicator */}
            {(loadingStatus === "determining_country" ||
              loadingStatus === "checking_eligibility") && (
              <div className="p-4 rounded-lg bg-muted/50 text-center space-y-2">
                <LoaderCircle className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-sm font-medium text-muted-foreground">
                  {loadingStatus === "determining_country" &&
                    t("dashboard.loading.determiningCountry", "Determining country...")}{" "}
                  {/* Restored fallback */}
                  {loadingStatus === "checking_eligibility" &&
                    t("dashboard.loading.checkingEligibility", "Running eligibility check...")}{" "}
                  {/* Restored fallback */}
                </p>
                {loadingStatus === "checking_eligibility" && (
                  <p className="text-xs text-muted-foreground/80">
                    {t("dashboard.loading.wait", "This may take up to a minute.")}
                  </p> /* Restored fallback */
                )}
              </div>
            )}

            {/* State 3: Displaying Results Breakdown */}
            {showResultsArea && selectedFarm && (
              <div className="space-y-3 mt-4">
                {CATEGORY_MAPPING.map((layerConfig) => (
                  <div
                    key={layerConfig.id}
                    className="flex items-center justify-between space-x-2 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <layerConfig.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {t(layerConfig.nameKey, layerConfig.defaultName)}
                      </span>
                    </div>

                    {loadingStatus === "checking_eligibility" && layerConfig.id !== "perimeter" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <span className="font-medium text-right">
                        {layerConfig.id === "perimeter"
                          ? formatAreaDisplay(selectedFarm.farm.size)
                          : derivedEligibility
                          ? formatAreaDisplay(
                              derivedEligibility?.[layerConfig.areaPropDerived] as
                                | number
                                | undefined
                            )
                          : loadingStatus !== "checking_eligibility" && loadingStatus !== "success"
                          ? "-"
                          : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* State 4: Results Summary and Actions */}
            {showSummaryActions && derivedEligibility && (
              <div className="space-y-4 mt-6">
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
                <div className="flex flex-col flex-column gap-2 mt-2 justify-center">
                  {derivedEligibility.eligibleAreaHa > 0 && (
                    <Button
                      onClick={() =>
                        toast.info(t("common.notImplemented", "Feature not yet implemented."))
                      } /* Restored fallback */
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {t("dashboard.applicateRegenProgram", "Inscribirme a un programa")}{" "}
                      {/* Restored fallback */}
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleGenerateReport}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {t("dashboard.downloadReport", "Reporte de elegibilidad")}{" "}
                    {/* Restored fallback */}
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* State 5: Failed Check */}
            {loadingStatus === "failed" && !derivedEligibility && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-center">
                <Info className="h-5 w-5 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-700 font-medium">
                  {t("dashboard.checkFailedTitle", "Eligibility Check Failed")}{" "}
                  {/* Restored fallback */}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {t(
                    "dashboard.checkFailedDesc",
                    "The eligibility check could not be completed. Please try again later or contact support if the issue persists."
                  )}{" "}
                  {/* Restored fallback */}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEligibilityCheck}
                  disabled={isCheckDisabled || !farmGeometry}
                  className="mt-3"
                >
                  {t("common.retry", "Retry Check")} {/* Restored fallback */}
                </Button>
              </div>
            )}
          </div>{" "}
          {/* End Left Column */}
          {/* Right Column (Map) */}
          <div className="w-full md:w-1/2 min-h-64 md:min-h-96 rounded-lg overflow-hidden relative bg-muted">
            {loadingStatus === "fetching_geometry" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : mapLayerData || farmGeometry ? (
              <EligibilityMap
                ref={mapRef}
                areaLayers={mapLayerData}
                perimeterGeometry={farmGeometry}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {errorFetchingGeometry
                    ? t("dashboard.mapErrorLoading", "Could not load map data.") // Restored fallback
                    : t("dashboard.mapNoData", "No map data available for this farm.")}{" "}
                  {/* Restored fallback */}
                </p>
              </div>
            )}
          </div>{" "}
          {/* End Right Column */}
        </div>{" "}
        {/* End flex container */}
      </CardContent>
    </Card>
  );
}

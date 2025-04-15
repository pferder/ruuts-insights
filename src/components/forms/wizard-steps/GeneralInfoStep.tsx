import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FarmFormValues } from "../FarmWizard";
import { GeoJSON } from "geojson";
import { useState, useEffect } from "react";
import { MapPreview } from "@/components/maps/MapPreview";
import { toast } from "sonner";
import * as toGeoJSON from "@mapbox/togeojson";
import { area } from "@turf/turf";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMapboxToken } from "@/config/mapbox";

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  text: string;
  properties: {
    short_code?: string;
  };
}

interface MapboxResponse {
  features: MapboxFeature[];
}

interface LocationInfo {
  country: string;
  countryCode: string;
  state: string;
  city: string;
}

interface GeneralInfoStepProps {
  form: UseFormReturn<FarmFormValues>;
  onGeoFileUpload: (geometry: GeoJSON.Geometry, file?: File) => void;
}

export function GeneralInfoStep({ form, onGeoFileUpload }: GeneralInfoStepProps) {
  const { t } = useTranslation();
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");
  const [geometry, setGeometry] = useState<GeoJSON.Geometry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [animatedArea, setAnimatedArea] = useState<number>(0);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (calculatedArea !== null && isMapReady) {
      // Esperar un momento adicional para asegurar que el mapa esté completamente cargado
      const timer = setTimeout(() => {
        const duration = 2000;
        const steps = 60;
        const increment = calculatedArea / steps;
        const interval = duration / steps;

        let currentStep = 0;
        const animationTimer = setInterval(() => {
          currentStep++;
          if (currentStep <= steps) {
            setAnimatedArea(Math.min(calculatedArea, currentStep * increment));
          } else {
            clearInterval(animationTimer);
          }
        }, interval);

        return () => clearInterval(animationTimer);
      }, 500); // Esperar 500ms después de que el mapa esté listo

      return () => clearTimeout(timer);
    }
  }, [calculatedArea, isMapReady]);

  useEffect(() => {
    const fetchLocationInfo = async (lat: number, lng: number) => {
      try {
        const token = await getMapboxToken();
        if (!token) {
          console.error("No se pudo obtener el token de Mapbox");
          return;
        }

        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place,region,country&access_token=${token}`);
        const data: MapboxResponse = await response.json();

        if (data.features && data.features.length > 0) {
          const features = data.features;
          const countryFeature = features.find((f) => f.place_type.includes("country"));
          const stateFeature = features.find((f) => f.place_type.includes("region"));
          const cityFeature = features.find((f) => f.place_type.includes("place"));

          const location: LocationInfo = {
            country: countryFeature?.text || "",
            countryCode: countryFeature?.properties?.short_code?.toUpperCase() || "",
            state: stateFeature?.text || "",
            city: cityFeature?.text || "",
          };

          setLocationInfo(location);
          form.setValue("location", `${location.city}, ${location.state}, ${location.country}`);
        }
      } catch (error) {
        console.error("Error fetching location info:", error);
      }
    };

    if (geometry) {
      if (geometry.type === "Point") {
        fetchLocationInfo(geometry.coordinates[1], geometry.coordinates[0]);
      } else if (geometry.type === "Polygon" && geometry.coordinates[0] && geometry.coordinates[0].length > 0) {
        const firstPoint = geometry.coordinates[0][0];
        fetchLocationInfo(firstPoint[1], firstPoint[0]);
      }
    }
  }, [geometry, form]);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("processing");
    setFileName(file.name);
    setError(null);

    try {
      const text = await readFileAsText(file);
      let parsedGeometry: GeoJSON.Geometry | null = null;

      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "geojson" || fileExtension === "json") {
        // Parse GeoJSON
        const geoJson = JSON.parse(text);
        if (geoJson.type === "FeatureCollection" && geoJson.features && geoJson.features.length > 0) {
          parsedGeometry = geoJson.features[0].geometry;
        } else if (geoJson.type === "Feature" && geoJson.geometry) {
          parsedGeometry = geoJson.geometry;
        } else if (geoJson.type && (geoJson.coordinates || geoJson.geometries)) {
          parsedGeometry = geoJson as GeoJSON.Geometry;
        }
      } else if (fileExtension === "kml") {
        // Parse KML
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(text, "text/xml");
        const geoJson = toGeoJSON.kml(kmlDoc);
        if (geoJson.type === "FeatureCollection" && geoJson.features && geoJson.features.length > 0) {
          parsedGeometry = geoJson.features[0].geometry;
        }
      }

      if (!parsedGeometry) {
        throw new Error("No se pudo extraer una geometría válida del archivo");
      }

      // Validar que la geometría sea un polígono o multipolígono
      if (parsedGeometry.type !== "Polygon" && parsedGeometry.type !== "MultiPolygon") {
        throw new Error("El archivo debe contener un polígono o multipolígono");
      }

      // Calcular el área en hectáreas
      const areaInSquareMeters = area(parsedGeometry);
      const areaInHectares = areaInSquareMeters / 10000;
      const roundedArea = Math.round(areaInHectares * 100) / 100;

      // Actualizar el formulario con el área calculada
      form.setValue("size", roundedArea);
      setCalculatedArea(roundedArea);

      setGeometry(parsedGeometry);
      onGeoFileUpload(parsedGeometry, file);
      setUploadStatus("success");

      toast.success(t("farmWizard.geoFileUploadSuccess", "Perímetro del establecimiento subido correctamente"));
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus("error");
      setError(error instanceof Error ? error.message : "Error al procesar el archivo");
      toast.error(t("farmWizard.geoFileErrorDescription", "Hubo un error al procesar el archivo geoespacial"));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium">{t("farmWizard.uploadBoundary", "Subir Perímetro")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("farmWizard.uploadBoundaryDescription", "Sube un archivo KML o GeoJSON con el perímetro de tu establecimiento")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="geo-file"
                  className="relative"
                >
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <FileUp className="mr-2 h-4 w-4" />
                      {t("farmWizard.uploadFile", "Subir Archivo")}
                    </span>
                  </Button>
                  <input
                    id="geo-file"
                    type="file"
                    accept=".kml,.geojson,.json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("common.error", "Error")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {uploadStatus === "processing" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                {t("farmWizard.processingFile", "Procesando archivo...")}
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="text-sm text-green-600">
                {t("farmWizard.fileUploaded", "Archivo subido correctamente")}: {fileName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {geometry && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapPreview
              geometry={geometry}
              height="300px"
              onMapReady={() => setIsMapReady(true)}
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="pt-6 space-y-6">
                {locationInfo && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {locationInfo.countryCode && (
                        <img
                          src={`https://flagcdn.com/w40/${locationInfo.countryCode.toLowerCase()}.png`}
                          alt={locationInfo.country}
                          className="w-10 h-8 rounded-sm"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">{t("farmWizard.country", "País")}</p>
                        <p className="font-medium">{locationInfo.country}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">{t("farmWizard.state", "Estado/Provincia")}</p>
                      <p className="font-medium">{locationInfo.state}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">{t("farmWizard.city", "Ciudad")}</p>
                      <p className="font-medium">{locationInfo.city}</p>
                    </div>
                  </div>
                )}

                {isMapReady && calculatedArea !== null && (
                  <div className="flex flex-col items-center justify-center p-4 bg-farm-green-50 rounded-lg border border-farm-green-200">
                    <span className="text-sm text-farm-green-700 mb-1">{t("forms.fields.size")}</span>
                    <span className="text-4xl font-bold text-farm-green-900 transition-all duration-300">{animatedArea.toFixed(2)}</span>
                    <span className="text-sm text-farm-green-600 mt-1">hectáreas</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.farmName", "Nombre del Establecimiento")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Green Meadows Ranch"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.location", "Ubicación")}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Provincia, País"
                      {...field}
                      disabled={locationInfo !== null}
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  </div>

                  {locationInfo && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        {locationInfo.countryCode && (
                          <img
                            src={`https://flagcdn.com/w20/${locationInfo.countryCode.toLowerCase()}.png`}
                            alt={locationInfo.country}
                            className="w-5 h-4 rounded-sm"
                            loading="lazy"
                          />
                        )}
                        <span className="text-sm">{locationInfo.country}</span>
                      </div>
                      <div className="text-sm">{locationInfo.state}</div>
                      <div className="text-sm">{locationInfo.city}</div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.farmSize", "Tamaño del Establecimiento (hectáreas)")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  disabled={geometry !== null}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ownerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.ownerName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>{t("farmWizard.contactEmail", "Email de Contacto (opcional)")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.country")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.state")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.city")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

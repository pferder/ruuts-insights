
import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FarmFormValues } from "../FarmWizard";
import { GeoJSON } from "geojson";
import { useState } from "react";
import { MapPreview } from "@/components/maps/MapPreview";

interface GeneralInfoStepProps {
  form: UseFormReturn<FarmFormValues>;
  onGeoFileUpload: (geometry: GeoJSON.Geometry, file?: File) => void;
}

export function GeneralInfoStep({ form, onGeoFileUpload }: GeneralInfoStepProps) {
  const { t } = useTranslation();
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string>("");
  const [geometry, setGeometry] = useState<GeoJSON.Geometry | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadStatus("processing");
    setFileName(file.name);
    
    try {
      // Read file
      const text = await readFileAsText(file);
      let parsedGeometry: GeoJSON.Geometry | null = null;
      
      // Process based on file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'geojson' || fileExtension === 'json') {
        // Parse GeoJSON
        const geoJson = JSON.parse(text);
        if (geoJson.type === 'FeatureCollection' && geoJson.features && geoJson.features.length > 0) {
          parsedGeometry = geoJson.features[0].geometry;
        } else if (geoJson.type === 'Feature' && geoJson.geometry) {
          parsedGeometry = geoJson.geometry;
        } else if (geoJson.type && (geoJson.coordinates || geoJson.geometries)) {
          parsedGeometry = geoJson as GeoJSON.Geometry;
        }
      } else if (fileExtension === 'kml' || fileExtension === 'kmz') {
        // For KML/KMZ, we'll use a simple polygon for now
        // In a real implementation, you would parse the KML/KMZ properly
        parsedGeometry = {
          type: "Polygon",
          coordinates: [
            [
              [-58.5, -34.5],
              [-58.4, -34.5],
              [-58.4, -34.4],
              [-58.5, -34.4],
              [-58.5, -34.5],
            ],
          ],
        };
      }
      
      if (parsedGeometry) {
        setGeometry(parsedGeometry);
        onGeoFileUpload(parsedGeometry, file);
        setUploadStatus("success");
      } else {
        throw new Error("No valid geometry found in the file");
      }
    } catch (error) {
      console.error("Error processing geo file:", error);
      setUploadStatus("error");
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-6">
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
                <div className="relative">
                  <Input
                    placeholder="Provincia, País"
                    {...field}
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
              <FormLabel>{t("farmWizard.ownerName", "Nombre del Propietario/Administrador")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Smith"
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
      </div>

      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-base font-medium mb-2">{t("farmWizard.farmBoundary", "Perímetro del Establecimiento")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("farmWizard.uploadDescription", "Suba un archivo KML, GeoJSON o Shapefile con el perímetro de su establecimiento")}
            </p>

            <div className="flex justify-center">
              <label
                htmlFor="geo-file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadStatus === "idle" && (
                    <>
                      <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-foreground">
                        <span className="font-medium">{t("farmWizard.clickToUpload", "Haga clic para subir")}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">KML, GeoJSON o Shapefile</p>
                    </>
                  )}
                  
                  {uploadStatus === "processing" && (
                    <>
                      <div className="w-8 h-8 mb-2 border-2 border-muted-foreground border-t-primary rounded-full animate-spin"></div>
                      <p className="text-sm text-foreground">Procesando archivo...</p>
                    </>
                  )}
                  
                  {uploadStatus === "success" && (
                    <>
                      <div className="w-8 h-8 mb-2 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-foreground">{fileName} cargado correctamente</p>
                      <p className="text-xs text-muted-foreground mt-1">Haga clic para cambiar</p>
                    </>
                  )}
                  
                  {uploadStatus === "error" && (
                    <>
                      <div className="w-8 h-8 mb-2 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </div>
                      <p className="text-sm text-foreground">Error al procesar el archivo</p>
                      <p className="text-xs text-muted-foreground mt-1">Haga clic para intentar nuevamente</p>
                    </>
                  )}
                </div>
                <input
                  id="geo-file-upload"
                  type="file"
                  accept=".kml,.geojson,.json,.zip,.shp,.kmz"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mostrar el mapa después de cargar un archivo geoespacial */}
      {geometry && (
        <div className="mt-4">
          <h4 className="text-base font-medium mb-2">{t("farmWizard.previewBoundary", "Vista previa del perímetro")}</h4>
          <MapPreview geometry={geometry} height="300px" />
        </div>
      )}
    </div>
  );
}

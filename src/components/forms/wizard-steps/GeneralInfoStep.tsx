
import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUp, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FarmFormValues } from "../FarmWizard";
import { GeoJSON } from "geojson";

interface GeneralInfoStepProps {
  form: UseFormReturn<FarmFormValues>;
  onGeoFileUpload: (geometry: GeoJSON.Geometry) => void;
}

export function GeneralInfoStep({ form, onGeoFileUpload }: GeneralInfoStepProps) {
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would parse KML/GeoJSON/Shapefile here
    // For now, we'll just simulate successful upload with a sample geometry
    const sampleGeometry: GeoJSON.Polygon = {
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

    onGeoFileUpload(sampleGeometry);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.farmName", "Farm Name")}</FormLabel>
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
              <FormLabel>{t("farmWizard.location", "Location")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="County, State"
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
              <FormLabel>{t("farmWizard.farmSize", "Farm Size (hectares)")}</FormLabel>
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
              <FormLabel>{t("farmWizard.ownerName", "Owner/Manager Name")}</FormLabel>
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
              <FormLabel>{t("farmWizard.contactEmail", "Contact Email (optional)")}</FormLabel>
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
            <h3 className="text-base font-medium mb-2">{t("farmWizard.farmBoundary", "Farm Boundary")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("farmWizard.uploadDescription", "Upload a KML, GeoJSON, or Shapefile with your farm's boundary")}
            </p>

            <div className="flex justify-center">
              <label
                htmlFor="geo-file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-foreground">
                    <span className="font-medium">{t("farmWizard.clickToUpload", "Click to upload")}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">KML, GeoJSON, or Shapefile</p>
                </div>
                <input
                  id="geo-file-upload"
                  type="file"
                  accept=".kml,.geojson,.json,.zip,.shp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

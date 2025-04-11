import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Leaf } from "lucide-react";
import { FarmFormValues } from "../FarmWizard";

interface GrazingInfoStepProps {
  form: UseFormReturn<FarmFormValues>;
}

export function GrazingInfoStep({ form }: GrazingInfoStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="totalPastures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.totalPastures", "Number of Pastures/Paddocks")}</FormLabel>
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
          name="averagePastureSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.averagePastureSize", "Average Pasture Size (hectares)")}</FormLabel>
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
          name="rotationsPerSeason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.rotationsPerSeason", "Average Rotations Per Season")}</FormLabel>
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
          name="restingDaysPerPasture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.restingDays", "Average Resting Days Per Pasture")}</FormLabel>
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
          name="grassTypes"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>{t("farmWizard.grassTypes", "Grass/Forage Types")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter grass types separated by commas (e.g., Fescue, Bluegrass, White Clover)"
                  {...field}
                />
              </FormControl>
              <FormDescription>{t("farmWizard.grassTypesDesc", "Enter the grass and forage species in your pastures, separated by commas.")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="soilHealthScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.soilHealthScore", "Soil Health Score (1-10, if known)")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5"
                  min="1"
                  max="10"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>{t("farmWizard.soilHealthScoreDesc", "Estimate the current soil health on a scale of 1-10.")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentForageDensity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.forageDensity", "Current Forage Density (kg/hectare, if known)")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>{t("farmWizard.forageDensityDesc", "Estimate the current forage production in kg per hectare.")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

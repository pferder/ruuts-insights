import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart } from "lucide-react";
import { FarmFormValues } from "../FarmWizard";

interface ProductionInfoStepProps {
  form: UseFormReturn<FarmFormValues>;
}

export function ProductionInfoStep({ form }: ProductionInfoStepProps) {
  const { t } = useTranslation();
  const { watch } = form;
  const productionType = watch("productionType");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="productionType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t("farmWizard.productionType", "Production Type")}</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="dairy"
                      id="dairy"
                    />
                    <label
                      htmlFor="dairy"
                      className="text-sm cursor-pointer"
                    >
                      {t("farmWizard.dairy", "Dairy")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="livestock"
                      id="livestock"
                    />
                    <label
                      htmlFor="livestock"
                      className="text-sm cursor-pointer"
                    >
                      {t("farmWizard.livestock", "Livestock")}
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {productionType === "livestock" && (
          <FormField
            control={form.control}
            name="livestockType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("farmWizard.livestockType", "Livestock Type")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("farmWizard.selectLivestockType", "Select livestock type")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="breeding">{t("farmWizard.breeding", "Breeding")}</SelectItem>
                    <SelectItem value="rearing">{t("farmWizard.rearing", "Rearing")}</SelectItem>
                    <SelectItem value="fattening">{t("farmWizard.fattening", "Fattening")}</SelectItem>
                    <SelectItem value="complete_cycle">{t("farmWizard.completeCycle", "Complete Cycle")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="supplementationKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.supplementation", "Supplementation (kg/animal/day)")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>{t("farmWizard.supplementationDesc", "Average amount of supplementary feed per animal per day")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

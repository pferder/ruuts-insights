import { useTranslation } from "react-i18next";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FarmFormValues } from "../FarmWizard";

interface CattleInfoStepProps {
  form: UseFormReturn<FarmFormValues>;
}

export function CattleInfoStep({ form }: CattleInfoStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="totalHead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.totalHead", "Total Head of Cattle")}</FormLabel>
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
          name="cattleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.cattleType", "Cattle Breed/Type")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Angus, Hereford, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="averageWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("farmWizard.averageWeight", "Average Weight (kg)")}</FormLabel>
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
          name="methodOfRaising"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t("farmWizard.methodOfRaising", "Method of Raising")}</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="conventional"
                      id="conventional"
                    />
                    <label
                      htmlFor="conventional"
                      className="text-sm cursor-pointer"
                    >
                      {t("farmWizard.conventional", "Conventional")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="regenerative"
                      id="regenerative"
                    />
                    <label
                      htmlFor="regenerative"
                      className="text-sm cursor-pointer"
                    >
                      {t("farmWizard.regenerative", "Regenerative")}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="mixed"
                      id="mixed"
                    />
                    <label
                      htmlFor="mixed"
                      className="text-sm cursor-pointer"
                    >
                      {t("farmWizard.mixed", "Mixed Approach")}
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

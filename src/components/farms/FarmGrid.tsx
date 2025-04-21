// src/components/farms/FarmGrid.tsx

import React, { useState } from "react";
import { FarmComplete } from "@/types/farm";
import { FarmCard } from "./FarmCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, ArrowRight, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { ComparativeMetrics } from "@/components/dashboard/ComparativeMetrics";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FarmGridProps {
  farms: FarmComplete[];
  isLoading?: boolean;
  viewMode?: "grid" | "list";
  compact?: boolean;
}

export function FarmGrid({
  farms,
  isLoading = false,
  viewMode = "grid",
  compact = false,
}: FarmGridProps) {
  const { t } = useTranslation();
  const [expandedFarmId, setExpandedFarmId] = useState<string | null>(null); // State to track expanded row

  const handleToggleExpand = (farmId: string) => {
    setExpandedFarmId((prevId) => (prevId === farmId ? null : farmId));
  };

  if (isLoading) {
    // ... loading skeleton ...
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-gray-100 animate-pulse rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (farms.length === 0) {
    // ... no farms message ...
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-farm-green-800">No farms found</h3>
        <p className="text-muted-foreground mt-2">Try a different search or add a new farm.</p>
      </div>
    );
  }

  // --- List View Logic ---
  if (viewMode === "list") {
    return (
      <div className="w-full overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.location")}</TableHead>
              <TableHead>{t("common.size")}</TableHead>
              {!compact && <TableHead>{t("common.lastUpdated")}</TableHead>}
              <TableHead className="text-right">{t("common.actions.learnMore")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farms.map((farm) => {
              const farmItemId = `metrics-${farm.farm.id}`;
              const isExpanded = expandedFarmId === farm.farm.id;

              return (
                // Use a single Fragment per farm iteration
                <React.Fragment key={farm.farm.id}>
                  {/* Main Row */}
                  <TableRow data-state={isExpanded ? "open" : "closed"}>
                    <TableCell className="font-medium">{farm.farm.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {farm.farm.location}
                      </div>
                    </TableCell>
                    <TableCell>{farm.farm.size} ha</TableCell>
                    {!compact && (
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(farm.farm.updatedAt), { addSuffix: true })}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {/* Regular Button to toggle state */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleExpand(farm.farm.id)}
                        className="mr-2 text-orange-500 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-400/10"
                        aria-expanded={isExpanded}
                        aria-controls={farmItemId}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {t("common.analysis", "Análisis")}
                        {isExpanded ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>

                      {/* Details Button */}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-farm-green-700 hover:text-farm-green-800"
                      >
                        <Link to={`/farms/${farm.farm.id}`}>
                          {t("common.details")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Accordion Content Row - Conditionally Rendered Content Inside */}
                  <TableRow>
                    <TableCell colSpan={compact ? 4 : 5} className="p-0 border-t-0">
                      {" "}
                      {/* Remove top border */}
                      {/* The Accordion now lives entirely within this cell */}
                      <Accordion
                        type="single"
                        collapsible
                        value={isExpanded ? farmItemId : undefined} // Control open state via value prop
                        // onValueChange is not needed as we control state externally
                      >
                        <AccordionItem value={farmItemId} className="border-none">
                          {/* Trigger is not needed visually, but required by Radix */}
                          <AccordionTrigger className="hidden"></AccordionTrigger>
                          <AccordionContent>
                            {" "}
                            {/* Radix handles animation */}
                            <div className="p-4 bg-muted/30 dark:bg-muted/10">
                              <ComparativeMetrics farm={farm} cardVariant="inner" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  // --- Grid View Logic ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map((farm) => (
        <FarmCard key={farm.farm.id} farm={farm} />
      ))}
    </div>
  );
}

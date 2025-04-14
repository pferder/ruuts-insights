
import { FarmComplete } from "@/types/farm";
import { FarmCard } from "./FarmCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";

interface FarmGridProps {
  farms: FarmComplete[];
  isLoading?: boolean;
  viewMode?: "grid" | "list";
  compact?: boolean;
}

export function FarmGrid({ farms, isLoading = false, viewMode = "grid", compact = false }: FarmGridProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-100 animate-pulse rounded-xl h-64"
          />
        ))}
      </div>
    );
  }
  
  if (farms.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-farm-green-800">No farms found</h3>
        <p className="text-muted-foreground mt-2">
          Try a different search or add a new farm.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("common.location")}</TableHead>
              <TableHead>{t("common.size")}</TableHead>
              {!compact && <TableHead>{t("common.lastUpdated")}</TableHead>}
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {farms.map((farm) => (
              <TableRow key={farm.farm.id}>
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
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map((farm) => (
        <FarmCard key={farm.farm.id} farm={farm} />
      ))}
    </div>
  );
}

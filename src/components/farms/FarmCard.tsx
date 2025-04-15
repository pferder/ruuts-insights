import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, MapPin, Ruler, User, PackagePlus, Leaf, ArrowRight } from "lucide-react";
import { FarmComplete } from "@/types/farm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { FarmMap } from "@/components/maps/FarmMap";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface FarmCardProps {
  farm: FarmComplete;
}

export function FarmCard({ farm }: FarmCardProps) {
  const { t } = useTranslation();
  const { farm: farmData, cattle, pasture } = farm;
  const [isMapReady, setIsMapReady] = useState(false);

  return (
    <Card className="dashboard-card h-full flex flex-col card-gradient-green">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-primary">{isMapReady ? farmData.name : <Skeleton className="h-6 w-32" />}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin
            size={16}
            className="mr-1"
          />
          <span>{isMapReady ? farmData.location : <Skeleton className="h-4 w-48" />}</span>
        </div>
      </CardHeader>

      <div className="h-60 w-full px-6 neumorph-inset dark:neumorph-dark-inset rounded-xl overflow-hidden">
        <FarmMap
          farm={farm}
          height="100%"
          showTooltip={false}
          animate={false}
          onMapReady={() => setIsMapReady(true)}
        />
      </div>

      <CardContent className="flex-1 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Ruler
              size={16}
              className="mr-2 text-secondary"
            />
            <span>{isMapReady ? `${farmData.size} hectares` : <Skeleton className="h-4 w-24" />}</span>
          </div>
          <div className="flex items-center text-sm">
            <User
              size={16}
              className="mr-2 text-secondary"
            />
            <span>{isMapReady ? farmData.ownerName : <Skeleton className="h-4 w-32" />}</span>
          </div>
          <div className="flex items-center text-sm">
            <PackagePlus
              size={16}
              className="mr-2 text-secondary"
            />
            <span>{isMapReady ? `${cattle.totalHead} ${cattle.cattleType}` : <Skeleton className="h-4 w-28" />}</span>
          </div>
          <div className="flex items-center text-sm">
            <Leaf
              size={16}
              className="mr-2 text-secondary"
            />
            <span>{isMapReady ? `${pasture.totalPastures} ${t("common.pastures")}` : <Skeleton className="h-4 w-24" />}</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground flex items-center">
          <Calendar
            size={14}
            className="mr-1"
          />
          {isMapReady ? `${t("common.updated")} ${formatDistanceToNow(new Date(farmData.updatedAt), { addSuffix: true })}` : <Skeleton className="h-3 w-40" />}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 neumorph-btn dark:neumorph-btn-dark"
        >
          <Link to={`/farms/${farmData.id}`}>
            {t("common.viewDetails")}
            <ArrowRight
              size={16}
              className="ml-2"
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

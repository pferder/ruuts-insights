
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Calendar, 
  MapPin, 
  Ruler, 
  User, 
  PackagePlus, 
  Leaf, 
  ArrowRight
} from "lucide-react";
import { FarmComplete } from "@/types/farm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface FarmCardProps {
  farm: FarmComplete;
}

export function FarmCard({ farm }: FarmCardProps) {
  const { t } = useTranslation();
  const { farm: farmData, cattle, pasture } = farm;
  
  return (
    <Card className="dashboard-card h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-primary">{farmData.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin size={16} className="mr-1" />
          <span>{farmData.location}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <Ruler size={16} className="mr-2 text-secondary" />
            <span>{farmData.size} hectares</span>
          </div>
          <div className="flex items-center text-sm">
            <User size={16} className="mr-2 text-secondary" />
            <span>{farmData.ownerName}</span>
          </div>
          <div className="flex items-center text-sm">
            <PackagePlus size={16} className="mr-2 text-secondary" />
            <span>{cattle.totalHead} {cattle.cattleType}</span>
          </div>
          <div className="flex items-center text-sm">
            <Leaf size={16} className="mr-2 text-secondary" />
            <span>{pasture.totalPastures} {t('common.pastures')}</span>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground flex items-center">
          <Calendar size={14} className="mr-1" />
          {t('common.updated')} {formatDistanceToNow(new Date(farmData.updatedAt), { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/farms/${farmData.id}`}>
            {t('common.viewDetails')}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


import { 
  ArrowRight,
  AlertCircle,
  Clock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { RecommendedAction } from "@/types/farm";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  action: RecommendedAction;
}

export function ActionCard({ action }: ActionCardProps) {
  const { t } = useTranslation();
  
  const getImpactColor = () => {
    switch (action.impact) {
      case "high": return "bg-theme-green-primary/10 text-theme-green-primary border-theme-green-primary/30";
      case "medium": return "bg-theme-blue-secondary/10 text-theme-blue-secondary border-theme-blue-secondary/30";
      case "low": return "bg-muted text-muted-foreground border-muted-foreground/30";
    }
  };
  
  const getTimeFrameColor = () => {
    switch (action.timeFrame) {
      case "short": return "bg-theme-teal-secondary/10 text-theme-teal-secondary border-theme-teal-secondary/30";
      case "medium": return "bg-theme-yellow-secondary/10 text-theme-yellow-secondary border-theme-yellow-secondary/30";
      case "long": return "bg-theme-orange-primary/10 text-theme-orange-primary border-theme-orange-primary/30";
    }
  };

  const getCategoryIcon = () => {
    switch (action.category) {
      case "pasture": return "🌿";
      case "cattle": return "🐄";
      case "soil": return "🌱";
      case "management": return "📊";
    }
  };

  return (
    <Card className="dashboard-card h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{action.title}</CardTitle>
          <div className="text-xl">{getCategoryIcon()}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1">
        <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn("flex items-center gap-1", getImpactColor())}>
            <AlertCircle size={12} />
            {t(`common.actions.impact.${action.impact}`)}
          </Badge>
          <Badge variant="outline" className={cn("flex items-center gap-1", getTimeFrameColor())}>
            <Clock size={12} />
            {t(`common.actions.timeFrame.${action.timeFrame}`)}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full text-secondary border-secondary hover:bg-secondary/10 hover:text-secondary">
          {t('common.actions.learnMore')}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

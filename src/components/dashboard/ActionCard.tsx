
import { 
  ArrowRight,
  AlertCircle,
  Clock
} from "lucide-react";
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
  const getImpactColor = () => {
    switch (action.impact) {
      case "high": return "bg-green-100 text-green-800 border-green-300";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-300";
      case "low": return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getTimeFrameColor = () => {
    switch (action.timeFrame) {
      case "short": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-300";
      case "long": return "bg-orange-100 text-orange-800 border-orange-300";
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
            {action.impact.charAt(0).toUpperCase() + action.impact.slice(1)} Impact
          </Badge>
          <Badge variant="outline" className={cn("flex items-center gap-1", getTimeFrameColor())}>
            <Clock size={12} />
            {action.timeFrame.charAt(0).toUpperCase() + action.timeFrame.slice(1)} Term
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full text-farm-green-700 border-farm-green-700 hover:bg-farm-green-50 hover:text-farm-green-800">
          Learn More
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

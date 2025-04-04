
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  current: number;
  potential: number;
  difference: number;
  unit: string;
  icon: React.ReactNode;
  colorClass?: string;
}

export function MetricCard({
  title,
  current,
  potential,
  difference,
  unit,
  icon,
  colorClass = "farm-green"
}: MetricCardProps) {
  const isPositive = difference >= 0;
  
  // Format numbers to avoid too many decimal places
  const formattedCurrent = Number.isInteger(current) ? current : current.toFixed(1);
  const formattedPotential = Number.isInteger(potential) ? potential : potential.toFixed(1);
  
  return (
    <div className={cn(
      "dashboard-card border-l-4",
      `border-l-${colorClass}-600`
    )}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          <div className="mt-1 text-2xl font-semibold">
            {formattedCurrent} <span className="text-sm font-normal">{unit}</span>
          </div>
        </div>
        <div className={cn(
          "p-2 rounded-full",
          `bg-${colorClass}-100`
        )}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div className={cn(
          "text-sm font-medium flex items-center",
          isPositive ? "text-farm-green-700" : "text-destructive"
        )}>
          {isPositive ? (
            <ArrowUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 mr-1" />
          )}
          <span>{Math.abs(difference)}%</span>
        </div>
        <div className="ml-2 text-xs text-muted-foreground">
          Potential: {formattedPotential} {unit}
        </div>
      </div>
    </div>
  );
}

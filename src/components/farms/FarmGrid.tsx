
import { FarmComplete } from "@/types/farm";
import { FarmCard } from "./FarmCard";

interface FarmGridProps {
  farms: FarmComplete[];
  isLoading?: boolean;
}

export function FarmGrid({ farms, isLoading = false }: FarmGridProps) {
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map((farm) => (
        <FarmCard key={farm.farm.id} farm={farm} />
      ))}
    </div>
  );
}


import { FarmComplete } from "@/types/farm";

// Calculate carbon footprint based on farm data
export const calculateCarbonFootprint = (farm: FarmComplete, year: string): number => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  const yearDiff = yearNum - currentYear;
  
  // Base calculation from carbon data
  const baseCarbonFootprint = farm.carbon ? farm.carbon.currentEmissions : 
    farm.cattle.totalHead * 2.5; // Fallback calculation
  
  // Apply yearly changes based on year difference
  if (yearDiff < 0) {
    // Past years had higher emissions (assuming improvements over time)
    return baseCarbonFootprint * (1 + Math.abs(yearDiff) * 0.02);
  } else if (yearDiff > 0) {
    // Future years projected to have lower emissions with current practices
    return baseCarbonFootprint * (1 - yearDiff * 0.01);
  }
  
  return baseCarbonFootprint;
};

// Calculate projected footprint with improved practices
export const calculateProjectedFootprint = (farm: FarmComplete, year: string): number => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  const yearDiff = yearNum - currentYear;
  
  // Base calculation from carbon data
  const baseProjectedFootprint = farm.carbon ? farm.carbon.potentialEmissions : 
    farm.cattle.totalHead * 1.8; // Fallback assuming 30% reduction
  
  // Apply yearly changes based on year difference
  if (yearDiff < 0) {
    // Past projections would have been higher
    return baseProjectedFootprint * (1 + Math.abs(yearDiff) * 0.015);
  } else if (yearDiff > 0) {
    // Future projections show continued improvement
    return baseProjectedFootprint * (1 - yearDiff * 0.02);
  }
  
  return baseProjectedFootprint;
};

// Calculate carbon sequestration potential
export const calculateSequestration = (farm: FarmComplete, year: string): number => {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  const yearDiff = yearNum - currentYear;
  
  // Base calculation from carbon data
  const baseSequestration = farm.carbon ? farm.carbon.currentCapture : 
    farm.pasture.totalPastures * farm.pasture.averagePastureSize * 0.5; // Fallback
  
  // Apply yearly changes based on year difference
  if (yearDiff < 0) {
    // Past sequestration was lower (assuming improvements over time)
    return baseSequestration * (1 - Math.abs(yearDiff) * 0.03);
  } else if (yearDiff > 0) {
    // Future sequestration increases with better practices
    return baseSequestration * (1 + yearDiff * 0.05);
  }
  
  return baseSequestration;
};

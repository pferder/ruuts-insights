
import { 
  CarbonData, 
  CattleData, 
  FarmComplete, 
  PastureData, 
  Projection, 
  ProjectionSet, 
  DashboardMetric,
  RecommendedAction
} from "@/types/farm";

// Calculate the carbon data based on the cattle and pasture data
export function calculateCarbonData(cattle: CattleData, pasture: PastureData): CarbonData {
  // These are simplified calculations for demonstration purposes
  // In a real app, these would be based on scientific models
  
  const currentEmissions = cattle.totalHead * 2.5; // Approximate tons of CO2 per head per year
  
  // Current capture based on pasture management
  const currentCapture = 
    pasture.totalPastures * 
    pasture.averagePastureSize * 
    (pasture.rotationsPerSeason * 0.2) * 
    (pasture.restingDaysPerPasture * 0.05);
  
  // Potential improvements under regenerative practices
  const potentialEmissions = currentEmissions * 0.7; // 30% reduction possible
  
  // Increased carbon capture with improved practices
  const potentialCapture = 
    pasture.totalPastures * 
    pasture.averagePastureSize * 
    (pasture.rotationsPerSeason * 1.5) * 0.4 * 
    (pasture.restingDaysPerPasture * 0.1);
  
  return {
    id: `carbon-${cattle.farmId}`,
    farmId: cattle.farmId,
    currentEmissions,
    currentCapture,
    potentialEmissions,
    potentialCapture
  };
}

// Generate projections for 2, 5, and 10 years
export function generateProjections(farm: FarmComplete): ProjectionSet {
  const twoYearProjections = generateProjectionForYears(farm, 2);
  const fiveYearProjections = generateProjectionForYears(farm, 5);
  const tenYearProjections = generateProjectionForYears(farm, 10);
  
  return {
    twoYear: twoYearProjections,
    fiveYear: fiveYearProjections,
    tenYear: tenYearProjections
  };
}

function generateProjectionForYears(farm: FarmComplete, years: number): Projection[] {
  const { cattle, pasture, carbon } = farm;
  
  // If no carbon data exists, calculate it
  const carbonData = carbon || calculateCarbonData(cattle, pasture);
  
  // Base values
  const baseSoilHealth = pasture.soilHealthScore || 5;
  const baseProduction = cattle.totalHead * cattle.averageWeight;
  const baseProfitability = baseProduction * 2.5; // simplified calculation
  
  // Current practice projection
  const currentProjection: Projection = {
    year: years,
    type: "current",
    cattleWeight: cattle.averageWeight * (1 + (years * 0.01)), // 1% annual growth
    totalProduction: baseProduction * (1 + (years * 0.02)), // 2% annual growth
    emissions: carbonData.currentEmissions * years,
    capture: carbonData.currentCapture * years,
    netCarbon: (carbonData.currentCapture - carbonData.currentEmissions) * years,
    soilHealth: Math.min(10, baseSoilHealth + (years * 0.1)), // Soil health improves slightly
    profitability: baseProfitability * (1 + (years * 0.03)) // 3% annual profit growth
  };
  
  // Regenerative practice projection - better improvements
  const regenerativeProjection: Projection = {
    year: years,
    type: "regenerative",
    cattleWeight: cattle.averageWeight * (1 + (years * 0.02)), // 2% annual growth
    totalProduction: baseProduction * (1 + (years * 0.04)), // 4% annual growth
    emissions: carbonData.potentialEmissions * years,
    capture: carbonData.potentialCapture * years,
    netCarbon: (carbonData.potentialCapture - carbonData.potentialEmissions) * years,
    soilHealth: Math.min(10, baseSoilHealth + (years * 0.3)), // Soil health improves dramatically
    profitability: baseProfitability * (1 + (years * 0.06)) // 6% annual profit growth
  };
  
  return [currentProjection, regenerativeProjection];
}

// Generate dashboard metrics for comparison
export function generateDashboardMetrics(farm: FarmComplete): DashboardMetric[] {
  const { cattle, pasture, carbon } = farm;
  const carbonData = carbon || calculateCarbonData(cattle, pasture);
  
  // Calculate net carbon
  const currentNetCarbon = carbonData.currentCapture - carbonData.currentEmissions;
  const potentialNetCarbon = carbonData.potentialCapture - carbonData.potentialEmissions;
  
  // Calculate soil health improvement potential
  const currentSoilHealth = pasture.soilHealthScore || 5;
  const potentialSoilHealth = Math.min(10, currentSoilHealth * 1.5);
  
  // Calculate potential productivity increase
  const currentProductivity = cattle.totalHead * cattle.averageWeight;
  const potentialProductivity = currentProductivity * 1.25; // 25% increase
  
  // Calculate profit per hectare
  const currentProfit = currentProductivity * 2.5 / farm.farm.size;
  const potentialProfit = potentialProductivity * 3 / farm.farm.size;
  
  return [
    {
      label: "Net Carbon Impact",
      current: currentNetCarbon,
      potential: potentialNetCarbon,
      unit: "tons CO2/year",
      improvement: calculatePercentageChange(currentNetCarbon, potentialNetCarbon),
      color: "farm-green"
    },
    {
      label: "Soil Health Score",
      current: currentSoilHealth,
      potential: potentialSoilHealth,
      unit: "/10",
      improvement: calculatePercentageChange(currentSoilHealth, potentialSoilHealth),
      color: "farm-brown"
    },
    {
      label: "Cattle Production",
      current: currentProductivity,
      potential: potentialProductivity,
      unit: "kg",
      improvement: calculatePercentageChange(currentProductivity, potentialProductivity),
      color: "farm-gold"
    },
    {
      label: "Profit per Hectare",
      current: currentProfit,
      potential: potentialProfit,
      unit: "$/ha",
      improvement: calculatePercentageChange(currentProfit, potentialProfit),
      color: "farm-green"
    }
  ];
}

// Helper to calculate percentage change
function calculatePercentageChange(current: number, potential: number): number {
  if (current === 0) return potential > 0 ? 100 : 0;
  return Math.round(((potential - current) / Math.abs(current)) * 100);
}

// Generate recommended actions based on farm data
export function generateRecommendedActions(farm: FarmComplete): RecommendedAction[] {
  const { cattle, pasture } = farm;
  const actions: RecommendedAction[] = [];
  
  // Check rotations per season
  if (pasture.rotationsPerSeason < 4) {
    actions.push({
      id: "rotation-1",
      title: "Increase Pasture Rotation Frequency",
      description: "Implement more frequent rotations to improve pasture recovery and soil health.",
      impact: "high",
      timeFrame: "short",
      category: "pasture"
    });
  }
  
  // Check resting days
  if (pasture.restingDaysPerPasture < 40) {
    actions.push({
      id: "rest-1",
      title: "Extend Pasture Resting Periods",
      description: "Allow pastures to rest longer between grazing periods to promote deeper root growth and soil regeneration.",
      impact: "high",
      timeFrame: "medium",
      category: "pasture"
    });
  }
  
  // Check grass diversity
  if (pasture.grassTypes.length < 3) {
    actions.push({
      id: "diversity-1",
      title: "Increase Plant Diversity",
      description: "Introduce a wider variety of grass and legume species to improve ecosystem resilience and nutrition.",
      impact: "medium",
      timeFrame: "medium",
      category: "pasture"
    });
  }
  
  // Check cattle density
  const cattleDensity = cattle.totalHead / (pasture.totalPastures * pasture.averagePastureSize);
  if (cattleDensity > 2) { // Assuming 2 cattle per hectare is high density
    actions.push({
      id: "density-1",
      title: "Optimize Grazing Density",
      description: "Adjust cattle density per pasture to prevent overgrazing and promote plant recovery.",
      impact: "medium",
      timeFrame: "short",
      category: "cattle"
    });
  }
  
  // Always recommend soil testing
  actions.push({
    id: "soil-1",
    title: "Implement Regular Soil Testing",
    description: "Monitor soil health indicators and adjust management practices based on results.",
    impact: "medium",
    timeFrame: "long",
    category: "soil"
  });
  
  return actions;
}

// Export farm data to CSV format
export function exportFarmDataToCsv(farm: FarmComplete): string {
  const { farm: farmData, cattle, pasture, carbon } = farm;
  const carbonData = carbon || calculateCarbonData(cattle, pasture);
  
  const headers = [
    "Farm Name",
    "Location",
    "Size (ha)",
    "Owner",
    "Cattle Total",
    "Cattle Type",
    "Average Weight (kg)",
    "Method of Raising",
    "Total Pastures",
    "Average Pasture Size (ha)",
    "Rotations Per Season",
    "Resting Days Per Pasture",
    "Grass Types",
    "Soil Health Score",
    "Current CO2 Emissions (tons/year)",
    "Current CO2 Capture (tons/year)",
    "Potential CO2 Emissions (tons/year)",
    "Potential CO2 Capture (tons/year)"
  ];
  
  const values = [
    farmData.name,
    farmData.location,
    farmData.size,
    farmData.ownerName,
    cattle.totalHead,
    cattle.cattleType,
    cattle.averageWeight,
    cattle.methodOfRaising,
    pasture.totalPastures,
    pasture.averagePastureSize,
    pasture.rotationsPerSeason,
    pasture.restingDaysPerPasture,
    pasture.grassTypes.join("; "),
    pasture.soilHealthScore || "N/A",
    carbonData.currentEmissions,
    carbonData.currentCapture,
    carbonData.potentialEmissions,
    carbonData.potentialCapture
  ];
  
  return headers.join(",") + "\n" + values.join(",");
}

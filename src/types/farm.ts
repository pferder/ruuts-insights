
export type FarmData = {
  id: string;
  name: string;
  location: string;
  size: number; // in hectares
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CattleData = {
  id: string;
  farmId: string;
  totalHead: number;
  cattleType: string;
  averageWeight: number; // in kg
  methodOfRaising: "conventional" | "regenerative" | "mixed";
};

export type PastureData = {
  id: string;
  farmId: string;
  totalPastures: number;
  averagePastureSize: number; // in hectares
  rotationsPerSeason: number;
  restingDaysPerPasture: number;
  grassTypes: string[];
  soilHealthScore?: number; // 1-10
  currentForageDensity?: number; // kg/hectare
};

export type CarbonData = {
  id: string;
  farmId: string;
  currentEmissions: number; // tons of CO2 per year
  currentCapture: number; // tons of CO2 per year
  potentialEmissions: number; // tons of CO2 per year under regenerative practices
  potentialCapture: number; // tons of CO2 per year under regenerative practices
};

export type FarmComplete = {
  farm: FarmData;
  cattle: CattleData;
  pasture: PastureData;
  carbon?: CarbonData;
};

export type Projection = {
  year: number;
  type: "current" | "regenerative";
  cattleWeight: number;
  totalProduction: number;
  emissions: number;
  capture: number;
  netCarbon: number;
  soilHealth: number;
  profitability: number;
};

export type ProjectionSet = {
  twoYear: Projection[];
  fiveYear: Projection[];
  tenYear: Projection[];
};

export type DashboardMetric = {
  label: string;
  current: number;
  potential: number;
  unit: string;
  improvement: number; // percentage
  color: string;
};

export type RecommendedAction = {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  timeFrame: "short" | "medium" | "long";
  category: "pasture" | "cattle" | "soil" | "management";
};

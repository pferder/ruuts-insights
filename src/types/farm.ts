export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FarmData {
  id: string;
  name: string;
  location: string;
  size: number; // in hectares
  coordinates: Coordinates;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CropData {
  id: string;
  name: string;
  area: number;
}

export interface CattleData {
  id: string;
  type: string;
  quantity: number;
}

export interface PastureData {
  id: string;
  type: string;
  area: number;
}

export type CarbonData = {
  id: string;
  farmId: string;
  currentEmissions: number; // tons of CO2 per year
  currentCapture: number; // tons of CO2 per year
  potentialEmissions: number; // tons of CO2 per year under regenerative practices
  potentialCapture: number; // tons of CO2 per year under regenerative practices
};

export interface FarmComplete {
  farm: FarmData;
  crops: CropData[];
  cattle?: CattleData[];
  pasture?: PastureData[];
  carbon?: CarbonData;
}

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

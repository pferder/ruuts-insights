import { FeatureCollection, Geometry } from "geojson";

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
  contactEmail?: string;
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
  farmId?: string;
  totalHead: number;
  cattleType: string;
  averageWeight: number;
  methodOfRaising: "conventional" | "regenerative" | "mixed";
}

export interface PastureData {
  id: string;
  farmId?: string;
  totalPastures: number;
  averagePastureSize: number;
  rotationsPerSeason: number;
  restingDaysPerPasture: number;
  grassTypes: string[] | string;
  soilHealthScore?: number;
  currentForageDensity?: number; // kg/hectare
}

export type CarbonData = {
  id: string;
  farmId: string;
  currentEmissions: number; // tons of CO2 per year
  currentCapture: number; // tons of CO2 per year
  potentialEmissions: number; // tons of CO2 per year under regenerative practices
  potentialCapture: number; // tons of CO2 per year under regenerative practices
};

export interface RegionalAverages {
  biomassDensity: number; // kg/hectare
  animalLoad: number; // animals per hectare
  paddockCount: number;
  rotationsCount: number;
  carbonCapture: number; // tons CO2/year/hectare
  carbonEmissions: number; // tons CO2/year/hectare
}

export interface FarmComplete {
  farm: FarmData;
  crops: CropData[];
  cattle: CattleData;
  pasture: PastureData;
  carbon?: CarbonData;
  regionalAverages?: RegionalAverages;
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

export type EligibilityApiResponse = FeatureCollection<Geometry, { [name: string]: any }>;

export interface DerivedEligibilityResult {
  message: string;
  totalUploadedAreaHa?: number;
  deforestationAreaHa?: number;
  deforestationYears?: number[];
  forestAreaHa?: number;
  wetlandsAreaHa?: number;
  eligibleAreaHa?: number;
}
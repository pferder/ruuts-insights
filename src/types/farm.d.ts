export interface FarmData {
  id: string;
  name: string;
  location: string;
  size: number;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
  contactEmail?: string;
  coordinates?: any; // This would be a GeoJSON structure in a real implementation
}

export interface CattleData {
  id: string;
  farmId: string;
  totalHead: number;
  cattleType: string;
  averageWeight: number;
  methodOfRaising: "conventional" | "regenerative" | "mixed";
}

export interface PastureData {
  id: string;
  farmId: string;
  totalPastures: number;
  averagePastureSize: number;
  rotationsPerSeason: number;
  restingDaysPerPasture: number;
  grassTypes: string[];
  soilHealthScore?: number;
  currentForageDensity?: number;
  productionType?: "dairy" | "livestock";
  livestockType?: "breeding" | "rearing" | "fattening" | "complete_cycle";
  supplementationKg?: number;
}

export interface RegionalAverages {
  biomassDensity?: number;
  animalLoad?: number;
  paddockCount?: number;
  rotationsCount?: number;
  carbonCapture?: number;
  carbonEmissions?: number;
}

export interface FarmComplete {
  farm: FarmData;
  cattle: CattleData;
  pasture: PastureData;
  regionalAverages: RegionalAverages;
}


import { 
  FarmData, 
  CattleData, 
  PastureData, 
  CarbonData, 
  FarmComplete 
} from "@/types/farm";
import { calculateCarbonData } from "./farm-utils";

export const mockFarms: FarmData[] = [
  {
    id: "farm-1",
    name: "Green Valley Ranch",
    location: "Montana, USA",
    size: 1200,
    coordinates: { lat: 46.8797, lng: -110.3626 }, // Montana coordinates
    ownerName: "John Smith",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-12-10")
  },
  {
    id: "farm-2",
    name: "Highland Cattle Co.",
    location: "Colorado, USA",
    size: 850,
    coordinates: { lat: 39.5501, lng: -105.7821 }, // Colorado coordinates
    ownerName: "Maria Rodriguez",
    createdAt: new Date("2022-06-22"),
    updatedAt: new Date("2023-11-05")
  },
  {
    id: "farm-3",
    name: "Sunset Meadows",
    location: "Wyoming, USA",
    size: 2100,
    coordinates: { lat: 43.0760, lng: -107.2903 }, // Wyoming coordinates
    ownerName: "Robert Johnson",
    createdAt: new Date("2021-03-10"),
    updatedAt: new Date("2023-10-18")
  }
];

export const mockCattle: CattleData[] = [
  {
    id: "cattle-1",
    farmId: "farm-1",
    totalHead: 450,
    cattleType: "Angus",
    averageWeight: 580,
    methodOfRaising: "conventional"
  },
  {
    id: "cattle-2",
    farmId: "farm-2",
    totalHead: 320,
    cattleType: "Hereford",
    averageWeight: 620,
    methodOfRaising: "mixed"
  },
  {
    id: "cattle-3",
    farmId: "farm-3",
    totalHead: 780,
    cattleType: "Angus/Hereford Mix",
    averageWeight: 540,
    methodOfRaising: "conventional"
  }
];

export const mockPastures: PastureData[] = [
  {
    id: "pasture-1",
    farmId: "farm-1",
    totalPastures: 12,
    averagePastureSize: 95,
    rotationsPerSeason: 3,
    restingDaysPerPasture: 30,
    grassTypes: ["Fescue", "Bluegrass", "White Clover"],
    soilHealthScore: 6,
    currentForageDensity: 4200
  },
  {
    id: "pasture-2",
    farmId: "farm-2",
    totalPastures: 8,
    averagePastureSize: 104,
    rotationsPerSeason: 5,
    restingDaysPerPasture: 45,
    grassTypes: ["Timothy", "Orchard Grass", "Red Clover", "Alfalfa"],
    soilHealthScore: 7,
    currentForageDensity: 5100
  },
  {
    id: "pasture-3",
    farmId: "farm-3",
    totalPastures: 18,
    averagePastureSize: 110,
    rotationsPerSeason: 2,
    restingDaysPerPasture: 25,
    grassTypes: ["Bermuda Grass", "Bahia Grass"],
    soilHealthScore: 5,
    currentForageDensity: 3800
  }
];

// Generate carbon data based on cattle and pasture data
export const mockCarbon: CarbonData[] = [
  calculateCarbonData(mockCattle[0], mockPastures[0]),
  calculateCarbonData(mockCattle[1], mockPastures[1]),
  calculateCarbonData(mockCattle[2], mockPastures[2])
];

// Combine data into complete farm objects
export const mockFarmData: FarmComplete[] = mockFarms.map((farm, index) => ({
  farm,
  cattle: mockCattle[index],
  pasture: mockPastures[index],
  carbon: mockCarbon[index],
  crops: [] // Add empty crops array to conform to FarmComplete interface
}));

// Function to get a complete farm by ID
export function getFarmById(id: string): FarmComplete | undefined {
  return mockFarmData.find(farm => farm.farm.id === id);
}

// Function to search farms by name
export function searchFarms(query: string): FarmComplete[] {
  if (!query) return mockFarmData;
  
  const lowerQuery = query.toLowerCase();
  return mockFarmData.filter(farm => 
    farm.farm.name.toLowerCase().includes(lowerQuery) || 
    farm.farm.location.toLowerCase().includes(lowerQuery) ||
    farm.farm.ownerName.toLowerCase().includes(lowerQuery)
  );
}

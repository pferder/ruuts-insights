import React, { createContext, useContext, useState, useEffect } from "react";
import { FarmComplete, FarmData, CattleData, PastureData, CarbonData, RegionalAverages } from "@/types/farm";
import { mockFarmData, getFarmById as getMockFarmById } from "@/lib/mock-data";
import { calculateCarbonData } from "@/lib/farm-utils";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

interface FarmContextType {
  farms: FarmComplete[];
  selectedFarm: FarmComplete | null;
  loading: boolean;
  error: string | null;
  getFarmById: (id: string) => FarmComplete | null;
  createFarm: (newFarm: Omit<FarmData, "id" | "createdAt" | "updatedAt" | "coordinates">, 
                cattle: Omit<CattleData, "id" | "farmId">, 
                pasture: Omit<PastureData, "id" | "farmId">,
                regionalAverages?: RegionalAverages) => void;
  updateFarm: (farmId: string, 
               farmData?: Partial<FarmData>, 
               cattleData?: Partial<CattleData>, 
               pastureData?: Partial<PastureData>,
               regionalAveragesPartial?: Partial<RegionalAverages>) => void;
  deleteFarm: (farmId: string) => void;
  selectFarm: (farmId: string) => void;
  searchFarms: (query: string) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farms, setFarms] = useState<FarmComplete[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<FarmComplete[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      setTimeout(() => {
        setFarms(mockFarmData);
        setFilteredFarms(mockFarmData);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError("Failed to load farm data");
      setLoading(false);
    }
  }, []);

  const getFarmById = (id: string): FarmComplete | null => {
    const farm = farms.find(f => f.farm.id === id);
    return farm || null;
  };

  const createFarm = (
    newFarmData: Omit<FarmData, "id" | "createdAt" | "updatedAt" | "coordinates">,
    newCattleData: Omit<CattleData, "id" | "farmId">,
    newPastureData: Omit<PastureData, "id" | "farmId">,
    regionalAverages?: RegionalAverages
  ) => {
    const farmId = `farm-${uuidv4()}`;
    const now = new Date();
    
    const farm: FarmData = {
      id: farmId,
      ...newFarmData,
      coordinates: { lat: Math.random() * 10 + 30, lng: Math.random() * 10 - 90 },
      createdAt: now,
      updatedAt: now
    };
    
    const cattle: CattleData = {
      id: `cattle-${uuidv4()}`,
      farmId,
      ...newCattleData
    };
    
    const pasture: PastureData = {
      id: `pasture-${uuidv4()}`,
      farmId,
      ...newPastureData
    };
    
    const carbon = calculateCarbonData(cattle, pasture);
    
    const newFarm: FarmComplete = {
      farm,
      cattle,
      pasture,
      carbon,
      regionalAverages,
      crops: []
    };
    
    setFarms(prev => [...prev, newFarm]);
    setFilteredFarms(prev => [...prev, newFarm]);
    toast.success(`Farm "${farm.name}" created successfully`);
    return newFarm;
  };

  const updateFarm = (
    farmId: string, 
    farmData?: Partial<FarmData>, 
    cattleData?: Partial<CattleData>, 
    pastureData?: Partial<PastureData>,
    regionalAveragesPartial?: Partial<RegionalAverages>
  ) => {
    setFarms(prev => {
      return prev.map(item => {
        if (item.farm.id === farmId) {
          const updatedFarm = { 
            ...item.farm, 
            ...farmData, 
            updatedAt: new Date() 
          };
          
          const updatedCattle = cattleData 
            ? { ...item.cattle, ...cattleData } 
            : item.cattle;
          
          const updatedPasture = pastureData 
            ? { ...item.pasture, ...pastureData } 
            : item.pasture;
          
          const updatedRegionalAverages = regionalAveragesPartial
            ? item.regionalAverages 
              ? { ...item.regionalAverages, ...regionalAveragesPartial }
              : {
                  biomassDensity: regionalAveragesPartial.biomassDensity || 3500,
                  animalLoad: regionalAveragesPartial.animalLoad || 1.5,
                  paddockCount: regionalAveragesPartial.paddockCount || 6,
                  rotationsCount: regionalAveragesPartial.rotationsCount || 3,
                  carbonCapture: regionalAveragesPartial.carbonCapture || 5,
                  carbonEmissions: regionalAveragesPartial.carbonEmissions || 7,
                }
            : item.regionalAverages;
          
          const updatedCarbon = (cattleData || pastureData) 
            ? calculateCarbonData(updatedCattle, updatedPasture) 
            : item.carbon;
          
          return {
            farm: updatedFarm,
            cattle: updatedCattle,
            pasture: updatedPasture,
            carbon: updatedCarbon,
            regionalAverages: updatedRegionalAverages,
            crops: item.crops
          };
        }
        return item;
      });
    });
    
    setFilteredFarms(prev => {
      return prev.map(item => {
        if (item.farm.id === farmId) {
          const updatedFarm = { 
            ...item.farm, 
            ...farmData, 
            updatedAt: new Date() 
          };
          
          const updatedCattle = cattleData 
            ? { ...item.cattle, ...cattleData } 
            : item.cattle;
          
          const updatedPasture = pastureData 
            ? { ...item.pasture, ...pastureData } 
            : item.pasture;
          
          const updatedRegionalAverages = regionalAveragesPartial
            ? item.regionalAverages 
              ? { ...item.regionalAverages, ...regionalAveragesPartial }
              : {
                  biomassDensity: regionalAveragesPartial.biomassDensity || 3500,
                  animalLoad: regionalAveragesPartial.animalLoad || 1.5,
                  paddockCount: regionalAveragesPartial.paddockCount || 6,
                  rotationsCount: regionalAveragesPartial.rotationsCount || 3,
                  carbonCapture: regionalAveragesPartial.carbonCapture || 5,
                  carbonEmissions: regionalAveragesPartial.carbonEmissions || 7,
                }
            : item.regionalAverages;
          
          const updatedCarbon = (cattleData || pastureData) 
            ? calculateCarbonData(updatedCattle, updatedPasture) 
            : item.carbon;
          
          return {
            farm: updatedFarm,
            cattle: updatedCattle,
            pasture: updatedPasture,
            carbon: updatedCarbon,
            regionalAverages: updatedRegionalAverages,
            crops: item.crops
          };
        }
        return item;
      });
    });
    
    if (selectedFarm && selectedFarm.farm.id === farmId) {
      const updatedFarm = getFarmById(farmId);
      if (updatedFarm) {
        setSelectedFarm(updatedFarm);
      }
    }
    
    toast.success("Farm updated successfully");
  };

  const deleteFarm = (farmId: string) => {
    setFarms(prev => prev.filter(farm => farm.farm.id !== farmId));
    setFilteredFarms(prev => prev.filter(farm => farm.farm.id !== farmId));
    
    if (selectedFarm && selectedFarm.farm.id === farmId) {
      setSelectedFarm(null);
    }
    
    toast.success("Farm deleted successfully");
  };

  const selectFarm = (farmId: string) => {
    const farm = getFarmById(farmId);
    setSelectedFarm(farm);
  };

  const searchFarms = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFarms(farms);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const results = farms.filter(farm => 
      farm.farm.name.toLowerCase().includes(lowerQuery) || 
      farm.farm.location.toLowerCase().includes(lowerQuery) ||
      farm.farm.ownerName.toLowerCase().includes(lowerQuery)
    );
    
    setFilteredFarms(results);
  };

  const value = {
    farms: filteredFarms,
    selectedFarm,
    loading,
    error,
    getFarmById,
    createFarm,
    updateFarm,
    deleteFarm,
    selectFarm,
    searchFarms
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return context;
};

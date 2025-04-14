
import React, { createContext, useContext, useState, useEffect } from "react";
import { FarmComplete, FarmData, CattleData, PastureData, CarbonData, RegionalAverages, Coordinates } from "@/types/farm";
import { calculateCarbonData } from "@/lib/farm-utils";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client"; 
import { useAuth } from "@/hooks/useAuth";

interface FarmContextType {
  farms: FarmComplete[];
  selectedFarm: FarmComplete | null;
  loading: boolean;
  error: string | null;
  hasFarms: boolean;
  getFarmById: (id: string) => FarmComplete | null;
  createFarm: (newFarm: Omit<FarmData, "id" | "createdAt" | "updatedAt">, 
                cattle: Omit<CattleData, "id" | "farmId">, 
                pasture: Omit<PastureData, "id" | "farmId">,
                regionalAverages?: RegionalAverages,
                productionData?: any) => Promise<FarmComplete | null>;
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
  const [hasFarms, setHasFarms] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFarms();
    } else {
      setFarms([]);
      setFilteredFarms([]);
      setLoading(false);
      setHasFarms(false);
    }
  }, [user]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (farmError) throw farmError;
      
      if (!farmData || farmData.length === 0) {
        setFarms([]);
        setFilteredFarms([]);
        setLoading(false);
        setHasFarms(false);
        return;
      }
      
      setHasFarms(true);
      
      const completeFarms: FarmComplete[] = [];
      
      for (const farm of farmData) {
        const { data: cattleData, error: cattleError } = await supabase
          .from('cattle')
          .select('*')
          .eq('farm_id', farm.id)
          .single();
        
        if (cattleError && cattleError.code !== 'PGRST116') throw cattleError;
        
        const { data: pastureData, error: pastureError } = await supabase
          .from('pastures')
          .select('*')
          .eq('farm_id', farm.id)
          .single();
        
        if (pastureError && pastureError.code !== 'PGRST116') throw pastureError;
        
        if (cattleData && pastureData) {
          const carbon = calculateCarbonData({
            totalHead: cattleData.total_head,
            cattleType: cattleData.cattle_type,
            averageWeight: cattleData.average_weight,
            methodOfRaising: cattleData.method_of_raising as "conventional" | "regenerative" | "mixed",
            id: cattleData.id,
            farmId: cattleData.farm_id
          }, {
            totalPastures: pastureData.total_pastures,
            averagePastureSize: pastureData.average_pasture_size,
            rotationsPerSeason: pastureData.rotations_per_season,
            restingDaysPerPasture: pastureData.resting_days_per_pasture,
            grassTypes: pastureData.grass_types,
            soilHealthScore: pastureData.soil_health_score,
            currentForageDensity: pastureData.current_forage_density,
            id: pastureData.id,
            farmId: pastureData.farm_id
          });
          
          const coordinates: Coordinates = farm.coordinates as Coordinates;
          
          completeFarms.push({
            farm: {
              id: farm.id,
              name: farm.name,
              location: farm.location,
              size: farm.size,
              ownerName: farm.owner_name,
              coordinates: coordinates,
              contactEmail: farm.contact_email || undefined,
              createdAt: new Date(farm.created_at),
              updatedAt: new Date(farm.updated_at)
            },
            cattle: {
              id: cattleData.id,
              farmId: cattleData.farm_id,
              totalHead: cattleData.total_head,
              cattleType: cattleData.cattle_type,
              averageWeight: cattleData.average_weight,
              methodOfRaising: cattleData.method_of_raising as "conventional" | "regenerative" | "mixed"
            },
            pasture: {
              id: pastureData.id,
              farmId: pastureData.farm_id,
              totalPastures: pastureData.total_pastures,
              averagePastureSize: pastureData.average_pasture_size,
              rotationsPerSeason: pastureData.rotations_per_season,
              restingDaysPerPasture: pastureData.resting_days_per_pasture,
              grassTypes: pastureData.grass_types,
              soilHealthScore: pastureData.soil_health_score,
              currentForageDensity: pastureData.current_forage_density
            },
            carbon,
            crops: [],
            regionalAverages: {
              biomassDensity: 3500,
              animalLoad: 1.5,
              paddockCount: 6,
              rotationsCount: 3,
              carbonCapture: 5,
              carbonEmissions: 7
            }
          });
        }
      }
      
      setFarms(completeFarms);
      setFilteredFarms(completeFarms);
    } catch (err) {
      console.error('Error fetching farms:', err);
      setError("Error al cargar los establecimientos");
    } finally {
      setLoading(false);
    }
  };

  const getFarmById = (id: string): FarmComplete | null => {
    const farm = farms.find(f => f.farm.id === id);
    return farm || null;
  };

  const createFarm = async (
    newFarmData: Omit<FarmData, "id" | "createdAt" | "updatedAt">,
    newCattleData: Omit<CattleData, "id" | "farmId">,
    newPastureData: Omit<PastureData, "id" | "farmId">,
    regionalAverages?: RegionalAverages,
    productionData?: any
  ): Promise<FarmComplete | null> => {
    try {
      if (!user) {
        toast.error("Debe iniciar sesión para crear un establecimiento");
        return null;
      }
      
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .insert({
          user_id: user.id,
          name: newFarmData.name,
          location: newFarmData.location,
          size: newFarmData.size,
          owner_name: newFarmData.ownerName,
          coordinates: newFarmData.coordinates,
          contact_email: newFarmData.contactEmail
        })
        .select()
        .single();
      
      if (farmError) throw farmError;
      
      const { data: cattleData, error: cattleError } = await supabase
        .from('cattle')
        .insert({
          farm_id: farmData.id,
          total_head: newCattleData.totalHead,
          cattle_type: newCattleData.cattleType,
          average_weight: newCattleData.averageWeight,
          method_of_raising: newCattleData.methodOfRaising
        })
        .select()
        .single();
      
      if (cattleError) throw cattleError;
      
      let grassTypes = newPastureData.grassTypes;
      if (typeof grassTypes === 'string') {
        grassTypes = grassTypes.split(',').map(type => type.trim());
      }
      
      const { data: pastureData, error: pastureError } = await supabase
        .from('pastures')
        .insert({
          farm_id: farmData.id,
          total_pastures: newPastureData.totalPastures,
          average_pasture_size: newPastureData.averagePastureSize,
          rotations_per_season: newPastureData.rotationsPerSeason,
          resting_days_per_pasture: newPastureData.restingDaysPerPasture,
          grass_types: grassTypes,
          soil_health_score: newPastureData.soilHealthScore,
          current_forage_density: newPastureData.currentForageDensity
        })
        .select()
        .single();
      
      if (pastureError) throw pastureError;
      
      const cattleObj: CattleData = {
        id: cattleData.id,
        farmId: cattleData.farm_id,
        totalHead: cattleData.total_head,
        cattleType: cattleData.cattle_type,
        averageWeight: cattleData.average_weight,
        methodOfRaising: cattleData.method_of_raising as "conventional" | "regenerative" | "mixed"
      };
      
      const pastureObj: PastureData = {
        id: pastureData.id,
        farmId: pastureData.farm_id,
        totalPastures: pastureData.total_pastures,
        averagePastureSize: pastureData.average_pasture_size,
        rotationsPerSeason: pastureData.rotations_per_season,
        restingDaysPerPasture: pastureData.resting_days_per_pasture,
        grassTypes: pastureData.grass_types,
        soilHealthScore: pastureData.soil_health_score,
        currentForageDensity: pastureData.current_forage_density
      };
      
      const carbon = calculateCarbonData(cattleObj, pastureObj);
      const coordinates: Coordinates = farmData.coordinates as Coordinates;
      
      const newFarm: FarmComplete = {
        farm: {
          id: farmData.id,
          name: farmData.name,
          location: farmData.location,
          size: farmData.size,
          ownerName: farmData.owner_name,
          coordinates: coordinates,
          contactEmail: farmData.contact_email || undefined,
          createdAt: new Date(farmData.created_at),
          updatedAt: new Date(farmData.updated_at)
        },
        cattle: cattleObj,
        pasture: pastureObj,
        carbon,
        crops: [],
        regionalAverages: regionalAverages || {
          biomassDensity: 3500,
          animalLoad: 1.5,
          paddockCount: 6,
          rotationsCount: 3,
          carbonCapture: 5,
          carbonEmissions: 7
        }
      };
      
      setFarms(prev => [newFarm, ...prev]);
      setFilteredFarms(prev => [newFarm, ...prev]);
      setHasFarms(true);
      
      toast.success(`Establecimiento "${newFarm.farm.name}" creado correctamente`);
      return newFarm;
    } catch (error) {
      console.error("Error creating farm:", error);
      toast.error("Error al crear el establecimiento");
      return null;
    }
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

  const deleteFarm = async (farmId: string) => {
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);
        
      if (error) throw error;
      
      setFarms(prev => prev.filter(farm => farm.farm.id !== farmId));
      setFilteredFarms(prev => prev.filter(farm => farm.farm.id !== farmId));
      
      if (selectedFarm && selectedFarm.farm.id === farmId) {
        setSelectedFarm(null);
      }
      
      if (farms.length <= 1) {
        setHasFarms(false);
      }
      
      toast.success("Establecimiento eliminado correctamente");
    } catch (err) {
      console.error("Error deleting farm:", err);
      toast.error("Error al eliminar el establecimiento");
    }
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
    hasFarms,
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

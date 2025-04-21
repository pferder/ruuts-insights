// src/context/FarmContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  FarmComplete,
  FarmData,
  CattleData,
  PastureData,
  CarbonData,
  RegionalAverages,
  Coordinates,
} from "@/types/farm";
import { calculateCarbonData } from "@/lib/farm-utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TablesInsert } from "@/integrations/supabase/types"; // Import Supabase type

interface FarmContextType {
  farms: FarmComplete[]; // This will hold the master list
  filteredFarms: FarmComplete[]; // This will hold the list used for display (after search/filter)
  selectedFarm: FarmComplete | null;
  loading: boolean; // Indicates initial load or major refetch
  isFetching: boolean; // Indicates if a background fetch is happening
  error: string | null;
  hasFarms: boolean; // Derived from master list
  getFarmById: (id: string) => FarmComplete | null;
  createFarm: (
    newFarm: Omit<FarmData, "id" | "createdAt" | "updatedAt">,
    cattle: Omit<CattleData, "id" | "farmId">,
    pasture: Omit<PastureData, "id" | "farmId">,
    regionalAverages?: RegionalAverages,
    productionData?: any
  ) => Promise<FarmComplete | null>;
  updateFarm: (
    farmId: string,
    farmData?: Partial<FarmData>,
    cattleData?: Partial<CattleData>,
    pastureData?: Partial<PastureData>,
    regionalAveragesPartial?: Partial<RegionalAverages>
  ) => Promise<void>;
  deleteFarm: (farmId: string) => Promise<void>;
  selectFarm: (farmId: string) => void;
  searchFarms: (query: string) => void;
  refetchFarms: (force?: boolean) => Promise<void>; // Allow forcing refetch
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [farms, setFarms] = useState<FarmComplete[]>([]); // Master list
  const [filteredFarms, setFilteredFarms] = useState<FarmComplete[]>([]); // Display list
  const [selectedFarm, setSelectedFarm] = useState<FarmComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const userId = user?.id; // Extract stable ID

  // --- Fetch Logic (Stable) ---
  const fetchFarms = useCallback(
    async (forceRefetch = false) => {
      // Prevent fetching if not logged in OR if already fetching (unless forced)
      if (!userId) {
        setLoading(false); // Ensure loading stops if fetch skipped early
        setIsFetching(false);
        return;
      }
      if (isFetching && !forceRefetch) {
        return; // Don't stack fetches unless forced
      }

      setIsFetching(true);
      if (forceRefetch) setLoading(true); // Only show full loading indicator on forced refetch/initial
      setError(null);

      // Store the currently selected farm ID *before* fetching
      const currentSelectedFarmId = selectedFarm?.farm.id;

      try {
        const { data: farmData, error: farmError } = await supabase
          .from("farms")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (farmError) throw new Error(farmError.message || "Failed to fetch farms");

        if (!farmData || farmData.length === 0) {
          setFarms([]);
          setFilteredFarms([]);
          setSelectedFarm(null);
          return; // Exit early
        }

        const farmIds = farmData.map((f) => f.id);
        const [cattleResult, pastureResult] = await Promise.all([
          supabase.from("cattle").select("*").in("farm_id", farmIds),
          supabase.from("pastures").select("*").in("farm_id", farmIds),
        ]);

        if (cattleResult.error)
          throw new Error(cattleResult.error.message || "Failed to fetch cattle data");
        if (pastureResult.error)
          throw new Error(pastureResult.error.message || "Failed to fetch pasture data");

        const cattleMap = new Map(cattleResult.data?.map((c) => [c.farm_id, c]) || []);
        const pastureMap = new Map(pastureResult.data?.map((p) => [p.farm_id, p]) || []);

        const completeFarms: FarmComplete[] = farmData
          .map((farm) => {
            const cattleData = cattleMap.get(farm.id);
            const pastureData = pastureMap.get(farm.id);

            if (cattleData && pastureData) {
              const cattleObj: CattleData = {
                id: cattleData.id,
                farmId: cattleData.farm_id,
                totalHead: cattleData.total_head,
                cattleType: cattleData.cattle_type,
                averageWeight: cattleData.average_weight,
                methodOfRaising: cattleData.method_of_raising as any,
              };
              const pastureObj: PastureData = {
                id: pastureData.id,
                farmId: pastureData.farm_id,
                totalPastures: pastureData.total_pastures,
                averagePastureSize: pastureData.average_pasture_size,
                rotationsPerSeason: pastureData.rotations_per_season,
                restingDaysPerPasture: pastureData.resting_days_per_pasture,
                grassTypes: pastureData.grass_types || [],
                soilHealthScore: pastureData.soil_health_score,
                currentForageDensity: pastureData.current_forage_density,
              };
              const carbon = calculateCarbonData(cattleObj, pastureObj);
              const coordinates = (farm.coordinates as Coordinates) || { lat: 0, lng: 0 };
              return {
                farm: {
                  id: farm.id,
                  name: farm.name,
                  location: farm.location,
                  size: farm.size,
                  ownerName: farm.owner_name,
                  coordinates: coordinates,
                  contactEmail: farm.contact_email || undefined,
                  createdAt: new Date(farm.created_at),
                  updatedAt: new Date(farm.updated_at),
                },
                cattle: cattleObj,
                pasture: pastureObj,
                carbon,
                crops: [],
                regionalAverages: {
                  /* defaults */ biomassDensity: 3500,
                  animalLoad: 1.5,
                  paddockCount: 6,
                  rotationsCount: 3,
                  carbonCapture: 5,
                  carbonEmissions: 7,
                },
              };
            }
            return null;
          })
          .filter((farm): farm is FarmComplete => farm !== null);

        setFarms(completeFarms); // Update master list

        // Update filtered list based on current search query
        const lowerQuery = searchQuery.toLowerCase().trim();
        setFilteredFarms(
          !lowerQuery
            ? completeFarms
            : completeFarms.filter(
                (farm) =>
                  farm.farm.name.toLowerCase().includes(lowerQuery) ||
                  farm.farm.location.toLowerCase().includes(lowerQuery) ||
                  farm.farm.ownerName.toLowerCase().includes(lowerQuery)
              )
        );

        // Re-select based on the ID stored *before* the fetch
        if (currentSelectedFarmId) {
          const reselected = completeFarms.find((f) => f.farm.id === currentSelectedFarmId);
          // Only call setSelectedFarm if the selection actually changes or needs resetting
          // This prevents loops if the selectedFarm object reference changes but id is the same
          if (selectedFarm?.farm.id !== reselected?.farm.id) {
            setSelectedFarm(reselected || null);
          } else {
          }
        } else {
          // Ensure selection is cleared if nothing was selected before
          if (selectedFarm !== null) setSelectedFarm(null);
        }
      } catch (err: any) {
        console.error("[FarmProvider] Error during fetchFarms:", err);
        setError(err.message || "Error loading farms");
        setFarms([]);
        setFilteredFarms([]);
        setSelectedFarm(null);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
      // REMOVED selectedFarm from dependencies
      // Depend on stable userId, isFetching flag, and searchQuery for filtering logic
    },
    [userId, isFetching, searchQuery, calculateCarbonData]
  ); // Added calculateCarbonData dependency

  // --- Effect to trigger fetch based on userId ---
  useEffect(() => {
    if (userId) {
      fetchFarms(true); // Trigger initial fetch / refetch on login
    } else {
      // Clear state on logout
      setFarms([]);
      setFilteredFarms([]);
      setSelectedFarm(null);
      setError(null);
      setLoading(false); // Make sure loading is false
      setIsFetching(false); // Reset fetching flag
    }
    // Do NOT include fetchFarms here if it causes loops.
    // The fetch is triggered manually within based on userId.
  }, [userId]);

  // --- Log state changes (for debugging) ---
  useEffect(() => {}, [loading, isFetching, farms, error, selectedFarm]);

  // --- Derived State ---
  const derivedHasFarms = farms.length > 0;

  // --- Memoized Callbacks ---
  const getFarmById = useCallback(
    (id: string): FarmComplete | null => {
      const farm = farms.find((f) => f.farm.id === id);
      return farm || null;
    },
    [farms]
  ); // Depends on master list 'farms'

  const createFarm = useCallback(
    async (
      newFarmData: Omit<FarmData, "id" | "createdAt" | "updatedAt">,
      newCattleData: Omit<CattleData, "id" | "farmId">,
      newPastureData: Omit<PastureData, "id" | "farmId">,
      regionalAverages?: RegionalAverages,
      productionData?: any
    ): Promise<FarmComplete | null> => {
      if (!userId) {
        toast.error("You must be logged in to create a farm");
        console.error("[FarmProvider] Create farm failed: No user logged in.");
        return null;
      }
      setIsFetching(true);
      let createdFarm: FarmComplete | null = null;
      try {
        const { data: farmDbData, error: farmError } = await supabase
          .from("farms")
          .insert({ user_id: userId, ...newFarmData })
          .select()
          .single();
        if (farmError) throw farmError;
        const { data: cattleDbData, error: cattleError } = await supabase
          .from("cattle")
          .insert({ farm_id: farmDbData.id, ...newCattleData })
          .select()
          .single();
        if (cattleError) throw cattleError;
        let grassTypesArray = newPastureData.grassTypes;
        if (typeof grassTypesArray === "string")
          grassTypesArray = grassTypesArray
            .split(",")
            .map((type) => type.trim())
            .filter(Boolean);
        grassTypesArray = Array.isArray(grassTypesArray) ? grassTypesArray : [];
        const { data: pastureDbData, error: pastureError } = await supabase
          .from("pastures")
          .insert({ farm_id: farmDbData.id, ...newPastureData, grass_types: grassTypesArray })
          .select()
          .single();
        if (pastureError) throw pastureError;

        // Construct the complete farm object
        const cattleObj: CattleData = {
          id: cattleDbData.id,
          farmId: cattleDbData.farm_id,
          totalHead: cattleDbData.total_head,
          cattleType: cattleDbData.cattle_type,
          averageWeight: cattleDbData.average_weight,
          methodOfRaising: cattleDbData.method_of_raising as any,
        };
        const pastureObj: PastureData = {
          id: pastureDbData.id,
          farmId: pastureDbData.farm_id,
          totalPastures: pastureDbData.total_pastures,
          averagePastureSize: pastureDbData.average_pasture_size,
          rotationsPerSeason: pastureDbData.rotations_per_season,
          restingDaysPerPasture: pastureDbData.resting_days_per_pasture,
          grassTypes: pastureDbData.grass_types || [],
          soilHealthScore: pastureDbData.soil_health_score,
          currentForageDensity: pastureDbData.current_forage_density,
        };
        const carbon = calculateCarbonData(cattleObj, pastureObj);
        const coordinates = (farmDbData.coordinates as Coordinates) || { lat: 0, lng: 0 };

        createdFarm = {
          farm: {
            id: farmDbData.id,
            name: farmDbData.name,
            location: farmDbData.location,
            size: farmDbData.size,
            ownerName: farmDbData.owner_name,
            coordinates: coordinates,
            contactEmail: farmDbData.contact_email || undefined,
            createdAt: new Date(farmDbData.created_at),
            updatedAt: new Date(farmDbData.updated_at),
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
            carbonEmissions: 7,
          },
        };

        // Update local state
        setFarms((prev) =>
          [createdFarm!, ...prev].sort(
            (a, b) => b.farm.createdAt.getTime() - a.farm.createdAt.getTime()
          )
        );
        const lowerQuery = searchQuery.toLowerCase().trim();
        setFilteredFarms((prev) => {
          const newList = [createdFarm!, ...prev];
          const sortedList = newList.sort(
            (a, b) => b.farm.createdAt.getTime() - a.farm.createdAt.getTime()
          );
          return !lowerQuery
            ? sortedList
            : sortedList.filter(
                (farm) =>
                  farm.farm.name.toLowerCase().includes(lowerQuery) ||
                  farm.farm.location.toLowerCase().includes(lowerQuery) ||
                  farm.farm.ownerName.toLowerCase().includes(lowerQuery)
              );
        });

        toast.success(`Farm "${createdFarm.farm.name}" created successfully`);
      } catch (error: any) {
        console.error("[FarmProvider] Error creating farm:", error);
        const supabaseError = error?.message ? `: ${error.message}` : "";
        toast.error(`Error creating farm${supabaseError}`);
        createdFarm = null;
      } finally {
        setIsFetching(false);
      }
      return createdFarm;
    },
    [userId, searchQuery, calculateCarbonData]
  ); // Use userId, include calculateCarbonData

  const updateFarm = useCallback(
    async (
      farmId: string,
      farmDataUpdate?: Partial<FarmData>,
      cattleDataUpdate?: Partial<CattleData>,
      pastureDataUpdate?: Partial<PastureData>,
      regionalAveragesPartial?: Partial<RegionalAverages>
    ) => {
      const currentFarmIndex = farms.findIndex((f) => f.farm.id === farmId); // Check master list
      if (currentFarmIndex === -1) {
        console.error(`[FarmProvider] Farm ${farmId} not found for update.`);
        toast.error("Farm not found.");
        return;
      }
      setIsFetching(true);

      try {
        // Prepare DB updates filtering undefined values
        const farmDbUpdate: Partial<TablesInsert<"farms">> = Object.entries(farmDataUpdate || {})
          .filter(([, value]) => value !== undefined)
          .reduce((acc, [key, value]) => {
            const dbKeyMap: Record<string, string> = {
              ownerName: "owner_name",
              contactEmail: "contact_email",
            };
            acc[dbKeyMap[key] || (key as keyof TablesInsert<"farms">)] = value;
            return acc;
          }, {} as Partial<TablesInsert<"farms">>);
        farmDbUpdate.updated_at = new Date().toISOString();

        const cattleDbUpdate: Partial<TablesInsert<"cattle">> = Object.entries(
          cattleDataUpdate || {}
        )
          .filter(([, value]) => value !== undefined)
          .reduce((acc, [key, value]) => {
            const dbKeyMap: Record<string, string> = {
              totalHead: "total_head",
              cattleType: "cattle_type",
              averageWeight: "average_weight",
              methodOfRaising: "method_of_raising",
            };
            acc[dbKeyMap[key] || (key as keyof TablesInsert<"cattle">)] = value;
            return acc;
          }, {} as Partial<TablesInsert<"cattle">>);

        const pastureDbUpdate: Partial<TablesInsert<"pastures">> = Object.entries(
          pastureDataUpdate || {}
        )
          .filter(([, value]) => value !== undefined)
          .reduce((acc, [key, value]) => {
            const dbKeyMap: Record<string, string> = {
              totalPastures: "total_pastures",
              averagePastureSize: "average_pasture_size",
              rotationsPerSeason: "rotations_per_season",
              restingDaysPerPasture: "resting_days_per_pasture",
              grassTypes: "grass_types",
              soilHealthScore: "soil_health_score",
              currentForageDensity: "current_forage_density",
            };
            let finalValue = value;
            if (key === "grassTypes") {
              finalValue = Array.isArray(value)
                ? value
                : typeof value === "string"
                ? value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                : [];
            }
            acc[dbKeyMap[key] || (key as keyof TablesInsert<"pastures">)] = finalValue;
            return acc;
          }, {} as Partial<TablesInsert<"pastures">>);

        // Perform DB updates
        if (Object.keys(farmDbUpdate).length > 1) {
          const { error } = await supabase.from("farms").update(farmDbUpdate).eq("id", farmId);
          if (error) throw error;
        }
        if (Object.keys(cattleDbUpdate).length > 0) {
          const { error } = await supabase
            .from("cattle")
            .update(cattleDbUpdate)
            .eq("farm_id", farmId);
          if (error) throw error;
        }
        if (Object.keys(pastureDbUpdate).length > 0) {
          const { error } = await supabase
            .from("pastures")
            .update(pastureDbUpdate)
            .eq("farm_id", farmId);
          if (error) throw error;
        }

        // Refetch after successful update
        await fetchFarms(true);

        toast.success("Farm updated successfully");
      } catch (error: any) {
        console.error(`[FarmProvider] Error updating farm ${farmId}:`, error);
        const supabaseError = error?.message ? `: ${error.message}` : "";
        toast.error(`Error updating farm${supabaseError}`);
      } finally {
        setIsFetching(false);
      }
    },
    [farms, fetchFarms]
  ); // Depend on master list 'farms' and fetchFarms

  const deleteFarm = useCallback(
    async (farmId: string): Promise<void> => {
      setIsFetching(true);
      try {
        // Delete related records first
        await supabase.from("cattle").delete().eq("farm_id", farmId);
        await supabase.from("pastures").delete().eq("farm_id", farmId);
        await supabase.from("farm_geospatial").delete().eq("farm_id", farmId).maybeSingle();

        // Delete the main farm record
        const { error: farmDeleteError } = await supabase.from("farms").delete().eq("id", farmId);
        if (farmDeleteError) throw farmDeleteError;

        // Update local state using functional updates
        setFarms((prevFarms) => prevFarms.filter((farm) => farm.farm.id !== farmId));
        setFilteredFarms((prevFiltered) => prevFiltered.filter((farm) => farm.farm.id !== farmId));

        if (selectedFarm?.farm.id === farmId) {
          setSelectedFarm(null);
        }

        toast.success("Farm deleted successfully");
      } catch (err: any) {
        console.error("[FarmProvider] Error deleting farm:", err);
        const supabaseError = err?.message ? `: ${err.message}` : "";
        toast.error(`Error deleting farm${supabaseError}`);
        await fetchFarms(true); // Refetch on error
      } finally {
        setIsFetching(false);
      }
    },
    [selectedFarm, fetchFarms]
  ); // Removed farms dep, fetchFarms is stable

  const selectFarm = useCallback(
    (farmId: string) => {
      const farm = getFarmById(farmId); // Uses useCallback version of getFarmById
      setSelectedFarm(farm);
    },
    [getFarmById]
  ); // Depends on stable getFarmById

  const searchFarms = useCallback(
    (query: string) => {
      setSearchQuery(query); // Update search query state
      const lowerQuery = query.toLowerCase().trim();
      setFilteredFarms(
        // Update filtered list based on master 'farms' list
        !lowerQuery
          ? farms
          : farms.filter(
              (farm) =>
                farm.farm.name.toLowerCase().includes(lowerQuery) ||
                farm.farm.location.toLowerCase().includes(lowerQuery) ||
                farm.farm.ownerName.toLowerCase().includes(lowerQuery)
            )
      );
    },
    [farms]
  ); // Depends only on master 'farms' list

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      farms: farms, // Provide the master list always
      filteredFarms: filteredFarms, // Provide the filtered list for display
      selectedFarm,
      loading,
      isFetching, // Expose isFetching state
      error,
      hasFarms: derivedHasFarms,
      getFarmById,
      createFarm,
      updateFarm,
      deleteFarm,
      selectFarm,
      searchFarms,
      refetchFarms: () => fetchFarms(true),
    }),
    [
      farms,
      filteredFarms,
      selectedFarm,
      loading,
      isFetching,
      error,
      derivedHasFarms,
      getFarmById,
      createFarm,
      updateFarm,
      deleteFarm,
      selectFarm,
      searchFarms,
      fetchFarms,
    ]
  );

  return <FarmContext.Provider value={contextValue}>{children}</FarmContext.Provider>;
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return context;
};

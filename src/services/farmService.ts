import { FarmComplete } from "@/types/farm";
import { mockFarms } from "@/mocks/farmData";

export const farmService = {
  /**
   * Obtiene todas las granjas
   * @returns Promise<FarmComplete[]>
   */
  getAllFarms: async (): Promise<FarmComplete[]> => {
    // Simulamos una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockFarms);
      }, 500);
    });
  },

  /**
   * Obtiene una granja por su ID
   * @param id ID de la granja
   * @returns Promise<FarmComplete | undefined>
   */
  getFarmById: async (id: string): Promise<FarmComplete | undefined> => {
    // Simulamos una llamada a API
    return new Promise((resolve) => {
      setTimeout(() => {
        const farm = mockFarms.find((f) => f.farm.id === id);
        resolve(farm);
      }, 500);
    });
  },
};

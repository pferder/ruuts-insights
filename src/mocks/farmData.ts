
import { FarmComplete } from "@/types/farm";

export const mockFarms: FarmComplete[] = [
  {
    farm: {
      id: "1",
      name: "Granja El Amanecer",
      location: "Pergamino, Buenos Aires",
      size: 150,
      coordinates: {
        lat: -33.8969,
        lng: -60.5722,
      },
      ownerName: "Juan Pérez",
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2024-03-10"),
    },
    crops: [
      { id: "1", name: "Soja", area: 50 },
      { id: "2", name: "Maíz", area: 100 },
    ],
    cattle: {
      id: "c-1",
      farmId: "1",
      totalHead: 100,
      cattleType: "Aberdeen Angus",
      averageWeight: 450,
      methodOfRaising: "conventional"
    },
    pasture: {
      id: "p-1",
      farmId: "1",
      totalPastures: 5,
      averagePastureSize: 20,
      rotationsPerSeason: 3,
      restingDaysPerPasture: 30,
      grassTypes: ["Festuca", "Alfalfa"],
      soilHealthScore: 6,
      currentForageDensity: 3800
    }
  },
  {
    farm: {
      id: "2",
      name: "Estancia San Juan",
      location: "Río Cuarto, Córdoba",
      size: 300,
      coordinates: {
        lat: -33.1232,
        lng: -64.3493,
      },
      ownerName: "María González",
      createdAt: new Date("2023-02-20"),
      updatedAt: new Date("2024-03-10"),
    },
    crops: [
      { id: "3", name: "Trigo", area: 150 },
      { id: "4", name: "Girasol", area: 150 },
    ],
    cattle: {
      id: "c-2",
      farmId: "2",
      totalHead: 200,
      cattleType: "Hereford",
      averageWeight: 520,
      methodOfRaising: "mixed"
    },
    pasture: {
      id: "p-2",
      farmId: "2",
      totalPastures: 8,
      averagePastureSize: 25,
      rotationsPerSeason: 4,
      restingDaysPerPasture: 40,
      grassTypes: ["Ryegrass", "Trébol Blanco", "Festuca"],
      soilHealthScore: 7,
      currentForageDensity: 4500
    }
  },
  {
    farm: {
      id: "3",
      name: "La Pradera",
      location: "Venado Tuerto, Santa Fe",
      size: 200,
      coordinates: {
        lat: -33.7458,
        lng: -61.9649,
      },
      ownerName: "Carlos Rodríguez",
      createdAt: new Date("2023-03-10"),
      updatedAt: new Date("2024-03-10"),
    },
    crops: [
      { id: "5", name: "Soja", area: 100 },
      { id: "6", name: "Maíz", area: 100 },
    ],
    cattle: {
      id: "c-3",
      farmId: "3",
      totalHead: 150,
      cattleType: "Braford",
      averageWeight: 480,
      methodOfRaising: "conventional"
    },
    pasture: {
      id: "p-3",
      farmId: "3",
      totalPastures: 6,
      averagePastureSize: 22,
      rotationsPerSeason: 3,
      restingDaysPerPasture: 35,
      grassTypes: ["Alfalfa", "Trébol Rojo", "Festuca"],
      soilHealthScore: 6,
      currentForageDensity: 4200
    }
  },
  {
    farm: {
      id: "4",
      name: "Los Girasoles",
      location: "Gualeguaychú, Entre Ríos",
      size: 250,
      coordinates: {
        lat: -33.0169,
        lng: -58.5172,
      },
      ownerName: "Ana Martínez",
      createdAt: new Date("2023-04-05"),
      updatedAt: new Date("2024-03-10"),
    },
    crops: [
      { id: "7", name: "Girasol", area: 150 },
      { id: "8", name: "Trigo", area: 100 },
    ],
    cattle: {
      id: "c-4",
      farmId: "4",
      totalHead: 180,
      cattleType: "Brangus",
      averageWeight: 500,
      methodOfRaising: "mixed"
    },
    pasture: {
      id: "p-4",
      farmId: "4",
      totalPastures: 7,
      averagePastureSize: 28,
      rotationsPerSeason: 4,
      restingDaysPerPasture: 38,
      grassTypes: ["Bromegrass", "Alfalfa", "Lotus"],
      soilHealthScore: 7,
      currentForageDensity: 4700
    }
  },
  {
    farm: {
      id: "5",
      name: "Campo Verde",
      location: "General Pico, La Pampa",
      size: 400,
      coordinates: {
        lat: -35.6566,
        lng: -63.7597,
      },
      ownerName: "Luis Sánchez",
      createdAt: new Date("2023-05-15"),
      updatedAt: new Date("2024-03-10"),
    },
    crops: [
      { id: "9", name: "Soja", area: 200 },
      { id: "10", name: "Maíz", area: 200 },
    ],
    cattle: {
      id: "c-5",
      farmId: "5",
      totalHead: 300,
      cattleType: "Aberdeen Angus",
      averageWeight: 530,
      methodOfRaising: "conventional"
    },
    pasture: {
      id: "p-5",
      farmId: "5",
      totalPastures: 10,
      averagePastureSize: 30,
      rotationsPerSeason: 3,
      restingDaysPerPasture: 32,
      grassTypes: ["Festuca", "Alfalfa", "Trébol Blanco", "Ryegrass"],
      soilHealthScore: 6,
      currentForageDensity: 4300
    }
  },
];

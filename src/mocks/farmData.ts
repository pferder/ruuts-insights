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
  },
];

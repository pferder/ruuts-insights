
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FarmComplete } from "@/types/farm";
import { useTranslation } from "react-i18next";

// Fix para el icono de Leaflet en entornos de producción
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Arreglar el problema de los iconos en Leaflet
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
};

interface FarmMapProps {
  farm: FarmComplete;
  height?: string;
  showTooltip?: boolean;
  className?: string;
}

export function FarmMap({ farm, height = "400px", showTooltip = true, className = "" }: FarmMapProps) {
  const { t } = useTranslation();
  const [geoJson, setGeoJson] = useState<any>(null);
  
  // Llamada una vez para arreglar los iconos
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // En un entorno real, cargaríamos el GeoJSON desde una API
  // Para este ejemplo, generamos un polígono simple basado en la ubicación y tamaño de la granja
  useEffect(() => {
    // Generar coordenadas simuladas basadas en el nombre de la ubicación (solo para demo)
    const generateCoordinates = (location: string, size: number) => {
      // Crear un hash simple basado en el nombre de la ubicación
      let hash = 0;
      for (let i = 0; i < location.length; i++) {
        hash = ((hash << 5) - hash) + location.charCodeAt(i);
        hash |= 0;
      }
      
      // Usar el hash para generar coordenadas base (América del Sur aproximadamente)
      const baseLat = -34 + (hash % 10);
      const baseLng = -58 + ((hash >> 4) % 15);
      
      // Generar un polígono basado en el tamaño de la granja
      const scale = Math.sqrt(size) / 20;
      const polygon = [
        [baseLat, baseLng],
        [baseLat + scale, baseLng],
        [baseLat + scale, baseLng + scale],
        [baseLat, baseLng + scale],
        [baseLat, baseLng] // Cerrar el polígono
      ];
      
      return polygon;
    };
    
    // Crear un objeto GeoJSON con el polígono generado
    const polygon = generateCoordinates(farm.farm.location, farm.farm.size);
    const geoJsonData = {
      type: "Feature",
      properties: {
        name: farm.farm.name,
        location: farm.farm.location,
        size: farm.farm.size
      },
      geometry: {
        type: "Polygon",
        coordinates: [polygon]
      }
    };
    
    setGeoJson(geoJsonData);
  }, [farm]);
  
  // Estilo para el polígono GeoJSON
  const geoJsonStyle = {
    fillColor: "#4CAF50",
    weight: 2,
    opacity: 1,
    color: "#2E7D32",
    fillOpacity: 0.4
  };
  
  if (!geoJson) {
    return (
      <div 
        className={`bg-gray-100 animate-pulse rounded-xl ${className}`} 
        style={{ height }}
      />
    );
  }
  
  const center = geoJson.geometry.coordinates[0][0].reverse();
  
  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height, width: "100%" }}
      className={`rounded-xl border border-border ${className}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={geoJson as any} style={geoJsonStyle}>
        {showTooltip && (
          <Tooltip permanent>
            <div className="font-medium">{farm.farm.name}</div>
            <div>{farm.farm.size} {t('common.hectares')}</div>
          </Tooltip>
        )}
      </GeoJSON>
    </MapContainer>
  );
}

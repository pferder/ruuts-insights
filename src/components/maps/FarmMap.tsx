
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip, MapContainerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FarmComplete } from "@/types/farm";
import { useTranslation } from "react-i18next";

// Fix for Leaflet icon in production environments
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet icon issue
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
  
  // Call once to fix icons
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // In a real environment, we would load GeoJSON from an API
  // For this example, we generate a simple polygon based on farm location and size
  useEffect(() => {
    // Generate simulated coordinates based on location name (demo only)
    const generateCoordinates = (location: string, size: number) => {
      // Create a simple hash based on location name
      let hash = 0;
      for (let i = 0; i < location.length; i++) {
        hash = ((hash << 5) - hash) + location.charCodeAt(i);
        hash |= 0;
      }
      
      // Use hash to generate base coordinates (South America approximately)
      const baseLat = -34 + (hash % 10);
      const baseLng = -58 + ((hash >> 4) % 15);
      
      // Generate polygon based on farm size
      const scale = Math.sqrt(size) / 20;
      const polygon = [
        [baseLat, baseLng],
        [baseLat + scale, baseLng],
        [baseLat + scale, baseLng + scale],
        [baseLat, baseLng + scale],
        [baseLat, baseLng] // Close polygon
      ];
      
      return polygon;
    };
    
    // Create GeoJSON object with generated polygon
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
  
  // GeoJSON style
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
  
  // Prepare center coordinates for the map
  const coordinates = geoJson.geometry.coordinates[0][0];
  const centerPosition: [number, number] = [coordinates[0], coordinates[1]];
  
  // Define MapContainer props explicitly
  const mapContainerProps: MapContainerProps = {
    className: `rounded-xl border border-border ${className}`,
    style: { height, width: "100%" },
  };
  
  return (
    <MapContainer {...mapContainerProps}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON 
        data={geoJson as any} 
        pathOptions={geoJsonStyle}
      >
        {showTooltip && (
          <Tooltip>
            <div className="font-medium">{farm.farm.name}</div>
            <div>{farm.farm.size} {t('common.hectares')}</div>
          </Tooltip>
        )}
      </GeoJSON>
    </MapContainer>
  );
}

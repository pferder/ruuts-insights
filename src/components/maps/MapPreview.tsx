
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GeoJSON as GeoJSONType } from "geojson";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet icon issue
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
};

interface MapPreviewProps {
  geometry: GeoJSONType.Geometry;
  height?: string;
  className?: string;
}

export function MapPreview({ geometry, height = "400px", className = "" }: MapPreviewProps) {
  const [center, setCenter] = useState<[number, number]>([-34.6037, -58.3816]); // Default to Buenos Aires
  const [zoom, setZoom] = useState(13);
  
  // Call once to fix icons
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Calculate center from geometry
  useEffect(() => {
    if (geometry) {
      try {
        if (geometry.type === "Point") {
          // For Point geometries, use the coordinates directly
          setCenter([geometry.coordinates[1], geometry.coordinates[0]]);
        } else if (geometry.type === "Polygon" && geometry.coordinates && geometry.coordinates[0]) {
          // For Polygon geometries, calculate the center
          let totalLat = 0;
          let totalLng = 0;
          let count = 0;
          
          for (const coord of geometry.coordinates[0]) {
            totalLng += coord[0];
            totalLat += coord[1];
            count++;
          }
          
          if (count > 0) {
            setCenter([totalLat / count, totalLng / count]);
          }
        } else if (geometry.type === "MultiPolygon" && geometry.coordinates && geometry.coordinates[0]) {
          // For MultiPolygon geometries, use the first polygon
          let totalLat = 0;
          let totalLng = 0;
          let count = 0;
          
          for (const coord of geometry.coordinates[0][0]) {
            totalLng += coord[0];
            totalLat += coord[1];
            count++;
          }
          
          if (count > 0) {
            setCenter([totalLat / count, totalLng / count]);
          }
        }
      } catch (error) {
        console.error("Error calculating map center:", error);
      }
    }
  }, [geometry]);

  // Create feature from geometry
  const geoJsonData = {
    type: "Feature",
    properties: {},
    geometry: geometry
  };

  // GeoJSON style
  const geoJsonStyle = {
    fillColor: "#38bdf8",
    weight: 1.5,
    opacity: 1,
    color: "#0284c7",
    fillOpacity: 0.25,
  };

  return (
    <div className={`rounded-xl border border-border ${className}`} style={{ height, width: "100%" }}>
      <MapContainer 
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="h-full w-full rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON 
          data={geoJsonData as any}
          style={geoJsonStyle}
        />
      </MapContainer>
    </div>
  );
}

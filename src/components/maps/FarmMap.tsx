
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip, MapContainerProps } from "react-leaflet";
import { Feature, Polygon } from "geojson";
import "leaflet/dist/leaflet.css";
import { FarmComplete } from "@/types/farm";
import { useTranslation } from "react-i18next";
import { LatLngExpression } from "leaflet";

// Fix for Leaflet icon in production environments
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

interface FarmMapProps {
  farm: FarmComplete;
  height?: string;
  showTooltip?: boolean;
  className?: string;
}

// Default coordinates (approximate center of Argentina)
const DEFAULT_CENTER: LatLngExpression = [-38.4161, -63.6167];
const DEFAULT_ZOOM = 4;

export function FarmMap({ farm, height = "400px", showTooltip = true, className = "" }: FarmMapProps) {
  const { t } = useTranslation();
  const [geoJson, setGeoJson] = useState<Feature<Polygon> | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Call once to fix icons
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Generate a polygon around the farm coordinates
  useEffect(() => {
    // Early validation of farm data existence
    if (!farm?.farm) {
      console.warn("Farm data is not available");
      return;
    }

    const coordinates = farm.farm.coordinates;
    if (!coordinates?.lat || !coordinates?.lng) {
      console.warn("Farm coordinates are not available");
      return;
    }

    const { lat, lng } = coordinates;
    const size = farm.farm.size;

    // Calculate polygon size based on farm size
    // 1 hectare ≈ 0.01 km² ≈ 0.0001 degrees of lat/lng
    const scale = Math.sqrt(size) * 0.001; // Adjust scale to be visible on the map

    // For GeoJSON, the order is [longitude, latitude]
    const polygon = [
      [lng - scale, lat - scale],
      [lng + scale, lat - scale],
      [lng + scale, lat + scale],
      [lng - scale, lat + scale],
      [lng - scale, lat - scale], // Close the polygon
    ];

    const geoJsonData: Feature<Polygon> = {
      type: "Feature",
      properties: {
        name: farm.farm.name,
        location: farm.farm.location,
        size: farm.farm.size,
      },
      geometry: {
        type: "Polygon",
        coordinates: [polygon],
      },
    };

    setGeoJson(geoJsonData);
    setMapCenter([lat, lng]);
    setZoom(13);
  }, [farm]);

  // GeoJSON style - More modern and minimal style
  const geoJsonStyle = {
    fillColor: "#38bdf8", // A more modern blue
    weight: 1.5, // Finer border
    opacity: 1,
    color: "#0284c7", // Border slightly darker than the fill
    fillOpacity: 0.25, // More transparent for a more subtle look
  };

  // Loading state or unavailable data
  if (!farm?.farm) {
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-xl ${className}`}
        style={{ height }}
      />
    );
  }

  // Only render the map if we have geoJson
  if (!geoJson) {
    return (
      <div className={`rounded-xl border border-border ${className}`} style={{ height, width: "100%" }}>
        <MapContainer 
          className="h-full w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border ${className}`} style={{ height, width: "100%" }}>
      <MapContainer 
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={geoJson}
          pathOptions={geoJsonStyle}
        >
          {showTooltip && (
            <Tooltip>
              <div className="font-medium">{farm.farm.name}</div>
              <div>
                {farm.farm.size} {t("common.hectares")}
              </div>
            </Tooltip>
          )}
        </GeoJSON>
      </MapContainer>
    </div>
  );
}

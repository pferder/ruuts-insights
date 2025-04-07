import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip } from "react-leaflet";
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

// Coordenadas por defecto (centro de Argentina aproximadamente)
const DEFAULT_CENTER: LatLngExpression = [-38.4161, -63.6167];
const DEFAULT_ZOOM = 4;

export function FarmMap({ farm, height = "400px", showTooltip = true, className = "" }: FarmMapProps) {
  const { t } = useTranslation();
  const [geoJson, setGeoJson] = useState<Feature<Polygon>>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Call once to fix icons
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Generate a polygon around the farm coordinates
  useEffect(() => {
    // Validación temprana de la existencia de farm y sus propiedades
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

    // Calculamos el tamaño del polígono basado en el tamaño de la granja
    // 1 hectárea ≈ 0.01 km² ≈ 0.0001 grados de lat/lng
    const scale = Math.sqrt(size) * 0.001; // Ajustamos la escala para que sea visible en el mapa

    // Para GeoJSON, el orden es [longitude, latitude]
    const polygon = [
      [lng - scale, lat - scale],
      [lng + scale, lat - scale],
      [lng + scale, lat + scale],
      [lng - scale, lat + scale],
      [lng - scale, lat - scale], // Cerramos el polígono
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
    fillColor: "#38bdf8", // Un azul más moderno
    weight: 1.5, // Borde más fino
    opacity: 1,
    color: "#0284c7", // Borde un poco más oscuro que el relleno
    fillOpacity: 0.25, // Más transparente para un look más sutil
  };

  // Loading state o datos no disponibles
  if (!farm?.farm) {
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-xl ${className}`}
        style={{ height }}
      />
    );
  }

  // Solo renderizar el mapa si tenemos geoJson
  if (!geoJson) {
    return (
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={`rounded-xl border border-border ${className}`}
        style={{ height, width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className={`rounded-xl border border-border ${className}`}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
  );
}

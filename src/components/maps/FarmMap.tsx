import { useEffect, useState, useRef } from "react";
import { Feature, Polygon } from "geojson";
import { FarmComplete } from "@/types/farm";
import { useTranslation } from "react-i18next";
import { BaseMap } from "./BaseMap";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import { center, bbox } from "@turf/turf";

interface FarmMapProps {
  farm: FarmComplete;
  height?: string;
  showTooltip?: boolean;
  className?: string;
  animate?: boolean;
  onMapReady?: () => void;
}

// Default coordinates (approximate center of Argentina)
const DEFAULT_CENTER: [number, number] = [-63.6167, -38.4161];
const DEFAULT_ZOOM = 4;

interface CentroidResult {
  x: number;
  y: number;
}

export function FarmMap({ farm, height = "400px", showTooltip = true, className = "", animate = true, onMapReady }: FarmMapProps) {
  const { t } = useTranslation();
  const [geoJson, setGeoJson] = useState<Feature<Polygon> | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const loadGeospatialData = async () => {
      if (!farm?.farm?.id) {
        console.log("No farm ID available");
        return;
      }

      try {
        console.log("Loading geospatial data for farm:", farm.farm.id);
        const { data, error } = await supabase.from("farm_geospatial").select("geometry").eq("farm_id", farm.farm.id).maybeSingle();

        if (error) {
          console.error("Error loading geospatial data:", error);
          handleFallbackCoordinates();
          return;
        }

        if (!data) {
          console.log("No geospatial data found in database");
          handleFallbackCoordinates();
          return;
        }

        console.log("Geospatial data loaded:", data);
        // Convert PostGIS geometry to GeoJSON
        const geoJsonData: Feature<Polygon> = {
          type: "Feature",
          geometry: data.geometry,
          properties: {
            name: farm.farm.name,
            size: farm.farm.size,
          },
        };

        console.log("Converted to GeoJSON:", geoJsonData);
        setGeoJson(geoJsonData);

        // Calcular el centroide usando Turf
        const centroid = center(geoJsonData);
        if (centroid) {
          const [lng, lat] = centroid.geometry.coordinates;
          console.log("Setting map center:", [lng, lat]);
          setMapCenter([lng, lat]);
          setZoom(13);
        }
      } catch (error) {
        console.error("Error in loadGeospatialData:", error);
        handleFallbackCoordinates();
      }
    };

    const handleFallbackCoordinates = () => {
      const coordinates = farm.farm.coordinates;
      if (coordinates?.lat && coordinates?.lng) {
        const { lat, lng } = coordinates;
        const size = farm.farm.size;

        const scale = Math.sqrt(size) * 0.001;
        const polygon = [
          [lng - scale, lat - scale],
          [lng + scale, lat - scale],
          [lng + scale, lat + scale],
          [lng - scale, lat + scale],
          [lng - scale, lat - scale],
        ];

        const geoJsonData: Feature<Polygon> = {
          type: "Feature",
          properties: {
            name: farm.farm.name,
            size: farm.farm.size,
          },
          geometry: {
            type: "Polygon",
            coordinates: [polygon],
          },
        };

        console.log("Setting fallback GeoJSON data:", geoJsonData);
        setGeoJson(geoJsonData);
        setMapCenter([lng, lat]);
        setZoom(13);
      }
    };

    loadGeospatialData();
  }, [farm]);

  const handleMapLoad = (map: mapboxgl.Map) => {
    console.log("Map loaded");
    mapRef.current = map;
    setIsMapReady(true);
    if (onMapReady) {
      onMapReady();
    }
  };

  const updateMapLayers = () => {
    if (!mapRef.current || !geoJson || !isMapReady) {
      console.log("Cannot update layers:", {
        hasMap: !!mapRef.current,
        hasGeoJson: !!geoJson,
        isMapReady,
      });
      return;
    }

    console.log("Updating map layers with GeoJSON:", geoJson);

    try {
      // Limpiar capas existentes
      if (mapRef.current.getLayer("farm-fill")) {
        mapRef.current.removeLayer("farm-fill");
      }
      if (mapRef.current.getLayer("farm-outline")) {
        mapRef.current.removeLayer("farm-outline");
      }
      if (mapRef.current.getSource("farm")) {
        mapRef.current.removeSource("farm");
      }

      // Agregar nueva fuente y capas
      mapRef.current.addSource("farm", {
        type: "geojson",
        data: geoJson,
      });

      mapRef.current.addLayer({
        id: "farm-fill",
        type: "fill",
        source: "farm",
        paint: {
          "fill-color": "#38bdf8",
          "fill-opacity": 0.5,
          "fill-outline-color": "#0284c7",
        },
      });

      mapRef.current.addLayer({
        id: "farm-outline",
        type: "line",
        source: "farm",
        paint: {
          "line-color": "#0284c7",
          "line-width": 2,
        },
      });

      // Ajustar el mapa al bbox de la geometría
      const bounds = bbox(geoJson);
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        {
          padding: 50,
          maxZoom: 15,
          duration: animate ? 2000 : 0,
        }
      );

      if (showTooltip) {
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        mapRef.current.on("mouseenter", "farm-fill", (e) => {
          if (e.features?.[0]) {
            const properties = e.features[0].properties;
            const html = `
              <div class="font-medium">${properties.name}</div>
              <div>${properties.size} ${t("common.hectares")}</div>
            `;
            popup.setLngLat(e.lngLat).setHTML(html).addTo(mapRef.current!);
          }
        });

        mapRef.current.on("mouseleave", "farm-fill", () => {
          popup.remove();
        });
      }
    } catch (error) {
      console.error("Error updating map layers:", error);
    }
  };

  // Actualizar capas cuando cambia geoJson o isMapReady
  useEffect(() => {
    if (mapRef.current && geoJson && isMapReady) {
      updateMapLayers();
    }
  }, [geoJson, isMapReady]);

  if (!farm?.farm) {
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-xl ${className}`}
        style={{ height }}
      />
    );
  }

  return (
    <BaseMap
      center={mapCenter}
      zoom={zoom}
      height={height}
      className={className}
      onMapLoad={handleMapLoad}
    />
  );
}

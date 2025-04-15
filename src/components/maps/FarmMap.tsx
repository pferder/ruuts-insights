import { useEffect, useState, useRef } from "react";
import { Feature, Polygon } from "geojson";
import { FarmComplete } from "@/types/farm";
import { useTranslation } from "react-i18next";
import { BaseMap } from "./BaseMap";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";

interface FarmMapProps {
  farm: FarmComplete;
  height?: string;
  showTooltip?: boolean;
  className?: string;
}

// Default coordinates (approximate center of Argentina)
const DEFAULT_CENTER: [number, number] = [-63.6167, -38.4161];
const DEFAULT_ZOOM = 4;

interface CentroidResult {
  x: number;
  y: number;
}

export function FarmMap({ farm, height = "400px", showTooltip = true, className = "" }: FarmMapProps) {
  const { t } = useTranslation();
  const [geoJson, setGeoJson] = useState<Feature<Polygon> | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const loadGeospatialData = async () => {
      try {
        const { data, error } = await supabase.from("farm_geospatial").select("geometry").eq("farm_id", farm.farm.id).maybeSingle();

        if (error) {
          console.error("Error loading geospatial data:", error);
          handleFallbackCoordinates();
          return;
        }

        if (data?.geometry) {
          const geoJsonData: Feature<Polygon> = {
            type: "Feature",
            properties: {
              name: farm.farm.name,
              size: farm.farm.size,
            },
            geometry: data.geometry,
          };

          setGeoJson(geoJsonData);

          const { data: centerData } = (await supabase.rpc("st_centroid", {
            geom: data.geometry,
          })) as { data: CentroidResult | null };

          if (centerData) {
            setMapCenter([centerData.x, centerData.y]);
            setZoom(13);
          }
        } else {
          handleFallbackCoordinates();
        }
      } catch (error) {
        console.error("Error loading geospatial data:", error);
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

        setGeoJson(geoJsonData);
        setMapCenter([lng, lat]);
        setZoom(13);
      }
    };

    loadGeospatialData();
  }, [farm]);

  const handleMapLoad = (map: mapboxgl.Map) => {
    mapRef.current = map;
    updateMapLayers();
  };

  const updateMapLayers = () => {
    if (!mapRef.current || !geoJson) return;

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
        "fill-opacity": 0.25,
      },
    });

    mapRef.current.addLayer({
      id: "farm-outline",
      type: "line",
      source: "farm",
      paint: {
        "line-color": "#0284c7",
        "line-width": 1.5,
      },
    });

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
  };

  // Actualizar capas cuando cambia geoJson
  useEffect(() => {
    if (mapRef.current) {
      updateMapLayers();
    }
  }, [geoJson]);

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

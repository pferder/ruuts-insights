import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { GeoJSON, Feature } from "geojson";
import { bbox, center } from "@turf/turf";
import { getMapboxToken } from "@/config/mapbox";

interface MapPreviewProps {
  geometry: GeoJSON.Geometry;
  height?: string;
  onMapReady?: () => void;
}

export function MapPreview({ geometry, height = "300px", onMapReady }: MapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      const token = await getMapboxToken();
      if (!token) return;

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [-58.5, -34.5],
        zoom: 10,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !geometry) return;

    // Convertir la geometría a Feature para usar con Turf
    const feature: Feature = {
      type: "Feature",
      properties: {},
      geometry: geometry,
    };

    // Calcular el bbox y el centro
    const bounds = bbox(feature);
    const [minX, minY, maxX, maxY] = bounds;

    // Limpiar fuentes y capas existentes
    if (map.current.getSource("farm-boundary")) {
      map.current.removeLayer("farm-boundary-fill");
      map.current.removeLayer("farm-boundary-line");
      map.current.removeSource("farm-boundary");
    }

    // Agregar la nueva geometría
    map.current.addSource("farm-boundary", {
      type: "geojson",
      data: feature,
    });

    map.current.addLayer({
      id: "farm-boundary-fill",
      type: "fill",
      source: "farm-boundary",
      paint: {
        "fill-color": "#00ff00",
        "fill-opacity": 0.2,
      },
    });

    map.current.addLayer({
      id: "farm-boundary-line",
      type: "line",
      source: "farm-boundary",
      paint: {
        "line-color": "#00ff00",
        "line-width": 2,
      },
    });

    // Ajustar el mapa al bbox después de que las capas estén cargadas
    map.current.once("idle", () => {
      map.current?.fitBounds(
        [
          [minX, minY],
          [maxX, maxY],
        ],
        {
          padding: 50,
          maxZoom: 15,
          duration: 2000, // Aumentamos la duración de la animación
        }
      );

      // Notificar que el mapa está listo solo después de que la geometría esté visible
      if (onMapReady) {
        onMapReady();
      }
    });
  }, [geometry, mapLoaded, onMapReady]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "100%",
        aspectRatio: "3/2",
      }}
      className="w-full rounded-lg overflow-hidden"
    />
  );
}

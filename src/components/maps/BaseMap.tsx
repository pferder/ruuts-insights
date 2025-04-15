import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { GeoJSON } from "geojson";
import { getMapboxToken } from "@/config/mapbox";

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  onMapLoad?: (map: mapboxgl.Map) => void;
  children?: React.ReactNode;
}

export function BaseMap({
  center = [-58.3816, -34.6037], // Buenos Aires por defecto
  zoom = 13,
  height = "400px",
  className = "",
  onMapLoad,
  children,
}: BaseMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      const token = await getMapboxToken();
      if (!token) {
        console.error("Mapbox token not available");
        return;
      }

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: center,
        zoom: zoom,
      });

      map.current.on("load", () => {
        setMapLoaded(true);
        if (onMapLoad) {
          onMapLoad(map.current!);
        }
      });

      return () => {
        if (map.current) {
          map.current.remove();
        }
      };
    };

    initializeMap();
  }, []);

  return (
    <div
      ref={mapContainer}
      className={`rounded-xl border border-border ${className}`}
      style={{ height, width: "100%" }}
    >
      {mapLoaded && children}
    </div>
  );
}

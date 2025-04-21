// src/components/maps/EligibilityMap.tsx
// No changes needed in this file based on the error. Keep the previous version.
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import mapboxgl, { Map as MapboxMap, LngLatBoundsLike, AnySourceData, AnyLayer } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { Feature, Geometry } from "geojson";

// Define the structure for data passed to the map for rendering layers
export interface AreaLayerData {
  id: string; // Unique identifier for the layer type (e.g., 'perimeter', 'deforestation')
  name: string; // Display name (e.g., 'Perimeter', 'Deforestation')
  geometry: Geometry; // GeoJSON Geometry
  color: string; // Color for the layer
  area?: number; // Optional pre-calculated area in hectares
}

// Define the props the map component will accept
interface EligibilityMapProps {
  areaLayers: AreaLayerData[] | null; // Array of layers to display
  perimeterGeometry: Geometry | null; // Separate prop for the main perimeter for bounds fitting
  onMapLoad?: (map: MapboxMap) => void; // Optional: Callback when map is loaded
}

// Define the functions exposed via the ref
export interface EligibilityMapRef {
  fitBoundsToGeometry: (geometry: Geometry) => void;
  getMapInstance: () => MapboxMap | null;
}

// Constants for map style and boundary appearance
const MAP_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";
const BOUNDARY_LINE_WIDTH = 2.5;
const BOUNDARY_FILL_OPACITY = 0.15; // Slightly more visible fill
const DYNAMIC_SOURCE_PREFIX = "dynamic-area-source-";
const DYNAMIC_FILL_LAYER_PREFIX = "dynamic-area-fill-";
const DYNAMIC_LINE_LAYER_PREFIX = "dynamic-area-line-";

const EligibilityMap = forwardRef<EligibilityMapRef, EligibilityMapProps>(
  ({ areaLayers, perimeterGeometry, onMapLoad }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapboxMap | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    // Use state for token to ensure it's available before map init
    const [mapboxToken, setMapboxToken] = useState<string | null>(null);

    // Fetch Mapbox token on mount (using direct import.meta.env)
    useEffect(() => {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (token) {
        setMapboxToken(token);
      } else {
        console.error("Mapbox token (VITE_MAPBOX_TOKEN) is not defined.");
      }
    }, []);

    // Initialize map effect
    useEffect(() => {
      if (!mapContainerRef.current || !mapboxToken || mapRef.current) return;

      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: [-64, -34],
        zoom: 3,
        pitch: 0,
        bearing: 0,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("load", () => {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        setIsMapLoaded(true);
        mapRef.current = map;
        if (onMapLoad) {
          onMapLoad(map);
        }
      });

      map.on("error", (e) => console.error("Mapbox error:", e));
      map.on("webglcontextlost", () => console.warn("Mapbox WebGL context lost."));
      map.on("webglcontextrestored", () => console.log("Mapbox WebGL context restored."));

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
        mapRef.current = null;
        setIsMapLoaded(false);
      };
    }, [mapboxToken, onMapLoad]); // Re-run only if token changes

    // Geometry update effect - Renders layers based on areaLayers prop
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !isMapLoaded) return;

      // --- 1. Clear Existing Dynamic Layers and Sources ---
      // Use style.getSource to check existence before removing
      Object.keys(map.getStyle().sources).forEach((sourceId) => {
        if (sourceId.startsWith(DYNAMIC_SOURCE_PREFIX)) {
          // Check associated layers before removing source
          const fillLayerId = `${DYNAMIC_FILL_LAYER_PREFIX}${sourceId.substring(
            DYNAMIC_SOURCE_PREFIX.length
          )}`;
          const lineLayerId = `${DYNAMIC_LINE_LAYER_PREFIX}${sourceId.substring(
            DYNAMIC_SOURCE_PREFIX.length
          )}`;
          if (map.getLayer(fillLayerId)) {
            map.removeLayer(fillLayerId);
          }
          if (map.getLayer(lineLayerId)) {
            map.removeLayer(lineLayerId);
          }
          // Now safe to remove source
          map.removeSource(sourceId);
        }
      });

      // --- 2. Process and Sort New Layers ---
      if (!areaLayers || areaLayers.length === 0) {
        // Fit bounds to perimeter if only that exists and map is idle
        if (perimeterGeometry) {
          try {
            const feature = turf.feature(perimeterGeometry);
            const bounds = turf.bbox(feature) as LngLatBoundsLike;
            if (bounds && bounds.length === 4 && bounds.every((c) => isFinite(c))) {
              map.once("idle", () => {
                map.fitBounds(bounds, {
                  padding: 40,
                  maxZoom: 16,
                  duration: 1000,
                  essential: true,
                  pitch: 45,
                  bearing: 0,
                });
              });
            }
          } catch (e) {
            console.error("Error fitting bounds to perimeter geometry:", e);
          }
        }
        return;
      }

      const layersWithArea = areaLayers
        .map((layer) => {
          try {
            // Calculate area if not provided, ensure geometry is valid
            const area = layer.area ?? (layer.geometry ? turf.area(layer.geometry) / 10000 : 0); // hectares
            if (isNaN(area) || !isFinite(area)) {
              // Check for NaN and Infinity
              console.warn(`Invalid area calculated for layer ${layer.id}, setting to 0.`);
              return { ...layer, calculatedArea: 0 };
            }
            return { ...layer, calculatedArea: area };
          } catch (e) {
            console.error(`Error calculating area for layer ${layer.id}:`, e);
            return { ...layer, calculatedArea: 0 }; // Assign 0 area if calculation fails
          }
        })
        .filter((layer) => layer.calculatedArea >= 0); // Ensure area is not negative

      // Sort layers by area DESCENDING (largest area first)
      const sortedLayers = layersWithArea.sort((a, b) => b.calculatedArea - a.calculatedArea);

      // --- 3. Add Sorted Layers to Map ---
      sortedLayers.forEach((layer) => {
        if (!layer.geometry) {
          console.warn(`Skipping layer ${layer.id} due to missing geometry.`);
          return;
        }

        const sourceId = `${DYNAMIC_SOURCE_PREFIX}${layer.id}`;
        const fillLayerId = `${DYNAMIC_FILL_LAYER_PREFIX}${layer.id}`;
        const lineLayerId = `${DYNAMIC_LINE_LAYER_PREFIX}${layer.id}`;
        const feature: Feature = turf.feature(layer.geometry); // Ensure it's a Feature

        try {
          // Check if source already exists (should have been removed, but defensive check)
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: "geojson",
              data: feature,
            });
          } else {
            // If source exists, update its data (useful for dynamic updates later)
            (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(feature);
          }

          // Add layers, checking if they exist first
          if (!map.getLayer(fillLayerId)) {
            map.addLayer({
              id: fillLayerId,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": layer.color,
                "fill-opacity": BOUNDARY_FILL_OPACITY,
              },
            });
          } else {
            // Optionally update paint properties if layer exists
            map.setPaintProperty(fillLayerId, "fill-color", layer.color);
          }

          if (!map.getLayer(lineLayerId)) {
            map.addLayer({
              id: lineLayerId,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": layer.color,
                "line-width": BOUNDARY_LINE_WIDTH,
              },
            });
          } else {
            // Optionally update paint properties if layer exists
            map.setPaintProperty(lineLayerId, "line-color", layer.color);
          }
        } catch (error) {
          console.error(`Error adding/updating source or layers for ${layer.id}:`, error);
        }
      });

      // --- 4. Fit Bounds (using perimeter or largest layer) ---
      const geometryToFit = perimeterGeometry ?? sortedLayers[0]?.geometry;
      if (geometryToFit) {
        try {
          const featureToFit = turf.feature(geometryToFit);
          const bounds = turf.bbox(featureToFit) as LngLatBoundsLike;
          if (bounds && bounds.length === 4 && bounds.every((c) => isFinite(c))) {
            // Use map.once('idle') to ensure layers are rendered before fitting
            map.once("idle", () => {
              if (!mapRef.current) return; // Check if map still exists

              map.fitBounds(bounds, {
                padding: 40,
                maxZoom: 16,
                duration: 1500,
                pitch: 45,
                bearing: 0,
                essential: true,
              });
            });
          } else {
            console.warn("Invalid bounds calculated for fitting geometry:", bounds);
          }
        } catch (e) {
          console.error("Error calculating or fitting bounds:", e);
        }
      } else {
        console.warn("No geometry available to fit bounds.");
      }
    }, [areaLayers, perimeterGeometry, isMapLoaded]); // Depend on layers, perimeter, and map load state

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      fitBoundsToGeometry: (geom: Geometry) => {
        const map = mapRef.current;
        if (!map || !geom) return;
        try {
          const feature = turf.feature(geom);
          const bounds = turf.bbox(feature) as LngLatBoundsLike;
          if (bounds && bounds.length === 4 && bounds.every((c) => isFinite(c))) {
            map.fitBounds(bounds, {
              padding: 40,
              maxZoom: 16,
              duration: 1500,
              pitch: 45,
              bearing: 0,
              essential: true,
            });
          }
        } catch (e) {
          console.error("Error in imperative fitBoundsToGeometry:", e);
        }
      },
      getMapInstance: () => mapRef.current,
    }));

    return (
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg overflow-hidden bg-gray-200"
      />
    );
  }
);

EligibilityMap.displayName = "EligibilityMap";
export default EligibilityMap;

"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { classifyRisk, RISK_HEX_COLORS } from "@/lib/indicators";
import { PointQueryCard } from "./point-query-card";
import { Crosshair } from "lucide-react";

interface Feature {
  id: number;
  lgd_code: number;
  name: string;
  score: number | null;
}

interface ChoroplethMapProps {
  geojsonUrl: string;
  features: Feature[];
  onFeatureClick?: (feature: Feature) => void;
  center?: [number, number];
  zoom?: number;
  fitBounds?: [[number, number], [number, number]];
}

function scoreToColor(score: number | null): string {
  if (score === null) return "#e5e5e5";
  return RISK_HEX_COLORS[classifyRisk(score)];
}

export function ChoroplethMap({ geojsonUrl, features, onFeatureClick, center = [82, 22], zoom = 4, fitBounds }: ChoroplethMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Point query state
  const [pointMode, setPointMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pointResult, setPointResult] = useState<any>(null);
  const [pointLoading, setPointLoading] = useState(false);
  const [pointError, setPointError] = useState<string | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Ref to track pointMode inside map click closure
  const pointModeRef = useRef(false);
  useEffect(() => { pointModeRef.current = pointMode; }, [pointMode]);

  const scoreMap = new Map<number, number | null>();
  features.forEach(f => scoreMap.set(f.lgd_code, f.score));

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const indiaBounds: [[number, number], [number, number]] = [[67, 5], [98, 38]];
    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "&copy; OpenStreetMap contributors" },
        },
        layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-opacity": 0.3 } }],
      },
      center,
      zoom,
      maxBounds: indiaBounds,
      minZoom: 3.5,
      maxZoom: 10,
    });
    map.current = m;

    m.on("load", () => {
      setLoaded(true);
      if (fitBounds && map.current) map.current.fitBounds(fitBounds, { padding: 40 });
    });

    // General map click handler for point query mode
    m.on("click", (e) => {
      if (!pointModeRef.current) return;
      const { lat, lng: lon } = e.lngLat;

      // Place/move marker
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new maplibregl.Marker({ color: "#34D399" })
        .setLngLat([lon, lat])
        .addTo(m);

      // Fetch
      setPointLoading(true);
      setPointError(null);
      setPointResult(null);

      fetch(`/api/point-query?lat=${lat}&lon=${lon}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setPointResult(data);
        })
        .catch(err => setPointError(err.message))
        .finally(() => setPointLoading(false));
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!loaded || !map.current) return;
    const m = map.current;

    if (m.getLayer("regions-fill")) m.removeLayer("regions-fill");
    if (m.getLayer("regions-outline")) m.removeLayer("regions-outline");
    if (m.getSource("regions")) m.removeSource("regions");

    fetch(geojsonUrl).then(r => r.json()).then(geojson => {
      for (const feature of geojson.features) {
        const lgd = feature.properties.lgd_code;
        const score = scoreMap.get(lgd) ?? null;
        feature.properties.score = score;
        feature.properties.fill_color = scoreToColor(score);
      }

      m.addSource("regions", { type: "geojson", data: geojson });
      m.addLayer({ id: "regions-fill", type: "fill", source: "regions", paint: { "fill-color": ["get", "fill_color"], "fill-opacity": 0.7 } });
      m.addLayer({ id: "regions-outline", type: "line", source: "regions", paint: { "line-color": "#666", "line-width": 0.5 } });

      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

      m.on("mousemove", "regions-fill", e => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties!;
        const scoreText = props.score !== null && props.score !== "null" ? `Score: ${props.score}` : "No data";
        popup.setLngLat(e.lngLat).setHTML(`<strong>${props.name}</strong><br/>${scoreText}`).addTo(m);
        m.getCanvas().style.cursor = "pointer";
      });

      m.on("mouseleave", "regions-fill", () => { popup.remove(); m.getCanvas().style.cursor = ""; });

      m.on("click", "regions-fill", e => {
        if (pointModeRef.current) return;
        if (!e.features?.[0] || !onFeatureClick) return;
        const props = e.features[0].properties!;
        const feature = features.find(f => f.lgd_code === props.lgd_code);
        if (feature) onFeatureClick(feature);
      });
    });
  }, [loaded, features, geojsonUrl]);

  // Cursor management for point mode
  useEffect(() => {
    if (!map.current) return;
    map.current.getCanvas().style.cursor = pointMode ? "crosshair" : "";
  }, [pointMode]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />

      {/* Point query toggle button */}
      <button
        onClick={() => {
          const next = !pointMode;
          setPointMode(next);
          if (!next) {
            markerRef.current?.remove();
            markerRef.current = null;
            setPointResult(null);
            setPointError(null);
          }
        }}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all"
        style={{
          background: pointMode ? "var(--dicra-accent)" : "var(--dicra-surface)",
          color: pointMode ? "var(--dicra-brand)" : "var(--dicra-text-secondary)",
          border: `1px solid ${pointMode ? "var(--dicra-accent)" : "var(--dicra-border)"}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        title={pointMode ? "Exit point query mode" : "Click any location for plot-level data"}
      >
        <Crosshair size={14} />
        {pointMode ? "Exit Query Mode" : "Query Point"}
      </button>

      {/* Point query results */}
      {(pointResult || pointLoading || pointError) && (
        <PointQueryCard
          result={pointResult}
          loading={pointLoading}
          error={pointError}
          onClose={() => {
            setPointResult(null);
            setPointError(null);
            markerRef.current?.remove();
            markerRef.current = null;
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { classifyRisk, RISK_HEX_COLORS } from "@/lib/indicators";

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

  const scoreMap = new Map<number, number | null>();
  features.forEach(f => scoreMap.set(f.lgd_code, f.score));

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    map.current = new maplibregl.Map({
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
    });
    map.current.on("load", () => {
      setLoaded(true);
      if (fitBounds && map.current) map.current.fitBounds(fitBounds, { padding: 40 });
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
        if (!e.features?.[0] || !onFeatureClick) return;
        const props = e.features[0].properties!;
        const feature = features.find(f => f.lgd_code === props.lgd_code);
        if (feature) onFeatureClick(feature);
      });
    });
  }, [loaded, features, geojsonUrl]);

  return <div ref={mapContainer} className="h-full w-full rounded-lg" />;
}

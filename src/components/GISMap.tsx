/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Habitation, 
  SafeSite, 
  RiskLevel, 
  HazardType 
} from '../types';
import { 
  Layers, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Maximize2, 
  Info 
} from 'lucide-react';

interface GISMapProps {
  habitations: Habitation[];
  safeSites: SafeSite[];
  onSelectHabitation: (habitation: Habitation) => void;
  onSelectSafeSite: (site: SafeSite) => void;
  calculatedRisks: Record<string, { score: number; classification: RiskLevel; dominantHazard: HazardType; vulnerablePct: number }>;
}

export const GISMap: React.FC<GISMapProps> = ({
  habitations,
  safeSites,
  onSelectHabitation,
  onSelectSafeSite,
  calculatedRisks,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const safeSitesLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer visibility toggles
  const [showHabitations, setShowHabitations] = useState(true);
  const [showSafeSites, setShowSafeSites] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [activePreset, setActivePreset] = useState<string>('all');

  // Helper to color code risk
  const getRiskColor = (classification: RiskLevel) => {
    switch (classification) {
      case 'Critical': return '#ef4444'; // Red
      case 'High': return '#f97316';     // Orange
      case 'Moderate': return '#eab308'; // Yellow
      case 'Low': return '#22c55e';      // Green
      default: return '#94a3b8';
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on India
    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    // Standard OpenStreetMap tile layer as required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    polygonsLayerRef.current = L.layerGroup().addTo(map);
    safeSitesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Habitation Markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      if (showHabitations) {
        habitations.forEach((hab) => {
          const riskInfo = calculatedRisks[hab.id] || {
            score: 50,
            classification: 'Moderate',
            dominantHazard: hab.primaryHazard,
            vulnerablePct: 30,
          };

          const color = getRiskColor(riskInfo.classification);
          const isCritical = riskInfo.classification === 'Critical';

          const iconHtml = `
            <div style="
              width: ${isCritical ? '28px' : '22px'};
              height: ${isCritical ? '28px' : '22px'};
              background: ${color};
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 12px ${color}99, 0 2px 4px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
              font-weight: bold;
              font-size: 10px;
              color: #ffffff;
              position: relative;
            ">
              ${riskInfo.score}
              ${isCritical ? `<div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid ${color};
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                opacity: 0.75;
              "></div>` : ''}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-risk-pin',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([hab.latitude, hab.longitude], { icon: customIcon });

          // Popup content
          const popupContent = `
            <div style="font-family: system-ui, sans-serif; min-width: 210px; color: #0f172a; padding: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
                <strong style="font-size: 13px; font-weight: 700;">${hab.name}</strong>
                <span style="
                  background: ${color};
                  color: #ffffff;
                  font-size: 10px;
                  font-weight: 700;
                  padding: 2px 6px;
                  border-radius: 9999px;
                  text-transform: uppercase;
                ">${riskInfo.classification}</span>
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                ${hab.talukOrBlock}, ${hab.district}, ${hab.state}
              </div>
              <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
                <div><strong>Primary Hazard:</strong> ${hab.primaryHazard}</div>
                <div><strong>Population at Risk:</strong> ${hab.demographics.totalPopulation.toLocaleString()}</div>
                <div><strong>Vulnerable Share:</strong> ${riskInfo.vulnerablePct}%</div>
                <div><strong>Evacuation Access:</strong> ${hab.roadConnectivity}</div>
              </div>
              <button 
                id="btn-assess-${hab.id}" 
                style="
                  width: 100%;
                  background: #0284c7;
                  color: #ffffff;
                  border: none;
                  border-radius: 6px;
                  padding: 6px 10px;
                  font-size: 11px;
                  font-weight: 600;
                  cursor: pointer;
                "
              >
                View Detailed Risk Assessment &rarr;
              </button>
            </div>
          `;

          marker.bindPopup(popupContent);
          
          marker.on('popupopen', () => {
            const btn = document.getElementById(`btn-assess-${hab.id}`);
            if (btn) {
              btn.onclick = () => onSelectHabitation(hab);
            }
          });

          markersLayerRef.current?.addLayer(marker);
        });
      }
    }

    // 2. Safe Relocation Sites
    if (safeSitesLayerRef.current) {
      safeSitesLayerRef.current.clearLayers();

      if (showSafeSites) {
        safeSites.forEach((site) => {
          const siteIconHtml = `
            <div style="
              width: 26px;
              height: 26px;
              background: #059669;
              border: 2px solid #ffffff;
              border-radius: 6px;
              box-shadow: 0 0 10px rgba(5, 150, 105, 0.6), 0 2px 4px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 13px;
              font-weight: bold;
            ">
              🛡️
            </div>
          `;

          const siteIcon = L.divIcon({
            html: siteIconHtml,
            className: 'custom-safe-site-pin',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const siteMarker = L.marker([site.latitude, site.longitude], { icon: siteIcon });

          const sitePopup = `
            <div style="font-family: system-ui, sans-serif; min-width: 200px; color: #0f172a; padding: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <strong style="font-size: 13px; font-weight: 700; color: #065f46;">${site.name}</strong>
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
                ${site.district}, ${site.state}
              </div>
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
                <div><strong>Usable Area:</strong> ${site.availableLandAreaHa} ha</div>
                <div><strong>Shelter Capacity:</strong> ${site.shelterCapacityPersons.toLocaleString()}</div>
                <div><strong>Bottleneck Factor:</strong> Water &amp; Infrastructure</div>
              </div>
              <button 
                id="btn-site-${site.id}"
                style="
                  width: 100%;
                  background: #059669;
                  color: #ffffff;
                  border: none;
                  border-radius: 6px;
                  padding: 6px 10px;
                  font-size: 11px;
                  font-weight: 600;
                  cursor: pointer;
                "
              >
                Examine Carrying Capacity &rarr;
              </button>
            </div>
          `;

          siteMarker.bindPopup(sitePopup);
          siteMarker.on('popupopen', () => {
            const btn = document.getElementById(`btn-site-${site.id}`);
            if (btn) {
              btn.onclick = () => onSelectSafeSite(site);
            }
          });

          safeSitesLayerRef.current?.addLayer(siteMarker);
        });
      }
    }

    // 3. Red Zone Polygons
    if (polygonsLayerRef.current) {
      polygonsLayerRef.current.clearLayers();

      if (showPolygons) {
        habitations.forEach((hab) => {
          if (hab.redZonePolygon && hab.redZonePolygon.length > 2) {
            const polygon = L.polygon(hab.redZonePolygon, {
              color: '#dc2626',
              fillColor: '#ef4444',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '4, 4',
            });

            polygon.bindTooltip(`Demonstration Hazard Perimeter: ${hab.name}`, {
              sticky: true,
            });

            polygonsLayerRef.current?.addLayer(polygon);
          }
        });
      }
    }
  }, [habitations, safeSites, calculatedRisks, showHabitations, showSafeSites, showPolygons]);

  // Regional Focus Controller
  const handleFocusRegion = (regionKey: string, coords: [number, number], zoom: number) => {
    setActivePreset(regionKey);
    mapInstanceRef.current?.flyTo(coords, zoom, {
      duration: 1.2,
    });
  };

  return (
    <div className="relative w-full h-[600px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Region Presets Ribbon */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
        <span className="text-[11px] font-semibold text-slate-400 px-2 py-1 flex items-center gap-1">
          <Maximize2 className="w-3 h-3 text-amber-400" />
          Focus:
        </span>
        <button
          onClick={() => handleFocusRegion('all', [22.5937, 78.9629], 5)}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            activePreset === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          All India
        </button>
        <button
          onClick={() => handleFocusRegion('wayanad', [11.55, 76.12], 12)}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            activePreset === 'wayanad'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Wayanad (Landslides)
        </button>
        <button
          onClick={() => handleFocusRegion('chamoli', [30.52, 79.62], 11)}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            activePreset === 'chamoli'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Chamoli (Cloudburst/Flash flood)
        </button>
        <button
          onClick={() => handleFocusRegion('majuli', [26.88, 94.18], 11)}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            activePreset === 'majuli'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Majuli (River Erosion)
        </button>
        <button
          onClick={() => handleFocusRegion('kendrapara', [20.64, 86.82], 11)}
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
            activePreset === 'kendrapara'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Kendrapara (Coastal Sea-Breach)
        </button>
      </div>

      {/* Layer Toggles Floating Panel */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-lg text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-200 border-b border-slate-800 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>GIS Map Layers</span>
        </div>
        <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showHabitations}
            onChange={(e) => setShowHabitations(e.target.checked)}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
          />
          <span>Red Zone Habitations</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSafeSites}
            onChange={(e) => setShowSafeSites(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
          />
          <span>Safe Relocation Sites (🛡️)</span>
        </label>
        <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPolygons}
            onChange={(e) => setShowPolygons(e.target.checked)}
            className="rounded border-slate-700 text-red-500 focus:ring-red-500/20"
          />
          <span>Hazard Perimeters (Demo)</span>
        </label>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/80 shadow-lg text-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 font-semibold text-slate-300">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Legend:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block ring-2 ring-red-400/30" />
          <span className="text-slate-300">Critical (75-100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
          <span className="text-slate-300">High (50-74)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          <span className="text-slate-300">Moderate (25-49)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300">Low (0-24)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-white flex items-center justify-center text-[9px] text-white">
            🛡️
          </span>
          <span className="text-emerald-400 font-medium">Safe Candidate Site</span>
        </div>
      </div>
    </div>
  );
};

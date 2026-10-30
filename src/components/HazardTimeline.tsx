/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { History, Calendar, CloudRain, AlertTriangle, Filter, ArrowUpRight } from 'lucide-react';
import { HazardType } from '../types';

interface TimelineEvent {
  year: number;
  dateStr: string;
  location: string;
  state: string;
  hazardType: HazardType;
  title: string;
  fatalities: number;
  housesDamaged: number;
  lossLakhs: number;
  rainfallRecordMm?: number;
  description: string;
  relocationOutcome: string;
}

const HISTORICAL_TIMELINE: TimelineEvent[] = [
  {
    year: 2024,
    dateStr: 'July 30, 2024',
    location: 'Chooralmala & Mundakkai, Wayanad',
    state: 'Kerala',
    hazardType: 'Landslide',
    title: 'Wayanad High-Elevation Debris Torrent and Liquefaction',
    fatalities: 240,
    housesDamaged: 590,
    lossLakhs: 20900,
    rainfallRecordMm: 572,
    description: '48-hour continuous rainfall over porous granitic terrain caused slope collapse at Vellarimala, triggering massive slurry and boulder flows down the Iruvaipuzha river.',
    relocationOutcome: 'Red Zone designated. Phased resettlement of survivors to Kalpetta tableland approved.',
  },
  {
    year: 2023,
    dateStr: 'July 11, 2023',
    location: 'Sainj & Pandoh, Kullu-Mandi',
    state: 'Himachal Pradesh',
    hazardType: 'Cloudburst',
    title: 'North-Western Himalayan Extreme Monsoon Deluge',
    fatalities: 71,
    housesDamaged: 1100,
    lossLakhs: 48000,
    rainfallRecordMm: 380,
    description: 'Western Disturbance combined with monsoon surge dumped unprecedented rainfall in 24 hours, carving away National Highway 21 and submerging riverfront markets.',
    relocationOutcome: 'Riverbed habitations declared unfit for permanent rebuilding. New upland clusters surveyed.',
  },
  {
    year: 2023,
    dateStr: 'January 02, 2023',
    location: 'Joshimath (Sunil & Manohar Bagh)',
    state: 'Uttarakhand',
    hazardType: 'Landslide',
    title: 'Joshimath Chronic Moraine Subsidence and Fissure Crisis',
    fatalities: 0,
    housesDamaged: 868,
    lossLakhs: 34000,
    description: 'Ancient landslide debris slope experienced rapid differential sinking exceeding 5.4cm in 12 days, tearing apart masonry homes, roads, and hotel foundations.',
    relocationOutcome: 'Over 900 residents evacuated to Pipalkoti and Dhak permanent resettlement colonies.',
  },
  {
    year: 2021,
    dateStr: 'February 07, 2021',
    location: 'Raini & Tapovan, Chamoli',
    state: 'Uttarakhand',
    hazardType: 'Cloudburst',
    title: 'Rishi Ganga Glacial Rock-Ice Avalanche Flash Flood',
    fatalities: 204,
    housesDamaged: 68,
    lossLakhs: 16000,
    description: 'Hanging glacier and bedrock failure at Ronti peak dropped into river canyon, generating a 20-meter high muddy wall of water that obliterated two hydroelectric projects.',
    relocationOutcome: 'Lower Raini village marked unsafe. Relocation to Sub-Division terrace ordered.',
  },
  {
    year: 2021,
    dateStr: 'July 22, 2021',
    location: 'Taliye Village, Raigad',
    state: 'Maharashtra',
    hazardType: 'Landslide',
    title: 'Sahyadri Monsoon Slope Liquefaction and Burial',
    fatalities: 87,
    housesDamaged: 72,
    lossLakhs: 2400,
    rainfallRecordMm: 600,
    description: 'Hillside saturation following record 48-hr Konkan rains triggered rapid mass earth flow, completely burying 32 homes in under 5 minutes.',
    relocationOutcome: 'Permanent relocation executed to Mangaon Elevated Plateau township.',
  },
  {
    year: 2020,
    dateStr: 'May 20, 2020',
    location: 'Ghoramara & Sundarbans, South 24 Parganas',
    state: 'West Bengal',
    hazardType: 'Coastal Erosion',
    title: 'Super Cyclone Amphan Estuarine Surge & Embankment Loss',
    fatalities: 98,
    housesDamaged: 28500,
    lossLakhs: 102000,
    description: 'Category 5 equivalent storm surge breached deltaic earthen dykes, engulfing islands and shrinking Ghoramara landmass by a further 12%.',
    relocationOutcome: 'Climate refugee status recognized; ongoing migration to Kakdwip mainland sector.',
  },
  {
    year: 2018,
    dateStr: 'August 15, 2018',
    location: 'Kuttanad & Alappuzha Lowlands',
    state: 'Kerala',
    hazardType: 'Flood',
    title: 'Great Kerala Century Mega-Flood',
    fatalities: 483,
    housesDamaged: 145000,
    lossLakhs: 310000,
    rainfallRecordMm: 758,
    description: '35 major dams opened simultaneously as entire state received 164% above normal monsoon rain. Kuttanad below-sea-level bowl inundated for 20+ days.',
    relocationOutcome: 'Kuttanad elevated housing prototypes and Cherthala high-ground shelters constructed.',
  },
];

export const HazardTimeline: React.FC = () => {
  const [selectedHazard, setSelectedHazard] = useState<string>('ALL');

  const filtered = HISTORICAL_TIMELINE.filter(
    (item) => selectedHazard === 'ALL' || item.hazardType === selectedHazard
  );

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Historical Multi-Hazard Disaster Timeline &amp; Precedents</span>
          </h3>
          <p className="text-xs text-slate-400">
            Chronology of major climate extremes, casualty loss records, and resulting administrative relocation outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="Landslide">Landslides</option>
            <option value="Cloudburst">Cloudbursts / Flash Floods</option>
            <option value="Flood">Riverine / Basin Floods</option>
            <option value="Coastal Erosion">Coastal Erosion &amp; Inundation</option>
          </select>
        </div>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 pl-5 pt-2">
        {filtered.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center group-hover:scale-125 transition-transform" />

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {item.dateStr}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {item.location}, {item.state}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 self-start sm:self-auto">
                  {item.hazardType}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              {/* Loss Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[10px]">Casualties</span>
                  <span className="font-mono font-bold text-red-400">{item.fatalities} Lives Lost</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Homes Damaged</span>
                  <span className="font-mono font-bold text-amber-400">{item.housesDamaged.toLocaleString()} Units</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Economic Loss</span>
                  <span className="font-mono font-bold text-slate-200">₹{item.lossLakhs.toLocaleString()} Lakhs</span>
                </div>
              </div>

              {/* Relocation Outcome */}
              <div className="pt-1 text-xs text-emerald-300/90 flex items-start gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                <span><strong>Relocation Outcome:</strong> {item.relocationOutcome}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

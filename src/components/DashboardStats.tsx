/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  MapPin, 
  AlertOctagon, 
  TrendingUp, 
  Search, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { HazardType, RiskLevel } from '../types';

interface DashboardStatsProps {
  totalHabitations: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  totalPopulationExposed: number;
  totalVulnerableResidents: number;
  safeSitesCount: number;
  totalSafeCapacity: number;
  immediateAssessmentCount: number;
  lastUpdateTimestamp: string;
  
  // Filters
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedHazard: string;
  setSelectedHazard: (hazard: string) => void;
  selectedRiskLevel: string;
  setSelectedRiskLevel: (level: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  availableDistricts: string[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalHabitations,
  criticalCount,
  highCount,
  totalPopulationExposed,
  totalVulnerableResidents,
  safeSitesCount,
  totalSafeCapacity,
  immediateAssessmentCount,
  lastUpdateTimestamp,
  selectedDistrict,
  setSelectedDistrict,
  selectedHazard,
  setSelectedHazard,
  selectedRiskLevel,
  setSelectedRiskLevel,
  searchQuery,
  setSearchQuery,
  availableDistricts,
}) => {
  const vulnerablePct = totalPopulationExposed > 0 
    ? Math.round((totalVulnerableResidents / totalPopulationExposed) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner & Prototype Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">Live Decision-Support Engine:</span>
          <span>Calculations dynamically integrated across GIS, vulnerability, and carrying capacities.</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] font-mono">
            Updated: {lastUpdateTimestamp}
          </span>
          <span className="text-amber-400/90 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded text-[10px] font-medium">
            Demo Prototype Mode
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Total Mapped */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Mapped</span>
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-100">{totalHabitations}</div>
            <div className="text-[10px] text-slate-400">Habitations</div>
          </div>
        </div>

        {/* Critical Red Zones */}
        <div className="p-3 bg-red-950/20 border border-red-800/50 rounded-xl flex flex-col justify-between hover:border-red-700 transition-all">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Critical</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-red-400">{criticalCount}</div>
            <div className="text-[10px] text-red-300/80 font-medium">Score ≥ 75 (Red Zone)</div>
          </div>
        </div>

        {/* High Risk */}
        <div className="p-3 bg-orange-950/20 border border-orange-800/40 rounded-xl flex flex-col justify-between hover:border-orange-700 transition-all">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-orange-400">{highCount}</div>
            <div className="text-[10px] text-orange-300/80">Score 50 – 74</div>
          </div>
        </div>

        {/* Exposed Population */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Population</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-100">
              {totalPopulationExposed.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">In Danger Zones</div>
          </div>
        </div>

        {/* Vulnerable Share */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Vulnerable</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-amber-400">
              {totalVulnerableResidents.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-300/80">{vulnerablePct}% of exposed</div>
          </div>
        </div>

        {/* Safe Relocation Sites */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex flex-col justify-between hover:border-emerald-700 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Safe Sites</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">{safeSitesCount}</div>
            <div className="text-[10px] text-emerald-300/80">Identified Havens</div>
          </div>
        </div>

        {/* Available Capacity */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex flex-col justify-between hover:border-emerald-700 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Safe Capacity</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {totalSafeCapacity.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-300/80">Net Additional Headroom</div>
          </div>
        </div>

        {/* Immediate Priority Cases */}
        <div className="p-3 bg-red-950/30 border border-red-700/60 rounded-xl flex flex-col justify-between hover:border-red-600 transition-all">
          <div className="flex items-center justify-between text-red-300">
            <span className="text-[11px] font-medium uppercase tracking-wider">Immediate</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-red-300">
              {immediateAssessmentCount}
            </div>
            <div className="text-[10px] text-red-300/80">Action Mandated</div>
          </div>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by habitation name, village, taluk, or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium hidden sm:inline">Filters:</span>
          </div>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">All Districts ({availableDistricts.length})</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Hazard Filter */}
          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">All Hazards</option>
            <option value="Landslide">Landslide</option>
            <option value="Flood">Flood</option>
            <option value="Coastal Erosion">Coastal Erosion</option>
            <option value="Cloudburst">Cloudburst</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Earthquake">Earthquake</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical (75-100)</option>
            <option value="High">High (50-74)</option>
            <option value="Moderate">Moderate (25-49)</option>
            <option value="Low">Low (0-24)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Habitation, 
  RiskLevel, 
  HazardType, 
  RelocationPriority 
} from '../types';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Users, 
  ArrowRight, 
  ExternalLink, 
  MapPin, 
  Shield, 
  HeartHandshake, 
  Truck, 
  Grid, 
  ListFilter 
} from 'lucide-react';

interface HabitationListProps {
  habitations: Habitation[];
  onSelectHabitation: (habitation: Habitation) => void;
  calculatedRisks: Record<
    string,
    {
      score: number;
      classification: RiskLevel;
      dominantHazard: HazardType;
      vulnerablePct: number;
      priority: RelocationPriority;
    }
  >;
}

export const HabitationList: React.FC<HabitationListProps> = ({
  habitations,
  onSelectHabitation,
  calculatedRisks,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const getRiskBadge = (classification: RiskLevel) => {
    switch (classification) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-950/80 text-red-400 border border-red-700/60 shadow-sm animate-pulse">
            <AlertOctagon className="w-3 h-3" /> Critical Red Zone
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-950/80 text-orange-400 border border-orange-700/60">
            <AlertTriangle className="w-3 h-3" /> High Risk
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-950/80 text-yellow-400 border border-yellow-700/60">
            Moderate
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
            Low
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: RelocationPriority) => {
    switch (priority) {
      case 'Immediate':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white tracking-wide uppercase">
            Immediate
          </span>
        );
      case 'Short-Term':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500 text-slate-950">
            Short-Term
          </span>
        );
      case 'Medium-Term':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700 text-slate-200">
            Medium-Term
          </span>
        );
      case 'Monitor':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-normal bg-slate-800 text-slate-400">
            Monitor
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Identified Habitations Assessment Registry</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {habitations.length} settlements
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive multi-hazard exposure, demographic vulnerability, and prioritized relocation needs.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            title="Table View"
          >
            <ListFilter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            title="Card View"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {habitations.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-200">No habitations match the active filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the district or hazard type filter above.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Habitation / Village</th>
                <th className="py-3 px-3 font-semibold">District &amp; State</th>
                <th className="py-3 px-3 font-semibold">Primary Hazard</th>
                <th className="py-3 px-3 font-semibold">Exposed Pop.</th>
                <th className="py-3 px-3 font-semibold">Vulnerable Share</th>
                <th className="py-3 px-3 font-semibold">Risk Score</th>
                <th className="py-3 px-3 font-semibold">Priority</th>
                <th className="py-3 px-3 font-semibold">Relocation Status</th>
                <th className="py-3 px-4 font-semibold text-right">Decision Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {habitations.map((hab) => {
                const risk = calculatedRisks[hab.id] || {
                  score: 50,
                  classification: 'Moderate' as RiskLevel,
                  dominantHazard: hab.primaryHazard,
                  vulnerablePct: 30,
                  priority: 'Medium-Term' as RelocationPriority,
                };

                return (
                  <tr
                    key={hab.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectHabitation(hab)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {hab.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {hab.villageLocality}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200">{hab.district}</div>
                      <div className="text-[10px] text-slate-400">{hab.state}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        {hab.primaryHazard}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-slate-200">
                      {hab.demographics.totalPopulation.toLocaleString()}
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {hab.demographics.households} households
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              risk.vulnerablePct > 60
                                ? 'bg-red-500'
                                : risk.vulnerablePct > 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, risk.vulnerablePct)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{risk.vulnerablePct}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-slate-100">
                          {risk.score}
                        </span>
                        {getRiskBadge(risk.classification)}
                      </div>
                    </td>

                    <td className="py-3 px-3">{getPriorityBadge(risk.priority)}</td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                        {hab.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHabitation(hab);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/30 transition-all"
                      >
                        <span>Assess</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habitations.map((hab) => {
            const risk = calculatedRisks[hab.id] || {
              score: 50,
              classification: 'Moderate' as RiskLevel,
              dominantHazard: hab.primaryHazard,
              vulnerablePct: 30,
              priority: 'Medium-Term' as RelocationPriority,
            };

            return (
              <div
                key={hab.id}
                onClick={() => onSelectHabitation(hab)}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm hover:text-amber-400 transition-colors">
                        {hab.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {hab.district}, {hab.state}
                      </p>
                    </div>
                    {getRiskBadge(risk.classification)}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Primary Hazard</span>
                      <span className="font-semibold text-slate-200">{hab.primaryHazard}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Population</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {hab.demographics.totalPopulation.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Vulnerable Share</span>
                      <span className="font-mono font-semibold text-amber-400">
                        {risk.vulnerablePct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Evacuation Route</span>
                      <span className="font-medium text-slate-300 text-[11px] truncate block">
                        {hab.roadConnectivity}
                      </span>
                    </div>
                  </div>

                  {hab.historicalIncidents.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-400 bg-red-950/10 border border-red-900/20 p-2 rounded">
                      <strong className="text-red-300">Disaster Precedent:</strong>{' '}
                      {hab.historicalIncidents[0].year} — {hab.historicalIncidents[0].event} (
                      {hab.historicalIncidents[0].fatalities} fatalities)
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Timeline:</span>
                    {getPriorityBadge(risk.priority)}
                  </div>
                  <button className="text-amber-400 font-semibold flex items-center gap-1 hover:underline">
                    View Assessment &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

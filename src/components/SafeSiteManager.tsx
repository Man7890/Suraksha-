/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  SafeSite, 
  CarryingCapacityResult 
} from '../types';
import { 
  calculateCarryingCapacity, 
  calculateSiteSuitability 
} from '../utils/riskCalculations';
import { 
  ShieldCheck, 
  Droplets, 
  Activity, 
  Building2, 
  Truck, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Sliders, 
  Wrench,
  Gauge
} from 'lucide-react';

interface SafeSiteManagerProps {
  safeSites: SafeSite[];
  onAddNewSite: (newSite: SafeSite) => void;
  allocatedPopulations: Record<string, number>;
}

export const SafeSiteManager: React.FC<SafeSiteManagerProps> = ({
  safeSites,
  onAddNewSite,
  allocatedPopulations,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(safeSites[0]?.id || '');
  const [densityLimitOverride, setDensityLimitOverride] = useState<number>(100);
  const [showAddModal, setShowAddModal] = useState(false);

  // New site form state
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDistrict, setNewSiteDistrict] = useState('Wayanad');
  const [newSiteState, setNewSiteState] = useState('Kerala');
  const [newSiteArea, setNewSiteArea] = useState('35');
  const [newSiteWater, setNewSiteWater] = useState('2500');
  const [newSiteShelter, setNewSiteShelter] = useState('2200');

  const selectedSite = safeSites.find((s) => s.id === selectedSiteId) || safeSites[0];

  const capacityData: CarryingCapacityResult = selectedSite
    ? calculateCarryingCapacity(selectedSite, densityLimitOverride)
    : {
        physicalCapacity: 0,
        waterCapacity: 0,
        sanitationCapacity: 0,
        healthcareCapacity: 0,
        shelterCapacity: 0,
        roadCapacity: 0,
        existingPopulation: 0,
        limitingFactor: 'Physical Land',
        safeAdditionalCapacity: 0,
        utilizationPercentage: 0,
      };

  const suitabilityData = selectedSite
    ? calculateSiteSuitability(selectedSite)
    : { score: 0, tier: 'Requires Improvement' as const, isHazardOverridden: false };

  const allocated = selectedSite ? allocatedPopulations[selectedSite.id] || 0 : 0;
  const netRemaining = Math.max(0, capacityData.safeAdditionalCapacity - allocated);

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;

    const newSite: SafeSite = {
      id: `site-custom-${Date.now()}`,
      name: newSiteName.trim(),
      state: newSiteState,
      district: newSiteDistrict,
      locationDetails: 'Upland safe territory evaluated via survey',
      latitude: 11.65,
      longitude: 76.15,
      availableLandAreaHa: parseFloat(newSiteArea) || 30,
      existingPopulation: 200,
      densityLimitPerHa: densityLimitOverride,
      hazardExposureScore: 15,
      terrainSuitabilityScore: 90,
      waterCapacityPersons: parseInt(newSiteWater) || 2500,
      sanitationCapacityPersons: 3000,
      healthcareCapacityPersons: 3200,
      shelterCapacityPersons: parseInt(newSiteShelter) || 2200,
      roadEvacuationCapacityPersons: 3500,
      schoolAvailability: 'Adjacent (<1km)',
      electricityAvailability: 'Grid Connected 24x7',
      environmentalSensitivity: 'Low Impact',
      infrastructureGaps: ['Secondary health post expansion required'],
      status: 'Ready for Allocation',
    };

    onAddNewSite(newSite);
    setSelectedSiteId(newSite.id);
    setShowAddModal(false);
    setNewSiteName('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Safe Alternative Site Suitability &amp; Carrying Capacity Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-criteria evaluation calculating strict bottleneck capacities to prevent overburdening recipient zones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Candidate Site</span>
        </button>
      </div>

      {/* Main Grid: Selector & Capacity Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Site Selection & Suitability Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span>Identified Safe Relocation Sites</span>
            <span className="font-mono text-emerald-400">{safeSites.length} verified</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {safeSites.map((site) => {
              const { score, tier } = calculateSiteSuitability(site);
              const cap = calculateCarryingCapacity(site, densityLimitOverride);
              const isSelected = site.id === selectedSiteId;

              return (
                <div
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-100">{site.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tier === 'Highly Suitable'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {score}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {site.district}, {site.state}
                  </p>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2 rounded-lg">
                    <div>
                      <span className="text-slate-500 block">Available Land</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {site.availableLandAreaHa} ha
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Safe Headroom</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {cap.safeAdditionalCapacity.toLocaleString()} persons
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Bottleneck: <strong className="text-amber-400">{cap.limitingFactor}</strong></span>
                    <span className="text-slate-500">{site.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Carrying Capacity & Infrastructure Analysis */}
        {selectedSite && (
          <div className="lg:col-span-2 space-y-5">
            {/* Carrying Capacity Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                    <span>{selectedSite.name}</span>
                    <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {selectedSite.district}, {selectedSite.state}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSite.locationDetails}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-400">Suitability:</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-800">
                    {suitabilityData.tier} ({suitabilityData.score}/100)
                  </span>
                </div>
              </div>

              {/* Sensitivity Slider: Density Limit Override */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Planning Assumption: Density Limit Limit (Persons / Hectare)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Illustrative configurable planning density for rural/semi-urban resettlement.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={densityLimitOverride}
                    onChange={(e) => setDensityLimitOverride(parseInt(e.target.value))}
                    className="w-32 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-amber-400 w-12 text-right">
                    {densityLimitOverride} /ha
                  </span>
                </div>
              </div>

              {/* Bottleneck Alert */}
              <div className="p-3 bg-amber-950/20 border border-amber-800/50 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <strong className="text-amber-400">Constraining Capacity Bottleneck:</strong>{' '}
                  The site's maximum intake is physically or infrastructurally capped by{' '}
                  <span className="underline decoration-amber-500 font-bold text-white">
                    {capacityData.limitingFactor}
                  </span>
                  . Total capacity cannot exceed{' '}
                  <strong className="text-white">
                    {Math.min(
                      capacityData.physicalCapacity,
                      capacityData.waterCapacity,
                      capacityData.sanitationCapacity,
                      capacityData.healthcareCapacity,
                      capacityData.shelterCapacity,
                      capacityData.roadCapacity
                    ).toLocaleString()}
                  </strong>{' '}
                  persons without infrastructure augmentation.
                </div>
              </div>

              {/* Capacity Gauge & Key Numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Existing Population</span>
                  <span className="text-xl font-bold font-mono text-slate-200">
                    {capacityData.existingPopulation.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Current residents</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Safe Additional Intake</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {capacityData.safeAdditionalCapacity.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-300/80 block">Max new persons</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Already Allocated</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {allocated.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">In relocation pipeline</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Net Remaining Headroom</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {netRemaining.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Available today</span>
                </div>
              </div>

              {/* 6 Sub-Capacities Horizontal Bars */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Capacity Thresholds Across Core Infrastructure Systems</span>
                  <span className="text-[11px] font-mono text-slate-400">Persons Supported</span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Physical Land */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        Physical Land Area ({selectedSite.availableLandAreaHa} ha @ {densityLimitOverride}/ha)
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {capacityData.physicalCapacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(100, (capacityData.physicalCapacity / 6000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Water */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                        Water Supply Capacity
                      </span>
                      <span className={`font-mono font-bold ${capacityData.limitingFactor === 'Water Supply' ? 'text-amber-400 font-extrabold' : 'text-slate-200'}`}>
                        {capacityData.waterCapacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${capacityData.limitingFactor === 'Water Supply' ? 'bg-amber-500' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(100, (capacityData.waterCapacity / 6000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Sanitation */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Sanitation &amp; Waste Treatment
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {capacityData.sanitationCapacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(100, (capacityData.sanitationCapacity / 6000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Healthcare */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-400" />
                        Healthcare &amp; PHC Outreach
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {capacityData.healthcareCapacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${Math.min(100, (capacityData.healthcareCapacity / 6000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Shelter */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                        Emergency &amp; Phased Shelter
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {capacityData.shelterCapacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${Math.min(100, (capacityData.shelterCapacity / 6000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Road */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        Road Evacuation &amp; Transit Corridor
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {capacityData.roadCapacity.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${Math.min(100, (capacityData.roadCapacity / 6000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Infrastructure Gaps for Targeted Public Works */}
              {selectedSite.infrastructureGaps.length > 0 && (
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    Priority Public Works Upgrades Required Prior to Full Habitation Handover
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedSite.infrastructureGaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Register New Candidate Relocation Site</span>
            </h3>

            <form onSubmit={handleCreateSite} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Site / Township Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sultan Bathery North Tableland"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newSiteDistrict}
                    onChange={(e) => setNewSiteDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newSiteState}
                    onChange={(e) => setNewSiteState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Usable Land (ha)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newSiteArea}
                    onChange={(e) => setNewSiteArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Water Capacity</label>
                  <input
                    type="number"
                    min="100"
                    max="20000"
                    value={newSiteWater}
                    onChange={(e) => setNewSiteWater(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Shelter Capacity</label>
                  <input
                    type="number"
                    min="100"
                    max="20000"
                    value={newSiteShelter}
                    onChange={(e) => setNewSiteShelter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Verify &amp; Add Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

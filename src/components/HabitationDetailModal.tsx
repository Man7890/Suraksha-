/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Habitation, 
  SafeSite, 
  RelocationStatus, 
  RiskLevel, 
  RelocationPriority 
} from '../types';
import { 
  X, 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  HeartHandshake, 
  Hospital, 
  Clock, 
  History, 
  Compass, 
  Building2, 
  Save, 
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  FileBadge
} from 'lucide-react';

interface HabitationDetailModalProps {
  habitation: Habitation | null;
  onClose: () => void;
  safeSites: SafeSite[];
  onUpdateStatus: (
    habitationId: string,
    newStatus: RelocationStatus,
    assignedSiteId?: string,
    remarks?: string
  ) => void;
  calculatedRisk: {
    score: number;
    classification: RiskLevel;
    priority: RelocationPriority;
    vulnerabilityPct?: number;
    vulnerablePct?: number;
    priorityReasons: string[];
    matchedSites: Array<{
      site: SafeSite;
      matchingScore: number;
      distanceKm: number;
      remainingCapacity: number;
      infrastructureGaps: string[];
      recommendationReasons: string[];
      isViable: boolean;
    }>;
  };
}

export const HabitationDetailModal: React.FC<HabitationDetailModalProps> = ({
  habitation,
  onClose,
  safeSites,
  onUpdateStatus,
  calculatedRisk,
}) => {
  if (!habitation) return null;

  const [status, setStatus] = useState<RelocationStatus>(habitation.status);
  const [assignedSiteId, setAssignedSiteId] = useState<string>(habitation.assignedSafeSiteId || '');
  const [remarks, setRemarks] = useState<string>(habitation.officerRemarks || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateStatus(habitation.id, status, assignedSiteId || undefined, remarks);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const { score, classification, priority, priorityReasons, matchedSites } =
    calculatedRisk;
  const vulnerabilityPct = calculatedRisk.vulnerabilityPct ?? calculatedRisk.vulnerablePct ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg text-white shadow-lg ${
                classification === 'Critical'
                  ? 'bg-red-600'
                  : classification === 'High'
                  ? 'bg-orange-500'
                  : classification === 'Moderate'
                  ? 'bg-yellow-500 text-slate-950'
                  : 'bg-emerald-500'
              }`}
            >
              {score}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-100">{habitation.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    classification === 'Critical'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : classification === 'High'
                      ? 'bg-orange-950 text-orange-400 border border-orange-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {classification} Risk Zone
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {habitation.talukOrBlock}, {habitation.district}, {habitation.state}
                </span>
                <span className="text-slate-600">•</span>
                <span>Lat: {habitation.latitude.toFixed(4)}, Lon: {habitation.longitude.toFixed(4)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Priority Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              priority === 'Immediate'
                ? 'bg-red-950/40 border-red-800/80 text-red-200'
                : priority === 'Short-Term'
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-slate-800/60 border-slate-700 text-slate-200'
            }`}
          >
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide uppercase">
                  Relocation Recommendation: {priority} Priority
                </span>
              </div>
              <ul className="text-xs space-y-0.5 text-slate-300">
                {priorityReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grid: 6 Risk Factors & Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factor Spider/Bar Breakdown */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  6-Factor Risk Contribution Model
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Normalized 0-100</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Hazard Intensity (25%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {habitation.riskFactors.hazardIntensity}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${habitation.riskFactors.hazardIntensity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Population Exposure (20%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {habitation.riskFactors.populationExposure}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${habitation.riskFactors.populationExposure}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Demographic Vulnerability (20%)</span>
                    <span className="font-mono font-bold text-amber-400">
                      {habitation.riskFactors.populationVulnerability}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${habitation.riskFactors.populationVulnerability}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Historical Disaster Impact (15%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {habitation.riskFactors.historicalImpact}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${habitation.riskFactors.historicalImpact}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Infrastructure Fragility (10%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {habitation.riskFactors.infrastructureFragility}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${habitation.riskFactors.infrastructureFragility}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Evacuation Isolation Risk (10%)</span>
                    <span className="font-mono font-bold text-red-400">
                      {habitation.riskFactors.evacuationRisk}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${habitation.riskFactors.evacuationRisk}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Weighted Composite Score:</span>
                <span className="font-bold font-mono text-amber-400">{score} / 100</span>
              </div>
            </div>

            {/* Demographics & Critical Accessibility */}
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                  Demographic Vulnerability Breakdown
                </h3>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {vulnerabilityPct}% Vulnerable
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Total Population</span>
                  <span className="text-base font-bold font-mono text-slate-100">
                    {habitation.demographics.totalPopulation.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {habitation.demographics.households} households
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Children (&lt;14 yrs)</span>
                  <span className="text-base font-bold font-mono text-slate-200">
                    {habitation.demographics.children}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Senior Citizens (60+)</span>
                  <span className="text-base font-bold font-mono text-slate-200">
                    {habitation.demographics.seniorCitizens}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Persons with Disabilities</span>
                  <span className="text-base font-bold font-mono text-red-400">
                    {habitation.demographics.personsWithDisabilities}
                  </span>
                </div>
              </div>

              {/* Physical Access Factors */}
              <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Housing Type:</span>
                  <span className="font-medium text-slate-200">{habitation.housingCondition}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Road Connectivity:</span>
                  <span
                    className={`font-semibold ${
                      habitation.roadConnectivity.includes('Cut-Off')
                        ? 'text-red-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {habitation.roadConnectivity}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Distance to Hospital:</span>
                  <span className="font-mono font-medium text-slate-200">
                    {habitation.distanceToHospitalKm} km
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Distance to Evac Center:</span>
                  <span className="font-mono font-medium text-slate-200">
                    {habitation.distanceToEvacuationCentreKm} km
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Disaster Precedents */}
          {habitation.historicalIncidents.length > 0 && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                Historical Disaster Loss Records (Official SDMA Archive)
              </h3>
              <div className="space-y-2">
                {habitation.historicalIncidents.map((inc, i) => (
                  <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">
                        {inc.year} — {inc.event}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-mono font-bold">
                          {inc.fatalities} Fatalities
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-400 font-mono font-semibold">
                          {inc.housesDamaged} Homes Damaged
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-[11px]">{inc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 3 Matched Safe Relocation Sites */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Intelligent Safe Relocation Site Matching (Top 3 Candidates)
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluated on 35% suitability, 25% capacity headroom, 20% accessibility, 10% proximity, 10% infrastructure readiness.
                </p>
              </div>
            </div>

            {matchedSites.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs">
                No currently verified suitable site with sufficient capacity. Additional site assessment or phased relocation planning is required.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {matchedSites.map((match, idx) => (
                  <div
                    key={match.site.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      assignedSiteId === match.site.id
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Option #{idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                          {match.matchingScore}% Match
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100">{match.site.name}</h4>
                      <p className="text-[11px] text-slate-400">{match.site.district}, {match.site.state}</p>

                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Transit Distance:</span>
                          <span className="font-mono font-medium text-slate-200">{match.distanceKm} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Safe Headroom:</span>
                          <span className="font-mono font-medium text-emerald-400">
                            {match.remainingCapacity.toLocaleString()} persons
                          </span>
                        </div>
                      </div>

                      {match.infrastructureGaps.length > 0 && (
                        <div className="mt-2 text-[10px] text-amber-300/80 bg-amber-950/20 p-1.5 rounded border border-amber-800/30">
                          <strong>Gap:</strong> {match.infrastructureGaps[0]}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80">
                      {assignedSiteId === match.site.id ? (
                        <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1 py-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Allocated Recipient
                        </span>
                      ) : (
                        <button
                          onClick={() => setAssignedSiteId(match.site.id)}
                          className="w-full text-xs font-semibold py-1 px-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors"
                        >
                          Select for Allocation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Relocation Governance & Officer Decision Section */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileBadge className="w-4 h-4 text-amber-400" />
              Administrative Decision &amp; Audit Trail Update
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Assessment / Relocation Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RelocationStatus)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="Identified">Identified</option>
                  <option value="Under Assessment">Under Assessment</option>
                  <option value="Site Verification Pending">Site Verification Pending</option>
                  <option value="Approved by Authority">Approved by Authority</option>
                  <option value="Relocation Planning">Relocation Planning</option>
                  <option value="Relocation in Progress">Relocation in Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Designated Safe Site</label>
                <select
                  value={assignedSiteId}
                  onChange={(e) => setAssignedSiteId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- No Safe Site Assigned --</option>
                  {safeSites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                District Officer / SDMA Technical Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Record geological survey findings, land allotment approvals, or community consultation notes..."
                className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Data Provenance: {habitation.dataSource} • Confidence: {habitation.dataConfidence}%
              </span>

              <div className="flex items-center gap-2">
                {isSavedNotice && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved &amp; Logged
                  </span>
                )}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Assessment Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

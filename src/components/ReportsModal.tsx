/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Habitation, 
  SafeSite, 
  RiskLevel, 
  RelocationPriority 
} from '../types';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  Check, 
  ShieldAlert, 
  AlertTriangle 
} from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitations: Habitation[];
  safeSites: SafeSite[];
  calculatedRisks: Record<
    string,
    {
      score: number;
      classification: RiskLevel;
      vulnerablePct: number;
      priority: RelocationPriority;
    }
  >;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  habitations,
  safeSites,
  calculatedRisks,
}) => {
  if (!isOpen) return null;

  const [selectedReportType, setSelectedReportType] = useState<
    'executive' | 'red-zones' | 'safe-sites' | 'district'
  >('executive');
  const [copiedCsvNotice, setCopiedCsvNotice] = useState(false);

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Generate CSV data string
  const generateHabitationsCsv = () => {
    const headers = [
      'Habitation ID',
      'Name',
      'District',
      'State',
      'Primary Hazard',
      'Total Population',
      'Vulnerable Population',
      'Vulnerability Pct',
      'Overall Risk Score (0-100)',
      'Risk Classification',
      'Relocation Priority',
      'Status',
      'Designated Safe Site',
      'Evacuation Connectivity',
    ];

    const rows = habitations.map((h) => {
      const risk = calculatedRisks[h.id] || {
        score: 50,
        classification: 'Moderate',
        vulnerablePct: 30,
        priority: 'Medium-Term',
      };
      return [
        `"${h.id}"`,
        `"${h.name}"`,
        `"${h.district}"`,
        `"${h.state}"`,
        `"${h.primaryHazard}"`,
        h.demographics.totalPopulation,
        (h.demographics.children + h.demographics.seniorCitizens + h.demographics.personsWithDisabilities + h.demographics.otherVulnerable),
        `${risk.vulnerablePct}%`,
        risk.score,
        `"${risk.classification}"`,
        `"${risk.priority}"`,
        `"${h.status}"`,
        `"${h.assignedSafeSiteName || 'Unassigned'}"`,
        `"${h.roadConnectivity}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleDownloadCsv = () => {
    const csvContent = generateHabitationsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SURAKSHA_Disaster_Relocation_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedCsvNotice(true);
    setTimeout(() => setCopiedCsvNotice(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPop = habitations.reduce((acc, h) => acc + h.demographics.totalPopulation, 0);
  const criticalList = habitations.filter(
    (h) => (calculatedRisks[h.id]?.classification || 'Moderate') === 'Critical'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col my-auto text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Official Disaster Relocation Decision Reports
              </h2>
              <p className="text-xs text-slate-400">
                Print-ready assessments and standardized CSV exports for State Disaster Management Authorities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copiedCsvNotice ? 'Downloaded!' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/50 border-b border-slate-800 text-xs">
          <button
            onClick={() => setSelectedReportType('executive')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              selectedReportType === 'executive'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Executive Decision Brief
          </button>
          <button
            onClick={() => setSelectedReportType('red-zones')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              selectedReportType === 'red-zones'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Critical Red Zones Schedule
          </button>
          <button
            onClick={() => setSelectedReportType('safe-sites')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              selectedReportType === 'safe-sites'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Carrying Capacity Audit
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-900/60 print:bg-white print:text-black">
          {/* Document Masthead */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase text-amber-400 font-bold">
                Government Decision-Support System
              </div>
              <h1 className="text-xl font-extrabold text-slate-100 tracking-tight mt-0.5">
                PROJECT SURAKSHA: Multi-Hazard Risk &amp; Relocation Intelligence
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Intelligent Identification of Red Zones, Carrying Capacity, and Relocation Needs
              </p>
            </div>
            <div className="text-right text-slate-400 text-[11px] font-mono">
              <div>Generated: {timestamp}</div>
              <div>Authority: State / District Disaster Management</div>
            </div>
          </div>

          {/* Uncertainty & Methodology Disclaimer */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Assessment Methodology &amp; Data Confidence Statement</span>
            </div>
            <p>
              Risk scores are computed using a normalized 6-factor multi-hazard model (Hazard Intensity 25%, Population Exposure 20%, Vulnerability 20%, Historical Impact 15%, Infrastructure Fragility 10%, Evacuation Isolation 10%). Carrying capacity observes strict infrastructure bottleneck constraints. This report provides evidence-based prioritization to guide formal administrative relocations.
            </p>
          </div>

          {/* Key Metric Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Total Mapped Settlements</span>
              <span className="text-xl font-bold font-mono text-slate-100">{habitations.length}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Critical Red Zones</span>
              <span className="text-xl font-bold font-mono text-red-400">{criticalList.length}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Population at Hazard Risk</span>
              <span className="text-xl font-bold font-mono text-slate-100">{totalPop.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Verified Safe Sites</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{safeSites.length} clusters</span>
            </div>
          </div>

          {/* Main Table: Critical Red Zones Schedule */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-200">
              {selectedReportType === 'red-zones'
                ? 'Schedule of Critical Red Zone Habitations (Immediate Relocation Action)'
                : selectedReportType === 'safe-sites'
                ? 'Safe Alternative Relocation Sites & Constraining Bottlenecks'
                : 'High-Priority Settlement Relocation Summary'}
            </h3>

            {selectedReportType === 'safe-sites' ? (
              <table className="w-full text-left border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Site Name</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Land (ha)</th>
                    <th className="p-2.5">Safe Headroom</th>
                    <th className="p-2.5">Bottleneck Factor</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {safeSites.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-800/30">
                      <td className="p-2.5 font-bold text-slate-100">{site.name}</td>
                      <td className="p-2.5 text-slate-300">{site.district}</td>
                      <td className="p-2.5 font-mono">{site.availableLandAreaHa} ha</td>
                      <td className="p-2.5 font-mono text-emerald-400 font-bold">
                        {(site.waterCapacityPersons - site.existingPopulation).toLocaleString()} persons
                      </td>
                      <td className="p-2.5 text-amber-400 font-medium">Water Supply</td>
                      <td className="p-2.5 text-slate-400">{site.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Habitation Name</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Primary Hazard</th>
                    <th className="p-2.5">Population</th>
                    <th className="p-2.5">Risk Score</th>
                    <th className="p-2.5">Priority</th>
                    <th className="p-2.5">Allocated Safe Site</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(selectedReportType === 'red-zones' ? criticalList : habitations).map((hab) => {
                    const risk = calculatedRisks[hab.id] || {
                      score: 50,
                      classification: 'Moderate',
                      priority: 'Medium-Term',
                    };
                    return (
                      <tr key={hab.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-bold text-slate-100">{hab.name}</td>
                        <td className="p-2.5 text-slate-300">{hab.district}</td>
                        <td className="p-2.5 text-slate-300">{hab.primaryHazard}</td>
                        <td className="p-2.5 font-mono text-slate-200">
                          {hab.demographics.totalPopulation.toLocaleString()}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-amber-400">{risk.score}/100</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              risk.priority === 'Immediate'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {risk.priority}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-300">
                          {hab.assignedSafeSiteName || 'Under Verification'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

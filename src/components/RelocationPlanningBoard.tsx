/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Habitation, 
  SafeSite, 
  RelocationPriority, 
  RelocationStatus, 
  ActivityLogItem 
} from '../types';
import { 
  Kanban, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  ArrowRight, 
  History, 
  FileText, 
  UserCheck 
} from 'lucide-react';

interface RelocationPlanningBoardProps {
  habitations: Habitation[];
  safeSites: SafeSite[];
  onSelectHabitation: (habitation: Habitation) => void;
  onUpdateStatus: (
    habitationId: string,
    newStatus: RelocationStatus,
    assignedSiteId?: string,
    remarks?: string
  ) => void;
  activityLogs: ActivityLogItem[];
  priorities: Record<string, RelocationPriority>;
}

export const RelocationPlanningBoard: React.FC<RelocationPlanningBoardProps> = ({
  habitations,
  safeSites,
  onSelectHabitation,
  onUpdateStatus,
  activityLogs,
  priorities,
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'audit'>('board');

  const columns: { priority: RelocationPriority; label: string; color: string; border: string }[] = [
    {
      priority: 'Immediate',
      label: 'Immediate Phase 1 (Score ≥ 75 / Critical)',
      color: 'bg-red-950/40 text-red-400',
      border: 'border-red-800/80',
    },
    {
      priority: 'Short-Term',
      label: 'Short-Term Phase 2 (Score 60-74 / High)',
      color: 'bg-amber-950/40 text-amber-400',
      border: 'border-amber-800/80',
    },
    {
      priority: 'Medium-Term',
      label: 'Medium-Term Phase 3 (Score 40-59)',
      color: 'bg-blue-950/40 text-blue-400',
      border: 'border-blue-800/80',
    },
    {
      priority: 'Monitor',
      label: 'Preparedness & Monitoring (Score < 40)',
      color: 'bg-slate-900 text-slate-400',
      border: 'border-slate-800',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-amber-400" />
            <span>Relocation Planning &amp; Inter-Agency Workflow Board</span>
          </h2>
          <p className="text-xs text-slate-400">
            Lifecycle tracking from hazard identification and site survey to SDMA authority approval and rehabilitation handover.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'board'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Planning Columns
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Audit Trail ({activityLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'board' ? (
        /* Kanban Columns Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const columnHabitations = habitations.filter(
              (h) => (priorities[h.id] || 'Monitor') === col.priority
            );

            return (
              <div
                key={col.priority}
                className={`p-3.5 rounded-2xl border ${col.border} bg-slate-950/70 shadow-lg flex flex-col min-h-[500px] space-y-3`}
              >
                {/* Column Title */}
                <div className={`p-2.5 rounded-xl ${col.color} border border-current/20 flex items-center justify-between`}>
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    {col.label.split('(')[0]}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/80">
                    {columnHabitations.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                  {columnHabitations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">
                      No habitations in this timeline queue.
                    </div>
                  ) : (
                    columnHabitations.map((hab) => {
                      const assignedSite = safeSites.find((s) => s.id === hab.assignedSafeSiteId);

                      return (
                        <div
                          key={hab.id}
                          onClick={() => onSelectHabitation(hab)}
                          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all shadow hover:shadow-md space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-bold text-xs text-slate-100 hover:text-amber-400 transition-colors">
                              {hab.name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                              {hab.primaryHazard}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>{hab.district}, {hab.state}</span>
                            <span className="font-mono text-slate-300 font-semibold">
                              {hab.demographics.totalPopulation.toLocaleString()} pop
                            </span>
                          </div>

                          {/* Designated Safe Site */}
                          <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px]">
                            <span className="text-slate-500 block text-[10px] uppercase">
                              Allocated Safe Haven
                            </span>
                            {assignedSite ? (
                              <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                {assignedSite.name}
                              </span>
                            ) : (
                              <span className="text-amber-400/80 italic text-[10px]">
                                Pending verification match
                              </span>
                            )}
                          </div>

                          {/* Quick Workflow Status Selector */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1 border-t border-slate-800 flex items-center justify-between"
                          >
                            <span className="text-[10px] text-slate-500">Status:</span>
                            <select
                              value={hab.status}
                              onChange={(e) =>
                                onUpdateStatus(
                                  hab.id,
                                  e.target.value as RelocationStatus,
                                  hab.assignedSafeSiteId,
                                  hab.officerRemarks
                                )
                              }
                              className={`text-[11px] font-medium rounded px-2 py-0.5 bg-slate-950 border border-slate-700 focus:outline-none ${
                                hab.status === 'Approved by Authority'
                                  ? 'text-emerald-400 font-bold border-emerald-600'
                                  : hab.status === 'Relocation in Progress'
                                  ? 'text-cyan-400 font-bold border-cyan-600'
                                  : 'text-slate-300'
                              }`}
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
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Activity Audit Trail */
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Administrative Audit Log &amp; Authority Relocation Decisions
            </h3>
            <span className="text-xs text-slate-400">Timestamped SDMA Governance Records</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{log.habitationName}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                      {log.action}
                    </span>
                    {log.previousStatus && log.newStatus && (
                      <span className="text-[11px] text-slate-400">
                        {log.previousStatus} &rarr;{' '}
                        <strong className="text-emerald-400">{log.newStatus}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.notes}</p>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <div className="font-medium text-slate-300">{log.officer}</div>
                  <div className="text-[10px] font-mono text-slate-500">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SimulationScenario, 
  Habitation, 
  SafeSite 
} from '../types';
import { 
  X, 
  Sliders, 
  CloudRain, 
  Mountain, 
  Waves, 
  ShieldAlert, 
  Droplet, 
  RotateCcw, 
  TrendingUp, 
  AlertOctagon, 
  Check, 
  Sparkles 
} from 'lucide-react';

interface WhatIfSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: SimulationScenario;
  onUpdateScenario: (newScenario: Partial<SimulationScenario>) => void;
  onResetScenario: () => void;
  baselineHabitations: Habitation[];
  simulatedHabitations: Habitation[];
  baselineCriticalCount: number;
  simulatedCriticalCount: number;
}

export const WhatIfSimulationModal: React.FC<WhatIfSimulationModalProps> = ({
  isOpen,
  onClose,
  scenario,
  onUpdateScenario,
  onResetScenario,
  baselineCriticalCount,
  simulatedCriticalCount,
}) => {
  if (!isOpen) return null;

  const isModified =
    scenario.rainfallAnomalyPercent !== 0 ||
    scenario.slopeInstabilityFactor !== 1.0 ||
    scenario.coastalErosionProgressionMeters !== 0 ||
    scenario.roadConnectivityDisruption ||
    scenario.safeSiteWaterDeficitPercent !== 0;

  const deltaCritical = simulatedCriticalCount - baselineCriticalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-purple-800/80 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col my-auto text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-900/60 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">
                  What-If Multi-Hazard Scenario Simulator
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700/60 font-semibold">
                  Dynamic Stress Engine
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Stress-test hazard triggers, climate extremes, and infrastructure failures to foresee relocation surges.
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

        {/* Hypothetical Simulation Warning Banner */}
        <div className="bg-purple-950/40 border-b border-purple-900/50 px-5 py-2.5 flex items-center justify-between text-xs text-purple-200">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <strong>Hypothetical Decision Model:</strong> Values simulate real-time climate stress tests.
          </span>
          {isModified && (
            <button
              onClick={onResetScenario}
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-900/60 hover:bg-purple-800 px-2.5 py-1 rounded-md transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Baseline
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Comparison Impact Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-slate-500 text-[11px] block uppercase">Baseline Critical Zones</span>
              <div className="text-2xl font-mono font-bold text-slate-300">
                {baselineCriticalCount} settlements
              </div>
              <span className="text-[10px] text-slate-500">Historical normal state</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[11px] block uppercase">Simulated Critical Zones</span>
              <div className="text-2xl font-mono font-bold text-red-400">
                {simulatedCriticalCount} settlements
              </div>
              <span className="text-[10px] text-red-300/80">Under simulated scenario</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-[11px] block uppercase">Net Urgent Shift</span>
              <div className={`text-2xl font-mono font-bold flex items-center gap-1 ${
                deltaCritical > 0 ? 'text-red-400' : 'text-slate-400'
              }`}>
                {deltaCritical > 0 ? `+${deltaCritical}` : deltaCritical}
                {deltaCritical > 0 && <TrendingUp className="w-5 h-5 text-red-400" />}
              </div>
              <span className="text-[10px] text-slate-400">Habitations elevated to Critical</span>
            </div>
          </div>

          {/* Interactive Scenario Controls */}
          <div className="space-y-4">
            {/* 1. Rainfall Anomaly */}
            <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>Monsoon Downpour &amp; Extreme Rainfall Anomaly</span>
                </label>
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {scenario.rainfallAnomalyPercent > 0 ? `+${scenario.rainfallAnomalyPercent}%` : `${scenario.rainfallAnomalyPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="80"
                step="5"
                value={scenario.rainfallAnomalyPercent}
                onChange={(e) =>
                  onUpdateScenario({ rainfallAnomalyPercent: parseInt(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Drought (-30%)</span>
                <span>Normal (0%)</span>
                <span>Cloudburst Surge (+80%)</span>
              </div>
            </div>

            {/* 2. Slope Instability Factor */}
            <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-400" />
                  <span>Western Ghats / Himalayan Slope Instability Factor</span>
                </label>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {scenario.slopeInstabilityFactor.toFixed(1)}x Multiplier
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={scenario.slopeInstabilityFactor}
                onChange={(e) =>
                  onUpdateScenario({ slopeInstabilityFactor: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Stable (1.0x)</span>
                <span>Active Soil Liquefaction (1.5x)</span>
                <span>Catastrophic Slip (2.0x)</span>
              </div>
            </div>

            {/* 3. Coastal Erosion Progression */}
            <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-400" />
                  <span>Coastal Intertidal Ingress / Erosion Progression</span>
                </label>
                <span className="font-mono text-xs font-bold text-blue-400">
                  +{scenario.coastalErosionProgressionMeters} Meters Shoreline Loss
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={scenario.coastalErosionProgressionMeters}
                onChange={(e) =>
                  onUpdateScenario({ coastalErosionProgressionMeters: parseInt(e.target.value) })
                }
                className="w-full accent-blue-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Current Embankment (0m)</span>
                <span>Moderate Sea Incursion (+20m)</span>
                <span>Barrier Island Submergence (+40m)</span>
              </div>
            </div>

            {/* 4. Road Connectivity Disruption & Water Deficit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Bridge Washout / Cut-Off Road
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Spikes evacuation isolation risk to critical.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateScenario({
                      roadConnectivityDisruption: !scenario.roadConnectivityDisruption,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    scenario.roadConnectivityDisruption ? 'bg-red-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      scenario.roadConnectivityDisruption ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Safe Site Water Deficit</span>
                  <span className="font-mono font-bold text-amber-400">
                    -{scenario.safeSiteWaterDeficitPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={scenario.safeSiteWaterDeficitPercent}
                  onChange={(e) =>
                    onUpdateScenario({ safeSiteWaterDeficitPercent: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Changes update map pins, carrying capacities, and priorities instantly.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-950/60 transition-all"
          >
            Apply Scenario to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

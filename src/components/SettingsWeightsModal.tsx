/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskWeights } from '../types';
import { DEFAULT_RISK_WEIGHTS } from '../utils/riskCalculations';
import { X, Settings2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SettingsWeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: RiskWeights;
  onSaveWeights: (weights: RiskWeights) => void;
}

export const SettingsWeightsModal: React.FC<SettingsWeightsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
}) => {
  if (!isOpen) return null;

  const [localWeights, setLocalWeights] = useState<RiskWeights>({ ...weights });

  const sumPct = Math.round(
    (localWeights.hazardIntensity +
      localWeights.populationExposure +
      localWeights.populationVulnerability +
      localWeights.historicalImpact +
      localWeights.infrastructureFragility +
      localWeights.evacuationRisk) *
      100
  );

  const isValid = sumPct === 100;

  const handleChange = (key: keyof RiskWeights, valuePct: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: valuePct / 100,
    }));
  };

  const handleReset = () => {
    setLocalWeights({ ...DEFAULT_RISK_WEIGHTS });
  };

  const handleSave = () => {
    if (!isValid) return;
    onSaveWeights(localWeights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Configure Risk Formula Weights</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Adjust the relative weight distribution of the 6 core hazard factors. In accordance with SDMA guidelines, the sum of all weights must strictly equal 100%.
        </p>

        {/* Total Weight Indicator */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            isValid
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
              : 'bg-red-950/30 border-red-800 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>Total Weight Sum: {sumPct}%</span>
          </div>
          {!isValid && <span>Must equal exactly 100%</span>}
        </div>

        {/* Sliders */}
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Hazard Intensity:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.round(localWeights.hazardIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={Math.round(localWeights.hazardIntensity * 100)}
              onChange={(e) => handleChange('hazardIntensity', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Population Exposure:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.round(localWeights.populationExposure * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={Math.round(localWeights.populationExposure * 100)}
              onChange={(e) => handleChange('populationExposure', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Population Vulnerability:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.round(localWeights.populationVulnerability * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={Math.round(localWeights.populationVulnerability * 100)}
              onChange={(e) => handleChange('populationVulnerability', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Historical Disaster Impact:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.round(localWeights.historicalImpact * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={Math.round(localWeights.historicalImpact * 100)}
              onChange={(e) => handleChange('historicalImpact', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Infrastructure Fragility:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.round(localWeights.infrastructureFragility * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={Math.round(localWeights.infrastructureFragility * 100)}
              onChange={(e) => handleChange('infrastructureFragility', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300">Evacuation Accessibility Risk:</span>
              <span className="font-mono font-bold text-amber-400">
                {Math.round(localWeights.evacuationRisk * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={Math.round(localWeights.evacuationRisk * 100)}
              onChange={(e) => handleChange('evacuationRisk', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline (25/20/20/15/10/10)</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow transition-all"
          >
            Save Formula Weights
          </button>
        </div>
      </div>
    </div>
  );
};

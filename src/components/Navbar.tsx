/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldAlert, 
  Sliders, 
  MapPin, 
  Users, 
  BrainCircuit, 
  FileText, 
  Settings2, 
  RotateCcw,
  Languages,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'habitations' | 'safe-sites' | 'planning-board';
  setActiveTab: (tab: 'map' | 'habitations' | 'safe-sites' | 'planning-board') => void;
  onOpenSimulation: () => void;
  onOpenAI: () => void;
  onOpenReports: () => void;
  onOpenSettings: () => void;
  isSimulated: boolean;
  onResetSimulation: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSimulation,
  onOpenAI,
  onOpenReports,
  onOpenSettings,
  isSimulated,
  onResetSimulation,
  language,
  onToggleLanguage,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600 text-white shadow-lg shadow-orange-950/40">
              <ShieldAlert className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-slate-100 font-mono">
                  SURAKSHA
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-red-950/80 text-red-400 border border-red-800/60 hidden sm:inline-block">
                  SDMA / DDMA Decision Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {language === 'en' 
                  ? 'Multi-Hazard Red Zone Mapping & Safe Relocation Decision Platform' 
                  : 'बहु-आपदा रेड ज़ोन मानचित्रण एवं सुरक्षित पुनर्वास निर्णय प्रणाली'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {language === 'en' ? 'GIS Red Zone Map' : 'जीआईएस रेड ज़ोन मानचित्र'}
            </button>

            <button
              onClick={() => setActiveTab('habitations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'habitations'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {language === 'en' ? 'Vulnerable Habitations' : 'संवेदनशील बस्तियां'}
            </button>

            <button
              onClick={() => setActiveTab('safe-sites')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'safe-sites'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {language === 'en' ? 'Safe Sites & Capacity' : 'सुरक्षित स्थल एवं वहन क्षमता'}
            </button>

            <button
              onClick={() => setActiveTab('planning-board')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'planning-board'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              {language === 'en' ? 'Relocation Board' : 'पुनर्वास बोर्ड'}
            </button>
          </nav>

          {/* Action Tools & AI Assistant */}
          <div className="flex items-center gap-2">
            {/* Simulation Active Indicator */}
            {isSimulated && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-medium hidden sm:inline">Scenario Active</span>
                <button
                  onClick={onResetSimulation}
                  title="Reset to baseline"
                  className="hover:text-white ml-1 p-0.5 rounded hover:bg-amber-500/20"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* What-If Simulation Button */}
            <button
              onClick={onOpenSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-900/80 to-indigo-900/80 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-700/50 transition-all shadow-sm"
              title="Run What-If Hazard & Infrastructure Scenarios"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">What-If Simulation</span>
            </button>

            {/* Suraksha AI Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-900/80 to-blue-900/80 hover:from-cyan-800 hover:to-blue-800 text-cyan-200 border border-cyan-700/50 transition-all shadow-sm"
              title="Open Suraksha AI Intelligence Analyst"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">Suraksha AI</span>
            </button>

            {/* Export Reports */}
            <button
              onClick={onOpenReports}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70 transition-all"
              title="Export Government Relocation Reports & CSV"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Reports</span>
            </button>

            {/* Weights / Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-750 transition-all"
              title="Configure Risk Scoring Weights"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Language Switch */}
            <button
              onClick={onToggleLanguage}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-750 transition-all text-xs font-mono"
              title="Toggle English / हिन्दी"
            >
              <Languages className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2 py-1 rounded ${activeTab === 'map' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('habitations')}
            className={`px-2 py-1 rounded ${activeTab === 'habitations' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Habitations
          </button>
          <button
            onClick={() => setActiveTab('safe-sites')}
            className={`px-2 py-1 rounded ${activeTab === 'safe-sites' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Safe Sites
          </button>
          <button
            onClick={() => setActiveTab('planning-board')}
            className={`px-2 py-1 rounded ${activeTab === 'planning-board' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
          >
            Planning
          </button>
        </div>
      </div>
    </header>
  );
};

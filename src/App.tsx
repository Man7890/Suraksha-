/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Habitation, 
  SafeSite, 
  RelocationStatus, 
  RiskLevel, 
  RelocationPriority, 
  RiskWeights, 
  SimulationScenario, 
  ActivityLogItem 
} from './types';
import { 
  INITIAL_HABITATIONS, 
  INITIAL_SAFE_SITES, 
  INITIAL_ACTIVITY_LOGS 
} from './data/demonstrationData';
import { 
  DEFAULT_RISK_WEIGHTS, 
  calculateRiskScore, 
  classifyRisk, 
  calculateVulnerabilityPercentage, 
  calculateRelocationPriority, 
  calculateTotalVulnerable, 
  calculateCarryingCapacity, 
  matchHabitationToSites, 
  applySimulationToHabitation 
} from './utils/riskCalculations';

// Components
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { GISMap } from './components/GISMap';
import { HabitationList } from './components/HabitationList';
import { HabitationDetailModal } from './components/HabitationDetailModal';
import { SafeSiteManager } from './components/SafeSiteManager';
import { RelocationPlanningBoard } from './components/RelocationPlanningBoard';
import { WhatIfSimulationModal } from './components/WhatIfSimulationModal';
import { SurakshaAIAssistant } from './components/SurakshaAIAssistant';
import { ReportsModal } from './components/ReportsModal';
import { SettingsWeightsModal } from './components/SettingsWeightsModal';
import { HazardTimeline } from './components/HazardTimeline';

const BASELINE_SCENARIO: SimulationScenario = {
  rainfallAnomalyPercent: 0,
  slopeInstabilityFactor: 1.0,
  coastalErosionProgressionMeters: 0,
  roadConnectivityDisruption: false,
  safeSiteWaterDeficitPercent: 0,
};

export default function App() {
  // State
  const [habitations, setHabitations] = useState<Habitation[]>(INITIAL_HABITATIONS);
  const [safeSites, setSafeSites] = useState<SafeSite[]>(INITIAL_SAFE_SITES);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [riskWeights, setRiskWeights] = useState<RiskWeights>(DEFAULT_RISK_WEIGHTS);
  const [simulationScenario, setSimulationScenario] = useState<SimulationScenario>(BASELINE_SCENARIO);

  // Active View & Filters
  const [activeTab, setActiveTab] = useState<'map' | 'habitations' | 'safe-sites' | 'planning-board'>('map');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedHazard, setSelectedHazard] = useState<string>('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Modals
  const [selectedHabitationId, setSelectedHabitationId] = useState<string | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isReportsOpen, setIsReportsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Check if simulation scenario is modified
  const isSimulationActive = useMemo(() => {
    return (
      simulationScenario.rainfallAnomalyPercent !== 0 ||
      simulationScenario.slopeInstabilityFactor !== 1.0 ||
      simulationScenario.coastalErosionProgressionMeters !== 0 ||
      simulationScenario.roadConnectivityDisruption ||
      simulationScenario.safeSiteWaterDeficitPercent !== 0
    );
  }, [simulationScenario]);

  // Dynamic habitations (with simulation scenario applied)
  const activeHabitations = useMemo(() => {
    return habitations.map((h) => applySimulationToHabitation(h, simulationScenario));
  }, [habitations, simulationScenario]);

  // Dynamic safe sites (with water deficit applied if simulated)
  const activeSafeSites = useMemo(() => {
    if (simulationScenario.safeSiteWaterDeficitPercent === 0) return safeSites;
    const factor = (100 - simulationScenario.safeSiteWaterDeficitPercent) / 100;
    return safeSites.map((s) => ({
      ...s,
      waterCapacityPersons: Math.round(s.waterCapacityPersons * factor),
    }));
  }, [safeSites, simulationScenario]);

  // Track allocated populations per safe site
  const allocatedSitePopulations = useMemo(() => {
    const map: Record<string, number> = {};
    activeHabitations.forEach((h) => {
      if (h.assignedSafeSiteId && (h.status === 'Approved by Authority' || h.status === 'Relocation in Progress' || h.status === 'Relocation Planning')) {
        map[h.assignedSafeSiteId] = (map[h.assignedSafeSiteId] || 0) + h.demographics.totalPopulation;
      }
    });
    return map;
  }, [activeHabitations]);

  // Calculate risk & priority for all habitations
  const calculatedHabitationRisks = useMemo(() => {
    const results: Record<
      string,
      {
        score: number;
        classification: RiskLevel;
        dominantHazard: any;
        vulnerablePct: number;
        priority: RelocationPriority;
        priorityReasons: string[];
        matchedSites: any[];
      }
    > = {};

    activeHabitations.forEach((hab) => {
      const score = calculateRiskScore(hab.riskFactors, riskWeights);
      const classification = classifyRisk(score);
      const vulnerablePct = calculateVulnerabilityPercentage(hab.demographics);
      
      const pastFatalities = hab.historicalIncidents.reduce((sum, inc) => sum + inc.fatalities, 0);
      const { priority, reasons } = calculateRelocationPriority(
        score,
        vulnerablePct,
        hab.riskFactors.evacuationRisk,
        pastFatalities
      );

      const matchedSites = matchHabitationToSites(hab, activeSafeSites, allocatedSitePopulations);

      results[hab.id] = {
        score,
        classification,
        dominantHazard: hab.primaryHazard,
        vulnerablePct,
        priority: hab.priorityOverride || priority,
        priorityReasons: reasons,
        matchedSites,
      };
    });

    return results;
  }, [activeHabitations, activeSafeSites, riskWeights, allocatedSitePopulations]);

  // Baseline critical count (before simulation)
  const baselineCriticalCount = useMemo(() => {
    return habitations.filter((h) => {
      const score = calculateRiskScore(h.riskFactors, DEFAULT_RISK_WEIGHTS);
      return score >= 75;
    }).length;
  }, [habitations]);

  // Filtered habitations for dashboard & list
  const filteredHabitations = useMemo(() => {
    return activeHabitations.filter((hab) => {
      const risk = calculatedHabitationRisks[hab.id];
      if (!risk) return true;

      if (selectedDistrict !== 'ALL' && hab.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      if (selectedHazard !== 'ALL' && hab.primaryHazard !== selectedHazard) {
        return false;
      }

      if (selectedRiskLevel !== 'ALL' && risk.classification !== selectedRiskLevel) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = hab.name.toLowerCase().includes(query);
        const matchesLocality = hab.villageLocality.toLowerCase().includes(query);
        const matchesDistrict = hab.district.toLowerCase().includes(query);
        const matchesHazard = hab.primaryHazard.toLowerCase().includes(query);
        if (!matchesName && !matchesLocality && !matchesDistrict && !matchesHazard) {
          return false;
        }
      }

      return true;
    });
  }, [activeHabitations, calculatedHabitationRisks, selectedDistrict, selectedHazard, selectedRiskLevel, searchQuery]);

  // Available districts for dropdown
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    habitations.forEach((h) => set.add(h.district));
    return Array.from(set).sort();
  }, [habitations]);

  // KPI aggregates calculated strictly from records
  const kpiStats = useMemo(() => {
    let criticalCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;
    let totalPop = 0;
    let totalVulnerable = 0;
    let immediateCount = 0;

    activeHabitations.forEach((hab) => {
      const risk = calculatedHabitationRisks[hab.id];
      if (!risk) return;

      if (risk.classification === 'Critical') criticalCount++;
      else if (risk.classification === 'High') highCount++;
      else if (risk.classification === 'Moderate') moderateCount++;
      else lowCount++;

      totalPop += hab.demographics.totalPopulation;
      totalVulnerable += calculateTotalVulnerable(hab.demographics);

      if (risk.priority === 'Immediate') immediateCount++;
    });

    // Total safe capacity headroom across all sites
    let totalHeadroom = 0;
    activeSafeSites.forEach((site) => {
      const cap = calculateCarryingCapacity(site);
      const allocated = allocatedSitePopulations[site.id] || 0;
      totalHeadroom += Math.max(0, cap.safeAdditionalCapacity - allocated);
    });

    return {
      criticalCount,
      highCount,
      moderateCount,
      lowCount,
      totalPop,
      totalVulnerable,
      totalHeadroom,
      immediateCount,
    };
  }, [activeHabitations, activeSafeSites, calculatedHabitationRisks, allocatedSitePopulations]);

  // Update Status & Log Action
  const handleUpdateStatus = (
    habitationId: string,
    newStatus: RelocationStatus,
    assignedSiteId?: string,
    remarks?: string
  ) => {
    setHabitations((prev) =>
      prev.map((h) => {
        if (h.id === habitationId) {
          const site = safeSites.find((s) => s.id === assignedSiteId);
          return {
            ...h,
            status: newStatus,
            assignedSafeSiteId: assignedSiteId,
            assignedSafeSiteName: site?.name || h.assignedSafeSiteName,
            officerRemarks: remarks ?? h.officerRemarks,
          };
        }
        return h;
      })
    );

    const targetHab = habitations.find((h) => h.id === habitationId);
    if (targetHab) {
      const logItem: ActivityLogItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        habitationId,
        habitationName: targetHab.name,
        action: 'Status/Allocation Update',
        officer: 'District Collector & SDMA Joint Board',
        previousStatus: targetHab.status,
        newStatus,
        notes: remarks || `Administrative workflow progressed to ${newStatus}.`,
      };
      setActivityLogs((prev) => [logItem, ...prev]);
    }
  };

  const handleAddNewSite = (newSite: SafeSite) => {
    setSafeSites((prev) => [...prev, newSite]);
  };

  const handleUpdateScenario = (newScenario: Partial<SimulationScenario>) => {
    setSimulationScenario((prev) => ({ ...prev, ...newScenario }));
  };

  const handleResetScenario = () => {
    setSimulationScenario(BASELINE_SCENARIO);
  };

  const handleSaveWeights = (weights: RiskWeights) => {
    setRiskWeights(weights);
  };

  const selectedHabitation = habitations.find((h) => h.id === selectedHabitationId) || null;
  const selectedHabitationRisk = selectedHabitation
    ? calculatedHabitationRisks[selectedHabitation.id]
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSimulated={isSimulationActive}
        onResetSimulation={handleResetScenario}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'))}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Dashboard & Filter Bar */}
        <DashboardStats
          totalHabitations={activeHabitations.length}
          criticalCount={kpiStats.criticalCount}
          highCount={kpiStats.highCount}
          moderateCount={kpiStats.moderateCount}
          lowCount={kpiStats.lowCount}
          totalPopulationExposed={kpiStats.totalPop}
          totalVulnerableResidents={kpiStats.totalVulnerable}
          safeSitesCount={activeSafeSites.length}
          totalSafeCapacity={kpiStats.totalHeadroom}
          immediateAssessmentCount={kpiStats.immediateCount}
          lastUpdateTimestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedHazard={selectedHazard}
          setSelectedHazard={setSelectedHazard}
          selectedRiskLevel={selectedRiskLevel}
          setSelectedRiskLevel={setSelectedRiskLevel}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          availableDistricts={availableDistricts}
        />

        {/* Tab 1: GIS Map View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <GISMap
              habitations={filteredHabitations}
              safeSites={activeSafeSites}
              onSelectHabitation={(hab) => setSelectedHabitationId(hab.id)}
              onSelectSafeSite={(site) => {
                setActiveTab('safe-sites');
              }}
              calculatedRisks={calculatedHabitationRisks}
            />

            {/* Historical Disaster Timeline Drawer below map */}
            <HazardTimeline />
          </div>
        )}

        {/* Tab 2: Habitations Registry */}
        {activeTab === 'habitations' && (
          <HabitationList
            habitations={filteredHabitations}
            onSelectHabitation={(hab) => setSelectedHabitationId(hab.id)}
            calculatedRisks={calculatedHabitationRisks}
          />
        )}

        {/* Tab 3: Safe Sites & Carrying Capacity */}
        {activeTab === 'safe-sites' && (
          <SafeSiteManager
            safeSites={activeSafeSites}
            onAddNewSite={handleAddNewSite}
            allocatedPopulations={allocatedSitePopulations}
          />
        )}

        {/* Tab 4: Relocation Planning Board */}
        {activeTab === 'planning-board' && (
          <RelocationPlanningBoard
            habitations={activeHabitations}
            safeSites={activeSafeSites}
            onSelectHabitation={(hab) => setSelectedHabitationId(hab.id)}
            onUpdateStatus={handleUpdateStatus}
            activityLogs={activityLogs}
            priorities={Object.fromEntries(
              Object.entries(calculatedHabitationRisks).map(([k, v]) => [k, v.priority])
            )}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>SURAKSHA</strong> — Smart Unified Risk Assessment, Zone Analysis &amp; Knowledge-based Habitation Allocation.
          </div>
          <div className="text-[11px] text-slate-500">
            Hackathon Decision-Support Prototype • For review by State &amp; District Disaster Management Authorities.
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedHabitation && selectedHabitationRisk && (
        <HabitationDetailModal
          habitation={selectedHabitation}
          onClose={() => setSelectedHabitationId(null)}
          safeSites={activeSafeSites}
          onUpdateStatus={handleUpdateStatus}
          calculatedRisk={selectedHabitationRisk}
        />
      )}

      {isSimulationOpen && (
        <WhatIfSimulationModal
          isOpen={isSimulationOpen}
          onClose={() => setIsSimulationOpen(false)}
          scenario={simulationScenario}
          onUpdateScenario={handleUpdateScenario}
          onResetScenario={handleResetScenario}
          baselineHabitations={habitations}
          simulatedHabitations={activeHabitations}
          baselineCriticalCount={baselineCriticalCount}
          simulatedCriticalCount={kpiStats.criticalCount}
        />
      )}

      {isAIOpen && (
        <SurakshaAIAssistant
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          habitations={activeHabitations}
          safeSites={activeSafeSites}
          calculatedRisks={calculatedHabitationRisks}
          simulationScenario={simulationScenario}
        />
      )}

      {isReportsOpen && (
        <ReportsModal
          isOpen={isReportsOpen}
          onClose={() => setIsReportsOpen(false)}
          habitations={activeHabitations}
          safeSites={activeSafeSites}
          calculatedRisks={calculatedHabitationRisks}
        />
      )}

      {isSettingsOpen && (
        <SettingsWeightsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          weights={riskWeights}
          onSaveWeights={handleSaveWeights}
        />
      )}
    </div>
  );
}

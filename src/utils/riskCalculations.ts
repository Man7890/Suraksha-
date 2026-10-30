/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CarryingCapacityResult,
  Demographics,
  Habitation,
  HazardType,
  MatchedSiteResult,
  RelocationPriority,
  RiskFactors,
  RiskLevel,
  RiskWeights,
  SafeSite,
} from '../types';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  hazardIntensity: 0.25,
  populationExposure: 0.20,
  populationVulnerability: 0.20,
  historicalImpact: 0.15,
  infrastructureFragility: 0.10,
  evacuationRisk: 0.10,
};

/**
 * Calculates total vulnerable residents safely clamped to not exceed total population.
 */
export function calculateTotalVulnerable(demographics: Demographics): number {
  const sum =
    (demographics.children || 0) +
    (demographics.seniorCitizens || 0) +
    (demographics.personsWithDisabilities || 0) +
    (demographics.otherVulnerable || 0);

  return Math.min(demographics.totalPopulation, Math.max(0, sum));
}

/**
 * Calculates vulnerability percentage (0 to 100%).
 */
export function calculateVulnerabilityPercentage(demographics: Demographics): number {
  if (!demographics.totalPopulation || demographics.totalPopulation <= 0) {
    return 0;
  }
  const vulnerable = calculateTotalVulnerable(demographics);
  const pct = (vulnerable / demographics.totalPopulation) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(1));
}

/**
 * Calculate multi-hazard overall risk score using configurable weights.
 * Normalizes inputs to 0-100.
 */
export function calculateRiskScore(
  factors: RiskFactors,
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS
): number {
  const clamp = (val: number) => Math.min(100, Math.max(0, val || 0));

  const weighted =
    clamp(factors.hazardIntensity) * weights.hazardIntensity +
    clamp(factors.populationExposure) * weights.populationExposure +
    clamp(factors.populationVulnerability) * weights.populationVulnerability +
    clamp(factors.historicalImpact) * weights.historicalImpact +
    clamp(factors.infrastructureFragility) * weights.infrastructureFragility +
    clamp(factors.evacuationRisk) * weights.evacuationRisk;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

/**
 * Classifies risk score into standard 4-tier category.
 */
export function classifyRisk(score: number): RiskLevel {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
}

/**
 * Derives relocation priority from risk score and critical vulnerability triggers.
 */
export function calculateRelocationPriority(
  score: number,
  vulnerabilityPct: number,
  evacuationRisk: number,
  historicalFatalities = 0
): { priority: RelocationPriority; reasons: string[] } {
  const reasons: string[] = [];

  let priority: RelocationPriority = 'Monitor';
  if (score >= 75) {
    priority = 'Immediate';
    reasons.push(`Composite risk score is in the Critical range (${score}/100)`);
  } else if (score >= 60) {
    priority = 'Short-Term';
    reasons.push(`Elevated risk score (${score}/100) requires planned relocation`);
  } else if (score >= 40) {
    priority = 'Medium-Term';
    reasons.push(`Moderate risk score (${score}/100) indicates preparedness and monitoring`);
  } else {
    priority = 'Monitor';
    reasons.push(`Low composite risk score (${score}/100)`);
  }

  // Vulnerability trigger: if over 50% residents are vulnerable and score >= 50
  if (vulnerabilityPct >= 50 && score >= 50 && priority === 'Medium-Term') {
    priority = 'Short-Term';
    reasons.push(`High vulnerable demographic share (${vulnerabilityPct}%) escalated priority`);
  }

  // Evacuation accessibility risk trigger
  if (evacuationRisk >= 80 && score >= 65 && priority !== 'Immediate') {
    priority = 'Immediate';
    reasons.push(`Extreme evacuation isolation risk (${evacuationRisk}/100) necessitates immediate safety intervention`);
  }

  // Historical fatality trigger
  if (historicalFatalities > 5 && priority === 'Short-Term' && score >= 70) {
    priority = 'Immediate';
    reasons.push(`History of severe disaster fatalities (${historicalFatalities}+ recorded)`);
  }

  return { priority, reasons };
}

/**
 * Calculate site suitability score (0-100) and suitability tier.
 * Formula:
 * Hazard Safety: 30%
 * Terrain Suitability: 20%
 * Water Availability: 15%
 * Healthcare Access: 10%
 * Road Connectivity: 10%
 * Essential Infrastructure: 10%
 * Environmental Suitability: 5%
 */
export function calculateSiteSuitability(site: SafeSite): {
  score: number;
  tier: 'Highly Suitable' | 'Suitable with Conditions' | 'Requires Improvement' | 'Not Recommended';
  isHazardOverridden: boolean;
} {
  const hazardSafety = Math.max(0, 100 - site.hazardExposureScore); // 0-100 (higher = safer)
  const terrain = site.terrainSuitabilityScore;
  
  // Normalize capacities into 0-100 indices relative to typical baseline
  const waterNorm = Math.min(100, (site.waterCapacityPersons / Math.max(1, site.existingPopulation + 500)) * 100);
  const healthNorm = Math.min(100, (site.healthcareCapacityPersons / Math.max(1, site.existingPopulation + 500)) * 100);
  const roadNorm = Math.min(100, (site.roadEvacuationCapacityPersons / Math.max(1, site.existingPopulation + 500)) * 100);
  const infraNorm = site.electricityAvailability === 'Grid Connected 24x7' ? 100 : 70;
  const envNorm = site.environmentalSensitivity === 'Low Impact' ? 100 : site.environmentalSensitivity === 'Moderate Scrub' ? 70 : 40;

  const rawScore =
    hazardSafety * 0.30 +
    terrain * 0.20 +
    waterNorm * 0.15 +
    healthNorm * 0.10 +
    roadNorm * 0.10 +
    infraNorm * 0.10 +
    envNorm * 0.05;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  // Critical hazard override rule: A site with critical hazard exposure (safety < 40 or exposure > 60)
  // must NEVER be recommended solely because of high infrastructure score.
  const isHazardOverridden = site.hazardExposureScore >= 60 || hazardSafety < 40;

  let tier: 'Highly Suitable' | 'Suitable with Conditions' | 'Requires Improvement' | 'Not Recommended';
  if (isHazardOverridden || score < 45) {
    tier = 'Not Recommended';
  } else if (score >= 80) {
    tier = 'Highly Suitable';
  } else if (score >= 65) {
    tier = 'Suitable with Conditions';
  } else {
    tier = 'Requires Improvement';
  }

  return { score, tier, isHazardOverridden };
}

/**
 * Calculates carrying capacity and identifying the limiting bottleneck.
 * Safe Additional Capacity = min(Physical, Water, Sanitation, Healthcare, Shelter, Road) - Existing Population
 */
export function calculateCarryingCapacity(
  site: SafeSite,
  densityLimitPerHaOverride?: number
): CarryingCapacityResult {
  const density = densityLimitPerHaOverride ?? site.densityLimitPerHa ?? 100;
  const physicalCapacity = Math.round(site.availableLandAreaHa * density);
  
  const capacities = [
    { name: 'Physical Land' as const, value: physicalCapacity },
    { name: 'Water Supply' as const, value: site.waterCapacityPersons },
    { name: 'Sanitation' as const, value: site.sanitationCapacityPersons },
    { name: 'Healthcare' as const, value: site.healthcareCapacityPersons },
    { name: 'Shelter' as const, value: site.shelterCapacityPersons },
    { name: 'Road/Evacuation' as const, value: site.roadEvacuationCapacityPersons },
  ];

  // Find lowest ceiling
  let minCap = capacities[0];
  for (const c of capacities) {
    if (c.value < minCap.value) {
      minCap = c;
    }
  }

  const safeAdditionalCapacity = Math.max(0, minCap.value - site.existingPopulation);
  const totalMax = Math.max(1, minCap.value);
  const utilizationPercentage = Math.min(100, Math.round((site.existingPopulation / totalMax) * 100));

  return {
    physicalCapacity,
    waterCapacity: site.waterCapacityPersons,
    sanitationCapacity: site.sanitationCapacityPersons,
    healthcareCapacity: site.healthcareCapacityPersons,
    shelterCapacity: site.shelterCapacityPersons,
    roadCapacity: site.roadEvacuationCapacityPersons,
    existingPopulation: site.existingPopulation,
    limitingFactor: minCap.name,
    safeAdditionalCapacity,
    utilizationPercentage,
  };
}

/**
 * Haversine distance in kilometers between two geo-coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Matches an unsafe habitation against safe candidate relocation sites.
 * Uses:
 * 35% Site Suitability
 * 25% Available Capacity Adequacy
 * 20% Accessibility
 * 10% Geographic Proximity
 * 10% Infrastructure Readiness
 */
export function matchHabitationToSites(
  habitation: Habitation,
  safeSites: SafeSite[],
  allocatedSitePopulations: Record<string, number> = {}
): MatchedSiteResult[] {
  const populationNeeded = habitation.demographics.totalPopulation;

  const evaluated: MatchedSiteResult[] = safeSites.map((site) => {
    const { score: suitabilityScore, tier, isHazardOverridden } = calculateSiteSuitability(site);
    const capacityResult = calculateCarryingCapacity(site);

    const alreadyAllocated = allocatedSitePopulations[site.id] || 0;
    const remainingCapacity = Math.max(0, capacityResult.safeAdditionalCapacity - alreadyAllocated);

    const distanceKm = calculateHaversineDistanceKm(
      habitation.latitude,
      habitation.longitude,
      site.latitude,
      site.longitude
    );

    const isSameDistrict = habitation.district.toLowerCase() === site.district.toLowerCase();

    // Capacity adequacy score (0-100)
    let capacityScore = 0;
    if (remainingCapacity >= populationNeeded) {
      capacityScore = 100;
    } else if (remainingCapacity > 0) {
      capacityScore = (remainingCapacity / populationNeeded) * 70;
    } else {
      capacityScore = 0;
    }

    // Proximity score: decays with distance, bonus for same district
    const distancePenalty = Math.max(0, 100 - distanceKm * 1.5);
    const proximityScore = Math.min(100, (isSameDistrict ? 30 : 0) + distancePenalty * 0.7);

    // Accessibility score
    const accessibilityScore = 100 - Math.min(100, habitation.riskFactors.evacuationRisk * 0.5 + distanceKm * 0.5);

    // Infrastructure Readiness score
    const infraReadinessScore = Math.max(0, 100 - (site.infrastructureGaps.length * 20));

    // Composite matching score
    const matchingScoreRaw =
      suitabilityScore * 0.35 +
      capacityScore * 0.25 +
      accessibilityScore * 0.20 +
      proximityScore * 0.10 +
      infraReadinessScore * 0.10;

    const matchingScore = Math.round(Math.min(100, Math.max(0, matchingScoreRaw)));

    const isViable = !isHazardOverridden && tier !== 'Not Recommended' && remainingCapacity >= (populationNeeded * 0.3);

    const recommendationReasons: string[] = [];
    if (isSameDistrict) recommendationReasons.push(`Located in same home district (${site.district})`);
    if (remainingCapacity >= populationNeeded) {
      recommendationReasons.push(`Ample safe headroom (${remainingCapacity.toLocaleString()} surplus capacity)`);
    } else if (remainingCapacity > 0) {
      recommendationReasons.push(`Can accommodate partial phase 1 intake (${remainingCapacity.toLocaleString()} persons)`);
    }
    if (distanceKm <= 25) recommendationReasons.push(`Close proximity (${distanceKm} km transit radius)`);
    if (tier === 'Highly Suitable') recommendationReasons.push(`High terrain stability & low multi-hazard exposure`);

    return {
      site,
      matchingScore,
      distanceKm,
      remainingCapacity,
      infrastructureGaps: site.infrastructureGaps,
      recommendationReasons,
      isViable,
    };
  });

  // Sort descending by matching score
  return evaluated
    .sort((a, b) => b.matchingScore - a.matchingScore)
    .slice(0, 3);
}

/**
 * Applies what-if simulation adjustments to a habitation's risk factors.
 */
export function applySimulationToHabitation(
  habitation: Habitation,
  scenario: {
    rainfallAnomalyPercent: number;
    slopeInstabilityFactor: number;
    coastalErosionProgressionMeters: number;
    roadConnectivityDisruption: boolean;
  }
): Habitation {
  const original = habitation.riskFactors;
  const isFloodProne = habitation.primaryHazard === 'Flood' || habitation.primaryHazard === 'Cloudburst';
  const isLandslideProne = habitation.primaryHazard === 'Landslide';
  const isCoastal = habitation.primaryHazard === 'Coastal Erosion' || habitation.primaryHazard === 'Cyclone';

  let simulatedHazard = original.hazardIntensity;

  // Rainfall anomaly impacts flood and cloudburst intensity
  if (isFloodProne && scenario.rainfallAnomalyPercent !== 0) {
    simulatedHazard += (scenario.rainfallAnomalyPercent * 0.4);
  }

  // Slope instability impacts landslide intensity
  if (isLandslideProne && scenario.slopeInstabilityFactor !== 1.0) {
    simulatedHazard *= scenario.slopeInstabilityFactor;
  }

  // Coastal erosion progression
  if (isCoastal && scenario.coastalErosionProgressionMeters > 0) {
    simulatedHazard += (scenario.coastalErosionProgressionMeters * 0.8);
  }

  // Road connectivity disruption spikes evacuation accessibility risk
  let simulatedEvacRisk = original.evacuationRisk;
  let simulatedFragility = original.infrastructureFragility;
  if (scenario.roadConnectivityDisruption) {
    simulatedEvacRisk = Math.min(100, simulatedEvacRisk + 30);
    simulatedFragility = Math.min(100, simulatedFragility + 20);
  }

  const updatedFactors: RiskFactors = {
    hazardIntensity: Math.round(Math.min(100, Math.max(0, simulatedHazard))),
    populationExposure: original.populationExposure,
    populationVulnerability: original.populationVulnerability,
    historicalImpact: original.historicalImpact,
    infrastructureFragility: Math.round(Math.min(100, Math.max(0, simulatedFragility))),
    evacuationRisk: Math.round(Math.min(100, Math.max(0, simulatedEvacRisk))),
  };

  return {
    ...habitation,
    riskFactors: updatedFactors,
  };
}

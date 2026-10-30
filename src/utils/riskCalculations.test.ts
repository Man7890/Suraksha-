/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskScore,
  classifyRisk,
  calculateVulnerabilityPercentage,
  calculateTotalVulnerable,
  calculateCarryingCapacity,
  calculateSiteSuitability,
  calculateRelocationPriority,
  calculateHaversineDistanceKm,
  matchHabitationToSites,
  DEFAULT_RISK_WEIGHTS,
} from './riskCalculations';
import { Demographics, Habitation, RiskFactors, SafeSite } from '../types';

test('calculateRiskScore accurately computes weighted risk within 0-100 bounds', () => {
  const factors: RiskFactors = {
    hazardIntensity: 80,       // 80 * 0.25 = 20
    populationExposure: 70,    // 70 * 0.20 = 14
    populationVulnerability: 60, // 60 * 0.20 = 12
    historicalImpact: 90,      // 90 * 0.15 = 13.5
    infrastructureFragility: 50, // 50 * 0.10 = 5
    evacuationRisk: 80,        // 80 * 0.10 = 8
  };
  // Expected sum: 20 + 14 + 12 + 13.5 + 5 + 8 = 72.5 -> rounds to 73 (High)
  const score = calculateRiskScore(factors, DEFAULT_RISK_WEIGHTS);
  assert.equal(score, 73);
  assert.equal(classifyRisk(score), 'High');
});

test('calculateRiskScore clamps values exceeding bounds', () => {
  const factors: RiskFactors = {
    hazardIntensity: 150,
    populationExposure: 200,
    populationVulnerability: 100,
    historicalImpact: 100,
    infrastructureFragility: 100,
    evacuationRisk: 100,
  };
  const score = calculateRiskScore(factors);
  assert.equal(score, 100);
  assert.equal(classifyRisk(score), 'Critical');
});

test('classifyRisk accurately categorizes boundaries', () => {
  assert.equal(classifyRisk(0), 'Low');
  assert.equal(classifyRisk(24), 'Low');
  assert.equal(classifyRisk(25), 'Moderate');
  assert.equal(classifyRisk(49), 'Moderate');
  assert.equal(classifyRisk(50), 'High');
  assert.equal(classifyRisk(74), 'High');
  assert.equal(classifyRisk(75), 'Critical');
  assert.equal(classifyRisk(100), 'Critical');
});

test('calculateVulnerabilityPercentage clamps sum and never exceeds 100%', () => {
  const demographics: Demographics = {
    totalPopulation: 1000,
    households: 220,
    children: 250,
    seniorCitizens: 180,
    personsWithDisabilities: 45,
    otherVulnerable: 25,
  };
  // total vulnerable = 500, total = 1000 -> 50%
  const vulnerable = calculateTotalVulnerable(demographics);
  assert.equal(vulnerable, 500);
  const pct = calculateVulnerabilityPercentage(demographics);
  assert.equal(pct, 50);

  // Overflow demographic clamp test
  const overflowDemo: Demographics = {
    totalPopulation: 100,
    households: 20,
    children: 80,
    seniorCitizens: 80,
    personsWithDisabilities: 20,
    otherVulnerable: 10,
  };
  assert.equal(calculateTotalVulnerable(overflowDemo), 100);
  assert.equal(calculateVulnerabilityPercentage(overflowDemo), 100);

  // Zero population safety test
  assert.equal(calculateVulnerabilityPercentage({
    totalPopulation: 0,
    households: 0,
    children: 0,
    seniorCitizens: 0,
    personsWithDisabilities: 0,
    otherVulnerable: 0,
  }), 0);
});

test('calculateCarryingCapacity identifies bottleneck correctly and clamps additional capacity >= 0', () => {
  const mockSite: SafeSite = {
    id: 'site-1',
    name: 'Test Ridge Safe Site',
    state: 'Kerala',
    district: 'Wayanad',
    locationDetails: 'Elevated plateau',
    latitude: 11.6,
    longitude: 76.1,
    availableLandAreaHa: 20, // 20 * 100 = 2000 physical capacity
    existingPopulation: 300,
    densityLimitPerHa: 100,
    hazardExposureScore: 10,
    terrainSuitabilityScore: 90,
    waterCapacityPersons: 1200, // Limiting bottleneck!
    sanitationCapacityPersons: 1800,
    healthcareCapacityPersons: 1500,
    shelterCapacityPersons: 1600,
    roadEvacuationCapacityPersons: 2200,
    schoolAvailability: 'Adjacent (<1km)',
    electricityAvailability: 'Grid Connected 24x7',
    environmentalSensitivity: 'Low Impact',
    infrastructureGaps: [],
    status: 'Ready for Allocation',
  };

  const cap = calculateCarryingCapacity(mockSite);
  assert.equal(cap.physicalCapacity, 2000);
  assert.equal(cap.limitingFactor, 'Water Supply');
  // Safe additional = min(2000, 1200, 1800, 1500, 1600, 2200) - 300 = 1200 - 300 = 900
  assert.equal(cap.safeAdditionalCapacity, 900);

  // Test over-utilized site clamping to 0
  const overCrowdedSite: SafeSite = {
    ...mockSite,
    existingPopulation: 2500,
  };
  const overCap = calculateCarryingCapacity(overCrowdedSite);
  assert.equal(overCap.safeAdditionalCapacity, 0);
});

test('calculateSiteSuitability enforces critical hazard exposure override', () => {
  const hazardousSite: SafeSite = {
    id: 'site-danger',
    name: 'Floodplain Site',
    state: 'Assam',
    district: 'Majuli',
    locationDetails: 'River edge',
    latitude: 26.9,
    longitude: 94.2,
    availableLandAreaHa: 50,
    existingPopulation: 100,
    densityLimitPerHa: 100,
    hazardExposureScore: 75, // Critical hazard exposure!
    terrainSuitabilityScore: 85,
    waterCapacityPersons: 5000,
    sanitationCapacityPersons: 5000,
    healthcareCapacityPersons: 5000,
    shelterCapacityPersons: 5000,
    roadEvacuationCapacityPersons: 5000,
    schoolAvailability: 'Adjacent (<1km)',
    electricityAvailability: 'Grid Connected 24x7',
    environmentalSensitivity: 'Low Impact',
    infrastructureGaps: [],
    status: 'Ready for Allocation',
  };

  const { tier, isHazardOverridden } = calculateSiteSuitability(hazardousSite);
  assert.equal(isHazardOverridden, true);
  assert.equal(tier, 'Not Recommended');
});

test('calculateRelocationPriority assigns correct tier and transparent rationale', () => {
  const critical = calculateRelocationPriority(82, 45, 60, 2);
  assert.equal(critical.priority, 'Immediate');
  assert.ok(critical.reasons.length > 0);

  const shortTerm = calculateRelocationPriority(65, 30, 40, 0);
  assert.equal(shortTerm.priority, 'Short-Term');

  // Trigger priority elevation when evacuation accessibility is cut off
  const isolated = calculateRelocationPriority(68, 40, 85, 0);
  assert.equal(isolated.priority, 'Immediate');
});

test('calculateHaversineDistanceKm computes realistic distance', () => {
  // Wayanad coordinates approx
  const dist = calculateHaversineDistanceKm(11.52, 76.13, 11.61, 76.08);
  assert.ok(dist > 5 && dist < 20);
});

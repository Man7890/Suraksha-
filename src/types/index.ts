/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HazardType = 
  | 'Landslide' 
  | 'Flood' 
  | 'Coastal Erosion' 
  | 'Cloudburst' 
  | 'Earthquake' 
  | 'Cyclone';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type RelocationPriority = 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Monitor';

export type RelocationStatus = 
  | 'Identified'
  | 'Under Assessment'
  | 'Site Verification Pending'
  | 'Approved by Authority'
  | 'Relocation Planning'
  | 'Relocation in Progress'
  | 'Completed';

export interface Demographics {
  totalPopulation: number;
  households: number;
  children: number;
  seniorCitizens: number;
  personsWithDisabilities: number;
  otherVulnerable: number;
}

export interface RiskFactors {
  hazardIntensity: number;       // 0 - 100
  populationExposure: number;    // 0 - 100
  populationVulnerability: number; // 0 - 100
  historicalImpact: number;      // 0 - 100
  infrastructureFragility: number; // 0 - 100
  evacuationRisk: number;        // 0 - 100 (higher = worse accessibility)
}

export interface RiskWeights {
  hazardIntensity: number;       // default 0.25
  populationExposure: number;    // default 0.20
  populationVulnerability: number; // default 0.20
  historicalImpact: number;      // default 0.15
  infrastructureFragility: number; // default 0.10
  evacuationRisk: number;        // default 0.10
}

export interface DisasterIncident {
  year: number;
  event: string;
  fatalities: number;
  housesDamaged: number;
  economicLossLakhs: number;
  description: string;
}

export interface Habitation {
  id: string;
  name: string;
  state: string;
  district: string;
  talukOrBlock: string;
  villageLocality: string;
  latitude: number;
  longitude: number;
  demographics: Demographics;
  primaryHazard: HazardType;
  secondaryHazards: HazardType[];
  riskFactors: RiskFactors;
  housingCondition: 'Kutcha (Thatch/Mud)' | 'Semi-Pucca' | 'Pucca Unreinforced' | 'Pucca Engineered';
  roadConnectivity: 'All-Weather Paved' | 'Fair-Weather Dirt' | 'Footpath Only' | 'Cut-Off During Hazard';
  distanceToHospitalKm: number;
  distanceToEvacuationCentreKm: number;
  historicalIncidents: DisasterIncident[];
  lastAssessmentDate: string;
  dataConfidence: number; // 0 - 100% based on completeness
  dataSource: 'District Field Survey' | 'ISRO Bhuvan / NRSC' | 'State DMA Survey' | 'Demonstration Prototype Model';
  isSimulatedRecord: boolean;
  
  // Relocation management state
  status: RelocationStatus;
  assignedSafeSiteId?: string;
  assignedSafeSiteName?: string;
  officerRemarks?: string;
  priorityOverride?: RelocationPriority;
  redZonePolygon?: [number, number][]; // optional demonstration hazard polygon
}

export interface SafeSite {
  id: string;
  name: string;
  state: string;
  district: string;
  locationDetails: string;
  latitude: number;
  longitude: number;
  availableLandAreaHa: number;
  existingPopulation: number;
  densityLimitPerHa: number; // default 100
  hazardExposureScore: number; // 0-100 (lower means safer; hazard safety = 100 - exposure)
  terrainSuitabilityScore: number; // 0-100
  waterCapacityPersons: number;
  sanitationCapacityPersons: number;
  healthcareCapacityPersons: number;
  shelterCapacityPersons: number;
  roadEvacuationCapacityPersons: number;
  schoolAvailability: 'Adjacent (<1km)' | 'Moderate (1-3km)' | 'Poor (>3km)';
  electricityAvailability: 'Grid Connected 24x7' | 'Grid Connected Intermittent' | 'Solar Microgrid';
  environmentalSensitivity: 'Low Impact' | 'Moderate Scrub' | 'Eco-Sensitive Buffer';
  infrastructureGaps: string[];
  status: 'Ready for Allocation' | 'Improvement Works Underway' | 'Survey Pending';
}

export interface MatchedSiteResult {
  site: SafeSite;
  matchingScore: number; // 0-100
  distanceKm: number;
  remainingCapacity: number;
  infrastructureGaps: string[];
  recommendationReasons: string[];
  isViable: boolean;
}

export interface CalculatedHabitationRisk {
  overallRiskScore: number;
  riskClassification: RiskLevel;
  relocationPriority: RelocationPriority;
  vulnerabilityPercentage: number;
  dominantHazard: HazardType;
  totalVulnerablePopulation: number;
  priorityReasons: string[];
  matchedSites: MatchedSiteResult[];
}

export interface CarryingCapacityResult {
  physicalCapacity: number;
  waterCapacity: number;
  sanitationCapacity: number;
  healthcareCapacity: number;
  shelterCapacity: number;
  roadCapacity: number;
  existingPopulation: number;
  limitingFactor: 'Physical Land' | 'Water Supply' | 'Sanitation' | 'Healthcare' | 'Shelter' | 'Road/Evacuation';
  safeAdditionalCapacity: number;
  utilizationPercentage: number;
}

export interface SimulationScenario {
  rainfallAnomalyPercent: number; // -50% to +100%
  slopeInstabilityFactor: number; // 1.0 to 2.5x
  coastalErosionProgressionMeters: number; // 0 to 50m
  roadConnectivityDisruption: boolean;
  safeSiteWaterDeficitPercent: number; // 0 to 60%
  addedCustomSite?: SafeSite;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  habitationId: string;
  habitationName: string;
  action: string;
  officer: string;
  previousStatus?: RelocationStatus;
  newStatus?: RelocationStatus;
  notes: string;
}

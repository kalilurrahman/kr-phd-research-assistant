import data from "./comprehensive-resources.json";

export interface ToolItem {
  id: string;
  name: string;
  category: string;
  purpose: string;
  type: string;
  cost: string;
  features: string[];
  bestFor: string[];
  website: string;
  rating?: number;
  reviews?: number;
}

export interface MethodologyItem {
  id: string;
  type: string;
  description: string;
  designApproach: string;
  dataType: string;
  analysisApproach: string;
  sampleSize?: string;
  strengths: string[];
  challenges: string[];
  bestFor: string[];
  recommendedTools?: string[];
  difficulty?: string;
  timeline?: string;
}

export interface BestPracticeItem {
  id: string;
  name: string;
  area: string;
  description: string;
  steps: string[];
  tools: string[];
  successIndicators: string[];
  commonPitfalls?: string[];
  timeline?: string;
}

export interface BestPracticePhase {
  months: string;
  practices: BestPracticeItem[];
}

export interface PublicationVenue {
  id: string;
  name: string;
  examples?: string[];
  peerReview?: string;
  timeline?: string;
  audience?: string;
  reach?: string;
  citability?: string;
  advantages?: string[];
  considerations?: string[];
  bestFor?: string;
}

export interface PublicationType {
  description: string;
  venues: PublicationVenue[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  whenNeeded?: string;
  actions: string[];
  timeline?: string;
  penalties?: string;
  resources?: string[];
}

export interface EthicsCategory {
  description: string;
  requirements: ComplianceRequirement[];
}

export interface ComprehensiveResources {
  meta: { title: string; description: string; version: string; lastUpdated: string };
  tools: { meta: { count: number }; categories: string[]; data: ToolItem[] };
  methodologies: { meta: { count: number }; data: MethodologyItem[] };
  bestPractices: { meta: { count: number }; phases: Record<string, BestPracticePhase> };
  publicationVenues: { meta: { count: number }; types: Record<string, PublicationType> };
  ethicsCompliance: { meta: { count: number }; categories: Record<string, EthicsCategory> };
}

export const resources = data as unknown as ComprehensiveResources;

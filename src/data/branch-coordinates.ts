import type { BranchCoordinates } from '@/types';

export const BRANCH_COORDINATES: BranchCoordinates[] = [
  { branchName: 'Austin Downtown', lat: 30.2672, lng: -97.7431 },
  { branchName: 'Austin Domain', lat: 30.4020, lng: -97.7254 },
  { branchName: 'Round Rock', lat: 30.5083, lng: -97.6789 },
  { branchName: 'Downtown Dallas', lat: 32.7767, lng: -96.7970 },
  { branchName: 'Fort Worth Stockyards', lat: 32.7905, lng: -97.3472 },
  { branchName: 'Plano Legacy', lat: 33.0198, lng: -96.6989 },
  { branchName: 'Arlington Entertainment', lat: 32.7357, lng: -97.1081 },
  { branchName: 'Frisco Stonebriar', lat: 33.1175, lng: -96.8083 },
  { branchName: 'McKinney Town Center', lat: 33.1972, lng: -96.6398 },
  { branchName: 'Houston Galleria', lat: 29.7604, lng: -95.3698 },
  { branchName: 'Houston Heights', lat: 29.7905, lng: -95.3983 },
  { branchName: 'The Woodlands', lat: 30.1658, lng: -95.4613 },
  { branchName: 'Sugar Land', lat: 29.6197, lng: -95.6349 },
  { branchName: 'San Antonio Riverwalk', lat: 29.4241, lng: -98.4936 },
  { branchName: 'San Antonio Medical Center', lat: 29.5089, lng: -98.5726 },
];

export function getCoordinates(branchName: string): BranchCoordinates | undefined {
  return BRANCH_COORDINATES.find(b => b.branchName === branchName);
}

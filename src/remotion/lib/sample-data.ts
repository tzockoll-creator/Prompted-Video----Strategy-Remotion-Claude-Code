// Static branch data snapshot for Remotion video

export const kpiData = [
  { label: 'Total Profit', value: 12847, prefix: '$', suffix: 'K', trend: 12.4 },
  { label: 'Total Members', value: 184500, prefix: '', suffix: '', trend: 5.2 },
  { label: 'NPS Score', value: 72, prefix: '', suffix: '', trend: 3.1 },
  { label: 'Digital Adoption', value: 68, prefix: '', suffix: '%', trend: 8.7 },
  { label: 'Net New Members', value: 2340, prefix: '+', suffix: '', trend: 15.3 },
];

export const lineChartData = [
  { quarter: 'Q1', value: 2800 },
  { quarter: 'Q2', value: 3100 },
  { quarter: 'Q3', value: 3400 },
  { quarter: 'Q4', value: 3200 },
  { quarter: 'Q1\'25', value: 3600 },
  { quarter: 'Q2\'25', value: 3900 },
  { quarter: 'Q3\'25', value: 4200 },
  { quarter: 'Q4\'25', value: 4500 },
];

export const barChartData = [
  { label: 'Deposits', value: 85 },
  { label: 'Loans', value: 62 },
  { label: 'Fee Income', value: 48 },
  { label: 'Interest', value: 71 },
  { label: 'Cross-Sell', value: 55 },
];

export interface BranchDot {
  name: string;
  lat: number;
  lng: number;
  region: string;
  profit: number;
}

export const branchDots: BranchDot[] = [
  { name: 'Austin Downtown', lat: 30.267, lng: -97.743, region: 'Austin', profit: 920 },
  { name: 'Austin Domain', lat: 30.402, lng: -97.725, region: 'Austin', profit: 850 },
  { name: 'Round Rock', lat: 30.508, lng: -97.679, region: 'Austin', profit: 780 },
  { name: 'Downtown Dallas', lat: 32.780, lng: -96.797, region: 'Dallas-Fort Worth', profit: 1100 },
  { name: 'Fort Worth Stockyards', lat: 32.790, lng: -97.347, region: 'Dallas-Fort Worth', profit: 920 },
  { name: 'Plano Legacy', lat: 33.024, lng: -96.752, region: 'Dallas-Fort Worth', profit: 1050 },
  { name: 'Arlington', lat: 32.736, lng: -97.108, region: 'Dallas-Fort Worth', profit: 870 },
  { name: 'Frisco', lat: 33.151, lng: -96.824, region: 'Dallas-Fort Worth', profit: 960 },
  { name: 'McKinney', lat: 33.197, lng: -96.615, region: 'Dallas-Fort Worth', profit: 810 },
  { name: 'Houston Galleria', lat: 29.760, lng: -95.461, region: 'Houston', profit: 1200 },
  { name: 'Houston Heights', lat: 29.790, lng: -95.398, region: 'Houston', profit: 880 },
  { name: 'The Woodlands', lat: 30.166, lng: -95.461, region: 'Houston', profit: 950 },
  { name: 'Sugar Land', lat: 29.620, lng: -95.635, region: 'Houston', profit: 820 },
  { name: 'SA Riverwalk', lat: 29.424, lng: -98.493, region: 'San Antonio', profit: 900 },
  { name: 'SA Medical Center', lat: 29.510, lng: -98.575, region: 'San Antonio', profit: 760 },
];

export const QUARTERS = [
  '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4',
  '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4',
] as const;

export const REGIONS = ['Austin', 'Dallas-Fort Worth', 'Houston', 'San Antonio'] as const;

export const BRANCH_TYPES = ['Flagship', 'Full Service', 'Retail'] as const;

export const REGION_COLORS: Record<string, string> = {
  'Austin': '#3b82f6',
  'Dallas-Fort Worth': '#8b5cf6',
  'Houston': '#06b6d4',
  'San Antonio': '#f59e0b',
};

export const CHART_COLORS = [
  '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981',
  '#ef4444', '#ec4899', '#f97316', '#14b8a6', '#6366f1',
  '#84cc16', '#a855f7', '#0ea5e9', '#eab308', '#22c55e',
];

export const MAP_CENTER: [number, number] = [31.0, -99.5];
export const MAP_ZOOM = 6;

export const METRIC_DEFINITIONS = {
  branchProfitK: { label: 'Branch Profit', unit: 'currency', suffix: 'K' },
  totalMembers: { label: 'Total Members', unit: 'number' },
  npsScore: { label: 'NPS Score', unit: 'score' },
  digitalAdoptionPct: { label: 'Digital Adoption', unit: 'percent' },
  totalDepositsK: { label: 'Total Deposits', unit: 'currency', suffix: 'K' },
  totalLoansK: { label: 'Total Loans', unit: 'currency', suffix: 'K' },
  interestIncomeK: { label: 'Interest Income', unit: 'currency', suffix: 'K' },
  feeIncomeK: { label: 'Fee Income', unit: 'currency', suffix: 'K' },
  operatingCostK: { label: 'Operating Cost', unit: 'currency', suffix: 'K' },
  profitPerMember: { label: 'Profit/Member', unit: 'currency' },
  loanToDepositRatio: { label: 'Loan-to-Deposit Ratio', unit: 'percent' },
  mobileAppAdoptionPct: { label: 'Mobile App Adoption', unit: 'percent' },
  mobileDepositAdoptionPct: { label: 'Mobile Deposit Adoption', unit: 'percent' },
  billPayAdoptionPct: { label: 'Bill Pay Adoption', unit: 'percent' },
  digitalAccountOpens: { label: 'Digital Account Opens', unit: 'number' },
  netNewMembers: { label: 'Net New Members', unit: 'number' },
  crossSellRatePct: { label: 'Cross-Sell Rate', unit: 'percent' },
  avgWaitTimeMin: { label: 'Avg Wait Time', unit: 'minutes' },
  complaintRatePer1000: { label: 'Complaint Rate', unit: 'per1000' },
} as const;

export type MetricKey = keyof typeof METRIC_DEFINITIONS;

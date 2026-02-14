export interface BranchRecord {
  quarter: string;
  branchName: string;
  region: string;
  branchType: string;
  yearOpened: number;
  interestIncomeK: number;
  feeIncomeK: number;
  operatingCostK: number;
  branchProfitK: number;
  profitPerMember: number;
  costPerTransaction: number;
  totalMembers: number;
  newAccounts: number;
  branchAccountOpens: number;
  closedAccounts: number;
  netNewMembers: number;
  totalDepositsK: number;
  checkingK: number;
  savingsK: number;
  cdsK: number;
  moneyMarketK: number;
  depositGrowthPct: number;
  totalLoansK: number;
  autoLoansK: number;
  mortgageK: number;
  personalLoansK: number;
  helocK: number;
  loanGrowthPct: number;
  loanToDepositRatio: number;
  totalTransactions: number;
  tellerTransactions: number;
  atmTransactions: number;
  digitalTransactions: number;
  tellerSharePct: number;
  digitalSharePct: number;
  activeDigitalMembers: number;
  digitalAdoptionPct: number;
  mobileAppAdoptionPct: number;
  mobileOnlyMembers: number;
  mobileDepositAdoptionPct: number;
  billPayAdoptionPct: number;
  digitalAccountOpens: number;
  staffCount: number;
  ftePer1000Members: number;
  transactionsPerFte: number;
  npsScore: number;
  avgWaitTimeMin: number;
  complaintRatePer1000: number;
  squareFeet: number;
  crossSellRatePct: number;
  productsPerMember: number;
}

export interface BranchCoordinates {
  branchName: string;
  lat: number;
  lng: number;
}

export interface FilterState {
  quarters: string[];
  regions: string[];
  branchTypes: string[];
}

export interface WhatIfParams {
  interestRateChangePct: number;
  memberGrowthRatePct: number;
  operatingCostChangePct: number;
  digitalAdoptionTargetPct: number;
  loanGrowthRatePct: number;
}

#!/usr/bin/env node
/**
 * generate-data.js
 *
 * Generates a 120-row dataset (15 branches x 8 quarters) for a financial
 * institution branch performance dashboard.
 *
 * - Houston Galleria rows use verbatim real data for all 8 quarters.
 * - Every branch's 2025-Q4 row is anchored to the provided snapshot.
 * - Remaining branch-quarter combos are back-projected from the 2025-Q4
 *   anchor with realistic seasonal variation and gradual trends.
 */

"use strict";

// ---------------------------------------------------------------------------
// Seedable PRNG (mulberry32) so results are deterministic
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

/** Uniform random in [lo, hi] */
function rand(lo, hi) {
  return lo + rng() * (hi - lo);
}

/** Round to n decimal places */
function r(v, n = 1) {
  const f = Math.pow(10, n);
  return Math.round(v * f) / f;
}

/** Integer round */
function ri(v) {
  return Math.round(v);
}

// ---------------------------------------------------------------------------
// Quarters (in order)
// ---------------------------------------------------------------------------
const QUARTERS = [
  "2024-Q1",
  "2024-Q2",
  "2024-Q3",
  "2024-Q4",
  "2025-Q1",
  "2025-Q2",
  "2025-Q3",
  "2025-Q4",
];

// Quarter index: 0 = 2024-Q1, ..., 7 = 2025-Q4
const Q4_2025_IDX = 7;

// Seasonal multipliers for financial metrics (Q1 weaker, Q4 stronger)
const SEASONAL = {
  Q1: 0.92,
  Q2: 1.01,
  Q3: 1.03,
  Q4: 1.04,
};

function qSeason(q) {
  return SEASONAL["Q" + q.split("-Q")[1]];
}

// ---------------------------------------------------------------------------
// Branch definitions
// ---------------------------------------------------------------------------
const BRANCHES = [
  { name: "Austin Downtown", region: "Austin", type: "Flagship", yearOpened: 1995 },
  { name: "Austin Domain", region: "Austin", type: "Full Service", yearOpened: 2012 },
  { name: "Round Rock", region: "Austin", type: "Retail", yearOpened: 2018 },
  { name: "Downtown Dallas", region: "Dallas-Fort Worth", type: "Flagship", yearOpened: 1985 },
  { name: "Fort Worth Stockyards", region: "Dallas-Fort Worth", type: "Full Service", yearOpened: 1992 },
  { name: "Plano Legacy", region: "Dallas-Fort Worth", type: "Full Service", yearOpened: 1998 },
  { name: "Arlington Entertainment", region: "Dallas-Fort Worth", type: "Retail", yearOpened: 2005 },
  { name: "Frisco Stonebriar", region: "Dallas-Fort Worth", type: "Full Service", yearOpened: 2008 },
  { name: "McKinney Town Center", region: "Dallas-Fort Worth", type: "Retail", yearOpened: 2015 },
  { name: "Houston Galleria", region: "Houston", type: "Flagship", yearOpened: 1990 },
  { name: "Houston Heights", region: "Houston", type: "Full Service", yearOpened: 2002 },
  { name: "The Woodlands", region: "Houston", type: "Full Service", yearOpened: 2006 },
  { name: "Sugar Land", region: "Houston", type: "Retail", yearOpened: 2010 },
  { name: "San Antonio Riverwalk", region: "San Antonio", type: "Full Service", yearOpened: 1988 },
  { name: "San Antonio Medical Center", region: "San Antonio", type: "Retail", yearOpened: 2014 },
];

// ---------------------------------------------------------------------------
// Houston Galleria REAL data (all 8 quarters)
// ---------------------------------------------------------------------------
const HG_REAL = [
  {
    quarter: "2024-Q1", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 16302.4, feeIncomeK: 415, operatingCostK: 378.6, branchProfitK: 16338.9,
    totalMembers: 20818, npsScore: 42, digitalAdoptionPct: 35.9, totalDepositsK: 1737360, totalLoansK: 1223675,
    totalTransactions: 181862, digitalTransactions: 64104, tellerTransactions: 84725, activeDigitalMembers: 7468,
    newAccounts: 135, closedAccounts: 84, netNewMembers: 51, staffCount: 14, profitPerMember: 784.84,
    costPerTransaction: 2.08, depositGrowthPct: 6.5, loanGrowthPct: 5.2, loanToDepositRatio: 70.4,
    digitalSharePct: 35.2, tellerSharePct: 46.6, mobileAppAdoptionPct: 34, mobileDepositAdoptionPct: 22.6,
    billPayAdoptionPct: 16, digitalAccountOpens: 48, crossSellRatePct: 2.89, productsPerMember: 3.09,
    ftePer1000Members: 0.67, transactionsPerFte: 12990, avgWaitTimeMin: 11.2, complaintRatePer1000: 1.8,
    mobileOnlyMembers: 1865, squareFeet: 7200, branchAccountOpens: 87,
    checkingK: 706596, savingsK: 530359, cdsK: 279569, moneyMarketK: 220836,
    autoLoansK: 372388, mortgageK: 436233, personalLoansK: 137700, helocK: 277353,
    atmTransactions: 33033,
  },
  {
    quarter: "2024-Q2", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 16819.2, feeIncomeK: 450.2, operatingCostK: 424.8, branchProfitK: 16844.5,
    totalMembers: 21766, npsScore: 33, digitalAdoptionPct: 36.5, totalDepositsK: 1790200, totalLoansK: 1305399,
    totalTransactions: 281144, digitalTransactions: 109693, tellerTransactions: 121195, activeDigitalMembers: 7949,
    newAccounts: 116, closedAccounts: 45, netNewMembers: 71, staffCount: 15, profitPerMember: 773.89,
    costPerTransaction: 1.51, depositGrowthPct: -1.3, loanGrowthPct: 2.9, loanToDepositRatio: 72.9,
    digitalSharePct: 39, tellerSharePct: 43.1, mobileAppAdoptionPct: 36.3, mobileDepositAdoptionPct: 26.8,
    billPayAdoptionPct: 19.4, digitalAccountOpens: 45, crossSellRatePct: 3.33, productsPerMember: 3.05,
    ftePer1000Members: 0.69, transactionsPerFte: 18742, avgWaitTimeMin: 11.3, complaintRatePer1000: 1.88,
    mobileOnlyMembers: 2124, squareFeet: 7200, branchAccountOpens: 71,
    checkingK: 742027, savingsK: 550522, cdsK: 248877, moneyMarketK: 248775,
    autoLoansK: 412787, mortgageK: 473642, personalLoansK: 169367, helocK: 249603,
    atmTransactions: 50256,
  },
  {
    quarter: "2024-Q3", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 17116.7, feeIncomeK: 429.2, operatingCostK: 392.7, branchProfitK: 17153.2,
    totalMembers: 21819, npsScore: 45, digitalAdoptionPct: 40.1, totalDepositsK: 1700946, totalLoansK: 1280598,
    totalTransactions: 214195, digitalTransactions: 85558, tellerTransactions: 88973, activeDigitalMembers: 8754,
    newAccounts: 60, closedAccounts: 31, netNewMembers: 29, staffCount: 15, profitPerMember: 786.16,
    costPerTransaction: 1.83, depositGrowthPct: 5.2, loanGrowthPct: -0.8, loanToDepositRatio: 75.3,
    digitalSharePct: 39.9, tellerSharePct: 41.5, mobileAppAdoptionPct: 38.4, mobileDepositAdoptionPct: 23,
    billPayAdoptionPct: 20, digitalAccountOpens: 24, crossSellRatePct: 4.02, productsPerMember: 2.86,
    ftePer1000Members: 0.69, transactionsPerFte: 14279, avgWaitTimeMin: 12.1, complaintRatePer1000: 1.79,
    mobileOnlyMembers: 2443, squareFeet: 7200, branchAccountOpens: 36,
    checkingK: 742457, savingsK: 526021, cdsK: 271342, moneyMarketK: 161127,
    autoLoansK: 434093, mortgageK: 520386, personalLoansK: 165856, helocK: 160263,
    atmTransactions: 39664,
  },
  {
    quarter: "2024-Q4", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 19202.8, feeIncomeK: 458.2, operatingCostK: 406.8, branchProfitK: 19254.1,
    totalMembers: 22196, npsScore: 45, digitalAdoptionPct: 41.6, totalDepositsK: 1720417, totalLoansK: 1340743,
    totalTransactions: 227449, digitalTransactions: 102415, tellerTransactions: 88630, activeDigitalMembers: 9239,
    newAccounts: 93, closedAccounts: 33, netNewMembers: 60, staffCount: 14, profitPerMember: 867.46,
    costPerTransaction: 1.79, depositGrowthPct: 2, loanGrowthPct: -0.1, loanToDepositRatio: 77.9,
    digitalSharePct: 45, tellerSharePct: 39, mobileAppAdoptionPct: 39.9, mobileDepositAdoptionPct: 23.2,
    billPayAdoptionPct: 21.9, digitalAccountOpens: 34, crossSellRatePct: 5.38, productsPerMember: 2.92,
    ftePer1000Members: 0.63, transactionsPerFte: 16246, avgWaitTimeMin: 13.8, complaintRatePer1000: 1.78,
    mobileOnlyMembers: 2839, squareFeet: 7200, branchAccountOpens: 59,
    checkingK: 686720, savingsK: 618114, cdsK: 242101, moneyMarketK: 173482,
    autoLoansK: 423740, mortgageK: 483497, personalLoansK: 126706, helocK: 306801,
    atmTransactions: 36404,
  },
  {
    quarter: "2025-Q1", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 13841, feeIncomeK: 392.9, operatingCostK: 372.7, branchProfitK: 13861.2,
    totalMembers: 22302, npsScore: 41, digitalAdoptionPct: 43.9, totalDepositsK: 1735515, totalLoansK: 1212391,
    totalTransactions: 239598, digitalTransactions: 105656, tellerTransactions: 88219, activeDigitalMembers: 9789,
    newAccounts: 90, closedAccounts: 32, netNewMembers: 58, staffCount: 15, profitPerMember: 621.52,
    costPerTransaction: 1.56, depositGrowthPct: 4.7, loanGrowthPct: 0.9, loanToDepositRatio: 69.9,
    digitalSharePct: 44.1, tellerSharePct: 36.8, mobileAppAdoptionPct: 49.4, mobileDepositAdoptionPct: 33.9,
    billPayAdoptionPct: 20.6, digitalAccountOpens: 38, crossSellRatePct: 4, productsPerMember: 3.21,
    ftePer1000Members: 0.67, transactionsPerFte: 15973, avgWaitTimeMin: 12.6, complaintRatePer1000: 1.47,
    mobileOnlyMembers: 3195, squareFeet: 7200, branchAccountOpens: 52,
    checkingK: 688793, savingsK: 582875, cdsK: 296028, moneyMarketK: 167818,
    autoLoansK: 340163, mortgageK: 437370, personalLoansK: 106734, helocK: 328124,
    atmTransactions: 45723,
  },
  {
    quarter: "2025-Q2", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 16970.7, feeIncomeK: 352.6, operatingCostK: 425.1, branchProfitK: 16898.2,
    totalMembers: 22953, npsScore: 43, digitalAdoptionPct: 47, totalDepositsK: 1908071, totalLoansK: 1388481,
    totalTransactions: 301976, digitalTransactions: 140479, tellerTransactions: 105439, activeDigitalMembers: 10797,
    newAccounts: 74, closedAccounts: 42, netNewMembers: 32, staffCount: 16, profitPerMember: 736.21,
    costPerTransaction: 1.41, depositGrowthPct: 2.7, loanGrowthPct: 3.3, loanToDepositRatio: 72.8,
    digitalSharePct: 46.5, tellerSharePct: 34.9, mobileAppAdoptionPct: 45.9, mobileDepositAdoptionPct: 26.3,
    billPayAdoptionPct: 21.2, digitalAccountOpens: 38, crossSellRatePct: 5.6, productsPerMember: 2.9,
    ftePer1000Members: 0.7, transactionsPerFte: 18873, avgWaitTimeMin: 10.9, complaintRatePer1000: 1.26,
    mobileOnlyMembers: 3944, squareFeet: 7200, branchAccountOpens: 36,
    checkingK: 730254, savingsK: 588110, cdsK: 267096, moneyMarketK: 322611,
    autoLoansK: 447699, mortgageK: 557545, personalLoansK: 138401, helocK: 244835,
    atmTransactions: 56058,
  },
  {
    quarter: "2025-Q3", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 18154.3, feeIncomeK: 378.2, operatingCostK: 373.6, branchProfitK: 18158.8,
    totalMembers: 23361, npsScore: 47, digitalAdoptionPct: 50.4, totalDepositsK: 1852628, totalLoansK: 1431343,
    totalTransactions: 224106, digitalTransactions: 97406, tellerTransactions: 77836, activeDigitalMembers: 11771,
    newAccounts: 109, closedAccounts: 44, netNewMembers: 65, staffCount: 16, profitPerMember: 777.31,
    costPerTransaction: 1.67, depositGrowthPct: 3.2, loanGrowthPct: 0.7, loanToDepositRatio: 77.3,
    digitalSharePct: 43.5, tellerSharePct: 34.7, mobileAppAdoptionPct: 52.4, mobileDepositAdoptionPct: 29.5,
    billPayAdoptionPct: 22, digitalAccountOpens: 55, crossSellRatePct: 3.96, productsPerMember: 2.88,
    ftePer1000Members: 0.68, transactionsPerFte: 14006, avgWaitTimeMin: 12.8, complaintRatePer1000: 1.72,
    mobileOnlyMembers: 4397, squareFeet: 7200, branchAccountOpens: 54,
    checkingK: 729292, savingsK: 561497, cdsK: 275721, moneyMarketK: 286118,
    autoLoansK: 478387, mortgageK: 555388, personalLoansK: 185072, helocK: 212495,
    atmTransactions: 48864,
  },
  {
    quarter: "2025-Q4", branchName: "Houston Galleria", region: "Houston", branchType: "Flagship", yearOpened: 1990,
    interestIncomeK: 15785.8, feeIncomeK: 446.5, operatingCostK: 371.2, branchProfitK: 15861.1,
    totalMembers: 23440, npsScore: 39, digitalAdoptionPct: 52.6, totalDepositsK: 1756508, totalLoansK: 1323903,
    totalTransactions: 201282, digitalTransactions: 98364, tellerTransactions: 67903, activeDigitalMembers: 12324,
    newAccounts: 139, closedAccounts: 60, netNewMembers: 79, staffCount: 16, profitPerMember: 676.67,
    costPerTransaction: 1.84, depositGrowthPct: 4.9, loanGrowthPct: 0.6, loanToDepositRatio: 75.4,
    digitalSharePct: 48.9, tellerSharePct: 33.7, mobileAppAdoptionPct: 51.2, mobileDepositAdoptionPct: 38.2,
    billPayAdoptionPct: 26.8, digitalAccountOpens: 67, crossSellRatePct: 5.47, productsPerMember: 3.29,
    ftePer1000Members: 0.68, transactionsPerFte: 12580, avgWaitTimeMin: 8.5, complaintRatePer1000: 1.56,
    mobileOnlyMembers: 4716, squareFeet: 7200, branchAccountOpens: 72,
    checkingK: 748833, savingsK: 602931, cdsK: 278580, moneyMarketK: 126164,
    autoLoansK: 388511, mortgageK: 496003, personalLoansK: 150243, helocK: 289146,
    atmTransactions: 35015,
  },
];

// ---------------------------------------------------------------------------
// 2025-Q4 snapshot anchors for all branches (non-HG)
// ---------------------------------------------------------------------------
const Q4_SNAPSHOT = {
  "Austin Downtown": { branchProfitK: 22490, totalMembers: 17178, npsScore: 37, digitalAdoptionPct: 51.2, totalDepositsK: 2185766, totalLoansK: 1718316 },
  "Austin Domain": { branchProfitK: 8074.4, totalMembers: 12582, npsScore: 54, digitalAdoptionPct: 68.4, totalDepositsK: 963338, totalLoansK: 696197 },
  "Round Rock": { branchProfitK: 5209.2, totalMembers: 6493, npsScore: 42, digitalAdoptionPct: 66.7, totalDepositsK: 677803, totalLoansK: 448778 },
  "Downtown Dallas": { branchProfitK: 21737.5, totalMembers: 18834, npsScore: 39, digitalAdoptionPct: 51.1, totalDepositsK: 2438382, totalLoansK: 1682446 },
  "Fort Worth Stockyards": { branchProfitK: 11160, totalMembers: 15526, npsScore: 46, digitalAdoptionPct: 52.8, totalDepositsK: 1265682, totalLoansK: 918377 },
  "Plano Legacy": { branchProfitK: 14736.3, totalMembers: 11565, npsScore: 36, digitalAdoptionPct: 53.7, totalDepositsK: 1389316, totalLoansK: 1091971 },
  "Arlington Entertainment": { branchProfitK: 6639.6, totalMembers: 9771, npsScore: 51, digitalAdoptionPct: 51.2, totalDepositsK: 688174, totalLoansK: 515206 },
  "Frisco Stonebriar": { branchProfitK: 9889.2, totalMembers: 11546, npsScore: 46, digitalAdoptionPct: 51.8, totalDepositsK: 1189287, totalLoansK: 856263 },
  "McKinney Town Center": { branchProfitK: 6151.7, totalMembers: 9204, npsScore: 44, digitalAdoptionPct: 67.1, totalDepositsK: 707117, totalLoansK: 537181 },
  "Houston Heights": { branchProfitK: 9625.2, totalMembers: 10946, npsScore: 45, digitalAdoptionPct: 52.7, totalDepositsK: 1033898, totalLoansK: 766581 },
  "The Woodlands": { branchProfitK: 9871, totalMembers: 9222, npsScore: 42, digitalAdoptionPct: 51.2, totalDepositsK: 1237528, totalLoansK: 872318 },
  "Sugar Land": { branchProfitK: 9888, totalMembers: 10657, npsScore: 56, digitalAdoptionPct: 66.8, totalDepositsK: 873685, totalLoansK: 711160 },
  "San Antonio Riverwalk": { branchProfitK: 13106.1, totalMembers: 13696, npsScore: 48, digitalAdoptionPct: 50.9, totalDepositsK: 1434222, totalLoansK: 1113281 },
  "San Antonio Medical Center": { branchProfitK: 7454.5, totalMembers: 6400, npsScore: 43, digitalAdoptionPct: 69.1, totalDepositsK: 748068, totalLoansK: 536360 },
};

// ---------------------------------------------------------------------------
// Branch-type-specific parameters
// ---------------------------------------------------------------------------
const TYPE_PARAMS = {
  Flagship: {
    sqft: [7000, 7500],
    staffBase: [13, 17],
    feeIncomeRatio: [0.022, 0.032],   // fee as fraction of interestIncome
    opCostRatio: [0.018, 0.028],       // opCost as fraction of interestIncome
    txnPerMember: [8.5, 11],           // transactions per member per quarter
    newAcctRate: [0.004, 0.008],       // new accounts as fraction of members
    closedRate: [0.002, 0.004],
    loanToDeposit: [0.68, 0.80],
    productsPerMember: [2.8, 3.4],
  },
  "Full Service": {
    sqft: [4500, 5800],
    staffBase: [9, 14],
    feeIncomeRatio: [0.02, 0.035],
    opCostRatio: [0.02, 0.032],
    txnPerMember: [7.5, 10.5],
    newAcctRate: [0.004, 0.009],
    closedRate: [0.002, 0.005],
    loanToDeposit: [0.68, 0.82],
    productsPerMember: [2.6, 3.3],
  },
  Retail: {
    sqft: [2800, 4200],
    staffBase: [6, 10],
    feeIncomeRatio: [0.025, 0.04],
    opCostRatio: [0.025, 0.04],
    txnPerMember: [7, 10],
    newAcctRate: [0.005, 0.01],
    closedRate: [0.002, 0.005],
    loanToDeposit: [0.66, 0.82],
    productsPerMember: [2.5, 3.2],
  },
};

// ---------------------------------------------------------------------------
// Deposit split ratios (by branch type)
// ---------------------------------------------------------------------------
const DEPOSIT_SPLITS = {
  Flagship:       { checking: [0.38, 0.44], savings: [0.28, 0.36], cds: [0.12, 0.18], moneyMarket: [0.08, 0.14] },
  "Full Service": { checking: [0.36, 0.44], savings: [0.26, 0.34], cds: [0.13, 0.19], moneyMarket: [0.09, 0.16] },
  Retail:         { checking: [0.34, 0.42], savings: [0.26, 0.34], cds: [0.12, 0.18], moneyMarket: [0.10, 0.18] },
};

// Loan split ratios
const LOAN_SPLITS = {
  Flagship:       { auto: [0.25, 0.32], mortgage: [0.34, 0.42], personal: [0.08, 0.14], heloc: [0.16, 0.24] },
  "Full Service": { auto: [0.24, 0.32], mortgage: [0.32, 0.42], personal: [0.09, 0.16], heloc: [0.14, 0.22] },
  Retail:         { auto: [0.26, 0.34], mortgage: [0.28, 0.38], personal: [0.10, 0.18], heloc: [0.12, 0.20] },
};

// ---------------------------------------------------------------------------
// Generate a stable random "personality" for each branch (seeded by name)
// ---------------------------------------------------------------------------
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function branchPersonality(name) {
  const rng2 = mulberry32(hashStr(name));
  return {
    r: () => rng2(),
    pick: (lo, hi) => lo + rng2() * (hi - lo),
  };
}

// ---------------------------------------------------------------------------
// Generate records for a single non-HG branch
// ---------------------------------------------------------------------------
function generateBranch(branchDef) {
  const { name, region, type: bType, yearOpened } = branchDef;
  const snap = Q4_SNAPSHOT[name];
  const tp = TYPE_PARAMS[bType];
  const bp = branchPersonality(name);

  // Fixed per-branch properties
  const squareFeet = ri(bp.pick(tp.sqft[0], tp.sqft[1]) / 100) * 100;
  const baseStaff = ri(bp.pick(tp.staffBase[0], tp.staffBase[1]));
  const baseFeeRatio = bp.pick(tp.feeIncomeRatio[0], tp.feeIncomeRatio[1]);
  const baseOpCostRatio = bp.pick(tp.opCostRatio[0], tp.opCostRatio[1]);
  const baseTxnPerMember = bp.pick(tp.txnPerMember[0], tp.txnPerMember[1]);
  const baseNewAcctRate = bp.pick(tp.newAcctRate[0], tp.newAcctRate[1]);
  const baseClosedRate = bp.pick(tp.closedRate[0], tp.closedRate[1]);
  const baseProductsPerMember = bp.pick(tp.productsPerMember[0], tp.productsPerMember[1]);

  // Deposit/loan splits — fixed per branch
  const ds = DEPOSIT_SPLITS[bType];
  const checkingPct = bp.pick(ds.checking[0], ds.checking[1]);
  const savingsPct = bp.pick(ds.savings[0], ds.savings[1]);
  const cdsPct = bp.pick(ds.cds[0], ds.cds[1]);
  const mmPct = 1 - checkingPct - savingsPct - cdsPct; // remainder

  const ls = LOAN_SPLITS[bType];
  const autoPct = bp.pick(ls.auto[0], ls.auto[1]);
  const mortgagePct = bp.pick(ls.mortgage[0], ls.mortgage[1]);
  const personalPct = bp.pick(ls.personal[0], ls.personal[1]);
  const helocPct = 1 - autoPct - mortgagePct - personalPct;

  // Build Q4 2025 anchor first, then work backward
  // We derive interestIncomeK from branchProfitK ≈ interestIncomeK + feeIncomeK - operatingCostK
  const q4InterestIncome = snap.branchProfitK / (1 + baseFeeRatio - baseOpCostRatio);
  const q4FeeIncome = q4InterestIncome * baseFeeRatio;
  const q4OpCost = q4InterestIncome * baseOpCostRatio;

  // Anchor arrays indexed 0..7  (quarter index)
  const records = [];

  // We generate from Q4 2025 backward. For each step back, we shrink metrics slightly.
  // quarterly growth rates (going forward) — we'll invert when stepping back
  const qoqDepositGrowth = 0.015 + rng() * 0.015;  // 1.5-3% per quarter forward
  const qoqLoanGrowth = 0.012 + rng() * 0.015;
  const qoqMemberGrowth = 0.005 + rng() * 0.01;    // 0.5-1.5%
  const qoqDigitalAdoptionStep = 1.5 + rng() * 2;   // 1.5-3.5 pct pts per quarter
  const qoqInterestGrowth = 0.01 + rng() * 0.02;

  for (let qi = Q4_2025_IDX; qi >= 0; qi--) {
    const q = QUARTERS[qi];
    const stepsBack = Q4_2025_IDX - qi;
    const season = qSeason(q);
    const seasonNorm = season / SEASONAL.Q4; // relative to Q4

    // --- Core metrics with backward decay ---
    const shrinkDeposits = Math.pow(1 + qoqDepositGrowth, -stepsBack);
    const shrinkLoans = Math.pow(1 + qoqLoanGrowth, -stepsBack);
    const shrinkMembers = Math.pow(1 + qoqMemberGrowth, -stepsBack);
    const shrinkInterest = Math.pow(1 + qoqInterestGrowth, -stepsBack);

    // Add some per-quarter noise
    const noise = () => 1 + rand(-0.025, 0.025);

    const totalDepositsK = ri(snap.totalDepositsK * shrinkDeposits * noise());
    const totalLoansK = ri(snap.totalLoansK * shrinkLoans * noise());
    const totalMembers = ri(snap.totalMembers * shrinkMembers * noise());

    const interestIncomeK = r(q4InterestIncome * shrinkInterest * seasonNorm * noise());
    const feeIncomeK = r(interestIncomeK * baseFeeRatio * (1 + rand(-0.08, 0.08)));
    const operatingCostK = r(interestIncomeK * baseOpCostRatio * (1 + rand(-0.06, 0.06)));
    const branchProfitK = r(interestIncomeK + feeIncomeK - operatingCostK);

    // Digital adoption — decreases going back
    const digitalAdoptionPct = r(Math.max(30, snap.digitalAdoptionPct - stepsBack * qoqDigitalAdoptionStep + rand(-1, 1)));

    // NPS — random walk around anchor
    const npsScore = ri(Math.min(60, Math.max(30, snap.npsScore + rand(-6, 6))));

    // Members flow
    const newAccounts = ri(totalMembers * baseNewAcctRate * (1 + rand(-0.15, 0.15)));
    const closedAccounts = ri(totalMembers * baseClosedRate * (1 + rand(-0.15, 0.15)));
    const netNewMembers = newAccounts - closedAccounts;

    // Staff
    const staffCount = ri(Math.max(baseStaff - 1, baseStaff + rand(-1, 1)));

    // Transactions
    const totalTransactions = ri(totalMembers * baseTxnPerMember * seasonNorm * noise());
    const digitalSharePct = r(Math.max(25, digitalAdoptionPct * rand(0.85, 1.0)));
    const tellerSharePct = r(Math.max(20, Math.min(55, 80 - digitalSharePct * 1.1 + rand(-3, 3))));
    const atmSharePct = Math.max(5, r(100 - digitalSharePct - tellerSharePct));

    const digitalTransactions = ri(totalTransactions * digitalSharePct / 100);
    const tellerTransactions = ri(totalTransactions * tellerSharePct / 100);
    const atmTransactions = ri(totalTransactions * atmSharePct / 100);

    // Active digital members
    const activeDigitalMembers = ri(totalMembers * digitalAdoptionPct / 100);

    // Deposit breakdown
    const checkingK = ri(totalDepositsK * checkingPct * noise());
    const savingsK = ri(totalDepositsK * savingsPct * noise());
    const cdsK = ri(totalDepositsK * cdsPct * noise());
    const moneyMarketK = ri(totalDepositsK - checkingK - savingsK - cdsK);

    // Loan breakdown
    const autoLoansK = ri(totalLoansK * autoPct * noise());
    const mortgageK = ri(totalLoansK * mortgagePct * noise());
    const personalLoansK = ri(totalLoansK * personalPct * noise());
    const helocK = ri(totalLoansK - autoLoansK - mortgageK - personalLoansK);

    // Growth rates (quarter-over-quarter, approximate)
    const depositGrowthPct = r(rand(-2, 7));
    const loanGrowthPct = r(rand(-1.5, 5));
    const loanToDepositRatio = r(totalLoansK / totalDepositsK * 100);

    // Derived ratios
    const profitPerMember = r(branchProfitK * 1000 / totalMembers / 1000, 2);
    const costPerTransaction = r(operatingCostK * 1000 / totalTransactions, 2);
    const ftePer1000Members = r(staffCount / totalMembers * 1000, 2);
    const transactionsPerFte = ri(totalTransactions / staffCount);

    // Digital metrics
    const mobileAppAdoptionPct = r(Math.max(28, digitalAdoptionPct * rand(0.8, 1.05)));
    const mobileOnlyMembers = ri(totalMembers * rand(0.08, 0.22));
    const mobileDepositAdoptionPct = r(Math.max(15, digitalAdoptionPct * rand(0.4, 0.7)));
    const billPayAdoptionPct = r(Math.max(12, digitalAdoptionPct * rand(0.3, 0.5)));
    const digitalAccountOpens = ri(newAccounts * rand(0.25, 0.55));

    // Branch account opens
    const branchAccountOpens = ri(newAccounts * rand(0.45, 0.75));

    // Service quality
    const avgWaitTimeMin = r(rand(7, 15));
    const complaintRatePer1000 = r(rand(0.9, 2.2), 2);

    // Cross-sell
    const crossSellRatePct = r(rand(2.5, 6));
    const productsPerMember = r(baseProductsPerMember + rand(-0.3, 0.3), 2);

    records.push({
      quarter: q,
      branchName: name,
      region,
      branchType: bType,
      yearOpened,
      interestIncomeK,
      feeIncomeK,
      operatingCostK,
      branchProfitK,
      profitPerMember,
      costPerTransaction,
      totalMembers,
      newAccounts,
      branchAccountOpens,
      closedAccounts,
      netNewMembers,
      totalDepositsK,
      checkingK,
      savingsK,
      cdsK,
      moneyMarketK,
      depositGrowthPct,
      totalLoansK,
      autoLoansK,
      mortgageK,
      personalLoansK,
      helocK,
      loanGrowthPct,
      loanToDepositRatio,
      totalTransactions,
      tellerTransactions,
      atmTransactions,
      digitalTransactions,
      tellerSharePct,
      digitalSharePct,
      activeDigitalMembers,
      digitalAdoptionPct,
      mobileAppAdoptionPct,
      mobileOnlyMembers,
      mobileDepositAdoptionPct,
      billPayAdoptionPct,
      digitalAccountOpens,
      staffCount,
      ftePer1000Members,
      transactionsPerFte,
      npsScore,
      avgWaitTimeMin,
      complaintRatePer1000,
      squareFeet,
      crossSellRatePct,
      productsPerMember,
    });
  }

  // Now we need to overwrite the Q4 2025 record so the six anchor fields are exact
  const q4Rec = records.find((r) => r.quarter === "2025-Q4");
  q4Rec.branchProfitK = snap.branchProfitK;
  q4Rec.totalMembers = snap.totalMembers;
  q4Rec.npsScore = snap.npsScore;
  q4Rec.digitalAdoptionPct = snap.digitalAdoptionPct;
  q4Rec.totalDepositsK = snap.totalDepositsK;
  q4Rec.totalLoansK = snap.totalLoansK;

  // Recompute dependent metrics for Q4 record
  q4Rec.loanToDepositRatio = r(q4Rec.totalLoansK / q4Rec.totalDepositsK * 100);
  q4Rec.activeDigitalMembers = ri(q4Rec.totalMembers * q4Rec.digitalAdoptionPct / 100);
  q4Rec.profitPerMember = r(q4Rec.branchProfitK * 1000 / q4Rec.totalMembers / 1000, 2);

  // Recalculate deposit breakdown to sum to exact totalDepositsK
  const depTotal = q4Rec.checkingK + q4Rec.savingsK + q4Rec.cdsK + q4Rec.moneyMarketK;
  const depScale = q4Rec.totalDepositsK / depTotal;
  q4Rec.checkingK = ri(q4Rec.checkingK * depScale);
  q4Rec.savingsK = ri(q4Rec.savingsK * depScale);
  q4Rec.cdsK = ri(q4Rec.cdsK * depScale);
  q4Rec.moneyMarketK = q4Rec.totalDepositsK - q4Rec.checkingK - q4Rec.savingsK - q4Rec.cdsK;

  // Recalculate loan breakdown
  const loanTotal = q4Rec.autoLoansK + q4Rec.mortgageK + q4Rec.personalLoansK + q4Rec.helocK;
  const loanScale = q4Rec.totalLoansK / loanTotal;
  q4Rec.autoLoansK = ri(q4Rec.autoLoansK * loanScale);
  q4Rec.mortgageK = ri(q4Rec.mortgageK * loanScale);
  q4Rec.personalLoansK = ri(q4Rec.personalLoansK * loanScale);
  q4Rec.helocK = q4Rec.totalLoansK - q4Rec.autoLoansK - q4Rec.mortgageK - q4Rec.personalLoansK;

  return records;
}

// ---------------------------------------------------------------------------
// Assemble full dataset
// ---------------------------------------------------------------------------
function generateAll() {
  const allRecords = [];

  for (const branch of BRANCHES) {
    if (branch.name === "Houston Galleria") {
      // Use exact real data
      allRecords.push(...HG_REAL);
    } else {
      const recs = generateBranch(branch);
      // Sort chronologically (they were generated backward)
      recs.sort((a, b) => QUARTERS.indexOf(a.quarter) - QUARTERS.indexOf(b.quarter));
      allRecords.push(...recs);
    }
  }

  // Sort: by quarter first, then by branch name
  allRecords.sort((a, b) => {
    const qi = QUARTERS.indexOf(a.quarter) - QUARTERS.indexOf(b.quarter);
    if (qi !== 0) return qi;
    return a.branchName.localeCompare(b.branchName);
  });

  return allRecords;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const data = generateAll();

// Validate
if (data.length !== 120) {
  process.stderr.write(`ERROR: expected 120 records, got ${data.length}\n`);
  process.exit(1);
}

// Validate Houston Galleria Q4 2025
const hgQ4 = data.find((r) => r.branchName === "Houston Galleria" && r.quarter === "2025-Q4");
if (hgQ4.branchProfitK !== 15861.1) {
  process.stderr.write(`ERROR: HG Q4 2025 branchProfitK mismatch: ${hgQ4.branchProfitK}\n`);
  process.exit(1);
}

// Validate all 2025-Q4 snapshot anchors
for (const [name, snap] of Object.entries(Q4_SNAPSHOT)) {
  const rec = data.find((r) => r.branchName === name && r.quarter === "2025-Q4");
  if (!rec) {
    process.stderr.write(`ERROR: missing 2025-Q4 record for ${name}\n`);
    process.exit(1);
  }
  for (const key of ["branchProfitK", "totalMembers", "npsScore", "digitalAdoptionPct", "totalDepositsK", "totalLoansK"]) {
    if (rec[key] !== snap[key]) {
      process.stderr.write(`ERROR: ${name} 2025-Q4 ${key}: expected ${snap[key]}, got ${rec[key]}\n`);
      process.exit(1);
    }
  }
}

process.stderr.write(`Generated ${data.length} records across ${new Set(data.map(r => r.branchName)).size} branches and ${new Set(data.map(r => r.quarter)).size} quarters.\n`);
process.stdout.write(JSON.stringify(data, null, 2) + "\n");

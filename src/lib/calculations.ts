import type { BranchRecord, WhatIfParams } from '@/types';

export const DEFAULT_WHAT_IF: WhatIfParams = {
  interestRateChangePct: 0,
  memberGrowthRatePct: 0,
  operatingCostChangePct: 0,
  digitalAdoptionTargetPct: 50,
  loanGrowthRatePct: 0,
};

export interface ProjectedMetrics {
  interestIncomeK: number;
  feeIncomeK: number;
  operatingCostK: number;
  branchProfitK: number;
  totalMembers: number;
  digitalAdoptionPct: number;
  totalLoansK: number;
}

export function projectMetrics(
  baseline: BranchRecord,
  params: WhatIfParams
): ProjectedMetrics {
  const interestIncomeK = baseline.interestIncomeK * (1 + params.interestRateChangePct / 100);

  const totalMembers = Math.round(baseline.totalMembers * (1 + params.memberGrowthRatePct / 100));

  const memberRatio = totalMembers / baseline.totalMembers;
  const feeIncomeK = baseline.feeIncomeK * memberRatio;

  const digitalAdoptionPct = Math.min(100, Math.max(
    baseline.digitalAdoptionPct,
    params.digitalAdoptionTargetPct
  ));

  const digitalDelta = digitalAdoptionPct - baseline.digitalAdoptionPct;
  const digitalCostReduction = digitalDelta > 0 ? (digitalDelta / 100) * 0.15 : 0;

  const operatingCostK = baseline.operatingCostK
    * (1 + params.operatingCostChangePct / 100)
    * (1 + (params.memberGrowthRatePct / 100) * 0.5)
    * (1 - digitalCostReduction);

  const totalLoansK = baseline.totalLoansK * (1 + params.loanGrowthRatePct / 100);

  const branchProfitK = interestIncomeK + feeIncomeK - operatingCostK;

  return {
    interestIncomeK: +interestIncomeK.toFixed(1),
    feeIncomeK: +feeIncomeK.toFixed(1),
    operatingCostK: +operatingCostK.toFixed(1),
    branchProfitK: +branchProfitK.toFixed(1),
    totalMembers,
    digitalAdoptionPct: +digitalAdoptionPct.toFixed(1),
    totalLoansK: +totalLoansK.toFixed(1),
  };
}

export function calculateSensitivity(
  baseline: BranchRecord,
  params: WhatIfParams
): { parameter: string; impact: number }[] {
  const baseProjection = projectMetrics(baseline, params);

  const sensitivities = [
    {
      parameter: 'Interest Rate',
      impact: projectMetrics(baseline, { ...DEFAULT_WHAT_IF, interestRateChangePct: params.interestRateChangePct }).branchProfitK - projectMetrics(baseline, DEFAULT_WHAT_IF).branchProfitK,
    },
    {
      parameter: 'Member Growth',
      impact: projectMetrics(baseline, { ...DEFAULT_WHAT_IF, memberGrowthRatePct: params.memberGrowthRatePct }).branchProfitK - projectMetrics(baseline, DEFAULT_WHAT_IF).branchProfitK,
    },
    {
      parameter: 'Operating Cost',
      impact: projectMetrics(baseline, { ...DEFAULT_WHAT_IF, operatingCostChangePct: params.operatingCostChangePct }).branchProfitK - projectMetrics(baseline, DEFAULT_WHAT_IF).branchProfitK,
    },
    {
      parameter: 'Digital Adoption',
      impact: projectMetrics(baseline, { ...DEFAULT_WHAT_IF, digitalAdoptionTargetPct: params.digitalAdoptionTargetPct }).branchProfitK - projectMetrics(baseline, DEFAULT_WHAT_IF).branchProfitK,
    },
    {
      parameter: 'Loan Growth',
      impact: baseProjection.branchProfitK - projectMetrics(baseline, { ...params, loanGrowthRatePct: 0 }).branchProfitK,
    },
  ];

  return sensitivities;
}

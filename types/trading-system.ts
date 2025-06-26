export interface Factor {
  id: string
  name: string
  timeframe: string
  weight: number
  isMandatory: boolean
  currentValue: boolean
  individualGrade: number // 0-100 grade for this specific factor
}

export interface FactorGroup {
  id: string
  name: string
  operator: "AND" | "OR"
  factors: Factor[]
  weight: number
}

export interface BonusRule {
  id: string
  name: string
  description: string
  bonusPoints: number
  conditions: {
    factorName: string
    timeframes: string[]
    minimumGrade?: number // Minimum individual grade required
  }[]
  isActive: boolean
}

export interface TradingSystem {
  id: string
  name: string
  description: string
  factorGroups: FactorGroup[]
  bonusRules: BonusRule[]
}

export interface ScoreData {
  baseScore: number
  bonusPoints: number
  totalScore: number
  factorBreakdown: {
    groupId: string
    groupName: string
    groupScore: number
    maxGroupScore: number
    factors: {
      factorId: string
      factorName: string
      contribution: number
      individualGrade: number
    }[]
  }[]
}

export interface AssetConfig {
  asset: string
  fee: number
  increment: number // Minimum position size increment (e.g., 0.01 for BTC, 0.1 for ETH)
  category: string // 'crypto', 'stock', 'forex', 'commodity'
}

export interface TradeEntry {
  id: string
  timestamp: string
  symbol: string
  direction: "LONG" | "SHORT"
  entryPrice: string
  stopLoss: string
  exitPrice: string
  positionSize: string
  notes: string
  scoreData: ScoreData
  systemName: string
  isDraft: boolean
  riskAmount: number
  feeAmount: number
  pnl?: number
  // Store the complete system state when the trade was created
  savedSystemState: {
    factorGroups: FactorGroup[]
    bonusRules: BonusRule[]
  }
  // Store risk analysis data
  riskAnalysis?: {
    recommendedRisk: number
    actualRisk: number
    deviation: number
    toleranceStatus: "within" | "over" | "under"
    riskTolerance: number
  }
}

export interface RiskSettings {
  bGradeMinRisk: number // Minimum risk amount for B grade trades
  portfolioRiskPercent: {
    B: number // 0.5% for B grade
    A: number // 0.8% for A grade
    "A+": number // 1.0% for A+ grade
    "A++": number // 1.5% for A++ grade
    "A+++": number // 2.0% for A+++ grade
    "A++++": number // 2.5% for A++++ grade
  }
  portfolioValue: number
  riskTolerance: number // Percentage tolerance for risk deviation (e.g., 10 for ±10%)
}

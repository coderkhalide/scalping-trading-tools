"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AssetConfig, RiskSettings, ScoreData } from "@/types/trading-system"
import { getLetterGrade } from "@/utils/scoring"

interface RiskCalculatorProps {
  symbol: string
  direction: "LONG" | "SHORT"
  entryPrice: string
  stopLoss: string
  positionSize: string
  assets: AssetConfig[]
  riskSettings: RiskSettings
  scoreData: ScoreData
}

export function RiskCalculator({
  symbol,
  direction,
  entryPrice,
  stopLoss,
  positionSize,
  assets,
  riskSettings,
  scoreData,
}: RiskCalculatorProps) {
  const asset = assets.find((a) => a.asset === symbol)
  const letterGrade = getLetterGrade(scoreData.totalScore)

  const entry = Number.parseFloat(entryPrice) || 0
  const stop = Number.parseFloat(stopLoss) || 0
  const size = Number.parseFloat(positionSize) || 0

  // Calculate current risk
  const calculateRisk = () => {
    if (entry === 0 || stop === 0 || size === 0) return 0
    if (direction === "LONG") {
      return (entry - stop) * size
    } else {
      return (stop - entry) * size
    }
  }

  // Calculate fee
  const calculateFee = () => {
    return asset ? size * asset.fee : 0
  }

  // Calculate total risk (risk + fee)
  const risk = calculateRisk()
  const fee = calculateFee()
  const totalRisk = risk + fee

  // Get recommended risk based on grade
  const getRecommendedRisk = () => {
    const grade = letterGrade.grade
    const percentMap = riskSettings.portfolioRiskPercent

    let riskPercent = 0
    if (grade.includes("A++++")) riskPercent = percentMap["A++++"]
    else if (grade.includes("A+++")) riskPercent = percentMap["A+++"]
    else if (grade.includes("A++")) riskPercent = percentMap["A++"]
    else if (grade.includes("A+")) riskPercent = percentMap["A+"]
    else if (grade === "A") riskPercent = percentMap["A"]
    else if (grade === "B") riskPercent = percentMap["B"]
    else return riskSettings.bGradeMinRisk * 0.5 // Lower risk for poor grades

    return (riskSettings.portfolioValue * riskPercent) / 100
  }

  // Calculate recommended position size
  const getRecommendedPositionSize = () => {
    if (entry === 0 || stop === 0 || !asset) return { size: 0, rounded: 0 }

    const recommendedRisk = getRecommendedRisk()
    const priceRisk = direction === "LONG" ? entry - stop : stop - entry

    if (priceRisk <= 0) return { size: 0, rounded: 0 }

    // Calculate size considering fee
    // totalRisk = (priceRisk * size) + (fee * size)
    // totalRisk = size * (priceRisk + fee)
    // size = totalRisk / (priceRisk + fee)
    const rawSize = recommendedRisk / (priceRisk + asset.fee)

    // Round to asset increment
    const rounded = Math.floor(rawSize / asset.increment) * asset.increment

    return { size: rawSize, rounded: Math.max(rounded, asset.increment) }
  }

  const recommendedRisk = getRecommendedRisk()
  const recommendedSize = getRecommendedPositionSize()
  const recommendedTotalRisk =
    calculateRisk() > 0 && recommendedSize.rounded > 0
      ? (direction === "LONG" ? entry - stop : stop - entry) * recommendedSize.rounded +
        (asset?.fee || 0) * recommendedSize.rounded
      : 0

  // Risk tolerance calculations
  const tolerancePercent = riskSettings.riskTolerance / 100
  const maxAcceptableRisk = recommendedRisk * (1 + tolerancePercent)
  const minAcceptableRisk = recommendedRisk * (1 - tolerancePercent)

  // Risk status with tolerance
  const isOverRisk = totalRisk > maxAcceptableRisk
  const isUnderRisk = totalRisk < minAcceptableRisk && totalRisk > 0
  const isWithinTolerance = totalRisk >= minAcceptableRisk && totalRisk <= maxAcceptableRisk && totalRisk > 0

  // Alternative position sizes within tolerance
  const getAlternativePositionSizes = () => {
    if (entry === 0 || stop === 0 || !asset) return []

    const priceRisk = direction === "LONG" ? entry - stop : stop - entry
    if (priceRisk <= 0) return []

    const alternatives = []

    // Try different position sizes around the recommended size
    for (let multiplier = 0.5; multiplier <= 2; multiplier += 0.1) {
      const testSize = Math.round((recommendedSize.rounded * multiplier) / asset.increment) * asset.increment
      if (testSize <= 0) continue

      const testTotalRisk = priceRisk * testSize + asset.fee * testSize

      if (testTotalRisk >= minAcceptableRisk && testTotalRisk <= maxAcceptableRisk) {
        alternatives.push({
          size: testSize,
          totalRisk: testTotalRisk,
          deviation: ((testTotalRisk - recommendedRisk) / recommendedRisk) * 100,
        })
      }
    }

    // Remove duplicates and sort by deviation
    const unique = alternatives
      .filter((alt, index, self) => index === self.findIndex((a) => a.size === alt.size))
      .sort((a, b) => Math.abs(a.deviation) - Math.abs(b.deviation))

    return unique.slice(0, 3) // Return top 3 alternatives
  }

  const alternativeSizes = getAlternativePositionSizes()

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-sm">Risk Calculator & Position Sizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Risk Display */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-white rounded border">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{risk.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Price Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{fee.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Fee</div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                isOverRisk
                  ? "text-red-600"
                  : isUnderRisk
                    ? "text-yellow-600"
                    : isWithinTolerance
                      ? "text-green-600"
                      : "text-gray-600"
              }`}
            >
              {totalRisk.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Total Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{recommendedRisk.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Target</div>
          </div>
        </div>

        {/* Risk Status with Tolerance */}
        <div className="flex items-center justify-center gap-2">
          {isOverRisk && <Badge variant="destructive">⚠️ Over-risking (+{riskSettings.riskTolerance}%)</Badge>}
          {isUnderRisk && <Badge variant="secondary">📉 Under-risking (-{riskSettings.riskTolerance}%)</Badge>}
          {isWithinTolerance && <Badge variant="default">✅ Within tolerance (±{riskSettings.riskTolerance}%)</Badge>}
          {totalRisk === 0 && <Badge variant="outline">⏳ Enter trade details</Badge>}
        </div>

        {/* Tolerance Range Display */}
        {totalRisk > 0 && (
          <div className="p-2 bg-blue-50 rounded text-xs">
            <div className="flex justify-between items-center">
              <span>Acceptable Range:</span>
              <span className="font-mono">
                {minAcceptableRisk.toFixed(2)} - {maxAcceptableRisk.toFixed(2)}
                <span className="text-muted-foreground ml-1">(±{riskSettings.riskTolerance}%)</span>
              </span>
            </div>
          </div>
        )}

        {/* Position Size Recommendation */}
        {entry > 0 && stop > 0 && asset && (
          <div className="p-3 bg-blue-50 rounded border">
            <div className="text-sm font-medium mb-2">Position Size Recommendation ({letterGrade.grade} Grade)</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Recommended Size</div>
                <div className="font-bold recommended_size">{recommendedSize.rounded.toFixed(asset.increment < 1 ? 2 : 0)}</div>
                <div className="text-xs text-muted-foreground">
                  (Raw: {recommendedSize.size.toFixed(3)}, Increment: {asset.increment})
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Risk @ Recommended</div>
                <div className="font-bold text-green-600">{recommendedTotalRisk.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  Risk: {((direction === "LONG" ? entry - stop : stop - entry) * recommendedSize.rounded).toFixed(2)} +
                  Fee: {((asset?.fee || 0) * recommendedSize.rounded).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alternative Position Sizes Within Tolerance */}
        {alternativeSizes.length > 0 && (
          <div className="p-3 bg-green-50 rounded border">
            <div className="text-sm font-medium mb-2">
              Alternative Sizes (Within ±{riskSettings.riskTolerance}% Tolerance)
            </div>
            <div className="space-y-2">
              {alternativeSizes.map((alt, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="font-mono">Size: {alt.size.toFixed(asset!.increment < 1 ? 2 : 0)}</span>
                  <span className="font-mono">Risk: {alt.totalRisk.toFixed(2)}</span>
                  <span className={`font-mono ${Math.abs(alt.deviation) < 5 ? "text-green-600" : "text-blue-600"}`}>
                    {alt.deviation > 0 ? "+" : ""}
                    {alt.deviation.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade-based Risk Allocation */}
        <div className="text-xs space-y-1">
          <div className="font-medium">Risk Allocation by Grade:</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div>
              B: {riskSettings.portfolioRiskPercent.B}% ($
              {((riskSettings.portfolioValue * riskSettings.portfolioRiskPercent.B) / 100).toFixed(0)})
            </div>
            <div>
              A: {riskSettings.portfolioRiskPercent.A}% ($
              {((riskSettings.portfolioValue * riskSettings.portfolioRiskPercent.A) / 100).toFixed(0)})
            </div>
            <div>
              A+: {riskSettings.portfolioRiskPercent["A+"]}% ($
              {((riskSettings.portfolioValue * riskSettings.portfolioRiskPercent["A+"]) / 100).toFixed(0)})
            </div>
            <div>
              A++: {riskSettings.portfolioRiskPercent["A++"]}% ($
              {((riskSettings.portfolioValue * riskSettings.portfolioRiskPercent["A++"]) / 100).toFixed(0)})
            </div>
            <div>
              A+++: {riskSettings.portfolioRiskPercent["A+++"]}% ($
              {((riskSettings.portfolioValue * riskSettings.portfolioRiskPercent["A+++"]) / 100).toFixed(0)})
            </div>
            <div>
              A++++: {riskSettings.portfolioRiskPercent["A++++"]}% ($
              {((riskSettings.portfolioValue * riskSettings.portfolioRiskPercent["A++++"]) / 100).toFixed(0)})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

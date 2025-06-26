"use client"

import { Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScoreData } from "@/types/trading-system"
import { getLetterGrade } from "@/utils/scoring"

interface ScoreDisplayProps {
  scoreData: ScoreData
}

export function ScoreDisplay({ scoreData }: ScoreDisplayProps) {
  const letterGrade = getLetterGrade(scoreData.totalScore)

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calculator className="h-5 w-5" />
          Position Score & Grade
        </CardTitle>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary">
              {scoreData.totalScore}
              <span className="text-2xl text-muted-foreground">/100+</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Base: {scoreData.baseScore} + Bonus: {scoreData.bonusPoints}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${letterGrade.color}`}>{letterGrade.grade}</div>
            <div className="text-sm text-muted-foreground">Letter Grade</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              scoreData.totalScore >= 110
                ? "bg-purple-500"
                : scoreData.totalScore >= 95
                  ? "bg-green-500"
                  : scoreData.totalScore >= 80
                    ? "bg-green-400"
                    : scoreData.totalScore >= 60
                      ? "bg-yellow-500"
                      : scoreData.totalScore >= 40
                        ? "bg-orange-500"
                        : "bg-red-500"
            }`}
            style={{ width: `${Math.min(scoreData.totalScore, 100)}%` }}
          />
          {scoreData.totalScore > 100 && (
            <div className="text-xs text-center mt-1 text-purple-600 font-semibold">
              🚀 PREMIUM SETUP - Consider Larger Position Size!
            </div>
          )}
        </div>
      </CardHeader>

      {/* Score Breakdown */}
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Score Breakdown:</h4>
          {scoreData.factorBreakdown.map((group) => (
            <div key={group.groupId} className="text-xs space-y-1">
              <div className="font-medium">
                {group.groupName}: {group.groupScore.toFixed(1)}/{group.maxGroupScore}
              </div>
              <div className="ml-4 space-y-1">
                {group.factors.map((factor) => (
                  <div key={factor.factorId} className="flex justify-between">
                    <span>{factor.factorName}:</span>
                    <span>
                      {factor.individualGrade}% → {factor.contribution.toFixed(1)} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

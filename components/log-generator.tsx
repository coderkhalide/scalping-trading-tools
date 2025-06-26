"use client"

import { useState } from "react"
import { Copy, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { TradingSystem, ScoreData } from "@/types/trading-system"
import { getLetterGrade } from "@/utils/scoring"

interface LogGeneratorProps {
  system: TradingSystem
  scoreData: ScoreData
  tradeDetails: {
    symbol: string
    direction: "LONG" | "SHORT"
    entryPrice: string
    stopLoss: string
    exitPrice: string
    positionSize: string
    notes: string
  }
  riskAnalysis: {
    recommendedRisk: number
    actualRisk: number
    deviation: number
    toleranceStatus: "within" | "over" | "under"
    riskTolerance: number
  }
  risk: number
  fee: number
  pnl: number
}

export function LogGenerator({ system, scoreData, tradeDetails, riskAnalysis, risk, fee, pnl }: LogGeneratorProps) {
  const [logFormat, setLogFormat] = useState<"excel" | "detailed" | "csv">("excel")
  const [generatedLog, setGeneratedLog] = useState("")

  const letterGrade = getLetterGrade(scoreData.totalScore)

  const generateTradeLog = () => {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()

    if (logFormat === "excel") {
      const headers = [
        "Date",
        "Time",
        "System",
        "Symbol",
        "Direction",
        "Entry Price",
        "Stop Loss",
        "Exit Price",
        "Position Size",
        "Risk Amount",
        "Fee",
        "P&L",
        "Total Score",
        "Letter Grade",
        "Base Score",
        "Bonus Points",
        "Recommended Risk",
        "Actual Risk",
        "Deviation %",
        "Risk Status",
        "Tolerance %",
        "Factor Details",
        "Bonus Rules Triggered",
        "Notes",
      ]

      const factorDetails = scoreData.factorBreakdown
        .map((group) => {
          const factors = group.factors.map((f) => `${f.factorName}:${f.individualGrade}%`).join("; ")
          return `${group.groupName}(${factors})`
        })
        .join(" | ")

      const bonusRules = system.bonusRules
        .filter((rule) => rule.isActive)
        .map((rule) => {
          const allFactors = system.factorGroups.flatMap((g) => g.factors)
          let triggered = true
          for (const condition of rule.conditions) {
            const matchingFactors = allFactors.filter((f) => f.name === condition.factorName)
            const minimumGrade = condition.minimumGrade || 75
            const qualifyingTimeframes = matchingFactors
              .filter((f) => f.individualGrade >= minimumGrade)
              .map((f) => f.timeframe)
            const hasAllTimeframes = condition.timeframes.every((tf) => qualifyingTimeframes.includes(tf))
            if (!hasAllTimeframes) {
              triggered = false
              break
            }
          }
          return triggered ? `${rule.name}(+${rule.bonusPoints})` : null
        })
        .filter(Boolean)
        .join("; ")

      const values = [
        date,
        time,
        system.name,
        tradeDetails.symbol,
        tradeDetails.direction,
        tradeDetails.entryPrice,
        tradeDetails.stopLoss,
        tradeDetails.exitPrice || "",
        tradeDetails.positionSize,
        risk.toFixed(2),
        fee.toFixed(2),
        pnl !== 0 ? pnl.toFixed(2) : "",
        scoreData.totalScore.toString(),
        letterGrade.grade,
        scoreData.baseScore.toString(),
        scoreData.bonusPoints.toString(),
        riskAnalysis.recommendedRisk.toFixed(2),
        riskAnalysis.actualRisk.toFixed(2),
        riskAnalysis.deviation.toFixed(1),
        riskAnalysis.toleranceStatus,
        riskAnalysis.riskTolerance.toString(),
        factorDetails,
        bonusRules || "None",
        tradeDetails.notes,
      ]

      return `${headers.join("\t")}\n${values.join("\t")}`
    }

    return "Other formats coming soon..."
  }

  const handleGenerateLog = () => {
    const log = generateTradeLog()
    setGeneratedLog(log)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLog)
      alert("Trade log copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy: ", err)
      alert("Failed to copy to clipboard")
    }
  }

  return (
    <div className="pt-4 border-t space-y-4">
      <div className="flex items-center gap-4">
        <Label className="text-sm">Export Format:</Label>
        <Select value={logFormat} onValueChange={(value: "excel" | "detailed" | "csv") => setLogFormat(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excel">Excel (Tab-separated)</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="detailed">Detailed Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerateLog} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Generate Current Trade Log
        </Button>
        {generatedLog && (
          <Button onClick={handleCopyToClipboard} size="sm" variant="outline">
            <Copy className="h-4 w-4 mr-1" />
            Copy to Clipboard
          </Button>
        )}
      </div>

      {generatedLog && (
        <Textarea
          value={generatedLog}
          readOnly
          className="min-h-[100px] font-mono text-xs"
          placeholder="Generated log will appear here..."
        />
      )}
    </div>
  )
}

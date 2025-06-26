"use client"

import { useState, useEffect } from "react"
import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TradingSystem, ScoreData, AssetConfig, TradeEntry, RiskSettings } from "@/types/trading-system"
import { getLetterGrade } from "@/utils/scoring"
import { AssetManager } from "./asset-manager"
import { TradeForm } from "./trade-form"
import { RiskCalculator } from "./risk-calculator"
import { TradeHistory } from "./trade-history"
import { PnLCalculator } from "./pnl-calculator"
import { TradeActions } from "./trade-actions"
import { LogGenerator } from "./log-generator"
import { RiskSettingsDialog } from "./risk-settings-dialog"

interface TradeLoggerProps {
  system: TradingSystem
  scoreData: ScoreData
  onRestoreSystemState?: (factorGroups: any[], bonusRules: any[]) => void
}

export function TradeLogger({ system, scoreData, onRestoreSystemState }: TradeLoggerProps) {
  const [tradeDetails, setTradeDetails] = useState({
    symbol: "",
    direction: "LONG" as "LONG" | "SHORT",
    entryPrice: "",
    stopLoss: "",
    exitPrice: "",
    positionSize: "",
    notes: "",
  })

  const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null)

  // Asset configuration
  const [assets, setAssets] = useState<AssetConfig[]>([
    { asset: "BTC", fee: 16, increment: 0.01, category: "crypto" },
    { asset: "ETH", fee: 1.3, increment: 0.1, category: "crypto" },
    { asset: "Gold", fee: 11, increment: 0.01, category: "commodity" },
    { asset: "AAPL", fee: 0.005, increment: 1, category: "stock" },
    { asset: "EURUSD", fee: 0.00001, increment: 0.01, category: "forex" },
  ])

  // Risk settings
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    bGradeMinRisk: 50,
    portfolioRiskPercent: {
      B: 0.5,
      A: 0.8,
      "A+": 1.0,
      "A++": 1.5,
      "A+++": 2.0,
      "A++++": 2.5,
    },
    portfolioValue: 10000,
    riskTolerance: 10,
  })

  // Trade history
  const [tradeHistory, setTradeHistory] = useState<TradeEntry[]>([])

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedAssets = localStorage.getItem("tradingGraderAssets")
      if (savedAssets) setAssets(JSON.parse(savedAssets))

      const savedRiskSettings = localStorage.getItem("tradingGraderRiskSettings")
      if (savedRiskSettings) setRiskSettings(JSON.parse(savedRiskSettings))

      const savedTrades = localStorage.getItem("tradingGraderTrades")
      if (savedTrades) setTradeHistory(JSON.parse(savedTrades))
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("tradingGraderAssets", JSON.stringify(assets))
  }, [assets])

  useEffect(() => {
    localStorage.setItem("tradingGraderRiskSettings", JSON.stringify(riskSettings))
  }, [riskSettings])

  useEffect(() => {
    localStorage.setItem("tradingGraderTrades", JSON.stringify(tradeHistory))
  }, [tradeHistory])

  const letterGrade = getLetterGrade(scoreData.totalScore)

  const calculateRisk = () => {
    const entry = Number.parseFloat(tradeDetails.entryPrice) || 0
    const stop = Number.parseFloat(tradeDetails.stopLoss) || 0
    const size = Number.parseFloat(tradeDetails.positionSize) || 0

    if (entry === 0 || stop === 0 || size === 0) return 0

    if (tradeDetails.direction === "LONG") {
      return (entry - stop) * size
    } else {
      return (stop - entry) * size
    }
  }

  const calculateFee = () => {
    const size = Number.parseFloat(tradeDetails.positionSize) || 0
    const asset = assets.find((a) => a.asset === tradeDetails.symbol)
    return asset ? size * asset.fee : 0
  }

  const calculatePnL = () => {
    const entry = Number.parseFloat(tradeDetails.entryPrice) || 0
    const exit = Number.parseFloat(tradeDetails.exitPrice) || 0
    const size = Number.parseFloat(tradeDetails.positionSize) || 0

    if (entry === 0 || exit === 0 || size === 0) return 0

    if (tradeDetails.direction === "LONG") {
      return (exit - entry) * size
    } else {
      return (entry - exit) * size
    }
  }

  // Calculate risk analysis for saving
  const calculateRiskAnalysis = () => {
    const grade = letterGrade.grade
    const percentMap = riskSettings.portfolioRiskPercent

    let riskPercent = 0
    if (grade.includes("A++++")) riskPercent = percentMap["A++++"]
    else if (grade.includes("A+++")) riskPercent = percentMap["A+++"]
    else if (grade.includes("A++")) riskPercent = percentMap["A++"]
    else if (grade.includes("A+")) riskPercent = percentMap["A+"]
    else if (grade === "A") riskPercent = percentMap["A"]
    else if (grade === "B") riskPercent = percentMap["B"]
    else riskPercent = 0.25

    const recommendedRisk = (riskSettings.portfolioValue * riskPercent) / 100
    const actualRisk = calculateRisk() + calculateFee()
    const deviation = recommendedRisk > 0 ? ((actualRisk - recommendedRisk) / recommendedRisk) * 100 : 0

    const tolerancePercent = riskSettings.riskTolerance / 100
    const maxAcceptableRisk = recommendedRisk * (1 + tolerancePercent)
    const minAcceptableRisk = recommendedRisk * (1 - tolerancePercent)

    let toleranceStatus: "within" | "over" | "under" = "within"
    if (actualRisk > maxAcceptableRisk) toleranceStatus = "over"
    else if (actualRisk < minAcceptableRisk && actualRisk > 0) toleranceStatus = "under"

    return {
      recommendedRisk,
      actualRisk,
      deviation,
      toleranceStatus,
      riskTolerance: riskSettings.riskTolerance,
    }
  }

  const saveTrade = (isDraft = false) => {
    if (scoreData.totalScore === 0) {
      alert("Cannot save trade with 0 score. Please configure your factors first.")
      return
    }

    const risk = calculateRisk()
    const fee = calculateFee()
    const pnl = calculatePnL()
    const riskAnalysis = calculateRiskAnalysis()

    const trade: TradeEntry = {
      id: editingTrade?.id || Date.now().toString(),
      timestamp: editingTrade?.timestamp || new Date().toISOString(),
      symbol: tradeDetails.symbol,
      direction: tradeDetails.direction,
      entryPrice: tradeDetails.entryPrice,
      stopLoss: tradeDetails.stopLoss,
      exitPrice: tradeDetails.exitPrice,
      positionSize: tradeDetails.positionSize,
      notes: tradeDetails.notes,
      scoreData: { ...scoreData },
      systemName: system.name,
      isDraft,
      riskAmount: risk,
      feeAmount: fee,
      pnl: tradeDetails.exitPrice ? pnl : undefined,
      savedSystemState: {
        factorGroups: JSON.parse(JSON.stringify(system.factorGroups)),
        bonusRules: JSON.parse(JSON.stringify(system.bonusRules)),
      },
      riskAnalysis,
    }

    if (editingTrade) {
      setTradeHistory((prev) => prev.map((t) => (t.id === editingTrade.id ? trade : t)))
      setEditingTrade(null)
    } else {
      setTradeHistory((prev) => [...prev, trade])
    }

    // Clear form if not editing
    if (!editingTrade) {
      setTradeDetails({
        symbol: tradeDetails.symbol,
        direction: tradeDetails.direction,
        entryPrice: "",
        stopLoss: "",
        exitPrice: "",
        positionSize: "",
        notes: "",
      })
    }
  }

  const editTrade = (trade: TradeEntry) => {
    setEditingTrade(trade)
    setTradeDetails({
      symbol: trade.symbol,
      direction: trade.direction,
      entryPrice: trade.entryPrice,
      stopLoss: trade.stopLoss,
      exitPrice: trade.exitPrice,
      positionSize: trade.positionSize,
      notes: trade.notes,
    })

    // Restore the saved system state (factor grades)
    if (trade.savedSystemState && onRestoreSystemState) {
      onRestoreSystemState(trade.savedSystemState.factorGroups, trade.savedSystemState.bonusRules)
    }
  }

  const restoreCurrentSystemState = () => {
    if (editingTrade && onRestoreSystemState) {
      onRestoreSystemState(system.factorGroups, system.bonusRules)
      setEditingTrade(null)
      setTradeDetails({
        symbol: "",
        direction: "LONG",
        entryPrice: "",
        stopLoss: "",
        exitPrice: "",
        positionSize: "",
        notes: "",
      })
    }
  }

  const deleteTrade = (tradeId: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      setTradeHistory((prev) => prev.filter((t) => t.id !== tradeId))
    }
  }

  const exportAllTrades = () => {
    const csvContent = tradeHistory
      .map((trade) => {
        const letterGrade = getLetterGrade(trade.scoreData.totalScore)
        const riskAnalysis = trade.riskAnalysis

        // Calculate R multiples for export
        const entry = Number.parseFloat(trade.entryPrice) || 0
        const exit = Number.parseFloat(trade.exitPrice) || 0
        const size = Number.parseFloat(trade.positionSize) || 0
        const grossPnL = trade.direction === "LONG" ? (exit - entry) * size : (entry - exit) * size
        const grossR = trade.riskAmount > 0 ? grossPnL / trade.riskAmount : 0
        const netR = trade.riskAmount > 0 ? (grossPnL - trade.feeAmount) / trade.riskAmount : 0
        const feeR = trade.riskAmount > 0 ? trade.feeAmount / trade.riskAmount : 0

        return [
          new Date(trade.timestamp).toLocaleDateString(),
          new Date(trade.timestamp).toLocaleTimeString(),
          trade.systemName,
          trade.symbol,
          trade.direction,
          trade.entryPrice,
          trade.stopLoss,
          trade.exitPrice || "",
          trade.positionSize,
          trade.riskAmount.toFixed(2),
          trade.feeAmount.toFixed(2),
          trade.pnl?.toFixed(2) || "",
          grossR.toFixed(2),
          netR.toFixed(2),
          feeR.toFixed(2),
          trade.scoreData.totalScore.toString(),
          letterGrade.grade,
          trade.scoreData.baseScore.toString(),
          trade.scoreData.bonusPoints.toString(),
          riskAnalysis?.recommendedRisk.toFixed(2) || "",
          riskAnalysis?.actualRisk.toFixed(2) || "",
          riskAnalysis?.deviation.toFixed(1) || "",
          riskAnalysis?.toleranceStatus || "",
          riskAnalysis?.riskTolerance?.toString() || "",
          trade.isDraft ? "DRAFT" : "COMPLETED",
          `"${trade.notes}"`,
        ].join(",")
      })
      .join("\n")

    const headers = [
      "Date",
      "Time",
      "System",
      "Symbol",
      "Direction",
      "Entry_Price",
      "Stop_Loss",
      "Exit_Price",
      "Position_Size",
      "Risk_Amount",
      "Fee",
      "PnL",
      "Gross_R",
      "Net_R",
      "Fee_R",
      "Total_Score",
      "Letter_Grade",
      "Base_Score",
      "Bonus_Points",
      "Recommended_Risk",
      "Actual_Risk",
      "Deviation_%",
      "Risk_Status",
      "Tolerance_%",
      "Status",
      "Notes",
    ].join(",")

    const fullCsv = `${headers}\n${csvContent}`

    const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `all-trades-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate current values for components
  const risk = calculateRisk()
  const fee = calculateFee()
  const pnl = calculatePnL()
  const riskAnalysis = calculateRiskAnalysis()

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Trade Logger
              {editingTrade && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Editing Draft</Badge>
                  <span className="text-xs text-orange-600">
                    (Factor grades restored from {new Date(editingTrade.timestamp).toLocaleDateString()})
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <AssetManager assets={assets} onUpdateAssets={setAssets} />
              <RiskSettingsDialog
                riskSettings={riskSettings}
                onUpdateRiskSettings={(updates) => setRiskSettings((prev) => ({ ...prev, ...updates }))}
              />
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick trade logging with risk management and position sizing recommendations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <TradeForm
            tradeDetails={tradeDetails}
            onUpdateTrade={(updates) => setTradeDetails((prev) => ({ ...prev, ...updates }))}
            assets={assets}
          />

          {/* P&L Calculator - Shows when entry and position size are entered */}
          {tradeDetails.entryPrice && tradeDetails.positionSize && (
            <PnLCalculator
              direction={tradeDetails.direction}
              entryPrice={tradeDetails.entryPrice}
              exitPrice={tradeDetails.exitPrice}
              positionSize={tradeDetails.positionSize}
              feeAmount={fee}
              riskAmount={risk}
            />
          )}

          <RiskCalculator
            symbol={tradeDetails.symbol}
            direction={tradeDetails.direction}
            entryPrice={tradeDetails.entryPrice}
            stopLoss={tradeDetails.stopLoss}
            positionSize={tradeDetails.positionSize}
            assets={assets}
            riskSettings={riskSettings}
            scoreData={scoreData}
          />

          <TradeActions
            onSaveComplete={() => saveTrade(false)}
            onSaveDraft={() => saveTrade(true)}
            onCancelEdit={restoreCurrentSystemState}
            editingTrade={editingTrade}
            scoreData={scoreData}
          />

          <LogGenerator
            system={system}
            scoreData={scoreData}
            tradeDetails={tradeDetails}
            riskAnalysis={riskAnalysis}
            risk={risk}
            fee={fee}
            pnl={pnl}
          />
        </CardContent>
      </Card>

      <TradeHistory
        trades={tradeHistory}
        onDeleteTrade={deleteTrade}
        onEditTrade={editTrade}
        onExportTrades={exportAllTrades}
      />
    </div>
  )
}

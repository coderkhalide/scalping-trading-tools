"use client"

import { useState } from "react"
import { History, Trash2, Edit, Download, TrendingUp, TrendingDown, Copy, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { TradeEntry } from "@/types/trading-system"
import { getLetterGrade, getFactorGradeLabel } from "@/utils/scoring"

interface TradeHistoryProps {
  trades: TradeEntry[]
  onDeleteTrade: (tradeId: string) => void
  onEditTrade: (trade: TradeEntry) => void
  onExportTrades: () => void
}

export function TradeHistory({ trades, onDeleteTrade, onEditTrade, onExportTrades }: TradeHistoryProps) {
  const [selectedTrade, setSelectedTrade] = useState<TradeEntry | null>(null)
  const [copiedBreakeven, setCopiedBreakeven] = useState<string | null>(null)

  const completedTrades = trades.filter((t) => !t.isDraft)
  const draftTrades = trades.filter((t) => t.isDraft)

  const formatDate = (timestamp: string) => {
    return (
      new Date(timestamp).toLocaleDateString() +
      " " +
      new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    )
  }

  const calculateRMultiples = (trade: TradeEntry) => {
    const entry = Number.parseFloat(trade.entryPrice) || 0
    const exit = Number.parseFloat(trade.exitPrice) || 0
    const size = Number.parseFloat(trade.positionSize) || 0

    if (entry === 0 || size === 0) return { grossR: 0, netR: 0, feeR: 0, breakevenPrice: 0 }

    const grossPnL = trade.direction === "LONG" ? (exit - entry) * size : (entry - exit) * size
    const netPnL = grossPnL - trade.feeAmount

    // Use total planned risk (price risk + fee) as 1R
    const totalPlannedRisk = trade.riskAmount + trade.feeAmount
    const grossR = totalPlannedRisk > 0 ? grossPnL / totalPlannedRisk : 0
    const netR = totalPlannedRisk > 0 ? netPnL / totalPlannedRisk : 0
    const feeR = totalPlannedRisk > 0 ? trade.feeAmount / totalPlannedRisk : 0

    const feePerUnit = size > 0 ? trade.feeAmount / size : 0
    const breakevenPrice = trade.direction === "LONG" ? entry + feePerUnit : entry - feePerUnit

    return { grossR, netR, feeR, breakevenPrice }
  }

  const copyBreakeven = async (price: number, tradeId: string) => {
    try {
      const entry = Number.parseFloat(selectedTrade?.entryPrice || "0")
      const formattedPrice = price.toFixed(entry < 1 ? 6 : 2)
      await navigator.clipboard.writeText(formattedPrice)
      setCopiedBreakeven(tradeId)
      setTimeout(() => setCopiedBreakeven(null), 1000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-green-500" />
            Trade History
            <Badge variant="outline">{completedTrades.length} completed</Badge>
            {draftTrades.length > 0 && <Badge variant="secondary">{draftTrades.length} drafts</Badge>}
          </div>
          <Button onClick={onExportTrades} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Draft Trades */}
        {draftTrades.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-600 mb-2">Draft Trades (Incomplete)</h4>
            <div className="space-y-2">
              {draftTrades.map((trade) => {
                const letterGrade = getLetterGrade(trade.scoreData.totalScore)
                const { feeR, breakevenPrice } = calculateRMultiples(trade)
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">DRAFT</Badge>
                      <span className="font-mono text-sm">{trade.symbol}</span>
                      <span className="text-sm">{trade.direction}</span>
                      <span className={`font-bold ${letterGrade.color}`}>{letterGrade.grade}</span>
                      <span className="text-xs text-red-600">Fee: -{feeR.toFixed(2)}R</span>
                      <span className="text-xs text-muted-foreground">BE: {breakevenPrice.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(trade.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onEditTrade(trade)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteTrade(trade.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Trades */}
        <div>
          <h4 className="text-sm font-medium mb-2">Completed Trades</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {completedTrades.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No completed trades yet</div>
            ) : (
              completedTrades.map((trade) => {
                const letterGrade = getLetterGrade(trade.scoreData.totalScore)
                const pnl = trade.pnl || 0
                const { grossR, netR, feeR } = calculateRMultiples(trade)
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-2 bg-white border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{trade.symbol}</span>
                      <span className="text-sm">{trade.direction}</span>
                      <span className={`font-bold ${letterGrade.color}`}>{letterGrade.grade}</span>
                      <span className="text-sm">Size: {trade.positionSize}</span>
                      <div className="flex items-center gap-1">
                        {pnl > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : pnl < 0 ? (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null}
                        <span
                          className={`text-sm font-medium ${pnl > 0 ? "text-green-600" : pnl < 0 ? "text-red-600" : "text-gray-600"}`}
                        >
                          {pnl > 0 ? "+" : ""}
                          {pnl.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant={netR >= 0 ? "default" : "destructive"} className="text-xs font-mono">
                        {netR > 0 ? "+" : ""}
                        {netR.toFixed(1)}R
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(trade.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTrade(trade)}>
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Trade Details - {trade.symbol}</DialogTitle>
                          </DialogHeader>
                          {selectedTrade && (
                            <div className="space-y-6">
                              {/* Trade Summary */}
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <h3 className="font-semibold">Trade Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div>
                                      <strong>Symbol:</strong> {selectedTrade.symbol}
                                    </div>
                                    <div>
                                      <strong>Direction:</strong> {selectedTrade.direction}
                                    </div>
                                    <div>
                                      <strong>Entry:</strong> {selectedTrade.entryPrice}
                                    </div>
                                    <div>
                                      <strong>Stop Loss:</strong> {selectedTrade.stopLoss}
                                    </div>
                                    <div>
                                      <strong>Exit:</strong> {selectedTrade.exitPrice || "Not filled"}
                                    </div>
                                    <div>
                                      <strong>Position Size:</strong> {selectedTrade.positionSize}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <strong>Breakeven:</strong>
                                      <span className="font-mono">
                                        {calculateRMultiples(selectedTrade).breakevenPrice.toFixed(2)}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0"
                                        onClick={() =>
                                          copyBreakeven(
                                            calculateRMultiples(selectedTrade).breakevenPrice,
                                            selectedTrade.id,
                                          )
                                        }
                                      >
                                        {copiedBreakeven === selectedTrade.id ? (
                                          <ClipboardCheck className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-gray-500" />
                                        )}
                                      </Button>
                                    </div>
                                    <div>
                                      <strong>Date:</strong> {formatDate(selectedTrade.timestamp)}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="font-semibold">Performance</h3>
                                  <div className="space-y-1 text-sm">
                                    <div>
                                      <strong>Score:</strong> {selectedTrade.scoreData.totalScore} (
                                      {getLetterGrade(selectedTrade.scoreData.totalScore).grade})
                                    </div>
                                    <div>
                                      <strong>Base Score:</strong> {selectedTrade.scoreData.baseScore}
                                    </div>
                                    <div>
                                      <strong>Bonus Points:</strong> {selectedTrade.scoreData.bonusPoints}
                                    </div>
                                    <div>
                                      <strong>Risk:</strong> {selectedTrade.riskAmount.toFixed(2)}
                                    </div>
                                    <div>
                                      <strong>Fee:</strong> {selectedTrade.feeAmount.toFixed(2)} (-
                                      {calculateRMultiples(selectedTrade).feeR.toFixed(2)}R)
                                    </div>
                                    <div
                                      className={`${selectedTrade.pnl && selectedTrade.pnl > 0 ? "text-green-600" : selectedTrade.pnl && selectedTrade.pnl < 0 ? "text-red-600" : ""}`}
                                    >
                                      <strong>P&L:</strong>{" "}
                                      {selectedTrade.pnl
                                        ? (selectedTrade.pnl > 0 ? "+" : "") + selectedTrade.pnl.toFixed(2)
                                        : "Pending"}
                                    </div>
                                    {selectedTrade.pnl !== undefined && (
                                      <>
                                        <div className="text-green-600">
                                          <strong>Gross R:</strong> +
                                          {calculateRMultiples(selectedTrade).grossR.toFixed(2)}R
                                        </div>
                                        <div
                                          className={`${calculateRMultiples(selectedTrade).netR >= 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                          <strong>Net R:</strong>{" "}
                                          {calculateRMultiples(selectedTrade).netR > 0 ? "+" : ""}
                                          {calculateRMultiples(selectedTrade).netR.toFixed(2)}R
                                        </div>
                                      </>
                                    )}
                                    <div>
                                      <strong>System:</strong> {selectedTrade.systemName}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Risk Analysis */}
                              {selectedTrade.riskAnalysis && (
                                <div className="space-y-2">
                                  <h3 className="font-semibold">Risk Analysis</h3>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <strong>Recommended Risk:</strong>{" "}
                                      {selectedTrade.riskAnalysis.recommendedRisk.toFixed(2)}
                                    </div>
                                    <div>
                                      <strong>Actual Risk:</strong> {selectedTrade.riskAnalysis.actualRisk.toFixed(2)}
                                    </div>
                                    <div>
                                      <strong>Deviation:</strong>
                                      <span
                                        className={`ml-1 ${selectedTrade.riskAnalysis.deviation > 0 ? "text-red-600" : selectedTrade.riskAnalysis.deviation < 0 ? "text-blue-600" : "text-green-600"}`}
                                      >
                                        {selectedTrade.riskAnalysis.deviation > 0 ? "+" : ""}
                                        {selectedTrade.riskAnalysis.deviation.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      selectedTrade.riskAnalysis.toleranceStatus === "within"
                                        ? "default"
                                        : selectedTrade.riskAnalysis.toleranceStatus === "over"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {selectedTrade.riskAnalysis.toleranceStatus === "within"
                                      ? "✅ Within Tolerance"
                                      : selectedTrade.riskAnalysis.toleranceStatus === "over"
                                        ? "⚠️ Over Risk"
                                        : "📉 Under Risk"}
                                  </Badge>
                                </div>
                              )}

                              {/* Factor Grades */}
                              <div className="space-y-2">
                                <h3 className="font-semibold">Factor Grades (At Time of Trade)</h3>
                                <div className="space-y-3">
                                  {selectedTrade.savedSystemState.factorGroups.map((group) => (
                                    <div key={group.id} className="border rounded p-3 bg-gray-50">
                                      <div className="font-medium text-sm mb-2">
                                        {group.name} ({group.operator}) - Weight: {group.weight}%
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {group.factors.map((factor) => {
                                          const gradeLabel = getFactorGradeLabel(factor.individualGrade)
                                          return (
                                            <div
                                              key={factor.id}
                                              className="flex items-center justify-between text-xs p-2 bg-white rounded"
                                            >
                                              <div>
                                                <span className="font-medium">{factor.name}</span>
                                                <span className="text-muted-foreground ml-1">({factor.timeframe})</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className={`font-bold ${gradeLabel.color}`}>
                                                  {factor.individualGrade}%
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                  {gradeLabel.label}
                                                </Badge>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Notes */}
                              {selectedTrade.notes && (
                                <div className="space-y-2">
                                  <h3 className="font-semibold">Notes</h3>
                                  <div className="text-sm bg-gray-50 p-3 rounded">{selectedTrade.notes}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteTrade(trade.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

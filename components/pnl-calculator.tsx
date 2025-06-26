"use client"

import { TrendingUp, TrendingDown, Minus, Copy, ClipboardCheck } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PnLCalculatorProps {
  direction: "LONG" | "SHORT"
  entryPrice: string
  exitPrice: string
  positionSize: string
  feeAmount: number
  riskAmount: number
}

export function PnLCalculator({
  direction,
  entryPrice,
  exitPrice,
  positionSize,
  feeAmount,
  riskAmount,
}: PnLCalculatorProps) {
  const [copiedBreakeven, setCopiedBreakeven] = useState(false)

  const [open, setOpen] = useState(true)

  const entry = Number.parseFloat(entryPrice) || 0
  const exit = Number.parseFloat(exitPrice) || 0
  const size = Number.parseFloat(positionSize) || 0

  if (entry === 0 || size === 0) {
    return null
  }

  // Calculate breakeven price (entry + fees per unit)
  const feePerUnit = size > 0 ? feeAmount / size : 0
  const breakevenPrice = direction === "LONG" ? entry + feePerUnit : entry - feePerUnit

  // Calculate R multiples - Use total planned risk as 1R
  const totalPlannedRisk = riskAmount + feeAmount
  const grossPnL = direction === "LONG" ? (exit - entry) * size : (entry - exit) * size
  const netPnL = grossPnL - feeAmount

  // R multiples should be based on total planned risk, not just price risk
  const grossR = totalPlannedRisk > 0 ? grossPnL / totalPlannedRisk : 0
  const netR = totalPlannedRisk > 0 ? netPnL / totalPlannedRisk : 0
  const feeR = totalPlannedRisk > 0 ? feeAmount / totalPlannedRisk : 0

  // If no exit price, show breakeven info and fee R
  if (exit === 0) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3"
          onClick={() => setOpen(!open)}
        >
          <CardTitle className="flex items-center gap-2 text-sm">
            <Minus className="h-4 w-4 text-blue-600" />
            Trade Analysis (Running)
          </CardTitle>
        </CardHeader>
        {!open && (
          <div className="mb-3">
          </div>
        )}
        {open && (
          <CardContent className="space-y-3">
            {/* Fee Impact */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              {/* let's have breakeven here */}
              <div className="text-center cursor-pointer" title="Click to copy breakeven price"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(breakevenPrice.toFixed(entry < 1 ? 6 : 2))
                    setCopiedBreakeven(true)
                    setTimeout(() => setCopiedBreakeven(false), 1000)
                  } catch (err) {
                    console.error("Failed to copy:", err)
                  }
                }}
              >
                <div className="font-semibold text-orange-600">{breakevenPrice.toFixed(entry < 1 ? 6 : 2)}</div>
                <div className="text-xs text-muted-foreground">Breakeven Price</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">-{feeAmount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Fee Amount</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">-{feeR.toFixed(2)}R</div>
                <div className="text-xs text-muted-foreground">Fee Cost in R</div>
              </div>
            </div>

            {/* Trade Details */}
            <div className="text-xs space-y-1 pt-2 border-t">
              <div className="flex justify-between">
                <span>Entry:</span>
                <span className="font-mono">{entry.toFixed(entry < 1 ? 6 : 2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Breakeven:</span>
                <span className="font-mono">{breakevenPrice.toFixed(entry < 1 ? 6 : 2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-mono">{size}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Amount:</span>
                <span className="font-mono">{riskAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Direction:</span>
                <Badge variant="outline" className="h-4 text-xs">
                  {direction}
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  const isProfit = netPnL > 0
  const isBreakeven = Math.abs(netPnL) < 0.01

  // Calculate percentage return
  const percentReturn = entry > 0 ? (grossPnL / (entry * size)) * 100 : 0

  return (
    <Card
      className={`border-2 ${isProfit ? "border-green-200 bg-green-50" : isBreakeven ? "border-gray-200 bg-gray-50" : "border-red-200 bg-red-50"}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : isBreakeven ? (
            <Minus className="h-4 w-4 text-gray-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          P&L Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main P&L Display */}
        <div className="text-center">
          <div
            className={`text-3xl font-bold ${isProfit ? "text-green-600" : isBreakeven ? "text-gray-600" : "text-red-600"}`}
          >
            {netPnL > 0 ? "+" : ""}
            {netPnL.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">Net P&L</div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge variant={isProfit ? "default" : isBreakeven ? "secondary" : "destructive"}>
              {percentReturn > 0 ? "+" : ""}
              {percentReturn.toFixed(2)}%
            </Badge>
            <Badge variant={netR >= 0 ? "default" : "destructive"} className="font-mono">
              {netR > 0 ? "+" : ""}
              {netR.toFixed(2)}R
            </Badge>
          </div>
        </div>

        {/* R Multiple Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className={`font-semibold ${grossR >= 0 ? "text-green-600" : "text-red-600"}`}>
              {grossR > 0 ? "+" : ""}
              {grossR.toFixed(2)}R
            </div>
            <div className="text-xs text-muted-foreground">Gross R</div>
            <div className="text-xs font-mono text-muted-foreground">
              {grossPnL > 0 ? "+" : ""}
              {grossPnL.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">-{feeR.toFixed(2)}R</div>
            <div className="text-xs text-muted-foreground">Fee R</div>
            <div className="text-xs font-mono text-muted-foreground">-{feeAmount.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold ${netR >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netR > 0 ? "+" : ""}
              {netR.toFixed(2)}R
            </div>
            <div className="text-xs text-muted-foreground">Net R</div>
            <div className="text-xs font-mono text-muted-foreground">
              {netPnL > 0 ? "+" : ""}
              {netPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Breakeven Reference */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Breakeven was:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{breakevenPrice.toFixed(entry < 1 ? 6 : 2)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(breakevenPrice.toFixed(entry < 1 ? 6 : 2))
                    setCopiedBreakeven(true)
                    setTimeout(() => setCopiedBreakeven(false), 1000)
                  } catch (err) {
                    console.error("Failed to copy:", err)
                  }
                }}
              >
                {copiedBreakeven ? (
                  <ClipboardCheck className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Trade Details */}
        <div className="text-xs space-y-1 pt-2 border-t">
          <div className="flex justify-between">
            <span>Entry:</span>
            <span className="font-mono">{entry.toFixed(entry < 1 ? 6 : 2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Exit:</span>
            <span className="font-mono">{exit.toFixed(entry < 1 ? 6 : 2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-mono">{size}</span>
          </div>
          <div className="flex justify-between">
            <span>Risk Amount:</span>
            <span className="font-mono">{riskAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Direction:</span>
            <Badge variant="outline" className="h-4 text-xs">
              {direction}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

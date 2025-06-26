"use client"

import { useEffect, useState } from "react"
import { Clipboard, ClipboardCheck, Minus, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { AssetConfig } from "@/types/trading-system"

interface TradeFormProps {
  tradeDetails: {
    symbol: string
    direction: "LONG" | "SHORT"
    entryPrice: string
    stopLoss: string
    exitPrice: string
    positionSize: string
    notes: string
  }
  onUpdateTrade: (updates: Partial<TradeFormProps["tradeDetails"]>) => void
  assets: AssetConfig[]
}

export function TradeForm({ tradeDetails, onUpdateTrade, assets }: TradeFormProps) {
  const [pasteStates, setPasteStates] = useState<Record<string, boolean>>({})

  const [isEntryUpdateEnabled, setIsEntryUpdateEnabled] = useState(false)
  const [isStopLossUpdateEnabled, setIsStopLossUpdateEnabled] = useState(false)

  const handlePaste = async (field: keyof TradeFormProps["tradeDetails"]) => {
    try {
      const text = await navigator.clipboard.readText()
      // Clean the text - remove any non-numeric characters except decimal point and minus
      const cleanedText = text.replace(/[^0-9.-]/g, "")

      if (cleanedText && !isNaN(Number(cleanedText))) {
        onUpdateTrade({ [field]: cleanedText })

        // Show success feedback
        setPasteStates((prev) => ({ ...prev, [field]: true }))
        setTimeout(() => {
          setPasteStates((prev) => ({ ...prev, [field]: false }))
        }, 1000)
      } else {
        alert("Clipboard doesn't contain a valid number")
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err)
      alert("Failed to access clipboard. Make sure to allow clipboard access.")
    }
  }

  const PasteButton = ({ field, relative = true }: { field: keyof TradeFormProps["tradeDetails"]; relative?: boolean }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${relative ? "absolute right-1 top-1/2 -translate-y-1/2" : ""} hover:bg-blue-100`}
      onClick={() => handlePaste(field)}
      title={`Paste ${field}`}
    >
      {pasteStates[field] ? (
        <ClipboardCheck className="h-3 w-3 text-green-600" />
      ) : (
        <Clipboard className="h-3 w-3 text-gray-500" />
      )}
    </Button>
  )

  // if live update is enabled, we will take data text from entry_price and stop_loss classes in every o.5 seconds. we also need to unsubscribe from the live update when the component unmounts or when the user disables it.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let interval2: NodeJS.Timeout | null = null

    if (isEntryUpdateEnabled) {
      interval = setInterval(() => {
        const entryPrice = document.querySelector(".entry_price")?.textContent

        if (entryPrice) onUpdateTrade({ entryPrice })
      }, 500)
    }

    if (isStopLossUpdateEnabled) {
      interval2 = setInterval(() => {
        const stopLoss = document.querySelector(".stop_loss")?.textContent

        if (stopLoss) onUpdateTrade({ stopLoss })
      }, 500)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (interval2) clearInterval(interval2)
    }
  }, [isEntryUpdateEnabled, isStopLossUpdateEnabled])

  return (
    <div className="space-y-4">
      {/* Trade Details Input */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm">Symbol</Label>
          <Select value={tradeDetails.symbol} onValueChange={(value) => onUpdateTrade({ symbol: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.asset} value={asset.asset}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono">{asset.asset}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {asset.category} • Fee: {asset.fee} • Min: {asset.increment}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Direction</Label>
          <Select
            value={tradeDetails.direction}
            onValueChange={(value: "LONG" | "SHORT") => onUpdateTrade({ direction: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LONG">LONG</SelectItem>
              <SelectItem value="SHORT">SHORT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Position Size</Label>
          <div className="relative">
            <Input
              type="number"
              value={tradeDetails.positionSize}
              onChange={(e) => onUpdateTrade({ positionSize: e.target.value })}
              placeholder="e.g., 0.5, 100"
              step={assets.find((a) => a.asset === tradeDetails.symbol)?.increment || 0.01}
              className="pr-28 position_size"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100"
                onClick={() => {
                  const currentSize = Number.parseFloat(tradeDetails.positionSize) || 0
                  const asset = assets.find((a) => a.asset === tradeDetails.symbol)
                  const increment = asset?.increment || 0.01
                  const newSize = Math.max(0, currentSize - increment)
                  onUpdateTrade({ positionSize: newSize.toFixed(increment < 1 ? 2 : 0) })
                }}
                disabled={!tradeDetails.symbol}
                title="Decrease position size"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-green-100"
                onClick={() => {
                  const currentSize = Number.parseFloat(tradeDetails.positionSize) || 0
                  const asset = assets.find((a) => a.asset === tradeDetails.symbol)
                  const increment = asset?.increment || 0.01
                  const newSize = currentSize + increment
                  onUpdateTrade({ positionSize: newSize.toFixed(increment < 1 ? 2 : 0) })
                }}
                disabled={!tradeDetails.symbol}
                title="Increase position size"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <PasteButton field="positionSize" relative={false} />
            </div>
          </div>
          {tradeDetails.symbol && (
            <div className="text-xs text-muted-foreground mt-1">
              Increment: {assets.find((a) => a.asset === tradeDetails.symbol)?.increment || 0.01}
            </div>
          )}
        </div>
        <div>
          <Label className="text-sm">
            Entry Price
            - <span className={`${isEntryUpdateEnabled ? "text-blue-600" : ""} cursor-pointer`} onClick={() => setIsEntryUpdateEnabled(!isEntryUpdateEnabled)}> Live Update{" "}
              <span className={`entry_price`}></span>
            </span>
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={tradeDetails.entryPrice}
              onChange={(e) => onUpdateTrade({ entryPrice: e.target.value })}
              placeholder="e.g., 150.25"
              step="10"
              className="pr-10"
            />
            <PasteButton field="entryPrice" />
          </div>
        </div>
        <div>
          <Label className="text-sm">
            Stop Loss
            - <span className={`${isStopLossUpdateEnabled ? "text-blue-600" : ""} cursor-pointer`} onClick={() => setIsStopLossUpdateEnabled(!isStopLossUpdateEnabled)}> Live Update{" "}
              <span className={`stop_loss`}
              ></span>
            </span>
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={tradeDetails.stopLoss}
              onChange={(e) => onUpdateTrade({ stopLoss: e.target.value })}
              placeholder="e.g., 145.00"
              step="10"
              className="pr-10"
            />
            <PasteButton field="stopLoss" />
          </div>
        </div>
        <div>
          <Label className="text-sm">Exit Price (Optional)</Label>
          <div className="relative">
            <Input
              type="number"
              value={tradeDetails.exitPrice}
              onChange={(e) => onUpdateTrade({ exitPrice: e.target.value })}
              placeholder="e.g., 155.50"
              step="10"
              className="pr-10 exit_price"
            />
            <PasteButton field="exitPrice" />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm">Notes</Label>
        <Input
          value={tradeDetails.notes}
          onChange={(e) => onUpdateTrade({ notes: e.target.value })}
          placeholder="Additional trade notes..."
        />
      </div>
    </div>
  )
}

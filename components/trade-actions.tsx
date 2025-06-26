"use client"

import { Save, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TradeEntry } from "@/types/trading-system"

interface TradeActionsProps {
  onSaveComplete: () => void
  onSaveDraft: () => void
  onCancelEdit?: () => void
  editingTrade: TradeEntry | null
  scoreData: { totalScore: number }
  disabled?: boolean
}

export function TradeActions({
  onSaveComplete,
  onSaveDraft,
  onCancelEdit,
  editingTrade,
  scoreData,
  disabled = false,
}: TradeActionsProps) {
  const isDisabled = disabled || scoreData.totalScore === 0

  return (
    <div className="flex gap-2">
      <Button onClick={onSaveComplete} className="flex-1" disabled={isDisabled}>
        <Save className="h-4 w-4 mr-2" />
        Save Complete Trade
      </Button>
      <Button onClick={onSaveDraft} variant="outline" disabled={isDisabled}>
        <Plus className="h-4 w-4 mr-2" />
        Save as Draft
      </Button>
      {editingTrade && onCancelEdit && (
        <Button onClick={onCancelEdit} variant="ghost">
          <RotateCcw className="h-4 w-4 mr-2" />
          Cancel Edit
        </Button>
      )}
    </div>
  )
}

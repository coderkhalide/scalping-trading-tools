"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { Factor } from "@/types/trading-system"
import { getFactorGradeLabel } from "@/utils/scoring"

interface FactorItemProps {
  factor: Factor
  onUpdate: (updates: Partial<Factor>) => void
  onDelete: () => void
}

export function FactorItem({ factor, onUpdate, onDelete }: FactorItemProps) {
  const gradeLabel = getFactorGradeLabel(factor.individualGrade)
  const isActive = factor.individualGrade >= (factor.isMandatory ? 50 : 25)

  // Auto-update currentValue based on individualGrade
  const handleGradeChange = (grade: number) => {
    const newCurrentValue = grade >= (factor.isMandatory ? 50 : 25)
    onUpdate({ individualGrade: grade, currentValue: newCurrentValue })
  }

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg bg-white">
      {/* Status Indicator */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={`w-4 h-4 rounded-full border-2 ${isActive ? "bg-green-500 border-green-500" : "bg-gray-300 border-gray-400"}`}
        />
        <span className="text-xs text-muted-foreground">{factor.isMandatory ? "≥50%" : "≥25%"}</span>
      </div>

      {/* Factor Name */}
      <Input
        value={factor.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="flex-1 min-w-[120px]"
        placeholder="Factor name"
      />

      {/* Timeframe */}
      <Select value={factor.timeframe} onValueChange={(value) => onUpdate({ timeframe: value })}>
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1m">1m</SelectItem>
          <SelectItem value="5m">5m</SelectItem>
          <SelectItem value="15m">15m</SelectItem>
          <SelectItem value="1h">1h</SelectItem>
          <SelectItem value="4h">4h</SelectItem>
          <SelectItem value="1d">1d</SelectItem>
        </SelectContent>
      </Select>

      {/* Weight Input - Slightly Bigger */}
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={factor.weight}
          onChange={(e) => onUpdate({ weight: Number.parseInt(e.target.value) || 0 })}
          className="w-16 h-8 text-xs text-center"
          min="0"
          max="100"
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>

      {/* Individual Factor Grade - BIGGER SLIDER */}
      <div className="flex flex-col items-center gap-2 min-w-[200px]">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">Grade:</span>
          <span className={`text-sm font-bold ${gradeLabel.color}`}>
            {factor.individualGrade}% ({gradeLabel.label})
          </span>
        </div>

        {/* BIGGER SLIDER */}
        <Slider
          value={[factor.individualGrade]}
          onValueChange={(value) => handleGradeChange(value[0])}
          max={100}
          min={0}
          step={5}
          className="w-full h-6" // Made taller for easier clicking
        />

        {/* Quick Grade Buttons */}
        <div className="flex gap-1 w-full justify-between">
          {[0, 25, 50, 75, 90, 100].map((preset) => (
            <Button
              key={preset}
              variant={factor.individualGrade === preset ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs flex-1"
              onClick={() => handleGradeChange(preset)}
            >
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Mandatory Switch - Compact */}
      <div className="flex flex-col items-center gap-1">
        <Switch checked={factor.isMandatory} onCheckedChange={(checked) => onUpdate({ isMandatory: checked })} />
        <span className="text-xs text-muted-foreground">Req</span>
      </div>

      {/* Delete Button */}
      <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

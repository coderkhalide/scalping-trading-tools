"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { FactorGroup as FactorGroupType, Factor } from "@/types/trading-system"
import { FactorItem } from "./factor-item"

interface FactorGroupProps {
  group: FactorGroupType
  onUpdateGroup: (updates: Partial<FactorGroupType>) => void
  onUpdateFactor: (factorId: string, updates: Partial<Factor>) => void
  onAddFactor: () => void
  onDeleteFactor: (factorId: string) => void
  onDeleteGroup: () => void
}

export function FactorGroup({
  group,
  onUpdateGroup,
  onUpdateFactor,
  onAddFactor,
  onDeleteFactor,
  onDeleteGroup,
}: FactorGroupProps) {
  const totalWeight = group.factors.reduce((sum, factor) => sum + factor.weight, 0)
  const isWeightValid = totalWeight === 100
  const weightWarning = totalWeight !== 100

  const normalizeWeights = () => {
    if (group.factors.length === 0) return

    const equalWeight = Math.floor(100 / group.factors.length)
    const remainder = 100 - equalWeight * group.factors.length

    group.factors.forEach((factor, index) => {
      const weight = index === 0 ? equalWeight + remainder : equalWeight
      onUpdateFactor(factor.id, { weight })
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={group.name}
              onChange={(e) => onUpdateGroup({ name: e.target.value })}
              className="font-semibold text-lg border-none p-0 h-auto bg-transparent"
            />
            <Badge variant={group.operator === "AND" ? "default" : "secondary"}>{group.operator}</Badge>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Group Weight:</Label>
              <Input
                type="number"
                value={group.weight}
                onChange={(e) => onUpdateGroup({ weight: Number.parseInt(e.target.value) || 0 })}
                className="w-16 h-8"
                min="0"
                max="100"
              />
            </div>
            {/* Factor Weight Summary */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">Factor Weights:</Label>
              <span className={`text-xs font-semibold ${weightWarning ? "text-orange-600" : "text-green-600"}`}>
                {totalWeight}/100
              </span>
              {weightWarning && (
                <Button variant="outline" size="sm" onClick={normalizeWeights} className="h-6 text-xs">
                  Normalize
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={group.operator} onValueChange={(value: "AND" | "OR") => onUpdateGroup({ operator: value })}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onAddFactor}>
              <Plus className="h-4 w-4 mr-1" />
              Factor
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeleteGroup}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {weightWarning && (
          <div className="text-xs text-orange-600 mt-2">
            ⚠️ Factor weights total {totalWeight}%. Consider normalizing to 100% for accurate scoring.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {group.factors.map((factor) => (
            <FactorItem
              key={factor.id}
              factor={factor}
              onUpdate={(updates) => onUpdateFactor(factor.id, updates)}
              onDelete={() => onDeleteFactor(factor.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Plus, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { BonusRule } from "@/types/trading-system"

interface BonusRulesProps {
  bonusRules: BonusRule[]
  onUpdateRule: (ruleId: string, updates: Partial<BonusRule>) => void
  onAddRule: () => void
  onDeleteRule: (ruleId: string) => void
}

export function BonusRules({ bonusRules, onUpdateRule, onAddRule, onDeleteRule }: BonusRulesProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Bonus Point Rules
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure bonus points for exceptional setups that warrant larger position sizes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bonusRules.map((bonus) => (
            <div key={bonus.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={bonus.isActive}
                    onCheckedChange={(checked) => onUpdateRule(bonus.id, { isActive: checked })}
                  />
                  <Input
                    value={bonus.name}
                    onChange={(e) => onUpdateRule(bonus.id, { name: e.target.value })}
                    className="font-semibold"
                    placeholder="Bonus rule name"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Bonus:</Label>
                    <Input
                      type="number"
                      value={bonus.bonusPoints}
                      onChange={(e) => onUpdateRule(bonus.id, { bonusPoints: Number.parseInt(e.target.value) || 0 })}
                      className="w-16 h-8"
                      min="0"
                      max="50"
                    />
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onDeleteRule(bonus.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={bonus.description}
                onChange={(e) => onUpdateRule(bonus.id, { description: e.target.value })}
                placeholder="Describe when this bonus applies..."
                className="text-sm"
              />
            </div>
          ))}
          <Button variant="outline" onClick={onAddRule} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Bonus Rule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

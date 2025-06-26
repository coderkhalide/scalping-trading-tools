"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { RiskSettings } from "@/types/trading-system"

interface RiskSettingsDialogProps {
  riskSettings: RiskSettings
  onUpdateRiskSettings: (updates: Partial<RiskSettings>) => void
}

export function RiskSettingsDialog({ riskSettings, onUpdateRiskSettings }: RiskSettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Risk Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Risk Management Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Portfolio Value ($)</Label>
            <Input
              type="number"
              value={riskSettings.portfolioValue}
              onChange={(e) =>
                onUpdateRiskSettings({
                  portfolioValue: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div>
            <Label>Risk Tolerance (±%)</Label>
            <Input
              type="number"
              value={riskSettings.riskTolerance}
              onChange={(e) =>
                onUpdateRiskSettings({
                  riskTolerance: Number.parseFloat(e.target.value) || 10,
                })
              }
              placeholder="10"
              min="0"
              max="50"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Allows deviation from recommended risk (e.g., 10% = ±10% tolerance)
            </div>
          </div>
          <div>
            <Label>Minimum Risk for B Grade ($)</Label>
            <Input
              type="number"
              value={riskSettings.bGradeMinRisk}
              onChange={(e) =>
                onUpdateRiskSettings({
                  bGradeMinRisk: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Risk Percentage by Grade</Label>
            {Object.entries(riskSettings.portfolioRiskPercent).map(([grade, percent]) => (
              <div key={grade} className="flex items-center gap-2">
                <Label className="w-12">{grade}:</Label>
                <Input
                  type="number"
                  value={percent}
                  onChange={(e) =>
                    onUpdateRiskSettings({
                      portfolioRiskPercent: {
                        ...riskSettings.portfolioRiskPercent,
                        [grade]: Number.parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-20"
                  step="0.1"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

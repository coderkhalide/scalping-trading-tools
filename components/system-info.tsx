"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TradingSystem } from "@/types/trading-system"

interface SystemInfoProps {
  system: TradingSystem
  systems: TradingSystem[]
  onUpdateSystem: (updates: Partial<TradingSystem>) => void
  onExportSystems: () => void
  onImportSystems: () => void
  onClearData: () => void
}

export function SystemInfo({
  system,
  systems,
  onUpdateSystem,
  onExportSystems,
  onImportSystems,
  onClearData,
}: SystemInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>System Name</Label>
            <Input value={system.name} onChange={(e) => onUpdateSystem({ name: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={system.description}
              onChange={(e) => onUpdateSystem({ description: e.target.value })}
              placeholder="Describe your trading system..."
            />
          </div>

          {/* Grade Scale Reference */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Grade Scale Reference</Label>
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="text-purple-700 font-semibold">A++++ (150+): Legendary Setup</div>
              <div className="text-purple-600 font-semibold">A+++ (130-149): Exceptional Setup</div>
              <div className="text-purple-500 font-semibold">A++ (110-129): Premium Setup</div>
              <div className="text-green-600">A+ (95-109): Excellent</div>
              <div className="text-green-500">A (85-94): Very Good</div>
              <div className="text-blue-500">B (75-84): Good</div>
              <div className="text-yellow-500">C (65-74): Average</div>
              <div className="text-orange-500">D (55-64): Below Average</div>
              <div className="text-red-500">F (0-54): Poor</div>
            </div>
          </div>

          {/* Factor Grade Reference */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Individual Factor Grades</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="text-purple-600">Perfect (90-100%): Ideal conditions</div>
              <div className="text-green-600">Strong (75-89%): Very good signal</div>
              <div className="text-yellow-600">Moderate (50-74%): Decent signal</div>
              <div className="text-orange-600">Weak (25-49%): Poor signal</div>
              <div className="text-red-600">Poor (0-24%): Very poor signal</div>
            </div>
          </div>

          {/* Backup/Restore Section */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Data Management</Label>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={onExportSystems}>
                Export All Systems
              </Button>
              <Button variant="outline" size="sm" onClick={onImportSystems}>
                Import Systems
              </Button>
              <Button variant="destructive" size="sm" onClick={onClearData}>
                Clear All Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your data is automatically saved to your browser's local storage
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

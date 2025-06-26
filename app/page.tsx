"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TradingSystem, FactorGroup, Factor, BonusRule } from "@/types/trading-system"
import { calculateScore } from "@/utils/scoring"
import { ScoreDisplay } from "@/components/score-display"
import { FactorGroup as FactorGroupComponent } from "@/components/factor-group"
import { BonusRules } from "@/components/bonus-rules"
import { SystemInfo } from "@/components/system-info"
import { TradeLogger } from "@/components/trade-logger"

export default function TradingGrader() {
  const [systems, setSystems] = useState<TradingSystem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSystemId, setActiveSystemId] = useState("1")
  const [newSystemName, setNewSystemName] = useState("")
  const [layoutMode, setLayoutMode] = useState<"auto" | "stacked" | "sideBySide">("auto")

  // localStorage functions
  const saveToLocalStorage = (systemsData: TradingSystem[]) => {
    try {
      localStorage.setItem("tradingGraderSystems", JSON.stringify(systemsData))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  const loadFromLocalStorage = (): TradingSystem[] => {
    try {
      const saved = localStorage.getItem("tradingGraderSystems")
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }

    // Return default system
    return [
      {
        id: "1",
        name: "Demo System",
        description: "A sample trading system for demonstration purposes",
        factorGroups: [
          {
            id: "1",
            name: "15 Minute Confirmation",
            operator: "OR",
            weight: 40,
            factors: [
              {
                id: "1",
                name: "12/21 EMA Crossover",
                timeframe: "15m",
                weight: 30,
                isMandatory: false,
                currentValue: false,
                individualGrade: 0,
              },
              {
                id: "2",
                name: "RSI Above 50",
                timeframe: "15m",
                weight: 70,
                isMandatory: false,
                currentValue: false,
                individualGrade: 0,
              },
            ],
          },
          {
            id: "2",
            name: "1 Minute Entry",
            operator: "AND",
            weight: 60,
            factors: [
              {
                id: "3",
                name: "12/21 EMA Crossover",
                timeframe: "1m",
                weight: 40,
                isMandatory: true,
                currentValue: false,
                individualGrade: 0,
              },
              {
                id: "4",
                name: "High Volume Spike",
                timeframe: "1m",
                weight: 60,
                isMandatory: true,
                currentValue: false,
                individualGrade: 0,
              },
            ],
          },
        ],
        bonusRules: [
          {
            id: "1",
            name: "15m Confirmation Bonus",
            description: "RSI is above 75 on 15m chart",
            bonusPoints: 15,
            conditions: [
              { factorName: "12/21 EMA Crossover", timeframes: ["1m", "15m"], minimumGrade: 75 },
              { factorName: "RSI Above 50", timeframes: ["1m", "15m"], minimumGrade: 75 },
            ],
            isActive: true,
          },
        ],
      },
    ]
  }

  // Load data on component mount
  useEffect(() => {
    const loadedSystems = loadFromLocalStorage()
    setSystems(loadedSystems)
    if (loadedSystems.length > 0) {
      setActiveSystemId(loadedSystems[0].id)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever systems change
  useEffect(() => {
    if (isLoaded && systems.length > 0) {
      saveToLocalStorage(systems)
    }
  }, [systems, isLoaded])

  // Load layout preference
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem("tradingGraderLayout")
      if (savedLayout) setLayoutMode(savedLayout as "auto" | "stacked" | "sideBySide")
    } catch (error) {
      console.error("Failed to load layout preference:", error)
    }
  }, [])

  // Save layout preference
  useEffect(() => {
    localStorage.setItem("tradingGraderLayout", layoutMode)
  }, [layoutMode])

  const activeSystem = systems.find((s) => s.id === activeSystemId)

  const addSystem = () => {
    if (!newSystemName.trim()) return

    const newSystem: TradingSystem = {
      id: Date.now().toString(),
      name: newSystemName,
      description: "",
      factorGroups: [],
      bonusRules: [],
    }

    setSystems([...systems, newSystem])
    setActiveSystemId(newSystem.id)
    setNewSystemName("")
  }

  const deleteSystem = (systemId: string) => {
    const updatedSystems = systems.filter((s) => s.id !== systemId)
    setSystems(updatedSystems)
    if (activeSystemId === systemId && updatedSystems.length > 0) {
      setActiveSystemId(updatedSystems[0].id)
    }
  }

  const updateSystem = (updates: Partial<TradingSystem>) => {
    const updatedSystems = systems.map((s) => (s.id === activeSystemId ? { ...s, ...updates } : s))
    setSystems(updatedSystems)
  }

  // Function to restore system state from saved trade
  const restoreSystemState = (factorGroups: FactorGroup[], bonusRules: BonusRule[]) => {
    if (activeSystem) {
      updateSystem({
        factorGroups: factorGroups,
        bonusRules: bonusRules,
      })
    }
  }

  const addFactorGroup = () => {
    if (!activeSystem) return

    const newGroup: FactorGroup = {
      id: Date.now().toString(),
      name: "New Group",
      operator: "AND",
      weight: 50,
      factors: [],
    }

    updateSystem({ factorGroups: [...activeSystem.factorGroups, newGroup] })
  }

  const updateFactorGroup = (groupId: string, updates: Partial<FactorGroup>) => {
    if (!activeSystem) return

    const updatedGroups = activeSystem.factorGroups.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    updateSystem({ factorGroups: updatedGroups })
  }

  const deleteFactorGroup = (groupId: string) => {
    if (!activeSystem) return

    const updatedGroups = activeSystem.factorGroups.filter((g) => g.id !== groupId)
    updateSystem({ factorGroups: updatedGroups })
  }

  const addFactor = (groupId: string) => {
    if (!activeSystem) return

    const newFactor: Factor = {
      id: Date.now().toString(),
      name: "New Factor",
      timeframe: "1m",
      weight: 50,
      isMandatory: false,
      currentValue: false,
      individualGrade: 0,
    }

    const updatedGroups = activeSystem.factorGroups.map((g) =>
      g.id === groupId ? { ...g, factors: [...g.factors, newFactor] } : g,
    )
    updateSystem({ factorGroups: updatedGroups })
  }

  const updateFactor = (groupId: string, factorId: string, updates: Partial<Factor>) => {
    if (!activeSystem) return

    const updatedGroups = activeSystem.factorGroups.map((g) =>
      g.id === groupId
        ? {
          ...g,
          factors: g.factors.map((f) => (f.id === factorId ? { ...f, ...updates } : f)),
        }
        : g,
    )
    updateSystem({ factorGroups: updatedGroups })
  }

  const deleteFactor = (groupId: string, factorId: string) => {
    if (!activeSystem) return

    const updatedGroups = activeSystem.factorGroups.map((g) =>
      g.id === groupId ? { ...g, factors: g.factors.filter((f) => f.id !== factorId) } : g,
    )
    updateSystem({ factorGroups: updatedGroups })
  }

  const addBonusRule = () => {
    if (!activeSystem) return

    const newBonusRule: BonusRule = {
      id: Date.now().toString(),
      name: "New Bonus Rule",
      description: "Describe when this bonus applies",
      bonusPoints: 10,
      conditions: [],
      isActive: true,
    }

    updateSystem({ bonusRules: [...activeSystem.bonusRules, newBonusRule] })
  }

  const updateBonusRule = (bonusId: string, updates: Partial<BonusRule>) => {
    if (!activeSystem) return

    const updatedRules = activeSystem.bonusRules.map((b) => (b.id === bonusId ? { ...b, ...updates } : b))
    updateSystem({ bonusRules: updatedRules })
  }

  const deleteBonusRule = (bonusId: string) => {
    if (!activeSystem) return

    const updatedRules = activeSystem.bonusRules.filter((b) => b.id !== bonusId)
    updateSystem({ bonusRules: updatedRules })
  }

  const handleExportSystems = () => {
    const dataStr = JSON.stringify(systems, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `trading-systems-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSystems = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedSystems = JSON.parse(e.target?.result as string)
            setSystems(importedSystems)
            if (importedSystems.length > 0) {
              setActiveSystemId(importedSystems[0].id)
            }
          } catch (error) {
            alert("Invalid file format")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem("tradingGraderSystems")
      const defaultSystems = loadFromLocalStorage()
      setSystems(defaultSystems)
      setActiveSystemId(defaultSystems[0].id)
    }
  }

  const scoreData = activeSystem
    ? calculateScore(activeSystem)
    : { baseScore: 0, bonusPoints: 0, totalScore: 0, factorBreakdown: [] }

  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your trading systems...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading Position Grader</h1>
            <p className="text-muted-foreground">
              Configure and grade your trading entries with weighted factors, individual factor grading, bonus points,
              and letter grades
            </p>
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Layout:</Label>
            <Select
              value={layoutMode}
              onValueChange={(value: "auto" | "stacked" | "sideBySide") => setLayoutMode(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="sideBySide">Side by Side</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* System Selector */}
      <div className="flex items-center justify-between mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-4">
          <Label className="font-semibold">Current System:</Label>
          <Select value={activeSystemId} onValueChange={setActiveSystemId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a trading system" />
            </SelectTrigger>
            <SelectContent>
              {systems.map((system) => (
                <SelectItem key={system.id} value={system.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{system.name}</span>
                    {systems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSystem(system.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="New system name"
            value={newSystemName}
            onChange={(e) => setNewSystemName(e.target.value)}
            className="w-48"
          />
          <Button onClick={addSystem} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add System
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {activeSystem && (
        <div
          className={`
            ${layoutMode === "sideBySide"
              ? "grid grid-cols-2 gap-6"
              : layoutMode === "stacked"
                ? "space-y-6"
                : "space-y-6 2xl:grid 2xl:grid-cols-2 2xl:gap-6 2xl:space-y-0"
            }
          `}
        >
          {/* Left Column - Grading System */}
          <div className="space-y-6">
            <ScoreDisplay scoreData={scoreData} />

            {/* Factor Groups */}
            <div className="space-y-4">
              {activeSystem.factorGroups.map((group) => (
                <FactorGroupComponent
                  key={group.id}
                  group={group}
                  onUpdateGroup={(updates) => updateFactorGroup(group.id, updates)}
                  onUpdateFactor={(factorId, updates) => updateFactor(group.id, factorId, updates)}
                  onAddFactor={() => addFactor(group.id)}
                  onDeleteFactor={(factorId) => deleteFactor(group.id, factorId)}
                  onDeleteGroup={() => deleteFactorGroup(group.id)}
                />
              ))}

              <Button variant="outline" onClick={addFactorGroup} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Factor Group
              </Button>
            </div>

            <BonusRules
              bonusRules={activeSystem.bonusRules}
              onUpdateRule={updateBonusRule}
              onAddRule={addBonusRule}
              onDeleteRule={deleteBonusRule}
            />

            <SystemInfo
              system={activeSystem}
              systems={systems}
              onUpdateSystem={updateSystem}
              onExportSystems={handleExportSystems}
              onImportSystems={handleImportSystems}
              onClearData={handleClearData}
            />
          </div>

          {/* Right Column - Trade Logger */}
          <div className="space-y-6">
            <TradeLogger system={activeSystem} scoreData={scoreData} onRestoreSystemState={restoreSystemState} />
          </div>
        </div>
      )}
    </div>
  )
}

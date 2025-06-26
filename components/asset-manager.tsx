"use client"

import { useState } from "react"
import { Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { AssetConfig } from "@/types/trading-system"

interface AssetManagerProps {
  assets: AssetConfig[]
  onUpdateAssets: (assets: AssetConfig[]) => void
}

export function AssetManager({ assets, onUpdateAssets }: AssetManagerProps) {
  const [newAsset, setNewAsset] = useState({
    asset: "",
    fee: "",
    increment: "",
    category: "crypto",
  })

  const addAsset = () => {
    if (newAsset.asset.trim() && newAsset.fee.trim() && newAsset.increment.trim()) {
      const asset: AssetConfig = {
        asset: newAsset.asset.trim().toUpperCase(),
        fee: Number.parseFloat(newAsset.fee) || 0,
        increment: Number.parseFloat(newAsset.increment) || 0.01,
        category: newAsset.category,
      }

      // Check if asset already exists
      if (!assets.find((a) => a.asset === asset.asset)) {
        onUpdateAssets([...assets, asset])
      }

      setNewAsset({ asset: "", fee: "", increment: "", category: "crypto" })
    }
  }

  const updateAsset = (index: number, updates: Partial<AssetConfig>) => {
    const updated = assets.map((asset, i) => (i === index ? { ...asset, ...updates } : asset))
    onUpdateAssets(updated)
  }

  const removeAsset = (index: number) => {
    onUpdateAssets(assets.filter((_, i) => i !== index))
  }

  const categoryColors = {
    crypto: "bg-orange-100 text-orange-800",
    stock: "bg-blue-100 text-blue-800",
    forex: "bg-green-100 text-green-800",
    commodity: "bg-yellow-100 text-yellow-800",
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          Manage Assets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Trading Assets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add New Asset */}
          <div className="p-4 border rounded-lg bg-green-50">
            <Label className="text-sm font-medium">Add New Asset</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              <Input
                value={newAsset.asset}
                onChange={(e) => setNewAsset({ ...newAsset, asset: e.target.value })}
                placeholder="Symbol"
              />
              <Select
                value={newAsset.category}
                onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="commodity">Commodity</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={newAsset.fee}
                onChange={(e) => setNewAsset({ ...newAsset, fee: e.target.value })}
                placeholder="Fee/unit"
                step="0.001"
              />
              <Input
                type="number"
                value={newAsset.increment}
                onChange={(e) => setNewAsset({ ...newAsset, increment: e.target.value })}
                placeholder="Min size"
                step="0.001"
              />
              <Button onClick={addAsset}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Min size: BTC=0.01, ETH=0.1, Stocks=1, Forex=0.01</div>
          </div>

          {/* Existing Assets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Configured Assets ({assets.length})</Label>
            <div className="grid gap-2">
              {assets.map((asset, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Input
                    value={asset.asset}
                    onChange={(e) => updateAsset(index, { asset: e.target.value.toUpperCase() })}
                    className="w-20 font-mono"
                  />
                  <span
                    className={`px-2 py-1 rounded text-xs ${categoryColors[asset.category as keyof typeof categoryColors]}`}
                  >
                    {asset.category}
                  </span>
                  <Input
                    type="number"
                    value={asset.fee}
                    onChange={(e) => updateAsset(index, { fee: Number.parseFloat(e.target.value) || 0 })}
                    className="w-20"
                    step="0.001"
                  />
                  <Input
                    type="number"
                    value={asset.increment}
                    onChange={(e) => updateAsset(index, { increment: Number.parseFloat(e.target.value) || 0.01 })}
                    className="w-20"
                    step="0.001"
                  />
                  <Button variant="outline" size="sm" onClick={() => removeAsset(index)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

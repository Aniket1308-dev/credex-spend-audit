"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"

export type AiTool = {
  id: string
  name: string
  monthlyCost: number
  totalSeats: number
  activeUsers: number
}

const POPULAR_TOOLS = [
  "ChatGPT Plus", "GitHub Copilot", "Notion AI", "Midjourney",
  "Jasper", "Grammarly", "Claude Pro", "Perplexity Pro",
]

export default function SpendForm({
  onSubmit,
}: {
  onSubmit: (tools: AiTool[]) => void
}) {
  const [tools, setTools] = useState<AiTool[]>([])
  const [name, setName] = useState("")
  const [monthlyCost, setMonthlyCost] = useState("")
  const [totalSeats, setTotalSeats] = useState("")
  const [activeUsers, setActiveUsers] = useState("")

  function addTool() {
    if (!name || !monthlyCost || !totalSeats || !activeUsers) return
    const tool: AiTool = {
      id: crypto.randomUUID(),
      name,
      monthlyCost: parseFloat(monthlyCost),
      totalSeats: parseInt(totalSeats),
      activeUsers: parseInt(activeUsers),
    }
    setTools([...tools, tool])
    setName("")
    setMonthlyCost("")
    setTotalSeats("")
    setActiveUsers("")
  }

  function removeTool(id: string) {
    setTools(tools.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Add tool form */}
      <Card>
        <CardHeader>
          <CardTitle>Add an AI Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tool name + quick-select badges */}
          <div className="space-y-2">
            <Label>Tool Name</Label>
            <Input
              placeholder="e.g. GitHub Copilot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {POPULAR_TOOLS.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-100"
                  onClick={() => setName(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {/* Cost / seats / active users */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Monthly Cost ($)</Label>
              <Input
                type="number"
                placeholder="99"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Total Seats</Label>
              <Input
                type="number"
                placeholder="10"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Active Users</Label>
              <Input
                type="number"
                placeholder="6"
                value={activeUsers}
                onChange={(e) => setActiveUsers(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={addTool} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </Button>
        </CardContent>
      </Card>

      {/* List of added tools */}
      {tools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your AI Stack ({tools.length} tool{tools.length > 1 ? "s" : ""})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${tool.monthlyCost}/mo &middot; {tool.activeUsers}/{tool.totalSeats} users active
                  </p>
                </div>
                <button onClick={() => removeTool(tool.id)}>
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                </button>
              </div>
            ))}

            <Button onClick={() => onSubmit(tools)} className="w-full mt-2">
              Run Audit →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
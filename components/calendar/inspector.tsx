"use client"

import * as React from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Plus, ChefHat, Save, ChevronRight, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useMenuStore } from "@/lib/store"
import { CANTEENS, MEAL_TYPES, type MenuSession, type Dish } from "@/types/menu"
import { cn } from "@/lib/utils"
import { DishItem } from "@/components/dish-item"

interface InspectorProps {
  currentDate: Date
}

export function Inspector({ currentDate }: InspectorProps) {
  const dateKey = format(currentDate, "yyyy-MM-dd")

  // This avoids returning a new array reference from the selector itself on every call
  const allSessions = useMenuStore((state) => state.sessions)
  const sessions = React.useMemo(() => allSessions.filter((s) => s.date === dateKey), [allSessions, dateKey])

  const addSession = useMenuStore((state) => state.addSession)

  const [isAddingMenu, setIsAddingMenu] = React.useState(false)
  const [selectedCanteen, setSelectedCanteen] = React.useState("")
  const [selectedMeal, setSelectedMeal] = React.useState("")

  const handleCreateSession = () => {
    if (!selectedCanteen || !selectedMeal) return

    // Check if exists
    const exists = sessions.find((s) => s.canteenId === selectedCanteen && s.mealId === selectedMeal)
    if (exists) {
      alert("该经营窗口已存在")
      return
    }

    const newSession: MenuSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateKey,
      canteenId: selectedCanteen,
      mealId: selectedMeal,
      status: "draft",
      dishes: [],
    }
    addSession(newSession)
    setIsAddingMenu(false)
    setSelectedCanteen("")
    setSelectedMeal("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">排菜详情</h2>
            <p className="text-sm text-muted-foreground">
              {format(currentDate, "yyyy年MM月dd日 EEEE", { locale: zhCN })}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>草稿: {sessions.filter((s) => s.status === "draft").length}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>已提交: {sessions.filter((s) => s.status === "submitted").length}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {sessions.length === 0 && !isAddingMenu ? (
            <div className="text-center py-12 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>今日暂无排菜计划</p>
              <p className="text-xs mt-1">点击下方按钮开始排菜</p>
            </div>
          ) : (
            sessions.map((session) => <SessionCard key={session.id} session={session} />)
          )}

          {/* Inline Add Menu Form */}
          {isAddingMenu ? (
            <div className="border rounded-lg p-4 bg-muted/10 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">请选择</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsAddingMenu(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">食堂</Label>
                  <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="选择食堂" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANTEENS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">餐别</Label>
                  <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="选择餐别" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAddingMenu(false)}>
                  取消
                </Button>
                <Button size="sm" onClick={handleCreateSession} disabled={!selectedCanteen || !selectedMeal}>
                  确定创建
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddingMenu(true)}
              variant="outline"
              className="w-full border-dashed gap-1 h-12 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-4 w-4" />
              新增菜单
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function SessionCard({ session }: { session: MenuSession }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const updateSession = useMenuStore((state) => state.updateSession)
  const removeSession = useMenuStore((state) => state.removeSession) // Added removeSession
  const addDish = useMenuStore((state) => state.addDish)
  const updateDish = useMenuStore((state) => state.updateDish)
  const removeDish = useMenuStore((state) => state.removeDish)

  const canteenName = CANTEENS.find((c) => c.id === session.canteenId)?.name
  const mealName = MEAL_TYPES.find((m) => m.id === session.mealId)?.name
  const isLocked = session.status === "submitted"

  const handleDeleteSession = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("确定要删除这个排菜计划吗？")) {
      removeSession(session.id)
    }
  }

  const handleAddDish = () => {
    if (isLocked) return
    const newDish: Dish = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      plannedServings: "",
      chefName: "当前厨师", // Mock default
      ingredients: [],
    }
    addDish(session.id, newDish)
  }

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("提交后将无法修改，确认提交吗？")) {
      updateSession(session.id, { status: "submitted" })
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-card shadow-sm overflow-hidden">
      {/* Session Header */}
      <CollapsibleTrigger className="w-full p-3 bg-muted/30 border-b flex items-center justify-between hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-2">
          <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
          <span className="font-medium">{canteenName}</span>
          <span className="text-muted-foreground">-</span>
          <span className="font-medium">{mealName}</span>
          <Badge
            variant="outline"
            className={cn(
              "ml-2 text-xs border-0 text-white",
              session.status === "submitted" ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600",
            )}
          >
            {session.status === "submitted" ? "已提交" : "草稿"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">共 {session.dishes.length} 道菜</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteSession}
            className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            删除
          </Button>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {/* Dishes List */}
        <div className="divide-y border-t">
          {session.dishes.map((dish) => (
            <DishItem
              key={dish.id}
              id={dish.id}
              name={dish.name}
              servings={dish.plannedServings}
              ingredients={dish.ingredients}
              onUpdate={(updates) => {
                if (isLocked) return
                updateDish(session.id, dish.id, updates)
              }}
              onDelete={() => !isLocked && removeDish(session.id, dish.id)}
            />
          ))}

          {/* Empty State */}
          {session.dishes.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">暂无菜品，请添加</div>
          )}

          {/* Actions Area */}
          {!isLocked && (
            <div className="p-4 space-y-3 bg-muted/5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDish}
                className="w-full border-dashed h-9 bg-transparent"
              >
                <Plus className="h-3 w-3 mr-1" />
                添加菜品
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                className="w-full h-9 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-3 w-3 mr-1" />
                提交菜单
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

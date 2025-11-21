"use client"

import * as React from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Plus, ChefHat, Save, ChevronRight, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useMenuStore } from "@/lib/store"
import { CANTEENS, MEAL_TYPES, type MenuSession, type Dish } from "@/types/menu"
import { cn } from "@/lib/utils"
import { DishItem } from "@/components/dish-item"
import { getLunarDateInfo } from "@/lib/lunar"

interface InspectorProps {
  currentDate: Date
}

export function Inspector({ currentDate }: InspectorProps) {
  const dateKey = format(currentDate, "yyyy-MM-dd")
  const lunarInfo = getLunarDateInfo(currentDate)

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
      toast.error("该经营窗口已存在")
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
            <p className="text-xs mt-0.5 text-muted-foreground">
              <span>{lunarInfo.lunarMonth}{lunarInfo.lunarDay}</span>
              {(lunarInfo.festival || lunarInfo.term) && (
                <>
                  <span className="mx-1.5">·</span>
                  <span className="text-red-500 font-medium">
                    {lunarInfo.festival || lunarInfo.term}
                  </span>
                </>
              )}
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
            <div className="border rounded-xl p-4 bg-white shadow-sm space-y-5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">创建新菜单</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={() => setIsAddingMenu(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-normal">选择食堂</Label>
                <div className="flex flex-wrap gap-2">
                  {CANTEENS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCanteen(c.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                        selectedCanteen === c.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-transparent bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <ChefHat className="h-4 w-4" />
                      <span className="text-xs font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-normal">选择餐别</Label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMeal(m.id)}
                      className={cn(
                        "flex items-center justify-center px-4 py-2 rounded-lg border transition-all text-xs font-medium",
                        selectedMeal === m.id
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-transparent bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full"
                  onClick={handleCreateSession}
                  disabled={!selectedCanteen || !selectedMeal}
                >
                  开始排菜
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
  const [isOpen, setIsOpen] = React.useState(session.status !== "submitted")
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false)
  const [isConfirmingSubmit, setIsConfirmingSubmit] = React.useState(false)

  const updateSession = useMenuStore((state) => state.updateSession)
  const removeSession = useMenuStore((state) => state.removeSession)
  const addDish = useMenuStore((state) => state.addDish)
  const updateDish = useMenuStore((state) => state.updateDish)
  const removeDish = useMenuStore((state) => state.removeDish)

  const canteenName = CANTEENS.find((c) => c.id === session.canteenId)?.name
  const mealName = MEAL_TYPES.find((m) => m.id === session.mealId)?.name
  const isLocked = session.status === "submitted"

  // Auto-collapse when submitted
  React.useEffect(() => {
    if (session.status === "submitted") {
      setIsOpen(false)
    }
  }, [session.status])

  // Reset confirmation states when menu closes or interactions happen
  React.useEffect(() => {
    if (!isOpen) {
      setIsConfirmingDelete(false)
      setIsConfirmingSubmit(false)
    }
  }, [isOpen])

  const handleDeleteSession = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isConfirmingDelete) {
      removeSession(session.id)
    } else {
      setIsConfirmingDelete(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000)
    }
  }

  const handleAddDish = () => {
    if (isLocked) return
    const newDish: Dish = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      plannedServings: "",
      chefName: "当前厨师",
      ingredients: [],
    }
    addDish(session.id, newDish)
  }

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isConfirmingSubmit) {
      updateSession(session.id, { status: "submitted" })
      toast.success("菜单已提交")
      setIsConfirmingSubmit(false)
    } else {
      setIsConfirmingSubmit(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setIsConfirmingSubmit(false), 3000)
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
            asChild
            variant={isConfirmingDelete ? "destructive" : "ghost"}
            size="sm"
            className={cn(
              "h-7 px-2 transition-all",
              !isConfirmingDelete && "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            )}
          >
            <span role="button" tabIndex={0} onClick={handleDeleteSession}>
              {isConfirmingDelete ? (
                <span className="text-xs font-medium">确认删除?</span>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  删除
                </>
              )}
            </span>
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
            <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <p className="text-xs">暂无菜品</p>
              {!isLocked && (
                <Button variant="outline" size="sm" onClick={handleAddDish} className="h-8 text-xs border-dashed">
                  <Plus className="h-3 w-3 mr-1" />
                  添加第一道菜
                </Button>
              )}
            </div>
          )}

          {/* Actions Area */}
          {!isLocked && (
            <div className="p-4 bg-muted/5">
              {session.dishes.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddDish}
                  className="w-full border-dashed h-9 bg-transparent mb-4"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  添加第{session.dishes.length + 1}道菜
                </Button>
              )}

              <div className="pt-3 border-t">
                <Button
                  variant={isConfirmingSubmit ? "destructive" : "default"}
                  size="sm"
                  onClick={handleSubmit}
                  className={cn(
                    "w-full h-9 shadow-sm transition-all",
                    !isConfirmingSubmit && "bg-blue-600 hover:bg-blue-700",
                  )}
                >
                  {isConfirmingSubmit ? (
                    <span className="font-medium">确认提交菜单? (无法撤销)</span>
                  ) : (
                    <>
                      <Save className="h-3 w-3 mr-1" />
                      提交菜单
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

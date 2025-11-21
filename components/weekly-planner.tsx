"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  isSameMonth,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import { DayCard, type DayMenu, type MenuSession } from "@/components/day-card"
import { MenuSessionEditor } from "@/components/menu-session-editor"
import { useIsMobile } from "@/hooks/use-mobile"

// --- Mock Data & Types ---
const CANTEENS = [
  { id: "canteen-a", name: "主食堂" },
  { id: "canteen-b", name: "员工食堂" },
  { id: "canteen-c", name: "行政酒廊" },
]

const MEALS = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
]

// --- Main Component ---
export function WeeklyPlanner() {
  const isMobile = useIsMobile()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<"month" | "week" | "day">("month")
  const [editingSession, setEditingSession] = React.useState<MenuSession | null>(null)
  const [editingDate, setEditingDate] = React.useState<Date | null>(null)

  // Mock Data State
  const [menuData, setMenuData] = React.useState<Record<string, DayMenu>>({})

  // Initialize mock data
  React.useEffect(() => {
    // Generate some initial data
    const today = new Date()
    const key = format(today, "yyyy-MM-dd")
    if (!menuData[key]) {
      setMenuData((prev) => ({
        ...prev,
        [key]: {
          date: today,
          sessions: [],
        },
      }))
    }
  }, [])

  // Helper to get or create day data
  const getDayData = (date: Date): DayMenu => {
    const key = format(date, "yyyy-MM-dd")
    return (
      menuData[key] || {
        date: date,
        sessions: [],
      }
    )
  }

  const updateDayData = (date: Date, updates: Partial<DayMenu>) => {
    const key = format(date, "yyyy-MM-dd")
    setMenuData((prev) => ({
      ...prev,
      [key]: { ...getDayData(date), ...updates },
    }))
  }

  const updateSession = (date: Date, sessionId: string, updates: Partial<MenuSession>) => {
    const dayData = getDayData(date)
    const newSessions = dayData.sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    updateDayData(date, { sessions: newSessions })
  }

  const handleEditSession = (date: Date, session: MenuSession) => {
    setEditingDate(date)
    setEditingSession(session)
  }

  // Navigation Handlers
  const handlePrev = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, -1))
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, -1))
    else setCurrentDate(addMonths(currentDate, -1))
  }

  const handleNext = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, 1))
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  const getDisplayedDays = () => {
    if (viewMode === "day") {
      return [currentDate]
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    }
  }

  const displayedDays = getDisplayedDays()
  const selectedDayData = getDayData(currentDate)

  return (
    <>
      <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-background text-foreground">
        {/* --- Sidebar (Desktop) / Top Bar (Mobile) --- */}
        <div className={cn("border-r bg-secondary/10 flex-col", isMobile ? "flex" : "hidden md:flex w-80")}>
          {/* Sidebar Header / View Switcher */}
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">菜单规划</h1>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="month">月</TabsTrigger>
                <TabsTrigger value="week">周</TabsTrigger>
                <TabsTrigger value="day">日</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Calendar Navigator */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="rounded-xl border bg-card shadow-sm mb-6">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  locale={zhCN}
                  className="w-full"
                />
              </div>

              {/* Info Panel (Bottom Left) */}
              {!isMobile && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {format(currentDate, "M月d日", { locale: zhCN })} 信息
                  </h3>
                  <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">菜单数量</span>
                      <Badge variant="secondary">{selectedDayData.sessions.length} 个</Badge>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {selectedDayData.sessions.map((session) => (
                        <div key={session.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {session.canteenName} - {session.mealName}
                          </span>
                          <Badge variant={session.status === "Published" ? "default" : "secondary"} className="text-xs">
                            {session.status === "Published" ? "已提交" : "草稿"}
                          </Badge>
                        </div>
                      ))}
                      {selectedDayData.sessions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">暂无菜单</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* --- Main Content Area (Right) --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-secondary/30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold">
                {viewMode === "day" && format(currentDate, "yyyy年 M月d日 EEEE", { locale: zhCN })}
                {viewMode === "week" &&
                  `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "M月d日", { locale: zhCN })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "M月d日", { locale: zhCN })}`}
                {viewMode === "month" && format(currentDate, "yyyy年 M月", { locale: zhCN })}
              </h2>
              <div className="flex items-center rounded-md border bg-secondary/50 p-1">
                <Button variant="ghost" size="sm" onClick={handlePrev} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToday} className="h-7 px-3 text-xs font-medium mx-1">
                  今天
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNext} className="h-7 w-7 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Scroll Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
              <div
                className={cn(
                  "grid gap-4",
                  viewMode === "day"
                    ? "grid-cols-1 max-w-3xl mx-auto"
                    : viewMode === "week"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5",
                )}
              >
                {displayedDays.map((date, i) => {
                  const isCurrentMonth = isSameMonth(date, currentDate)
                  if (viewMode === "month" && !isCurrentMonth) return null

                  return (
                    <div key={i} className="flex flex-col gap-2 min-w-0 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isToday(date) ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {format(date, "EEE", { locale: zhCN })}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full",
                            isToday(date) ? "bg-primary text-primary-foreground" : "",
                          )}
                        >
                          {format(date, "d")}
                        </span>
                      </div>
                      <DayCard
                        day={getDayData(date)}
                        canteens={CANTEENS}
                        meals={MEALS}
                        onUpdate={(updates) => updateDayData(date, updates)}
                        onEditSession={(session) => handleEditSession(date, session)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MenuSessionEditor
        session={editingSession}
        date={editingDate || new Date()}
        open={!!editingSession}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSession(null)
            setEditingDate(null)
          }
        }}
        onUpdate={(sessionId, updates) => {
          if (editingDate) {
            updateSession(editingDate, sessionId, updates)
            if (editingSession) {
              setEditingSession({ ...editingSession, ...updates })
            }
          }
        }}
      />
    </>
  )
}

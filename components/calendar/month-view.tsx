"use client"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { cn } from "@/lib/utils"
import { useMenuStore } from "@/lib/store"
import React from "react"
import { CANTEENS, MEAL_TYPES } from "@/types/menu"
import { getLunarDateInfo } from "@/lib/lunar"
import { getMenusByDateRange } from "@/app/actions/menu"
import { MenuSession } from "@/types/menu"

interface MonthViewProps {
  currentDate: Date
  onDateSelect: (date: Date) => void
}

export function MonthView({ currentDate, onDateSelect }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"]

  const setSessions = useMenuStore((state) => state.setSessions)
  const sessions = useMenuStore((state) => state.sessions)

  // Load menus for the visible range
  React.useEffect(() => {
    const loadMonthData = async () => {
      const startStr = format(startDate, "yyyy-MM-dd")
      const endStr = format(endDate, "yyyy-MM-dd")

      const result = await getMenusByDateRange(startStr, endStr)
      if (result.success && result.data) {
        // Convert DB format to store format
        const loadedSessions: MenuSession[] = result.data.map((menu: any) => ({
          id: menu.id,
          date: menu.date,
          canteenId: menu.canteenId,
          mealId: menu.mealId,
          status: menu.status,
          dishes: menu.dishes.map((dish: any) => ({
            id: dish.id,
            name: dish.name,
            plannedServings: dish.plannedServings?.toString() || "",
            chefName: dish.chefName || "",
            ingredients: dish.ingredients.map((di: any) => ({
              id: di.id,
              name: di.ingredient.name,
              quantity: di.quantity.toString(),
              unit: di.unit,
              remark: di.remark || "",
            })),
          })),
        }))

        // Update store with loaded data
        setSessions(loadedSessions)
      }
    }

    loadMonthData()
  }, [currentDate, startDate, endDate, setSessions]) // Re-run when month changes

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
            周{day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 [&>div:nth-child(7n)]:border-r-0">
        {days.map((day) => {
          return <DayCell key={day.toString()} day={day} currentDate={currentDate} onDateSelect={onDateSelect} />
        })}
      </div>
    </div>
  )
}
function DayCell({
  day,
  currentDate,
  onDateSelect,
}: { day: Date; currentDate: Date; onDateSelect: (d: Date) => void }) {
  const isSelected = isSameDay(day, currentDate)
  const isCurrentMonth = isSameMonth(day, currentDate)
  const isDayToday = isToday(day)

  const dateKey = format(day, "yyyy-MM-dd")
  const lunarInfo = getLunarDateInfo(day)

  const allSessions = useMenuStore((state) => state.sessions)
  const sessions = React.useMemo(() => allSessions.filter((s) => s.date === dateKey), [allSessions, dateKey])

  return (
    <div
      onClick={() => onDateSelect(day)}
      className={cn(
        "relative border-b border-r p-1 transition-colors cursor-pointer hover:bg-muted/20 flex flex-col min-h-[80px]",
        !isCurrentMonth && "bg-muted/5 text-muted-foreground/50",
        isSelected && "bg-accent/10",
      )}
    >
      <div className="flex flex-col items-center mb-1">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
            isDayToday && "bg-red-500 text-white",
            isSelected && !isDayToday && "bg-primary text-primary-foreground",
          )}
        >
          {format(day, "d")}
        </span>
        <span
          className={cn(
            "text-[10px] mt-0.5 scale-90 origin-top",
            lunarInfo.isHoliday || lunarInfo.term || lunarInfo.festival
              ? "text-red-500 font-medium"
              : "text-muted-foreground/70",
          )}
        >
          {lunarInfo.displayText}
        </span>
      </div>

      {/* Content Summary */}
      <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
        {sessions.map((session) => {
          const canteen = CANTEENS.find((c) => c.id === session.canteenId)
          const meal = MEAL_TYPES.find((m) => m.id === session.mealId)

          return (
            <div key={session.id} className="flex items-center gap-1 px-1 text-[10px] leading-tight truncate">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  session.status === "submitted" ? "bg-blue-500" : "bg-red-500",
                )}
              />
              <span className="text-muted-foreground truncate">
                {canteen?.name} {meal?.name} {session.dishes.length}道菜
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

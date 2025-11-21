"use client"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useMenuStore } from "@/lib/store"
import { CANTEENS, MEAL_TYPES } from "@/types/menu"
import { getLunarDateInfo } from "@/lib/lunar"
import React from "react"

interface WeekViewProps {
  currentDate: Date
  onDateSelect: (date: Date) => void
}

export function WeekView({ currentDate, onDateSelect }: WeekViewProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-7 border-b flex-shrink-0">
        {days.map((day) => {
          const isSelected = isSameDay(day, currentDate)
          const isDayToday = isToday(day)
          const lunarInfo = getLunarDateInfo(day)
          return (
            <div
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "py-3 text-center border-r last:border-r-0 cursor-pointer hover:bg-muted/20 transition-colors",
                isSelected && "bg-accent/5",
              )}
            >
              <div className="text-xs text-muted-foreground mb-1">{format(day, "EEE", { locale: zhCN })}</div>
              <div
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  isDayToday && "bg-red-500 text-white",
                  isSelected && !isDayToday && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>
              <div
                className={cn(
                  "text-[10px] mt-1",
                  lunarInfo.isHoliday || lunarInfo.term || lunarInfo.festival
                    ? "text-red-500 font-medium"
                    : "text-muted-foreground/70",
                )}
              >
                {lunarInfo.displayText}
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="flex-1 grid grid-cols-7 divide-x overflow-y-auto">
        {days.map((day) => (
          <WeekDayColumn key={day.toString()} day={day} currentDate={currentDate} onDateSelect={onDateSelect} />
        ))}
      </div>
    </div>
  )
}

function WeekDayColumn({
  day,
  currentDate,
  onDateSelect,
}: { day: Date; currentDate: Date; onDateSelect: (d: Date) => void }) {
  const dateKey = format(day, "yyyy-MM-dd")

  const allSessions = useMenuStore((state) => state.sessions)
  const sessions = React.useMemo(() => allSessions.filter((s) => s.date === dateKey), [allSessions, dateKey])

  const isSelected = isSameDay(day, currentDate)

  return (
    <div
      onClick={() => onDateSelect(day)}
      className={cn(
        "h-full p-2 space-y-2 hover:bg-muted/20 transition-colors cursor-pointer",
        isSelected && "bg-accent/5",
      )}
    >
      {sessions.map((session) => {
        const canteenName = CANTEENS.find((c) => c.id === session.canteenId)?.name
        const mealName = MEAL_TYPES.find((m) => m.id === session.mealId)?.name

        return (
          <div
            key={session.id}
            className={cn(
              "p-2 rounded border text-xs shadow-sm",
              session.status === "submitted" ? "bg-green-50/50 border-green-100" : "bg-orange-50/50 border-orange-100",
            )}
          >
            <div className="font-medium truncate">{canteenName}</div>
            <div className="text-muted-foreground truncate">{mealName}</div>
            <div className="mt-1 flex items-center gap-1">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  session.status === "submitted" ? "bg-green-500" : "bg-orange-400",
                )}
              />
              <span>{session.dishes.length}道菜</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

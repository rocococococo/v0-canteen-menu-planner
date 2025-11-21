"use client"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useMenuStore } from "@/lib/store"
import { CANTEENS, MEAL_TYPES } from "@/types/menu"
import { Badge } from "@/components/ui/badge"
import { ChefHat } from "lucide-react"
import { getLunarDateInfo } from "@/lib/lunar"
import { cn } from "@/lib/utils"
import React from "react"

interface DayViewProps {
  currentDate: Date
}

export function DayView({ currentDate }: DayViewProps) {
  const dateKey = format(currentDate, "yyyy-MM-dd")
  const lunarInfo = getLunarDateInfo(currentDate)

  const allSessions = useMenuStore((state) => state.sessions)
  const sessions = React.useMemo(() => allSessions.filter((s) => s.date === dateKey), [allSessions, dateKey])

  return (
    <div className="h-full p-6 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold">{format(currentDate, "yyyy年MM月dd日", { locale: zhCN })}</h2>
          <p className="text-muted-foreground">{format(currentDate, "EEEE", { locale: zhCN })}</p>
          <p
            className={cn(
              "text-sm mt-1",
              lunarInfo.isHoliday || lunarInfo.term || lunarInfo.festival
                ? "text-red-500 font-medium"
                : "text-muted-foreground",
            )}
          >
            {lunarInfo.displayText}
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">今日暂无排菜记录</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session) => (
              <DayViewSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DayViewSessionCard({ session }: { session: any }) {
  const canteenName = CANTEENS.find((c) => c.id === session.canteenId)?.name
  const mealName = MEAL_TYPES.find((m) => m.id === session.mealId)?.name

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">{canteenName}</span>
          <Badge variant="outline">{mealName}</Badge>
        </div>
        <Badge variant={session.status === "submitted" ? "default" : "secondary"}>
          {session.status === "submitted" ? "已提交" : "草稿"}
        </Badge>
      </div>

      <div className="space-y-3">
        {session.dishes.map((dish: any) => (
          <div key={dish.id} className="flex items-start justify-between p-2 bg-muted/30 rounded">
            <div>
              <div className="font-medium">{dish.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {dish.ingredients.map((ing: any) => `${ing.name}${ing.quantity}${ing.unit}`).join("、") || "无原料信息"}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{dish.plannedServings} 份</div>
              <div className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                <ChefHat className="h-3 w-3" />
                {dish.chefName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

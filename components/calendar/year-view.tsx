"use client"
import { cn } from "@/lib/utils"

interface YearViewProps {
  currentDate: Date
  onSelectMonth: (date: Date) => void
}

export function YearView({ currentDate, onSelectMonth }: YearViewProps) {
  const year = currentDate.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
  const today = new Date()

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-x-8 gap-y-8 max-w-5xl mx-auto">
        {months.map((monthDate) => (
          <div
            key={monthDate.getMonth()}
            onClick={() => onSelectMonth(monthDate)}
            className="cursor-pointer hover:opacity-70 transition-opacity"
          >
            <div className="text-red-500 font-semibold text-lg mb-2 ml-1">{monthDate.getMonth() + 1}月</div>
            <div className="grid grid-cols-7 gap-y-2 text-[10px] text-gray-400 mb-2">
              {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                <div key={d} className="text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-[10px]">
              {generateMonthGrid(monthDate).map((date, i) => {
                if (!date) return <div key={i} />

                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()

                return (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded-full font-medium",
                      isToday ? "bg-red-500 text-white" : "text-gray-900",
                    )}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function generateMonthGrid(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 0 is Sunday, but we want Monday as 0 (so 1->0, 2->1, ... 0->6)
  let startDay = firstDay.getDay() - 1
  if (startDay === -1) startDay = 6

  const days: (Date | null)[] = []

  // Empty slots for days before start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }

  // Days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  return days
}

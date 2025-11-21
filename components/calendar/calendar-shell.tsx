"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Search, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { YearView } from "@/components/calendar/year-view"
import { Inspector } from "@/components/calendar/inspector"

type ViewMode = "day" | "week" | "month" | "year"

interface CalendarShellProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function CalendarShell({ currentDate, onDateChange }: CalendarShellProps) {
  const [view, setView] = React.useState<ViewMode>("month")
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  const handlePrev = () => {
    const newDate = new Date(currentDate)
    if (view === "year") newDate.setFullYear(newDate.getFullYear() - 1)
    else if (view === "month") newDate.setMonth(newDate.getMonth() - 1)
    else if (view === "week") newDate.setDate(newDate.getDate() - 7)
    else newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (view === "year") newDate.setFullYear(newDate.getFullYear() + 1)
    else if (view === "month") newDate.setMonth(newDate.getMonth() + 1)
    else if (view === "week") newDate.setDate(newDate.getDate() + 7)
    else newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const headerDate = currentDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: view === "year" ? undefined : "long",
    day: view === "day" ? "numeric" : undefined,
  })

  return (
    <div className="flex h-screen w-full flex-col bg-white text-[#1d1d1f] md:flex-row overflow-hidden font-sans">
      <div className="flex flex-[2] flex-col min-w-0 bg-white border-r border-gray-200">
        <header className="hidden md:flex items-center justify-between px-4 py-3 border-b h-[52px]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold min-w-[140px]">{headerDate}</h1>
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-2 py-1 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
              >
                今天
              </button>
              <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#e5e5e5] p-0.5 rounded-lg">
              {(["day", "week", "month", "year"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-all",
                    view === v ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black",
                  )}
                >
                  {v === "day" && "日"}
                  {v === "week" && "周"}
                  {v === "month" && "月"}
                  {v === "year" && "年"}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <div className="flex items-center relative">
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out flex items-center",
                  isSearchOpen ? "w-48 opacity-100 mr-2" : "w-0 opacity-0",
                )}
              >
                <input
                  type="text"
                  placeholder="搜索..."
                  className="w-full h-7 px-2 text-sm bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  "p-1.5 hover:bg-gray-100 rounded-md transition-colors",
                  isSearchOpen && "bg-gray-100 text-black",
                )}
              >
                <Search className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </header>

        <header className="md:hidden flex items-center justify-between px-4 py-2 border-b bg-[#f5f5f7]">
          <div className="flex items-center gap-1 text-red-500">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-base">2025年</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView(view === "month" ? "day" : "month")}>
              <List className="w-5 h-5 text-red-500" />
            </button>
            <Search className="w-5 h-5 text-red-500" />
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          {view === "year" && (
            <YearView
              currentDate={currentDate}
              onSelectMonth={(date) => {
                onDateChange(date)
                setView("month")
              }}
            />
          )}
          {view === "month" && <MonthView currentDate={currentDate} onDateSelect={onDateChange} />}
          {view === "week" && <WeekView currentDate={currentDate} onDateSelect={onDateChange} />}
          {view === "day" && <DayView currentDate={currentDate} />}
        </main>

        <div className="md:hidden border-t bg-[#f5f5f7] px-4 py-2 flex justify-between items-center text-red-500 text-sm font-medium pb-safe">
          <div className="flex flex-col items-center gap-1 opacity-50">
            <span className="text-xs">今天</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs">日历</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-50">
            <span className="text-xs">收件箱</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-white flex-shrink-0 overflow-y-auto border-l border-gray-200">
        <Inspector currentDate={currentDate} />
      </div>
    </div>
  )
}

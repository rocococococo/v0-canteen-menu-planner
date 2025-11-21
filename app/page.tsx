"use client"

import * as React from "react"
import { CalendarShell } from "@/components/calendar/calendar-shell"
import { startOfToday } from "date-fns"

export default function Page() {
  const [currentDate, setCurrentDate] = React.useState<Date>(startOfToday())

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Right Side: Calendar View with integrated Inspector */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
        <CalendarShell currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>
    </div>
  )
}

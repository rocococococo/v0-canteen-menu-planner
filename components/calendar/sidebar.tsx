import { ChevronLeft, ChevronRight } from "lucide-react"

export function Sidebar() {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="font-semibold text-sm">2025年 11月</span>
          <div className="flex gap-2 text-gray-400">
            <button className="hover:text-gray-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="hover:text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-3 text-center text-xs mb-2 text-gray-400 font-medium">
          <div>一</div>
          <div>二</div>
          <div>三</div>
          <div>四</div>
          <div>五</div>
          <div>六</div>
          <div>日</div>
        </div>
        <div className="grid grid-cols-7 gap-y-3 text-center text-sm">
          {/* Mock days */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 mx-auto flex items-center justify-center rounded-full cursor-pointer transition-colors ${
                i === 20 ? "bg-red-500 text-white" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200 my-2" />

      {/* Filters / Calendars */}
      <div className="flex-1 overflow-y-auto py-2 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">食堂</span>
          </div>
          <div className="space-y-1">
            {["一食堂", "二食堂", "教工餐厅"].map((canteen, i) => (
              <div
                key={canteen}
                className="flex items-center gap-2 text-sm py-1 px-1 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded-full text-red-500 focus:ring-0 border-gray-300"
                />
                <span className={`w-2.5 h-2.5 rounded-full ${["bg-orange-400", "bg-purple-400", "bg-blue-400"][i]}`} />
                <span>{canteen}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">餐别</span>
          </div>
          <div className="space-y-1">
            {["早餐", "午餐", "晚餐"].map((meal) => (
              <div
                key={meal}
                className="flex items-center gap-2 text-sm py-1 px-1 hover:bg-gray-100 rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded-full text-red-500 focus:ring-0 border-gray-300"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span>{meal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

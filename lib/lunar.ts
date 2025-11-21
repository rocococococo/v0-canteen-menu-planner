import { Lunar, Solar } from "lunar-typescript"

export interface LunarDateInfo {
    lunarDay: string
    lunarMonth: string
    term: string | null
    festival: string | null
    displayText: string
    isHoliday: boolean
}

export function getLunarDateInfo(date: Date): LunarDateInfo {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()

    const lunarDay = lunar.getDayInChinese()
    const lunarMonth = lunar.getMonthInChinese() + "月"
    const term = lunar.getJieQi()

    // Get festivals
    // Priority: Official Holiday > Traditional Festival > Solar Term > Lunar Day
    let festival = null
    let isHoliday = false

    // Check for official holidays (simplified logic, can be expanded)
    const festivals = lunar.getFestivals()
    const solarFestivals = solar.getFestivals()

    if (festivals.length > 0) {
        festival = festivals[0]
        isHoliday = true
    } else if (solarFestivals.length > 0) {
        festival = solarFestivals[0]
        isHoliday = true
    }

    // Determine display text
    let displayText = lunarDay

    if (festival) {
        displayText = festival
    } else if (term) {
        displayText = term
    } else if (lunar.getDay() === 1) {
        displayText = lunarMonth
    }

    return {
        lunarDay,
        lunarMonth,
        term: term || null,
        festival: festival || null,
        displayText,
        isHoliday
    }
}

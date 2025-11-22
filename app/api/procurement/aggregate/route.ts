import { NextRequest, NextResponse } from "next/server"
import { aggregateIngredientsByDate } from "@/lib/procurement"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const date = searchParams.get("date")

        if (!date) {
            return NextResponse.json(
                { error: "Date parameter is required" },
                { status: 400 }
            )
        }

        const aggregated = await aggregateIngredientsByDate(date)
        return NextResponse.json(aggregated)
    } catch (error) {
        console.error("Error aggregating ingredients:", error)
        return NextResponse.json(
            { error: "Failed to aggregate ingredients" },
            { status: 500 }
        )
    }
}

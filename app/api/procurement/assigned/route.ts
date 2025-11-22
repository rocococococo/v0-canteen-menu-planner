import { NextRequest, NextResponse } from "next/server"
import { getAssignedIngredientIds } from "@/lib/procurement"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const targetDate = searchParams.get("targetDate")

        if (!targetDate) {
            return NextResponse.json(
                { error: "targetDate parameter is required" },
                { status: 400 }
            )
        }

        const assignedIds = await getAssignedIngredientIds(targetDate)
        // Convert Set to Array for JSON serialization
        return NextResponse.json(Array.from(assignedIds))
    } catch (error) {
        console.error("Error fetching assigned ingredient IDs:", error)
        return NextResponse.json(
            { error: "Failed to fetch assigned ingredient IDs" },
            { status: 500 }
        )
    }
}

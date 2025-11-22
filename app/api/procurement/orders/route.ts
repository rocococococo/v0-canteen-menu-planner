import { NextRequest, NextResponse } from "next/server"
import { getPurchaseOrdersByTargetDate } from "@/lib/procurement"

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

        const orders = await getPurchaseOrdersByTargetDate(targetDate)
        return NextResponse.json(orders)
    } catch (error) {
        console.error("Error fetching purchase orders:", error)
        return NextResponse.json(
            { error: "Failed to fetch purchase orders" },
            { status: 500 }
        )
    }
}

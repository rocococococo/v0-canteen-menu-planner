"use server"
import "server-only"

import {
    type AggregatedIngredient,
    aggregateIngredientsByDate,
    getAssignedIngredientIds,
    getPurchaseOrdersByTargetDate,
} from "@/lib/procurement"

export type ProcurementData = {
    aggregatedIngredients: AggregatedIngredient[]
    purchaseOrders: Awaited<ReturnType<typeof getPurchaseOrdersByTargetDate>>
    assignedIds: string[]
}

export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string }

/**
 * Server Action: 获取采购模式所需的所有数据
 * 保持在 server-only 侧执行，防止 Prisma/Node 依赖落入客户端 Bundle。
 */
export async function getProcurementData(targetDate: string): Promise<ActionResult<ProcurementData>> {
    if (!targetDate) {
        return { success: false, error: "目标日期不能为空" }
    }

    try {
        const [aggregatedIngredients, purchaseOrders, assignedIdsSet] = await Promise.all([
            aggregateIngredientsByDate(targetDate),
            getPurchaseOrdersByTargetDate(targetDate),
            getAssignedIngredientIds(targetDate),
        ])

        return {
            success: true,
            data: {
                aggregatedIngredients,
                purchaseOrders,
                assignedIds: Array.from(assignedIdsSet),
            },
        }
    } catch (error) {
        console.error(`[getProcurementData] failed for ${targetDate}`, error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to load procurement data",
        }
    }
}

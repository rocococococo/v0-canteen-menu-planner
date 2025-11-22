import prisma from "./prisma"

/**
 * 原料汇总结果
 */
export interface AggregatedIngredient {
    ingredientId: string
    ingredientName: string
    totalQuantity: number
    unit: string
    // 可选：记录来源菜品，便于追溯
    sources?: Array<{
        dishName: string
        menuId: string
        quantity: number
    }>
}

/**
 * 汇总指定日期的原料需求
 * @param targetDate 目标日期 (YYYY-MM-DD)
 * @returns 汇总后的原料列表
 */
export async function aggregateIngredientsByDate(
    targetDate: string
): Promise<AggregatedIngredient[]> {
    // 1. 获取该日期所有已提交的菜单
    const menus = await prisma.menu.findMany({
        where: {
            date: targetDate,
            status: "submitted", // 只统计已提交的菜单
        },
        include: {
            dishes: {
                include: {
                    ingredients: {
                        include: {
                            ingredient: true,
                        },
                    },
                },
            },
        },
    })

    // 2. 汇总原料
    const ingredientMap = new Map<string, AggregatedIngredient>()

    for (const menu of menus) {
        for (const dish of menu.dishes) {
            for (const dishIngredient of dish.ingredients) {
                const { ingredientId, quantity, unit } = dishIngredient
                const ingredientName = dishIngredient.ingredient.name

                if (!ingredientMap.has(ingredientId)) {
                    ingredientMap.set(ingredientId, {
                        ingredientId,
                        ingredientName,
                        totalQuantity: 0,
                        unit,
                        sources: [],
                    })
                }

                const aggregated = ingredientMap.get(ingredientId)!
                aggregated.totalQuantity += quantity
                aggregated.sources?.push({
                    dishName: dish.name,
                    menuId: menu.id,
                    quantity,
                })
            }
        }
    }

    return Array.from(ingredientMap.values())
}

/**
 * 创建采购单
 * @param targetDate 目标日期 (菜单日期)
 * @param supplierId 供应商ID
 * @param ingredients 要采购的原料列表 (包含 ingredientId, quantity, unit)
 * @returns 创建的采购单
 */
export async function createPurchaseOrder(
    targetDate: string,
    supplierId: string,
    ingredients: Array<{
        ingredientId: string
        quantity: number
        unit: string
        remark?: string
    }>
) {
    // 采购日期默认为当前日期
    const procurementDate = new Date().toISOString().split("T")[0]

    const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
            date: procurementDate,
            targetDate,
            supplierId,
            status: "draft",
            items: {
                create: ingredients.map((ing) => ({
                    ingredientId: ing.ingredientId,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    remark: ing.remark,
                })),
            },
        },
        include: {
            items: {
                include: {
                    ingredient: true,
                },
            },
            supplier: true,
        },
    })

    return purchaseOrder
}

/**
 * 获取指定日期的所有采购单
 * @param targetDate 目标日期
 * @returns 采购单列表
 */
export async function getPurchaseOrdersByTargetDate(targetDate: string) {
    return prisma.purchaseOrder.findMany({
        where: {
            targetDate,
        },
        include: {
            items: {
                include: {
                    ingredient: true,
                },
            },
            supplier: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    })
}

/**
 * 获取已分配的原料ID列表（用于过滤"待办池"）
 * @param targetDate 目标日期
 * @returns 已分配的原料ID集合
 */
export async function getAssignedIngredientIds(
    targetDate: string
): Promise<Set<string>> {
    const orders = await getPurchaseOrdersByTargetDate(targetDate)
    const assignedIds = new Set<string>()

    for (const order of orders) {
        for (const item of order.items) {
            assignedIds.add(item.ingredientId)
        }
    }

    return assignedIds
}

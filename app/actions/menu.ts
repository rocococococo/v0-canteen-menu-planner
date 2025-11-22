'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * 保存或更新菜单到数据库
 */
export async function saveMenu(menuData: {
    date: string
    canteenId: string
    mealId: string
    status: string
    dishes: Array<{
        name: string
        plannedServings: number | null
        chefName: string | null
        ingredients: Array<{
            ingredientId: string
            ingredientName: string
            quantity: number
            unit: string
            remark?: string
        }>
    }>
}) {
    try {
        // 使用 upsert 处理创建/更新
        const menu = await prisma.menu.upsert({
            where: {
                date_canteenId_mealId: {
                    date: menuData.date,
                    canteenId: menuData.canteenId,
                    mealId: menuData.mealId,
                },
            },
            update: {
                status: menuData.status,
                dishes: {
                    // 删除旧菜品，创建新菜品
                    deleteMany: {},
                    create: menuData.dishes.map((dish) => ({
                        name: dish.name,
                        plannedServings: dish.plannedServings,
                        chefName: dish.chefName,
                        ingredients: {
                            create: dish.ingredients.map((ing) => ({
                                quantity: ing.quantity,
                                unit: ing.unit,
                                remark: ing.remark,
                                ingredient: {
                                    connectOrCreate: {
                                        where: { name: ing.ingredientName },
                                        create: {
                                            name: ing.ingredientName,
                                            unit: ing.unit,
                                        },
                                    },
                                },
                            })),
                        },
                    })),
                },
            },
            create: {
                date: menuData.date,
                canteenId: menuData.canteenId,
                mealId: menuData.mealId,
                status: menuData.status,
                dishes: {
                    create: menuData.dishes.map((dish) => ({
                        name: dish.name,
                        plannedServings: dish.plannedServings,
                        chefName: dish.chefName,
                        ingredients: {
                            create: dish.ingredients.map((ing) => ({
                                quantity: ing.quantity,
                                unit: ing.unit,
                                remark: ing.remark,
                                ingredient: {
                                    connectOrCreate: {
                                        where: { name: ing.ingredientName },
                                        create: {
                                            name: ing.ingredientName,
                                            unit: ing.unit,
                                        },
                                    },
                                },
                            })),
                        },
                    })),
                },
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

        revalidatePath('/')

        return {
            success: true,
            data: menu,
        }
    } catch (error) {
        console.error('saveMenu error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save menu',
        }
    }
}

/**
 * 获取指定日期的所有菜单
 */
export async function getMenusByDate(date: string) {
    try {
        const menus = await prisma.menu.findMany({
            where: { date },
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
            orderBy: {
                createdAt: 'asc',
            },
        })

        return {
            success: true,
            data: menus,
        }
    } catch (error) {
        console.error('getMenusByDate error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get menus',
        }
    }
}

/**
 * 删除菜单
 */
export async function deleteMenu(date: string, canteenId: string, mealId: string) {
    try {
        await prisma.menu.delete({
            where: {
                date_canteenId_mealId: {
                    date,
                    canteenId,
                    mealId,
                },
            },
        })

        revalidatePath('/')

        return {
            success: true,
        }
    } catch (error) {
        console.error('deleteMenu error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete menu',
        }
    }
}

/**
 * 获取日期范围内的所有菜单
 */
export async function getMenusByDateRange(startDate: string, endDate: string) {
    try {
        const menus = await prisma.menu.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
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
            orderBy: {
                date: 'asc',
            },
        })

        return {
            success: true,
            data: menus,
        }
    } catch (error) {
        console.error('getMenusByDateRange error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get menus by range',
        }
    }
}

/**
 * 获取日期范围内的菜单统计（用于日历视图）
 */
export async function getMenuStats(startDate: string, endDate: string) {
    try {
        const menus = await prisma.menu.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                date: true,
                status: true,
                canteenId: true,
                mealId: true,
            },
        })

        // 按日期分组统计
        const stats = menus.reduce((acc, menu) => {
            if (!acc[menu.date]) {
                acc[menu.date] = { total: 0, draft: 0, submitted: 0 }
            }
            acc[menu.date].total++
            if (menu.status === 'draft') {
                acc[menu.date].draft++
            } else if (menu.status === 'submitted') {
                acc[menu.date].submitted++
            }
            return acc
        }, {} as Record<string, { total: number; draft: number; submitted: number }>)

        return {
            success: true,
            data: stats,
        }
    } catch (error) {
        console.error('getMenuStats error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get menu stats',
        }
    }
}

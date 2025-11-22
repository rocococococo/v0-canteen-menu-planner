// Test script to verify procurement data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testProcurementData() {
    console.log('Testing Procurement Data Flow...\n')

    // 1. Check if there are submitted menus
    const menus = await prisma.menu.findMany({
        where: { status: 'submitted' },
        include: {
            dishes: {
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            }
        }
    })

    console.log(`✓ Found ${menus.length} submitted menus`)

    if (menus.length === 0) {
        console.log('⚠ WARNING: No submitted menus found!')
        console.log('  The procurement mode will show "该日期没有已提交的菜单"')
        return
    }

    // 2. Aggregate ingredients
    const ingredientMap = new Map()

    for (const menu of menus) {
        console.log(`\n- Menu Date: ${menu.date}`)
        for (const dish of menu.dishes) {
            console.log(`  - Dish: ${dish.name}`)
            for (const dishIng of dish.ingredients) {
                const { ingredientId, quantity, unit } = dishIng
                const name = dishIng.ingredient.name

                if (!ingredientMap.has(ingredientId)) {
                    ingredientMap.set(ingredientId, {
                        ingredientId,
                        ingredientName: name,
                        totalQuantity: 0,
                        unit
                    })
                }

                const aggregated = ingredientMap.get(ingredientId)
                aggregated.totalQuantity += quantity

                console.log(`    - ${name}: ${quantity} ${unit}`)
            }
        }
    }

    console.log(`\n✓ Aggregated ${ingredientMap.size} unique ingredients`)
    console.log('\nIngredients List:')
    for (const ing of ingredientMap.values()) {
        console.log(`  - ${ing.ingredientName}: ${ing.totalQuantity} ${ing.unit}`)
    }

    await prisma.$disconnect()
}

testProcurementData().catch(console.error)

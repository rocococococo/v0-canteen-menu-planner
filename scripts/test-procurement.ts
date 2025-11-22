/**
 * 测试脚本:验证原料汇总逻辑
 * 
 * 运行方式:
 * npx tsx scripts/test-procurement.ts
 */

import prisma from "../lib/prisma"
import { aggregateIngredientsByDate, createPurchaseOrder } from "../lib/procurement"


async function main() {
    console.log("🧪 开始测试采购汇总逻辑...\n")

    // 1. 创建测试供应商
    console.log("1️⃣ 创建测试供应商...")
    const supplier = await prisma.supplier.upsert({
        where: { id: "test-supplier-001" },
        update: {},
        create: {
            id: "test-supplier-001",
            name: "测试供应商A",
            contact: "张三",
            phone: "13800138000",
        },
    })
    console.log(`   ✅ 供应商创建成功: ${supplier.name}\n`)

    // 2. 创建测试原料
    console.log("2️⃣ 创建测试原料...")
    const potato = await prisma.ingredient.upsert({
        where: { name: "土豆" },
        update: {},
        create: { name: "土豆", unit: "千克" },
    })
    const tomato = await prisma.ingredient.upsert({
        where: { name: "西红柿" },
        update: {},
        create: { name: "西红柿", unit: "千克" },
    })
    console.log(`   ✅ 原料创建成功: ${potato.name}, ${tomato.name}\n`)

    // 3. 创建测试菜单（明天的日期）
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const targetDate = tomorrow.toISOString().split("T")[0]

    console.log(`3️⃣ 创建测试菜单 (日期: ${targetDate})...`)

    // 清理旧数据
    await prisma.menu.deleteMany({
        where: { date: targetDate },
    })

    // 创建午餐菜单
    const lunchMenu = await prisma.menu.create({
        data: {
            date: targetDate,
            canteenId: "canteen-1",
            mealId: "lunch",
            status: "submitted",
            dishes: {
                create: [
                    {
                        name: "土豆炖牛肉",
                        plannedServings: 100,
                        ingredients: {
                            create: [
                                {
                                    ingredientId: potato.id,
                                    quantity: 10,
                                    unit: "千克",
                                },
                                {
                                    ingredientId: tomato.id,
                                    quantity: 5,
                                    unit: "千克",
                                },
                            ],
                        },
                    },
                ],
            },
        },
    })

    // 创建晚餐菜单
    const dinnerMenu = await prisma.menu.create({
        data: {
            date: targetDate,
            canteenId: "canteen-1",
            mealId: "dinner",
            status: "submitted",
            dishes: {
                create: [
                    {
                        name: "酸辣土豆丝",
                        plannedServings: 80,
                        ingredients: {
                            create: [
                                {
                                    ingredientId: potato.id,
                                    quantity: 8,
                                    unit: "千克",
                                },
                            ],
                        },
                    },
                    {
                        name: "番茄炒蛋",
                        plannedServings: 90,
                        ingredients: {
                            create: [
                                {
                                    ingredientId: tomato.id,
                                    quantity: 6,
                                    unit: "千克",
                                },
                            ],
                        },
                    },
                ],
            },
        },
    })

    console.log(`   ✅ 菜单创建成功: 午餐 + 晚餐\n`)

    // 4. 测试汇总逻辑
    console.log("4️⃣ 测试原料汇总...")
    const aggregated = await aggregateIngredientsByDate(targetDate)

    console.log(`   📊 汇总结果 (共 ${aggregated.length} 种原料):\n`)
    for (const item of aggregated) {
        console.log(`   - ${item.ingredientName}: ${item.totalQuantity} ${item.unit}`)
        if (item.sources) {
            for (const source of item.sources) {
                console.log(`     └─ ${source.dishName}: ${source.quantity} ${item.unit}`)
            }
        }
    }
    console.log()

    // 5. 测试创建采购单
    console.log("5️⃣ 测试创建采购单...")
    const purchaseOrder = await createPurchaseOrder(
        targetDate,
        supplier.id,
        aggregated.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.totalQuantity,
            unit: item.unit,
        }))
    )

    console.log(`   ✅ 采购单创建成功!`)
    console.log(`   📝 采购单ID: ${purchaseOrder.id}`)
    console.log(`   🏢 供应商: ${purchaseOrder.supplier.name}`)
    console.log(`   📅 目标日期: ${purchaseOrder.targetDate}`)
    console.log(`   📦 采购项目数: ${purchaseOrder.items.length}\n`)

    console.log("✨ 测试完成！所有功能正常运行。\n")
}

main()
    .catch((e) => {
        console.error("❌ 测试失败:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

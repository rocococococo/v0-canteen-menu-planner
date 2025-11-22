import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

async function main() {
    console.log('Start seeding...');

    // 1. Create/Update Ingredients (Master Data)
    const ingredientsData = [
        { name: '西红柿', unit: '个' },
        { name: '鸡蛋', unit: '个' },
        { name: '鸡肉', unit: 'g' },
        { name: '花生', unit: 'g' },
        { name: '辣椒', unit: '个' },
        { name: '土豆', unit: '个' },
        { name: '牛腩', unit: 'g' },
        { name: '青菜', unit: 'g' },
        { name: '五花肉', unit: 'g' },
        { name: '豆腐', unit: '块' },
        { name: '茄子', unit: '个' },
        { name: '豆角', unit: 'g' },
        { name: '排骨', unit: 'g' },
        { name: '鸭肉', unit: 'g' },
        { name: '酸菜', unit: 'g' },
        { name: '鱼', unit: '条' },
        { name: '青椒', unit: '个' },
        { name: '胡萝卜', unit: '根' },
        { name: '木耳', unit: 'g' },
        { name: '西兰花', unit: '朵' },
        { name: '米饭', unit: '碗' },
        { name: '火腿', unit: 'g' },
        { name: '虾仁', unit: 'g' },
    ];

    const ingredientMap = new Map<string, string>();

    for (const ing of ingredientsData) {
        const ingredient = await prisma.ingredient.upsert({
            where: { name: ing.name },
            update: {},
            create: ing,
        });
        ingredientMap.set(ing.name, ingredient.id);
    }
    console.log(`Upserted ${ingredientsData.length} ingredients.`);

    // 2. Create/Update Menu
    const menuDate = '2025-01-01';
    const canteenId = 'canteen-1';
    const mealId = 'lunch';

    const menu = await prisma.menu.upsert({
        where: {
            date_canteenId_mealId: {
                date: menuDate,
                canteenId: canteenId,
                mealId: mealId,
            },
        },
        update: {},
        create: {
            date: menuDate,
            canteenId: canteenId,
            mealId: mealId,
            status: 'draft',
        },
    });
    console.log(`Upserted menu for ${menuDate}.`);

    // 3. Define Dishes
    const dishesData = [
        {
            name: '西红柿炒蛋',
            chefName: 'Chef Wang',
            ingredients: [
                { name: '西红柿', quantity: 2, unit: '个' },
                { name: '鸡蛋', quantity: 3, unit: '个' },
            ],
        },
        {
            name: '宫保鸡丁',
            chefName: 'Chef Li',
            ingredients: [
                { name: '鸡肉', quantity: 300, unit: 'g' },
                { name: '花生', quantity: 50, unit: 'g' },
                { name: '辣椒', quantity: 5, unit: '个' },
            ],
        },
        {
            name: '土豆牛腩',
            chefName: 'Chef Zhang',
            ingredients: [
                { name: '土豆', quantity: 2, unit: '个' },
                { name: '牛腩', quantity: 500, unit: 'g' },
            ],
        },
        {
            name: '清炒时蔬',
            chefName: 'Chef Wang',
            ingredients: [
                { name: '青菜', quantity: 400, unit: 'g' },
            ],
        },
        {
            name: '红烧肉',
            chefName: 'Chef Li',
            ingredients: [
                { name: '五花肉', quantity: 500, unit: 'g' },
            ],
        },
        {
            name: '麻婆豆腐',
            chefName: 'Chef Chen',
            ingredients: [
                { name: '豆腐', quantity: 2, unit: '块' },
                { name: '辣椒', quantity: 3, unit: '个' },
            ],
        },
        {
            name: '红烧茄子',
            chefName: 'Chef Wang',
            ingredients: [
                { name: '茄子', quantity: 2, unit: '个' },
            ],
        },
        {
            name: '干煸豆角',
            chefName: 'Chef Li',
            ingredients: [
                { name: '豆角', quantity: 300, unit: 'g' },
                { name: '辣椒', quantity: 4, unit: '个' },
            ],
        },
        {
            name: '糖醋排骨',
            chefName: 'Chef Zhang',
            ingredients: [
                { name: '排骨', quantity: 500, unit: 'g' },
            ],
        },
        {
            name: '啤酒鸭',
            chefName: 'Chef Zhao',
            ingredients: [
                { name: '鸭肉', quantity: 600, unit: 'g' },
            ],
        },
        {
            name: '酸菜鱼',
            chefName: 'Chef Liu',
            ingredients: [
                { name: '酸菜', quantity: 200, unit: 'g' },
                { name: '鱼', quantity: 1, unit: '条' },
            ],
        },
        {
            name: '地三鲜',
            chefName: 'Chef Wang',
            ingredients: [
                { name: '土豆', quantity: 1, unit: '个' },
                { name: '茄子', quantity: 1, unit: '个' },
                { name: '青椒', quantity: 2, unit: '个' },
            ],
        },
        {
            name: '鱼香肉丝',
            chefName: 'Chef Li',
            ingredients: [
                { name: '五花肉', quantity: 200, unit: 'g' }, // Using pork belly as generic pork
                { name: '木耳', quantity: 50, unit: 'g' },
                { name: '胡萝卜', quantity: 1, unit: '根' },
            ],
        },
        {
            name: '蒜蓉西兰花',
            chefName: 'Chef Zhang',
            ingredients: [
                { name: '西兰花', quantity: 1, unit: '朵' },
            ],
        },
        {
            name: '扬州炒饭',
            chefName: 'Chef Chen',
            ingredients: [
                { name: '米饭', quantity: 2, unit: '碗' },
                { name: '鸡蛋', quantity: 2, unit: '个' },
                { name: '火腿', quantity: 50, unit: 'g' },
                { name: '虾仁', quantity: 50, unit: 'g' },
            ],
        },
    ];

    let dishCount = 0;

    for (const dishData of dishesData) {
        // Find existing dish on this menu
        let dish = await prisma.dish.findFirst({
            where: {
                name: dishData.name,
                menuId: menu.id,
            },
        });

        if (!dish) {
            dish = await prisma.dish.create({
                data: {
                    name: dishData.name,
                    chefName: dishData.chefName,
                    menuId: menu.id,
                    plannedServings: 50, // Default value
                },
            });
        } else {
            // Update basic info if needed
            dish = await prisma.dish.update({
                where: { id: dish.id },
                data: {
                    chefName: dishData.chefName,
                }
            });
        }

        // Sync Ingredients
        // First, delete existing relations for this dish to ensure clean slate
        await prisma.dishIngredient.deleteMany({
            where: { dishId: dish.id },
        });

        // Create new relations
        for (const ingRef of dishData.ingredients) {
            const ingId = ingredientMap.get(ingRef.name);
            if (ingId) {
                await prisma.dishIngredient.create({
                    data: {
                        dishId: dish.id,
                        ingredientId: ingId,
                        quantity: ingRef.quantity,
                        unit: ingRef.unit,
                    },
                });
            } else {
                console.warn(`Ingredient not found: ${ingRef.name}`);
            }
        }
        dishCount++;
    }

    console.log(`数据填充完毕，已写入 ${dishCount} 道菜品`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

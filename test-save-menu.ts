
import { saveMenu } from './app/actions/menu';

async function testSaveMenu() {
    console.log('Testing saveMenu Server Action...');

    const testMenu = {
        date: '2025-11-22',
        canteenId: 'canteen-1',
        mealId: 'dinner', // Use a different meal to avoid conflict if possible, or just test upsert
        status: 'draft',
        dishes: [
            {
                name: 'Test Dish 1',
                plannedServings: 100,
                chefName: 'Test Chef',
                ingredients: [
                    {
                        ingredientId: 'ing-1', // Assuming this might be generated or looked up
                        ingredientName: 'Test Ingredient',
                        quantity: 10,
                        unit: 'kg',
                        remark: 'Test remark'
                    }
                ]
            }
        ]
    };

    try {
        const result = await saveMenu(testMenu);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error calling saveMenu:', error);
    }
}

testSaveMenu();


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanTestData() {
    console.log('Cleaning up test data...')

    try {
        // Delete dishes with "Test Dish" in name
        const deletedDishes = await prisma.dish.deleteMany({
            where: {
                name: {
                    contains: 'Test Dish'
                }
            }
        })
        console.log(`Deleted ${deletedDishes.count} test dishes`)

        // Delete ingredients with "Test Ingredient" in name
        const deletedIngredients = await prisma.ingredient.deleteMany({
            where: {
                name: {
                    contains: 'Test Ingredient'
                }
            }
        })
        console.log(`Deleted ${deletedIngredients.count} test ingredients`)

    } catch (error) {
        console.error('Error cleaning data:', error)
    } finally {
        await prisma.$disconnect()
    }
}

cleanTestData()

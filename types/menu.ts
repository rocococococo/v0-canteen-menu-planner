export type Unit = "kg" | "g" | "L" | "ml" | "个" | "包" | "箱" | "自定义"

export interface Ingredient {
  id: string
  name: string
  quantity: string
  unit: string
  remark?: string // Changed from remarks to remark to match user request
}

export interface Dish {
  id: string
  name: string
  plannedServings: string
  chefName: string
  ingredients: Ingredient[]
  remarks?: string
}

export interface MenuSession {
  id: string
  date: string // YYYY-MM-DD
  canteenId: string
  mealId: string
  status: "draft" | "submitted"
  dishes: Dish[]
}

export const CANTEENS = [
  { id: "canteen-1", name: "第一食堂" },
  { id: "canteen-2", name: "第二食堂" },
  { id: "canteen-3", name: "教工食堂" },
]

export const MEAL_TYPES = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
]

export const COMMON_UNITS: Unit[] = ["kg", "g", "L", "ml", "个", "包", "箱"]

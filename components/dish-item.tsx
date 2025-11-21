"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Ingredient, Dish } from "@/types/menu"

interface DishItemProps {
  id: string
  name: string
  servings: string
  ingredients: Ingredient[]
  onUpdate: (updates: Partial<Dish>) => void
  onDelete: () => void
}

export function DishItem({ id, name, servings, ingredients, onUpdate, onDelete }: DishItemProps) {
  const [isIngredientsOpen, setIsIngredientsOpen] = React.useState(ingredients.length > 0 || !name)
  const COMMON_UNITS = ["千克", "克", "升", "毫升", "个", "包", "箱"]

  const handleServingsChange = (value: string) => {
    onUpdate({ plannedServings: value })
  }

  const addIngredient = () => {
    const newIng: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      quantity: "",
      unit: "千克",
      remark: "",
    }
    onUpdate({ ingredients: [...ingredients, newIng] })
    setIsIngredientsOpen(true)
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const newIngs = [...ingredients]
    newIngs[index] = { ...newIngs[index], [field]: value }
    onUpdate({ ingredients: newIngs })
  }

  const removeIngredient = (index: number) => {
    const newIngs = [...ingredients]
    newIngs.splice(index, 1)
    onUpdate({ ingredients: newIngs })
  }

  return (
    <div className="group relative flex flex-col gap-4 p-4 bg-background border rounded-lg shadow-sm">
      {/* Header: Name & Servings in one row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-12 gap-3">
          {/* Dish Name - Spans 7 columns */}
          <div className="col-span-7 flex items-center gap-2">
            <Label className="shrink-0 text-muted-foreground text-xs w-8 text-right">菜品</Label>
            <Input
              value={name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="请输入菜品名称"
              className="font-medium h-8 text-sm"
            />
          </div>

          {/* Servings - Spans 5 columns */}
          <div className="col-span-5 flex items-center gap-2">
            <Label className="shrink-0 text-muted-foreground text-xs w-8 text-right">份数</Label>
            <div className="relative flex-1">
              <Input
                type="number"
                value={servings}
                onChange={(e) => handleServingsChange(e.target.value)}
                className="h-8 pr-6 text-sm"
                placeholder="0"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">份</span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-destructive px-2 shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          <span className="text-xs">删除</span>
        </Button>
      </div>

      {/* Ingredients Section */}
      <div className="pl-2 space-y-3">
        {ingredients.length > 0 && (
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} className="flex flex-col gap-3 p-3 bg-muted/30 border rounded-md">
                {/* Row 1: Name & Delete */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <Label className="shrink-0 text-muted-foreground text-xs w-8 text-right">原料</Label>
                    <Input
                      placeholder="原料名称"
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                      className="h-8 text-sm bg-background"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground hover:text-destructive px-2 shrink-0"
                    onClick={() => removeIngredient(idx)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">删除</span>
                  </Button>
                </div>

                {/* Row 2: Quantity & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="shrink-0 text-muted-foreground text-xs w-8 text-right">数量</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
                      className="h-8 text-sm bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="shrink-0 text-muted-foreground text-xs w-8 text-right">单位</Label>
                    <Select
                      value={COMMON_UNITS.includes(ing.unit) ? ing.unit : "CUSTOM"}
                      onValueChange={(val) => updateIngredient(idx, "unit", val === "CUSTOM" ? "自定义" : val)}
                    >
                      <SelectTrigger className="h-8 text-sm bg-background">
                        <SelectValue placeholder="单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_UNITS.map((u) => (
                          <SelectItem key={u} value={u} className="text-xs">
                            {u}
                          </SelectItem>
                        ))}
                        <SelectItem value="CUSTOM" className="text-xs">
                          自定义
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Notes */}
                <div className="flex items-center gap-2">
                  <Label className="shrink-0 text-muted-foreground text-xs w-8 text-right">备注</Label>
                  <Input
                    placeholder="选填"
                    value={ing.remark || ""}
                    onChange={(e) => updateIngredient(idx, "remark", e.target.value)}
                    className="h-8 text-sm bg-background"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={addIngredient}
          className="h-8 text-xs text-muted-foreground hover:text-primary px-0 ml-10"
        >
          <Plus className="h-3 w-3 mr-1" /> 添加原料
        </Button>
      </div>
    </div>
  )
}

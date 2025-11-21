"use client"
import { Plus, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { DishItem } from "@/components/dish-item"
import { useIsMobile } from "@/hooks/use-mobile"
import type { MenuSession, Dish } from "@/components/day-card"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface MenuSessionEditorProps {
  session: MenuSession | null
  date: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (sessionId: string, updates: Partial<MenuSession>) => void
}

export function MenuSessionEditor({ session, date, open, onOpenChange, onUpdate }: MenuSessionEditorProps) {
  const isMobile = useIsMobile()

  if (!session) return null

  const handleAddDish = () => {
    const newDish: Dish = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      servings: 0,
      ingredients: [],
    }
    onUpdate(session.id, { dishes: [...session.dishes, newDish] })
  }

  const handleUpdateDish = (dishId: string, updates: Partial<Dish>) => {
    const newDishes = session.dishes.map((d) => (d.id === dishId ? { ...d, ...updates } : d))
    onUpdate(session.id, { dishes: newDishes })
  }

  const handleDeleteDish = (dishId: string) => {
    const newDishes = session.dishes.filter((d) => d.id !== dishId)
    onUpdate(session.id, { dishes: newDishes })
  }

  const handleSubmit = () => {
    onUpdate(session.id, { status: "Published" })
    onOpenChange(false)
  }

  const EditorContent = () => (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {session.canteenName} - {session.mealName}
            </h3>
            <p className="text-sm text-muted-foreground">{format(date, "yyyy年M月d日 EEEE", { locale: zhCN })}</p>
          </div>
          <Badge variant={session.status === "Published" ? "default" : "secondary"}>
            {session.status === "Published" ? "已提交" : "草稿"}
          </Badge>
        </div>
      </div>

      {/* Dishes List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 max-w-3xl mx-auto">
          {session.dishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-12 border-2 border-dashed border-muted rounded-xl bg-secondary/20">
              <ChefHat className="h-12 w-12 mb-3 opacity-50" />
              <span className="text-sm font-medium mb-2">暂无菜品</span>
              <Button variant="outline" size="sm" onClick={handleAddDish}>
                <Plus className="mr-2 h-4 w-4" />
                添加第一道菜
              </Button>
            </div>
          ) : (
            <>
              {session.dishes.map((dish) => (
                <DishItem
                  key={dish.id}
                  id={dish.id}
                  name={dish.name}
                  servings={dish.servings}
                  ingredients={dish.ingredients}
                  onUpdate={(updates) => handleUpdateDish(dish.id, updates)}
                  onDelete={() => handleDeleteDish(dish.id)}
                />
              ))}
              <Button variant="outline" className="w-full bg-transparent" onClick={handleAddDish}>
                <Plus className="mr-2 h-4 w-4" />
                添加菜品
              </Button>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-secondary/30 flex gap-2">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
          关闭
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={session.dishes.length === 0}>
          {session.status === "Published" ? "更新" : "提交审核"}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh]">
          <EditorContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0">
        <EditorContent />
      </DialogContent>
    </Dialog>
  )
}

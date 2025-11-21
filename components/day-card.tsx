"use client"
import { Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import * as React from "react"

// --- Types ---
export type Ingredient = {
  id: string
  name: string
  quantity: number
  unit: string
  remark: string
}

export type Dish = {
  id: string
  name: string
  servings: number
  ingredients: Ingredient[]
}

export type MenuSession = {
  id: string
  canteenId: string
  canteenName: string
  mealId: string
  mealName: string
  dishes: Dish[]
  status: "Draft" | "Published"
}

export type DayMenu = {
  date: Date
  sessions: MenuSession[]
}

interface DayCardProps {
  day: DayMenu
  canteens: Array<{ id: string; name: string }>
  meals: Array<{ id: string; name: string }>
  onUpdate: (updates: Partial<DayMenu>) => void
  onEditSession: (session: MenuSession) => void
}

export function DayCard({ day, canteens, meals, onUpdate, onEditSession }: DayCardProps) {
  const isMobile = useIsMobile()
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false)
  const [selectedCanteen, setSelectedCanteen] = React.useState("")
  const [selectedMeal, setSelectedMeal] = React.useState("")

  const handleAddMenu = () => {
    if (!selectedCanteen || !selectedMeal) return

    const canteen = canteens.find((c) => c.id === selectedCanteen)
    const meal = meals.find((m) => m.id === selectedMeal)
    if (!canteen || !meal) return

    const newSession: MenuSession = {
      id: Math.random().toString(36).substr(2, 9),
      canteenId: canteen.id,
      canteenName: canteen.name,
      mealId: meal.id,
      mealName: meal.name,
      dishes: [],
      status: "Draft",
    }

    onUpdate({ sessions: [...day.sessions, newSession] })
    setIsAddMenuOpen(false)
    setSelectedCanteen("")
    setSelectedMeal("")
  }

  const AddMenuForm = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="canteen">选择食堂</Label>
        <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
          <SelectTrigger id="canteen">
            <SelectValue placeholder="请选择食堂" />
          </SelectTrigger>
          <SelectContent>
            {canteens.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="meal">选择餐别</Label>
        <Select value={selectedMeal} onValueChange={setSelectedMeal}>
          <SelectTrigger id="meal">
            <SelectValue placeholder="请选择餐别" />
          </SelectTrigger>
          <SelectContent>
            {meals.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAddMenu} className="w-full" disabled={!selectedCanteen || !selectedMeal}>
        生成菜单
      </Button>
    </div>
  )

  const CardContent = () => (
    <div className="flex flex-col h-full bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="flex-1 p-3 space-y-2 min-h-[160px]">
        {day.sessions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 border-2 border-dashed border-muted rounded-xl bg-secondary/20">
            <span className="text-sm font-medium">暂无菜单</span>
          </div>
        ) : (
          <div className="space-y-2">
            {day.sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onEditSession(session)}
                className="w-full flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-accent transition-colors text-left group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{session.canteenName}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{session.mealName}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{session.dishes.length} 道菜</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant={session.status === "Published" ? "default" : "secondary"} className="text-xs">
                    {session.status === "Published" ? "已提交" : "草稿"}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t bg-secondary/30">
        {isMobile ? (
          <Drawer open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-background"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加菜单
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>添加菜单</DrawerTitle>
                <DrawerDescription>选择食堂和餐别以生成新菜单</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <AddMenuForm />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-background"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加菜单
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加菜单</DialogTitle>
                <DialogDescription>选择食堂和餐别以生成新菜单</DialogDescription>
              </DialogHeader>
              <AddMenuForm />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )

  return <CardContent />
}

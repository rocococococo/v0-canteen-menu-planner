"use client"

import * as React from "react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ShoppingCart, Package, CheckCircle2, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getLunarDateInfo } from "@/lib/lunar"
import type { AggregatedIngredient } from "@/lib/procurement"
import { getProcurementData, type ProcurementData } from "@/app/actions/procurement"
import { toast } from "sonner"

interface ProcurementInspectorProps {
    currentDate: Date
}

export function ProcurementInspector({ currentDate }: ProcurementInspectorProps) {
    const dateKey = format(currentDate, "yyyy-MM-dd")
    const lunarInfo = getLunarDateInfo(currentDate)

    const [aggregatedIngredients, setAggregatedIngredients] = React.useState<AggregatedIngredient[]>([])
    const [purchaseOrders, setPurchaseOrders] = React.useState<ProcurementData["purchaseOrders"]>([])
    const [assignedIds, setAssignedIds] = React.useState<Set<string>>(new Set())
    const [selectedIngredientIds, setSelectedIngredientIds] = React.useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = React.useState(false)

    // Load data through server action to keep Prisma on the server.
    const loadData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await getProcurementData(dateKey)

            if (result.success) {
                setAggregatedIngredients(result.data.aggregatedIngredients)
                setPurchaseOrders(result.data.purchaseOrders)
                setAssignedIds(new Set(result.data.assignedIds))
                setSelectedIngredientIds(new Set())
                return
            }

            console.error("Failed to load procurement data:", result.error)
            toast.error("加载采购数据失败: " + (result.error || "未知错误"))
        } catch (error) {
            console.error("Failed to load procurement data:", error)
            toast.error("加载采购数据失败，请稍后重试")
        } finally {
            setIsLoading(false)
        }
    }, [dateKey])

    React.useEffect(() => {
        void loadData()
    }, [loadData])

    // Filter out already assigned ingredients
    const availableIngredients = aggregatedIngredients.filter(
        (ing) => !assignedIds.has(ing.ingredientId)
    )

    const toggleIngredient = (id: string) => {
        setSelectedIngredientIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const selectAll = () => {
        setSelectedIngredientIds(new Set(availableIngredients.map((ing) => ing.ingredientId)))
    }

    const clearSelection = () => {
        setSelectedIngredientIds(new Set())
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold">采购管理</h2>
                        <p className="text-sm text-muted-foreground">
                            {format(currentDate, "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                        </p>
                        <p className="text-xs mt-0.5 text-muted-foreground">
                            <span>{lunarInfo.lunarMonth}{lunarInfo.lunarDay}</span>
                            {(lunarInfo.festival || lunarInfo.term) && (
                                <>
                                    <span className="mx-1.5">·</span>
                                    <span className="text-red-500 font-medium">
                                        {lunarInfo.festival || lunarInfo.term}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>待采购: {availableIngredients.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span>已分配: {assignedIds.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3 text-blue-600" />
                        <span>采购单: {purchaseOrders.length}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-3" />
                            <p>加载中...</p>
                        </div>
                    ) : (
                        <>
                            {/* Aggregated Ingredients - Pending Pool */}
                            {availableIngredients.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden bg-card">
                                    <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                        <h3 className="font-medium text-sm">待分配原料</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={selectAll}
                                                disabled={availableIngredients.length === 0}
                                            >
                                                全选
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={clearSelection}
                                                disabled={selectedIngredientIds.size === 0}
                                            >
                                                清空
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="divide-y">
                                        {availableIngredients.map((ingredient) => (
                                            <div
                                                key={ingredient.ingredientId}
                                                className="p-3 hover:bg-muted/20 transition-colors cursor-pointer"
                                                onClick={() => toggleIngredient(ingredient.ingredientId)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedIngredientIds.has(ingredient.ingredientId)}
                                                        onCheckedChange={() => toggleIngredient(ingredient.ingredientId)}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{ingredient.ingredientName}</span>
                                                            <span className="text-sm font-semibold text-primary">
                                                                {ingredient.totalQuantity} {ingredient.unit}
                                                            </span>
                                                        </div>
                                                        {ingredient.sources && ingredient.sources.length > 0 && (
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                来源: {ingredient.sources.map((s) => s.dishName).join(", ")}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedIngredientIds.size > 0 && (
                                        <div className="p-3 bg-muted/10 border-t">
                                            <Button className="w-full" size="sm">
                                                <ShoppingCart className="w-4 h-4 mr-1" />
                                                生成采购单 ({selectedIngredientIds.size} 项)
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                下一步将选择供应商
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/5">
                                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>暂无待采购原料</p>
                                    <p className="text-xs mt-1">
                                        {aggregatedIngredients.length === 0
                                            ? "该日期没有已提交的菜单"
                                            : "所有原料已分配完成"}
                                    </p>
                                </div>
                            )}

                            {/* Purchase Orders List */}
                            {purchaseOrders.length > 0 && (
                                <div className="border rounded-lg overflow-hidden bg-card">
                                    <div className="p-3 bg-muted/30 border-b">
                                        <h3 className="font-medium text-sm">已生成采购单</h3>
                                    </div>
                                    <div className="divide-y">
                                        {purchaseOrders.map((order) => (
                                            <div key={order.id} className="p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{order.supplier.name}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                order.status === "confirmed"
                                                                    ? "bg-green-500 text-white border-0"
                                                                    : "bg-gray-500 text-white border-0"
                                                            }
                                                        >
                                                            {order.status === "confirmed" ? "已确认" : "草稿"}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {order.items.length} 项原料
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground space-y-1">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between">
                                                            <span>{item.ingredient.name}</span>
                                                            <span>
                                                                {item.quantity} {item.unit}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

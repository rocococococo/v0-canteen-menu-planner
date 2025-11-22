# Procurement Workflow & Layout Adaptation Plan

## Goal
Implement the "Procurement" workflow within the existing Calendar application, allowing users to aggregate ingredients from menus and generate purchase orders. Address layout constraints by implementing a flexible/adaptive UI that works well on both Desktop (expanded view) and Mobile.

## User Review Required
> [!IMPORTANT]
> **Layout Strategy Change**: To address your concern about the 2:1 ratio, I will implement a **dynamic layout**:
> *   **Desktop**: When switching to "Procurement Mode", the right panel will automatically expand to occupy **50% or 60%** of the screen (or become resizable), giving ample space for tables.
> *   **Mobile**: The right panel will continue to be hidden by default and accessible via a **Bottom Sheet / Drawer** interaction, ensuring complex tables are viewable on small screens without cramping.

## Proposed Changes

### Database Schema (`prisma/schema.prisma`)
We need to store Suppliers and Purchase Orders.

#### [MODIFY] [schema.prisma](file:///root/smart-canteen/prisma/schema.prisma)
Add the following models:
```prisma
// 供应商 (Supplier)
model Supplier {
  id        String   @id @default(uuid())
  name      String
  contact   String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  purchaseOrders PurchaseOrder[]
}

// 采购单 (PurchaseOrder)
model PurchaseOrder {
  id         String   @id @default(uuid())
  date       String   // Procurement Date (usually the day before consumption)
  targetDate String   // The menu date this order is for
  status     String   @default("draft") // draft, confirmed, completed
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  supplierId String
  supplier   Supplier @relation(fields: [supplierId], references: [id])

  items PurchaseOrderItem[]
}

// 采购单明细 (PurchaseOrderItem)
model PurchaseOrderItem {
  id        String   @id @default(uuid())
  quantity  Float
  unit      String
  remark    String?
  
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)

  ingredientId String
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
}
```

### UI Components

#### [MODIFY] [calendar-shell.tsx](file:///root/smart-canteen/components/calendar/calendar-shell.tsx)
- Add state `mode`: `'planning' | 'procurement'`.
- Update layout classes to be dynamic based on `mode`.
    - Planning: `flex-[2]` (Calendar) vs `flex-1` (Inspector)
    - Procurement: `flex-1` (Calendar) vs `flex-1` (Inspector) or `flex-[2]` (Inspector)
- Pass `mode` to Inspector.

#### [MODIFY] [inspector.tsx](file:///root/smart-canteen/components/calendar/inspector.tsx)
- Accept `mode` prop.
- Render `MenuInspector` (existing logic) if mode is 'planning'.
- Render `ProcurementInspector` (new component) if mode is 'procurement'.

#### [NEW] [procurement-inspector.tsx](file:///root/smart-canteen/components/calendar/procurement-inspector.tsx)
- **Aggregation Logic**:
    - Fetch all `MenuSession` -> `Dish` -> `DishIngredient` for the selected date.
    - Group by `ingredientId`.
    - Sum quantities (handle unit conversions if necessary, for MVP assume consistent units or just sum raw for now).
- **UI**:
    - Table of aggregated ingredients.
    - Checkbox selection.
    - "Generate Order" button -> Supplier Selection Dialog.
    - List of existing `PurchaseOrder`s for the day.

#### [NEW] [mobile-procurement-view.tsx](file:///root/smart-canteen/components/mobile/procurement-view.tsx)
- A dedicated mobile view or Drawer component for handling procurement tasks on small screens.

## Verification Plan

### Automated Tests
- None planned for MVP UI interactions.

### Manual Verification
1.  **Layout Check**:
    - Open Desktop: Switch to Procurement mode, verify right panel expands.
    - Open Mobile (simulate via DevTools): Verify layout stacks or uses Drawer, ensuring tables are readable.
2.  **Workflow Walkthrough**:
    - Create a Menu for "Tomorrow".
    - Add dishes with ingredients (e.g., Potato 5kg).
    - Switch to Procurement Mode.
    - Select "Tomorrow".
    - Verify "Potato" shows up with "5kg".
    - Select Potato -> Assign to "Supplier A".
    - Verify Purchase Order created.
    - Verify Potato is removed/marked done in the aggregation list.

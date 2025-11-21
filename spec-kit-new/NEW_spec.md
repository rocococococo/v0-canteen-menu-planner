# UI & API Spec — aligned to ui-current.md (2025-11-22)

## 1. 范围与环境
- 页面：CalendarShell（左）+ Inspector（右，lg+）。移动端目前只显示日历，缺少编辑面板。
- 数据源：现阶段使用 Zustand 内存 store；目标改为 `/api/v1/sessions` + Postgres，为 UI 提供真源。
- 技术：Next.js 16 App Router、React 19、TypeScript、Tailwind 4、shadcn/ui、Zustand、date-fns、lunar-typescript、Sonner。

## 2. 数据模型（UI）
- MenuSession {id, date(yyyy-MM-dd), canteenId, mealId, status: draft|submitted, dishes[]}
- Dish {id, name, plannedServings, chefName, ingredients[]}
- Ingredient {id, name, quantity, unit, remark}
- 业务键：date + canteenId + mealId；重复创建被阻止。
- 现状 ID：Math.random（⚠️ 需替换）；目标：uuid（前端临时 + 后端落库）。

## 3. 关键流与状态
- 日期选择：任意视图点击 → currentDate 更新 → Inspector 同步（✅）。
- 导航：< / 今天 / > 依据视图粒度跳转（年±1/月±1/周±7/日±1），保持 currentDate（✅）。
- 视图切换：日/周/月/年按钮即时切换，保留 currentDate（✅）。
- 新建 Session：新增菜单→选食堂/餐别→创建；重复 Toast 错误；表单重置；卡片展开（✅）。
- Session 折叠：手动折叠/展开；提交后自动折叠（✅）。
- 菜品管理：草稿态可添加第 N 道菜，自动聚焦；删除即时无确认/Toast（⚠️）。
- 原料管理：草稿态增删改原料，自动聚焦；单位可自定义（⚠️）。
- 提交 Session：双击确认，3 秒窗口；状态变提交，徽章蓝，锁定编辑，自动折叠，Toast 成功（✅）。
- 删除 Session：双击确认，3 秒窗口；删除后无 Toast/撤销（⚠️）。
- 搜索：仅 UI 展开/收起，无过滤（❌）。
- 指示：月/周视图有圆点标记存在菜单，无摘要文本（⚠️）。
- 响应式：Inspector 在 <lg 隐藏，移动端无编辑入口（⚠️）。

## 4. 反馈与校验
- 有反馈：重复创建错误 toast；提交成功 toast；删除/提交按钮文案确认 + 自动重置。
- 缺失反馈：创建成功、删除成功、删除菜品/原料反馈；撤销能力（⚠️）。
- 校验：无必填/数值校验，提交未阻断（⚠️）。

## 5. API 目标设计（v0.1+）
- 路径：`/api/v1/sessions`
  - POST `/sessions` 创建（body 含业务键/菜品/原料）；409 表示重复；返回最新 Session。
  - GET `/sessions?date=YYYY-MM-DD` 返回该日全部 Session（含菜品/原料）及摘要。
  - PATCH `/sessions/{id}` 更新草稿；提交操作用 `/sessions/{id}/submit`（POST）。
  - DELETE `/sessions/{id}` 删除（优先软删）；响应返回剩余列表。
- 契约：JSON；校验失败 400，未授权 401/403，未找到 404。
- 乐观更新：前端先写本地，成功后以响应覆盖；失败回滚并弹 Toast。

## 6. 鉴权（v0.2 目标）
- 角色：planner（写自身作用域）、viewer（只读）。未来支持自定义权限表。
- 作用域：业务键过滤（canteenId/mealId/date 范围）；授权失败返回 403。
- 审计：提交/删除/更新记录 actor、业务键、状态与时间。

## 7. 移动端与可访问性
- 现状：移动端仅浏览日历，无编辑能力。
- 目标：提供抽屉/全屏 Inspector，支持创建/编辑/提交/删除；保留双击确认。
- A11y：折叠触发器/按钮可聚焦；错误提示靠近字段。

## 8. 限制与风险
- 内存存储导致刷新丢失。
- ID 生成不安全，存在碰撞风险。
- 删除不可撤销；提交不可撤销但可删除 Session。
- 搜索未实现；移动端编辑缺失。

## 9. Roadmap 挂钩
- 对接智慧食堂 API：入站同步表 + 调度 + 差异报告（未排期）。
- 采购/验收/分析：待立项后补充端到端状态机和表设计。

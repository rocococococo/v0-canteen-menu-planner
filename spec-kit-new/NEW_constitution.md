# Smart Canteen Constitution (UI + API) — 2025-11-22

## Scope
- 以 `spec-kit/ui-current.md` 描述的实际桌面端 UI 为准绳，不推翻已落地的日历/Inspector 体验。
- 本宪章覆盖前端、API、持久化、基础鉴权/RBAC 的技术约束，未实现的采购/验收/分析流程移入 Roadmap。
- 业务主键固定为 `(menu_date, canteen_id, meal_period)`；所有记录、授权和查询围绕该锚点。

## 技术栈与运行时
- 前端：Next.js 16（App Router）+ React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Zustand（仅作局部状态/乐观缓存）。
- 后端：Next.js Route Handlers（`/app/api`）优先；若拆分服务则用 Node.js 20 + NestJS（TS）。
- 数据层：PostgreSQL；ORM 优先 Prisma（可替换为 TypeORM 如选 NestJS）。ID 使用 `uuid`（客户端临时 use `crypto.randomUUID`，落库后以 DB UUID 为准）。
- 工具：date-fns（日期）、lunar-typescript（农历）、Sonner（Toast）。
- 部署/配置：通过环境变量注入数据库连接、JWT 密钥、外部智慧食堂 API 密钥。

## 代码与文件规范
- 组件 PascalCase，hooks camelCase，类型/枚举集中在 `types/`；公用函数放 `lib/`。
- UI 不写内联样式，使用 Tailwind + shadcn/ui；公共颜色/阴影沿现有设计，不强制暗黑模式。
- API 路由前缀 `/api/v1`；资源名复数（`/api/v1/sessions`）。仅返回 JSON，统一错误响应 `{code,message,details?}`。
- 强制使用 `crypto.randomUUID` 生成前端临时 ID；后端落库用数据库 UUID 并回传，前端以 `id` 覆盖本地临时值。
- 数据校验：API 层使用 zod/DTO；前端表单同规则，避免双标。
- 迁移：使用 Prisma migrate（或 TypeORM migration）；禁止手改数据库。迁移文件与代码同一 PR。

## 数据与状态约定
- 核心模型：MenuSession（包含 dishes/ingredients），状态 `draft|submitted`；提交后锁定编辑，仍可删除会话（与现有行为一致）。
- 重复规则：同日同食堂同餐别仅一条 Session，后端需幂等校验并返回 409。
- 业务键：`menu_date` 存储为 `date`；`canteen_id`/`meal_id` 文本枚举，与 `types/menu.ts` 中定义保持一致（落库后以表驱动）。
- 持久化优先：首个版本即连 Postgres；禁止仅依赖 localStorage。UI 可在请求中断时暂存，但需与服务器数据对齐。
- 乐观更新：前端先写入 Zustand 临时记录（UUID 临时 ID），后端成功后以返回体覆盖；失败需回滚并提示。

## API 与鉴权
- 鉴权：预留 NextAuth/JWT；最小可行角色 `planner`（读写所属窗口）和 `viewer`（只读）。用户、角色、权限、作用域存表：`users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `scopes`。
- 授权：每次写操作需验证权限标记和业务键作用域。
- 幂等性：创建接口接受可选 `clientRequestId` 以避免重试重复；删除/提交操作应返回最新资源。
- 版本化：API 路径含 `/v1`；破坏性更新增加版本。
- 日志：记录 actor、操作、业务键、前后状态摘要，存数据库审计表；PII 避免入日志。

## 前端交互规范（保持现 UI）
- Inspector 桌面端显示；移动端后补等效编辑面板，不得弱化现有桌面体验。
- 破坏性操作使用双击确认 + 3 秒自动重置；提交显示成功 toast；删除/创建需补充轻量提示（后续迭代）。
- 自动聚焦：新增菜品/原料默认聚焦输入；提交后自动折叠卡片。
- 响应式：lg 以下隐藏 Inspector；移动端上线需保持全部 CRUD 功能，不得只读。

## 持久化与数据质量
- 数据库表必须包含审计列：`created_at`, `updated_at`, `created_by`, `updated_by`（UUID 或用户名）。
- 禁止使用随机浮点 ID；禁止无事务的批量写入。写操作须在事务内处理 Session + Dish + Ingredient。
- 软删除优先：Session 删除可软删并带 `deleted_at`，前端默认过滤；硬删仅限清理任务。

## 安全与隐私
- 所有 API 仅接受/返回 JSON；拒绝表单多段文件上传（后续图片再扩展）。
- CSRF：如使用 cookies，需启用 CSRF 防护或改为 Bearer token。
- 速率限制：接口按用户和 IP 限流（规划即可，落地在接入网关时实现）。
- 输入验证：数字为非负，长度限制，防止超长/注入。

## 观察性与质量
- 指标：请求计数/错误率/延迟；自定义事件（Session 创建/提交/删除）。
- 日志：结构化 JSON，含 traceId/requestId；客户端需传递 requestId 便于链路追踪。
- 测试：store CRUD 单测；关键交互组件测试；API 合约测试（Supertest/Playwright 视需要）。

## Roadmap 边界
- 采购/供应商指派/采购单、验收、销售导入、分析等旧文档内容移入 Roadmap，不对当前 UI 施加约束。
- 当启动上述模块时，需重新修订本宪章并补充端到端状态机。

## 文档治理
- 本文件与 `spec-kit/ui-current.md`, `spec-kit-new/NEW_spec.md` 同步更新；UI/数据行为变化必须同步更新文档。
- 任何破坏性变更需在 `NEW_plan.md` 标注版本与迁移步骤。

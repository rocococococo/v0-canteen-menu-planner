# Tasks & Acceptance — 2025-11-22

## 近期（按优先顺序）
- T01 数据库落地与模式  
  验收：PostgreSQL 可用；Prisma schema 定义 Session/Dish/Ingredient（含审计列）；migrate 可重复执行；本地 `.env.example` 提供连接示例。

- T02 API 首批（sessions）  
  验收：`/api/v1/sessions` 支持创建/查询（日粒度）/更新/提交/删除；重复键返回 409；返回体含最新列表；错误响应统一格式。

- T03 前端接入 API + 乐观更新  
  验收：UI 默认从 API 加载；操作走 fetcher，临时 UUID 在成功后被服务器 UUID 覆盖；失败回滚并提示；刷新不丢数据。

- T04 基础鉴权与作用域  
  验收：登录后获得 planner/viewer；无权限返回 403；作用域基于 canteen/meal/date；写操作记录 actor 到审计表。

- T05 表单校验与提交保护  
  验收：菜名/份数必填且非负；原料名/数量必填且非负；单位必选；无效时禁用提交并显示消息；API 同步校验。

- T06 搜索/过滤落地  
  验收：可按食堂/餐别/菜名过滤 Inspector；月/周视图指示同步；空结果有引导。

- T07 反馈与撤销  
  验收：创建/删除成功 toast；删除 Session/菜品/原料 3–5 秒内可撤销；双击确认保留。

- T08 移动端编辑面板  
  验收：<lg 提供抽屉/全屏 Inspector，支持 CRUD/提交/删除；数据与桌面一致；性能流畅。

- T09 基础测试  
  验收：store CRUD 单测；SessionCard/DishItem 关键交互测试；API 合约测试（创建/提交/重复/删除）。

## Roadmap（待立项）
- TR01 高级 RBAC：自定义权限集、作用域组合、权限审计视图。
- TR02 智慧食堂 API 接入：入站同步表、调度重试、差异报告。
- TR03 采购/供应商指派/采购单、验收、销售导入、分析报表与导出。
- TR04 文件/图片上传与对象存储集成。
- TR05 观察性与 SLO：请求指标、错误率、限流、预警。

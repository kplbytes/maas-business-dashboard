# Metabase dashboard/14 真实规格（P1 直连 ADB 的 SQL 起点）

> 通过 `mb` CLI（@metabase/cli，已登录实例 `http://39.97.224.120:34567`，用户 KK）从远端 Metabase 拉取。
> 日期：2026-07-16。本文件是新系统「各自演进不同步」决策下，对 dashboard 14 的**初始规格快照**——P1 实现时以此为基础翻译成 `resources/sql/*.sql`，后续独立演进。

## 概览

- **看板名**：租户商业看板（dashboard id=14）
- **数据源**：Metabase `database_id=2`（即阿里云 AnalyticDB for MySQL 连接）
- **看板级参数**：0 个 —— **dashboard 14 本身没有租户/时间过滤**，所以现在 Metabase 里任何登录用户都能看到全部租户数据。这正是本系统要解决的权限问题。新系统在每条 SQL 注入 `WHERE tenant_id IN (:tenantIds)` + 日期范围。
- **卡片数**：7（3 scalar + 2 table + 1 pie + 1 line），24 列网格布局。
- **卡片查询类型**：MBQL（查询构建器，lib 格式），非原生 SQL。P1 用 `mb database/table/field` 把字段 id 映射成真实表/列名后翻译为 SQL。

## 关键 schema 发现（影响数据模型与 UI）

1. **`tenant_id` 是字符串**，形如 `te-dc3vlj2pzjd2mdfz`、`te-dco45e236gb6lhix`、`te-dc7bol3dacryrbyt`（约 20 字符）。
   → `tenant_assignments.tenant_key` 用 `VARCHAR(64)`；ADB 过滤 `WHERE tenant_id IN ('te-...', ...)`。
2. **`tenant_name` 在数据里等于 `tenant_id`**，没有人类可读名。
   → 管理后台分配租户时需要手填别名，或维护一张 `(tenant_key, alias)` 别名表（推荐前者起步，别名存 `tenant_assignments.tenant_name`）。
3. **真实模型**（来自 card 9/121）：minimax-m2.5、glm-5/glm-5.1/glm-5.2、qwen3.5-plus、deepseek-v3.2/v4-flash/v4-pro、claude-opus-4-5/4-6/4-7/4-8、claude-sonnet-4-6、gemini-3-flash/3.1-flash-lite/3.1-pro/3.5-flash、gpt-5.3-codex/5.4/5.5。供应商：Google、深度求索、OpenAI、Anthropic、智谱、Minimax 等。
4. **单位**：金额=元，Token=亿（card 9/121 已折算为亿）。card 147 收入≈¥391.7 万，card 149 tokens≈11,196 亿。
5. **同一模型多 svc_name**：如 glm-5 有 `default:bigmodel` 与 `default:1`。模型分布需**按 model_name 聚合**，不能直接用明细行。
6. **card 161 是日快照**（`snapshot_date`，2026-03-01→05-29，90 天），列为累计/余额类金额，呈累积增长曲线。

## 7 张卡明细

### card 147 · 消费总金额 · scalar
- 布局：row0 col0 w8 h3
- 列：`收入`
- 真实值：`3,916,889.75`（元，全租户汇总）
- 新系统映射：`resources/sql/total_revenue.sql` → `SELECT SUM(收入) FROM ... WHERE tenant_id IN (:tenantIds) [AND date BETWEEN :start AND :end]`

### card 148 · 调用次数 · scalar
- 布局：row0 col16 w8 h3
- 列：`count`
- 真实值：`93,686,734`（次，全租户）
- 新系统映射：`resources/sql/total_calls.sql` → `SELECT COUNT(*) ... WHERE tenant_id IN (:tenantIds) ...`

### card 149 · tokens消耗量 · scalar
- 布局：row0 col8 w8 h3
- 列：`tokens消耗量`
- 真实值：`11,196.18`（亿）
- 新系统映射：`resources/sql/total_tokens.sql` → `SELECT SUM(tokens)/1e8 ... WHERE tenant_id IN (:tenantIds) ...`

### card 138 · 租户Tokens折扣率一览 · table
- 布局：row3 col0 w24 h5（整行）
- 列：`tenant_id, tenant_name, product_name, input_tokens_discount, output_tokens_discount, cache_input_tokens_discount`
- 样例：`te-dc3vlj2pzjd2mdfz | te-dc3vlj2pzjd2mdfz | claude-opus-4-7 | 90.0% | 90.0% | 90.0%`
- 新系统映射：`resources/sql/tenant_discount.sql` → 按 `tenant_id × product_name` 的输入/输出/缓存折扣率，注入租户范围

### card 9 · 模型Token消耗分布（亿次）· pie
- 布局：row8 col12 w12 h6
- 列：`model_name, svc_name, Token/亿`
- MBQL：`source-table=244`，`aggregation = sum(TotalToken)/1e8 AS "Token/亿"`，`breakout = [field 3818]`（= model_name）
- 真实（按 model_name 聚合后，亿）：minimax-m2.5 3377.5、glm-5 3540.9（2132.5+1408.4）、deepseek-v4-flash 874.9（445.6+242.2+187.1）、qwen3.5-plus 454.5、glm-5.1 510.9（290.2+220.7）、deepseek-v4-pro 319.8、glm-5.2 128.9、deepseek-v3.2 118.6
- 新系统映射：`resources/sql/model_token_dist.sql` → `SELECT model_name, SUM(total_token)/1e8 FROM ... WHERE tenant_id IN (:tenantIds) GROUP BY model_name`

### card 121 · 模型使用明细 · table
- 布局：row8 col0 w12 h6
- 列：`租户ID, 租户名称, 模型名称, 供应商, 调用次数, 成功率, 输入Token(亿), 输出Token(亿), 缓存Token(亿), 消费金额(元), 占比`
- 样例：`te-dco45e236gb6lhix | … | gemini-3.1-pro-preview | Google | 1,337,240 | 86.44% | 46.53 | 36.99 | 1.68 | 126,535 | 19.5%`
- 新系统映射：`resources/sql/model_usage_detail.sql` → 租户×模型的调用/Token/金额/占比明细，注入租户范围

### card 161 · 租户资金行为看板 · line
- 布局：row14 col0 w24 h7（整行）
- 列：`snapshot_date, 充值+授信+代金券总额, 累计消费总额, 可用余额（含授信）, 真实余额, 代金券余额`
- 数据：2026-03-01→05-29 日序列（90 天），累积增长（累计消费 7,928→3,111,767 元）
- 新系统映射：`resources/sql/tenant_fund_trend.sql` → `SELECT snapshot_date, SUM(充值+授信+代金券总额), SUM(累计消费总额), ... WHERE tenant_id IN (:tenantIds) AND snapshot_date BETWEEN :start AND :end GROUP BY snapshot_date ORDER BY snapshot_date`

## P1 实现要点

1. 用 `mb database list` / `mb table` / `mb field` 把 `database_id=2` 的表与字段 id（如 `source-table 244`、`field 3818`）映射成真实表名/列名（`TotalToken`、`tenant_id`、`model_name`、`snapshot_date` 等）。
2. 把上述 7 张卡的 MBQL 翻译为 `resources/sql/*.sql`（参数化 `:tenantIds :startDate :endDate`），**每个卡片一个独立 SQL 文件**，服务端强制注入 `tenant_id IN (:tenantIds)`。
3. 看板布局由前端硬编码（固定 React 组件 + Tailwind 网格），**不引入 dashboards.yml 配置层**——每个组件直接调 `POST /api/analytics/query/{queryName}`。
4. 新系统可在此 7 卡基础上扩展更多图表（本系统定位允许超越 dashboard 14），但 P1 先忠实复刻这 7 卡。

---

## 原型实现状态（2026-07-16）

**原型已完成 7张卡片 + 3张资金KPI卡完整实现：**

| card_id | Metabase名称 | 原型实现 | 状态 |
|---------|-------------|---------|------|
| 147 | 消费总金额 | KPI卡片 | ✅ 已实现 |
| 148 | 调用次数 | KPI卡片 | ✅ 已实现 |
| 149 | tokens消耗量 | KPI卡片 | ✅ 已实现 |
| — | 真实余额（基于 card 161 数据源） | KPI卡片 | ✅ 已实现（独立SQL：fund_real_balance.sql） |
| — | 可用余额（基于 card 161 数据源） | KPI卡片 | ✅ 已实现（独立SQL：fund_available_balance.sql） |
| — | 充值金额（基于 card 161 数据源） | KPI卡片 | ✅ 已实现（独立SQL：fund_recharge.sql） |
| 138 | 租户Tokens折扣率一览 | 数据表格 | ✅ 已实现 |
| 9 | 模型Token消耗分布 | 环形饼图（ECharts） | ✅ 已实现（按model_name+svc_name聚合） |
| 121 | 模型使用明细 | 数据表格 | ✅ 已实现 |
| 161 | 租户资金行为看板 | 多折线图（ECharts） | ✅ 已实现 |

**原型额外功能（超出Metabase）：**
- 租户筛选（搜索下拉+多选+全选，支持搜索框）
- 时间筛选（日期范围选择器+快捷预设：近7天/30天/90天/本月）
- 密码修改弹窗（规则校验：8-20位+字母数字）
- 后台管理（租户分配CRUD）
  - 租户互斥分配：已被其他商务分配的租户不再出现在可分配池
  - 租户分配搜索框：可分配池与已分配列表双向搜索，按名称或 key 过滤
- 资金KPI卡片（基于 card 161 最新日）：真实余额、可用余额、充值金额
- 权限隔离（商务看自己租户，管理员看全部）
- 深色主题专业UI
- 响应式布局
- 数据刷新按钮
- 实时状态标识
- 筛选联动（所有图表响应筛选条件变化）

**原型文件：**
- [prototype/index.html](../prototype/index.html)
- [prototype/styles.css](../prototype/styles.css)
- [prototype/app.js](../prototype/app.js)

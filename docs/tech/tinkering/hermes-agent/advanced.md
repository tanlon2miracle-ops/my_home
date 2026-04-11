---
title: Hermes Agent 技术进阶
date: 2026-04-11
tags:
  - AI Agent
  - Hermes
  - Nous Research
  - Agent Loop
  - 上下文压缩
  - Prompt Assembly
  - Tool Runtime
  - 技术深潜
---

# Hermes Agent 技术进阶：Agent Loop、上下文引擎与工具系统

> **来源**：[官方开发者文档](https://hermes-agent.nousresearch.com/docs/developer-guide/) 系列
>
> **定位**：面向想读源码或做二次开发的开发者，深入 Hermes Agent 的三大核心子系统

---

## 一、Agent Loop 内部机制

### 1.1 核心类：`AIAgent`

`run_agent.py` 中的 `AIAgent` 类是整个系统的心脏，约 **9,200 行**，负责：

- Prompt 组装 + 缓存
- Provider/API Mode 选择
- 可中断的模型调用
- 工具调用分发（串行或并发）
- 对话历史维护（OpenAI 消息格式）
- 上下文压缩、重试、Fallback
- 迭代预算追踪（父子 Agent 共享）
- 记忆持久化刷盘

### 1.2 两个入口

```python
# 简单接口 → 返回最终响应字符串
response = agent.chat("Fix the bug in main.py")

# 完整接口 → 返回 dict（消息、元数据、用量统计）
result = agent.run_conversation(
    user_message="Fix the bug in main.py",
    system_message=None,       # 省略则自动构建
    conversation_history=None, # 省略则从 session 加载
    task_id="task_abc123"
)
```

`chat()` 是 `run_conversation()` 的薄包装，提取 `final_response` 字段。

### 1.3 三种 API Mode

| Mode | 适用 | 客户端 |
|------|------|--------|
| `chat_completions` | OpenAI 兼容端点（OpenRouter、自定义等） | `openai.OpenAI` |
| `codex_responses` | OpenAI Codex / Responses API | `openai.OpenAI` (Responses) |
| `anthropic_messages` | Anthropic 原生 Messages API | `anthropic.Anthropic` via adapter |

**解析优先级**：显式 `api_mode` 参数 → Provider 自动检测 → Base URL 启发式 → 默认 `chat_completions`

三种 Mode 在内部统一为 **OpenAI 格式的消息结构**（role/content/tool_calls dicts），API 调用前后做格式转换。

### 1.4 单轮生命周期

```
run_conversation()
  1. 生成 task_id（若未提供）
  2. 用户消息追加到对话历史
  3. 构建或复用缓存的 system prompt（prompt_builder.py）
  4. 检查是否需要预压缩（> 50% 上下文）
  5. 从对话历史构建 API 消息
     - chat_completions: 直接用 OpenAI 格式
     - codex_responses: 转换为 Responses API input items
     - anthropic_messages: 通过 anthropic_adapter.py 转换
  6. 注入临时 prompt 层（预算警告、上下文压力）
  7. 应用 Anthropic prompt caching 标记（如适用）
  8. 发起可中断的 API 调用（_api_call_with_interrupt）
  9. 解析响应：
     - 有 tool_calls → 执行工具 → 追加结果 → 回到步骤 5
     - 文本响应 → 持久化 session → 刷盘记忆 → 返回
```

### 1.5 可中断 API 调用

```
┌──────────────────────┐     ┌──────────────┐
│    Main Thread        │────▶│  API Thread   │
│  wait on:             │     │  HTTP POST    │
│  - response ready     │     │  to provider  │
│  - interrupt event    │     └──────────────┘
│  - timeout            │
└──────────────────────┘
```

中断时（用户发新消息、`/stop`、信号）：
- API 线程被放弃（响应丢弃）
- **不会将部分响应注入对话历史**
- Agent 干净地处理新输入

### 1.6 消息交替规则

Agent Loop **严格强制**角色交替：

```
System → User → Assistant → User → Assistant → ...

工具调用期间：
Assistant(tool_calls) → Tool → Tool → ... → Assistant

规则：
- 不允许连续两条 assistant 消息
- 不允许连续两条 user 消息  
- 只有 tool 角色可以连续（并行工具结果）
```

### 1.7 迭代预算

| 阈值 | 行为 |
|------|------|
| 默认 90 次迭代 | 可配置 `agent.max_turns` |
| 70% 使用量 | Caution：`[BUDGET: Iteration X/Y. N left. Start consolidating.]` |
| 90% 使用量 | Warning：`[BUDGET WARNING: Only N left. Provide final response NOW.]` |
| 100% | 停止，返回工作总结 |

**关键设计**：父子 Agent 共享预算。子 Agent 消耗的迭代从父 Agent 的预算中扣除。

### 1.8 Fallback 机制

当主模型失败（429 限流 / 5xx / 401 认证）：

1. 检查 `fallback_providers` 列表
2. 依次尝试每个 fallback
3. 成功则用新 provider 继续对话
4. 401/403 时先尝试刷新凭据

辅助任务（vision、压缩、web extraction、session search）各有独立的 fallback 链，通过 `auxiliary.*` 配置。

---

## 二、Prompt 组装系统

### 2.1 设计哲学

Hermes **刻意分离**：

- ✅ **缓存的 system prompt 状态**（稳定，不变）
- ✅ **临时的 API 调用时添加**（每次不同）

这个分离影响：token 使用量、prompt caching 命中率、session 连续性、记忆正确性。

### 2.2 缓存层（按顺序组装）

```
Layer 1:  Agent Identity     ← SOUL.md（~/.hermes/SOUL.md）
Layer 2:  工具行为引导       ← 根据可用工具动态生成
Layer 3:  Honcho 静态块      ← 外部用户建模（可选）
Layer 4:  可选 System Message ← 用户配置覆盖
Layer 5:  冻结的 MEMORY 快照  ← MEMORY.md（~800 tokens）
Layer 6:  冻结的 USER 快照    ← USER.md（~500 tokens）
Layer 7:  Skills 索引         ← 紧凑的技能列表
Layer 8:  上下文文件          ← AGENTS.md / .hermes.md / CLAUDE.md / .cursorrules
Layer 9:  时间戳 + Session ID
Layer 10: 平台提示           ← "You are a CLI AI Agent" 等
```

### 2.3 上下文文件发现（优先级）

| 优先级 | 文件 | 搜索范围 | 说明 |
|--------|------|----------|------|
| 1 | `.hermes.md` / `HERMES.md` | CWD → git root | Hermes 原生项目配置 |
| 2 | `AGENTS.md` | CWD only | 通用 agent 指令文件 |
| 3 | `CLAUDE.md` | CWD only | Claude Code 兼容 |
| 4 | `.cursorrules` / `.cursor/rules/*.mdc` | CWD only | Cursor 兼容 |

**First-match-wins**：只加载第一个匹配的类型。

所有上下文文件都经过：
- **安全扫描**：检测 prompt injection、不可见 Unicode、凭据窃取尝试
- **截断**：上限 20,000 字符，70/20 头/尾比例
- **YAML frontmatter 剥离**

### 2.4 SOUL.md 加载逻辑

```python
def load_soul_md() -> Optional[str]:
    soul_path = get_hermes_home() / "SOUL.md"
    if not soul_path.exists():
        return None
    content = soul_path.read_text(encoding="utf-8").strip()
    content = _scan_context_content(content, "SOUL.md")  # 安全扫描
    content = _truncate_content(content, "SOUL.md")       # 上限 20k 字符
    return content
```

如果 `SOUL.md` 存在 → 替换默认 identity → `build_context_files_prompt(skip_soul=True)` 避免重复注入。

### 2.5 临时层（不进缓存）

以下内容**不**进入缓存的 system prompt：

- `ephemeral_system_prompt`
- Prefill messages
- Gateway 派生的 session 上下文覆盖
- Honcho 后续轮次回忆（注入到当前 user message）

> 分离的目的：保持稳定前缀 → 最大化 provider 端 prompt caching 命中率。

### 2.6 记忆快照的冻结模式

**冻结快照模式**：session 启动时一次性捕获 MEMORY + USER，中途 **不刷新**。

Agent 在 session 中写入的记忆变更：
- ✅ 立即落盘
- ❌ 不会出现在当前 session 的 system prompt 中
- ✅ 下次 session 启动时才生效

工具响应中始终显示实时状态（让 Agent 知道写入成功）。

---

## 三、双层上下文压缩

### 3.1 架构

```
                ┌──────────────────────────┐
Incoming msg ──▶│ Gateway Session Hygiene  │  85% 阈值触发
                │ (pre-agent, 粗估)         │  安全网
                └─────────────┬────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │ Agent ContextCompressor  │  50% 阈值触发（可配）
                │ (in-loop, 真实 token)    │  主压缩系统
                └──────────────────────────┘
```

### 3.2 可插拔上下文引擎

基于 `ContextEngine` ABC，内置 `ContextCompressor` 为默认实现，插件可替换为无损引擎等：

```yaml
context:
  engine: "compressor"  # 默认 — 内置有损摘要
  engine: "lcm"         # 示例 — 插件提供的无损上下文
```

### 3.3 配置参数

```yaml
compression:
  enabled: true
  threshold: 0.50       # 触发阈值（上下文窗口的比例）
  target_ratio: 0.20    # 尾部保护 token 预算 = threshold_tokens × target_ratio
  protect_last_n: 20    # 最少保护的最近消息数
  summary_model: null   # 摘要使用的模型（默认用辅助模型）
```

**以 200K 上下文模型为例**：

| 参数 | 计算 |
|------|------|
| threshold_tokens | 200,000 × 0.50 = **100,000** |
| tail_token_budget | 100,000 × 0.20 = **20,000** |
| max_summary_tokens | min(200,000 × 0.05, 12,000) = **10,000** |

### 3.4 四阶段压缩算法

#### Phase 1：裁剪旧工具结果（无 LLM 调用）

尾部保护区外的长工具输出（> 200 字符）替换为：

```
[Old tool output cleared to save context space]
```

→ 廉价的预处理，节省大量 token。

#### Phase 2：确定边界

```
┌─────────────────────────────────────────────────────┐
│  [0..2]    ← protect_first_n（system + 首次交互）     │
│  [3..N]    ← 中间轮次 → 被摘要                       │
│  [N..end]  ← 尾部（按 token 预算 OR protect_last_n） │
└─────────────────────────────────────────────────────┘
```

边界对齐规则：`_align_boundary_backward()` 不拆分 tool_call/tool_result 组。

#### Phase 3：生成结构化摘要

使用辅助 LLM，按模板生成：

```markdown
## Goal
[用户目标]

## Constraints & Preferences
[偏好、编码风格、约束、重要决策]

## Progress
### Done
[已完成 — 具体文件路径、命令、结果]
### In Progress
[进行中的工作]
### Blocked
[阻塞或问题]

## Key Decisions
[重要技术决策及原因]

## Relevant Files
[读取/修改/创建的文件 + 简述]

## Next Steps
[下一步]

## Critical Context
[具体值、错误信息、配置细节]
```

**摘要预算动态缩放**：

| 参数 | 值 |
|------|-----|
| 公式 | content_tokens × 0.20 |
| 最小 | 2,000 tokens |
| 最大 | min(context_length × 0.05, 12,000) |

#### Phase 4：组装压缩后消息

- Head 消息（首次压缩时 system prompt 追加注释）
- Summary 消息（角色选择避免连续同角色违规）
- Tail 消息（不变）

`_sanitize_tool_pairs()` 清理孤立的 tool 对：
- 引用已删除 call 的 result → 删除
- result 被删除的 call → 注入 stub result

### 3.5 迭代再压缩

后续压缩时，前一次摘要传给 LLM，指令是**更新**而非从头摘要。信息在多次压缩中保持连续——"In Progress" → "Done"，新进展追加，过时信息移除。

### 3.6 Before/After 示例

**压缩前**：45 条消息，~95K tokens

```
[0]  system: prompt
[1]  user: "Help me set up a FastAPI project"
[2]  assistant: <tool_call> mkdir project
[3]  tool: "directory created"
...  30 more turns ...
[40] user: "Fix the failing tests"
[44] user: "Great, also add error handling"
```

**压缩后**：25 条消息，~45K tokens

```
[0] system: prompt + "[Note: Some earlier turns have been compacted...]"
[1] user: "Help me set up a FastAPI project"
[2] assistant: "[CONTEXT COMPACTION]
    ## Goal: Set up FastAPI project with tests and error handling
    ## Progress > Done: Created project, 5 endpoints, 8/10 tests passing
    ## In Progress: Fixing 2 failing tests
    ## Next Steps: Fix fixtures, add error handling"
[3] user: "Fix the failing tests"
...tail preserved intact...
```

---

## 四、Anthropic Prompt Caching

### 4.1 策略：`system_and_3`

Anthropic 允许最多 **4 个 cache_control 断点**：

```
Breakpoint 1: System prompt（跨所有轮次稳定）
Breakpoint 2: 倒数第 3 条非 system 消息 ─┐
Breakpoint 3: 倒数第 2 条非 system 消息  ├─ 滚动窗口
Breakpoint 4: 最后一条非 system 消息    ─┘
```

### 4.2 缓存感知设计

| 原则 | 实践 |
|------|------|
| 稳定的 system prompt | 不在中途修改（压缩仅首次追加注释） |
| 消息顺序关键 | 中间插入/删除消息会使后续缓存失效 |
| 压缩后恢复快 | system prompt 缓存存活；滚动窗口 1-2 轮后重新建立 |
| TTL 可选 | 默认 5m，长会话用 1h |

效果：多轮对话 **输入 token 成本降低约 75%**。

---

## 五、工具系统

### 5.1 自注册模型

每个工具模块在 **import 时** 调用 `registry.register()`：

```python
registry.register(
    name="terminal",
    toolset="terminal",
    schema={...},            # OpenAI function-calling schema
    handler=handle_terminal, # 执行函数
    check_fn=check_terminal, # 可选：可用性检查
    requires_env=["SOME_VAR"],
    is_async=False,
    emoji="💻",
)
```

### 5.2 工具发现流程

```
model_tools.py import
  → _discover_tools()
    → import 21 个核心工具模块
    → 每个模块触发 registry.register()
  → MCP 工具发现（从外部 MCP 服务器）
  → 插件工具发现
```

### 5.3 可用性检查（check_fn）

```python
if entry.check_fn:
    try:
        available = bool(entry.check_fn())
    except Exception:
        available = False  # 异常 = 不可用（fail-safe）
    if not available:
        continue  # 跳过此工具
```

结果 **每次调用缓存**，同一 check_fn 只执行一次。

### 5.4 Toolset 解析

**三种过滤模式**：

| 模式 | 行为 |
|------|------|
| `enabled_toolsets` 存在 | 只包含指定的 toolset |
| `disabled_toolsets` 存在 | 全部 toolset - 禁用的 |
| 都不存在 | 包含所有已知 toolset |

过滤后，`execute_code` 和 `browser_navigate` 的 schema 被动态修补，移除对不可用工具的引用（防止模型幻觉）。

### 5.5 工具分发流程

```
Model response with tool_call
  ↓
run_agent.py agent loop
  ↓
model_tools.handle_function_call(name, args, task_id, user_task)
  ↓
[Agent-loop 工具?] → 直接由 agent loop 处理
  (todo, memory, session_search, delegate_task)
  ↓
[Plugin pre-hook] → invoke_hook("pre_tool_call", ...)
  ↓
registry.dispatch(name, args, **kwargs)
  ↓
查找 ToolEntry
  ↓
[Async handler?] → _run_async() 桥接
[Sync handler?]  → 直接调用
  ↓
返回结果字符串
  ↓
[Plugin post-hook] → invoke_hook("post_tool_call", ...)
```

### 5.6 Agent-Level 工具（拦截）

四个工具在 registry dispatch 前被 `run_agent.py` 拦截：

| 工具 | 拦截原因 |
|------|---------|
| `todo` | 读写 Agent 本地任务状态 |
| `memory` | 写入持久记忆文件（有字符限制） |
| `session_search` | 查询 session 历史（需访问 session DB） |
| `delegate_task` | 生成子 Agent（需隔离上下文） |

这些工具的 schema 仍注册在 registry（供 `get_tool_definitions` 使用），但直接 dispatch 时返回 stub error。

### 5.7 串行 vs 并发执行

| 场景 | 行为 |
|------|------|
| 单个 tool_call | 主线程直接执行 |
| 多个 tool_call | `ThreadPoolExecutor` 并发执行 |
| 交互式工具（如 `clarify`） | 强制串行 |

结果按 **原始 tool_call 顺序** 重新插入，不管完成顺序。

### 5.8 Async 桥接

| 路径 | 策略 |
|------|------|
| CLI（无运行中的 event loop） | 使用持久 event loop（保活 async 客户端缓存） |
| Gateway（有运行中的 loop） | 新建一次性线程 + `asyncio.run()` |
| Worker 线程（并行工具） | Thread-local 持久 loop |

### 5.9 错误包装（双层）

| 层 | 位置 | 返回 |
|----|------|------|
| 1 | `registry.dispatch()` | `{"error": "Tool execution failed: ExceptionType: message"}` |
| 2 | `handle_function_call()` | `{"error": "Error executing tool_name: message"}` |

→ 模型**始终**收到格式良好的 JSON 字符串，绝不会收到未处理异常。

---

## 六、Callback 体系

| Callback | 触发时机 | 用于 |
|----------|---------|------|
| `tool_progress_callback` | 每个工具执行前/后 | CLI spinner、Gateway 进度消息 |
| `thinking_callback` | 模型开始/停止思考 | CLI "thinking..." 指示 |
| `reasoning_callback` | 模型返回推理内容 | CLI 推理展示、Gateway 推理块 |
| `clarify_callback` | clarify 工具被调用 | CLI 输入提示、Gateway 交互消息 |
| `step_callback` | 每个完整 agent turn 后 | Gateway 步骤追踪、ACP 进度 |
| `stream_delta_callback` | 每个流式 token | CLI 流式展示 |
| `tool_gen_callback` | 从流中解析出 tool_call | CLI spinner 中的工具预览 |
| `status_callback` | 状态变化（thinking/executing 等） | ACP 状态更新 |

---

## 七、关键源文件速查

| 文件 | 用途 | 规模 |
|------|------|------|
| `run_agent.py` | AIAgent — 完整 agent loop | ~9,200 行 |
| `cli.py` | HermesCLI — TUI 交互 | ~8,500 行 |
| `model_tools.py` | 工具 schema 收集 + dispatch | — |
| `toolsets.py` | Toolset 分组 + 平台预设 | — |
| `agent/prompt_builder.py` | System prompt 组装 | — |
| `agent/context_compressor.py` | 默认压缩引擎 | — |
| `agent/context_engine.py` | 上下文引擎 ABC | — |
| `agent/prompt_caching.py` | Anthropic prompt caching | — |
| `agent/auxiliary_client.py` | 辅助 LLM 客户端 | — |
| `agent/memory_manager.py` | 记忆管理编排 | — |
| `tools/registry.py` | 工具注册中心 | — |
| `tools/approval.py` | 危险命令检测 | — |
| `tools/terminal_tool.py` | 终端编排 | — |
| `gateway/run.py` | Gateway 消息分发 | ~7,500 行 |
| `gateway/session.py` | 会话持久化 | — |
| `hermes_state.py` | SQLite 状态 DB + FTS5 | — |

---

## 八、设计原则总结

| 原则 | 实践 |
|------|------|
| **Prompt 稳定** | System prompt 中途不变。不做 cache-breaking 修改（除显式操作如 `/model`） |
| **可观测执行** | 每个工具调用通过 callback 可见。CLI 有 spinner，Gateway 有进度消息 |
| **可中断** | API 调用和工具执行可随时被用户输入或信号取消 |
| **平台无关核心** | 一个 AIAgent 类服务 CLI/Gateway/ACP/Batch/API。平台差异在入口层，不在 Agent 里 |
| **松耦合** | MCP、插件、记忆提供商、RL 环境用 registry 模式 + `check_fn` 门控，无硬依赖 |
| **Profile 隔离** | 每个 profile（`hermes -p <name>`）有独立的 HOME/config/memory/sessions/Gateway PID，可并发 |

---

## 参考资料

- Agent Loop: <https://hermes-agent.nousresearch.com/docs/developer-guide/agent-loop>
- Prompt Assembly: <https://hermes-agent.nousresearch.com/docs/developer-guide/prompt-assembly>
- Context Compression: <https://hermes-agent.nousresearch.com/docs/developer-guide/context-compression-and-caching>
- Tools Runtime: <https://hermes-agent.nousresearch.com/docs/developer-guide/tools-runtime>
- Architecture Overview: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture>

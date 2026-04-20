---
title: "自进化 Agent：从'用完即弃'到'越用越强'"
date: 2026-04-20
tags:
  - AI Agent
  - Self-Evolving
  - Hermes Agent
  - Anthropic Managed Agents
  - OpenClaw
  - Memory
  - Skills
  - RL Training
  - Architecture
---

# 自进化 Agent：从"用完即弃"到"越用越强"

> **核心问题**：Agent 如何从一次性工具变成持续成长的数字员工？
>
> **调研日期**：2026-04-20
> **来源**：Hermes Agent 官方文档 + GitHub、Anthropic Managed Agents 官方文档、OpenClaw 官方文档

---

## 一、背景：传统 Agent 的三大痛点

### 1.1 无记忆——每次从零开始

传统 Agent（包括早期 ChatGPT、基于 LangChain 的 Agent）每次对话都是独立的。用户教会它的偏好、项目背景、技术决策，下次全部丢失。相当于每天都在培训一个新员工。

### 1.2 无积累——经验不能沉淀

Agent 完成了一个复杂任务（比如配置 Kubernetes 集群），但这个经验不会被结构化保存。下次遇到类似任务，它需要重新探索，而不是调用上次的成功路径。

### 1.3 无反哺——用户数据无法改进模型

用户与 Agent 的交互产生大量高质量的工具调用轨迹数据，但这些数据被丢弃，无法用来训练更好的模型。

### 1.4 2026 年的范式转移

2026 年 Q1-Q2，三个方案同时给出了不同的答案：

| 时间线 | 事件 |
|--------|------|
| 2025 年末 | Hermes Agent 开源，首创"自进化闭环"概念 |
| 2026-04-09 | Anthropic 发布 Managed Agents Beta，主打"解耦架构" |
| 持续迭代 | OpenClaw 以"多通道网关 + 插件"模式稳步发展 |

---

## 二、三大方案深度对比

### 2.1 总览

| 维度 | Hermes Agent | Anthropic Managed Agents | OpenClaw |
|------|-------------|-------------------------|----------|
| 开发者 | Nous Research | Anthropic | 社区开源 |
| GitHub ⭐ | 40k+ | N/A (API 服务) | 20k+ |
| 核心定位 | 自进化的本地 Agent | 托管式解耦 Agent 平台 | 多通道 AI 网关 |
| 架构理念 | 自进化闭环（记忆→技能→训练） | 三层解耦（Session/Harness/Sandbox） | 插件缝合（Gateway + Skills + Channels） |
| 部署模式 | 本地优先（$5 VPS 即可） | 云端托管（Anthropic 基础设施） | 本地自托管 |
| 模型锁定 | 无（18+ Provider） | Claude 独占 | 无（任意 OpenAI 兼容） |
| 开源协议 | MIT | 闭源 API | MIT |

### 2.2 记忆机制对比

**这是区分三者的核心维度。**

#### Hermes Agent：三层记忆体系

```
┌─────────────────────────────────────────┐
│  Layer 1: 短期（上下文窗口）               │
│  • 当前对话历史                            │
│  • 双层压缩（Gateway 85% + Agent 50%）    │
│  • 四阶段压缩算法（裁剪→边界→摘要→组装）    │
└─────────────────────────────────────────┘
          ↓ 跨 session 持久化
┌─────────────────────────────────────────┐
│  Layer 2: 长期（文件系统）                  │
│  • MEMORY.md — Agent 自主维护的长期记忆     │
│  • USER.md — 用户画像，跨 session 累积      │
│  • 冻结快照模式：session 启动时捕获一次      │
│    写入立即落盘，下次 session 生效           │
└─────────────────────────────────────────┘
          ↓ 检索
┌─────────────────────────────────────────┐
│  Layer 3: 跨 session 检索                  │
│  • SQLite FTS5 全文检索                    │
│  • session_search 工具：LLM 自动摘要       │
│  • 8 种外部记忆提供商（Honcho 等）          │
└─────────────────────────────────────────┘
```

**关键设计决策**：
- **冻结快照**：session 启动时一次性捕获 MEMORY + USER 到 system prompt，中途不刷新。Agent 写入的变更立即落盘，但在当前 session 的 prompt 中不可见，下次 session 才生效。目的：保持 system prompt 稳定 → 最大化 prompt caching 命中率
- **记忆 nudge**：Agent 被配置为定期主动审视对话，将值得记住的内容写入 MEMORY.md。不是被动等用户说"记住这个"
- **Honcho 辩证用户建模**：外部用户建模系统，每次对话后推断用户的潜在偏好、信念、目标

#### Anthropic Managed Agents：Session-as-Log

```
┌─────────────────────────────────────────┐
│  Session = 仅追加日志                      │
│  • Event 流（用户消息、工具调用、结果）     │
│  • 服务端持久化，可随时 fetch 完整历史      │
│  • 独立于模型——重启不丢记忆               │
│  • 内置 prompt caching + compaction       │
└─────────────────────────────────────────┘
          ↓ 多 session 间
┌─────────────────────────────────────────┐
│  Memory（Research Preview）               │
│  • 跨 session 记忆 API（需申请权限）       │
│  • 细节未公开                              │
└─────────────────────────────────────────┘
```

**关键差异**：Anthropic 把"记忆"理解为"日志的持久化"。Session 本身就是记忆载体，而不是像 Hermes 那样用一个独立的 MEMORY.md。优势是不丢数据；劣势是没有主动蒸馏——长 session 的历史会越来越长，需要依赖 compaction 来管理。

#### OpenClaw：Session Transcript + 文件系统

```
┌─────────────────────────────────────────┐
│  Session transcript                       │
│  • 每个频道/用户一个 session                │
│  • 上下文过大时自动 compaction              │
│  • 无跨 session 检索                       │
└─────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────┐
│  Workspace 文件                           │
│  • MEMORY.md / USER.md（约定，非强制）     │
│  • memory/*.md 日志文件                    │
│  • 完全靠 Agent 自觉维护                   │
└─────────────────────────────────────────┘
```

**评价**：OpenClaw 的记忆是"约定优于配置"——它提供了 workspace 文件系统，但具体怎么用完全靠 system prompt 里的约定（AGENTS.md）。没有内置 FTS5 检索，没有记忆 nudge，没有用户建模。灵活但粗糙。

### 2.3 技能积累对比

#### Hermes Agent：自动技能生成

这是 Hermes 最独特的能力——**Agent 自己创建技能文件**。

**触发条件**：当 Agent 完成一个需要 5+ 次工具调用的复杂任务后，系统 prompt 中的指令鼓励它将经验沉淀为 SKILL.md。

**技能文件结构**：

```yaml
# SKILL.md
---
name: kubernetes-deploy
description: Deploy apps to K8s cluster
version: 1.0.0
metadata:
  hermes:
    tags: [DevOps, Kubernetes]
    requires_toolsets: [terminal]
    config:
      - key: k8s.context
        description: Default kubectl context
---
# Kubernetes Deploy

## When to Use
触发条件

## Procedure
步骤 1...
步骤 2...

## Pitfalls
已知问题

## Verification
验证方法
```

**技能发现与加载**：
- Skills 索引被紧凑地嵌入 system prompt（Layer 7）
- 条件激活：`requires_toolsets`、`requires_tools`、`fallback_for_*` 控制什么时候显示
- 平台限制：`platforms: [macos]` 可以让技能只在特定 OS 上加载
- 运行时按需加载：Agent 需要时通过 `skill_view` 工具加载完整内容

**技能自改进**：技能在使用过程中会被 Agent 更新——发现新的 pitfall 就补充，步骤优化了就修改。这是真正的"越用越强"。

**开放标准**：兼容 [agentskills.io](https://agentskills.io) 开放标准，技能可跨 Agent 共享。

#### Anthropic Managed Agents：Harness 层

Managed Agents 没有"技能"概念。它的能力扩展通过两种方式：

1. **Agent 配置**：在创建 Agent 时定义 model + system prompt + tools + MCP servers
2. **Custom Tools**：开发者定义 JSON schema，Agent 调用时发出请求，开发者的代码执行后返回结果

```json
{
  "type": "custom",
  "name": "deploy_to_k8s",
  "description": "Deploy an app to Kubernetes",
  "input_schema": {
    "type": "object",
    "properties": {
      "manifest": {"type": "string"}
    }
  }
}
```

**评价**：能力扩展需要开发者介入（写 custom tool 的 handler），Agent 自身不能创建新能力。适合企业场景（可控），但缺乏自进化能力。

#### OpenClaw：ClawHub 插件

OpenClaw 的技能扩展通过 ClawHub 插件市场：
- 社区开发者发布 Skill（SKILL.md + scripts）
- 用户通过 `clawhub install <skill>` 安装
- Agent 根据 `<available_skills>` 列表按需加载

**评价**：类似 VS Code 插件市场。社区驱动，丰富度取决于生态。Agent 不能自己创建 skill（没有内置的自动生成机制），需要人工开发。

### 2.4 训练数据反哺（Hermes 独有）

这是 Hermes 与其他两者的根本性差异。

#### 架构：Atropos RL 环境框架

```
┌──────────────────────────────────────────┐
│ HermesAgentBaseEnv (继承 Atropos BaseEnv) │
│                                           │
│  ┌────────────┐   ┌──────────────┐       │
│  │ Agent Loop  │   │ Tool Context │       │
│  │ (多轮对话)   │   │ (沙箱访问)    │       │
│  └──────┬─────┘   └──────┬───────┘       │
│         │                │                │
│         ▼                ▼                │
│  ┌────────────────────────────┐           │
│  │ compute_reward(item,       │           │
│  │   result, ctx)             │           │
│  │ → 0.0 ~ 1.0               │           │
│  └────────────────────────────┘           │
└──────────────────────────────────────────┘
```

#### 三种工作模式

| 模式 | 用途 | 输出 |
|------|------|------|
| **evaluate** | 基准测试 | JSON 评测报告 |
| **process** | SFT 数据生成 | JSONL 轨迹文件 |
| **serve** | RL 训练 | 连接 Atropos API，GRPO 在线训练 |

#### 可用基准测试

| Benchmark | 任务数 | 测试内容 | 成本 |
|-----------|--------|---------|------|
| TerminalBench2 | 89 | 终端/编程/系统管理 | $50-200 |
| TBLite | 100 | TB2 子集，速度 2.6-8× | 更低 |
| YC-Bench | 多轮 | 长期战略决策（模拟创业 CEO） | $50-200 |

#### 完整闭环

```
日常使用 → 轨迹记录 → process 模式生成 SFT 数据
                          ↓
                    serve 模式连接 VLLM
                          ↓
                    GRPO 强化学习训练
                          ↓
                    下一代模型 ← 用自己的使用数据训练
```

**11 种工具调用解析器**：hermes, mistral, llama3_json, qwen, qwen3_coder, deepseek_v3, deepseek_v3_1, kimi_k2, longcat, glm45, glm47 — 支持几乎所有主流开源模型的训练。

**这意味着**：Hermes 不只是在技能层进化（MEMORY.md + SKILL.md），它还能在参数层进化——用自己的使用轨迹训练更好的基座模型。这是其他两个方案完全不具备的能力。

---

## 三、解耦架构深潜：Anthropic 的工程思路

### 3.1 四层概念模型

```
┌─────────────────────────────────────┐
│  Agent（配置层）                      │
│  model + system prompt + tools +     │
│  MCP servers + skills                │
│  → 版本化，可 pin 到特定版本          │
└──────────────┬──────────────────────┘
               │ 引用
┌──────────────▼──────────────────────┐
│  Environment（容器模板）              │
│  预装包 + 网络策略 + 挂载文件         │
└──────────────┬──────────────────────┘
               │ 实例化
┌──────────────▼──────────────────────┐
│  Session（运行实例）                  │
│  Agent + Environment = 一个任务空间   │
│  持久化文件系统 + 对话历史            │
│  支持 Vault（OAuth 凭据管理）         │
└──────────────┬──────────────────────┘
               │ 交互
┌──────────────▼──────────────────────┐
│  Events（消息流）                     │
│  SSE 流式返回                        │
│  支持中途 steer / interrupt           │
└─────────────────────────────────────┘
```

### 3.2 安全模型：Vault + 沙箱

| 层 | 机制 | 效果 |
|----|------|------|
| 凭据隔离 | Vault API — OAuth token 存在沙箱外 | Agent 看不见原始密钥 |
| 执行隔离 | 云端容器 — 每个 session 独立环境 | 互不影响 |
| 网络隔离 | Environment 级网络策略 | 控制 Agent 能访问什么 |
| 工具白名单 | `default_config.enabled: false` + 逐个开启 | 最小权限 |

### 3.3 内置工具集

| 工具 | 功能 |
|------|------|
| bash | Shell 命令 |
| read / write / edit | 文件操作 |
| glob / grep | 文件搜索 |
| web_fetch / web_search | 网页访问 |
| MCP servers | 外部工具集成 |
| Custom tools | 开发者自定义 |

### 3.4 多 Agent（Research Preview）

```json
{
  "type": "delegate",
  "agent": "agent_id_of_specialist",
  "environment_id": "env_for_specialist"
}
```

一个 Agent 可以委派子任务给其他 Agent，每个在独立沙箱中运行。

---

## 四、实际案例

### 4.1 Hermes 自动生成技能的完整流程

```
用户："帮我配置 Nginx 反向代理到我的 Node.js 应用"

→ Agent 执行 15+ 次工具调用：
  1. terminal: 检查 Nginx 版本
  2. read_file: 读取现有配置
  3. write_file: 写入新配置
  4. terminal: nginx -t 测试
  5. terminal: systemctl reload nginx
  6. web_extract: 验证 HTTPS
  ... 等等

→ 任务完成后，Agent 自动生成：
  ~/.hermes/skills/user-created/nginx-reverse-proxy/SKILL.md

→ 下次用户说"配置 Nginx"时：
  Agent 自动加载技能，跳过探索阶段，直接执行验证过的步骤
```

### 4.2 Managed Agents 的典型工作流

```python
# 1. 创建 Agent（一次性）
agent = client.beta.agents.create(
    name="Code Reviewer",
    model="claude-opus-4-7",
    tools=[{"type": "agent_toolset_20260401"}]
)

# 2. 创建 Environment（一次性）
env = client.beta.environments.create(
    packages=["python3", "node", "git"],
    network_access={"allowed_domains": ["github.com"]}
)

# 3. 启动 Session（每次任务）
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=env.id,
    vault_ids=[vault.id]  # OAuth 凭据
)

# 4. 发送任务，流式接收结果
events = client.beta.sessions.events.create(
    session_id=session.id,
    events=[{"type": "user", "content": "Review the PR at ..."}]
)
for event in events:
    print(event)
```

---

## 五、安全风险与教训

### 5.1 本地 Agent 的攻击面

本地运行的 Agent（Hermes、OpenClaw）拥有用户级别的完整权限。主要风险：

| 攻击向量 | 描述 | 缓解措施 |
|----------|------|---------|
| Prompt Injection | 恶意网页/邮件注入指令 | 内容安全扫描、`EXTERNAL_UNTRUSTED_CONTENT` 标记 |
| 命令注入 | Agent 被诱导执行危险命令 | 命令审批系统（`exec approvals`） |
| 数据泄露 | Agent 被诱导发送私人文件 | 外部操作需确认、网络策略 |
| 供应链攻击 | 恶意 Skill/Plugin | 代码审查、签名验证（有限） |

### 5.2 Hermes 的七层安全模型

1. 内容安全扫描（上下文文件注入检测）
2. 命令审批（危险命令拦截）
3. DM 配对（消息平台身份验证）
4. 容器隔离（Docker/Modal 后端）
5. 环境变量隔离（密钥不暴露给模型）
6. 凭据文件挂载（只读 bind mount）
7. 工具可用性门控（check_fn 按需启用）

### 5.3 Anthropic 的隔离优势

Anthropic 的方案在安全性上有结构性优势：
- **物理隔离**：代码在 Anthropic 云端容器中运行，Agent 无法访问用户本地文件
- **密钥保险库**：OAuth token 存在 Vault 中，Agent 只能通过 API 使用，看不到原始值
- **网络策略**：Environment 级别控制 Agent 能访问哪些域名

**代价**：失去本地数据的便利性，所有文件需要通过 API 上传到 Environment。

---

## 六、落地思考

### 6.1 企业场景适用性

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 个人开发者 / 小团队 | Hermes Agent | 自进化能力最强，$5 VPS 即可 |
| 企业内部工具 | Anthropic Managed Agents | 安全隔离好，API 易集成 |
| 多通道客服/助手 | OpenClaw | 多通道支持最成熟 |
| AI 研究团队 | Hermes Agent | 训练数据闭环独一无二 |
| 合规严格行业（金融/医疗） | Anthropic Managed Agents | 云端隔离 + 审计日志 |

### 6.2 自进化的边界

```
┌──────────────────────────────────────────────────────┐
│  Level 1: 记忆进化（三者都有，程度不同）                │
│  MEMORY.md / Session log / 文件系统                   │
│  → 记住用户偏好和历史决策                              │
├──────────────────────────────────────────────────────┤
│  Level 2: 技能进化（Hermes 独有的自动化）               │
│  任务经验 → 结构化 SKILL.md → 按需加载                 │
│  → 复杂任务从探索式变成模式化                          │
├──────────────────────────────────────────────────────┤
│  Level 3: 参数进化（Hermes 独有）                      │
│  使用轨迹 → SFT/GRPO 训练 → 下一代模型                │
│  → 基座模型本身变强                                    │
├──────────────────────────────────────────────────────┤
│  Level 4: 架构进化（目前无方案实现）                    │
│  Agent 自己改写 Agent Loop 代码                        │
│  → 超出当前安全边界                                    │
└──────────────────────────────────────────────────────┘
```

**当前共识**：Level 1-2 是安全可控的。Level 3 需要人类监督训练过程。Level 4 目前被视为不可接受的风险。

### 6.3 关键洞察

1. **"自进化"不是噱头**：Hermes 的三层闭环（记忆→技能→训练）是工程上可行的，不是 paper 上的概念
2. **解耦 ≠ 更好**：Anthropic 的解耦架构在安全和可扩展性上有优势，但牺牲了自进化能力
3. **本地 vs 云端是假二分法**：Hermes 支持 6 种终端后端（含 Modal serverless），实际上是"本地控制 + 远程执行"
4. **训练反哺是长期壁垒**：能用自己的使用数据训练模型的 Agent，每一天都在变强。这个飞轮一旦转起来，差距会指数级扩大
5. **安全是最大的风险**：自进化 Agent 拥有更多权限和自主性，攻击面也相应增大。Hermes 的七层安全模型和 Anthropic 的沙箱隔离代表了两种不同的安全哲学

---

## 七、数据快照

### Hermes Agent 关键数字

- **代码规模**：`run_agent.py` ~9,200 行，`cli.py` ~8,500 行，`gateway/run.py` ~7,500 行
- **工具数量**：48 个内置工具，40 个 Toolset
- **模型支持**：18+ Provider（OpenRouter 200+ 模型）
- **终端后端**：6 种（Local, Docker, SSH, Daytona, Singularity, Modal）
- **消息平台**：Telegram, Discord, Slack, WhatsApp, Signal, Email
- **RL 解析器**：11 种模型格式

### Anthropic Managed Agents 关键数字

- **状态**：Beta（`managed-agents-2026-04-01` header）
- **内置工具**：8 个（bash, read, write, edit, glob, grep, web_fetch, web_search）
- **SDK 语言**：Python, TypeScript, Go, Java, C#, PHP, Ruby, CLI
- **速率限制**：创建 60 req/min，读取 600 req/min
- **Research Preview 功能**：outcomes, multiagent, memory

---

## 参考资料

- Hermes Agent GitHub: <https://github.com/NousResearch/hermes-agent>
- Hermes 文档: <https://hermes-agent.nousresearch.com/docs/>
- Hermes Architecture: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture>
- Hermes Skills System: <https://hermes-agent.nousresearch.com/docs/user-guide/features/skills>
- Hermes Memory: <https://hermes-agent.nousresearch.com/docs/user-guide/features/memory>
- Hermes Creating Skills: <https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills>
- Hermes Environments & RL: <https://hermes-agent.nousresearch.com/docs/developer-guide/environments>
- Hermes Security: <https://hermes-agent.nousresearch.com/docs/user-guide/security>
- Anthropic Managed Agents Overview: <https://platform.claude.com/docs/en/managed-agents/overview>
- Anthropic Sessions API: <https://platform.claude.com/docs/en/managed-agents/sessions>
- Anthropic Tools: <https://platform.claude.com/docs/en/managed-agents/tools>
- Anthropic Building Effective Agents: <https://www.anthropic.com/engineering/building-effective-agents>
- OpenClaw Docs: <https://docs.openclaw.ai>
- Atropos RL Framework: <https://github.com/NousResearch/atropos>
- AgentSkills.io: <https://agentskills.io>

---

## 未收集到的资料（待补充）

- [ ] ClawHavoc 安全事件报告 — 未找到公开报告（URL 404），可能需要通过其他渠道获取
- [ ] MiniMax M2.7 自进化模型论文 — MiniMax 官网未提供直接链接，需进一步搜索
- [ ] Stanford 2026 AI Index — 报告页面加载失败（JS 渲染），需手动下载 PDF
- [ ] Hermes vs OpenClaw 社区评测 — 需搜索 Reddit/Twitter/Discord 社区讨论

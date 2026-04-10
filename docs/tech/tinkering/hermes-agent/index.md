---
title: Hermes Agent 深度解析
date: 2026-04-11
tags:
  - AI Agent
  - Hermes
  - Nous Research
  - 自主智能体
  - 自我进化
  - Agent Architecture
  - Skills
  - 学习闭环
---

# Hermes Agent 深度解析：会自我进化的 AI 智能体

> **来源**：[NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)（GitHub 40k+ ⭐）+ [官方文档](https://hermes-agent.nousresearch.com/docs/) + [新智元报道](https://mp.weixin.qq.com/s/7tOTJ1RWs0qbKkx_9vEoNg)（2026-04-10）
>
> **定位**：面向开发者，系统梳理 Hermes Agent 的架构、学习闭环、与 OpenClaw 的差异

---

## 一、一句话定位

**Hermes Agent 是 Nous Research 推出的自托管 AI 智能体，核心卖点是"越用越强"的学习闭环——它不只完成任务，还会从任务中沉淀记忆、创建技能、生成训练数据。**

Slogan：**"The agent that grows with you"**（一个会跟着你成长的 Agent）

| 属性 | 详情 |
|------|------|
| **GitHub** | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| **Stars** | 40k+（2026年4月） |
| **License** | MIT |
| **语言** | Python |
| **要求** | Linux / macOS / WSL2 / Android (Termux)，**不支持原生 Windows** |
| **安装** | 一行脚本：`curl -fsSL ... \| bash` |

---

## 二、为什么火？行业背景

2026 年 4 月，AI 智能体领域出现两大冲击波：

1. **Anthropic 发布 Managed Agents**（4月9日）：云端托管、沙箱隔离、Session/Harness/Sandbox 三层解耦，直接对标"本地 Agent 缝合怪"
2. **Hermes Agent 全网刷屏**：开源、自托管、自我进化，GitHub 狂揽 40k 星

两者都在暗示同一件事：**AI 操作系统化时代来了，单纯的"LLM + 工具插件"模式正在被升维淘汰。**

---

## 三、高层架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Entry Points                                 │
│  CLI (cli.py)       Gateway (gateway/run.py)      ACP (acp_adapter/)│
│  Batch Runner       API Server                    Python Library     │
└──────────┬──────────────┬───────────────────────┬────────────────────┘
           │              │                       │
           ▼              ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AIAgent (run_agent.py)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ Prompt       │ │ Provider     │ │ Tool         │                │
│  │ Builder      │ │ Resolution   │ │ Dispatch     │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ Compression  │ │ 3 API Modes  │ │ Tool Registry│                │
│  │ & Caching    │ │ chat_compl.  │ │ 48 tools     │                │
│  │              │ │ codex_resp.  │ │ 40 toolsets   │                │
│  │              │ │ anthropic    │ │              │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
           │                                │
           ▼                                ▼
┌───────────────────┐          ┌──────────────────────┐
│ Session Storage   │          │ Tool Backends         │
│ SQLite + FTS5     │          │ Terminal (6 backends) │
│                   │          │ Browser (5 backends)  │
│                   │          │ Web / MCP / File ...  │
└───────────────────┘          └──────────────────────┘
```

### 3.1 关键数字

| 组件 | 规模 |
|------|------|
| 核心 Agent Loop | `run_agent.py` ~9,200 行 |
| CLI 交互 | `cli.py` ~8,500 行 |
| 注册工具 | 48 个工具，40 个 toolset |
| 消息平台适配 | 15 个（Telegram/Discord/Slack/WhatsApp/Signal/飞书/钉钉/微信…） |
| 终端后端 | 6 个（local/Docker/SSH/Daytona/Modal/Singularity） |
| 浏览器后端 | 5 个 |
| LLM Provider | 18+（Nous Portal/OpenRouter/OpenAI/Anthropic/GLM/Kimi/MiniMax/Copilot…） |
| 测试 | 3,000+ 用例 |

---

## 四、核心特性 ⭐

### 4.1 三层学习闭环

这是 Hermes 最核心的差异化——**不是"做完就忘"，而是"一边干活一边升级自己"**。

```
第一层：记忆（Memory）
   ↓
第二层：技能（Skills）
   ↓
第三层：训练数据（Trajectories）
```

#### 第一层：记忆

| 文件 | 用途 | 容量 |
|------|------|------|
| `MEMORY.md` | Agent 的个人笔记（环境、惯例、经验） | 2,200 字符（~800 tokens） |
| `USER.md` | 用户画像（偏好、沟通风格） | 1,375 字符（~500 tokens） |

- 存储在 `~/.hermes/memories/`，每次 session 启动注入系统 prompt
- 支持 `add` / `replace` / `remove` 操作
- 内置安全扫描：防止 prompt injection 注入到记忆中
- **跨会话检索**：SQLite FTS5 全文搜索 + LLM 摘要
- 外部记忆提供商：Honcho / Mem0 / OpenViking 等 8 种插件

> 核心理念：以前聊过的事，它不一定原封不动记住；但能把旧信息捞出来，快速压缩成当前可用的上下文。

#### 第二层：技能（自主创建+自我改进）

触发条件：
- 完成复杂任务（5+ 工具调用）后自动回顾
- 踩坑后记录解决路径
- 用户纠正方法后
- 发现非平凡工作流后

Agent 通过 `skill_manage` 工具自主创建/修改技能：

| 操作 | 用途 |
|------|------|
| `create` | 从零创建新技能 |
| `patch` | 局部修复（推荐，省 token） |
| `edit` | 大幅改写 |
| `delete` | 删除技能 |
| `write_file` | 添加辅助文件 |

> **别的智能体在消耗上下文，Hermes 在沉淀上下文。**

#### 第三层：训练数据

- 内置批量轨迹生成能力（`batch_runner.py`）
- 接入 Atropos 强化学习环境
- 轨迹压缩 → ShareGPT 格式 → 可直接用于训练下一代模型

> 每天交给它的活，不只是被完成了，还可能变成下一代模型的训练素材。

---

### 4.2 Skills 系统

兼容 [agentskills.io](https://agentskills.io) 开放标准。

**按需加载（Progressive Disclosure）**：

```
Level 0: skills_list()       → 名称+描述列表（~3k tokens）
Level 1: skill_view(name)    → 完整内容+元数据
Level 2: skill_view(name, path) → 某个参考文件
```

**技能来源**：

| 来源 | 说明 |
|------|------|
| 本地 `~/.hermes/skills/` | 主目录，Agent 可读写 |
| 外部目录（`external_dirs`） | 只读扫描 |
| Skills Hub | 多个在线源：official / skills.sh / well-known / GitHub / ClawHub |
| Agent 自主创建 | 通过 `skill_manage` 工具 |

**条件激活**：

```yaml
metadata:
  hermes:
    fallback_for_toolsets: [web]  # 仅在这些 toolset 不可用时显示
    requires_toolsets: [terminal] # 仅在这些 toolset 可用时显示
```

---

### 4.3 多模型支持（零锁定）

`hermes model` 一键切换，支持 18+ 提供商：

| 提供商 | 接入方式 |
|--------|---------|
| Nous Portal | OAuth 登录 |
| OpenRouter | API Key（200+ 模型） |
| Anthropic | Claude Code Auth / API Key |
| OpenAI / Codex | OAuth |
| GitHub Copilot | OAuth / Token |
| Z.AI / GLM | API Key |
| Kimi / Moonshot | API Key |
| MiniMax | API Key |
| 阿里云 / DashScope | API Key |
| Hugging Face | HF_TOKEN |
| DeepSeek | API Key |
| 自定义端点 | vLLM / SGLang / Ollama 等 |

---

### 4.4 终端后端（6种）

| 后端 | 场景 |
|------|------|
| **local** | 本机直接执行 |
| **docker** | Docker 容器隔离 |
| **ssh** | 远程服务器 |
| **daytona** | Serverless 持久化（闲置休眠） |
| **modal** | Serverless GPU（闲置近零成本） |
| **singularity** | HPC 集群 |

> 可以在 \$5 VPS 跑，也可以在 GPU 集群跑。Agent 不绑定你的笔记本——你用 Telegram 聊天，它在云端 VM 工作。

---

### 4.5 安全模型（七层纵深）

| 层 | 机制 |
|----|------|
| 1 | 用户授权（allowlist + DM pairing 配对码） |
| 2 | 危险命令审批（manual / smart / off 三模式） |
| 3 | 容器隔离（Docker/Singularity/Modal） |
| 4 | MCP 凭据过滤 |
| 5 | 上下文文件扫描（prompt injection 检测） |
| 6 | 跨 session 隔离 |
| 7 | 输入清洗 |

**DM 配对流程**：
未知用户 → Bot 回复 8 位配对码 → 管理员 `hermes pairing approve` → 永久授权

---

### 4.6 消息网关

单一 Gateway 进程，15 个平台适配器：

Telegram / Discord / Slack / WhatsApp / Signal / Matrix / Mattermost / Email / SMS / 钉钉 / 飞书 / 企业微信 / 微信 / BlueBubbles / Home Assistant / Webhook

语音转写、跨平台会话连续性均已内置。

---

### 4.7 定时自动化

内置 Cron 调度器，任务用自然语言描述：

```
> Every morning at 9am, check Hacker News for AI news 
  and send me a summary on Telegram.
```

Agent 自动创建定时任务，通过 Gateway 投递到任意平台。

---

## 五、Hermes vs OpenClaw 对比

| 维度 | OpenClaw | Hermes |
|------|---------|--------|
| **语言** | TypeScript (Node.js) | Python |
| **Windows 原生** | ✅ 原生支持 | ❌ 需 WSL2 |
| **安装** | npm 安装 | curl 一行脚本 |
| **Agent Loop** | piembeddedrunner.ts | run_agent.py（9,200 行） |
| **Skills** | ClawHub + agentskills | Skills Hub + agentskills + skills.sh + well-known |
| **技能自我创建** | ❌ 不支持 | ✅ skill_manage 工具自主创建/修改 |
| **记忆** | MEMORY.md + memory_search | MEMORY.md + USER.md + FTS5 + 8 种外部提供商 |
| **训练数据闭环** | ❌ | ✅ 轨迹生成 + Atropos RL |
| **终端后端** | 本地 + Docker | 6 种（+ Daytona/Modal serverless） |
| **浏览器** | Chromium 自动化 | 5 种浏览器后端 |
| **消息平台** | 20+（含飞书等国内平台） | 15 个（含钉钉/飞书/企业微信/微信） |
| **API Mode** | 单一（chat completions） | 3 种（chat_compl / codex_resp / anthropic） |
| **安全层数** | 6 层 | 7 层 |
| **MCP** | ✅ | ✅ |
| **ACP/IDE** | ✅ sessions_spawn | ✅ acp_adapter |
| **迁移** | — | `hermes claw migrate` 一键从 OpenClaw 迁移 |

---

## 六、从 OpenClaw 迁移

Hermes 内置迁移工具：

```bash
hermes claw migrate              # 交互式迁移
hermes claw migrate --dry-run    # 预览
hermes claw migrate --preset user-data  # 仅迁移数据，不迁密钥
```

迁移内容：SOUL.md / MEMORY.md / USER.md / 自定义 Skills / 命令白名单 / 消息配置 / API Key / TTS 资源 / AGENTS.md

---

## 七、Anthropic Managed Agents 简述

同一时期（2026年4月9日）Anthropic 发布的云端方案，作为对比参考：

**核心理念**：Session（会话日志）+ Harness（框架）+ Sandbox（沙箱）三层解耦

| 特性 | Managed Agents |
|------|---------------|
| **部署** | 云端托管，非自托管 |
| **解耦** | 大脑(模型) ≠ 双手(沙箱) ≠ 记忆(日志) |
| **上下文** | 会话是日志，非窗口→突破上下文限制 |
| **多 Agent** | 一个大脑可调度多只"手" |
| **安全** | Token 存沙箱外部保险库，AI 看不见密钥 |
| **性能** | p50 TTFT ↓60%，p95 ↓90%+ |
| **状态** | Beta（`managed-agents-2026-04-01`） |
| **绑定** | Claude only |

> Managed Agents = 云端、闭源、Claude 绑定、企业级
> Hermes = 自托管、开源、模型无关、个人/开发者向

---

## 八、核心观点

1. **学习闭环是真正的差异化**：记忆 → 技能 → 训练数据，这条链路让 Hermes 从"工具"升级为"会成长的伙伴"
2. **技能自我创建是杀手锏**：别的 Agent 消耗上下文，Hermes 沉淀上下文。5 次工具调用以上的复杂任务自动产出可复用技能
3. **"不养宠物"思想延伸**：终端后端支持 Daytona/Modal serverless，闲置零成本，告别"always-on 笔记本"
4. **OpenClaw 不必恐慌但应借鉴**：迁移通道已打通，真正的竞争力在于 Skills 生态和记忆系统的深度
5. **行业趋势确认**：无论 Managed Agents 还是 Hermes，都在说同一件事——AI Agent 正在从"工具集合"进化为"操作系统"

---

## 参考资料

- GitHub: <https://github.com/NousResearch/hermes-agent>
- 官方文档: <https://hermes-agent.nousresearch.com/docs/>
- 新智元报道: <https://mp.weixin.qq.com/s/7tOTJ1RWs0qbKkx_9vEoNg>
- Anthropic Managed Agents: <https://platform.claude.com/docs/zh-CN/managed-agents/overview>
- Skills Hub: <https://agentskills.io>

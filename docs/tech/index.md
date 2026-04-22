---
hide:
  - toc
---

# :material-cpu-64-bit: 技术笔记

> 把学到的东西写下来，让未来的自己少走弯路。

---

## :material-brain: AI 算法

大模型训练、安全对齐、数据集工程等前沿实践。

### 📝 训练知识体系

| 文章 | 简介 |
| :--- | :--- |
| [模型训练笔记地图](ai-algorithms/current-llm-training-notes-map/index.md) | 当前训练知识结构总览与补全方向 |
| [LLM 训练资料索引](ai-algorithms/llm-training-reading-map/index.md) | 课程→论文→工程→中文项目的阅读主线 |
| [安全 DPO 数据集设计](ai-algorithms/safety-dpo-dataset-design/index.md) | LLM 安全对齐的数据集工程实践 |

### 📄 Tech Report 精读

| 文章 | 来源 | 关键词 |
| :--- | :--- | :--- |
| [DeepSeek-R1](ai-algorithms/deepseek-r1-tech-report/index.md) | DeepSeek | GRPO 训练 + 蒸馏 Pipeline |
| [Skywork Open Reasoner](ai-algorithms/skywork-open-reasoner/index.md) | 昆仑万维 | MAGIC 策略 + Entropy Collapse |
| [Open-R1](ai-algorithms/open-r1/index.md) | HuggingFace | R1 开源复现全流程 |
| [AceReason-Nemotron](ai-algorithms/acereason-nemotron/index.md) | NVIDIA | MathCode 两阶段 RL |
| [Open-Reasoner-Zero](ai-algorithms/open-reasoner-zero/index.md) | 开源 | 纯粹 PPO 方案 |
| [verl 框架](ai-algorithms/verl-framework/index.md) | 字节跳动 | RL 训练框架全景解析 |
| [Llama-Nemotron 数据集](ai-algorithms/llama-nemotron-post-training-dataset/index.md) | NVIDIA | 3300万后训练数据集 |
| [Self-Rewarding LMs 系列](ai-algorithms/self-rewarding-language-models/index.md) | Meta / Apple | 自我奖励三部曲 |

### 🔧 量化优化

| 文章 | 来源 | 关键词 |
| :--- | :--- | :--- |
| [Google TurboQuant](ai-algorithms/google-turboquant/index.md) | Google Research | KV Cache 6x 压缩 + 8x 加速 |

### 🤖 AI Agent 生态

| 文章 | 来源 | 关键词 |
| :--- | :--- | :--- |
| [CoPaw + AgentScope 生态](ai-algorithms/copaw-agentscope-ecosystem/index.md) | 阿里 AgentScope | Python Agent 开发全栈 |
| [AutoResearch 生态](ai-algorithms/autoresearch-ecosystem/index.md) | Karpathy 等 | AI 自动化科研 |

---

## :material-server-network: 后端

API 设计、服务架构、部署运维相关笔记。

!!! note "暂无文章"
    这个栏目刚开张，敬请期待～

---

## :material-wrench: 折腾记录

工具链配置、环境搭建、各种奇技淫巧。

| 文章 | 简介 |
| :--- | :--- |
| [OpenClaw 架构深度解析](tinkering/openclaw-architecture/index.md) | AI Agent 网关架构全解 |
| [Hermes Agent 深度解析](tinkering/hermes-agent/index.md) | Nous Research 自进化 Agent 技术笔记 |
| [Hermes Agent 技术进阶](tinkering/hermes-agent/advanced.md) | 架构、记忆、技能系统进阶 |
| [自进化 Agent 调研](tinkering/self-evolving-agent/index.md) | 三大方案深度对比 |

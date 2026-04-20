---
hide:
  - toc
---

<style>
.md-content__inner { max-width: none !important; }
.cute-hero {
  text-align: center;
  padding: 4rem 1rem 2rem;
  position: relative;
}
.cute-hero h1 {
  font-size: 3em !important;
  border-left: none !important;
  padding-left: 0 !important;
  text-align: center;
  background: linear-gradient(135deg, #1488E6, #FFB6C1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent !important;
  background-clip: text;
}
.cute-subtitle {
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
  font-size: 0.85em;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #FFB6C1;
  margin-bottom: 0.5rem;
}
.cute-tagline {
  font-size: 1.1em;
  color: #666;
  max-width: 650px;
  margin: 0 auto 2rem;
  line-height: 1.9;
}
.cute-tagline strong {
  color: #1488E6;
}
.cute-section {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
  font-size: 1.1em;
  font-weight: 800;
  color: #1488E6 !important;
  margin: 2.5rem 0 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px dashed #FFB6C1;
}
.cute-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(20, 136, 230, 0.15), rgba(255, 182, 193, 0.3), transparent);
  margin: 2rem 0;
  border-radius: 2px;
}
.cute-footer-msg {
  text-align: center;
  font-family: 'Nunito', 'Noto Sans SC', sans-serif;
  font-size: 0.85em;
  font-weight: 600;
  color: rgba(20, 136, 230, 0.3);
  padding: 3em 0 1em;
}
.cute-sticker-row {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 1.5em;
}
.cute-sticker-row span {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
  margin: 0 0.3em;
}
.cute-sticker-row span:nth-child(2) { animation-delay: 0.5s; }
.cute-sticker-row span:nth-child(3) { animation-delay: 1s; }
.cute-sticker-row span:nth-child(4) { animation-delay: 1.5s; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.cute-badge-label {
  display: inline-block;
  font-family: 'Nunito', sans-serif;
  font-size: 0.7em;
  font-weight: 700;
  padding: 0.15em 0.6em;
  border-radius: 20px;
  margin-bottom: 0.3em;
}
.badge-sky { background: rgba(20, 136, 230, 0.15); color: #1488E6; }
.badge-pink { background: rgba(255, 182, 193, 0.3); color: #FF8BA7; }
.badge-yellow { background: rgba(255, 209, 0, 0.2); color: #CC8800; }
</style>

<div class="cute-hero" markdown>

<div class="cute-sticker-row">
  <span>🌸</span><span>✨</span><span>🐳</span><span>🐾</span>
</div>

<div class="cute-subtitle">💕 欢迎来到灵宝的小窝~</div>

# LINGBAO HOME

<div class="cute-tagline">
一个中文优先的文档站，按「技术 / 生活」双主栏组织内容。<br>
首版聚焦 <strong>稳定写作</strong> 和 <strong>持续发布</strong>，轻装上阵 🎀
</div>

</div>

<div class="cute-divider"></div>

<div class="cute-section">🗺️ 导航入口</div>

<div class="grid cards" markdown>

-   :material-cpu-64-bit:{ .lg .middle } <span class="cute-badge-label badge-sky">技术区</span> **技术档案**

    ---

    AI 算法、后端架构、折腾记录……把踩过的坑变成可复用的知识 📝

    [:octicons-arrow-right-24: 去看看](tech/index.md)

-   :material-coffee-outline:{ .lg .middle } <span class="cute-badge-label badge-pink">生活区</span> **生活记录**

    ---

    记录生活中值得写下来的事，不求完美，只求真实 🌷

    [:octicons-arrow-right-24: 去看看](life/index.md)

-   :material-tag-multiple:{ .lg .middle } <span class="cute-badge-label badge-yellow">索引</span> **标签索引**

    ---

    跨栏目内容检索 — 按标签浏览所有文章 🔖

    [:octicons-arrow-right-24: 去看看](tags/index.md)

</div>

<div class="cute-divider"></div>

<div class="cute-section">📮 最新内容</div>

| 文章 | 栏目 | 说明 |
| :--- | :--- | :--- |
| [模型训练笔记地图](tech/ai-algorithms/current-llm-training-notes-map/index.md) | 技术 · AI 算法 | 当前训练知识结构总览与补全方向 |
| [LLM 训练资料索引](tech/ai-algorithms/llm-training-reading-map/index.md) | 技术 · AI 算法 | 课程→论文→工程→中文项目的阅读主线 |
| [安全 DPO 数据集设计](tech/ai-algorithms/safety-dpo-dataset-design/index.md) | 技术 · AI 算法 | LLM 安全对齐的数据集工程实践 |
| [待产与新生儿购物清单](life/essays/pregnancy-newborn-shopping-checklist/index.md) | 生活 · 随笔 | 从研究到下单的完整清单 |
| [孕 30 周→产后 3 个月时间线](life/essays/pregnancy-birth-postpartum-timeline/index.md) | 生活 · 随笔 | 关键节点与待办事项规划 |

<div class="cute-divider"></div>

<div class="cute-section">📝 写作约定</div>

!!! note "内容模型 🌸"
    每篇文章使用 **单独文件夹** 承载，目录内保留 `index.md` 与资源文件，路径统一使用 `kebab-case`。

<div class="cute-divider"></div>

<div class="cute-section">🎯 计划清单</div>

- [x] 基础站点搭建 & CI 自动部署 ✅
- [x] 技术 / 生活 双栏目结构 ✅
- [x] 标签系统 & 文章元数据 ✅
- [x] 可爱清新主题 🌸 ✅
- [x] 定制 404 页面 🐾 ✅
- [ ] Giscus 评论系统（配置 repo-id 后激活）
- [ ] Umami 站点统计
- [ ] RSS 订阅
- [ ] 自定义域名

<div class="cute-divider"></div>


## :material-new-box: 最新笔记

<div class="grid cards" markdown>

-   :material-brain: **自进化 Agent 调研**

    ---

    Agent 如何从一次性工具变成持续成长的数字员工？三大方案深度对比：Hermes Agent / Anthropic Managed Agents / OpenClaw

    [:octicons-arrow-right-24: 阅读全文](tech/tinkering/self-evolving-agent/index.md)

-   :material-robot: **Hermes Agent 技术笔记**

    ---

    Nous Research 出品的自进化 Agent 深度解析：架构、记忆、技能系统、训练闭环

    [:octicons-arrow-right-24: 阅读全文](tech/tinkering/hermes-agent/index.md)

-   :material-cog: **OpenClaw 架构解析**

    ---

    AI Agent 网关架构全解：Agent Loop、Skills、Tools、多通道、Sub-Agents

    [:octicons-arrow-right-24: 阅读全文](tech/tinkering/openclaw-architecture/index.md)

</div>

<div class="cute-divider"></div>

<div class="cute-footer-msg">
  🌸 用文字记录，让时间有迹可循 ✨
</div>

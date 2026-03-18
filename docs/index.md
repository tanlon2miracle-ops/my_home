---
hide:
  - toc
---

<style>
.md-content__inner { max-width: none !important; }
.eva-hero {
  text-align: center;
  padding: 4rem 1rem 2rem;
  position: relative;
  overflow: hidden;
}
.eva-hero::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(220, 38, 38, 0.02) 2px,
    rgba(220, 38, 38, 0.02) 4px
  );
  pointer-events: none;
}
.eva-hero h1 {
  font-size: 3.2em !important;
  border-left: none !important;
  padding-left: 0 !important;
  text-align: center;
}
.eva-subtitle {
  font-family: 'Orbitron', monospace;
  font-size: 0.8em;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(220, 38, 38, 0.6);
  margin-bottom: 1rem;
}
.eva-tagline {
  font-size: 1.15em;
  color: rgba(224, 224, 224, 0.8);
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.8;
}
.eva-tagline strong {
  color: #ff6600;
  text-shadow: 0 0 8px rgba(255, 102, 0, 0.3);
}
.eva-section {
  display: flex;
  align-items: center;
  gap: 0.6em;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ff6600 !important;
  margin: 2.5rem 0 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dc2626;
  text-shadow: 0 0 10px rgba(255, 102, 0, 0.3);
}
.eva-section::before {
  content: "▸";
  color: #dc2626;
}
.eva-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.4), transparent);
  margin: 2rem 0;
}
.eva-footer-msg {
  text-align: center;
  font-family: 'Orbitron', monospace;
  font-size: 0.75em;
  letter-spacing: 0.15em;
  color: rgba(220, 38, 38, 0.4);
  padding: 3em 0 1em;
  text-transform: uppercase;
}
.eva-nerv-logo {
  font-family: 'Orbitron', monospace;
  font-size: 0.6em;
  letter-spacing: 0.3em;
  color: rgba(220, 38, 38, 0.15);
  text-align: center;
  margin-top: -0.5em;
  margin-bottom: 2em;
}
</style>

<div class="eva-hero" markdown>

<div class="eva-subtitle">NERV DOCUMENTATION SYSTEM</div>

# LINGBAO HOME

<div class="eva-nerv-logo">GOD'S IN HIS HEAVEN. ALL'S RIGHT WITH THE WORLD.</div>

<div class="eva-tagline">
一个中文优先的文档站，按「技术 / 生活」双主栏组织内容。<br>
首版聚焦 <strong>稳定写作</strong> 和 <strong>持续发布</strong>，轻装上阵。
</div>

</div>

<div class="eva-divider"></div>

<div class="eva-section">NAVIGATION — 快速导航</div>

<div class="grid cards" markdown>

-   :material-cpu-64-bit:{ .lg .middle } **技术笔记**

    ---

    AI 算法、后端架构、折腾记录……把踩过的坑变成可复用的知识。

    [:octicons-arrow-right-24: 进入技术区](tech/index.md)

-   :material-coffee-outline:{ .lg .middle } **生活随笔**

    ---

    记录生活中值得写下来的事，不求完美，只求真实。

    [:octicons-arrow-right-24: 进入生活区](life/index.md)

</div>

<div class="eva-divider"></div>

<div class="eva-section">LATEST — 最新内容</div>

| 文章 | 栏目 | 说明 |
| :--- | :--- | :--- |
| [安全 DPO 数据集设计](tech/ai-algorithms/safety-dpo-dataset-design/index.md) | 技术 · AI 算法 | LLM 安全对齐的数据集工程实践 |
| [待产与新生儿购物清单](life/essays/pregnancy-newborn-shopping-checklist/index.md) | 生活 · 随笔 | 从研究到下单的完整清单 |
| [孕 30 周→产后 3 个月时间线](life/essays/pregnancy-birth-postpartum-timeline/index.md) | 生活 · 随笔 | 关键节点与待办事项规划 |

<div class="eva-divider"></div>

<div class="eva-section">PROTOCOL — 写作约定</div>

!!! note "内容模型"
    每篇文章使用 **单独文件夹** 承载，目录内保留 `index.md` 与资源文件，路径统一使用 `kebab-case`。

<div class="eva-divider"></div>

<div class="eva-section">ROADMAP — 后续计划</div>

- [x] 基础站点搭建 & CI 自动部署
- [x] 技术 / 生活 双栏目结构
- [x] 标签系统
- [ ] 自定义域名（调整 `site_url` + `CNAME`）
- [ ] 评论系统集成（Giscus）
- [ ] 站点统计（Umami Analytics）
- [ ] RSS 订阅支持

<div class="eva-divider"></div>

<div class="eva-footer-msg">
  NERV DOCUMENTATION SYSTEM — BUILT WITH MKDOCS MATERIAL — ALWAYS UPDATING
</div>

---
hide:
  - toc
---

<style>
.md-content__inner { max-width: none !important; }
.hero-section {
  text-align: center;
  padding: 3rem 1rem 2rem;
  position: relative;
}
.hero-section h1 {
  font-size: 3em !important;
  margin-bottom: 0.3em;
}
.hero-tagline {
  font-size: 1.25em;
  color: var(--md-default-fg-color--light);
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.8;
}
.hero-tagline strong {
  color: #c084fc;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1.5em;
  font-weight: 800;
  margin: 2.5rem 0 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid;
  border-image: linear-gradient(135deg, #ff6b9d, #c084fc, #60a5fa) 1;
}
.footer-msg {
  text-align: center;
  color: var(--md-default-fg-color--lighter);
  font-size: 0.9em;
  padding: 3em 0 1em;
}
</style>

<div class="hero-section" markdown>

# 🏠 Lingbao Home

<div class="hero-tagline">
一个中文优先的文档站，按「技术 / 生活」双主栏组织内容。<br>
首版聚焦 <strong>稳定写作</strong> 和 <strong>持续发布</strong>，轻装上阵 ✨
</div>

</div>

---

<div class="section-title">🧭 快速导航</div>

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

---

<div class="section-title">🔥 最新内容</div>

| 文章 | 栏目 | 说明 |
| :--- | :--- | :--- |
| [安全 DPO 数据集设计](tech/ai-algorithms/safety-dpo-dataset-design/index.md) | 技术 · AI 算法 | LLM 安全对齐的数据集工程实践 |
| [待产与新生儿购物清单](life/essays/pregnancy-newborn-shopping-checklist/index.md) | 生活 · 随笔 | 从研究到下单的完整清单 |
| [孕 30 周→产后 3 个月时间线](life/essays/pregnancy-birth-postpartum-timeline/index.md) | 生活 · 随笔 | 关键节点与待办事项规划 |
| [用 MkDocs 搭站点](tech/backend/hello-mkdocs/index.md) | 技术 · 后端 | 本站的搭建过程复盘 |
| [本地写作与发布工作流](tech/tinkering/local-writing-workflow/index.md) | 技术 · 折腾 | 从 Markdown 到上线的自动化流程 |

---

<div class="section-title">📝 写作约定</div>

!!! note "内容模型"
    每篇文章使用 **单独文件夹** 承载，目录内保留 `index.md` 与资源文件，路径统一使用 `kebab-case`。

---

<div class="section-title">🚀 后续计划</div>

- [x] 基础站点搭建 & CI 自动部署
- [x] 技术 / 生活 双栏目结构
- [ ] 自定义域名（调整 `site_url` + `CNAME`）
- [ ] RSS 订阅支持
- [ ] 评论系统集成（Giscus / Utterances）
- [ ] 站点统计（Google Analytics / Umami）

---

<div class="footer-msg">
  用 ❤️ 和 MkDocs Material 构建 · 内容持续更新中 ✨
</div>

# MkDocs + GitHub Pages 博客基线方案

这是一个中文优先的 MkDocs Material 静态站点骨架，信息架构固定为“技术 / 生活”双主栏，部署方式固定为 GitHub Pages 官方 Actions Artifact 流程。

## 本地开发

当前仓库按你要求将 Python 基线文档和 CI 固定为 3.10，但这台机器当前可见的 `python3` 是 3.14，且未发现 `python3.10`。如果你希望本地和 CI 完全一致，需要自行安装 3.10 并改用 `python3.10` 创建虚拟环境。

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

本地严格构建命令：

```bash
mkdocs build --strict
```

## 目录结构

```text
.
├── .github/workflows/pages.yml
├── templates/article-template.md
├── docs/
│   ├── index.md
│   ├── javascripts/mermaid-init.js
│   ├── tech/
│   │   ├── index.md
│   │   ├── ai-algorithms/
│   │   │   ├── index.md
│   │   │   └── safety-dpo-dataset-design/index.md
│   │   ├── backend/
│   │   │   ├── index.md
│   │   │   └── hello-mkdocs/index.md
│   │   └── tinkering/
│   │       ├── index.md
│   │       └── local-writing-workflow/index.md
│   └── life/
│       ├── index.md
│       └── essays/
│           ├── index.md
│           └── the-first-week/index.md
├── mkdocs.yml
└── requirements.txt
```

文章约定：

- Markdown 是唯一内容源
- 文件与目录统一使用 `kebab-case`
- 每篇文章使用“单独文件夹 + index.md + 同目录资源”
- 推荐路径形如 `docs/tech/backend/my-first-post/index.md`
- 对外 URL 形如 `/tech/backend/my-first-post/`
- 可复用模板位于 `templates/article-template.md`

## 部署

唯一发布入口是 `main` 分支的 `push`。GitHub Actions 会执行：

1. `actions/checkout`
2. `actions/setup-python@v5`
3. `pip install -r requirements.txt`
4. `mkdocs build --strict`
5. `actions/configure-pages`
6. `actions/upload-pages-artifact`
7. `actions/deploy-pages`

GitHub Pages 仓库设置需要选择 `Build and deployment: GitHub Actions`。

## 首次上线前要改的占位项

- 当前 `site_url` 已配置为 `https://tanlon2miracle-ops.github.io/my_home/`
- 仓库若改名，确认 `mkdocs.yml` 中的 URL 一并更新
- 首发文章已接入 `AI 算法 / 安全 DPO 数据集设计`

## 自定义域名预留位

当前首版不启用自定义域名，但流程已经预留：

1. 将 `mkdocs.yml` 的 `site_url` 改为正式域名
2. 提交 `docs/CNAME`，让构建产物根目录自动带上 `CNAME`
3. GitHub Pages 后台填写自定义域名并开启 HTTPS
4. 子域名优先使用 DNS `CNAME` 指向 `tanlon2miracle-ops.github.io`

## 新文章建议流程

1. 复制 `templates/article-template.md`
2. 在目标栏目下创建 `kebab-case` 文件夹
3. 将内容保存为该目录下的 `index.md`
4. 如需图片或附件，放在同目录
5. 同步更新 `mkdocs.yml` 导航，或至少在栏目页补一条入口

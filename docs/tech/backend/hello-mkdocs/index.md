---
tags:
  - MkDocs
  - 建站
  - 工具
date: 2026-03-11
---
# 用 MkDocs 搭一个能持续写的站点

这是一篇示例文章，用来确认栏目内的文章路径、目录结构和站内链接都符合预期。

## 为什么选 MkDocs

- 配置成本低，适合以文档为主的内容模型
- Markdown 直出，便于长期维护
- Material 主题成熟，中文体验稳定

## 当前约定

!!! note "目录结构"
    每篇文章一个文件夹，正文固定写在 `index.md`，图片和附件跟正文放在同目录。

## 示例代码

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

## 相关入口

- [返回后端栏目](../index.md)
- [返回首页](../../../index.md)



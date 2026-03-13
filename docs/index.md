# 首页

欢迎来到这个中文优先的文档站。

这个站点按“技术 / 生活”双主栏组织内容，首版聚焦稳定写作和持续发布，不引入博客插件、标签系统或自动导航。

## 栏目入口

- [技术总览](tech/index.md)
- [AI 算法](tech/ai-algorithms/index.md)
- [后端](tech/backend/index.md)
- [折腾记录](tech/tinkering/index.md)
- [生活总览](life/index.md)
- [生活随笔](life/essays/index.md)

## 首发内容

- [安全 DPO 数据集设计](tech/ai-algorithms/safety-dpo-dataset-design/index.md)

## 生活内容

- [待产与新生儿购物清单整理](life/essays/pregnancy-newborn-shopping-checklist/index.md)
- [孕 30 周后到产后 3 个月的时间线规划](life/essays/pregnancy-birth-postpartum-timeline/index.md)

## 写作约定

!!! note "内容模型"
    每篇文章使用单独文件夹承载，目录内保留 `index.md` 与资源文件，路径统一使用 `kebab-case`。

## 代码高亮示例

```python
def hello(name: str) -> str:
    return f"hello, {name}"
```

## Tabs 示例

=== "本地预览"

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    mkdocs serve
    ```

=== "严格构建"

    ```bash
    mkdocs build --strict
    ```

## 后续扩展

- 自定义域名仅需调整 `site_url` 并加入 `CNAME`
- 新文章直接添加到对应栏目目录下
- 发布仍然只需要 `git push`

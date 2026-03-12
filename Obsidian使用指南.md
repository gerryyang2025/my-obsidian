---
title: Obsidian 使用指南
date: 2026-03-11
tags: [Obsidian, 使用指南, 教程]
---

# Obsidian 使用指南

> 本指南帮助你快速上手 Obsidian 笔记软件

## 什么是 Obsidian？

Obsidian 是一个**本地优先**的笔记和知识管理工具，基于 Markdown 文件存储，帮你构建个人知识库。

## 核心概念

### 1. 保险库 (Vault)

- 保险库 = 一个文件夹
- 包含所有笔记（.md 文件）和配置
- 可以创建多个保险库（工作/个人/项目）

### 2. 双向链接 (Bidirectional Links)

```markdown
[[笔记名称]]  # 创建链接
```

点击链接可跳转到对应笔记，形成知识网络。

### 3. 标签 (Tags)

```markdown
#标签名
#工作/项目A  # 支持嵌套
```

### 4. 元数据 (Frontmatter)

文件顶部可添加 YAML 元数据：

```yaml
---
title: 我的笔记
date: 2026-03-11
tags: [教程, Obsidian]
---
```

## 快速开始

### 基本语法

#### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

#### 列表
```markdown
- 无序列表项
- [ ] 未完成事项
- [x] 已完成事项
```

#### 加粗和斜体
```markdown
**加粗文本**
*斜体文本*
~~删除线~~
```

#### 代码
```markdown
`行内代码`

```python
# 代码块
def hello():
    print("Hello!")
```
```

#### 引用
```markdown
> 这是一段引用
```

#### 分割线
```markdown
---
```

### 创建笔记

1. 按 `Ctrl+N`（Mac: `Cmd+N`）创建新笔记
2. 输入文件名（可带中文）
3. 开始写作

### 搜索

- `Ctrl+O` 快速搜索所有笔记
- `Ctrl+Shift+F` 搜索内容

### 插件推荐

| 插件 | 用途 |
|------|------|
| Dataview | 数据库式查询 |
| QuickAdd | 快速添加笔记 |
| Obsidian Git | 自动备份到 Git |
| Calendar | 日历视图 |

## 进阶技巧

### 1. 建立知识网络

通过 `[[笔记链接]]` 将相关笔记关联起来，形成个人知识图谱。

### 2. 使用模板

创建模板文件，快速复用：

```markdown
# {{title}}

日期：{{date}}
标签：

## 今天做了什么

## 明天计划

```

### 3. 双向链接反向查看

在笔记底部查看哪些文章链接到了当前笔记。

## 本地使用

1. 从官网下载 Obsidian：https://obsidian.md
2. 选择「打开本地保险库」
3. 选择 `/root/.openclaw/workspace/data/obsidian` 文件夹

> 注意：需要将该文件夹同步到本地（可使用 iCloud、OneDrive、Git 等）

## 常见问题

### Q: 笔记会丢失吗？
A: 不会，所有笔记都是本地 .md 文件，删除软件笔记仍在。

### Q: 如何同步到手机？
A: 使用 iCloud、OneDrive 等云盘同步，或 Obsidian 官方同步服务。

### Q: 误删如何恢复？
A: 检查电脑回收站，或使用 Git 恢复。

---

*持续更新中...*

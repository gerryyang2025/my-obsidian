# obsidian-publisher

将 Markdown 笔记（含 Obsidian 语法）转换为静态 HTML 站点的 Node.js 工具。读取指定目录下的 `.md` 文件，生成单篇笔记页、首页索引和客户端搜索页。

## 功能

| 功能 | 说明 |
|------|------|
| **单页生成** | 每篇 `.md` 转为独立 HTML 页面，带统一样式与代码高亮 |
| **首页索引** | 生成 `index.html`，按标题列出所有笔记并链接到对应页面 |
| **客户端搜索** | 生成 `search.html`，按标题、日期做前端过滤，无需服务端 |
| **Markdown 解析** | 使用 [marked](https://github.com/markedjs/marked)（GFM、`breaks`） |
| **代码高亮** | 使用 [highlight.js](https://highlightjs.org/) 按语言高亮代码块 |

## 环境要求

- **Node.js**（建议 v14+ 或 LTS）

## 依赖

本工具依赖以下 npm 包（已写在 `package.json` 中，通过 `npm install` 自动安装）：

| 依赖 | 用途 |
|------|------|
| [marked](https://www.npmjs.com/package/marked) | Markdown 解析与 HTML 输出 |
| [highlight.js](https://www.npmjs.com/package/highlight.js) | 代码块语法高亮 |

## 初始化安装依赖

**首次使用前**需要先安装依赖。在项目根目录或 `obsidian-publisher` 目录下执行：

```bash
cd obsidian-publisher
npm install
```

安装完成后会生成 `node_modules` 目录，之后即可运行生成命令。若后续更新了 `package.json` 中的依赖版本，再次执行 `npm install` 即可更新。

## 安装与运行

### 1. 安装依赖（首次使用必做）

在 `obsidian-publisher` 目录下执行：

```bash
npm install
```

### 2. 生成静态站

任选其一：

```bash
node generate.js
```

或使用 npm 脚本：

```bash
npm run generate
# 或
npm run build
```

默认会从**上一级目录**（仓库根）读取 `.md`，并将生成的 HTML 写到上一级目录。

### 3. 自定义路径（可选）

通过环境变量指定笔记目录和输出目录：

```bash
VAULT_DIR=/path/to/notes OUTPUT_DIR=/path/to/output node generate.js
# 或
VAULT_DIR=/path/to/notes OUTPUT_DIR=/path/to/output npm run generate
```

- **VAULT_DIR**：笔记源目录，脚本会读取该目录下**顶层**所有以 `.md` 结尾且不以 `.` 开头的文件（不递归子目录）。
- **OUTPUT_DIR**：输出目录，将在此生成各笔记页、`index.html`、`search.html`。

## 输入与输出

### 输入

- **位置**：`VAULT_DIR` 下的顶层 `.md` 文件。
- **建议**：在文件开头写 YAML frontmatter，便于生成标题、日期和标签：

```yaml
---
title: 笔记标题
date: 2026-03-12
tags: [标签1, 标签2]
---
```

- **标题**：若未写 `title`，会取正文中第一个 `# 标题` 作为页面标题和列表展示名。

### 输出

| 文件 | 说明 |
|------|------|
| `<标题slug>.html` | 单篇笔记页，文件名由标题生成（见下方规则） |
| `index.html` | 首页，列出所有笔记标题与日期，按标题排序 |
| `search.html` | 搜索页，内嵌标题与日期数据，支持按关键词过滤 |

**单页文件名规则**：由「标题」生成 slug（仅保留中文、英文、数字，空格等替换为 `-`，去首尾 `-` 并转小写），再加 `.html`。例如标题「Obsidian 使用指南」→ `obsidian-使用指南.html`。

## 支持的 Markdown / Obsidian 语法

- **YAML frontmatter**：`title`、`date`、`tags`（会显示在页面上）
- **Wiki 链接**：`[[笔记名]]`、`[[笔记名|显示文字]]` → 链接到 `笔记名.html`
- **任务列表**：`- [ ]`、`- [x]` → 渲染为带禁用勾选框的列表项
- **标题锚点**：在标题末尾写 `{#自定义id}` 可指定该标题的 HTML 锚点 id；不写则按标题文字自动生成
- **脚注**：`[^1]` → 上标引用链接（如 `#fn1`）
- **外链**：`[文字](https://...)` 会自动加上 `target="_blank"` 与 `rel="noopener noreferrer"`
- **代码块**：带语言标识的围栏代码块会经 highlight.js 高亮

## 目录结构

```
obsidian-publisher/
├── README.md       # 本说明
├── package.json
├── generate.js     # 入口脚本
└── node_modules/   # 依赖（npm install 后生成）
```

## 在项目中的位置

默认从上一级目录读 `.md`、向上一级目录写 HTML，笔记与生成的静态站同仓管理。本仓库默认使用 **GitHub Pages** 部署：将根目录下的 `index.html`、`search.html` 及各笔记 `.html` 发布即可。

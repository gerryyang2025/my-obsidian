# My Obsidian Notes

个人 Obsidian 笔记仓库：用 Markdown 写笔记，通过工具转为静态网页，**默认使用 GitHub Pages 部署**供浏览器访问。

**在线访问**：[https://gerryyang2025.github.io/my-obsidian/](https://gerryyang2025.github.io/my-obsidian/)

## 功能概览

- **笔记源文件**：仓库根目录下的 `.md` 文件（支持 YAML frontmatter：`title`、`date`、`tags`）
- **静态站点生成**：由 `obsidian-publisher` 下的 Node.js 脚本 `generate.js` 完成，使用 [marked](https://github.com/markedjs/marked) 与 [highlight.js](https://highlightjs.org/) 将 Markdown 转为 HTML（无需 Python）
- **站点内容**：`index.html` 为笔记列表首页，`search.html` 为客户端搜索，每篇笔记对应一个 `.html` 页面
- **部署方式**：默认使用 **GitHub Pages** 部署；也可部署到其他静态托管或本地/服务器 HTTP 服务

## 目录结构

```
my-obsidian/
├── README.md                 # 本说明
├── .gitignore
├── index.html                # 笔记列表首页（由 obsidian-publisher 生成）
├── search.html               # 搜索页（由 obsidian-publisher 生成）
├── data/                     # 笔记源文件与生成的 HTML（由 obsidian-publisher 管理）
│   ├── *.md                  # 笔记源文件（Obsidian 可直接编辑）
│   └── *.html                # 由 .md 生成的单篇笔记页面
└── obsidian-publisher/       # MD → HTML 发布工具
    ├── README.md             # 工具用法说明
    ├── package.json
    ├── generate.js           # 生成脚本
    └── node_modules/
```

## 环境要求

- [Node.js](https://nodejs.org/)（建议 LTS）：用于在 `obsidian-publisher` 目录下运行 `generate.js` 做 MD→HTML 转换。**无需 Python**。

---

## obsidian-publisher 工具说明

`obsidian-publisher` 是本仓库自带的静态站生成器：读取指定目录下的 Markdown 笔记，转换为带样式的 HTML，并生成首页列表与客户端搜索页。

### 功能概述

| 功能 | 说明 |
|------|------|
| **Markdown 解析** | 使用 [marked](https://github.com/markedjs/marked)（GFM、换行转 `<br>`） |
| **代码高亮** | 使用 [highlight.js](https://highlightjs.org/) 对代码块按语言高亮 |
| **单页生成** | 每篇 `.md` 生成一个独立 HTML，标题来自 frontmatter 或首个 `#` 标题 |
| **首页索引** | 生成 `index.html`，列出所有笔记标题、日期并链接到对应页面 |
| **客户端搜索** | 生成 `search.html`，内嵌笔记标题与日期，按关键词过滤（不依赖服务端） |

### 支持的 Markdown / Obsidian 语法

- **YAML frontmatter**：`title`、`date`、`tags`（会显示在页面上）
- **Wiki 链接**：`[[笔记名]]`、`[[笔记名\|显示文字]]` → 转为指向 `笔记名.html` 的链接
- **任务列表**：`- [ ]`、`- [x]` → 渲染为带禁用勾选框的列表
- **标题锚点**：标题末尾写 `{#自定义id}` 可指定 HTML 锚点 id；不写则按标题文字自动生成
- **脚注**：`[^1]` → 上标引用链接（定义需自行在正文中写）
- **外链**：`[text](https://...)` 自动加 `target="_blank"` 与 `rel="noopener noreferrer"`

### 配置与运行

脚本通过三个路径工作：

- **笔记源目录（VAULT_DIR）**：从中读取所有 `.md` 文件（不含以 `.` 开头的文件），默认 `data/`
- **笔记 HTML 输出目录（NOTE_OUTPUT_DIR）**：写入各笔记的 `.html`，默认 `data/`
- **索引页输出目录（INDEX_OUTPUT_DIR）**：写入 `index.html`、`search.html`，默认仓库根目录

**默认行为**（不设环境变量时）：
笔记源与笔记 HTML 输出到 `data/` 目录，`index.html` 和 `search.html` 输出到仓库根目录。在 `obsidian-publisher` 下执行 `node generate.js` 即可。

**自定义路径**（可选）：
通过环境变量覆盖后再运行：

```bash
cd obsidian-publisher
VAULT_DIR=/path/to/notes NOTE_OUTPUT_DIR=/path/to/notes OUTPUT_DIR=/path/to/output node generate.js
# 或
VAULT_DIR=/path/to/notes NOTE_OUTPUT_DIR=/path/to/notes OUTPUT_DIR=/path/to/output npm run generate
```

**输出文件名规则**：
单篇笔记的 HTML 文件名由「标题」生成：去掉非中文/英文/数字的字符、替换为 `-`、去首尾 `-` 并转小写，例如标题「Obsidian 使用指南」→ `obsidian-使用指南.html`。首页与搜索页固定为 `index.html`、`search.html`。

### 使用步骤

1. **安装依赖**（首次使用在 `obsidian-publisher` 目录下执行一次）：
   ```bash
   cd obsidian-publisher
   npm install
   ```

2. **生成静态站**（任选其一）：
   ```bash
   node generate.js
   # 或
   npm run generate
   # 或
   npm run build
   ```
   若未设置 `VAULT_DIR`/`OUTPUT_DIR`，会从仓库根读取 `.md` 并输出到仓库根。

3. **查看输出**：
   终端会打印每篇笔记的生成结果，以及「生成索引页面」「生成搜索页面」和最终输出目录路径。更多说明见 [obsidian-publisher/README.md](obsidian-publisher/README.md)。

---

## 使用方式

### 1. 编写笔记

在仓库根目录（或你配置的 `VAULT_DIR`）中编写 `.md` 文件。建议使用 YAML frontmatter，便于首页列表与搜索：

```yaml
---
title: 笔记标题
date: 2026-03-12
tags: [标签1, 标签2]
---
```

### 2. 安装并运行 obsidian-publisher

```bash
cd obsidian-publisher
npm install          # 首次使用必做
npm run generate     # 或 node generate.js / npm run build
```

生成完成后，站点由根目录的 `index.html`、`search.html` 及各笔记对应的 `.html` 组成。详细用法见 [obsidian-publisher/README.md](obsidian-publisher/README.md)。

### 3. 本地预览

在项目根目录启动任意静态 HTTP 服务，例如：

```bash
# Python 3
python3 -m http.server 8000

# Node.js (需先安装: npm install -g serve)
serve -p 8000

# npx 临时运行
npx serve -p 8000
```

浏览器访问 `http://localhost:8000`，即可查看首页与笔记。

## 部署

本工程**默认使用 GitHub Pages** 部署静态站点。

### GitHub Pages（推荐 / 默认）

1. 将本仓库推送到 GitHub。
2. 仓库设置 → **Pages** → **Source** 选择 **Deploy from a branch**。
3. 选择分支（如 `main`），目录选 **/ (root)**，保存。
4. 等待构建完成后，站点将出现在 `https://<用户名>.github.io/<仓库名>/`。

若使用项目子目录作为站点根目录，可在 **Pages** 中指定该目录。

### 其他部署方式

如需使用其他托管或自建服务，可将仓库根目录下生成的 `index.html`、`search.html` 及各笔记 `.html` 部署到任意静态托管（如 Vercel、Netlify、Cloudflare Pages）或 HTTP 服务器（如 Nginx、Apache、Caddy）即可。

## 笔记与 HTML 对应关系

| 说明           | 路径/文件 |
|----------------|-----------|
| 笔记列表首页   | `index.html`（仓库根目录） |
| 搜索页         | `search.html`（仓库根目录） |
| 单篇笔记页面   | `data/` 目录下，由笔记 **title**（frontmatter 或首个 `#` 标题）生成文件名，如「Obsidian 使用指南」→ `data/obsidian-使用指南.html` |
| 笔记源文件     | `data/` 目录下的 `.md` 文件 |

## 许可证

本仓库为个人笔记与工具脚本，可按需自行选择开源协议（如 MIT）；若未单独声明，以仓库内 LICENSE 文件为准。

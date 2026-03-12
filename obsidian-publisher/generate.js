const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// 配置 marked 选项
marked.setOptions({
    gfm: true,
    breaks: true
});

// 自定义渲染器
const renderer = new marked.Renderer();

// 代码块渲染
renderer.code = function(token) {
    const code = token.text || token.code;
    const language = token.lang || token.language;
    
    if (language && hljs.getLanguage(language)) {
        try {
            const highlighted = hljs.highlight(code, { language }).value;
            return '<pre><code class="hljs language-' + language + '">' + highlighted + '</code></pre>';
        } catch (e) {
            // 如果高亮失败，使用普通代码块
        }
    }
    return '<pre><code>' + code + '</code></pre>';
};

// 任务列表渲染
renderer.listitem = function(token) {
    const text = token.text || '';
    const task = token.task || false;
    const checked = token.checked || false;
    
    if (task) {
        return '<li class="task-item"><input type="checkbox" disabled ' + (checked ? 'checked' : '') + '> ' + text + '</li>\n';
    }
    return '<li>' + text + '</li>\n';
};

// 图片渲染
renderer.image = function(token) {
    const href = token.href || '';
    const title = token.title || '';
    const text = token.text || '';
    return '<img src="' + href + '" alt="' + text + '"' + (title ? ' title="' + title + '"' : '') + ' class="md-image">';
};

// 链接渲染
renderer.link = function(token) {
    const href = token.href || '';
    const title = token.title || '';
    const text = token.text || '';
    
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    const target = isExternal ? ' target="_blank"' : '';
    const rel = isExternal ? ' rel="noopener noreferrer"' : '';
    return '<a href="' + href + '"' + (title ? ' title="' + title + '"' : '') + target + rel + '>' + text + '</a>';
};

// 标题渲染 - 支持 {#id} 语法添加锚点，支持链接等内联元素
renderer.heading = function(token) {
    const rawText = token.text || token.raw;
    const level = token.depth;
    
    // 提取 {#id} 语法 - 匹配任意字符包括中文
    const idMatch = rawText.match(/\{#([\u4e00-\u9fa5a-zA-Z0-9_-]+)\}$/);
    let id = '';
    if (idMatch) {
        id = idMatch[1];
    } else {
        // 如果没有指定 id，自动生成（从原始文本中提取，不包含链接）
        id = rawText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // 移除链接 markdown 语法
                     .replace(/\{#[\u4e00-\u9fa5a-zA-Z0-9_-]+\}$/, '')  // 移除 id 语法
                     .toLowerCase()
                     .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
                     .replace(/^-+|-+$/g, '');
    }
    
    // 清理 emoji 和特殊字符用于 id
    id = id.replace(/[^\u4e00-\u9fa5a-z0-9_-]/gi, '');
    
    // 渲染标题内容（支持链接等内联元素）
    let htmlContent = '';
    if (token.tokens && token.tokens.length > 0) {
        // 遍历 tokens 并渲染
        const renderTokens = (tokens) => {
            return tokens.map(t => {
                if (t.type === 'text') {
                    return t.text;
                } else if (t.type === 'link') {
                    const href = t.href || '';
                    const text = t.text || (t.tokens ? renderTokens(t.tokens) : '');
                    const isExternal = href.startsWith('http://') || href.startsWith('https://');
                    const target = isExternal ? ' target="_blank"' : '';
                    const rel = isExternal ? ' rel="noopener noreferrer"' : '';
                    return '<a href="' + href + '"' + target + rel + '>' + text + '</a>';
                } else if (t.type === 'strong') {
                    return '<strong>' + (t.tokens ? renderTokens(t.tokens) : '') + '</strong>';
                } else if (t.type === 'em') {
                    return '<em>' + (t.tokens ? renderTokens(t.tokens) : '') + '</em>';
                } else if (t.tokens) {
                    return renderTokens(t.tokens);
                }
                return t.text || '';
            }).join('');
        };
        htmlContent = renderTokens(token.tokens);
    } else {
        // 没有 tokens，使用原始文本（移除 id 语法）
        htmlContent = rawText.replace(/\{#[\u4e00-\u9fa5a-zA-Z0-9_-]+\}$/, '');
    }
    
    return '<h' + level + ' id="' + id + '">' + htmlContent + '</h' + level + '>\n';
};

// 使用 marked.use() 应用 renderer
marked.use({ renderer: renderer });

// 脚注渲染 - 简化处理
// 脚注 [^1] 转换为上标引用

// 引入 highlight.js
const hljs = require('highlight.js');

// 笔记源目录（.md 所在）与静态站输出目录，可通过环境变量覆盖
const VAULT_DIR = process.env.VAULT_DIR || path.join(__dirname, '..');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '..');

const TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        :root {
            --bg: #fafafa;
            --fg: #37352f;
            --accent: #7c3aed;
            --code-bg: #f6f8fa;
            --border: #e0e0e0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: var(--bg);
            color: var(--fg);
            line-height: 1.7;
        }
        
        /* 标题样式 */
        h1, h2, h3, h4, h5, h6 { color: #1a1a1a; margin-top: 1.8em; margin-bottom: 0.8em; font-weight: 600; }
        h1 { font-size: 1.8em; border-bottom: 2px solid var(--accent); padding-bottom: 0.5rem; margin-top: 0; }
        h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3rem; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1.1em; }
        
        /* 链接样式 */
        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }
        
        /* 代码样式 */
        code {
            background: var(--code-bg);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace;
        }
        pre {
            background: var(--code-bg);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            line-height: 1.5;
        }
        pre code { background: none; padding: 0; }
        
        /* 引用样式 */
        blockquote {
            border-left: 4px solid var(--accent);
            margin: 1rem 0;
            padding: 0.5rem 1rem;
            color: #666;
            background: #f9f9f9;
            border-radius: 0 8px 8px 0;
        }
        blockquote p { margin: 0.3em 0; }
        
        /* 列表样式 */
        ul, ol { padding-left: 1.8rem; margin: 0.8rem 0; }
        li { margin: 0.4rem 0; }
        li > ul, li > ol { margin: 0.2rem 0; }
        
        /* 任务列表 */
        .task-item { list-style: none; margin-left: -1.2rem; }
        .task-item input { margin-right: 0.5rem; }
        
        /* 表格样式 */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
        th { background: var(--accent); color: white; font-weight: 600; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) { background: #f9f9f9; }
        tr:hover { background: #f0f0f0; }
        
        /* 图片样式 */
        .md-image { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
        
        /* 分割线 */
        hr { border: none; border-top: 2px solid var(--border); margin: 2rem 0; }
        
        /* 标签样式 */
        .nav { margin-bottom: 2rem; }
        .nav a { margin-right: 1rem; font-size: 1.1em; }
        .tag {
            display: inline-block;
            background: var(--accent);
            color: white;
            padding: 0.2em 0.6em;
            border-radius: 12px;
            font-size: 0.8em;
            margin-right: 0.5em;
        }
        
        /* 脚注 */
        .footnotes { margin-top: 3rem; font-size: 0.9em; color: #666; }
        .footnotes hr { margin: 1rem 0; }
        .footnote-ref a { color: var(--accent); }
        
        /* 加粗、斜体、删除线 */
        strong { font-weight: 600; color: #1a1a1a; }
        em { font-style: italic; }
        del { text-decoration: line-through; color: #999; }
        
        /* 键盘按键样式 */
        kbd {
            background: #eee;
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 0.1em 0.4em;
            font-size: 0.85em;
            font-family: monospace;
        }
        
        /* 进度条 */
        progress {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
        }
        progress::-webkit-progress-bar { background: #eee; }
        progress::-webkit-progress-value { background: var(--accent); }
        
        /* 提示框 */
        .tip, .warning, .info {
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .tip { background: #e8f5e9; border-left: 4px solid #4caf50; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .info { background: #e3f2fd; border-left: 4px solid #2196f3; }
        
        /* 更新时间 */
        .update-time {
            font-size: 0.85em;
            color: #666;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <nav class="nav"><a href="/obsidian/">📚 笔记列表</a> <a href="/obsidian/search.html">🔍 搜索</a></nav>
    <article>{{content}}</article>
    <hr><footer><p>Powered by Obsidian Static Generator</p></footer>
</body>
</html>`;

function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    
    const frontmatter = match[1];
    const body = match[2];
    const meta = {};
    
    frontmatter.split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            let val = line.slice(idx + 1).trim();
            // 处理数组格式 [a, b, c]
            if (val.startsWith('[') && val.endsWith(']')) {
                val = val.slice(1, -1);
            }
            meta[key] = val.replace(/^["']|["']$/g, '');
        }
    });
    
    return { meta, body };
}

function convertMarkdown(md) {
    // 处理 Obsidian 特有语法
    // Wiki 链接 [[note]] -> <a href="note.html">note</a>
    md = md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, link, text) => {
        const displayText = text || link;
        return '<a href="' + link.trim() + '.html">' + displayText.trim() + '</a>';
    });
    
    // 内部链接 [text](url) 不加 _blank
    md = md.replace(/\[([^\]]+)\]\((?!http)([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // 任务列表 [ ] 和 [x]
    md = md.replace(/^\s*-\s*\[ \]\s*/gm, '<input type="checkbox"> ');
    md = md.replace(/^\s*-\s*\[x\]\s*/gi, '<input type="checkbox" checked> ');
    
    // 脚注 [^1] -> <sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup>
    const footnoteDefs = {};
    let fnCounter = 0;
    md = md.replace(/\[\^(\w+)\]/g, (match, id) => {
        if (!footnoteDefs[id]) {
            footnoteDefs[id] = ++fnCounter;
        }
        const num = footnoteDefs[id];
        return '<sup class="footnote-ref"><a href="#fn' + num + '" id="fnref' + num + '">[' + num + ']</a></sup>';
    });
    
    // 转换 Markdown
    let html = marked.parse(md);
    
    // 处理复选框显示
    html = html.replace(/<input type="checkbox"([^>]*)>/g, (m) => m.includes('checked') ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>');
    
    return html;
}

function processNote(filename) {
    if (!filename.endsWith('.md') || filename.startsWith('.')) return null;
    
    const filepath = path.join(VAULT_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const { meta, body } = extractFrontmatter(content);
    
    let title = meta.title || filename.slice(0, -3);
    
    // 如果 frontmatter 中没有 title，尝试从正文中提取第一个标题
    if (!meta.title && body) {
        const firstHeadingMatch = body.match(/^#\s+(.+)$/m);
        if (firstHeadingMatch) {
            // 移除 emoji 和特殊字符
            let extractedTitle = firstHeadingMatch[1].trim();
            extractedTitle = extractedTitle.replace(/^[📰🔥💡⭐🎯✨🎨🚀💻🔧🎮📚🌍📈☁️🌦️📋]+/, '').trim();
            if (extractedTitle) {
                title = extractedTitle;
            }
        }
    }
    
    const tags = meta.tags || '';
    const date = meta.date || '';
    
    // 更新时间显示
    let updateTimeHtml = '';
    if (date) {
        updateTimeHtml = '<p class="update-time">更新时间：' + date + '</p>';
    }
    
    let metaHtml = '';
    
    let tagHtml = '';
    if (tags) {
        const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
        if (tagList.length > 0) {
            tagHtml = '<div class="tags" style="margin: 0.5rem 0;">';
            tagList.forEach(tag => {
                tagHtml += '<span class="tag">#' + tag + '</span>';
            });
            tagHtml += '</div>';
        }
    }
    
    const htmlContent = convertMarkdown(body);
    
    // 组装内容：更新时间 + 元信息 + 标签 + 正文
    const fullContent = updateTimeHtml + metaHtml + tagHtml + htmlContent;
    
    let html = TEMPLATE.replace('{{title}}', title)
                       .replace('{{content}}', fullContent);
    
    return { html, title, filename };
}

// 收集所有笔记信息（用于索引和搜索）
const allNotes = [];

function generateIndex() {
    // 直接使用已经填充好的 allNotes，不需要重新读取文件
    // allNotes 已经在文件处理循环中被填充
    
    let html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n';
    html += '    <meta charset="UTF-8">\n';
    html += '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '    <title>我的 Obsidian 笔记</title>\n';
    html += '    <style>\n';
    html += '        :root { --bg: #fafafa; --fg: #37352f; --accent: #7c3aed; }\n';
    html += '        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: var(--bg); color: var(--fg); }\n';
    html += '        h1 { color: var(--accent); }\n';
    html += '        .note { background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }\n';
    html += '        .note a { color: var(--fg); text-decoration: none; display: block; }\n';
    html += '        .note a:hover { color: var(--accent); }\n';
    html += '        .note .date { font-size: 0.8em; color: #999; }\n';
    html += '    </style>\n</head>\n<body>\n';
    html += '    <h1>📚 我的笔记</h1>\n';
    html += '    <p>共 ' + allNotes.length + ' 篇笔记</p>\n';
    html += '    <hr>\n';
    
    // 使用 allNotes（包含友好的文件名）
    const sortedNotes = [...allNotes].sort((a, b) => a.title.localeCompare(b.title, 'zh'));
    sortedNotes.forEach(n => {
        const href = n.friendlyFilename || (n.filename.slice(0, -3) + '.html');
        html += '    <div class="note"><a href="' + href + '">';
        html += '<strong>' + n.title + '</strong>';
        if (n.date) html += ' <span class="date">(' + n.date + ')</span>';
        html += '</a></div>\n';
    });
    html += '    <hr><footer><p>Powered by Obsidian Static Generator</p></footer></body></html>';
    return html;
}

// Main
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 第一步：预填充 allNotes
const files = fs.readdirSync(VAULT_DIR).filter(f => f.endsWith('.md') && !f.startsWith('.'));
files.forEach(filename => {
    const content = fs.readFileSync(path.join(VAULT_DIR, filename), 'utf-8');
    const { meta, body } = extractFrontmatter(content);
    
    let title = meta.title || filename.slice(0, -3);
    
    // 从第一个标题提取
    if (!meta.title && body) {
        const firstHeadingMatch = body.match(/^#\s+(.+)$/m);
        if (firstHeadingMatch) {
            let extractedTitle = firstHeadingMatch[1].trim();
            extractedTitle = extractedTitle.replace(/^[📰🔥💡⭐🎯✨🎨🚀💻🔧🎮📚🌍📈☁️🌦️📋]+/, '').trim();
            if (extractedTitle) {
                title = extractedTitle;
            }
        }
    }
    
    // 生成友好的文件名
    const friendlyName = title
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
    
    allNotes.push({
        title,
        date: meta.date || '',
        filename,
        friendlyFilename: friendlyName + '.html'
    });
});

// 第二步：生成 HTML 文件
allNotes.forEach(note => {
    const result = processNote(note.filename);
    if (result) {
        const outputName = note.friendlyFilename;
        fs.writeFileSync(path.join(OUTPUT_DIR, outputName), result.html);
        console.log('✅ ' + note.title + ' -> ' + outputName);
    }
});

// 第三步：生成索引和搜索页面
const indexHtml = generateIndex();
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);
console.log('✅ 生成索引页面');

const searchIndex = allNotes.map(n => ({
    title: n.title,
    date: n.date,
    filename: n.friendlyFilename
}));
function generateSearch() {
    const indexJson = JSON.stringify(searchIndex, null, 2);
    
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>搜索笔记</title>
    <style>
        :root { --bg: #fafafa; --fg: #37352f; --accent: #7c3aed; }
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: var(--bg); color: var(--fg); }
        h1 { color: var(--accent); }
        .search-box { margin: 1rem 0; }
        .search-box input { width: 100%; padding: 0.8rem; font-size: 1rem; border: 2px solid #ddd; border-radius: 8px; }
        .search-box input:focus { border-color: var(--accent); outline: none; }
        .results { margin-top: 1rem; }
        .result { background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .result a { color: var(--fg); text-decoration: none; display: block; }
        .result a:hover { color: var(--accent); }
        .result .date { font-size: 0.8em; color: #999; }
        .no-results { color: #999; font-style: italic; }
    </style>
</head>
<body>
    <nav class="nav"><a href="/obsidian/">📚 笔记列表</a></nav>
    <hr>
    <h1>🔍 搜索笔记</h1>
    <div class="search-box">
        <input type="text" id="searchInput" placeholder="输入关键词搜索..." autofocus>
    </div>
    <div class="results" id="results"></div>
    
    <script>
        const searchIndex = ${indexJson};
        
        const searchInput = document.getElementById('searchInput');
        const resultsDiv = document.getElementById('results');
        
        function search(query) {
            if (!query.trim()) {
                resultsDiv.innerHTML = '';
                return;
            }
            
            query = query.toLowerCase();
            const results = searchIndex.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.date.includes(query)
            );
            
            if (results.length === 0) {
                resultsDiv.innerHTML = '<p class="no-results">没有找到匹配的笔记</p>';
            } else {
                resultsDiv.innerHTML = results.map(note => 
                    '<div class="result"><a href="' + note.filename + '"><strong>' + note.title + '</strong></a>' +
                    (note.date ? '<br><span class="date">' + note.date + '</span>' : '') + '</div>'
                ).join('');
            }
        }
        
        searchInput.addEventListener('input', (e) => search(e.target.value));
    </script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'search.html'), html);
    console.log('✅ 生成搜索页面');
}

// 生成搜索页面
generateSearch();

console.log('\n🎉 完成！静态网站已生成到: ' + OUTPUT_DIR);

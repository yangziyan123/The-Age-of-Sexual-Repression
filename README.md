# 峰哥亡命天涯语录（纯前端静态站）

该项目已从 Flask 迁移为纯前端静态页面，数据来自 `app/data/quotes.json`。

## 运行方式

建议使用任意静态服务器启动（不要直接双击 `html`，否则浏览器可能拦截 `fetch` 本地 JSON）。

示例（Python）：

```bash
python -m http.server 8000
```

然后访问：

`http://127.0.0.1:8000`

## 页面

- `index.html`：引导页
- `home.html`：首页
- `quotes.html`：语录总览（关键词 + 主题筛选 + 分页）
- `quote.html?id=q001`：语录详情
- `about.html`：关于页

## 目录结构

```text
app/
  data/
    quotes.json
  static/
    css/
    img/
    js/
index.html
home.html
quotes.html
quote.html
about.html
```


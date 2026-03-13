# 峰哥亡命天涯语录（Flask 版）

一个带有历史厚重感与哲学氛围的语录网站，支持主题筛选、关键词搜索、详情页延展阅读和时间轴浏览。

## 1. 环境要求
- Python 3.10+
- pip

## 2. 安装与启动
```bash
pip install -r requirements.txt
python run.py
```

默认访问地址：`http://127.0.0.1:5000`

## 3. 页面说明
- `/` 导引页：照片、声明、补充信息、进入按钮
- `/home` 首页：精选语录、主题入口、近期收录、随机延展
- `/quotes` 语录总览：关键词搜索 + 主题/情绪/阶段筛选 + 分页
- `/quotes/<id>` 语录详情：注解、上一篇/下一篇、相关推荐
- `/timeline` 时间轴：按阶段回看语录
- `/about` 关于页：项目说明与收录规模

## 4. 项目结构
```text
app/
  routes/
  services/
  data/
  templates/
  static/
config.py
run.py
```

## 5. 后续建议
1. 将 `app/data/quotes.json` 迁移到 SQLite + SQLAlchemy。
2. 为筛选与详情增加自动化测试。
3. 增加后台录入界面（Flask-Admin 或自建管理页）。

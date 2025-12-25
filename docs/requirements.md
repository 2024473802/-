# 企业官网项目文档

## 需求分析
- 构建涵盖首页、产品、联系模块的企业官网，需兼顾 PC 与移动端体验。
- 使用 HTML5 语义化标签与 CSS3 响应式布局，保证可访问性与 SEO。
- JavaScript 提供交互能力，含导航折叠、数据加载与表单校验。
- 后端以 Node.js 模拟，提供产品列表与留言提交接口，便于前后端联调。
- 交付内容包括可运行站点、接口说明、测试用例与代码注释。

## 设计与实现
- **前端技术**：原生 HTML/CSS/JS；Flex/Grid + 媒体查询处理多终端；CSS 变量实现主题切换。
- **交互逻辑**：
  - 动态获取 `/api/products` 数据渲染产品卡片。
  - `/api/contact` 以 POST 接收 JSON 留言，返回确认消息。
  - 移动端折叠导航、浅深色主题切换。
- **后端接口**：
  - `GET /api/products`：返回预置产品数据。
  - `POST /api/contact`：接收 `{ name, email, message }`，记录并返回确认。
- **目录结构**：
  - `public/` 前端静态资源（`index.html`, `styles.css`, `script.js`）。
  - `server.js` Node.js 静态资源与 Mock API 服务。
  - `docs/requirements.md` 本文档。

## 测试用例（手工）
1. 打开首页，确认导航锚点跳转正常，视觉在桌面与移动宽度下均自适应。
2. 检查产品列表是否从 `/api/products` 动态加载并渲染三张卡片。
3. 填写联系表单并提交，收到“感谢您的联系”提示，表单内容被重置。
4. 切换主题按钮在浅/深色之间切换，文本与背景对比度保持可读。
5. 移动端视图点击菜单按钮，导航可展开/收起。

## 部署与运行
- 本地运行：`npm install`（无额外依赖）后执行 `npm start`，默认监听 `http://localhost:3000`。
- 部署：将 `server.js` 与 `public/` 放置于 Node 运行环境，设置 `PORT` 环境变量即可。

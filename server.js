const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const publicDir = path.join(__dirname, 'public');
const publicRoot = path.resolve(publicDir);
const PORT = process.env.PORT || 3000;

// 模拟产品数据，供前端动态渲染使用
const products = [
  {
    id: 1,
    name: '智能物联监控平台',
    description: '统一采集与分析终端数据，提供实时可视化与预测性维护能力。',
    badge: '热门',
    category: '物联网',
    price: '¥ 8,800 起',
    features: ['多终端控制台', '实时告警推送', '开放API']
  },
  {
    id: 2,
    name: '数字化营销官网套件',
    description: '响应式官网、内容管理与落地页工具，帮助企业快速上线推广。',
    badge: '新品',
    category: '营销增长',
    price: '¥ 3,200 起',
    features: ['组件化搭建', 'A/B 测试', 'SEO 优化']
  },
  {
    id: 3,
    name: '企业级客服中心',
    description: '全渠道客服接入，智能路由与知识库，降低服务成本。',
    badge: '旗舰',
    category: '客户体验',
    price: '¥ 6,500 起',
    features: ['机器人客服', '多端对话', '数据洞察']
  }
];

// 简单内存存储的留言数据，仅用于演示
const contactMessages = [];
const MAX_BODY_SIZE = 1e6; // 1MB

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function handleApi(req, res, url) {
  if (url.pathname === '/api/products' && req.method === 'GET') {
    return sendJson(res, 200, { products });
  }

  if (url.pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    let tooLarge = false;
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY_SIZE && !tooLarge) {
        tooLarge = true;
        req.destroy();
        if (!res.headersSent && !res.writableEnded) {
          sendJson(res, 413, { error: '请求体过大' });
        }
      }
    });

    req.on('end', () => {
      if (tooLarge) return;
      try {
        const parsed = JSON.parse(body || '{}');
        const name = String(parsed.name || '未命名用户').trim();
        const email = String(parsed.email || '').trim();
        const messageBody = String(parsed.message || '').trim();
        const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
        if (!name || !emailValid || !messageBody) {
          return sendJson(res, 400, { error: '请提供有效的姓名、邮箱与需求描述' });
        }
        const message = {
          name,
          email,
          message: messageBody,
          createdAt: new Date().toISOString()
        };
        contactMessages.push(message);
        if (contactMessages.length > 500) {
          contactMessages.shift();
        }
        return sendJson(res, 201, { received: true, message: '感谢您的联系，我们会尽快回复。' });
      } catch (err) {
        return sendJson(res, 400, { error: '请求数据格式错误' });
      }
    });
    return;
  }

  sendJson(res, 404, { error: '未找到接口' });
}

function serveStatic(req, res, url) {
  const normalized = path.posix.normalize(url.pathname);
  const safePath = normalized.replace(/^\/+/, '');
  if (safePath.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }
  const target = safePath ? safePath : 'index.html';
  const filePath = path.join(publicDir, target);
  const resolvedPath = path.resolve(filePath);

  const insidePublic = resolvedPath === publicRoot || resolvedPath.startsWith(publicRoot + path.sep);
  if (!insidePublic) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  fs.stat(resolvedPath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('页面不存在');
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(resolvedPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('服务器错误');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (url.pathname.startsWith('/api/')) {
    return handleApi(req, res, url);
  }

  return serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

<div align="center">

# 🔖 TMarks

**AI 驱动的智能书签管理系统**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020.svg)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README_EN.md) | 简体中文

[在线演示](https://tmarks.669696.xyz) | [文档](docs/) | [问题反馈](https://github.com/yourusername/tmarks/issues)

</div>

---

## ✨ 项目简介

TMarks 是一个现代化的书签管理解决方案，结合 AI 技术为你的书签自动生成智能标签，让书签管理变得简单高效。项目包含 Web 应用和浏览器扩展两部分，支持多设备同步、公开分享、标签页组管理等丰富功能。

### 🎯 核心特性

#### 📚 书签管理
- **AI 智能标签** - 支持 OpenAI、Anthropic、DeepSeek、智谱等多个 AI 模型，自动生成高质量标签
- **多维度筛选** - 按标签、关键词、可见性等多种方式快速查找书签
- **批量操作** - 支持批量编辑、删除、导出书签
- **拖拽排序** - 直观的拖拽操作，自由调整书签顺序
- **多种视图** - 卡片、列表、极简、瀑布流等多种展示模式

#### 🗂️ 标签页组管理
- **一键收纳** - 类似 OneTab，一键保存当前浏览器所有标签页
- **智能分组** - 支持文件夹层级结构，灵活组织标签页组
- **快速恢复** - 一键恢复之前保存的标签页组，继续工作
- **回收站** - 误删除的标签页组可以从回收站恢复

#### 🌐 公开分享
- **自定义分享页** - 创建个性化的公开书签展示页面
- **访问控制** - 灵活控制书签的公开/私密状态
- **独立域名** - 每个用户拥有独立的分享链接（slug）

#### 🔌 浏览器扩展
- **快速保存** - 在任意网页一键保存书签
- **AI 推荐** - 实时生成标签建议
- **离线支持** - 使用 IndexedDB 本地缓存，离线也能访问
- **标签页收纳** - 直接从扩展收纳当前窗口的所有标签页

#### 🎨 用户体验
- **响应式设计** - 完美适配桌面端和移动端
- **多主题支持** - 亮色、暗色主题自由切换
- **实时同步** - 浏览器扩展与 Web 应用实时同步
- **性能优化** - 搜索防抖、虚拟滚动、代码分割等多项优化

---

## 🏗️ 技术架构

### 前端技术栈

```
React 18 + TypeScript
├── 构建工具: Vite 6
├── 样式: TailwindCSS 4 (alpha)
├── 状态管理: Zustand
├── 数据获取: @tanstack/react-query
├── 路由: React Router v7
├── 拖拽: @dnd-kit
└── 图标: lucide-react
```

### 后端技术栈

```
Cloudflare Workers (Pages Functions)
├── 运行时: Cloudflare Workers
├── 数据库: Cloudflare D1 (SQLite)
├── 缓存: Cloudflare KV
├── 认证: JWT (Access + Refresh tokens)
└── API: RESTful API
```

### 浏览器扩展

```
Manifest V3
├── 框架: React 19 + TypeScript
├── 构建: Vite + @crxjs/vite-plugin
├── 本地存储: Dexie (IndexedDB)
├── AI 集成: OpenAI, Anthropic, DeepSeek 等
└── 样式: TailwindCSS
```

---

## 📁 项目结构

```
tmarks/
├── tmarks/                    # Web 应用主项目
│   ├── src/                  # 前端源代码
│   │   ├── components/      # React 组件
│   │   │   ├── bookmarks/  # 书签相关组件
│   │   │   ├── tags/       # 标签相关组件
│   │   │   ├── tab-groups/ # 标签页组组件
│   │   │   └── common/     # 通用组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── services/       # API 服务
│   │   ├── stores/         # Zustand 状态管理
│   │   └── lib/            # 工具函数和类型
│   ├── functions/          # Cloudflare Workers 后端
│   │   ├── api/           # API 路由
│   │   ├── lib/           # 后端工具
│   │   └── middleware/    # 中间件
│   ├── migrations/        # 数据库迁移文件
│   └── shared/           # 前后端共享代码
│
├── tab/                      # 浏览器扩展
│   ├── src/
│   │   ├── popup/         # 弹窗界面
│   │   ├── options/       # 配置页面
│   │   ├── background/    # 后台服务
│   │   ├── content/       # 内容脚本
│   │   └── lib/           # 工具库
│   │       ├── api/       # API 客户端
│   │       ├── db/        # IndexedDB
│   │       ├── providers/ # AI 提供商
│   │       └── services/  # 业务逻辑
│   └── manifest.json      # 扩展配置
│
└── docs/                     # 项目文档
    ├── DEPLOYMENT.md         # 部署指南
    └── ...                   # 其他文档
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** 18+ (推荐使用 LTS 版本)
- **pnpm** 8+ (推荐) 或 npm
- **Cloudflare 账号** (用于部署)

### 本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/yourusername/tmarks.git
cd tmarks
```

#### 2. 安装依赖

```bash
# Web 应用
cd tmarks
pnpm install

# 浏览器扩展
cd ../tab
pnpm install
```

#### 3. 配置环境变量

```bash
# Web 应用
cd tmarks
cp .env.example .env.development

# 编辑 .env.development，配置必要的环境变量
```

#### 4. 数据库设置

```bash
# 本地数据库迁移
cd tmarks
pnpm db:migrate:local
```

#### 5. 启动开发服务器

```bash
# Web 应用
cd tmarks
pnpm dev

# 浏览器扩展
cd tab
pnpm dev
```

访问 http://localhost:5173 查看 Web 应用。

### 浏览器扩展安装

1. 构建扩展：
```bash
cd tab
pnpm build
```

2. 在浏览器中加载：
   - 打开 Chrome/Edge 扩展管理页面 (`chrome://extensions/`)
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `tab/dist` 目录

3. 配置扩展：
   - 点击扩展图标，进入设置页面
   - 配置 AI 服务 API Key
   - 配置书签站点 API 地址和 API Key

---

## 📖 使用指南

### Web 应用

#### 书签管理
1. **添加书签** - 点击「新建书签」按钮，填写标题、URL、描述等信息
2. **AI 标签** - 系统会自动为书签生成智能标签建议
3. **搜索筛选** - 使用搜索框或标签筛选快速查找书签
4. **批量操作** - 选中多个书签进行批量编辑或删除

#### 标签页组
1. **创建标签页组** - 点击「新建标签页组」，手动添加标签页
2. **使用扩展收纳** - 通过浏览器扩展一键收纳当前窗口的所有标签页
3. **恢复标签页** - 点击标签页组的「恢复」按钮，在新窗口打开所有标签页
4. **文件夹管理** - 创建文件夹，组织标签页组

#### 公开分享
1. **启用分享** - 在设置中启用公开分享功能
2. **自定义页面** - 设置分享页面的标题和描述
3. **控制可见性** - 为每个书签设置公开/私密状态
4. **分享链接** - 复制分享链接，分享给他人

### 浏览器扩展

#### 保存书签
1. 在任意网页点击扩展图标
2. 选择「保存书签」模式
3. AI 会自动分析页面并生成标签建议
4. 选择或添加标签，点击「保存书签」

#### 收纳标签页
1. 点击扩展图标
2. 选择「收纳标签页」模式
3. 选择要收纳的标签页（或全选）
4. 点击「收纳」按钮

---

## 🔧 配置说明

### Web 应用配置

#### 环境变量 (.env.development)

```env
# API 配置
VITE_API_URL=/api/v1
```

#### Cloudflare 配置 (wrangler.toml)

```toml
name = "tmarks"
compatibility_date = "2024-03-18"

# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "tmarks-prod-db"
database_id = "your_database_id"

# KV 命名空间
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your_kv_id"

[[kv_namespaces]]
binding = "PUBLIC_SHARE_KV"
id = "your_kv_id"

# 环境变量
[vars]
ALLOW_REGISTRATION = "true"
JWT_SECRET = "your-secret-key"
ENCRYPTION_KEY = "your-encryption-key"
ENVIRONMENT = "production"
```

### 浏览器扩展配置

在扩展的设置页面配置：

1. **AI 服务**
   - 选择 AI 提供商（OpenAI、Anthropic、DeepSeek 等）
   - 输入对应的 API Key
   - 配置 Base URL（可选）

2. **书签站点**
   - API 地址：`https://your-domain.com/api`
   - API Key：在 Web 应用的「API Keys」页面创建

---

## 🚀 部署

TMarks 使用 Cloudflare Pages + D1 + KV 部署，完全免费且性能出色。

### 快速部署步骤

#### 1. 创建 Cloudflare 资源

```bash
# 安装并登录 Wrangler
npm install -g wrangler
wrangler login

# 创建 D1 数据库
cd tmarks
wrangler d1 create tmarks-prod-db

# 创建 KV 命名空间
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "PUBLIC_SHARE_KV"
```

#### 2. 配置项目

编辑 `tmarks/wrangler.toml`，填入上一步获得的资源 ID：

```toml
[[d1_databases]]
database_id = "你的数据库ID"

[[kv_namespaces]]
id = "你的KV_ID"
```

配置敏感信息（推荐使用 Secrets）：

```bash
# 生成并设置密钥
wrangler secret put JWT_SECRET
wrangler secret put ENCRYPTION_KEY
```

#### 3. 初始化数据库

```bash
cd tmarks
pnpm db:migrate
```

#### 4. 部署

**方式一：通过 Cloudflare Dashboard（推荐）**

1. 推送代码到 GitHub
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 连接仓库
3. 配置构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `dist`
   - 根目录: `tmarks`
4. 绑定 D1 数据库和 KV 命名空间
5. 保存并部署

**方式二：通过 Wrangler CLI**

```bash
cd tmarks
pnpm build
wrangler pages deploy dist --project-name=tmarks
```

### 详细部署指南

完整的部署步骤、故障排查和最佳实践，请参考：

📖 **[详细部署文档](docs/DEPLOYMENT.md)**

包含：
- 前置准备和环境配置
- 资源创建详细步骤
- 数据库迁移和验证
- 自定义域名配置
- 持续部署设置
- 常见问题解决
- 安全建议和监控

---

## 📊 API 文档

### 认证

```bash
# 注册
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "user",
  "password": "password",
  "email": "user@example.com"
}

# 登录
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}
```

### 书签

```bash
# 获取书签列表
GET /api/v1/bookmarks?keyword=search&tags=tag1,tag2&sort=popular

# 创建书签
POST /api/v1/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Example",
  "url": "https://example.com",
  "description": "Description",
  "tags": ["tag1", "tag2"]
}

# 更新书签
PUT /api/v1/bookmarks/:id
Authorization: Bearer <token>

# 删除书签
DELETE /api/v1/bookmarks/:id
Authorization: Bearer <token>
```

### 标签页组

```bash
# 获取标签页组列表
GET /api/v1/tab-groups
Authorization: Bearer <token>

# 创建标签页组
POST /api/v1/tab-groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Tabs",
  "items": [
    {
      "title": "Example",
      "url": "https://example.com"
    }
  ]
}
```

完整 API 文档请参考 [API 文档](docs/API.md)。

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启 Pull Request**

### 代码规范

- 使用 TypeScript strict mode
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 添加必要的注释和文档
- 确保代码通过所有检查

### 开发流程

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check

# 构建
pnpm build
```

---

## 🗺️ Roadmap

### 近期计划

- [ ] 移动端 App（React Native）
- [ ] 浏览器书签导入优化
- [ ] 更多 AI 模型支持
- [ ] 团队协作功能
- [ ] 书签评论和笔记

### 长期计划

- [ ] 浏览器历史记录分析
- [ ] 智能推荐系统
- [ ] 知识图谱可视化
- [ ] 第三方服务集成（Notion、Obsidian 等）

---

## 📝 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🙏 致谢

感谢以下开源项目：

- [React](https://reactjs.org/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Cloudflare](https://www.cloudflare.com/) - 部署平台
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库
- [Zustand](https://zustand-demo.pmnd.rs/) - 状态管理
- [TanStack Query](https://tanstack.com/query) - 数据获取
- [dnd-kit](https://dndkit.com/) - 拖拽库

---

## 📧 联系方式

- **项目主页**: [GitHub Repository](https://github.com/yourusername/tmarks)
- **问题反馈**: [GitHub Issues](https://github.com/yourusername/tmarks/issues)
- **讨论区**: [GitHub Discussions](https://github.com/yourusername/tmarks/discussions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

Made with ❤️ by TMarks Team

</div>

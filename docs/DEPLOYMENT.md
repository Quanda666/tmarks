# 🚀 TMarks 部署指南

本文档详细说明如何将 TMarks 部署到 Cloudflare Pages。

---

## 📋 前置准备

### 1. 账号准备

- **Cloudflare 账号** - [注册地址](https://dash.cloudflare.com/sign-up)
- **GitHub 账号** - 用于代码托管和自动部署

### 2. 本地环境

- Node.js 18+
- pnpm 8+ (推荐) 或 npm
- Git
- Wrangler CLI (Cloudflare 命令行工具)

安装 Wrangler：
```bash
npm install -g wrangler
```

登录 Cloudflare：
```bash
wrangler login
```

---

## 🗄️ 第一步：创建 Cloudflare 资源

### 1. 创建 D1 数据库

```bash
# 进入项目目录
cd tmarks

# 创建生产数据库
wrangler d1 create tmarks-prod-db
```

执行后会返回数据库信息：
```
✅ Successfully created DB 'tmarks-prod-db'

[[d1_databases]]
binding = "DB"
database_name = "tmarks-prod-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**记录下 `database_id`，后面会用到。**

### 2. 创建 KV 命名空间

```bash
# 创建限流 KV
wrangler kv:namespace create "RATE_LIMIT_KV"

# 创建公开分享 KV
wrangler kv:namespace create "PUBLIC_SHARE_KV"
```

每个命令会返回 KV 信息：
```
✅ Successfully created KV namespace

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**记录下两个 KV 的 `id`，后面会用到。**

---

## ⚙️ 第二步：配置项目

### 1. 更新 wrangler.toml

编辑 `tmarks/wrangler.toml`，替换为你的资源 ID：

```toml
name = "tmarks"
compatibility_date = "2024-03-18"
pages_build_output_dir = "dist"

# D1 数据库配置
[[d1_databases]]
binding = "DB"
database_name = "tmarks-prod-db"
database_id = "你的数据库ID"  # 替换这里

# KV 命名空间配置
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "你的限流KV_ID"  # 替换这里

[[kv_namespaces]]
binding = "PUBLIC_SHARE_KV"
id = "你的分享KV_ID"  # 替换这里

# 环境变量
[vars]
ALLOW_REGISTRATION = "true"
ENVIRONMENT = "production"
JWT_ACCESS_TOKEN_EXPIRES_IN = "365d"
JWT_REFRESH_TOKEN_EXPIRES_IN = "365d"
```

### 2. 配置敏感信息（推荐使用 Secrets）

为了安全，建议将敏感信息存储为 Secrets：

```bash
# 设置 JWT 密钥（至少 32 字符）
wrangler secret put JWT_SECRET
# 输入: 你的超长随机密钥

# 设置加密密钥（至少 32 字符）
wrangler secret put ENCRYPTION_KEY
# 输入: 你的超长随机密钥
```

**生成随机密钥的方法：**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

如果不使用 Secrets，也可以直接在 `wrangler.toml` 的 `[vars]` 中配置（不推荐）：
```toml
[vars]
JWT_SECRET = "your-super-secret-jwt-key-at-least-32-characters-long"
ENCRYPTION_KEY = "your-encryption-key-at-least-32-characters-long"
```

---

## 🗃️ 第三步：初始化数据库

### 1. 运行数据库迁移

```bash
cd tmarks

# 应用数据库迁移到生产环境
pnpm db:migrate

# 或使用 wrangler 命令
wrangler d1 migrations apply tmarks-prod-db
```

### 2. 验证数据库

```bash
# 查看数据库表
wrangler d1 execute tmarks-prod-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

应该能看到所有表：users, bookmarks, tags, tab_groups 等。

---

## 🌐 第四步：部署到 Cloudflare Pages

### 方式一：通过 Cloudflare Dashboard（推荐）

#### 1. 推送代码到 GitHub

```bash
# 如果还没有推送到 GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. 连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages**
3. 点击 **创建应用程序** → **连接到 Git**
4. 选择你的 GitHub 仓库
5. 点击 **开始设置**

#### 3. 配置构建设置

```
项目名称: tmarks (或自定义)
生产分支: main
根目录: tmarks
构建命令: npm run build
构建输出目录: dist
```

#### 4. 配置环境变量

在 **环境变量** 部分添加（如果没有使用 Secrets）：

| 变量名 | 值 |
|--------|-----|
| `NODE_VERSION` | `18` |
| `JWT_SECRET` | 你的 JWT 密钥 |
| `ENCRYPTION_KEY` | 你的加密密钥 |

#### 5. 绑定资源

在 **设置** → **函数** → **绑定** 中添加：

**D1 数据库绑定：**
- 变量名: `DB`
- D1 数据库: `tmarks-prod-db`

**KV 命名空间绑定：**
- 变量名: `RATE_LIMIT_KV`，选择对应的 KV
- 变量名: `PUBLIC_SHARE_KV`，选择对应的 KV

#### 6. 部署

点击 **保存并部署**，Cloudflare 会自动构建和部署。

### 方式二：通过 Wrangler CLI

```bash
cd tmarks

# 构建项目
pnpm build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=tmarks
```

---

## 🔧 第五步：配置自定义域名（可选）

### 1. 添加自定义域名

1. 在 Cloudflare Pages 项目中，进入 **自定义域**
2. 点击 **设置自定义域**
3. 输入你的域名（如 `tmarks.example.com`）

### 2. 配置 DNS

如果域名在 Cloudflare 托管：
- Cloudflare 会自动添加 DNS 记录

如果域名在其他服务商：
- 添加 CNAME 记录指向 `your-project.pages.dev`

### 3. 等待 SSL 证书

Cloudflare 会自动为你的域名生成免费的 SSL 证书，通常需要几分钟。

---

## 🧪 第六步：验证部署

### 1. 访问网站

访问你的 Cloudflare Pages 域名：
```
https://your-project.pages.dev
```

或自定义域名：
```
https://tmarks.example.com
```

### 2. 测试功能

1. **注册账号** - 访问 `/register` 创建账号
2. **登录** - 使用新账号登录
3. **创建书签** - 测试书签创建功能
4. **创建 API Key** - 在设置中创建 API Key
5. **测试扩展** - 配置浏览器扩展并测试

### 3. 查看日志

```bash
# 实时查看日志
wrangler pages deployment tail
```

---

## 🔌 第七步：部署浏览器扩展

浏览器扩展需要单独构建和分发，不会自动部署到 Cloudflare。

### 1. 构建扩展

```bash
# 进入扩展目录
cd tab

# 安装依赖
pnpm install

# 构建生产版本
pnpm build
```

构建完成后，`dist` 目录包含可分发的扩展文件。

### 2. 打包扩展（用于分发）

打包扩展为 zip 文件，供用户下载：

```bash
# Linux/Mac
cd tab
pnpm build
cd dist
zip -r ../../tmarks/public/tmarks-extension.zip .
cd ../..

# Windows PowerShell
cd tab
pnpm build
Compress-Archive -Path "dist\*" -DestinationPath "..\tmarks\public\tmarks-extension.zip" -Force
cd ..

# Windows CMD
cd tab
pnpm build
powershell Compress-Archive -Path "dist\*" -DestinationPath "..\tmarks\public\tmarks-extension.zip" -Force
cd ..
```

### 3. 更新扩展下载页面

编辑 `tmarks/src/pages/extension/ExtensionPage.tsx`，更新版本信息：

```typescript
版本：1.0.0 | 大小：约 270 KB | 更新时间：2024-11-04
```

### 4. 重新部署 Web 应用

```bash
cd tmarks
git add public/tmarks-extension.zip
git add src/pages/extension/ExtensionPage.tsx
git commit -m "Update browser extension"
git push origin main
```

Cloudflare Pages 会自动重新部署，用户就可以从网站下载最新的扩展。

### 5. 发布到 Chrome Web Store（可选）

如果要发布到官方商店：

1. **准备材料**
   - 扩展 zip 包（`tab/dist` 目录压缩）
   - 应用图标（128x128, 48x48, 16x16）
   - 宣传图片（1280x800 或 640x400）
   - 应用描述和截图

2. **注册开发者账号**
   - 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - 支付一次性注册费用（$5）

3. **上传扩展**
   - 点击「新增项」
   - 上传 zip 包
   - 填写商店信息
   - 提交审核

4. **审核和发布**
   - 审核通常需要 1-3 个工作日
   - 通过后即可公开发布

### 6. 用户安装扩展

#### 从网站下载（开发者模式）

1. 访问你的网站 `/extension` 页面
2. 下载 `tmarks-extension.zip`
3. 解压到本地文件夹
4. 打开浏览器扩展页面（`chrome://extensions/`）
5. 启用「开发者模式」
6. 点击「加载已解压的扩展程序」
7. 选择解压后的文件夹

#### 从 Chrome Web Store 安装（如果已发布）

1. 访问扩展的商店页面
2. 点击「添加至 Chrome」
3. 确认权限
4. 安装完成

### 7. 配置扩展

用户首次使用需要配置：

1. **AI 服务配置**
   - 点击扩展图标 → 设置
   - 选择 AI 提供商（OpenAI、Anthropic、DeepSeek 等）
   - 输入 API Key
   - 配置 Base URL（可选）
   - 测试连接

2. **书签站点配置**
   - API 地址：`https://your-domain.com/api` 或 `https://your-project.pages.dev/api`
   - API Key：在 Web 应用的「API Keys」页面创建
   - 测试连接

3. **验证配置**
   - 在任意网页点击扩展图标
   - 选择「保存书签」模式
   - 应该能看到 AI 标签推荐
   - 保存后在 Web 应用中查看

---

## 🔄 持续部署

### Web 应用自动部署

配置完成后，每次推送到 GitHub 的 `main` 分支，Cloudflare Pages 会自动：
1. 拉取最新代码
2. 运行构建命令
3. 部署新版本

### 浏览器扩展更新流程

扩展需要手动更新：

1. **修改扩展代码**
2. **更新版本号** - 编辑 `tab/manifest.json`：
   ```json
   {
     "version": "1.0.1"
   }
   ```
3. **构建新版本** - `cd tab && pnpm build`
4. **打包扩展** - 运行打包脚本
5. **更新下载页面** - 修改版本信息
6. **提交并推送** - Git 提交和推送
7. **通知用户** - 如果发布到商店，用户会自动更新

### 预览部署

推送到其他分支会创建预览部署：
```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
```

Cloudflare 会为这个分支创建一个预览 URL，可以测试新功能。

---

## 🛠️ 常见问题

### 1. 构建失败

**问题：** 构建时提示找不到模块

**解决：**
```bash
# 确保 package.json 中的依赖完整
cd tmarks
pnpm install
pnpm build  # 本地测试构建
```

### 2. 数据库连接失败

**问题：** 运行时提示数据库未绑定

**解决：**
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 在 Cloudflare Dashboard 中确认 D1 绑定配置
- 确保已运行数据库迁移

### 3. API 返回 500 错误

**问题：** API 请求返回内部错误

**解决：**
```bash
# 查看实时日志
wrangler pages deployment tail

# 检查环境变量
wrangler pages deployment list
```

### 4. 注册功能不可用

**问题：** 无法注册新用户

**解决：**
- 检查 `ALLOW_REGISTRATION` 环境变量是否为 `"true"`
- 在 Cloudflare Dashboard 的环境变量中确认配置

### 5. JWT 认证失败

**问题：** 登录后立即退出

**解决：**
- 确保 `JWT_SECRET` 已正确配置
- 密钥长度至少 32 字符
- 检查 `JWT_ACCESS_TOKEN_EXPIRES_IN` 配置

---

## 📊 监控和维护

### 查看分析数据

在 Cloudflare Dashboard 中可以查看：
- 请求数量
- 带宽使用
- 错误率
- 响应时间

### 数据库备份

```bash
# 导出数据库
wrangler d1 export tmarks-prod-db --output=backup.sql

# 恢复数据库
wrangler d1 execute tmarks-prod-db --file=backup.sql
```

### 更新数据库结构

如果有新的迁移文件：
```bash
cd tmarks
pnpm db:migrate
```

---

## 🔐 安全建议

1. **使用 Secrets** - 敏感信息使用 `wrangler secret` 而不是环境变量
2. **定期更新密钥** - 定期轮换 JWT_SECRET 和 ENCRYPTION_KEY
3. **限制注册** - 生产环境可以设置 `ALLOW_REGISTRATION="false"`
4. **监控日志** - 定期检查异常请求和错误日志
5. **备份数据** - 定期备份 D1 数据库

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 查看 [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
3. 在 [GitHub Issues](https://github.com/yourusername/tmarks/issues) 提问
4. 加入 [Cloudflare Discord](https://discord.gg/cloudflaredev)

---

## 🎉 部署完成

恭喜！你已经成功部署了 TMarks。现在可以：

1. 配置浏览器扩展连接到你的部署
2. 邀请用户注册使用
3. 自定义主题和设置
4. 监控使用情况

祝使用愉快！🚀

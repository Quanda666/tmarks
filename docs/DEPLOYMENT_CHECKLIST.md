# ✅ TMarks 部署检查清单

使用此清单确保部署过程顺利完成，不遗漏任何步骤。

---

## 📋 部署前准备

- [ ] 已注册 Cloudflare 账号
- [ ] 已注册 GitHub 账号
- [ ] 本地已安装 Node.js 18+
- [ ] 本地已安装 pnpm 或 npm
- [ ] 本地已安装 Git
- [ ] 已安装 Wrangler CLI (`npm install -g wrangler`)
- [ ] 已登录 Wrangler (`wrangler login`)

---

## 🗄️ Cloudflare 资源创建

### D1 数据库

- [ ] 执行 `wrangler d1 create tmarks-prod-db`
- [ ] 记录 `database_id`
- [ ] 更新 `wrangler.toml` 中的 `database_id`

### KV 命名空间

- [ ] 执行 `wrangler kv:namespace create "RATE_LIMIT_KV"`
- [ ] 记录 RATE_LIMIT_KV 的 `id`
- [ ] 执行 `wrangler kv:namespace create "PUBLIC_SHARE_KV"`
- [ ] 记录 PUBLIC_SHARE_KV 的 `id`
- [ ] 更新 `wrangler.toml` 中的两个 KV `id`

---

## ⚙️ 项目配置

### wrangler.toml 配置

- [ ] 已更新 `database_id`
- [ ] 已更新 `RATE_LIMIT_KV` 的 `id`
- [ ] 已更新 `PUBLIC_SHARE_KV` 的 `id`
- [ ] 已设置 `ALLOW_REGISTRATION` (true/false)
- [ ] 已设置 `ENVIRONMENT` (production)

### 密钥配置

- [ ] 已生成 JWT_SECRET（至少 32 字符）
- [ ] 已生成 ENCRYPTION_KEY（至少 32 字符）
- [ ] 已执行 `wrangler secret put JWT_SECRET`
- [ ] 已执行 `wrangler secret put ENCRYPTION_KEY`

**或者** 在 `wrangler.toml` 的 `[vars]` 中配置（不推荐）：
- [ ] 已在 `[vars]` 中添加 `JWT_SECRET`
- [ ] 已在 `[vars]` 中添加 `ENCRYPTION_KEY`

---

## 🗃️ 数据库初始化

- [ ] 执行 `cd tmarks`
- [ ] 执行 `pnpm db:migrate` 或 `wrangler d1 migrations apply tmarks-prod-db`
- [ ] 验证数据库表已创建（可选）：
  ```bash
  wrangler d1 execute tmarks-prod-db --command "SELECT name FROM sqlite_master WHERE type='table';"
  ```

---

## 🌐 Cloudflare Pages 部署

### 代码推送

- [ ] 已将代码推送到 GitHub
- [ ] 确认分支名称（通常是 `main` 或 `master`）

### Dashboard 配置（方式一）

- [ ] 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [ ] 进入 **Workers & Pages** → **Pages**
- [ ] 点击 **创建应用程序** → **连接到 Git**
- [ ] 选择 GitHub 仓库
- [ ] 配置构建设置：
  - [ ] 项目名称：`tmarks`（或自定义）
  - [ ] 生产分支：`main`
  - [ ] 根目录：`tmarks`
  - [ ] 构建命令：`npm run build`
  - [ ] 输出目录：`dist`

### 环境变量配置（如果没有使用 Secrets）

- [ ] 添加 `NODE_VERSION` = `18`
- [ ] 添加 `JWT_SECRET`（如果没有用 wrangler secret）
- [ ] 添加 `ENCRYPTION_KEY`（如果没有用 wrangler secret）

### 资源绑定

- [ ] 绑定 D1 数据库：
  - [ ] 变量名：`DB`
  - [ ] 数据库：`tmarks-prod-db`
- [ ] 绑定 KV 命名空间（RATE_LIMIT_KV）：
  - [ ] 变量名：`RATE_LIMIT_KV`
  - [ ] 选择对应的 KV
- [ ] 绑定 KV 命名空间（PUBLIC_SHARE_KV）：
  - [ ] 变量名：`PUBLIC_SHARE_KV`
  - [ ] 选择对应的 KV

### CLI 部署（方式二）

- [ ] 执行 `cd tmarks`
- [ ] 执行 `pnpm build`
- [ ] 执行 `wrangler pages deploy dist --project-name=tmarks`

---

## 🧪 部署验证

### 基本访问

- [ ] 访问 Cloudflare Pages 提供的域名（`*.pages.dev`）
- [ ] 页面正常加载，无 404 或 500 错误
- [ ] 检查浏览器控制台，无 JavaScript 错误

### 功能测试

- [ ] 访问 `/register` 页面
- [ ] 成功注册新账号
- [ ] 成功登录
- [ ] 创建一个测试书签
- [ ] 书签列表正常显示
- [ ] 创建一个标签
- [ ] 标签筛选功能正常
- [ ] 创建一个标签页组
- [ ] 标签页组列表正常显示

### API 测试

- [ ] 在设置中创建 API Key
- [ ] 使用 API Key 测试 API 调用：
  ```bash
  curl -H "X-API-Key: your-api-key" https://your-domain.pages.dev/api/v1/bookmarks
  ```
- [ ] API 返回正常数据

### 日志检查

- [ ] 执行 `wrangler pages deployment tail`
- [ ] 查看是否有错误日志
- [ ] 确认请求正常处理

---

## 🔧 自定义域名（可选）

- [ ] 在 Cloudflare Pages 项目中添加自定义域名
- [ ] 配置 DNS 记录（如果域名在其他服务商）
- [ ] 等待 SSL 证书生成（通常几分钟）
- [ ] 访问自定义域名验证
- [ ] HTTPS 正常工作

---

## 🔌 浏览器扩展部署

### 构建扩展

- [ ] 执行 `cd tab`
- [ ] 执行 `pnpm install`
- [ ] 执行 `pnpm build`
- [ ] 确认 `dist` 目录已生成
- [ ] 检查构建是否有错误

### 打包扩展

- [ ] 压缩 `tab/dist` 目录为 zip 文件
- [ ] 将 zip 文件复制到 `tmarks/public/tmarks-extension.zip`
- [ ] 确认 `tmarks/public/tmarks-extension.zip` 已生成
- [ ] 检查 zip 文件大小（应该在 200-300 KB）

### 更新下载页面

- [ ] 编辑 `tmarks/src/pages/extension/ExtensionPage.tsx`
- [ ] 更新版本号
- [ ] 更新文件大小
- [ ] 更新更新日期
- [ ] 提交更改到 Git

### 重新部署 Web 应用

- [ ] 执行 `git add .`
- [ ] 执行 `git commit -m "Update browser extension"`
- [ ] 执行 `git push origin main`
- [ ] 等待 Cloudflare Pages 自动部署完成
- [ ] 访问 `/extension` 页面验证下载链接

### 发布到 Chrome Web Store（可选）

- [ ] 准备宣传材料（图标、截图、描述）
- [ ] 注册 Chrome Web Store 开发者账号
- [ ] 上传扩展 zip 包
- [ ] 填写商店信息
- [ ] 提交审核
- [ ] 等待审核通过（1-3 个工作日）
- [ ] 发布到商店

### 本地测试扩展

- [ ] 打开浏览器扩展页面（`chrome://extensions/`）
- [ ] 启用「开发者模式」
- [ ] 点击「加载已解压的扩展程序」
- [ ] 选择 `tab/dist` 目录
- [ ] 扩展图标出现在工具栏

### 配置扩展

- [ ] 点击扩展图标，进入设置
- [ ] 配置 AI 服务：
  - [ ] 选择 AI 提供商
  - [ ] 输入 API Key
  - [ ] 测试连接
- [ ] 配置书签站点：
  - [ ] 输入 API 地址（你的部署域名 + `/api`）
  - [ ] 输入 API Key（从 Web 应用创建）
  - [ ] 测试连接

### 测试扩展

- [ ] 在任意网页点击扩展图标
- [ ] 选择「保存书签」模式
- [ ] AI 标签推荐正常工作
- [ ] 成功保存书签
- [ ] 在 Web 应用中看到新保存的书签
- [ ] 测试「收纳标签页」功能
- [ ] 标签页组成功创建

---

## 📊 监控和维护

### 设置监控

- [ ] 在 Cloudflare Dashboard 查看分析数据
- [ ] 设置告警（可选）
- [ ] 配置日志保留策略（可选）

### 备份计划

- [ ] 设置定期数据库备份：
  ```bash
  wrangler d1 export tmarks-prod-db --output=backup-$(date +%Y%m%d).sql
  ```
- [ ] 将备份脚本添加到 cron 或 GitHub Actions（可选）

### 文档记录

- [ ] 记录部署日期
- [ ] 记录域名信息
- [ ] 记录资源 ID（database_id, kv_id）
- [ ] 记录管理员账号信息
- [ ] 保存密钥备份（安全存储）

---

## 🔐 安全检查

- [ ] JWT_SECRET 和 ENCRYPTION_KEY 使用强随机密钥
- [ ] 密钥长度至少 32 字符
- [ ] 敏感信息使用 Secrets 而非环境变量
- [ ] 生产环境考虑关闭注册（`ALLOW_REGISTRATION="false"`）
- [ ] 定期检查访问日志
- [ ] 定期更新依赖包
- [ ] 定期轮换密钥（建议每 6-12 个月）

---

## 🎉 部署完成

恭喜！如果以上所有项目都已勾选，说明你已经成功部署了 TMarks！

### 下一步

- [ ] 邀请用户注册使用
- [ ] 配置团队成员的浏览器扩展
- [ ] 自定义主题和设置
- [ ] 监控使用情况和性能
- [ ] 收集用户反馈
- [ ] 规划功能迭代

### 获取帮助

如果遇到问题：
- 查看 [详细部署文档](DEPLOYMENT.md)
- 查看 [常见问题](../README.md#常见问题)
- 在 [GitHub Issues](https://github.com/yourusername/tmarks/issues) 提问

---

**部署日期：** _______________

**部署人员：** _______________

**域名：** _______________

**备注：** _______________

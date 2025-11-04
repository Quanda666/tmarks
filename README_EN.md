<div align="center">

# 🔖 TMarks

**AI-Powered Intelligent Bookmark Management System**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020.svg)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

English | [简体中文](README.md)

[Live Demo](https://tmarks.669696.xyz) | [Documentation](docs/) | [Report Issues](https://github.com/yourusername/tmarks/issues)

</div>

---

## ✨ Introduction

TMarks is a modern bookmark management solution that combines AI technology to automatically generate intelligent tags for your bookmarks, making bookmark management simple and efficient. The project includes both a web application and a browser extension, supporting multi-device sync, public sharing, tab group management, and more.

### 🎯 Key Features

#### 📚 Bookmark Management
- **AI Smart Tags** - Support for OpenAI, Anthropic, DeepSeek, Zhipu, and other AI models to automatically generate high-quality tags
- **Multi-dimensional Filtering** - Quickly find bookmarks by tags, keywords, visibility, and more
- **Batch Operations** - Support for batch editing, deleting, and exporting bookmarks
- **Drag & Drop Sorting** - Intuitive drag-and-drop operations to freely adjust bookmark order
- **Multiple Views** - Card, list, minimal, waterfall, and other display modes

#### 🗂️ Tab Group Management
- **One-Click Collection** - Similar to OneTab, save all current browser tabs with one click
- **Smart Grouping** - Support for folder hierarchy structure, flexible organization of tab groups
- **Quick Restore** - One-click restore of previously saved tab groups to continue work
- **Recycle Bin** - Accidentally deleted tab groups can be restored from the recycle bin

#### 🌐 Public Sharing
- **Custom Share Page** - Create personalized public bookmark showcase pages
- **Access Control** - Flexible control of bookmark public/private status
- **Independent Domain** - Each user has an independent share link (slug)

#### 🔌 Browser Extension
- **Quick Save** - Save bookmarks with one click on any webpage
- **AI Recommendations** - Real-time tag suggestions
- **Offline Support** - Local caching with IndexedDB, accessible offline
- **Tab Collection** - Collect all tabs in the current window directly from the extension

#### 🎨 User Experience
- **Responsive Design** - Perfect adaptation for desktop and mobile
- **Multi-theme Support** - Free switching between light and dark themes
- **Real-time Sync** - Browser extension and web app sync in real-time
- **Performance Optimization** - Search debouncing, virtual scrolling, code splitting, and more

---

## 🏗️ Tech Stack

### Frontend

```
React 18 + TypeScript
├── Build Tool: Vite 6
├── Styling: TailwindCSS 4 (alpha)
├── State Management: Zustand
├── Data Fetching: @tanstack/react-query
├── Routing: React Router v7
├── Drag & Drop: @dnd-kit
└── Icons: lucide-react
```

### Backend

```
Cloudflare Workers (Pages Functions)
├── Runtime: Cloudflare Workers
├── Database: Cloudflare D1 (SQLite)
├── Cache: Cloudflare KV
├── Authentication: JWT (Access + Refresh tokens)
└── API: RESTful API
```

### Browser Extension

```
Manifest V3
├── Framework: React 19 + TypeScript
├── Build: Vite + @crxjs/vite-plugin
├── Local Storage: Dexie (IndexedDB)
├── AI Integration: OpenAI, Anthropic, DeepSeek, etc.
└── Styling: TailwindCSS
```

---

## 📁 Project Structure

```
tmarks/
├── tmarks/                    # Web application main project
│   ├── src/                  # Frontend source code
│   │   ├── components/      # React components
│   │   │   ├── bookmarks/  # Bookmark-related components
│   │   │   ├── tags/       # Tag-related components
│   │   │   ├── tab-groups/ # Tab group components
│   │   │   └── common/     # Common components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # API services
│   │   ├── stores/         # Zustand state management
│   │   └── lib/            # Utility functions and types
│   ├── functions/          # Cloudflare Workers backend
│   │   ├── api/           # API routes
│   │   ├── lib/           # Backend utilities
│   │   └── middleware/    # Middleware
│   ├── migrations/        # Database migration files
│   └── shared/           # Shared code between frontend and backend
│
├── tab/                      # Browser extension
│   ├── src/
│   │   ├── popup/         # Popup interface
│   │   ├── options/       # Options page
│   │   ├── background/    # Background service
│   │   ├── content/       # Content script
│   │   └── lib/           # Utility library
│   │       ├── api/       # API client
│   │       ├── db/        # IndexedDB
│   │       ├── providers/ # AI providers
│   │       └── services/  # Business logic
│   └── manifest.json      # Extension configuration
│
└── docs/                     # Project documentation
    ├── DEPLOYMENT.md         # Deployment guide
    └── ...                   # Other docs
```

---

## 🚀 Quick Start

### Requirements

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (recommended) or npm
- **Cloudflare Account** (for deployment)

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tmarks.git
cd tmarks
```

#### 2. Install Dependencies

```bash
# Web application
cd tmarks
pnpm install

# Browser extension
cd ../tab
pnpm install
```

#### 3. Configure Environment Variables

```bash
# Web application
cd tmarks
cp .env.example .env.development

# Edit .env.development and configure necessary environment variables
```

#### 4. Database Setup

```bash
# Local database migration
cd tmarks
pnpm db:migrate:local
```

#### 5. Start Development Server

```bash
# Web application
cd tmarks
pnpm dev

# Browser extension
cd tab
pnpm dev
```

Visit http://localhost:5173 to view the web application.

### Browser Extension Installation

1. Build the extension:
```bash
cd tab
pnpm build
```

2. Load in browser:
   - Open Chrome/Edge extensions page (`chrome://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `tab/dist` directory

3. Configure the extension:
   - Click the extension icon and go to settings
   - Configure AI service API Key
   - Configure bookmark site API URL and API Key

---

## 📖 User Guide

### Web Application

#### Bookmark Management
1. **Add Bookmark** - Click "New Bookmark" button, fill in title, URL, description, etc.
2. **AI Tags** - System automatically generates smart tag suggestions for bookmarks
3. **Search & Filter** - Use search box or tag filters to quickly find bookmarks
4. **Batch Operations** - Select multiple bookmarks for batch editing or deletion

#### Tab Groups
1. **Create Tab Group** - Click "New Tab Group", manually add tabs
2. **Use Extension to Collect** - One-click collect all tabs in current window via browser extension
3. **Restore Tabs** - Click "Restore" button on tab group to open all tabs in new window
4. **Folder Management** - Create folders to organize tab groups

#### Public Sharing
1. **Enable Sharing** - Enable public sharing in settings
2. **Customize Page** - Set share page title and description
3. **Control Visibility** - Set public/private status for each bookmark
4. **Share Link** - Copy share link to share with others

### Browser Extension

#### Save Bookmark
1. Click extension icon on any webpage
2. Select "Save Bookmark" mode
3. AI automatically analyzes page and generates tag suggestions
4. Select or add tags, click "Save Bookmark"

#### Collect Tabs
1. Click extension icon
2. Select "Collect Tabs" mode
3. Select tabs to collect (or select all)
4. Click "Collect" button

---

## 🔧 Configuration

### Web Application Configuration

#### Environment Variables (.env.development)

```env
# API Configuration
VITE_API_URL=/api/v1
```

#### Cloudflare Configuration (wrangler.toml)

```toml
name = "tmarks"
compatibility_date = "2024-03-18"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "tmarks-prod-db"
database_id = "your_database_id"

# KV Namespaces
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your_kv_id"

[[kv_namespaces]]
binding = "PUBLIC_SHARE_KV"
id = "your_kv_id"

# Environment Variables
[vars]
ALLOW_REGISTRATION = "true"
JWT_SECRET = "your-secret-key"
ENCRYPTION_KEY = "your-encryption-key"
ENVIRONMENT = "production"
```

### Browser Extension Configuration

Configure in the extension's settings page:

1. **AI Service**
   - Select AI provider (OpenAI, Anthropic, DeepSeek, etc.)
   - Enter corresponding API Key
   - Configure Base URL (optional)

2. **Bookmark Site**
   - API URL: `https://your-domain.com/api`
   - API Key: Create in "API Keys" page of web application

---

## 🚀 Deployment

TMarks uses Cloudflare Pages + D1 + KV for deployment, completely free with excellent performance.

### Quick Deployment Steps

#### 1. Create Cloudflare Resources

```bash
# Install and login to Wrangler
npm install -g wrangler
wrangler login

# Create D1 database
cd tmarks
wrangler d1 create tmarks-prod-db

# Create KV namespaces
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "PUBLIC_SHARE_KV"
```

#### 2. Configure Project

Edit `tmarks/wrangler.toml` and fill in the resource IDs from the previous step:

```toml
[[d1_databases]]
database_id = "your-database-id"

[[kv_namespaces]]
id = "your-kv-id"
```

Configure sensitive information (recommended using Secrets):

```bash
# Generate and set secrets
wrangler secret put JWT_SECRET
wrangler secret put ENCRYPTION_KEY
```

#### 3. Initialize Database

```bash
cd tmarks
pnpm db:migrate
```

#### 4. Deploy

**Method 1: Via Cloudflare Dashboard (Recommended)**

1. Push code to GitHub
2. Connect repository in [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `tmarks`
4. Bind D1 database and KV namespaces
5. Save and deploy

**Method 2: Via Wrangler CLI**

```bash
cd tmarks
pnpm build
wrangler pages deploy dist --project-name=tmarks
```

### Detailed Deployment Guide

For complete deployment steps, troubleshooting, and best practices, please refer to:

📖 **[Detailed Deployment Documentation](docs/DEPLOYMENT.md)**

Includes:
- Prerequisites and environment setup
- Detailed resource creation steps
- Database migration and verification
- Custom domain configuration
- Continuous deployment setup
- Common issues and solutions
- Security recommendations and monitoring

---

## 📊 API Documentation

### Authentication

```bash
# Register
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "user",
  "password": "password",
  "email": "user@example.com"
}

# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}
```

### Bookmarks

```bash
# Get bookmark list
GET /api/v1/bookmarks?keyword=search&tags=tag1,tag2&sort=popular

# Create bookmark
POST /api/v1/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Example",
  "url": "https://example.com",
  "description": "Description",
  "tags": ["tag1", "tag2"]
}

# Update bookmark
PUT /api/v1/bookmarks/:id
Authorization: Bearer <token>

# Delete bookmark
DELETE /api/v1/bookmarks/:id
Authorization: Bearer <token>
```

### Tab Groups

```bash
# Get tab group list
GET /api/v1/tab-groups
Authorization: Bearer <token>

# Create tab group
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

For complete API documentation, please refer to [API Documentation](docs/API.md).

---

## 🤝 Contributing

We welcome all forms of contributions!

### How to Contribute

1. **Fork the Project**
2. **Create Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to Branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### Code Standards

- Use TypeScript strict mode
- Follow ESLint and Prettier configuration
- Write clear commit messages
- Add necessary comments and documentation
- Ensure code passes all checks

### Development Workflow

```bash
# Code linting
pnpm lint

# Code formatting
pnpm format

# Type checking
pnpm type-check

# Build
pnpm build
```

---

## 🗺️ Roadmap

### Short-term Plans

- [ ] Mobile App (React Native)
- [ ] Browser bookmark import optimization
- [ ] More AI model support
- [ ] Team collaboration features
- [ ] Bookmark comments and notes

### Long-term Plans

- [ ] Browser history analysis
- [ ] Intelligent recommendation system
- [ ] Knowledge graph visualization
- [ ] Third-party service integration (Notion, Obsidian, etc.)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Thanks to the following open source projects:

- [React](https://reactjs.org/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [Cloudflare](https://www.cloudflare.com/) - Deployment Platform
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Lucide](https://lucide.dev/) - Icon Library
- [Zustand](https://zustand-demo.pmnd.rs/) - State Management
- [TanStack Query](https://tanstack.com/query) - Data Fetching
- [dnd-kit](https://dndkit.com/) - Drag & Drop Library

---

## 📧 Contact

- **Project Homepage**: [GitHub Repository](https://github.com/yourusername/tmarks)
- **Report Issues**: [GitHub Issues](https://github.com/yourusername/tmarks/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tmarks/discussions)

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

Made with ❤️ by TMarks Team

</div>

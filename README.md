<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MindVault - 个人知识管理系统

一个功能完整的个人知识管理应用，支持知识块管理、提示词库、分类管理等功能，数据存储在云端 Supabase 数据库。

## 功能特性

- 📚 **知识块管理**: 创建、编辑、分类管理知识内容，支持 Markdown 格式
- 🔒 **私有/公开**: 支持设置知识块为私有，需要密码才能查看
- 🏷️ **分类系统**: 主分类 + 子分类两级结构，灵活组织知识
- 💡 **提示词库**: 管理和快速填充 AI 提示词模板
- 📊 **数据仪表板**: 可视化统计知识库数据
- 🔐 **用户认证**: 安全的登录/注册系统，数据隔离
- ☁️ **云端存储**: 所有数据存储在 Supabase，安全可靠

## 技术栈

### 前端
- React 19 + TypeScript
- Vite 构建工具
- Tailwind CSS
- React Markdown (Markdown 渲染)

### 后端
- Express.js + TypeScript
- Supabase (PostgreSQL + Auth)

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 2. 配置 Supabase

按照 [DATABASE_SETUP.md](./DATABASE_SETUP.md) 的说明：
1. 在 Supabase 创建项目
2. 执行数据库 SQL 脚本
3. 获取 Project URL 和 Service Key

### 3. 配置环境变量

创建后端环境文件 `server/.env`：
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
PORT=3001
```

创建前端环境文件 `.env`：
```
VITE_API_URL=http://localhost:3001/api
```

### 4. 启动服务

```bash
# 启动后端 (端口 3001)
cd server
npm run dev

# 在另一个终端启动前端 (端口 3000)
cd ..
npm run dev
```

访问 http://localhost:3000 即可使用应用。

## 项目结构

```
├── src/                    # 前端代码
│   ├── App.tsx            # 主应用组件
│   ├── auth.tsx           # 认证页面
│   ├── components.tsx     # 通用组件
│   ├── data.ts            # 数据类型定义
│   ├── forms.tsx          # 表单组件
│   ├── views.tsx          # 页面视图
│   └── api/               # API 客户端
│       └── client.ts
├── server/                 # 后端代码
│   ├── index.ts           # 服务器入口
│   ├── routes/            # API 路由
│   │   ├── auth.ts        # 认证路由
│   │   ├── categories.ts  # 分类路由
│   │   ├── knowledge.ts   # 知识块路由
│   │   └── prompts.ts     # 提示词路由
│   ├── middleware/        # 中间件
│   │   └── auth.ts        # 认证中间件
│   ├── types/             # 类型定义
│   └── supabase/          # 数据库迁移
└── DATABASE_SETUP.md      # 数据库设置指南
```

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 知识块
- `GET /api/knowledge` - 获取所有知识块
- `GET /api/knowledge/:id` - 获取单个知识块
- `POST /api/knowledge` - 创建知识块
- `PUT /api/knowledge/:id` - 更新知识块
- `DELETE /api/knowledge/:id` - 删除知识块
- `POST /api/knowledge/batch-delete` - 批量删除

### 提示词
- `GET /api/prompts` - 获取所有提示词
- `GET /api/prompts/:id` - 获取单个提示词
- `POST /api/prompts` - 创建提示词
- `PUT /api/prompts/:id` - 更新提示词
- `DELETE /api/prompts/:id` - 删除提示词

### 分类
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

## License

Apache-2.0

# MindVault 数据库设置指南

## Supabase 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称和密码
4. 等待项目创建完成（约需 2-3 分钟）

### 2. 获取连接信息

项目创建完成后，进入项目设置页面获取以下信息：

- **Project URL**: Settings → API → Project URL
- **Service Role Key**: Settings → API → service_role key (注意：需要在Project Settings的API设置中显示service_role)
- **Anon Key**: Settings → API → anon/public key

### 3. 创建数据库表

在 Supabase Dashboard 中，进入 **SQL Editor**，执行以下 SQL 脚本：

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subcategories TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can only access their own categories
CREATE POLICY "Users can CRUD own categories" ON categories
    FOR ALL USING (auth.uid() = user_id);

-- Create knowledge_blocks table
CREATE TABLE IF NOT EXISTS knowledge_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    remarks TEXT DEFAULT '',
    category TEXT NOT NULL,
    subcategory TEXT DEFAULT '',
    view_count INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on knowledge_blocks
ALTER TABLE knowledge_blocks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own knowledge blocks
CREATE POLICY "Users can CRUD own knowledge blocks" ON knowledge_blocks
    FOR ALL USING (auth.uid() = user_id);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    fields JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own prompts
CREATE POLICY "Users can CRUD own prompts" ON prompts
    FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_blocks_updated_at
    BEFORE UPDATE ON knowledge_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. 配置环境变量

1. 复制 `.env.example` 到 `.env`：
   ```bash
   cp server/.env.example server/.env
   ```

2. 编辑 `server/.env` 文件，填入你的 Supabase 信息：
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   PORT=3001
   ```

3. 编辑前端 `.env` 文件（在项目根目录创建）：
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

### 5. 启用 Email 认证（可选）

如果需要邮件验证功能：

1. 进入 Authentication → Providers → Email
2. 启用 "Confirm email" 选项
3. 配置 SMTP 设置（可选，用于发送真实邮件）

### 6. 本地开发

1. 安装后端依赖：
   ```bash
   cd server
   npm install
   ```

2. 启动后端服务：
   ```bash
   npm run dev
   ```

3. 在另一个终端启动前端：
   ```bash
   cd ..
   npm run dev
   ```

4. 访问 http://localhost:3000 即可使用应用

## 数据库结构说明

### users 表
存储用户信息，与 Supabase Auth 同步

### categories 表
存储知识分类，每个用户有自己的分类

### knowledge_blocks 表
存储知识块内容
- `view_count`: 浏览次数
- `content`: 支持 Markdown 格式

### prompts 表
存储提示词模板
- `fields`: JSONB 格式存储变量字段配置
- `tags`: 标签数组
- `original_prompt`: 原始提示词模板

## 安全说明

- 所有表都启用了 Row Level Security (RLS)
- 用户只能访问自己的数据
- 使用 Supabase Auth 进行身份验证
- Service Role Key 只在服务端使用，不要暴露到前端

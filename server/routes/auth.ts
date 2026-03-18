import { Router } from 'express';
import { supabase } from '../index.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ id: authData.user.id, email, name }]);

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }

      // Create default categories for new user
      const defaultCategories = [
        { name: '编程开发', subcategories: ['Python', 'TypeScript', 'Rust', '后端架构', '前端开发'], user_id: authData.user.id },
        { name: '设计美学', subcategories: ['UI/UX 设计', '字体排版'], user_id: authData.user.id },
        { name: '数据科学', subcategories: ['机器学习', '数据分析'], user_id: authData.user.id },
        { name: '生活随笔', subcategories: ['阅读笔记', '旅行日记'], user_id: authData.user.id },
      ];

      await supabase.from('categories').insert(defaultCategories);

      // Create built-in knowledge blocks
      const defaultBlocks = [
        {
          title: 'React Hooks 最佳实践',
          content: '## React Hooks 使用指南\n\n在使用 React Hooks 时，遵循以下最佳实践可以提升代码质量和应用性能。\n\n### 1. 依赖数组管理\n确保 `useEffect`、`useCallback`、`useMemo` 中的依赖数组完整包含所有在其中引用的变量。\n\n### 2. 避免冗余的状态\n不要在状态中保存可以通过其他状态或属性推导出的数据。\n\n### 3. 提取自定义 Hooks\n复杂的组件逻辑应当抽离为独立的自定义 Hook 以便复用。',
          remarks: '面试常考知识点',
          category: '编程开发',
          subcategory: '前端开发',
          view_count: 0,
          user_id: authData.user.id
        },
        {
          title: 'Git 常用命令速查',
          content: '## Git 核心命令\n\n掌握这些基本命令可以应付 90% 的版本控制场景。\n\n![Git Logo](https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png)\n\n### 基础操作\n- `git clone <url>`: 克隆远程仓库\n- `git add .`: 暂存所有更改\n- `git commit -m "msg"`: 提交更改\n- `git push`: 推送更改\n\n### 分支管理\n- `git branch`: 查看本地分支\n- `git checkout -b <name>`: 创建并切换到新分支\n- `git merge <name>`: 合并指定分支到当前分支',
          remarks: '日常工作必备',
          category: '编程开发',
          subcategory: '后端架构',
          view_count: 0,
          user_id: authData.user.id
        },
        {
          title: '色彩搭配理论基础',
          content: '## 经典色彩搭配法则\n\n设计中的颜色搭配直接影响到用户的情感体验。\n\n### 1. 互补色\n色相环上相对的两种颜色，对比强烈，可以用来突出重点信息（如：红和绿，蓝和橙）。\n\n### 2. 相近色\n色相环上相邻的颜色，和谐统一，适合用来作为背景或构建整体氛围。\n\n### 3. 60-30-10 法则\n主色调占 60%，辅助色占 30%，点缀色占 10%。',
          remarks: 'UI设计入门',
          category: '设计美学',
          subcategory: 'UI/UX 设计',
          view_count: 0,
          user_id: authData.user.id
        }
      ];

      await supabase.from('knowledge_blocks').insert(defaultBlocks);

      // Create built-in prompts
      const defaultPrompts = [
        {
          title: '代码 Review 助手',
          description: '利用 AI 帮忙进行代码走查，指出代码中的潜在问题和可优化的地方。',
          original_prompt: '你是一个资深软件工程师。请帮我 Review 下面这段 [语言] 代码。请指出潜在的 bug、性能瓶颈、可读性问题，并给出改进建议。\n\n代码如下：\n[代码]',
          fields: [
            { name: '语言', placeholder: '输入编程语言 (如: TypeScript)', type: 'text' },
            { name: '代码', placeholder: '贴入需要 Review 的代码', type: 'text' }
          ],
          tags: ['编程', '代码审查', '效率'],
          view_count: 0,
          user_id: authData.user.id
        },
        {
          title: '小红书种草文案生成器',
          description: '一键生成具有吸引力的小红书爆款文案风格，适合商品推广或日常分享。',
          original_prompt: '请你扮演一位小红书爆款文案写手。我需要写一篇关于 [产品/主题] 的种草文案。它的核心卖点是 [核心卖点]。\n请使用活泼、充满情绪价值的语气，多使用 emoji，并包含引人注目的标题、详细的体验感受以及引导互动的结尾。',
          fields: [
            { name: '产品/主题', placeholder: '输入产品名称或分享主题', type: 'text' },
            { name: '核心卖点', placeholder: '输入产品的最大特色', type: 'text' }
          ],
          tags: ['文案', '社交媒体', '营销'],
          view_count: 0,
          user_id: authData.user.id
        }
      ];

      await supabase.from('prompts').insert(defaultPrompts);
    }

    res.json({
      success: true,
      user: { id: authData.user?.id, email: authData.user?.email, name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || '',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || '',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

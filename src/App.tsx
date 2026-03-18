/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from './components';
import { KnowledgeDashboard, KnowledgeList, KnowledgeDetail, PromptList, PromptDetail, CategoryManage } from './views';
import { KnowledgeForm, PromptForm } from './forms';
import { Category, KnowledgeBlock, Prompt, adaptKnowledgeBlock, adaptPrompt } from './data';
import { AuthScreen } from './auth';
import { authAPI, knowledgeAPI, promptsAPI, categoriesAPI } from './api/client';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'knowledge' | 'prompts' | 'categories-manage'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<KnowledgeBlock | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [blocks, setBlocks] = useState<KnowledgeBlock[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  const [userContext, setUserContext] = useState<any>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.me();
          setUserContext(res.user);
          setIsLoggedIn(true);
          await loadData();
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const loadData = async () => {
    try {
      const [blocksRes, promptsRes, categoriesRes] = await Promise.all<any>([
        knowledgeAPI.getAll(),
        promptsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setBlocks(blocksRes.blocks || []);
      setPrompts(promptsRes.prompts || []);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogin = async (session: any) => {
    localStorage.setItem('token', session.access_token);
    try {
      const res = await authAPI.me();
      setUserContext(res.user);
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(true);
    await loadData();
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore error
    }
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserContext(null);
    setBlocks([]);
    setPrompts([]);
    setCategories([]);
    setSelectedBlock(null);
    setSelectedPrompt(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const handleSelectCategory = (category: string | null, subcategory?: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory || null);
    setCurrentView('knowledge');
    setSelectedBlock(null);
    setSelectedPrompt(null);
    setIsEditingBlock(false);
    setIsEditingPrompt(false);
  };

  const handleSelectBlock = async (block: KnowledgeBlock) => {
    try {
      const res: any = await knowledgeAPI.getById(block.id);
      const updatedBlock = res.block;
      setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
      setSelectedBlock(adaptKnowledgeBlock(updatedBlock));
    } catch (error) {
      console.error('Failed to load block:', error);
    }
  };

  const handleSelectPrompt = async (prompt: Prompt) => {
    try {
      const res: any = await promptsAPI.getById(prompt.id);
      const updatedPrompt = res.prompt;
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
      setSelectedPrompt(adaptPrompt(updatedPrompt));
      setCurrentView('prompts');
    } catch (error) {
      console.error('Failed to load prompt:', error);
    }
  };

  const handleSaveBlock = async (blockData: Partial<KnowledgeBlock>) => {
    try {
      if (selectedBlock && blocks.some(b => b.id === blockData.id)) {
        const res: any = await knowledgeAPI.update(blockData.id!, blockData);
        setBlocks(blocks.map(b => b.id === res.block.id ? res.block : b));
        setSelectedBlock(adaptKnowledgeBlock(res.block));
      } else {
        const res: any = await knowledgeAPI.create(blockData);
        setBlocks([res.block, ...blocks]);
        setSelectedBlock(adaptKnowledgeBlock(res.block));
      }
      setIsEditingBlock(false);
    } catch (error) {
      console.error('Failed to save block:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDeleteBlock = async (ids: string | string[]) => {
    const idsToDelete = Array.isArray(ids) ? ids : [ids];
    if (window.confirm(`确定要删除选中的 ${idsToDelete.length} 个知识块吗？`)) {
      try {
        if (idsToDelete.length === 1) {
          await knowledgeAPI.delete(idsToDelete[0]);
        } else {
          await knowledgeAPI.batchDelete(idsToDelete);
        }
        setBlocks(blocks.filter(b => !idsToDelete.includes(b.id)));
        if (selectedBlock && idsToDelete.includes(selectedBlock.id)) {
          setSelectedBlock(null);
        }
      } catch (error) {
        console.error('Failed to delete blocks:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleSavePrompt = async (promptData: Partial<Prompt>) => {
    try {
      // Convert camelCase to snake_case for API
      const apiData = {
        ...promptData,
        original_prompt: promptData.original_prompt ?? (promptData as any).originalPrompt,
      };

      if (selectedPrompt && prompts.some(p => p.id === promptData.id)) {
        const res: any = await promptsAPI.update(promptData.id!, apiData);
        setPrompts(prompts.map(p => p.id === res.prompt.id ? res.prompt : p));
        setSelectedPrompt(adaptPrompt(res.prompt));
      } else {
        const res: any = await promptsAPI.create(apiData);
        setPrompts([res.prompt, ...prompts]);
        setSelectedPrompt(adaptPrompt(res.prompt));
      }
      setIsEditingPrompt(false);
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (window.confirm('确定要删除这个提示词吗？')) {
      try {
        await promptsAPI.delete(id);
        setPrompts(prompts.filter(p => p.id !== id));
        setSelectedPrompt(null);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleSaveCategories = async (newCategories: Category[]) => {
    // Categories are updated individually via API
    setCategories(newCategories);
    // Reload to get server state
    await loadData();
  };

  const renderContent = () => {
    if (isEditingBlock) {
      return (
        <KnowledgeForm
          block={selectedBlock}
          categories={categories}
          onSave={handleSaveBlock}
          onCancel={() => setIsEditingBlock(false)}
        />
      );
    }

    if (isEditingPrompt) {
      return (
        <PromptForm
          prompt={selectedPrompt}
          onSave={handleSavePrompt}
          onCancel={() => setIsEditingPrompt(false)}
        />
      );
    }

    if (selectedBlock) {
      return (
        <KnowledgeDetail
          block={selectedBlock}
          onBack={() => setSelectedBlock(null)}
          onEdit={() => setIsEditingBlock(true)}
          onDelete={() => handleDeleteBlock(selectedBlock.id)}
        />
      );
    }

    if (selectedPrompt) {
      return (
        <PromptDetail
          prompt={selectedPrompt}
          onBack={() => setSelectedPrompt(null)}
          onEdit={() => setIsEditingPrompt(true)}
          onDelete={() => handleDeletePrompt(selectedPrompt.id)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <KnowledgeDashboard blocks={blocks.map(adaptKnowledgeBlock)} />;
      case 'knowledge':
        return (
          <KnowledgeList
            blocks={blocks.map(adaptKnowledgeBlock)}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            searchQuery={searchQuery}
            onSelectBlock={handleSelectBlock}
            onAddBlock={() => {
              setSelectedBlock(null);
              setIsEditingBlock(true);
            }}
            onDeleteBlock={handleDeleteBlock}
          />
        );
      case 'prompts':
        return (
          <PromptList
            prompts={prompts.map(adaptPrompt)}
            searchQuery={searchQuery}
            onSelectPrompt={handleSelectPrompt}
            onAddPrompt={() => {
              setSelectedPrompt(null);
              setIsEditingPrompt(true);
            }}
          />
        );
      case 'categories-manage':
        return (
          <CategoryManage
            categories={categories}
            setCategories={handleSaveCategories}
          />
        );
      default:
        return <KnowledgeDashboard blocks={blocks.map(adaptKnowledgeBlock)} />;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '') {
      setCurrentView('knowledge');
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-sans overflow-hidden">
      <Sidebar
        categories={categories}
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          setSelectedBlock(null);
          setSelectedPrompt(null);
          setIsEditingBlock(false);
          setIsEditingPrompt(false);
          setSearchQuery(''); // Clear search when navigating
          if (view !== 'knowledge') {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
          }
        }}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectCategory={handleSelectCategory}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

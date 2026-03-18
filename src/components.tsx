import React, { useState } from 'react';
import { Database, LayoutGrid, BarChart2, History, MessageSquare, Gauge, ChevronRight, Settings, Search, Bell, Lock, Globe, Eye, MoreVertical, Edit, Copy, CheckSquare, Trash2, Plus, PlusCircle, ArrowLeft, Share2, Heart, Lightbulb, CheckCircle, Tags, Terminal, LogOut } from 'lucide-react';
import { Category } from './data';

export const Sidebar = ({ currentView, setCurrentView, categories, selectedCategory, onSelectCategory, selectedSubcategory, onLogout }: any) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-primary/10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl flex flex-col h-full shadow-[4px_0_24px_rgba(181,131,141,0.02)]">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 shadow-sm">
          <Terminal size={22} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-serif font-bold tracking-tight text-primary-dark dark:text-primary-light">MindVault</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 space-y-8">
        <div>
          <p className="text-xs font-serif italic text-primary-dark/60 dark:text-primary-light/60 uppercase tracking-widest mb-3 px-2">Knowledge Base</p>
          <div className="space-y-1">
            <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${currentView === 'dashboard' ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'}`}>
              <BarChart2 size={18} strokeWidth={currentView === 'dashboard' ? 2 : 1.5} />
              <span className="text-sm">控制台</span>
            </button>
            <button onClick={() => setCurrentView('knowledge')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${currentView === 'knowledge' ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'}`}>
              <LayoutGrid size={18} strokeWidth={currentView === 'knowledge' ? 2 : 1.5} />
              <span className="text-sm">所有知识块</span>
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs font-serif italic text-primary-dark/60 dark:text-primary-light/60 uppercase tracking-widest mb-3 px-2">Prompt Library</p>
          <div className="space-y-1">
            <button onClick={() => setCurrentView('prompts')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${currentView === 'prompts' ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'}`}>
              <MessageSquare size={18} strokeWidth={currentView === 'prompts' ? 2 : 1.5} />
              <span className="text-sm">提示词资产</span>
            </button>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <p className="text-xs font-serif italic text-primary-dark/60 dark:text-primary-light/60 uppercase tracking-widest">Categories</p>
            <button onClick={() => setCurrentView('categories-manage')} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-300 text-[10px] font-medium ${currentView === 'categories-manage' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`} title="管理分类">
              <Settings size={12} strokeWidth={1.5} />
              修改分类
            </button>
          </div>
          <div className="space-y-4">
            {categories.map((c: Category) => (
              <div key={c.id}>
                <div 
                  className="flex items-center justify-between px-3 py-1 group cursor-pointer"
                  onClick={() => {
                    if (selectedCategory === c.name) {
                      onSelectCategory(null, null);
                    } else {
                      onSelectCategory(c.name, null);
                    }
                  }}
                >
                  <span className={`text-sm ${selectedCategory === c.name ? 'text-primary font-medium' : 'text-slate-600 dark:text-slate-400'}`}>{c.name}</span>
                  <ChevronRight size={14} strokeWidth={2} className={`text-slate-300 transition-transform duration-300 ${selectedCategory === c.name ? 'rotate-90 text-primary' : 'group-hover:rotate-90 group-hover:text-primary/50'}`} />
                </div>
                {selectedCategory === c.name && (
                  <div className="mt-1.5 ml-4 border-l-2 border-primary/10 space-y-0.5">
                    {c.subcategories.map(sub => (
                      <button 
                        key={sub} 
                        onClick={() => {
                          onSelectCategory(c.name, sub);
                        }}
                        className={`w-full text-left block pl-5 py-1.5 text-sm transition-all duration-300 rounded-r-lg ${selectedSubcategory === sub ? 'text-primary font-medium bg-primary/5 border-l-2 border-primary -ml-[2px]' : 'text-slate-500 hover:text-primary hover:bg-primary/5'}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
      <div className="p-4 border-t border-primary/10 space-y-2">
        {onLogout && (
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300">
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export const Topbar = ({ searchQuery, setSearchQuery }: any) => {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl border-b border-primary/10 flex-shrink-0 sticky top-0 z-10 shadow-[0_4px_24px_rgba(181,131,141,0.02)]">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-background-light dark:bg-background-dark border border-primary/10 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 text-sm outline-none shadow-inner"
            placeholder="全局快速搜索..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 relative">
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-light rounded-full border-2 border-white dark:border-surface-dark"></span>
        </button>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm cursor-pointer hover:bg-primary/20 transition-colors">
          <span className="text-xs font-serif font-bold text-primary-dark dark:text-primary-light">JD</span>
        </div>
      </div>
    </header>
  );
};

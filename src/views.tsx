import React, { useState } from 'react';
import { KnowledgeBlock, Prompt, Category } from './data';
import { Database, LayoutGrid, BarChart2, History, MessageSquare, Gauge, ChevronRight, Settings, Search, Bell, Lock, Globe, Eye, MoreVertical, Edit, Copy, CheckSquare, Trash2, Plus, PlusCircle, ArrowLeft, Share2, Heart, Lightbulb, CheckCircle, Tags, FileText, FileCode2, Palette, Briefcase, Scale, Users, Shield } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { authAPI } from './api/client';

export const KnowledgeDashboard = ({ blocks }: { blocks: KnowledgeBlock[] }) => {
  const totalBlocks = blocks.length;
  const publicBlocks = blocks.length;
  const totalViews = blocks.reduce((sum, b) => sum + (b.view_count || (b as any).viewCount || 0), 0);

  const categoryCounts = blocks.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const colors = ['#B5838D', '#E5989B', '#FFB4A2', '#FFCDB2', '#6D6875', '#A88B9D'];
  let currentPercentage = 0;
  const pieData = totalCategories > 0 ? Object.entries(categoryCounts).map(([cat, count], index) => {
    const percentage = (count / totalCategories) * 100;
    const start = currentPercentage;
    currentPercentage += percentage;
    return {
      cat,
      count,
      percentage,
      color: colors[index % colors.length],
      gradientPart: `${colors[index % colors.length]} ${start}% ${currentPercentage}%`
    };
  }) : [];
  const conicGradient = totalCategories > 0 ? `conic-gradient(${pieData.map(d => d.gradientPart).join(', ')})` : '';

  const popularBlocks = [...blocks].sort((a, b) => (b.view_count || (b as any).viewCount || 0) - (a.view_count || (a as any).viewCount || 0)).slice(0, 5);
  const popularTotalViews = popularBlocks.reduce((sum, b) => sum + (b.view_count || (b as any).viewCount || 0), 0);
  let currentPopularPercentage = 0;
  const popularPieData = popularTotalViews > 0 ? popularBlocks.map((b, index) => {
    const viewCount = b.view_count || (b as any).viewCount || 0;
    const percentage = (viewCount / popularTotalViews) * 100;
    const start = currentPopularPercentage;
    currentPopularPercentage += percentage;
    return {
      ...b,
      viewCount,
      percentage,
      color: colors[index % colors.length],
      gradientPart: `${colors[index % colors.length]} ${start}% ${currentPopularPercentage}%`
    };
  }) : [];
  const popularConicGradient = popularTotalViews > 0 ? `conic-gradient(${popularPieData.map(d => d.gradientPart).join(', ')})` : '';

  return (
    <div className="p-8 space-y-8 max-w-[1280px] mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-primary-dark dark:text-primary-light">知识概览</h2>
        <p className="text-slate-500 dark:text-slate-400 font-serif italic text-sm">个人知识生态系统的实时指标</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl shadow-sm transition-transform hover:-translate-y-1 duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-primary/10 rounded-2xl text-primary"><Database size={24} strokeWidth={1.5} /></span>
          </div>
          <p className="text-slate-500 text-sm font-medium">总知识块</p>
          <h3 className="text-3xl font-serif font-bold mt-1 text-primary-dark dark:text-primary-light">{totalBlocks}</h3>
        </div>
        <div className="glass-panel p-6 rounded-3xl shadow-sm transition-transform hover:-translate-y-1 duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 bg-primary-dark/10 rounded-2xl text-primary-dark"><Eye size={24} strokeWidth={1.5} /></span>
          </div>
          <p className="text-slate-500 text-sm font-medium">总浏览量</p>
          <h3 className="text-3xl font-serif font-bold mt-1 text-primary-dark dark:text-primary-light">{totalViews.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl shadow-sm flex flex-col">
          <h4 className="text-xl font-serif font-bold text-primary-dark dark:text-primary-light mb-8">按类别分布</h4>
          <div className="flex-1 flex items-center justify-center gap-10 h-64">
            {totalCategories > 0 ? (
              <>
                <div 
                  className="w-48 h-48 rounded-full shadow-inner border-4 border-white/50 dark:border-surface-dark/50 flex-shrink-0" 
                  style={{ background: conicGradient }}
                ></div>
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-48 pr-2">
                  {pieData.map(d => (
                    <div key={d.cat} className="flex items-center gap-3 text-sm">
                      <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: d.color }}></span>
                      <span className="text-slate-600 dark:text-slate-300 truncate font-medium" title={d.cat}>{d.cat}</span>
                      <span className="text-primary-dark dark:text-primary-light font-serif font-bold text-sm ml-auto">{Math.round(d.percentage)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm italic font-serif">暂无数据</div>
            )}
          </div>
        </div>
        <div className="glass-panel p-8 rounded-3xl shadow-sm overflow-hidden">
          <h4 className="text-xl font-serif font-bold text-primary-dark dark:text-primary-light mb-8">知识增长趋势</h4>
          <div className="relative h-64 flex items-center justify-center">
            <svg className="w-full h-full text-primary-light overflow-visible" viewBox="0 0 400 200">
              <path d="M0,180 Q50,160 100,140 T200,80 T300,50 T400,20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
              <path d="M0,180 Q50,160 100,140 T200,80 T300,50 T400,20 L400,200 L0,200 Z" fill="url(#gradient)" opacity="0.2"></path>
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor"></stop>
                  <stop offset="100%" stopColor="transparent"></stop>
                </linearGradient>
              </defs>
              <circle cx="100" cy="140" fill="var(--color-surface-light)" r="5" stroke="currentColor" strokeWidth="2"></circle>
              <circle cx="200" cy="80" fill="var(--color-surface-light)" r="5" stroke="currentColor" strokeWidth="2"></circle>
              <circle cx="300" cy="50" fill="var(--color-surface-light)" r="5" stroke="currentColor" strokeWidth="2"></circle>
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-primary/10 flex justify-between items-center">
          <h4 className="text-xl font-serif font-bold text-primary-dark dark:text-primary-light">最热门知识块</h4>
        </div>
        <div className="p-8 flex items-center justify-center gap-10 h-80">
          {popularTotalViews > 0 ? (
            <>
              <div 
                className="w-56 h-56 rounded-full shadow-inner border-4 border-white/50 dark:border-surface-dark/50 flex-shrink-0" 
                style={{ background: popularConicGradient }}
              ></div>
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-64 pr-2">
                {popularPieData.map(d => (
                  <div key={d.id} className="flex items-center gap-3 text-sm">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: d.color }}></span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-slate-600 dark:text-slate-300 truncate font-medium" title={d.title}>{d.title}</span>
                      <span className="text-xs text-slate-400 truncate">{d.category}</span>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-primary-dark dark:text-primary-light font-serif font-bold text-sm">{Math.round(d.percentage)}%</span>
                      <span className="text-xs text-slate-400">{d.viewCount.toLocaleString()} 浏览</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-slate-400 text-sm italic font-serif">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const KnowledgeList = ({ blocks, onSelectBlock, selectedCategory, selectedSubcategory, searchQuery, onAddBlock, onDeleteBlock }: any) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredBlocks = blocks.filter((b: KnowledgeBlock) => {
    if (selectedCategory && b.category !== selectedCategory) return false;
    if (selectedSubcategory && b.subcategory !== selectedSubcategory) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase()) && !b.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectAll = () => {
    if (selectedIds.size === filteredBlocks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBlocks.map((b: KnowledgeBlock) => b.id)));
    }
  };

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    onDeleteBlock(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {selectedSubcategory || selectedCategory || '所有知识块'}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-medium text-slate-500">{filteredBlocks.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSelectAll} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary/50 transition-colors shadow-sm">
            <CheckSquare size={18} /> {selectedIds.size === filteredBlocks.length && filteredBlocks.length > 0 ? '取消全选' : '全选'}
          </button>
          {selectedIds.size > 0 && (
            <button onClick={handleDeleteSelected} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm">
              <Trash2 size={18} /> 删除 ({selectedIds.size})
            </button>
          )}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button onClick={onAddBlock} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 font-semibold">
            <Plus size={20} /> 添加新知识块
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBlocks.map((b: KnowledgeBlock) => (
            <div key={b.id} onClick={() => onSelectBlock(b)} className={`group bg-white dark:bg-slate-800/40 border p-5 rounded-xl hover:shadow-xl transition-all flex flex-col relative cursor-pointer ${selectedIds.has(b.id) ? 'border-primary ring-1 ring-primary shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-primary/5'}`}>
              <div className="absolute top-4 right-4 z-10" onClick={(e) => toggleSelect(e, b.id)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(b.id) ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-primary'}`}>
                  <CheckSquare size={14} />
                </div>
              </div>
              <div className="flex items-start justify-between mb-3 pr-8">
                <span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tight">{b.subcategory || b.category}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors">{b.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">{b.content.replace(/#/g, '').substring(0, 100)}...</p>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Eye size={16} />
                  <span className="text-xs font-medium">{(b.view_count || (b as any).viewCount || 0).toLocaleString()} 次浏览</span>
                </div>
                <span className="text-[10px] font-medium italic">{b.updated_at || (b as any).updatedAt}</span>
              </div>
            </div>
          ))}
          <div onClick={onAddBlock} className="group border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[220px] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all mb-4">
              <PlusCircle size={32} />
            </div>
            <p className="text-slate-500 font-medium group-hover:text-primary">创建新知识块</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const KnowledgeDetail = ({ block, onBack, onEdit, onDelete }: any) => {
  if (!block) return null;
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">知识块详情</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(block)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm">
              <Edit size={16} /> 编辑
            </button>
            <button onClick={() => onDelete(block.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-100 transition-all shadow-sm">
              <Trash2 size={16} /> 删除
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded">{block.category} / {block.subcategory}</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">{block.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-primary/5 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-primary/10 rounded-full text-primary"><Eye size={20} /></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">总浏览量</p>
              <p className="text-base font-bold">{(block.view_count || (block as any).viewCount || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-primary/10 rounded-full text-primary"><History size={20} /></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">最后更新</p>
              <p className="text-base font-bold">{block.updated_at || (block as any).updatedAt}</p>
            </div>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none mb-12 prose-img:rounded-xl prose-img:shadow-md">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{block.content}</Markdown>
        </div>

        {block.remarks && (
          <div className="mt-12 border-t border-primary/10 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="text-primary" size={24} />
              <h3 className="text-xl font-bold">内部备注</h3>
            </div>
            <div className="p-5 bg-primary/5 rounded-xl border-l-4 border-primary">
              <p className="text-sm text-slate-700 dark:text-slate-300">{block.remarks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PromptList = ({ prompts, onSelectPrompt, searchQuery, onAddPrompt }: any) => {
  const filteredPrompts = prompts.filter((p: Prompt) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">提示词资产</h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-medium text-slate-500">{filteredPrompts.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onAddPrompt} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 font-semibold">
            <Plus size={20} /> 添加新提示词
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrompts.map((p: Prompt) => (
            <div key={p.id} onClick={() => onSelectPrompt(p)} className="group bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col relative cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 rounded bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tight">{p.tags[0]}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">{p.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Eye size={16} />
                  <span className="text-xs font-medium">{(p.view_count || (p as any).viewCount || 0).toLocaleString()} 次浏览</span>
                </div>
              </div>
            </div>
          ))}
          <div onClick={onAddPrompt} className="group border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[220px] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all mb-4">
              <PlusCircle size={32} />
            </div>
            <p className="text-slate-500 font-medium group-hover:text-primary">创建新提示词</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryManage = ({ categories, setCategories }: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubcategories, setEditSubcategories] = useState<string>('');

  const handleAddCategory = () => {
    const newId = `c${Date.now()}`;
    setCategories([...categories, { id: newId, name: '新分类', subcategories: [] }]);
    setEditingId(newId);
    setEditName('新分类');
    setEditSubcategories('');
  };

  const handleSave = (id: string) => {
    const subs = editSubcategories.split(',').map(s => s.trim()).filter(s => s);
    setCategories(categories.map((c: Category) => c.id === id ? { ...c, name: editName, subcategories: subs } : c));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除此分类吗？')) {
      setCategories(categories.filter((c: Category) => c.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-serif font-bold text-primary-dark dark:text-primary-light">管理分类</h2>
          <button onClick={handleAddCategory} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 font-medium text-sm">
            <Plus size={18} strokeWidth={2} /> 添加新分类
          </button>
        </div>

        <div className="glass-panel rounded-3xl shadow-sm overflow-hidden">
          <div className="divide-y divide-primary/10">
            {categories.map((c: Category) => (
              <div key={c.id} className="p-8 hover:bg-primary/5 transition-colors">
                {editingId === c.id ? (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="block text-sm font-serif font-medium text-primary-dark dark:text-primary-light mb-2">分类名称</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border border-primary/20 bg-white/50 dark:bg-surface-dark/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 outline-none text-sm transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-serif font-medium text-primary-dark dark:text-primary-light mb-2">子分类 (用逗号分隔)</label>
                      <input 
                        type="text" 
                        value={editSubcategories} 
                        onChange={(e) => setEditSubcategories(e.target.value)}
                        className="w-full rounded-xl border border-primary/20 bg-white/50 dark:bg-surface-dark/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 outline-none text-sm transition-all shadow-inner"
                        placeholder="例如: React, Vue, Angular"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => handleSave(c.id)} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 transition-all">保存</button>
                      <button onClick={() => setEditingId(null)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">取消</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-primary-dark dark:text-primary-light mb-3">{c.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {c.subcategories.length > 0 ? c.subcategories.map(sub => (
                          <span key={sub} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{sub}</span>
                        )) : <span className="text-xs text-slate-400 italic">无子分类</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                          setEditSubcategories(c.subcategories.join(', '));
                        }} 
                        className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                      >
                        <Edit size={18} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-serif italic">
                暂无分类，点击右上角添加。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PromptDetail = ({ prompt, onBack, onEdit, onDelete }: any) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  if (!prompt) return null;

  const filledPrompt = ((prompt.original_prompt || (prompt as any).originalPrompt) || '').replace(/\[(.*?)\]/g, (match: string, p1: string) => {
    return formValues[p1] ? formValues[p1] : match;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(filledPrompt);
    alert('已复制到剪贴板！');
  };

  const renderOriginalPrompt = () => {
    const originalPrompt = prompt.original_prompt || (prompt as any).originalPrompt || '';
    const parts = originalPrompt.split(/(\[.*?\])/g);
    return parts.map((part: string, i: number) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={i} className="bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold mx-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark">
      <div className="max-w-[1280px] mx-auto w-full px-8 py-8 flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <nav className="flex items-center gap-2 text-primary/60 text-sm font-medium">
              <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft size={16}/> 返回库</button>
              <ChevronRight size={16} />
              <span className="text-slate-900 dark:text-slate-100 font-bold">{prompt.title}</span>
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(prompt)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm">
                <Edit size={16} /> 编辑
              </button>
              <button onClick={() => onDelete(prompt.id)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-100 transition-all shadow-sm">
                <Trash2 size={16} /> 删除
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">{prompt.title}</h1>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm mt-1">
              <span className="flex items-center gap-1.5"><Eye size={16} /> {(prompt.view_count || (prompt as any).viewCount || 0).toLocaleString()} 次浏览</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><History size={16} /> {prompt.updated_at || (prompt as any).updatedAt} 更新</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="text-primary" size={20} /> 原始提示词
                </h3>
                <button onClick={() => {navigator.clipboard.writeText(prompt.original_prompt || (prompt as any).originalPrompt); alert('已复制原文！');}} className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                  <Copy size={16} /> 复制原文
                </button>
              </div>
              <div className="bg-background-light dark:bg-slate-800/50 rounded-lg p-6 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 border border-primary/10">
                {renderOriginalPrompt()}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                  <Edit size={20} /> 个性化填充
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prompt.fields.map((f: any) => (
                  <div key={f.name} className={`flex flex-col gap-2 ${f.type === 'text' && prompt.fields.length % 2 !== 0 && f === prompt.fields[prompt.fields.length - 1] ? 'md:col-span-2' : ''}`}>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{f.name}</label>
                    {f.type === 'select' ? (
                      <select 
                        value={formValues[f.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [f.name]: e.target.value})}
                        className="w-full rounded-lg border border-primary/10 bg-background-light dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 outline-none"
                      >
                        <option value="">{f.placeholder}</option>
                        {f.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input 
                        type="text"
                        value={formValues[f.name] || ''}
                        onChange={(e) => setFormValues({...formValues, [f.name]: e.target.value})}
                        className="w-full rounded-lg border border-primary/10 bg-background-light dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 outline-none" 
                        placeholder={f.placeholder} 
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleCopy} className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl hover:shadow-primary/20 transition-all">
                  <Copy size={20} /> 复制填充后的提示词
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-primary/5 dark:bg-primary/20 rounded-xl p-6 border border-primary/10">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
                <Lightbulb size={20} /> 使用技巧
              </h4>
              <ul className="flex flex-col gap-4">
                <li className="flex gap-3">
                  <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">与 GPT-4 或 Claude 3 Opus 搭配使用效果最佳。</p>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">在主题字段中添加 3-5 个特定关键词，以获得更好的 SEO 定向。</p>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-primary/5">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Tags size={20} className="text-primary" /> 标签
              </h4>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-background-light dark:bg-slate-800 rounded-full text-xs font-bold text-primary">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { KnowledgeBlock, Prompt, Category, PromptField } from './data';
import { X, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

export const KnowledgeForm = ({
  block,
  categories,
  onSave,
  onCancel,
}: {
  block?: KnowledgeBlock | null,
  categories: Category[],
  onSave: (block: Partial<KnowledgeBlock>) => void,
  onCancel: () => void,
}) => {
  const [title, setTitle] = useState(block?.title || '');
  const [content, setContent] = useState(block?.content || '');
  const [remarks, setRemarks] = useState(block?.remarks || '');
  const [category, setCategory] = useState(block?.category || categories[0]?.name || '');
  
  const selectedCat = categories.find(c => c.name === category);
  const [subcategory, setSubcategory] = useState(block?.subcategory || selectedCat?.subcategories[0] || '');

  useEffect(() => {
    if (selectedCat && !selectedCat.subcategories.includes(subcategory)) {
      setSubcategory(selectedCat.subcategories[0] || '');
    }
  }, [category, selectedCat, subcategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: block?.id,
      title,
      content,
      remarks,
      category,
      subcategory,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto w-full px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">{block ? '编辑知识块' : '新建知识块'}</h1>
          </div>
          <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
            <Save size={18} /> 保存
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/5 p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">标题</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 outline-none text-lg font-medium"
              placeholder="输入知识块标题..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">主类别</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 outline-none"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">子类别</label>
              <select 
                value={subcategory} 
                onChange={e => setSubcategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 outline-none"
              >
                {selectedCat?.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">内容 (支持 Markdown)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none min-h-[300px] font-mono text-sm leading-relaxed"
              placeholder="在此输入内容，支持 Markdown 语法，可以热链接图片..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">备注 (可选)</label>
            <textarea 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none min-h-[100px] text-sm"
              placeholder="添加一些内部备注..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const PromptForm = ({ 
  prompt, 
  onSave, 
  onCancel 
}: { 
  prompt?: Prompt | null, 
  onSave: (prompt: Partial<Prompt>) => void, 
  onCancel: () => void 
}) => {
  const [title, setTitle] = useState(prompt?.title || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [originalPrompt, setOriginalPrompt] = useState(prompt?.original_prompt || (prompt as any)?.originalPrompt || '');
  const [tags, setTags] = useState(prompt?.tags.join(', ') || '');
  const [fields, setFields] = useState<PromptField[]>(prompt?.fields || []);

  const addField = () => {
    setFields([...fields, { name: '', placeholder: '', type: 'text' }]);
  };

  const updateField = (index: number, key: keyof PromptField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: prompt?.id,
      title,
      description,
      original_prompt: originalPrompt,
      fields: fields.filter(f => f.name.trim() !== ''),
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto w-full px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">{prompt ? '编辑提示词' : '新建提示词'}</h1>
          </div>
          <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
            <Save size={18} /> 保存
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-primary/5 p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">标题</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 outline-none text-lg font-medium"
              placeholder="输入提示词标题..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">描述</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none min-h-[80px] text-sm"
              placeholder="简短描述这个提示词的用途..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">标签 (用逗号分隔)</label>
            <input 
              type="text" 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary h-11 px-4 outline-none"
              placeholder="例如: SEO, 写作, 编程..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">原始提示词</label>
            <div className="text-xs text-slate-500 mb-2">使用方括号表示需要填充的变量，例如：请帮我写一篇关于 [主题] 的文章。</div>
            <textarea 
              value={originalPrompt} 
              onChange={e => setOriginalPrompt(e.target.value)} 
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary p-4 outline-none min-h-[200px] font-mono text-sm leading-relaxed"
              placeholder="在此输入原始提示词模板..."
              required
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">变量字段配置</label>
              <button onClick={addField} type="button" className="flex items-center gap-1 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> 添加字段
              </button>
            </div>
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">变量名 (对应方括号内的词)</label>
                      <input 
                        type="text" 
                        value={field.name} 
                        onChange={e => updateField(index, 'name', e.target.value)} 
                        className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-9 px-3 outline-none text-sm"
                        placeholder="例如: 主题"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">占位符提示</label>
                      <input 
                        type="text" 
                        value={field.placeholder} 
                        onChange={e => updateField(index, 'placeholder', e.target.value)} 
                        className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-9 px-3 outline-none text-sm"
                        placeholder="例如: 输入文章主题"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">输入类型</label>
                      <select 
                        value={field.type} 
                        onChange={e => updateField(index, 'type', e.target.value)}
                        className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-9 px-3 outline-none text-sm"
                      >
                        <option value="text">文本输入</option>
                        <option value="select">下拉选择</option>
                      </select>
                    </div>
                    {field.type === 'select' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">选项 (用逗号分隔)</label>
                        <input 
                          type="text" 
                          value={field.options?.join(', ') || ''} 
                          onChange={e => updateField(index, 'options', e.target.value.split(',').map(s => s.trim()))} 
                          className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary h-9 px-3 outline-none text-sm"
                          placeholder="选项1, 选项2, 选项3"
                        />
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeField(index)} type="button" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-5">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                  暂无变量字段，点击上方按钮添加
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

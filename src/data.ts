export type Category = {
  id: string;
  name: string;
  subcategories: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KnowledgeBlock = {
  id: string;
  title: string;
  content: string;
  remarks: string;
  category: string;
  subcategory: string;
  view_count: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PromptField = {
  name: string;
  placeholder: string;
  type: 'text' | 'select';
  options?: string[];
};

export type Prompt = {
  id: string;
  title: string;
  description: string;
  original_prompt: string;
  fields: PromptField[];
  tags: string[];
  view_count: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

// Helper to convert snake_case to camelCase for UI compatibility
export const adaptKnowledgeBlock = (block: KnowledgeBlock): KnowledgeBlock & { viewCount: number; updatedAt: string } => ({
  ...block,
  viewCount: block.view_count,
  updatedAt: block.updated_at || '刚刚',
});

export const adaptPrompt = (prompt: Prompt): Prompt & { originalPrompt: string; viewCount: number; updatedAt: string } => ({
  ...prompt,
  originalPrompt: prompt.original_prompt,
  viewCount: prompt.view_count,
  updatedAt: prompt.updated_at || '刚刚',
});

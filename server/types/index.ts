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
  is_private: boolean;
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

export type User = {
  id: string;
  email: string;
  name: string;
  created_at?: string;
};

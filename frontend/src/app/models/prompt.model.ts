export interface Tag {
  id: number;
  name: string;
  createdAt?: string;
}

export interface QuickTag {
  id: number;
  category: string;
  name: string;
  createdAt?: string;
}

export interface Prompt {
  id: number;
  title: string;
  content: string;
  description?: string;
  category?: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  tags: Tag[];
}

export interface PromptFormData {
  title: string;
  content: string;
  description?: string;
  category?: string;
  tags: string[];
}

export interface GenerateRequest {
  requirement: string;
  styles?: string[];
  scenes?: string[];
  functions?: string[];
}

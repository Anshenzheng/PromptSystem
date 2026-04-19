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

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface PromptChain {
  id: number;
  title: string;
  description?: string;
  category?: string;
  usageCount: number;
  parentInfo?: PromptChain;
  childInfo?: PromptChain;
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
  parentInfo?: Prompt;
  childInfo?: Prompt;
  fullChain?: PromptChain;
}

export interface PromptFormData {
  title: string;
  content: string;
  description?: string;
  category?: string;
  tags: string[];
  parentId?: number | null;
}

export interface GenerateRequest {
  requirement: string;
  styles?: string[];
  scenes?: string[];
  functions?: string[];
}

export interface GeneratedPrompt {
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
}

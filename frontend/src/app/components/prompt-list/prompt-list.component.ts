import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Prompt, Tag } from '../../models/prompt.model';
import { PromptService } from '../../services/prompt.service';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-prompt-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="list-container">
      <div class="list-header">
        <h2>提示词列表</h2>
        <a routerLink="/prompts/new" class="btn btn-primary">
          <span>+</span> 新建
        </a>
      </div>
      
      <div class="search-bar">
        <input 
          type="text" 
          [ngModel]="searchKeyword" 
          (ngModelChange)="onSearchChange($event)"
          placeholder="搜索标题、内容、标签..."
          class="search-input"
        >
      </div>
      
      <div class="filter-section">
        <div class="filter-group">
          <label class="filter-label">分类筛选</label>
          <select 
            [ngModel]="selectedCategory" 
            (ngModelChange)="applyFilters()"
            class="filter-select"
          >
            <option value="">全部分类</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">标签筛选</label>
          <select 
            [ngModel]="selectedTagId" 
            (ngModelChange)="applyFilters()"
            class="filter-select"
          >
            <option [ngValue]="null">全部标签</option>
            @for (tag of tags(); track tag.id) {
              <option [ngValue]="tag.id">{{ tag.name }}</option>
            }
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">排序方式</label>
          <select 
            [ngModel]="sortBy" 
            (ngModelChange)="applySort()"
            class="filter-select"
          >
            <option value="default">默认</option>
            <option value="usage">使用频率</option>
            <option value="recent">最近使用</option>
          </select>
        </div>
      </div>
      
      <div class="prompt-grid">
        @if (prompts().length === 0) {
          <div class="empty-state">
            <p>暂无提示词</p>
            <a routerLink="/prompts/new" class="btn btn-outline">创建第一个提示词</a>
          </div>
        }
        
        @for (prompt of prompts(); track prompt.id) {
          <div class="prompt-card">
            <div class="card-header">
              <h3 class="card-title">{{ prompt.title }}</h3>
              <div class="card-actions">
                <button 
                  (click)="copyContent(prompt)" 
                  class="icon-btn" 
                  title="复制内容"
                >
                  📋
                </button>
                <a 
                  [routerLink]="['/prompts', prompt.id, 'edit']" 
                  class="icon-btn" 
                  title="编辑"
                >
                  ✏️
                </a>
                <button 
                  (click)="confirmDelete(prompt)" 
                  class="icon-btn icon-btn-danger" 
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            @if (prompt.description) {
              <p class="card-description">{{ prompt.description }}</p>
            }
            
            <div class="card-content-preview">
              <code>{{ truncateContent(prompt.content) }}</code>
            </div>
            
            <div class="card-footer">
              <div class="card-tags">
                @for (tag of prompt.tags; track tag.id) {
                  <span class="tag">{{ tag.name }}</span>
                }
                @if (prompt.category) {
                  <span class="tag category-tag">{{ prompt.category }}</span>
                }
              </div>
              <div class="card-stats">
                <span class="stat">使用: {{ prompt.usageCount }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .list-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: var(--accent-color);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: var(--accent-hover);
    }
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    
    .btn-outline:hover {
      background-color: var(--bg-hover);
    }
    
    .search-bar {
      display: flex;
    }
    
    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    
    .filter-section {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 1rem;
      background-color: var(--bg-secondary);
      border-radius: 12px;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .filter-select {
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      background-size: 16px;
    }
    
    .prompt-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.25rem;
    }
    
    .prompt-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .prompt-card:hover {
      border-color: var(--accent-color);
      box-shadow: 0 4px 12px var(--shadow-color);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .card-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      flex: 1;
    }
    
    .card-actions {
      display: flex;
      gap: 0.25rem;
    }
    
    .icon-btn {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 6px;
      transition: background-color 0.2s;
      opacity: 0.7;
    }
    
    .icon-btn:hover {
      background-color: var(--bg-hover);
      opacity: 1;
    }
    
    .icon-btn-danger:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
    
    .card-description {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    .card-content-preview {
      padding: 0.75rem;
      background-color: var(--bg-primary);
      border-radius: 8px;
      font-size: 0.85rem;
      line-height: 1.5;
      max-height: 100px;
      overflow: hidden;
    }
    
    .card-content-preview code {
      color: var(--text-primary);
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      gap: 1rem;
    }
    
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }
    
    .tag {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      background-color: var(--bg-primary);
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    
    .category-tag {
      background-color: var(--accent-color);
      color: white;
    }
    
    .card-stats {
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: nowrap;
    }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
    
    .empty-state p {
      margin-bottom: 1rem;
    }
  `]
})
export class PromptListComponent implements OnInit {
  prompts = signal<Prompt[]>([]);
  tags = signal<Tag[]>([]);
  categories = signal<string[]>([]);
  
  searchKeyword = '';
  selectedCategory = '';
  selectedTagId: number | null = null;
  sortBy = 'default';
  
  private allPrompts: Prompt[] = [];
  private searchTimeout: any;
  
  constructor(
    private promptService: PromptService,
    private tagService: TagService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.promptService.getAllPrompts().subscribe({
      next: (prompts) => {
        this.allPrompts = prompts;
        this.prompts.set([...prompts]);
      },
      error: (err) => console.error('Failed to load prompts:', err)
    });
    
    this.tagService.getAllTags().subscribe({
      next: (tags) => this.tags.set(tags),
      error: (err) => console.error('Failed to load tags:', err)
    });
    
    this.promptService.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories:', err)
    });
  }
  
  onSearchChange(value: string): void {
    this.searchKeyword = value;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 300);
  }
  
  applyFilters(): void {
    let filtered = [...this.allPrompts];
    
    if (this.searchKeyword) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(keyword) ||
        p.content.toLowerCase().includes(keyword) ||
        (p.description && p.description.toLowerCase().includes(keyword)) ||
        p.tags.some(t => t.name.toLowerCase().includes(keyword))
      );
    }
    
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    if (this.selectedTagId !== null) {
      filtered = filtered.filter(p => p.tags.some(t => t.id === this.selectedTagId));
    }
    
    this.prompts.set(filtered);
    this.applySort();
  }
  
  applySort(): void {
    const sorted = [...this.prompts()];
    
    switch (this.sortBy) {
      case 'usage':
        sorted.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        sorted.sort((a, b) => {
          if (!a.lastUsedAt) return 1;
          if (!b.lastUsedAt) return -1;
          return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
        });
        break;
      default:
        break;
    }
    
    this.prompts.set(sorted);
  }
  
  truncateContent(content: string): string {
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }
  
  copyContent(prompt: Prompt): void {
    navigator.clipboard.writeText(prompt.content).then(() => {
      this.promptService.incrementUsage(prompt.id).subscribe({
        next: () => {
          const index = this.allPrompts.findIndex(p => p.id === prompt.id);
          if (index !== -1) {
            this.allPrompts[index].usageCount++;
            this.allPrompts[index].lastUsedAt = new Date().toISOString();
          }
        },
        error: (err) => console.error('Failed to increment usage:', err)
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
  
  confirmDelete(prompt: Prompt): void {
    if (confirm(`确定要删除提示词 "${prompt.title}" 吗？`)) {
      this.promptService.deletePrompt(prompt.id).subscribe({
        next: () => {
          this.allPrompts = this.allPrompts.filter(p => p.id !== prompt.id);
          this.applyFilters();
        },
        error: (err) => console.error('Failed to delete:', err)
      });
    }
  }
}

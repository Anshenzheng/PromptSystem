import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Prompt, Tag } from '../../models/prompt.model';
import { PromptService } from '../../services/prompt.service';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-prompt-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <a routerLink="/prompts" class="back-link">← 返回列表</a>
        <h2>{{ isEdit ? '编辑提示词' : '新建提示词' }}</h2>
      </div>
      
      <form (ngSubmit)="onSubmit()" class="prompt-form">
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">标题 *</label>
            <input 
              type="text" 
              [(ngModel)]="formData.title" 
              name="title"
              required
              placeholder="输入提示词标题"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">分类</label>
            <div class="category-input">
              <input 
                type="text" 
                [(ngModel)]="formData.category" 
                name="category"
                placeholder="输入或选择分类"
                class="form-input"
              >
              <div class="existing-categories">
                @for (cat of existingCategories(); track cat) {
                  <button 
                    type="button" 
                    (click)="selectCategory(cat)"
                    class="category-btn"
                    [class.selected]="formData.category === cat"
                  >
                    {{ cat }}
                  </button>
                }
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea 
              [(ngModel)]="formData.description" 
              name="description"
              placeholder="简要描述这个提示词的用途"
              class="form-textarea"
              rows="2"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">内容 *</label>
            <textarea 
              [(ngModel)]="formData.content" 
              name="content"
              required
              placeholder="输入提示词内容"
              class="form-textarea"
              rows="10"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">标签</label>
            <div class="tags-input">
              <div class="selected-tags">
                @for (tag of formData.tags; track tag) {
                  <span class="tag">
                    {{ tag }}
                    <button 
                      type="button" 
                      (click)="removeTag(tag)"
                      class="tag-remove"
                    >×</button>
                  </span>
                }
              </div>
              <input 
                type="text" 
                [(ngModel)]="newTag" 
                name="newTag"
                (keyup.enter)="addTag()"
                placeholder="输入标签后按回车添加"
                class="form-input tag-input-field"
              >
            </div>
            <div class="existing-tags">
              @for (tag of existingTags(); track tag.id) {
                <button 
                  type="button" 
                  (click)="toggleTag(tag.name)"
                  class="tag-btn"
                  [class.selected]="formData.tags.includes(tag.name)"
                >
                  {{ tag.name }}
                </button>
              }
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="!isValid() || submitting()"
          >
            {{ submitting() ? '保存中...' : (isEdit ? '保存修改' : '创建提示词') }}
          </button>
          <a routerLink="/prompts" class="btn btn-outline">取消</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    
    .form-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .back-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    
    .back-link:hover {
      color: var(--text-primary);
    }
    
    .prompt-form {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-label {
      font-size: 0.95rem;
      font-weight: 500;
    }
    
    .form-input {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    
    .form-textarea {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-textarea:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    
    .category-input {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .existing-categories, .existing-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .category-btn, .tag-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: var(--bg-primary);
      color: var(--text-secondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .category-btn:hover, .tag-btn:hover {
      border-color: var(--accent-color);
    }
    
    .category-btn.selected, .tag-btn.selected {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
    
    .tags-input {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.625rem;
      background-color: var(--accent-color);
      color: white;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    
    .tag-remove {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      font-size: 1rem;
      line-height: 1;
      opacity: 0.8;
    }
    
    .tag-remove:hover {
      opacity: 1;
    }
    
    .tag-input-field {
      flex: 1;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1.5rem;
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: var(--accent-color);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
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
  `]
})
export class PromptFormComponent implements OnInit {
  isEdit = false;
  promptId: number | null = null;
  existingCategories = signal<string[]>([]);
  existingTags = signal<Tag[]>([]);
  submitting = signal<boolean>(false);
  newTag = '';
  
  formData = {
    title: '',
    content: '',
    description: '',
    category: '',
    tags: [] as string[]
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promptService: PromptService,
    private tagService: TagService
  ) {}
  
  ngOnInit(): void {
    this.loadExistingData();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.promptId = parseInt(id, 10);
      this.loadPrompt(this.promptId);
    }
  }
  
  loadExistingData(): void {
    this.promptService.getAllCategories().subscribe({
      next: (cats) => this.existingCategories.set(cats),
      error: (err) => console.error('Failed to load categories:', err)
    });
    
    this.tagService.getAllTags().subscribe({
      next: (tags) => this.existingTags.set(tags),
      error: (err) => console.error('Failed to load tags:', err)
    });
  }
  
  loadPrompt(id: number): void {
    this.promptService.getPromptById(id).subscribe({
      next: (prompt) => {
        this.formData = {
          title: prompt.title,
          content: prompt.content,
          description: prompt.description || '',
          category: prompt.category || '',
          tags: prompt.tags.map(t => t.name)
        };
      },
      error: (err) => {
        console.error('Failed to load prompt:', err);
        this.router.navigate(['/prompts']);
      }
    });
  }
  
  isValid(): boolean {
    return this.formData.title.trim() !== '' && this.formData.content.trim() !== '';
  }
  
  selectCategory(category: string): void {
    this.formData.category = this.formData.category === category ? '' : category;
  }
  
  addTag(): void {
    const tag = this.newTag.trim();
    if (tag && !this.formData.tags.includes(tag)) {
      this.formData.tags.push(tag);
      this.newTag = '';
    }
  }
  
  removeTag(tag: string): void {
    const index = this.formData.tags.indexOf(tag);
    if (index !== -1) {
      this.formData.tags.splice(index, 1);
    }
  }
  
  toggleTag(tag: string): void {
    const index = this.formData.tags.indexOf(tag);
    if (index !== -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tag);
    }
  }
  
  onSubmit(): void {
    if (!this.isValid()) return;
    
    this.submitting.set(true);
    
    const data = {
      title: this.formData.title.trim(),
      content: this.formData.content.trim(),
      description: this.formData.description?.trim() || undefined,
      category: this.formData.category?.trim() || undefined,
      tags: this.formData.tags
    };
    
    const request = this.isEdit 
      ? this.promptService.updatePrompt(this.promptId!, data)
      : this.promptService.createPrompt(data);
    
    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/prompts']);
      },
      error: (err) => {
        console.error('Failed to save:', err);
        this.submitting.set(false);
        alert('保存失败，请重试');
      }
    });
  }
}

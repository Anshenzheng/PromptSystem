import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QuickTag, GenerateRequest, GeneratedPrompt, Prompt } from '../../models/prompt.model';
import { GenerateService } from '../../services/generate.service';
import { TagService } from '../../services/tag.service';
import { PromptService } from '../../services/prompt.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-generate-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="generate-container">
      <div class="generate-header">
        <h2>智能生成提示词</h2>
        <p class="subtitle">描述你的需求，AI 将帮你生成专业的提示词</p>
      </div>
      
      @if (!authService.isLoggedIn()) {
        <div class="login-required">
          <div class="login-icon">🔒</div>
          <h3>需要登录才能使用生成功能</h3>
          <p>请先登录后再使用智能生成提示词功能</p>
          <div class="login-buttons">
            <a routerLink="/login" class="btn btn-primary">立即登录</a>
            <a routerLink="/register" class="btn btn-outline">还没账号？注册</a>
          </div>
        </div>
      } @else {
        <div class="generate-content">
          <div class="input-section">
            <div class="form-group">
              <label class="form-label">需求描述 *</label>
              <textarea 
                [(ngModel)]="requirement" 
                placeholder="描述你想要的提示词用途，例如：我需要一个帮助我学习编程语言的提示词..."
                class="form-textarea"
                rows="4"
              ></textarea>
            </div>
            
            <div class="quick-tags-section">
              <h3 class="section-title">快速选择（可选）</h3>
              
              @if (styleTags().length > 0) {
                <div class="quick-tag-group">
                  <label class="group-label">🎨 风格</label>
                  <div class="tag-options">
                    @for (tag of styleTags(); track tag.id) {
                      <button 
                        type="button"
                        (click)="toggleTag('style', tag.name)"
                        class="tag-option"
                        [class.selected]="selectedStyles().includes(tag.name)"
                      >
                        {{ tag.name }}
                      </button>
                    }
                  </div>
                </div>
              }
              
              @if (sceneTags().length > 0) {
                <div class="quick-tag-group">
                  <label class="group-label">📍 场景</label>
                  <div class="tag-options">
                    @for (tag of sceneTags(); track tag.id) {
                      <button 
                        type="button"
                        (click)="toggleTag('scene', tag.name)"
                        class="tag-option"
                        [class.selected]="selectedScenes().includes(tag.name)"
                      >
                        {{ tag.name }}
                      </button>
                    }
                  </div>
                </div>
              }
              
              @if (functionTags().length > 0) {
                <div class="quick-tag-group">
                  <label class="group-label">⚡ 功能</label>
                  <div class="tag-options">
                    @for (tag of functionTags(); track tag.id) {
                      <button 
                        type="button"
                        (click)="toggleTag('function', tag.name)"
                        class="tag-option"
                        [class.selected]="selectedFunctions().includes(tag.name)"
                      >
                        {{ tag.name }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
            
            <button 
              (click)="generatePrompt()" 
              class="btn btn-primary btn-generate"
              [disabled]="!requirement.trim() || generating()"
            >
              {{ generating() ? '✨ 生成中...' : '✨ 生成提示词' }}
            </button>
          </div>
          
          <div class="output-section">
            @if (error()) {
              <div class="error-message">
                {{ error() }}
              </div>
            }
            
            @if (generatedResult()) {
              <div class="result-container">
                <div class="result-header">
                  <h3 class="result-title">生成结果</h3>
                  <div class="result-actions">
                    <button (click)="copyResult()" class="btn btn-outline btn-sm">
                      📋 复制
                    </button>
                    <button (click)="savePrompt()" class="btn btn-primary btn-sm" [disabled]="saving()">
                      {{ saving() ? '保存中...' : '💾 保存' }}
                    </button>
                  </div>
                </div>
                
                <div class="generated-meta">
                  <div class="meta-item">
                    <span class="meta-label">标题</span>
                    <input 
                      type="text" 
                      [(ngModel)]="editTitle"
                      class="meta-input"
                    >
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">分类</span>
                    <select [(ngModel)]="editCategory" class="meta-select">
                      <option value="">无分类</option>
                      @for (cat of existingCategories(); track cat) {
                        <option [value]="cat">{{ cat }}</option>
                      }
                    </select>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">级联父级</span>
                    <select [(ngModel)]="editParentId" class="meta-select">
                      <option [ngValue]="null">无极联</option>
                      @for (parent of availableParents(); track parent.id) {
                        <option [ngValue]="parent.id">{{ parent.title }}</option>
                      }
                    </select>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">可见性</span>
                    <select [(ngModel)]="editIsPublic" class="meta-select">
                      <option [ngValue]="true">公开</option>
                      <option [ngValue]="false">私有</option>
                    </select>
                  </div>
                </div>
                
                <div class="meta-item full-width">
                  <span class="meta-label">描述</span>
                  <textarea 
                    [(ngModel)]="editDescription"
                    class="meta-textarea"
                    rows="2"
                  ></textarea>
                </div>
                
                <div class="meta-item full-width">
                  <span class="meta-label">标签</span>
                  <div class="tags-editor">
                    <div class="selected-tags">
                      @for (tag of editTags(); track tag) {
                        <span class="tag">
                          {{ tag }}
                          <button 
                            type="button" 
                            (click)="removeEditTag(tag)"
                            class="tag-remove"
                          >×</button>
                        </span>
                      }
                    </div>
                    <input 
                      type="text" 
                      [(ngModel)]="newTagInput"
                      (keydown.enter)="addEditTag(); $event.preventDefault()"
                      placeholder="输入标签后按回车添加"
                      class="tag-input"
                    >
                  </div>
                </div>
                
                <div class="content-section">
                  <h4 class="section-title">📝 提示词内容</h4>
                  <div class="result-content">
                    <textarea 
                      [(ngModel)]="editContent"
                      class="content-editor"
                      rows="12"
                    ></textarea>
                  </div>
                </div>
              </div>
            } @else {
              <div class="empty-state">
                <div class="empty-icon">✨</div>
                <p>输入需求后点击生成按钮</p>
                <p class="hint">AI 将生成标题、分类、描述和内容</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .generate-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .generate-header {
      text-align: center;
      padding: 1rem;
    }
    
    .generate-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 600;
    }
    
    .subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 1rem;
    }
    
    .login-required {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 3rem;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      gap: 1rem;
    }
    
    .login-icon {
      font-size: 4rem;
    }
    
    .login-required h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .login-required p {
      margin: 0;
      color: var(--text-secondary);
    }
    
    .login-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .generate-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    @media (max-width: 900px) {
      .generate-content {
        grid-template-columns: 1fr;
      }
    }
    
    .input-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
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
    
    .form-textarea {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
      resize: vertical;
      min-height: 120px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-textarea:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    
    .quick-tags-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .section-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .quick-tag-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .group-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .tag-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tag-option {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .tag-option:hover {
      border-color: var(--accent-color);
    }
    
    .tag-option.selected {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
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
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    
    .btn-generate {
      width: 100%;
      font-size: 1rem;
      padding: 1rem;
    }
    
    .output-section {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }
    
    .error-message {
      padding: 1rem;
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error-color);
      border-radius: 8px;
      color: var(--error-color);
      margin-bottom: 1rem;
    }
    
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      color: var(--text-secondary);
      padding: 2rem;
    }
    
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .empty-state p {
      margin: 0.25rem 0;
    }
    
    .hint {
      font-size: 0.85rem;
      opacity: 0.7;
    }
    
    .result-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
      overflow-y: auto;
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .result-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .result-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .generated-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    @media (max-width: 600px) {
      .generated-meta {
        grid-template-columns: 1fr;
      }
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .meta-item.full-width {
      grid-column: 1 / -1;
    }
    
    .meta-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .meta-input, .meta-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    
    .meta-input:focus, .meta-select:focus {
      outline: none;
      border-color: var(--accent-color);
    }
    
    .meta-textarea {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
      min-height: 60px;
    }
    
    .meta-textarea:focus {
      outline: none;
      border-color: var(--accent-color);
    }
    
    .tags-editor {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      background-color: var(--accent-color);
      color: white;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .tag-remove {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0;
      font-size: 0.9rem;
      line-height: 1;
      opacity: 0.8;
    }
    
    .tag-remove:hover {
      opacity: 1;
    }
    
    .tag-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.85rem;
    }
    
    .tag-input:focus {
      outline: none;
      border-color: var(--accent-color);
    }
    
    .content-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .content-editor {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: 'Consolas', 'Monaco', monospace;
      resize: vertical;
      min-height: 200px;
      line-height: 1.7;
    }
    
    .content-editor:focus {
      outline: none;
      border-color: var(--accent-color);
    }
    
    .result-content {
      background-color: var(--bg-primary);
      border-radius: 8px;
    }
  `]
})
export class GeneratePromptComponent implements OnInit {
  requirement = '';
  quickTags = signal<{ [key: string]: QuickTag[] }>({});
  availableParents = signal<Prompt[]>([]);
  existingCategories = signal<string[]>([]);
  
  selectedStyles = signal<string[]>([]);
  selectedScenes = signal<string[]>([]);
  selectedFunctions = signal<string[]>([]);
  
  generating = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string>('');
  generatedResult = signal<GeneratedPrompt | null>(null);
  
  editTitle = '';
  editContent = '';
  editDescription = '';
  editCategory = '';
  editParentId: number | null = null;
  editIsPublic: boolean = true;
  editTags = signal<string[]>([]);
  newTagInput = '';
  
  styleTags = computed(() => this.quickTags()['style'] || []);
  sceneTags = computed(() => this.quickTags()['scene'] || []);
  functionTags = computed(() => this.quickTags()['function'] || []);
  
  constructor(
    private generateService: GenerateService,
    private tagService: TagService,
    private promptService: PromptService,
    private router: Router,
    public authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadQuickTags();
    this.loadAvailableParents();
    this.loadCategories();
  }
  
  loadQuickTags(): void {
    this.tagService.getQuickTagsGrouped().subscribe({
      next: (tags) => this.quickTags.set(tags),
      error: (err) => console.error('Failed to load quick tags:', err)
    });
  }
  
  loadAvailableParents(): void {
    this.promptService.getAvailableParents().subscribe({
      next: (parents) => this.availableParents.set(parents),
      error: (err) => console.error('Failed to load parents:', err)
    });
  }
  
  loadCategories(): void {
    this.promptService.getAllCategories().subscribe({
      next: (cats) => this.existingCategories.set(cats),
      error: (err) => console.error('Failed to load categories:', err)
    });
  }
  
  toggleTag(category: string, name: string): void {
    if (category === 'style') {
      const styles = [...this.selectedStyles()];
      const index = styles.indexOf(name);
      if (index !== -1) {
        styles.splice(index, 1);
      } else {
        styles.push(name);
      }
      this.selectedStyles.set(styles);
    } else if (category === 'scene') {
      const scenes = [...this.selectedScenes()];
      const index = scenes.indexOf(name);
      if (index !== -1) {
        scenes.splice(index, 1);
      } else {
        scenes.push(name);
      }
      this.selectedScenes.set(scenes);
    } else if (category === 'function') {
      const functions = [...this.selectedFunctions()];
      const index = functions.indexOf(name);
      if (index !== -1) {
        functions.splice(index, 1);
      } else {
        functions.push(name);
      }
      this.selectedFunctions.set(functions);
    }
  }
  
  generatePrompt(): void {
    if (!this.requirement.trim()) return;
    
    this.generating.set(true);
    this.error.set('');
    this.generatedResult.set(null);
    
    const request: GenerateRequest = {
      requirement: this.requirement.trim()
    };
    
    if (this.selectedStyles().length > 0) {
      request.styles = [...this.selectedStyles()];
    }
    if (this.selectedScenes().length > 0) {
      request.scenes = [...this.selectedScenes()];
    }
    if (this.selectedFunctions().length > 0) {
      request.functions = [...this.selectedFunctions()];
    }
    
    this.generateService.generatePrompt(request).subscribe({
      next: (response) => {
        if (response.error) {
          this.error.set(response.error);
        } else if (response.title || response.content) {
          this.generatedResult.set({
            title: response.title || '',
            content: response.content || '',
            description: response.description || '',
            category: response.category || '',
            tags: response.tags || []
          });
          
          this.editTitle = response.title || '';
          this.editContent = response.content || '';
          this.editDescription = response.description || '';
          this.editCategory = response.category || '';
          this.editTags.set(response.tags || []);
        }
        this.generating.set(false);
      },
      error: (err) => {
        this.error.set('生成失败，请检查 API 配置或网络连接');
        this.generating.set(false);
        console.error('Generate error:', err);
      }
    });
  }
  
  copyResult(): void {
    const content = this.editContent;
    if (content) {
      navigator.clipboard.writeText(content).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }
  
  addEditTag(): void {
    const tag = this.newTagInput.trim();
    if (tag && !this.editTags().includes(tag)) {
      this.editTags.set([...this.editTags(), tag]);
      this.newTagInput = '';
    }
  }
  
  removeEditTag(tag: string): void {
    const tags = [...this.editTags()];
    const index = tags.indexOf(tag);
    if (index !== -1) {
      tags.splice(index, 1);
      this.editTags.set(tags);
    }
  }
  
  savePrompt(): void {
    if (!this.editTitle.trim() || !this.editContent.trim()) {
      this.error.set('标题和内容不能为空');
      return;
    }
    
    this.saving.set(true);
    this.error.set('');
    
    const data = {
      title: this.editTitle.trim(),
      content: this.editContent.trim(),
      description: this.editDescription?.trim() || undefined,
      category: this.editCategory?.trim() || undefined,
      tags: [...this.editTags()],
      parentId: this.editParentId,
      isPublic: this.editIsPublic
    };
    
    this.promptService.createPrompt(data).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/prompts']);
      },
      error: (err) => {
        this.saving.set(false);
        if (err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('保存失败，请重试');
        }
        console.error('Save error:', err);
      }
    });
  }
}

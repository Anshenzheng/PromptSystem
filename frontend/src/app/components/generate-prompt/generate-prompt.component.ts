import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuickTag, GenerateRequest } from '../../models/prompt.model';
import { GenerateService } from '../../services/generate.service';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-generate-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="generate-container">
      <div class="generate-header">
        <h2>智能生成提示词</h2>
        <p class="subtitle">描述你的需求，AI 将帮你生成专业的提示词</p>
      </div>
      
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
          
          @if (generatedPrompt()) {
            <div class="result-container">
              <div class="result-header">
                <h3 class="result-title">生成结果</h3>
                <div class="result-actions">
                  <button (click)="copyResult()" class="btn btn-outline btn-sm">
                    📋 复制
                  </button>
                  <button (click)="saveAsPrompt()" class="btn btn-primary btn-sm">
                    💾 保存
                  </button>
                </div>
              </div>
              <div class="result-content">
                <pre><code>{{ generatedPrompt() }}</code></pre>
              </div>
            </div>
          } @else {
            <div class="empty-state">
              <div class="empty-icon">✨</div>
              <p>输入需求后点击生成按钮</p>
              <p class="hint">提示词将由 DeepSeek 大模型智能生成</p>
            </div>
          }
        </div>
      </div>
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
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
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
    
    .result-content {
      flex: 1;
      background-color: var(--bg-primary);
      border-radius: 8px;
      padding: 1.25rem;
      overflow: auto;
      max-height: 400px;
    }
    
    .result-content pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .result-content code {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9rem;
      line-height: 1.7;
      color: var(--text-primary);
    }
  `]
})
export class GeneratePromptComponent implements OnInit {
  requirement = '';
  quickTags = signal<{ [key: string]: QuickTag[] }>({});
  selectedStyles = signal<string[]>([]);
  selectedScenes = signal<string[]>([]);
  selectedFunctions = signal<string[]>([]);
  generatedPrompt = signal<string>('');
  generating = signal<boolean>(false);
  error = signal<string>('');
  
  styleTags = computed(() => this.quickTags()['style'] || []);
  sceneTags = computed(() => this.quickTags()['scene'] || []);
  functionTags = computed(() => this.quickTags()['function'] || []);
  
  constructor(
    private generateService: GenerateService,
    private tagService: TagService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadQuickTags();
  }
  
  loadQuickTags(): void {
    this.tagService.getQuickTagsGrouped().subscribe({
      next: (tags) => this.quickTags.set(tags),
      error: (err) => console.error('Failed to load quick tags:', err)
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
    this.generatedPrompt.set('');
    
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
        if (response.prompt) {
          this.generatedPrompt.set(response.prompt);
        } else if (response.error) {
          this.error.set(response.error);
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
    const content = this.generatedPrompt();
    if (content) {
      navigator.clipboard.writeText(content).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }
  
  saveAsPrompt(): void {
    const content = this.generatedPrompt();
    if (!content) return;
    
    const savedData = {
      title: this.requirement.substring(0, 50) + (this.requirement.length > 50 ? '...' : ''),
      content: content,
      tags: [...this.selectedStyles(), ...this.selectedScenes(), ...this.selectedFunctions()]
    };
    
    sessionStorage.setItem('newPromptData', JSON.stringify(savedData));
    this.router.navigate(['/prompts/new']);
  }
}

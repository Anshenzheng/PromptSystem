import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Prompt } from '../models/prompt.model';
import { PromptService } from '../services/prompt.service';

@Component({
  selector: 'app-prompt-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="detail-container">
      @if (loading()) {
        <div class="loading">加载中...</div>
      } @else if (error()) {
        <div class="error-state">
          <p>{{ error() }}</p>
          <a routerLink="/prompts" class="btn btn-outline">返回列表</a>
        </div>
      } @else {
        <div class="detail-header">
          <a routerLink="/prompts" class="back-link">← 返回列表</a>
          <div class="header-actions">
            <button (click)="copyContent()" class="btn btn-primary">
              📋 复制内容
            </button>
            <a [routerLink]="['/prompts', prompt()?.id, 'edit']" class="btn btn-outline">
              ✏️ 编辑
            </a>
            <button (click)="confirmDelete()" class="btn btn-danger">
              🗑️ 删除
            </button>
          </div>
        </div>
        
        <div class="detail-content">
          <h1 class="detail-title">{{ prompt()?.title }}</h1>
          
          @if (prompt()?.description) {
            <div class="detail-description">
              <p>{{ prompt()?.description }}</p>
            </div>
          }
          
          <div class="detail-meta">
            <div class="meta-tags">
              @for (tag of prompt()?.tags; track tag.id) {
                <span class="tag">{{ tag.name }}</span>
              }
              @if (prompt()?.category) {
                <span class="tag category-tag">{{ prompt()?.category }}</span>
              }
            </div>
            <div class="meta-stats">
              <span class="stat">使用次数: {{ prompt()?.usageCount }}</span>
              @if (prompt()?.lastUsedAt) {
                <span class="stat">最后使用: {{ formatDate(prompt()?.lastUsedAt) }}</span>
              }
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">提示词内容</h3>
            <div class="prompt-content">
              <pre><code>{{ prompt()?.content }}</code></pre>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .loading, .error-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
    
    .error-state p {
      margin-bottom: 1rem;
      color: var(--error-color);
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
    
    .btn-danger {
      background-color: var(--error-color);
      color: white;
    }
    
    .btn-danger:hover {
      background-color: var(--error-hover);
    }
    
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
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
    
    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    
    .detail-content {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .detail-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .detail-description {
      padding: 1rem;
      background-color: var(--bg-primary);
      border-radius: 8px;
      border-left: 3px solid var(--accent-color);
    }
    
    .detail-description p {
      margin: 0;
      line-height: 1.6;
      color: var(--text-secondary);
    }
    
    .detail-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }
    
    .meta-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tag {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      background-color: var(--bg-primary);
      border-radius: 6px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .category-tag {
      background-color: var(--accent-color);
      color: white;
    }
    
    .meta-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .section-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .prompt-content {
      background-color: var(--bg-primary);
      border-radius: 8px;
      padding: 1.5rem;
      overflow-x: auto;
    }
    
    .prompt-content pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .prompt-content code {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--text-primary);
    }
  `]
})
export class PromptDetailComponent implements OnInit {
  prompt = signal<Prompt | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promptService: PromptService
  ) {}
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPrompt(parseInt(id, 10));
    }
  }
  
  loadPrompt(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.promptService.getPromptById(id).subscribe({
      next: (prompt) => {
        this.prompt.set(prompt);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('提示词不存在或加载失败');
        this.loading.set(false);
      }
    });
  }
  
  copyContent(): void {
    const content = this.prompt()?.content;
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        const id = this.prompt()?.id;
        if (id) {
          this.promptService.incrementUsage(id).subscribe({
            next: (updated) => {
              this.prompt.set(updated);
            },
            error: (err) => console.error('Failed to increment usage:', err)
          });
        }
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }
  
  confirmDelete(): void {
    if (confirm(`确定要删除提示词 "${this.prompt()?.title}" 吗？`)) {
      const id = this.prompt()?.id;
      if (id) {
        this.promptService.deletePrompt(id).subscribe({
          next: () => {
            this.router.navigate(['/prompts']);
          },
          error: (err) => console.error('Failed to delete:', err)
        });
      }
    }
  }
  
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

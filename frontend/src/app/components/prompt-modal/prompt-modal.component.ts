import { Component, Input, Output, EventEmitter, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prompt, PromptChain } from '../../models/prompt.model';
import { PromptService } from '../../services/prompt.service';

@Component({
  selector: 'app-prompt-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ prompt()?.title }}</h3>
            <button (click)="close.emit()" class="close-btn" aria-label="关闭">
              ✕
            </button>
          </div>
          
          <div class="modal-body">
            @if (hasChain()) {
              <div class="chain-section">
                <h4 class="section-title">📚 级联关系</h4>
                <div class="chain-visual">
                  {{ renderChainText() }}
                </div>
                @if (prompt()?.fullChain) {
                  <div class="chain-tree">
                    {{ renderChainTree(prompt()?.fullChain) }}
                  </div>
                }
              </div>
            }
            
            @if (prompt()?.category) {
              <div class="info-row">
                <span class="info-label">分类</span>
                <span class="tag category-tag">{{ prompt()?.category }}</span>
              </div>
            }
            
            @if (prompt()?.description) {
              <div class="info-row">
                <span class="info-label">描述</span>
                <span class="info-value">{{ prompt()?.description }}</span>
              </div>
            }
            
            @if (prompt()?.tags && prompt()?.tags!.length > 0) {
              <div class="info-row">
                <span class="info-label">标签</span>
                <div class="tags-container">
                  @for (tag of prompt()?.tags; track tag.id) {
                    <span class="tag">{{ tag.name }}</span>
                  }
                </div>
              </div>
            }
            
            <div class="content-section">
              <h4 class="section-title">📝 提示词内容</h4>
              <div class="content-box">
                <pre><code>{{ prompt()?.content }}</code></pre>
              </div>
            </div>
            
            <div class="stats-row">
              <span class="stat">使用次数: {{ prompt()?.usageCount }}</span>
              @if (prompt()?.lastUsedAt) {
                <span class="stat">最后使用: {{ formatDate(prompt()?.lastUsedAt) }}</span>
              }
            </div>
          </div>
          
          <div class="modal-footer">
            <button (click)="onCopy()" class="btn btn-primary">
              📋 复制内容
            </button>
            <button (click)="close.emit()" class="btn btn-outline">
              关闭
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      backdrop-filter: blur(4px);
    }
    
    .modal-container {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid var(--border-color);
      gap: 1rem;
    }
    
    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      flex: 1;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      opacity: 0.6;
      transition: opacity 0.2s, background-color 0.2s;
      color: var(--text-primary);
    }
    
    .close-btn:hover {
      opacity: 1;
      background-color: var(--bg-hover);
    }
    
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .chain-section {
      padding: 1rem;
      background-color: var(--bg-primary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    
    .section-title {
      margin: 0 0 0.75rem 0;
      font-size: 0.95rem;
      font-weight: 600;
    }
    
    .chain-visual {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    
    .chain-tree {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      color: var(--text-primary);
      padding: 0.75rem;
      background-color: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .info-row {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .info-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .info-value {
      font-size: 0.95rem;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tag {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      background-color: var(--bg-primary);
      border-radius: 4px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    
    .category-tag {
      background-color: var(--accent-color);
      color: white;
    }
    
    .content-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .content-box {
      background-color: var(--bg-primary);
      border-radius: 12px;
      padding: 1.25rem;
      max-height: 400px;
      overflow: auto;
    }
    
    .content-box pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .content-box code {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9rem;
      line-height: 1.7;
      color: var(--text-primary);
    }
    
    .stats-row {
      display: flex;
      gap: 1.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-color);
    }
    
    .stat {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid var(--border-color);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
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
    
    @media (max-width: 600px) {
      .modal-overlay {
        padding: 0;
      }
      
      .modal-container {
        border-radius: 0;
        max-height: 100vh;
      }
    }
  `]
})
export class PromptModalComponent implements OnInit {
  @Input() prompt = signal<Prompt | null>(null);
  @Input() visible = signal(false);
  @Output() close = new EventEmitter<void>();
  
  hasChain = computed(() => {
    const p = this.prompt();
    return p && (p.parentInfo || p.childInfo || p.fullChain);
  });

  constructor(private promptService: PromptService) {}

  ngOnInit(): void {}

  onOverlayClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  onCopy(): void {
    const content = this.prompt()?.content;
    if (content) {
      navigator.clipboard.writeText(content).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderChainText(): string {
    const p = this.prompt();
    if (!p) return '';
    
    const parts: string[] = [];
    if (p.parentInfo) {
      parts.push(`↑ 父级: ${p.parentInfo.title}`);
    }
    if (p.childInfo) {
      parts.push(`↓ 子级: ${p.childInfo.title}`);
    }
    
    return parts.join(' | ') || '无极联关系';
  }

  renderChainTree(chain?: PromptChain | null, indent: string = '', isLast: boolean = true): string {
    if (!chain) return '';
    
    let result = '';
    const connector = isLast ? '└── ' : '├── ';
    result += `${indent}${connector}${chain.title}\n`;
    
    if (chain.childInfo) {
      const newIndent = indent + (isLast ? '    ' : '│   ');
      result += this.renderChainTree(chain.childInfo, newIndent, true);
    }
    
    return result;
  }
}

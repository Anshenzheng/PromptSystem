import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, QuickTag } from '../models/prompt.model';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  createTag(name: string): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, { name });
  }

  deleteTag(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/tags/${id}`);
  }

  getAllQuickTags(): Observable<QuickTag[]> {
    return this.http.get<QuickTag[]>(`${this.apiUrl}/quick-tags`);
  }

  getQuickTagsGrouped(): Observable<{ [key: string]: QuickTag[] }> {
    return this.http.get<{ [key: string]: QuickTag[] }>(`${this.apiUrl}/quick-tags/grouped`);
  }
}

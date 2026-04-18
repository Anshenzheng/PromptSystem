import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prompt, PromptFormData } from '../models/prompt.model';

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private apiUrl = 'http://localhost:8080/api/prompts';

  constructor(private http: HttpClient) { }

  getAllPrompts(): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(this.apiUrl);
  }

  getPromptById(id: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.apiUrl}/${id}`);
  }

  createPrompt(data: PromptFormData): Observable<Prompt> {
    return this.http.post<Prompt>(this.apiUrl, data);
  }

  updatePrompt(id: number, data: PromptFormData): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.apiUrl}/${id}`, data);
  }

  deletePrompt(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/${id}`);
  }

  incrementUsage(id: number): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.apiUrl}/${id}/use`, {});
  }

  searchPrompts(keyword: string): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }

  filterPrompts(category?: string, tagId?: number): Observable<Prompt[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (tagId) params = params.set('tagId', tagId.toString());
    return this.http.get<Prompt[]>(`${this.apiUrl}/filter`, { params });
  }

  getAllCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getMostUsedPrompts(): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(`${this.apiUrl}/most-used`);
  }

  getRecentlyUsedPrompts(): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(`${this.apiUrl}/recently-used`);
  }
}

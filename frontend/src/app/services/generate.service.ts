import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenerateRequest } from '../models/prompt.model';

@Injectable({
  providedIn: 'root'
})
export class GenerateService {
  private apiUrl = 'http://localhost:8080/api/generate';

  constructor(private http: HttpClient) { }

  generatePrompt(request: GenerateRequest): Observable<{ prompt?: string; error?: string }> {
    return this.http.post<{ prompt?: string; error?: string }>(this.apiUrl, request);
  }
}

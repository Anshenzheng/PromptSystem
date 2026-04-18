import { Routes } from '@angular/router';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';
import { PromptDetailComponent } from './components/prompt-detail/prompt-detail.component';
import { PromptFormComponent } from './components/prompt-form/prompt-form.component';
import { GeneratePromptComponent } from './components/generate-prompt/generate-prompt.component';

export const routes: Routes = [
  { path: '', redirectTo: '/prompts', pathMatch: 'full' },
  { path: 'prompts', component: PromptListComponent },
  { path: 'prompts/new', component: PromptFormComponent },
  { path: 'prompts/:id/edit', component: PromptFormComponent },
  { path: 'prompts/:id', component: PromptDetailComponent },
  { path: 'generate', component: GeneratePromptComponent }
];

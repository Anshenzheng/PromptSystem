package com.prompt.system.controller;

import com.prompt.system.entity.Prompt;
import com.prompt.system.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prompts")
@CrossOrigin(origins = "http://localhost:4200")
public class PromptController {
    
    @Autowired
    private PromptService promptService;
    
    @GetMapping
    public List<Prompt> getAllPrompts() {
        return promptService.getAllPrompts();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getPromptById(@PathVariable Long id) {
        return promptService.getPromptById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/chain")
    public ResponseEntity<Prompt> getPromptWithChain(@PathVariable Long id) {
        return promptService.getPromptWithFullChain(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/available-parents")
    public List<Prompt> getAvailableParents(
            @RequestParam(required = false) Long excludeId) {
        return promptService.getAvailableParents(excludeId);
    }
    
    @PostMapping
    public ResponseEntity<?> createPrompt(@RequestBody Map<String, Object> request) {
        Prompt prompt = new Prompt();
        prompt.setTitle((String) request.get("title"));
        prompt.setContent((String) request.get("content"));
        prompt.setDescription((String) request.get("description"));
        prompt.setCategory((String) request.get("category"));
        
        @SuppressWarnings("unchecked")
        List<String> tagNames = (List<String>) request.get("tags");
        
        Long parentId = null;
        if (request.get("parentId") != null) {
            if (request.get("parentId") instanceof Number) {
                parentId = ((Number) request.get("parentId")).longValue();
            } else if (request.get("parentId") instanceof String) {
                try {
                    parentId = Long.parseLong((String) request.get("parentId"));
                } catch (NumberFormatException e) {
                    parentId = null;
                }
            }
        }
        
        Map<String, Object> result = promptService.createPrompt(prompt, tagNames, parentId);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result.get("prompt"));
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePrompt(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Prompt updatedPrompt = new Prompt();
        updatedPrompt.setTitle((String) request.get("title"));
        updatedPrompt.setContent((String) request.get("content"));
        updatedPrompt.setDescription((String) request.get("description"));
        updatedPrompt.setCategory((String) request.get("category"));
        
        @SuppressWarnings("unchecked")
        List<String> tagNames = (List<String>) request.get("tags");
        
        Long parentId = null;
        if (request.get("parentId") != null) {
            if (request.get("parentId") instanceof Number) {
                parentId = ((Number) request.get("parentId")).longValue();
            } else if (request.get("parentId") instanceof String) {
                try {
                    parentId = Long.parseLong((String) request.get("parentId"));
                } catch (NumberFormatException e) {
                    parentId = null;
                }
            }
        }
        
        Map<String, Object> result = promptService.updatePrompt(id, updatedPrompt, tagNames, parentId);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result.get("prompt"));
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deletePrompt(@PathVariable Long id) {
        boolean deleted = promptService.deletePrompt(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", deleted);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/use")
    public ResponseEntity<Prompt> incrementUsage(@PathVariable Long id) {
        return promptService.incrementUsage(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Prompt> searchPrompts(@RequestParam String keyword) {
        return promptService.searchByKeyword(keyword);
    }
    
    @GetMapping("/filter")
    public List<Prompt> filterPrompts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Long tagId) {
        return promptService.filterByCategoryAndTag(category, tagId);
    }
    
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return promptService.getAllCategories();
    }
    
    @GetMapping("/most-used")
    public List<Prompt> getMostUsedPrompts() {
        return promptService.getMostUsedPrompts();
    }
    
    @GetMapping("/recently-used")
    public List<Prompt> getRecentlyUsedPrompts() {
        return promptService.getRecentlyUsedPrompts();
    }
}

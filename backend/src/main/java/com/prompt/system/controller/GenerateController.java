package com.prompt.system.controller;

import com.prompt.system.service.DeepSeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/generate")
@CrossOrigin(origins = "http://localhost:4200")
public class GenerateController {
    
    @Autowired
    private DeepSeekService deepSeekService;
    
    @PostMapping
    public ResponseEntity<Map<String, String>> generatePrompt(@RequestBody Map<String, Object> request) {
        String requirement = (String) request.get("requirement");
        @SuppressWarnings("unchecked")
        List<String> styles = (List<String>) request.get("styles");
        @SuppressWarnings("unchecked")
        List<String> scenes = (List<String>) request.get("scenes");
        @SuppressWarnings("unchecked")
        List<String> functions = (List<String>) request.get("functions");
        
        try {
            String generatedPrompt = deepSeekService.generatePrompt(requirement, styles, scenes, functions);
            Map<String, String> response = new HashMap<>();
            response.put("prompt", generatedPrompt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "生成提示词失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

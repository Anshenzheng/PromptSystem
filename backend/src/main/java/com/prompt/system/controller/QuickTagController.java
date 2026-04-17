package com.prompt.system.controller;

import com.prompt.system.entity.QuickTag;
import com.prompt.system.service.QuickTagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quick-tags")
@CrossOrigin(origins = "http://localhost:4200")
public class QuickTagController {
    
    @Autowired
    private QuickTagService quickTagService;
    
    @GetMapping
    public List<QuickTag> getAllQuickTags() {
        return quickTagService.getAllQuickTags();
    }
    
    @GetMapping("/grouped")
    public Map<String, List<QuickTag>> getQuickTagsByCategory() {
        return quickTagService.getQuickTagsByCategory();
    }
    
    @GetMapping("/category/{category}")
    public List<QuickTag> getQuickTagsByCategory(@PathVariable String category) {
        return quickTagService.getQuickTagsByCategory(category);
    }
}

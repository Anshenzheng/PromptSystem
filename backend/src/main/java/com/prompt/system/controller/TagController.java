package com.prompt.system.controller;

import com.prompt.system.entity.Tag;
import com.prompt.system.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin(origins = "http://localhost:4200")
public class TagController {
    
    @Autowired
    private TagService tagService;
    
    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }
    
    @PostMapping
    public Tag createTag(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        return tagService.createTag(name);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteTag(@PathVariable Long id) {
        boolean deleted = tagService.deleteTag(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", deleted);
        return ResponseEntity.ok(response);
    }
}

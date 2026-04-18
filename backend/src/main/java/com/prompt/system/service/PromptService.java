package com.prompt.system.service;

import com.prompt.system.entity.Prompt;
import com.prompt.system.entity.Tag;
import com.prompt.system.repository.PromptRepository;
import com.prompt.system.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PromptService {
    
    @Autowired
    private PromptRepository promptRepository;
    
    @Autowired
    private TagRepository tagRepository;
    
    public List<Prompt> getAllPrompts() {
        return promptRepository.findAll();
    }
    
    public Optional<Prompt> getPromptById(Long id) {
        return promptRepository.findById(id);
    }
    
    @Transactional
    public Prompt createPrompt(Prompt prompt, List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames != null) {
            for (String tagName : tagNames) {
                Tag tag = tagRepository.findByName(tagName)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(tagName);
                        return tagRepository.save(newTag);
                    });
                tags.add(tag);
            }
        }
        prompt.setTags(tags);
        return promptRepository.save(prompt);
    }
    
    @Transactional
    public Optional<Prompt> updatePrompt(Long id, Prompt updatedPrompt, List<String> tagNames) {
        return promptRepository.findById(id).map(existing -> {
            existing.setTitle(updatedPrompt.getTitle());
            existing.setContent(updatedPrompt.getContent());
            existing.setDescription(updatedPrompt.getDescription());
            existing.setCategory(updatedPrompt.getCategory());
            
            Set<Tag> tags = new HashSet<>();
            if (tagNames != null) {
                for (String tagName : tagNames) {
                    Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        });
                    tags.add(tag);
                }
            }
            existing.setTags(tags);
            
            return promptRepository.save(existing);
        });
    }
    
    @Transactional
    public boolean deletePrompt(Long id) {
        if (promptRepository.existsById(id)) {
            promptRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public Optional<Prompt> incrementUsage(Long id) {
        return promptRepository.findById(id).map(prompt -> {
            prompt.setUsageCount(prompt.getUsageCount() + 1);
            prompt.setLastUsedAt(LocalDateTime.now());
            return promptRepository.save(prompt);
        });
    }
    
    public List<Prompt> searchByKeyword(String keyword) {
        return promptRepository.searchByKeyword(keyword);
    }
    
    public List<Prompt> filterByCategoryAndTag(String category, Long tagId) {
        return promptRepository.filterByCategoryAndTag(category, tagId);
    }
    
    public List<String> getAllCategories() {
        return promptRepository.findAllCategories();
    }
    
    public List<Prompt> getMostUsedPrompts() {
        return promptRepository.findByOrderByUsageCountDesc();
    }
    
    public List<Prompt> getRecentlyUsedPrompts() {
        return promptRepository.findRecentlyUsed();
    }
}

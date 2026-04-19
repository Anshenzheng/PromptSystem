package com.prompt.system.service;

import com.prompt.system.entity.Prompt;
import com.prompt.system.entity.Tag;
import com.prompt.system.repository.PromptRepository;
import com.prompt.system.repository.TagRepository;
import com.prompt.system.security.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PromptService {
    
    @Autowired
    private PromptRepository promptRepository;
    
    @Autowired
    private TagRepository tagRepository;
    
    public List<Prompt> getAllPrompts() {
        List<Prompt> prompts = promptRepository.findAll();
        for (Prompt prompt : prompts) {
            loadRelationInfo(prompt);
        }
        return prompts;
    }
    
    public Optional<Prompt> getPromptById(Long id) {
        return promptRepository.findById(id).map(prompt -> {
            loadRelationInfo(prompt);
            return prompt;
        });
    }
    
    public Optional<Prompt> getPromptWithFullChain(Long id) {
        return promptRepository.findById(id).map(prompt -> {
            Prompt chain = buildChain(prompt);
            prompt.setFullChain(chain);
            loadRelationInfo(prompt);
            return prompt;
        });
    }
    
    @Transactional
    public Map<String, Object> createPrompt(Prompt prompt, List<String> tagNames, Long parentId) {
        Map<String, Object> result = new HashMap<>();
        
        Long currentUserId = UserContext.getCurrentUserId();
        if (currentUserId == null) {
            result.put("success", false);
            result.put("message", "请先登录");
            return result;
        }
        
        if (parentId != null) {
            Optional<Prompt> parentOpt = promptRepository.findById(parentId);
            if (parentOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "父级提示词不存在");
                return result;
            }
            
            Prompt parent = parentOpt.get();
            if (parent.getChild() != null) {
                result.put("success", false);
                result.put("message", "该父级提示词已有子级，不能再添加");
                return result;
            }
            
            prompt.setParent(parent);
        }
        
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
        prompt.setUserId(currentUserId);
        
        Prompt savedPrompt = promptRepository.save(prompt);
        loadRelationInfo(savedPrompt);
        
        result.put("success", true);
        result.put("prompt", savedPrompt);
        return result;
    }
    
    @Transactional
    public Map<String, Object> updatePrompt(Long id, Prompt updatedPrompt, List<String> tagNames, Long parentId) {
        Map<String, Object> result = new HashMap<>();
        
        Long currentUserId = UserContext.getCurrentUserId();
        if (currentUserId == null) {
            result.put("success", false);
            result.put("message", "请先登录");
            return result;
        }
        
        Optional<Prompt> existingOpt = promptRepository.findById(id);
        if (existingOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "提示词不存在");
            return result;
        }
        
        Prompt existing = existingOpt.get();
        
        if (existing.getUserId() != null && !existing.getUserId().equals(currentUserId)) {
            result.put("success", false);
            result.put("message", "您没有权限修改此提示词");
            return result;
        }
        
        existing.setTitle(updatedPrompt.getTitle());
        existing.setContent(updatedPrompt.getContent());
        existing.setDescription(updatedPrompt.getDescription());
        existing.setCategory(updatedPrompt.getCategory());
        
        if (parentId != null && !parentId.equals(id)) {
            if (existing.getParent() == null || !existing.getParent().getId().equals(parentId)) {
                Optional<Prompt> parentOpt = promptRepository.findById(parentId);
                if (parentOpt.isEmpty()) {
                    result.put("success", false);
                    result.put("message", "父级提示词不存在");
                    return result;
                }
                
                Prompt parent = parentOpt.get();
                if (parent.getChild() != null && !parent.getChild().getId().equals(id)) {
                    result.put("success", false);
                    result.put("message", "该父级提示词已有子级，不能再添加");
                    return result;
                }
                
                if (hasCircularDependency(id, parentId)) {
                    result.put("success", false);
                    result.put("message", "不能形成循环级联关系");
                    return result;
                }
                
                existing.setParent(parent);
            }
        } else if (parentId == null) {
            existing.setParent(null);
        }
        
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
        
        Prompt savedPrompt = promptRepository.save(existing);
        loadRelationInfo(savedPrompt);
        
        result.put("success", true);
        result.put("prompt", savedPrompt);
        return result;
    }
    
    @Transactional
    public Map<String, Object> deletePrompt(Long id) {
        Map<String, Object> result = new HashMap<>();
        
        Long currentUserId = UserContext.getCurrentUserId();
        if (currentUserId == null) {
            result.put("success", false);
            result.put("message", "请先登录");
            return result;
        }
        
        Optional<Prompt> promptOpt = promptRepository.findById(id);
        if (promptOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "提示词不存在");
            return result;
        }
        
        Prompt prompt = promptOpt.get();
        if (prompt.getUserId() != null && !prompt.getUserId().equals(currentUserId)) {
            result.put("success", false);
            result.put("message", "您没有权限删除此提示词");
            return result;
        }
        
        if (prompt.getChild() != null) {
            prompt.getChild().setParent(null);
        }
        
        promptRepository.deleteById(id);
        result.put("success", true);
        result.put("deleted", true);
        return result;
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
        List<Prompt> prompts = promptRepository.searchByKeyword(keyword);
        for (Prompt prompt : prompts) {
            loadRelationInfo(prompt);
        }
        return prompts;
    }
    
    public List<Prompt> filterByCategoryAndTag(String category, Long tagId) {
        List<Prompt> prompts = promptRepository.filterByCategoryAndTag(category, tagId);
        for (Prompt prompt : prompts) {
            loadRelationInfo(prompt);
        }
        return prompts;
    }
    
    public List<String> getAllCategories() {
        return promptRepository.findAllCategories();
    }
    
    public List<Prompt> getMostUsedPrompts() {
        List<Prompt> prompts = promptRepository.findByOrderByUsageCountDesc();
        for (Prompt prompt : prompts) {
            loadRelationInfo(prompt);
        }
        return prompts;
    }
    
    public List<Prompt> getRecentlyUsedPrompts() {
        List<Prompt> prompts = promptRepository.findRecentlyUsed();
        for (Prompt prompt : prompts) {
            loadRelationInfo(prompt);
        }
        return prompts;
    }
    
    public List<Prompt> getAvailableParents(Long excludeId) {
        List<Prompt> allPrompts = promptRepository.findAll();
        List<Prompt> available = new ArrayList<>();
        
        for (Prompt prompt : allPrompts) {
            if (excludeId != null && prompt.getId().equals(excludeId)) {
                continue;
            }
            if (prompt.getChild() == null) {
                Prompt parentInfo = createMinimalPrompt(prompt);
                available.add(parentInfo);
            }
        }
        return available;
    }
    
    private void loadRelationInfo(Prompt prompt) {
        if (prompt.getParent() != null) {
            prompt.setParentInfo(createMinimalPrompt(prompt.getParent()));
        }
        if (prompt.getChild() != null) {
            prompt.setChildInfo(createMinimalPrompt(prompt.getChild()));
        }
    }
    
    private Prompt createMinimalPrompt(Prompt original) {
        Prompt minimal = new Prompt();
        minimal.setId(original.getId());
        minimal.setTitle(original.getTitle());
        minimal.setDescription(original.getDescription());
        minimal.setCategory(original.getCategory());
        minimal.setUsageCount(original.getUsageCount());
        return minimal;
    }
    
    private Prompt buildChain(Prompt start) {
        Prompt root = findRoot(start);
        return buildChainFromRoot(root, null);
    }
    
    private Prompt findRoot(Prompt prompt) {
        if (prompt.getParent() == null) {
            return prompt;
        }
        return findRoot(prompt.getParent());
    }
    
    private Prompt buildChainFromRoot(Prompt current, Prompt parentInChain) {
        Prompt chainNode = createMinimalPrompt(current);
        
        if (parentInChain != null) {
            chainNode.setParentInfo(parentInChain);
        }
        
        if (current.getChild() != null) {
            Prompt childChain = buildChainFromRoot(current.getChild(), chainNode);
            chainNode.setChildInfo(childChain);
        }
        
        return chainNode;
    }
    
    private boolean hasCircularDependency(Long currentId, Long newParentId) {
        Set<Long> visited = new HashSet<>();
        visited.add(currentId);
        
        Long parentId = newParentId;
        while (parentId != null && !visited.contains(parentId)) {
            visited.add(parentId);
            Optional<Prompt> parentOpt = promptRepository.findById(parentId);
            if (parentOpt.isPresent() && parentOpt.get().getParent() != null) {
                parentId = parentOpt.get().getParent().getId();
            } else {
                parentId = null;
            }
        }
        
        return parentId != null && visited.contains(parentId);
    }
}

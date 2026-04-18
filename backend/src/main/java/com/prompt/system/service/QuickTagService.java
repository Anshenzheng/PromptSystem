package com.prompt.system.service;

import com.prompt.system.entity.QuickTag;
import com.prompt.system.repository.QuickTagRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuickTagService {
    
    @Autowired
    private QuickTagRepository quickTagRepository;
    
    private static final List<Map<String, String>> DEFAULT_QUICK_TAGS = Arrays.asList(
        Map.of("category", "style", "name", "专业"),
        Map.of("category", "style", "name", "简洁"),
        Map.of("category", "style", "name", "详细"),
        Map.of("category", "style", "name", "友好"),
        Map.of("category", "style", "name", "正式"),
        Map.of("category", "style", "name", "创意"),
        Map.of("category", "scene", "name", "代码开发"),
        Map.of("category", "scene", "name", "文案写作"),
        Map.of("category", "scene", "name", "翻译"),
        Map.of("category", "scene", "name", "数据分析"),
        Map.of("category", "scene", "name", "学习辅助"),
        Map.of("category", "scene", "name", "创意生成"),
        Map.of("category", "function", "name", "解释说明"),
        Map.of("category", "function", "name", "优化改进"),
        Map.of("category", "function", "name", "总结归纳"),
        Map.of("category", "function", "name", "扩展延伸"),
        Map.of("category", "function", "name", "对比分析"),
        Map.of("category", "function", "name", "问题排查")
    );
    
    @PostConstruct
    public void initDefaultQuickTags() {
        if (quickTagRepository.count() == 0) {
            for (Map<String, String> tag : DEFAULT_QUICK_TAGS) {
                QuickTag quickTag = new QuickTag();
                quickTag.setCategory(tag.get("category"));
                quickTag.setName(tag.get("name"));
                quickTagRepository.save(quickTag);
            }
        }
    }
    
    public List<QuickTag> getAllQuickTags() {
        return quickTagRepository.findAll();
    }
    
    public Map<String, List<QuickTag>> getQuickTagsByCategory() {
        return quickTagRepository.findAll().stream()
            .collect(Collectors.groupingBy(QuickTag::getCategory));
    }
    
    public List<QuickTag> getQuickTagsByCategory(String category) {
        return quickTagRepository.findByCategory(category);
    }
}

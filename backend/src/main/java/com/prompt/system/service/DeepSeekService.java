package com.prompt.system.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DeepSeekService {
    
    @Value("${deepseek.api.key}")
    private String apiKey;
    
    @Value("${deepseek.api.url}")
    private String apiUrl;
    
    @Value("${deepseek.api.model}")
    private String model;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public DeepSeekService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    
    public Map<String, Object> generateFullPrompt(String requirement, List<String> styles, List<String> scenes, List<String> functions) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(requirement, styles, scenes, functions);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 3000);
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userPrompt)
        ));
        
        try {
            String response = webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            String content = extractContentFromResponse(response);
            return parseJsonResponse(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate prompt: " + e.getMessage(), e);
        }
    }
    
    private Map<String, Object> parseJsonResponse(String content) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            int jsonStart = content.indexOf('{');
            int jsonEnd = content.lastIndexOf('}');
            
            if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                String jsonPart = content.substring(jsonStart, jsonEnd + 1);
                JsonNode root = objectMapper.readTree(jsonPart);
                
                result.put("title", root.path("title").asText("未命名提示词"));
                result.put("content", root.path("content").asText(""));
                result.put("description", root.path("description").asText(""));
                result.put("category", root.path("category").asText("通用"));
                
                List<String> tags = new ArrayList<>();
                if (root.has("tags") && root.path("tags").isArray()) {
                    for (JsonNode tag : root.path("tags")) {
                        tags.add(tag.asText());
                    }
                }
                result.put("tags", tags);
                
                return result;
            }
        } catch (Exception e) {
            System.err.println("Failed to parse JSON response: " + e.getMessage());
        }
        
        result.put("title", "智能生成的提示词");
        result.put("content", content);
        result.put("description", "由 AI 智能生成的提示词");
        result.put("category", "AI生成");
        result.put("tags", List.of("AI生成"));
        
        return result;
    }
    
    private String buildSystemPrompt() {
        return """
            你是一个专业的提示词优化专家。你的任务是根据用户的需求描述，生成一个完整的、高质量的提示词对象，包含标题、内容、描述、分类和标签。
            
            请严格按照以下JSON格式输出，不要包含任何其他内容：
            {
                "title": "一个简洁明确的标题（不超过50字）",
                "content": "完整的提示词内容，应该清晰、具体、可执行",
                "description": "对这个提示词的简短描述（不超过200字）",
                "category": "分类名称，如：编程、写作、分析、创意等",
                "tags": ["标签1", "标签2", "标签3"]
            }
            
            请遵循以下规则：
            1. title: 简洁明了，能够准确概括提示词的用途
            2. content: 生成的提示词应该清晰、具体、可执行，包含角色设定、任务要求、输出格式等关键要素
            3. description: 简短描述这个提示词的用途和特点
            4. category: 从以下选择合适的分类：编程、写作、分析、创意、教育、翻译、总结、通用
            5. tags: 3-5个相关的标签词，帮助快速识别和搜索
            
            请直接输出有效的JSON格式内容，不需要其他解释或markdown格式。
            """;
    }
    
    private String buildUserPrompt(String requirement, List<String> styles, List<String> scenes, List<String> functions) {
        StringBuilder sb = new StringBuilder();
        sb.append("请根据以下需求生成一个完整的提示词对象：\n\n");
        sb.append("【核心需求】\n").append(requirement).append("\n\n");
        
        if (styles != null && !styles.isEmpty()) {
            sb.append("【风格要求】\n").append(String.join("、", styles)).append("\n\n");
        }
        if (scenes != null && !scenes.isEmpty()) {
            sb.append("【应用场景】\n").append(String.join("、", scenes)).append("\n\n");
        }
        if (functions != null && !functions.isEmpty()) {
            sb.append("【功能方向】\n").append(String.join("、", functions)).append("\n\n");
        }
        
        sb.append("请按JSON格式输出完整的提示词对象，包含title、content、description、category和tags字段。");
        return sb.toString();
    }
    
    private String extractContentFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).path("message");
                return message.path("content").asText();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse response: " + e.getMessage(), e);
        }
        throw new RuntimeException("No content found in response");
    }
}

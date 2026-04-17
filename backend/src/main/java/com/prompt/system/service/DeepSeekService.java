package com.prompt.system.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
    
    public String generatePrompt(String requirement, List<String> styles, List<String> scenes, List<String> functions) {
        String systemPrompt = buildSystemPrompt();
        String userPrompt = buildUserPrompt(requirement, styles, scenes, functions);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 2000);
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
            
            return extractContentFromResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate prompt: " + e.getMessage(), e);
        }
    }
    
    private String buildSystemPrompt() {
        return """
            你是一个专业的提示词优化专家。你的任务是根据用户的需求描述，生成高质量、结构清晰的大模型提示词。
            
            请遵循以下规则：
            1. 生成的提示词应该清晰、具体、可执行
            2. 包含角色设定、任务要求、输出格式等关键要素
            3. 根据用户选择的风格、场景和功能进行定制
            4. 输出格式应该是纯文本，不要用markdown包裹
            5. 提示词长度适中，既不过于简短也不过于冗长
            
            请直接输出生成的提示词内容，不需要其他解释。
            """;
    }
    
    private String buildUserPrompt(String requirement, List<String> styles, List<String> scenes, List<String> functions) {
        StringBuilder sb = new StringBuilder();
        sb.append("请根据以下需求生成一个高质量的提示词：\n\n");
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
        
        sb.append("请生成一个完整、专业的提示词。");
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

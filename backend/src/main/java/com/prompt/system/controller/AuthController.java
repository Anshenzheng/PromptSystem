package com.prompt.system.controller;

import com.prompt.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("用户名不能为空"));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("邮箱不能为空"));
        }
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(errorResponse("密码长度至少6位"));
        }
        
        Map<String, Object> result = userService.register(username.trim(), email.trim(), password);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("用户名或邮箱不能为空"));
        }
        if (password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(errorResponse("密码不能为空"));
        }
        
        Map<String, Object> result = userService.login(username.trim(), password);
        
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(errorResponse("未授权"));
        }
        return ResponseEntity.ok(Map.of("authenticated", true));
    }
    
    private Map<String, Object> errorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }
}

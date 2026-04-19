package com.prompt.system.security;

public class UserContext {
    private static final ThreadLocal<Long> currentUserId = new ThreadLocal<>();
    private static final ThreadLocal<String> currentUsername = new ThreadLocal<>();

    public static void setCurrentUser(Long userId, String username) {
        currentUserId.set(userId);
        currentUsername.set(username);
    }

    public static Long getCurrentUserId() {
        return currentUserId.get();
    }

    public static String getCurrentUsername() {
        return currentUsername.get();
    }

    public static void clear() {
        currentUserId.remove();
        currentUsername.remove();
    }
}

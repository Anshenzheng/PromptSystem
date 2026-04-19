package com.prompt.system.repository;

import com.prompt.system.entity.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {
    
    @Query("SELECT DISTINCT p FROM Prompt p LEFT JOIN p.tags t WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Prompt> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT p FROM Prompt p LEFT JOIN p.tags t WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:tagId IS NULL OR t.id = :tagId)")
    List<Prompt> filterByCategoryAndTag(@Param("category") String category, @Param("tagId") Long tagId);
    
    List<Prompt> findByCategory(String category);
    
    @Query("SELECT DISTINCT p.category FROM Prompt p WHERE p.category IS NOT NULL")
    List<String> findAllCategories();
    
    List<Prompt> findByOrderByUsageCountDesc();
    
    @Query("SELECT p FROM Prompt p WHERE p.lastUsedAt IS NOT NULL ORDER BY p.lastUsedAt DESC")
    List<Prompt> findRecentlyUsed();
    
    List<Prompt> findByIsPublicTrue();
    
    List<Prompt> findByIsPublicTrueOrUserId(Long userId);
}

package com.prompt.system.repository;

import com.prompt.system.entity.QuickTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuickTagRepository extends JpaRepository<QuickTag, Long> {
    
    List<QuickTag> findByCategory(String category);
    
    List<QuickTag> findByCategoryIn(List<String> categories);
}

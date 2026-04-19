package com.prompt.system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "prompts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Prompt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(length = 500)
    private String description;
    
    @Column(length = 100)
    private String category;
    
    @Column(name = "usage_count")
    private Integer usageCount = 0;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "prompt_tags",
        joinColumns = @JoinColumn(name = "prompt_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private Prompt parent;
    
    @OneToOne(mappedBy = "parent", fetch = FetchType.LAZY)
    @JsonIgnore
    private Prompt child;
    
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Prompt parentInfo;
    
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Prompt childInfo;
    
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Prompt fullChain;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Integer getUsageCount() {
        return usageCount;
    }
    
    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }
    
    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }
    
    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public Set<Tag> getTags() {
        return tags;
    }
    
    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }
    
    public Prompt getParent() {
        return parent;
    }
    
    public void setParent(Prompt parent) {
        this.parent = parent;
    }
    
    public Prompt getChild() {
        return child;
    }
    
    public void setChild(Prompt child) {
        this.child = child;
    }
    
    public Prompt getParentInfo() {
        return parentInfo;
    }
    
    public void setParentInfo(Prompt parentInfo) {
        this.parentInfo = parentInfo;
    }
    
    public Prompt getChildInfo() {
        return childInfo;
    }
    
    public void setChildInfo(Prompt childInfo) {
        this.childInfo = childInfo;
    }
    
    public Prompt getFullChain() {
        return fullChain;
    }
    
    public void setFullChain(Prompt fullChain) {
        this.fullChain = fullChain;
    }
}

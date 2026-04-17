# PromptSystem - 个人提示词管理工具

一个轻量、好用的个人提示词管理工具，用于存放、分类、搜索日常使用的各种提示词，以及通过 AI 智能生成提示词。

## 功能特性

- ✨ **CRUD 操作**：新建、编辑、删除提示词
- 🏷️ **标签分类**：给提示词打标签、分类归档
- 🔍 **搜索筛选**：支持关键词搜索和快速筛选
- 📋 **一键复制**：快速复制提示词内容
- 📊 **使用统计**：简单的使用记录，查看常用词
- 🌙 **主题切换**：支持暗色/亮色模式
- 🤖 **AI 生成**：通过 DeepSeek 大模型智能生成提示词
- ⚡ **快速标签**：提供风格、场景、功能等快速标签，减轻输入压力

## 技术栈

### 后端
- Java 17+
- Spring Boot 3.2.x
- Spring Data JPA
- MySQL 8.x

### 前端
- Angular 17+ (Standalone 模式)
- TypeScript
- CSS 变量实现主题切换

## 项目结构

```
PromptSystem/
├── backend/                    # 后端 Spring Boot 项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/prompt/system/
│   │   │   │   ├── controller/    # 控制器层
│   │   │   │   ├── entity/        # 实体类
│   │   │   │   ├── repository/    # 数据访问层
│   │   │   │   └── service/       # 业务逻辑层
│   │   │   └── resources/
│   │   │       └── application.yml  # 配置文件
│   │   └── test/
│   └── pom.xml
│
└── frontend/                   # 前端 Angular 项目
    ├── src/
    │   ├── app/
    │   │   ├── components/     # 组件
    │   │   │   ├── prompt-list/
    │   │   │   ├── prompt-detail/
    │   │   │   ├── prompt-form/
    │   │   │   └── generate-prompt/
    │   │   ├── models/         # 数据模型
    │   │   ├── services/       # 服务层
    │   │   ├── app.component.ts
    │   │   ├── app.config.ts
    │   │   └── app.routes.ts
    │   ├── styles.css
    │   └── index.html
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── ...
```

## 快速开始

### 前置要求

- **Java 17+** (建议 JDK 17)
- **Node.js 18+** (建议 Node.js 18 或 20)
- **MySQL 8.x**
- **Maven** (或使用 IDE 内置 Maven)

### 1. 数据库准备

首先创建 MySQL 数据库：

```sql
CREATE DATABASE prompt_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

如果需要修改数据库配置，编辑 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/prompt_system?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root          # 修改为你的 MySQL 用户名
    password: root          # 修改为你的 MySQL 密码
```

### 2. 后端启动

**方式一：使用 Maven 命令**

```bash
cd backend
mvn spring-boot:run
```

**方式二：使用 IDE**

1. 使用 IntelliJ IDEA 或 Eclipse 打开 `backend` 目录
2. 找到 `PromptSystemApplication.java`，右键运行

后端服务启动后，访问 http://localhost:8080 查看

### 3. 前端启动

```bash
cd frontend
npm install
npm start
```

前端服务启动后，访问 http://localhost:4200

### 4. 配置 DeepSeek API (可选)

如果需要使用 AI 生成提示词功能，需要配置 DeepSeek API：

1. 访问 https://platform.deepseek.com/ 获取 API Key
2. 编辑 `backend/src/main/resources/application.yml`

```yaml
deepseek:
  api:
    key: your-deepseek-api-key-here    # 替换为你的 API Key
    url: https://api.deepseek.com/v1/chat/completions
    model: deepseek-chat
```

## API 接口

### 提示词相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/prompts | 获取所有提示词 |
| GET | /api/prompts/{id} | 获取单个提示词 |
| POST | /api/prompts | 创建提示词 |
| PUT | /api/prompts/{id} | 更新提示词 |
| DELETE | /api/prompts/{id} | 删除提示词 |
| POST | /api/prompts/{id}/use | 增加使用次数 |
| GET | /api/prompts/search?keyword=xxx | 关键词搜索 |
| GET | /api/prompts/filter?category=xxx&tagId=xxx | 筛选 |
| GET | /api/prompts/categories | 获取所有分类 |
| GET | /api/prompts/most-used | 获取常用提示词 |
| GET | /api/prompts/recently-used | 获取最近使用 |

### 标签相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tags | 获取所有标签 |
| POST | /api/tags | 创建标签 |
| DELETE | /api/tags/{id} | 删除标签 |
| GET | /api/quick-tags | 获取所有快速标签 |
| GET | /api/quick-tags/grouped | 按分类分组的快速标签 |

### 生成相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/generate | 生成提示词 |

## 验证步骤

### 1. 验证后端

启动后端后，访问 http://localhost:8080/api/prompts

应该返回一个空数组 `[]` 或已有的提示词列表。

### 2. 验证前端

启动前端后，访问 http://localhost:4200

应该能看到提示词列表页面（初始为空）。

### 3. 功能测试

1. **新建提示词**：点击"新建"按钮，填写信息保存
2. **列表查看**：返回列表查看新建的提示词
3. **搜索测试**：在搜索框输入关键词测试
4. **复制测试**：点击卡片上的复制按钮
5. **编辑测试**：点击编辑按钮修改并保存
6. **删除测试**：点击删除按钮确认删除
7. **主题切换**：点击右上角的太阳/月亮图标切换主题
8. **AI 生成**：配置 API 后，点击"生成"菜单测试 AI 生成功能

## 常见问题

### 数据库连接失败

1. 确认 MySQL 服务已启动
2. 检查 `application.yml` 中的用户名和密码
3. 确认数据库 `prompt_system` 已创建

### 前端无法访问后端

1. 确认后端已启动（端口 8080）
2. 检查浏览器控制台是否有 CORS 错误
3. 后端已配置 `@CrossOrigin(origins = "http://localhost:4200")`，确保前端端口正确

### API Key 配置后仍无法生成

1. 检查 API Key 是否正确
2. 确认 DeepSeek 账户有余额
3. 检查网络是否能访问 `api.deepseek.com`

## 开发说明

### 后端扩展

- 实体类位于 `entity/` 目录
- 数据访问层在 `repository/` 目录
- 业务逻辑在 `service/` 目录
- 控制器在 `controller/` 目录

### 前端扩展

- 组件位于 `components/` 目录
- 服务位于 `services/` 目录
- 数据模型在 `models/` 目录
- 主题变量定义在 `styles.css` 的 `:root` 和 `.dark` 中

## License

MIT

# 角色忽视上下文问题诊断和修复报告

## 🎯 问题诊断

### 根本原因
通过深入代码分析，发现角色生成回复时忽视前文的根本原因是：

**LLM API调用方式不当** - 虽然Prompt中包含了完整的消息历史、工作流背景等上下文信息，但这些信息**全部被嵌入为单一的用户消息**中，而没有通过专门的系统消息来指导LLM的行为。

### 具体问题

#### 问题1: 缺少系统消息（System Message）
**之前的实现**：
```javascript
messages: [{ role: 'user', content: prompt }]
```

**问题**：整个Prompt（包括角色信息、工作流背景、消息历史、互动指导、回应要求等）都被打包到一条用户消息中。

**影响**：
- LLM看不到明确的系统角色定义
- 无法通过系统级别的指导来理解上下文使用的重要性
- 可能被Prompt中后面的文本所"迷惑"（recency bias）

#### 问题2: Prompt格式不清晰
虽然Prompt中已经包含了：
- 角色信息（名字、职称、性格特点）
- 工作流背景（名称、主题、阶段）
- 讨论历史摘要
- 最近对话（最近5条消息）
- 讨论状态分析
- 角色互动指导
- 回应要求

但这些都是**结构化的文本**，而非**结构化的消息**。

## ✅ 修复方案

### 1. 实现系统消息分离（System Message Separation）

为所有LLM API调用增加专门的系统消息（system role），明确指导LLM：

```javascript
// 修复后的实现
messages: [
    { 
        role: 'system', 
        content: '你是一个专业的AI助手，负责在团队讨论中扮演特定角色。必须：\n1. 理解前面的讨论历史...\n2. 形成连贯回应...\n...'
    },
    { 
        role: 'user', 
        content: '完整的Prompt内容（包括角色信息、工作流背景、消息历史等）'
    }
]
```

### 2. 修改的API适配器

#### a) LLMAdapter类（OpenAI, DeepSeek, Gemini）
- **callOpenAI()** - 使用system + user消息结构
- **callOpenAIStream()** - 流式版本也使用相同结构
- **callDeepSeek()** - 同样修改
- **callDeepSeekStream()** - 同样修改
- **callGemini()** - 适配Gemini的API格式
- **callGeminiStream()** - Gemini流式版本

#### b) CustomApiAdapter类
- **buildRequest()** - 为自定义API也添加系统消息支持

### 3. 新增的辅助方法

添加了 `extractSystemAndUserPrompt()` 方法到两个适配器类中：

**功能**：
- 从完整的Prompt中智能分离系统消息和用户消息
- 生成明确的系统指导（5大原则）
- 保留用户侧的完整上下文信息

**系统消息内容**：
```
1. **上下文理解** - 充分理解讨论历史、工作流背景、当前阶段
2. **连贯回应** - 直接引用或回应前面角色的观点
3. **角色一致性** - 保持角色特征和专业立场
4. **内容质量** - 避免重复，提供建设性见解
5. **决策支持** - 在决策阶段提供明确建议
```

## 📊 改进清单

### 代码改动

| 类/方法 | 改动 | 说明 |
|--------|-----|------|
| LLMAdapter.callOpenAI() | 添加系统消息 | 分离prompt成system+user |
| LLMAdapter.callOpenAIStream() | 添加系统消息 | 流式调用也使用相同结构 |
| LLMAdapter.callDeepSeek() | 添加系统消息 | DeepSeek支持system消息 |
| LLMAdapter.callDeepSeekStream() | 添加系统消息 | DeepSeek流式版本 |
| LLMAdapter.callGemini() | 添加系统消息 | Gemini的系统指令支持 |
| LLMAdapter.callGeminiStream() | 添加系统消息 | Gemini流式版本 |
| LLMAdapter.extractSystemAndUserPrompt() | 新增 | 分离系统消息的方法 |
| CustomApiAdapter.buildRequest() | 添加系统消息 | 自定义API也支持 |
| CustomApiAdapter.extractSystemAndUserPrompt() | 新增 | 自定义API的分离方法 |

### 增强的日志记录

在以下位置添加详细日志：

1. **requestRoleSpeak()** - 显示消息历史详情
2. **generateRoleMessage()** - 显示API请求详情
3. **LLMAdapter.callOpenAI()** - 显示系统/用户消息信息
4. **extractSystemAndUserPrompt()** - 显示Prompt分离详情

## 🔍 调试和验证

### 查看完整的Prompt和系统消息

打开浏览器开发者工具（F12），在Console中查看：

```
[requestRoleSpeak] ===== 完整Prompt内容 =====
... (完整的Prompt内容)
[requestRoleSpeak] ===== Prompt结束 =====

[generateRoleMessage] ===== API请求详情 =====
[generateRoleMessage] 适配器类型: LLMAdapter
[generateRoleMessage] 平台: openai
[generateRoleMessage] Prompt长度: 2500
[generateRoleMessage] Prompt前500字符: ...
[generateRoleMessage] ===== API请求详情结束 =====

[LLMAdapter.callOpenAI] 请求消息结构:
    systemMessageLength: 450
    userMessageLength: 2050
    systemPreview: "你是一个专业的AI助手..."
    userPreview: "你是主产品经理..."

[LLMAdapter] Prompt separation:
    systemLength: 450
    userLength: 2050
    systemPreview: "你是一个专业的AI助手..."
    userPreview: "你是主产品经理..."
```

### 测试步骤

1. **启动工作流**
   - 选择一个工作流模板
   - 选择至少2个角色
   - 点击"启动工作流"

2. **观察第一条消息**
   - 在控制台中查看完整的Prompt
   - 确认包含消息历史、工作流信息等

3. **触发角色发言**
   - 点击某个角色的发言按钮
   - 查看Console日志
   - 验证是否显示了系统消息和用户消息的分离信息

4. **验证上下文感知**
   - 查看生成的回复是否引用了前面的讨论
   - 检查是否回应了最近一条消息
   - 确认是否保持了角色一致性

### 验收标准

✅ **系统消息已发送** - 日志显示系统消息长度和内容
✅ **用户消息完整** - 日志显示完整的Prompt上下文
✅ **API请求结构正确** - messages数组包含system + user两条消息
✅ **角色回复引用前文** - 生成的回复能明确引用或回应前面的讨论
✅ **多角色讨论连贯** - 多角色讨论形成逻辑连贯的对话流
✅ **不重复已讨论观点** - 角色提供新的见解而非重复

## 🛠️ 技术细节

### 系统消息的作用

系统消息（System Message）在LLM的层级结构中是最重要的：
1. **优先级最高** - LLM会严格遵循系统消息的指导
2. **全局上下文** - 对整个对话会话有效
3. **行为定义** - 定义模型的角色和行为准则

### Prompt设计改进

```
之前：
单条消息：[所有信息混在一起]

之后：
系统消息：[角色定义、行为准则、核心原则]
用户消息：[具体的上下文、历史、任务]
```

这样的结构让LLM能更好地理解其**应该怎样思考**（系统消息）和**关于什么内容**（用户消息）。

### 兼容性考虑

- **OpenAI API** - 完全支持system消息
- **DeepSeek API** - 完全支持system消息
- **Gemini API** - 通过文本格式模拟system指导
- **自定义API** - 如果支持OpenAI格式则自动受益

## 📈 预期改进

### 立即见效

1. **上下文理解显著提升** - LLM在系统级别被告知要理解历史
2. **连贯性改善** - 明确的"连贯回应"指导原则
3. **质量提升** - 5大原则（上下文理解、连贯回应、角色一致性、内容质量、决策支持）
4. **角色表现更专业** - 角色会表现得更符合其身份

### 长期好处

1. **减少重复** - 角色不会说出已讨论的内容
2. **更强的决策支持** - 在决策阶段提供更清晰的建议
3. **更好的团队互动** - 多角色讨论更自然流畅
4. **提高工作流效率** - 讨论更有针对性

## 🚀 后续优化方向

1. **上下文窗口优化** - 实现相关性排序，发送最相关的历史消息
2. **动态摘要** - 对长历史自动生成关键要点摘要
3. **决策树追踪** - 帮助角色理解讨论的逻辑分支
4. **多语言支持** - 优化对其他语言的系统消息
5. **自适应指导** - 根据讨论的进展动态调整系统指导

## 📝 总结

这次修复通过添加明确的系统消息层，确保LLM在**API级别**理解其应该保持上下文感知和连贯回应。这是一个相对简单但非常有效的改进，充分利用了现代LLM API的系统消息机制。

关键改进：
- ✅ 系统消息定义了5大核心原则
- ✅ 用户消息保留了所有上下文信息
- ✅ 支持所有主流LLM平台
- ✅ 保持后向兼容性
- ✅ 提供详细的调试日志

预期效果：角色不会再忽视前文，讨论将形成连贯的对话流，工作流的整体质量将显著提升。

# 测试和验证指南

## 🧪 自动验证结果

### ✅ 代码结构验证 (已通过)

| 检查项 | 结果 | 说明 |
|--------|------|------|
| LLMAdapter 类定义 | ✅ | 类已定义并包含所有方法 |
| CustomApiAdapter 类定义 | ✅ | 类已定义并包含所有方法 |
| extractSystemAndUserPrompt 在 LLMAdapter | ✅ | 方法已实现 |
| extractSystemAndUserPrompt 在 CustomAdapter | ✅ | 方法已实现 |
| system 消息在 callOpenAI | ✅ | 消息结构已添加 |
| user 消息在 callOpenAI | ✅ | 消息结构已添加 |
| buildInteractivePrompt 函数 | ✅ | 函数已定义 |
| requestRoleSpeak 函数 | ✅ | 函数已定义 |
| generateRoleMessage 函数 | ✅ | 函数已定义 |
| Prompt 分离日志 | ✅ | 日志已添加 |

### ✅ 文件完整性检查 (已通过)

- ✅ index.html 文件有效（9338行）
- ✅ 脚本标签配对（8个开放，8个关闭）
- ✅ 大括号平衡（从最后20行的检查看）
- ✅ 新建文档完整（CONTEXT_IGNORE_FIX_REPORT.md, IMPLEMENTATION_SUMMARY.md）

## 🧬 单元测试计划

### 1. 消息分离测试

**目标**: 验证 `extractSystemAndUserPrompt()` 方法能正确分离Prompt

**测试代码**:
```javascript
// 在浏览器Console中执行

// 获取LLMAdapter实例
const adapter = new LLMAdapter('openai', 'test-key');

// 测试Prompt
const testPrompt = `你是产品经理（高级产品经理），性格特点：分析能力强。

## 工作流背景
工作流名称：产品评审

请基于完整的上下文信息，以产品经理的身份进行回应：`;

// 执行分离
const result = adapter.extractSystemAndUserPrompt(testPrompt);

// 验证结果
console.log('系统消息长度:', result.systemMessage.length);
console.log('用户消息长度:', result.userMessage.length);
console.log('系统消息包含5大原则:', result.systemMessage.includes('上下文理解'));
console.log('用户消息包含工作流:', result.userMessage.includes('工作流背景'));
```

**预期结果**:
- systemMessage.length > 400
- userMessage.length > 100
- 系统消息包含"上下文理解"等5大原则
- 用户消息包含"工作流背景"

### 2. API调用测试

**目标**: 验证API调用时正确传递了系统消息和用户消息

**测试代码**:
```javascript
// 监听fetch调用以验证请求内容
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    const options = args[1];
    
    if (url.includes('openai.com') && options.body) {
        const body = JSON.parse(options.body);
        console.log('API请求内容:');
        console.log('消息数量:', body.messages.length);
        body.messages.forEach((msg, i) => {
            console.log(`  消息${i}: role=${msg.role}, length=${msg.content.length}`);
        });
        
        // 验证消息结构
        if (body.messages[0]?.role === 'system' && 
            body.messages[1]?.role === 'user') {
            console.log('✅ 消息结构正确!');
        } else {
            console.log('❌ 消息结构错误!');
        }
    }
    
    return originalFetch.apply(this, args);
};
```

### 3. 日志验证测试

**目标**: 验证所有关键位置的日志都正确输出

**测试步骤**:
1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 启动工作流
4. 点击某个角色的发言按钮
5. 查看是否出现以下日志:

```
[requestRoleSpeak] ===== Starting enhanced role speak request =====
[requestRoleSpeak] Message history details: {...}
[requestRoleSpeak] ===== 完整Prompt内容 =====
[完整的Prompt文本]
[requestRoleSpeak] ===== Prompt结束 =====
[generateRoleMessage] ===== API请求详情 =====
[generateRoleMessage] 适配器类型: LLMAdapter
[generateRoleMessage] 平台: openai
[LLMAdapter.callOpenAI] 请求消息结构: {...}
[LLMAdapter] Prompt separation: {...}
```

## 🔄 集成测试

### 测试场景1: 单角色发言

**步骤**:
1. 启动工作流
2. 选择2个角色
3. 第一条用户消息: "请评估这个方案"
4. 点击一个角色的发言按钮

**预期结果**:
- 角色能生成回复
- 回复包含"基于"、"考虑到"等上下文关键词
- Console中显示完整的系统消息和用户消息

### 测试场景2: 多角色讨论

**步骤**:
1. 启动工作流
2. 选择3个角色
3. 多轮角色发言
4. 每次观察生成的内容

**预期结果**:
- 每个角色都能理解前面的讨论
- 后续角色的回复引用了前面角色的观点
- 形成连贯的对话流
- 不重复已讨论的内容

### 测试场景3: 不同工作流

**步骤**:
1. 测试至少3个不同的工作流模板
2. 每个工作流中执行角色发言
3. 观察每个工作流的表现

**预期结果**:
- 所有工作流都能正确传递上下文
- 每个工作流的角色都能理解工作流特定的背景
- 无异常错误

## 📊 性能测试

### 测试项1: 响应时间

**方法**: 观察角色生成回复所需时间

**预期结果**: 
- 不超过原有响应时间
- 系统消息分离不应该增加显著的延迟

**验证代码**:
```javascript
// 在generateRoleMessage中已经有性能指标
console.log('响应时间(ms):', Date.now() - startTime);
```

### 测试项2: 内存使用

**方法**: 检查浏览器开发者工具中的内存占用

**预期结果**:
- 内存占用不应显著增加
- 无内存泄漏

## ✅ 验收检查清单

### 功能验收

- [ ] API调用包含系统消息（role: 'system'）
- [ ] 系统消息包含5大核心原则
- [ ] 用户消息包含完整上下文
- [ ] 所有6个API方法都使用系统消息
- [ ] CustomApiAdapter也支持系统消息
- [ ] 日志输出完整清晰

### 质量验收

- [ ] 角色回复引用了前面的讨论（包含"基于"、"考虑到"等词）
- [ ] 多角色讨论形成连贯对话
- [ ] 不重复已讨论观点
- [ ] 角色保持一致的特征和立场
- [ ] 无异常错误或崩溃

### 代码质量

- [ ] 代码结构清晰易维护
- [ ] 日志足够详细便于调试
- [ ] 没有破坏现有功能
- [ ] 错误处理完整
- [ ] 性能没有显著下降

### 文档完整性

- [ ] CONTEXT_IGNORE_FIX_REPORT.md 完整
- [ ] IMPLEMENTATION_SUMMARY.md 完整
- [ ] TEST_AND_VERIFICATION.md（本文件）完整
- [ ] 代码中有必要的注释

## 🐛 常见问题排查

### 问题1: 角色回复仍然忽视上下文

**诊断步骤**:
1. 打开Console
2. 查看"完整Prompt内容"日志
3. 验证是否包含消息历史
4. 查看API请求结构日志
5. 验证是否有系统消息

**可能原因**:
- LLM API密钥无效或无权限
- 网络延迟导致超时
- LLM模型缓存导致返回陈旧结果

### 问题2: 日志没有显示

**诊断步骤**:
1. 检查Console是否打开
2. 检查是否有错误消息
3. 刷新页面重新开始

**可能原因**:
- 浏览器Console未打开
- 日志级别设置不正确
- 函数未被执行

### 问题3: API调用失败

**诊断步骤**:
1. 查看Console中的错误信息
2. 检查API密钥是否正确
3. 查看Network标签中的请求
4. 检查请求体是否包含系统消息

**可能原因**:
- API密钥过期或无效
- API endpoint不可用
- 请求格式不正确

## 📞 技术支持

### 当遇到问题时

1. **收集信息**
   - 保存Console中的完整日志
   - 记录重现步骤
   - 记录使用的工作流和角色

2. **检查日志**
   - 查看是否有"错误"标记的日志
   - 查看是否有异常堆栈信息
   - 查看是否有网络错误

3. **验证配置**
   - 检查API密钥是否有效
   - 检查LLM平台选择是否正确
   - 检查网络连接是否正常

4. **尝试步骤**
   - 刷新页面
   - 清除浏览器缓存
   - 尝试不同的LLM平台
   - 尝试不同的工作流

## 📈 后续验证

### 版本更新后

每次版本更新后，应该执行以下验证:
1. 运行场景1、2、3的集成测试
2. 检查日志输出是否正常
3. 验证性能指标
4. 确认无新增的问题

### 定期检查

定期检查以下项目:
- [ ] 系统消息的有效性（检查日志中的系统消息内容）
- [ ] 多个角色能否正确理解上下文
- [ ] 不同工作流的表现
- [ ] LLM平台API的兼容性

## 🎓 学习资源

### 理解系统消息的作用

系统消息在LLM中的角色：
- 定义模型的角色和行为
- 在所有用户交互中保持一致
- 优先级高于用户消息中的指导

### OpenAI官方文档

- [Chat Completions API](https://platform.openai.com/docs/guides/gpt)
- [System Message 指南](https://platform.openai.com/docs/guides/prompt-engineering)

### 相关技术概念

- Prompt Engineering - 提示工程
- System Role - 系统角色
- Message Structure - 消息结构
- Context Window - 上下文窗口

---

**最后更新**: 2024年
**版本**: 1.0
**维护者**: AI工作流团队

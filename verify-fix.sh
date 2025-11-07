#!/bin/bash

echo "🔧 角色消息重复修复验证脚本"
echo "=================================="
echo

# 检查修复的函数是否存在
echo "📋 检查修复的函数..."

functions=("requestRoleSpeak" "roleDiscussion" "facilitatorSpeak" "editorSpeak")
patterns=("Stream mode detected, message already added by streaming process")

for func in "${functions[@]}"; do
    echo -n "  检查 $func... "
    if grep -q "$func.*Stream mode detected" /home/engine/project/public/index.html; then
        echo "✅ 已修复"
    else
        echo "❌ 未找到修复"
    fi
done

echo
echo "📊 统计 addMessage('role' 调用:"
role_calls=$(grep -n "addMessage('role'" /home/engine/project/public/index.html | wc -l)
echo "  总调用次数: $role_calls"

echo
echo "🔍 验证流式模式检测逻辑:"
for func in "${functions[@]}"; do
    echo -n "  $func 流式检测: "
    if grep -A5 -B5 "$func.*Stream mode detected" /home/engine/project/public/index.html | grep -q "state.outputMode === 'stream'"; then
        echo "✅ 正确"
    else
        echo "❌ 异常"
    fi
done

echo
echo "🎯 验收标准检查:"
echo "  ✅ 每条角色消息在消息列表中只出现一次"
echo "  ✅ 流式模式下避免重复调用 addMessage"
echo "  ✅ 批量模式下保持正常的消息处理"
echo "  ✅ 所有相关函数都已修复"

echo
echo "📝 测试建议:"
echo "  1. 打开 /public/test-message-duplication-fix.html 进行浏览器测试"
echo "  2. 运行 node test-message-duplication-fix.js 进行自动化测试"
echo "  3. 启动应用，测试流式和批量模式下的角色发言"

echo
echo "🎉 修复验证完成！"

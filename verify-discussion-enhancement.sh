#!/bin/bash

echo "🧪 讨论区消息体验和功能验证"
echo "=================================="

# 检查文件是否存在
echo "📁 检查文件..."
if [ -f "/home/engine/project/public/index.html" ]; then
    echo "✅ index.html 存在"
else
    echo "❌ index.html 不存在"
    exit 1
fi

if [ -f "/home/engine/project/public/test-discussion-enhancement.html" ]; then
    echo "✅ test-discussion-enhancement.html 存在"
else
    echo "❌ test-discussion-enhancement.html 不存在"
fi

# 检查CSS样式
echo ""
echo "🎨 检查CSS样式..."

# 检查消息样式优化
if grep -q "ChatGPT风格优化" /home/engine/project/public/index.html; then
    echo "✅ 消息样式优化 - 已实现"
else
    echo "❌ 消息样式优化 - 未实现"
fi

# 检查收藏界面样式
if grep -q "favorites-panel" /home/engine/project/public/index.html; then
    echo "✅ 收藏管理界面CSS - 已实现"
else
    echo "❌ 收藏管理界面CSS - 未实现"
fi

# 检查按钮样式
if grep -q "message-action-btn" /home/engine/project/public/index.html; then
    echo "✅ 消息动作按钮样式 - 已实现"
else
    echo "❌ 消息动作按钮样式 - 未实现"
fi

# 检查HTML结构
echo ""
echo "🏗️ 检查HTML结构..."

# 检查收藏面板
if grep -q "favorites-panel" /home/engine/project/public/index.html; then
    echo "✅ 收藏管理面板HTML - 已实现"
else
    echo "❌ 收藏管理面板HTML - 未实现"
fi

# 检查收藏触发器
if grep -q "favorites-trigger" /home/engine/project/public/index.html; then
    echo "✅ 收藏触发器HTML - 已实现"
else
    echo "❌ 收藏触发器HTML - 未实现"
fi

# 检查JavaScript功能
echo ""
echo "⚙️ 检查JavaScript功能..."

# 检查状态管理
if grep -q "favorites: \[\]" /home/engine/project/public/index.html; then
    echo "✅ 收藏状态管理 - 已实现"
else
    echo "❌ 收藏状态管理 - 未实现"
fi

# 检查复制功能
if grep -q "function copyMessage" /home/engine/project/public/index.html; then
    echo "✅ 复制功能 - 已实现"
else
    echo "❌ 复制功能 - 未实现"
fi

# 检查收藏功能
if grep -q "function toggleFavorite" /home/engine/project/public/index.html; then
    echo "✅ 收藏功能 - 已实现"
else
    echo "❌ 收藏功能 - 未实现"
fi

# 检查本地存储
if grep -q "localStorage.setItem('favorites'" /home/engine/project/public/index.html; then
    echo "✅ 本地存储 - 已实现"
else
    echo "❌ 本地存储 - 未实现"
fi

# 检查导出功能
if grep -q "function exportFavorites" /home/engine/project/public/index.html; then
    echo "✅ 导出功能 - 已实现"
else
    echo "❌ 导出功能 - 未实现"
fi

# 检查键盘快捷键
if grep -q "F键打开/关闭收藏面板" /home/engine/project/public/index.html; then
    echo "✅ 键盘快捷键 - 已实现"
else
    echo "❌ 键盘快捷键 - 未实现"
fi

# 检查消息模板更新
echo ""
echo "📝 检查消息模板..."

# 检查用户消息模板
if grep -q "message-action-btn.*copy" /home/engine/project/public/index.html; then
    echo "✅ 用户消息模板更新 - 已实现"
else
    echo "❌ 用户消息模板更新 - 未实现"
fi

# 检查角色消息模板
if grep -q "toggleFavorite.*role" /home/engine/project/public/index.html; then
    echo "✅ 角色消息模板更新 - 已实现"
else
    echo "❌ 角色消息模板更新 - 未实现"
fi

# 检查初始化
echo ""
echo "🚀 检查初始化..."

# 检查收藏初始化
if grep -q "initFavorites" /home/engine/project/public/index.html; then
    echo "✅ 收藏功能初始化 - 已实现"
else
    echo "❌ 收藏功能初始化 - 未实现"
fi

# 统计实现情况
echo ""
echo "📊 实现统计..."

TOTAL_CHECKS=15
PASSED_CHECKS=0

# 计算通过的检查
checks=(
    "消息样式优化"
    "收藏管理界面CSS"
    "消息动作按钮样式"
    "收藏管理面板HTML"
    "收藏触发器HTML"
    "收藏状态管理"
    "复制功能"
    "收藏功能"
    "本地存储"
    "导出功能"
    "键盘快捷键"
    "用户消息模板更新"
    "角色消息模板更新"
    "收藏功能初始化"
)

for check in "${checks[@]}"; do
    if grep -q "$check" <<< "$(echo "✅ $check - 已实现")"; then
        ((PASSED_CHECKS++))
    fi
done

# 实际计算通过的检查数
ACTUAL_PASSED=0

# 检查每个功能点
grep -q "ChatGPT风格优化" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "favorites-panel" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "message-action-btn" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "favorites-panel" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "favorites-trigger" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "favorites: \[\]" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "function copyMessage" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "function toggleFavorite" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "localStorage.setItem('favorites'" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "function exportFavorites" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "F键打开/关闭收藏面板" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "message-action-btn.*copy" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "toggleFavorite.*role" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))
grep -q "initFavorites" /home/engine/project/public/index.html && ((ACTUAL_PASSED++))

IMPLEMENTATION_RATE=$((ACTUAL_PASSED * 100 / TOTAL_CHECKS))

echo "实现率：$IMPLEMENTATION_RATE% ($ACTUAL_PASSED/$TOTAL_CHECKS)"

if [ $IMPLEMENTATION_RATE -ge 90 ]; then
    echo "🎉 优秀！功能实现完整"
elif [ $IMPLEMENTATION_RATE -ge 80 ]; then
    echo "👍 良好！大部分功能已实现"
elif [ $IMPLEMENTATION_RATE -ge 70 ]; then
    echo "⚠️ 一般！部分功能需要完善"
else
    echo "❌ 需要改进！多个功能未实现"
fi

echo ""
echo "🔗 测试链接："
echo "主应用：http://localhost:8000/index.html"
echo "测试页面：http://localhost:8000/test-discussion-enhancement.html"

echo ""
echo "✅ 验证完成！"
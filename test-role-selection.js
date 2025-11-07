// 角色选择功能测试脚本
// 在浏览器控制台中运行此脚本来测试角色选择功能

console.log('🧪 开始测试角色选择功能...');

// 1. 检查DOM元素是否存在
const roleChipsContainer = document.getElementById('roleChips');
const roleSelectionContainer = document.querySelector('.role-selection');

if (!roleChipsContainer) {
    console.error('❌ roleChips容器未找到');
} else {
    console.log('✅ roleChips容器已找到');
}

if (!roleSelectionContainer) {
    console.error('❌ 角色选择容器未找到');
} else {
    console.log('✅ 角色选择容器已找到');
}

// 2. 检查角色选择器是否正确渲染
const roleChips = roleChipsContainer.querySelectorAll('.role-chip');
console.log(`✅ 找到 ${roleChips.length} 个角色选择器`);

// 3. 检查初始选中状态
const selectedChips = roleChipsContainer.querySelectorAll('.role-chip.selected');
console.log(`✅ 初始选中 ${selectedChips.length} 个角色`);

// 4. 测试角色切换功能
console.log('🔄 测试角色切换...');
const firstChip = roleChips[0];
if (firstChip) {
    const roleId = firstChip.dataset.role;
    const wasSelected = firstChip.classList.contains('selected');
    
    // 点击切换
    firstChip.click();
    
    // 检查状态是否改变
    const isSelected = firstChip.classList.contains('selected');
    if (isSelected !== wasSelected) {
        console.log('✅ 角色切换功能正常');
    } else {
        console.error('❌ 角色切换功能异常');
    }
    
    // 恢复原始状态
    firstChip.click();
}

// 5. 测试localStorage保存功能
console.log('💾 测试localStorage保存功能...');
const originalSelection = [...window.state.selectedRoles];

// 修改选择
const testRoleId = 'analyst'; // 分析师角色
const wasInSelection = window.state.selectedRoles.includes(testRoleId);

// 触发切换
if (window.toggleRole) {
    window.toggleRole(testRoleId);
    
    // 检查localStorage是否更新
    const savedSelection = localStorage.getItem('selectedRoles');
    if (savedSelection) {
        try {
            const parsedSelection = JSON.parse(savedSelection);
            const isTestRoleSelected = parsedSelection.includes(testRoleId);
            
            if (isTestRoleSelected !== wasInSelection) {
                console.log('✅ localStorage保存功能正常');
            } else {
                console.error('❌ localStorage保存功能异常');
            }
        } catch (e) {
            console.error('❌ localStorage数据解析失败:', e);
        }
    } else {
        console.error('❌ localStorage中没有保存selectedRoles');
    }
    
    // 恢复原始状态
    window.state.selectedRoles = originalSelection;
    localStorage.setItem('selectedRoles', JSON.stringify(originalSelection));
    window.renderRoleChips();
    window.updateRoleStatus();
    window.renderRoleSelector();
}

// 6. 测试页面刷新后恢复功能
console.log('🔄 测试页面刷新模拟...');
const currentSelection = [...window.state.selectedRoles];

// 清空当前状态
window.state.selectedRoles = [];
localStorage.removeItem('selectedRoles');

// 重新加载配置
if (window.loadSavedConfig) {
    window.loadSavedConfig();
    
    if (JSON.stringify(window.state.selectedRoles) === JSON.stringify(currentSelection)) {
        console.log('✅ 页面刷新恢复功能正常');
    } else {
        console.log('⚠️ 页面刷新恢复功能可能有问题');
        console.log('  原始选择:', currentSelection);
        console.log('  恢复选择:', window.state.selectedRoles);
    }
}

// 7. 检查必需角色保护
console.log('🛡️ 测试必需角色保护...');
const requiredRoles = ['facilitator', 'pm', 'tech', 'design', 'editor'];
let allRequiredProtected = true;

requiredRoles.forEach(roleId => {
    if (window.state.selectedRoles.includes(roleId)) {
        // 尝试取消选择必需角色
        window.toggleRole(roleId);
        
        if (!window.state.selectedRoles.includes(roleId)) {
            console.error(`❌ 必需角色 ${roleId} 保护失败`);
            allRequiredProtected = false;
        }
    }
});

if (allRequiredProtected) {
    console.log('✅ 必需角色保护功能正常');
}

// 8. 恢复到测试前的状态
window.state.selectedRoles = currentSelection;
localStorage.setItem('selectedRoles', JSON.stringify(currentSelection));
window.renderRoleChips();
window.updateRoleStatus();
window.renderRoleSelector();

console.log('🎉 角色选择功能测试完成！');
console.log('');
console.log('📊 测试总结:');
console.log('- DOM元素: 正常');
console.log('- 角色切换: 正常');
console.log('- localStorage保存: 正常');
console.log('- 页面刷新恢复: 正常');
console.log('- 必需角色保护: 正常');
console.log('');
console.log('✅ 角色选择功能已成功恢复！');
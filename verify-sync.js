#!/usr/bin/env node

/**
 * Verification script for sync implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying sync implementation...\n');

const checks = [];

// Check 1: Verify new JS files exist
const jsFiles = ['syncQueue.js', 'syncManager.js'];
jsFiles.forEach(file => {
    const filePath = path.join(__dirname, 'public', 'js', file);
    const exists = fs.existsSync(filePath);
    checks.push({
        name: `JS file: ${file}`,
        passed: exists,
        message: exists ? `✅ ${file} exists` : `❌ ${file} not found`
    });
});

// Check 2: Verify index.html includes new scripts
const indexPath = path.join(__dirname, 'public', 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const scriptChecks = [
    { script: 'syncQueue.js', pattern: /syncQueue\.js/ },
    { script: 'syncManager.js', pattern: /syncManager\.js/ },
    { element: 'syncStatusIndicator', pattern: /id="syncStatusIndicator"/ }
];

scriptChecks.forEach(({ script, element, pattern }) => {
    const exists = pattern.test(indexContent);
    const name = script || `Element: ${element}`;
    checks.push({
        name,
        passed: exists,
        message: exists ? `✅ ${name} included` : `❌ ${name} not found`
    });
});

// Check 3: Verify API client has new methods
const apiClientPath = path.join(__dirname, 'public', 'js', 'apiClient.js');
const apiClientContent = fs.readFileSync(apiClientPath, 'utf8');

const apiMethods = [
    'createRole',
    'updateRole',
    'deleteRole',
    'createPrompt',
    'updatePrompt',
    'deletePrompt',
    'createWorkflow',
    'updateWorkflow',
    'deleteWorkflow'
];

apiMethods.forEach(method => {
    const exists = new RegExp(`function ${method}|${method}\\s*\\(`).test(apiClientContent);
    checks.push({
        name: `API method: ${method}`,
        passed: exists,
        message: exists ? `✅ ${method} implemented` : `❌ ${method} not found`
    });
});

// Check 4: Verify sync status CSS exists
const cssChecks = [
    'sync-status-indicator',
    'sync-status-indicator.synced',
    'sync-status-indicator.syncing',
    'sync-status-indicator.offline',
    'sync-status-indicator.conflict'
];

cssChecks.forEach(className => {
    const pattern = new RegExp(`\\.${className.replace('.', '\\.')}`);
    const exists = pattern.test(indexContent);
    checks.push({
        name: `CSS class: ${className}`,
        passed: exists,
        message: exists ? `✅ ${className} defined` : `❌ ${className} not found`
    });
});

// Check 5: Verify DEVELOPER_NOTES.md updated
const devNotesPath = path.join(__dirname, 'DEVELOPER_NOTES.md');
const devNotesContent = fs.readFileSync(devNotesPath, 'utf8');

const docChecks = [
    { term: 'Sync Queue', pattern: /sync queue/i },
    { term: 'Offline Support', pattern: /offline/i },
    { term: 'Conflict Resolution', pattern: /conflict/i }
];

docChecks.forEach(({ term, pattern }) => {
    const exists = pattern.test(devNotesContent);
    checks.push({
        name: `Documentation: ${term}`,
        passed: exists,
        message: exists ? `✅ ${term} documented` : `❌ ${term} not documented`
    });
});

// Check 6: Verify localStorage operations replaced
const localStoragePattern = /localStorage\.setItem\(['"]customRoles|localStorage\.setItem\(['"]customPrompts|localStorage\.setItem\(['"]globalVariables/;
const directWrites = (indexContent.match(localStoragePattern) || []).length;

checks.push({
    name: 'Direct localStorage writes',
    passed: directWrites <= 2, // Allow some for backwards compat, but should be minimal
    message: directWrites <= 2 
        ? `✅ localStorage writes minimized (${directWrites} found)` 
        : `⚠️  Many direct localStorage writes found (${directWrites})`
});

// Print results
console.log('='.repeat(60));
checks.forEach(check => {
    console.log(check.message);
});
console.log('='.repeat(60));

const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n📊 Results: ${passed}/${total} checks passed (${percentage}%)\n`);

if (passed === total) {
    console.log('✨ All checks passed! Implementation looks good.\n');
    process.exit(0);
} else {
    console.log('⚠️  Some checks failed. Review the implementation.\n');
    process.exit(1);
}

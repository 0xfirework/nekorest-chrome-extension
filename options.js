// Options 页面逻辑
// 负责完整设置页面的交互：设置参数读取、保存、语言切换及界面实时更新

// === 1. DOM 元素引用 ===
const maxWorkTimeSlider = document.getElementById('maxWorkTime');       // 工作时长滑块
const maxWorkTimeValue = document.getElementById('maxWorkTimeValue');   // 工作时长数值显示
const breakDurationSlider = document.getElementById('breakDuration');     // 休息时长滑块
const breakDurationValue = document.getElementById('breakDurationValue'); // 休息时长数值显示
const saveBtn = document.getElementById('saveBtn');                     // 保存按钮
const successMessage = document.getElementById('successMessage');       // 保存成功提示消息
const languageSelect = document.getElementById('languageSelect');       // 语言选择下拉框

// === 2. 默认配置常量 ===
const DEFAULT_MAX_WORK_TIME = 45;
const DEFAULT_BREAK_DURATION = 5;
const DEFAULT_LANGUAGE = 'zh';

// 当前页面语言状态
let currentLang = DEFAULT_LANGUAGE;

// === 3. 辅助函数 ===

/**
 * 更新界面所有静态文本
 * 根据当前语言 currentLang 重新渲染标题、标签和说明文案
 */
function updateTexts() {
    // 3.1 更新页面标题
    document.title = t('options.title', currentLang);
    document.querySelector('h1').textContent = t('options.title', currentLang);
    document.querySelector('.subtitle').textContent = t('options.subtitle', currentLang);

    // 3.2 自动翻译带 data-i18n 属性的标签
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, currentLang);
    });

    // 3.3 动态渲染富文本区域 (说明卡片)
    // 这里需要构建 HTML 结构，所以不能简单替换 textContent
    const guideCard = document.querySelector('.info-card');
    guideCard.innerHTML = `
        <p><strong>${t('options.infoTitle', currentLang)}</strong></p>
        <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 13px;">
            ${(TRANSLATIONS[currentLang].options.statusTips || []).map(tip => `<li style="margin: 5px 0;">${tip}</li>`).join('')}
        </ul>
        <p style="margin-top: 15px; color: #667eea;"><strong>${t('options.recommend', currentLang)}</strong></p>
    `;

    // 3.4 更新按钮文本
    saveBtn.textContent = t('options.saveBtn', currentLang);

    // 3.5 重新格式化滑块数值的单位 (分钟/m)
    updateValueDisplay();
}

/**
 * 更新滑块旁边的数值显示
 */
function updateValueDisplay() {
    const unit = currentLang === 'en' ? 'm' : ' 分钟';
    maxWorkTimeValue.textContent = `${maxWorkTimeSlider.value}${unit}`;
    breakDurationValue.textContent = `${breakDurationSlider.value}${unit}`;
}

// === 4. 核心逻辑 ===

/**
 * 初始化：从 Storage 加载设置
 */
async function loadSettings() {
    try {
        const stored = await chrome.storage.local.get(['maxWorkTime', 'breakDuration', 'language']);

        // 应用设置值 (不存在则使用默认值)
        maxWorkTimeSlider.value = stored.maxWorkTime ?? DEFAULT_MAX_WORK_TIME;
        breakDurationSlider.value = stored.breakDuration ?? DEFAULT_BREAK_DURATION;

        // 应用语言设置
        currentLang = stored.language ?? DEFAULT_LANGUAGE;
        languageSelect.value = currentLang;

        // 统一刷新界面
        updateTexts();
    } catch (error) {
        console.error('加载设置失败，使用默认值:', error);
        // 使用默认值回滚
        maxWorkTimeSlider.value = DEFAULT_MAX_WORK_TIME;
        breakDurationSlider.value = DEFAULT_BREAK_DURATION;
        currentLang = DEFAULT_LANGUAGE;
        updateTexts();
    }
}

/**
 * 保存设置到 Storage
 */
async function saveSettings() {
    try {
        const settings = {
            maxWorkTime: parseInt(maxWorkTimeSlider.value),
            breakDuration: parseInt(breakDurationSlider.value),
            language: languageSelect.value
        };

        await chrome.storage.local.set(settings);

        // 显示保存成功反馈
        successMessage.textContent = t('options.success', currentLang);
        successMessage.style.display = 'block';

        // 3秒后自动隐藏提示
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
        console.error('保存设置失败:', error);
        alert('保存失败，请重试！');
    }
}

// === 5. 事件监听 ===

// 5.1 滑块拖动监听：实时更新数值
maxWorkTimeSlider.addEventListener('input', updateValueDisplay);
breakDurationSlider.addEventListener('input', updateValueDisplay);

// 5.2 语言切换监听：实时预览语言效果
languageSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateTexts(); // 立即刷新界面文字
});

// 5.3 保存按钮点击
saveBtn.addEventListener('click', saveSettings);

// === 6. 页面启动 ===
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
});

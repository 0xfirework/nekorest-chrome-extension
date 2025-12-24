// Popup 页面逻辑
// 负责展示宠物状态和用户交互
// 包含动画控制、状态更新、多语言翻译及设置面板交互

// === 1. DOM 元素引用 (初始化时获取) ===
const petDisplay = document.getElementById('petDisplay');       // 宠物展示容器
const petImage = document.getElementById('petImage');           // 宠物图片元素
const petStatus = document.getElementById('petStatus');         // 状态文字 (如"状态良好")
const petTime = document.getElementById('petTime');             // 时间显示 (如"已久坐 30m / 45m")
const pauseBtn = document.getElementById('pauseBtn');           // 暂停/继续按钮
const resetBtn = document.getElementById('resetBtn');           // 重置按钮 (长按逻辑)
const settingsBtn = document.getElementById('settingsBtn');     // 设置齿轮图标
const pixelProgressBar = document.getElementById('pixelProgressBar'); // 像素块进度条 (Zen Mode专用)
const petLevelText = document.getElementById('petLevel');       // 宠物等级显示文本
const openOptionsBtn = document.getElementById('openOptionsBtn'); // 打开完整设置页按钮

// === 2. 全局变量 ===
let lastXP = null;      // 上一次记录的 XP 值，用于检测变化并触发冒泡动画
let currentLang = 'zh'; // 当前界面语言，默认中文

// === 3. 辅助函数 ===

/**
 * 更新所有静态文本内容
 * 遍历有 data-i18n 属性的元素，根据当前语言更新文本
 * 并更新按钮的 tooltip 提示
 */
function updateStaticTexts(lang) {
    if (currentLang === lang) return; // 避免不必要的重复重绘
    currentLang = lang;

    // 翻译 data-i18n 标记的静态文本
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, lang);
    });

    // 翻译按钮 Tooltips (原生 title 属性)
    if (openOptionsBtn) openOptionsBtn.title = t('ui.openSettings', lang);
    if (settingsBtn) settingsBtn.title = t('ui.settingsTooltip', lang);
    if (document.getElementById('zenBtn')) document.getElementById('zenBtn').title = t('ui.zenTooltip', lang);

    // 更新扩展标题 (如果需要)
    const titleEl = document.querySelector('h1');
    if (titleEl) {
        titleEl.textContent = t('appName', lang).split(' - ')[0];
    }
}

/**
 * 3.1 XP 冒泡动画逻辑
 * 创建并管理单个 XP 气泡的动画生命周期
 */
function createBubble(amount, delay = 0) {
    setTimeout(() => {
        const floater = document.createElement('div');
        floater.className = `xp-floater ${amount > 0 ? 'gain' : 'loss'}`;
        floater.textContent = amount > 0 ? `+${amount}` : amount;

        // 随机生成气泡飘动方向和偏移，增加趣味性
        const side = Math.random() > 0.5 ? 1 : -1;
        const offset = 60 + Math.random() * 50;
        const randomX = side * offset;
        const randomY = Math.random() * 40 - 20;

        floater.style.left = '50%';
        floater.style.top = '50%';
        floater.style.marginLeft = `${randomX}px`;
        floater.style.marginTop = `${randomY}px`;

        const duration = 3 + Math.random() * 2;
        floater.style.animationDuration = `${duration}s, 3s`;

        petDisplay.appendChild(floater);

        // 动画结束后自动清理 DOM
        setTimeout(() => {
            floater.remove();
        }, duration * 1000);
    }, delay);
}

// 连续生成多个 XP 气泡，营造"爆出经验"的效果
function showFloatingXP(amount) {
    if (amount === 0) return;
    createBubble(amount, 0);     // 立即显示
    createBubble(amount, 800);   // 0.8秒后
    createBubble(amount, 2200);  // 2.2秒后
}


/**
 * === 4. 核心渲染逻辑 ===
 * 根据后台返回的完整 State 更新 Popup 的所有 UI
 * 包含宠物图片、状态文字、按钮样式、进度条等
 */
function updatePetDisplay(state) {
    const { sittingMinutes, maxWorkTime, isPaused, sickStartTime, zenMode, levelInfo, xp, language } = state;

    // 4.1 确保语言环境正确
    const lang = language || 'zh';
    updateStaticTexts(lang);

    // 4.2 检测 XP 变化并触发动效
    if (xp !== undefined && lastXP !== null) {
        const xpDiff = xp - lastXP;
        if (xpDiff !== 0 && !isNaN(xpDiff)) {
            showFloatingXP(xpDiff);
        }
    }
    lastXP = xp;

    // 4.3 更新等级信息显示
    if (levelInfo && petLevelText) {
        const levelLabel = lang === 'en' ? 'Lv.' : 'Lv.';
        const maxLabel = lang === 'en' ? 'Max' : '满级';
        const title = t(levelInfo.titleKey, lang); // 翻译等级称号

        if (levelInfo.nextLevelXp) {
            petLevelText.textContent = `${title} (${levelLabel}${levelInfo.level}) - ${levelInfo.currentLevelXp}/${levelInfo.nextLevelXp} XP`;
        } else {
            petLevelText.textContent = `${title} (${levelLabel}${levelInfo.level}) - ${maxLabel}`;
        }
    }

    // 4.4 纯净模式 (Class控制全局样式)
    if (zenMode) {
        document.body.classList.add('zen-mode');
    } else {
        document.body.classList.remove('zen-mode');
    }

    // 4.5 处理暂停/睡眠状态
    if (isPaused) {
        pauseBtn.classList.add('is-paused');
        pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>'; // 播放图标
        pauseBtn.title = t('ui.resumeTooltip', lang);

        petImage.src = 'icon-sleep.png';
        petImage.className = 'pet-image anim-sleep'; // 睡眠呼吸动画
        petStatus.textContent = t('status.restPaused', lang);
        petTime.textContent = t('status.paused', lang);

        if (restBtn) restBtn.style.display = 'none'; // 暂停时不显示休息按钮
        return;
    } else {
        // 恢复正常状态
        pauseBtn.classList.remove('is-paused');
        pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; // 暂停图标
        pauseBtn.title = t('ui.pauseTooltip', lang);
    }

    // 4.6 初始化或更新重置按钮 (防止 SVG 结构丢失)
    const btnContent = resetBtn.querySelector('.btn-content');
    if (!btnContent) {
        resetBtn.innerHTML = `
            <svg class="long-press-ring" width="100%" height="100%" viewBox="0 0 44 44">
               <circle class="ring-circle" cx="22" cy="22" r="21" fill="none" stroke="currentColor" stroke-width="3" />
            </svg>
            <span class="btn-content"></span>
        `;
        return updatePetDisplay(state); // 重新执行以填充 content
    }

    // 处理重置按钮的反馈样式 (治疗/普通重置)
    if (!isShowingFeedback) {
        if (sickStartTime) {
            resetBtn.classList.add('btn-treatment');
            resetBtn.title = t('ui.resetTooltip', lang) + ' (-30 XP)';
            // 显示药丸/治疗图标
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>';
        } else {
            resetBtn.classList.remove('btn-treatment');
            resetBtn.title = t('ui.resetTooltip', lang);
            // 显示停止方形图标
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6h12v12H6z"/></svg>';
        }
    }

    // 4.7 处理休息模式 (Rest Mode) 的倒计时显示
    if (state.restStartTime) {
        const elapsedMinutes = (Date.now() - state.restStartTime) / 60000;
        const remainingMinutes = state.breakDuration - elapsedMinutes;

        if (remainingMinutes > 0) {
            petImage.src = 'icon-sleep.png';
            petImage.className = 'pet-image anim-sleep';
            petStatus.textContent = t('status.sleeping', lang);

            // 格式化 mm:ss 倒计时
            const totalSeconds = Math.max(0, Math.floor(remainingMinutes * 60));
            const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');

            petTime.textContent = `${m}:${s}`;
            // 使用等宽字体避免数字跳动
            petTime.style.fontSize = '20px';
            petTime.style.fontFamily = '"SF Mono", "Menlo", "Monaco", "Courier New", monospace';
            petTime.style.fontWeight = '600';
            petTime.style.letterSpacing = '1px';

            if (restBtn) restBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'none'; // 休息模式下隐藏控制按钮
            return;
        }
    } else {
        // 重置样式
        petTime.style.fontSize = '';
        petTime.style.fontFamily = '';
        petTime.style.fontWeight = '';
        if (pauseBtn) pauseBtn.style.display = 'flex';
    }

    // 4.8 核心状态判断逻辑 (快乐 / 焦虑 / 生病)
    const percentage = (sittingMinutes / maxWorkTime) * 100;

    if (sickStartTime) {
        // 显示"休息/治疗"按钮
        if (restBtn) {
            restBtn.style.display = 'flex';
            restBtn.title = t('ui.restTooltip', lang);
        }

        const sickDuration = Math.floor((Date.now() - sickStartTime) / 60000);
        if (sickDuration >= 60) {
            // 超过1小时 -> 灵魂升天
            petImage.src = 'icon-soul.png';
            petImage.className = 'pet-image anim-soul';
            petStatus.textContent = t('status.soul', lang);
        } else {
            // 生病中
            petImage.src = 'icon-sick.png';
            petImage.className = 'pet-image anim-sick';
            petStatus.textContent = t('status.sick', lang);
        }
    } else {
        // 健康状态
        if (restBtn) restBtn.style.display = 'none';

        if (percentage < 70) {
            petImage.src = 'icon-happy.png';
            petImage.className = 'pet-image anim-happy'; // 开心弹跳
            petStatus.textContent = t('status.happy', lang);
        } else if (percentage < 100) {
            petImage.src = 'icon-anxious.png';
            petImage.className = 'pet-image anim-anxious'; // 焦虑颤抖
            petStatus.textContent = t('status.anxious', lang);
        }
    }

    // 4.9 更新时间显示文本
    const unit = lang === 'en' ? 'm' : 'm';
    const split = lang === 'en' ? '/' : '/';
    const limit = lang === 'en' ? 'Max' : '上限';
    const sittingText = lang === 'en' ? 'Sitting' : '已久坐';

    petTime.textContent = `${sittingText} ${sittingMinutes}${unit} ${split} ${limit} ${maxWorkTime}${unit}`;

    // 4.10 纯净模式的像素进度条绘制
    if (zenMode && pixelProgressBar) {
        const totalBlocks = 20; // 进度条总格数
        const progress = Math.min(sittingMinutes / maxWorkTime, 1);
        const activeCount = Math.floor(progress * totalBlocks);

        let html = '';
        for (let i = 0; i < totalBlocks; i++) {
            let colorClass = 'green';
            if (i >= 10) colorClass = 'orange'; // 超过 50% 变橙色
            if (i >= 18) colorClass = 'red';    // 超过 90% 变红色
            const isActive = (i < activeCount) || (i === 0 && sittingMinutes > 0) ? 'active' : '';
            html += `<div class="pixel-block ${colorClass} ${isActive}"></div>`;
        }
        pixelProgressBar.innerHTML = html;
    }
}

// === 5. 状态同步与交互 ===

/**
 * 从 Background 获取最新状态并刷新 UI
 * 如果设置面板已打开，也会同步面板内的控件值
 */
async function refreshState() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getState' });
        if (response) {
            updatePetDisplay(response);

            // 同步设置面板数值 (如果面板打开)
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel && settingsPanel.style.display !== 'none') {
                document.getElementById('maxWorkTimeValue').textContent = response.maxWorkTime + 'm';
                document.getElementById('breakDurationValue').textContent = response.breakDuration + 'm';
                document.getElementById('notificationToggle').checked = response.notificationEnabled;
                document.getElementById('maxWorkTimeSlider').value = response.maxWorkTime;
                document.getElementById('breakDurationSlider').value = response.breakDuration;

                // 同步语言选择
                if (response.language) {
                    const langSelect = document.getElementById('popupLanguageSelect');
                    if (langSelect) langSelect.value = response.language;
                }
            }
        }
    } catch (error) {
        console.error('获取状态失败:', error);
    }
}

// === 6. 事件监听器 ===

// 6.1 休息按钮 (生病时显示) -> 触发"休息模式"
const restBtn = document.getElementById('restBtn');
if (restBtn) {
    restBtn.addEventListener('click', async () => {
        try {
            await chrome.runtime.sendMessage({ action: 'startRest' });
            refreshState();
        } catch (error) {
            console.error('开始休息失败:', error);
        }
    });
}

// 6.2 暂停按钮
pauseBtn.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ action: 'getState' });
    const newPausedState = !response.isPaused;
    try {
        await chrome.runtime.sendMessage({
            action: 'setPause',
            isPaused: newPausedState
        });
        refreshState();
    } catch (error) {
        console.error('切换暂停状态失败:', error);
    }
});

// 6.3 重置按钮长按逻辑 (长按 1秒 触发重置)
let pressTimer = null;
let isShowingFeedback = false;
const PRESS_DURATION = 1000;

async function executeReset() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'resetTimer' });
        isShowingFeedback = true;
        const btnContent = resetBtn.querySelector('.btn-content');

        // 根据重置结果显示不同反馈 (惩罚/成功)
        if (response && response.punished) {
            // 惩罚图标 (红色叉)
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" style="width: 24px !important; height: 24px !important; color: #FF3B30"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        } else {
            // 成功图标 (绿色勾)
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" style="width: 24px !important; height: 24px !important; color: #34C759"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        }

        setTimeout(() => {
            isShowingFeedback = false;
            refreshState();
        }, 1500);
        refreshState();
    } catch (error) {
        console.error('重置失败:', error);
        isShowingFeedback = false;
        refreshState();
    }
}

// 触摸/按下开始
function startPress(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    e.preventDefault();
    const ringCircle = resetBtn.querySelector('.ring-circle');
    resetBtn.classList.add('pressing');
    // 开始圆环动画
    if (ringCircle) {
        ringCircle.style.transition = `stroke-dashoffset ${PRESS_DURATION}ms linear`;
        ringCircle.getBoundingClientRect(); // 强制重绘
        ringCircle.style.strokeDashoffset = '0'; // 圆环闭合
    }
    pressTimer = setTimeout(() => {
        executeReset();
        endPress();
    }, PRESS_DURATION);
}

// 触摸/按下结束
function endPress() {
    clearTimeout(pressTimer);
    resetBtn.classList.remove('pressing');
    const ringCircle = resetBtn.querySelector('.ring-circle');
    // 重置圆环状态
    if (ringCircle) {
        ringCircle.style.transition = 'none';
        ringCircle.style.strokeDashoffset = '132'; // 恢复圆环缺口
    }
}

// 绑定长按相关事件
resetBtn.addEventListener('mousedown', startPress);
resetBtn.addEventListener('touchstart', startPress, { passive: false });
['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
    resetBtn.addEventListener(evt, endPress);
});

// 6.4 设置面板切换显示
const settingsPanel = document.getElementById('settingsPanel');
if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage(); // 打开完整设置页
    });
}
settingsBtn.addEventListener('click', () => {
    if (settingsPanel.style.display === 'none') {
        settingsPanel.style.display = 'block';
        refreshState(); // 每次打开时重新加载设置
    } else {
        settingsPanel.style.display = 'none';
    }
});

// 6.5 滑块值实时预览
document.getElementById('maxWorkTimeSlider').addEventListener('input', (e) => {
    document.getElementById('maxWorkTimeValue').textContent = e.target.value + 'm';
});
document.getElementById('breakDurationSlider').addEventListener('input', (e) => {
    document.getElementById('breakDurationValue').textContent = e.target.value + 'm';
});

// 6.6 语言选择预览 (立即中英切换)
document.getElementById('popupLanguageSelect').addEventListener('change', (e) => {
    const lang = e.target.value;
    updateStaticTexts(lang);
    chrome.storage.local.set({ language: lang }); // 预先保存
});

// 6.7 保存设置按钮逻辑
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const maxWorkTime = parseInt(document.getElementById('maxWorkTimeSlider').value);
    const breakDuration = parseInt(document.getElementById('breakDurationSlider').value);
    const notificationEnabled = document.getElementById('notificationToggle').checked;
    const language = document.getElementById('popupLanguageSelect').value;

    try {
        await chrome.storage.local.set({ maxWorkTime, breakDuration, notificationEnabled, language });
        // 通知后台立即更新
        await chrome.runtime.sendMessage({
            action: 'updateSettings',
            maxWorkTime, breakDuration, notificationEnabled
        });

        // 手动触发 UI 更新确保一致性
        updateStaticTexts(language);
        refreshState();

        // 显示成功提示
        const saveMessage = document.getElementById('saveMessage');
        saveMessage.style.display = 'block';
        setTimeout(() => {
            saveMessage.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('保存设置失败:', error);
    }
});

// 6.8 纯净模式 (Zen Mode) 切换
async function toggleZenMode() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getState' });
        const newZenModeState = !response.zenMode;
        await chrome.runtime.sendMessage({ action: 'setZenMode', zenMode: newZenModeState });
        refreshState();
    } catch (error) {
        console.error('切换纯净模式失败:', error);
    }
}
// 点击宠物本身也可以切换模式
petDisplay.addEventListener('click', toggleZenMode);
const zenBtn = document.getElementById('zenBtn');
if (zenBtn) {
    zenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleZenMode();
    });
}

// === 7. 启动 ===
refreshState();
setInterval(refreshState, 2000); // 轮询同步状态 (后备保障机制)

// 辅助函数：更新所有静态文本
function updateStaticTexts(lang) {
    if (currentLang === lang) return; // 避免重复更新
    currentLang = lang;

    // 翻译 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key, lang);
    });

    // 翻译 Tooltips
    if (openOptionsBtn) openOptionsBtn.title = t('ui.openSettings', lang);
    if (settingsBtn) settingsBtn.title = t('ui.settingsTooltip', lang);
    if (document.getElementById('zenBtn')) document.getElementById('zenBtn').title = t('ui.zenTooltip', lang);

    // 更新标题 (如果需要)
    const titleEl = document.querySelector('h1');
    if (titleEl) {
        // 可选：如果是 "NekoRest" 这种品牌名可能不需要翻译，或者也在 locales 里
        titleEl.textContent = t('appName', lang).split(' - ')[0];
    }
}


// 显示浮动 XP 动画
function createBubble(amount, delay = 0) {
    setTimeout(() => {
        const floater = document.createElement('div');
        floater.className = `xp-floater ${amount > 0 ? 'gain' : 'loss'}`;
        floater.textContent = amount > 0 ? `+${amount}` : amount;

        const side = Math.random() > 0.5 ? 1 : -1;
        const offset = 60 + Math.random() * 50;
        const randomX = side * offset;
        const randomY = Math.random() * 40 - 20;

        floater.style.left = '50%';
        floater.style.top = '50%';
        floater.style.marginLeft = `${randomX}px`;
        floater.style.marginTop = `${randomY}px`;

        const duration = 3 + Math.random() * 2;
        floater.style.animationDuration = `${duration}s, 3s`;

        petDisplay.appendChild(floater);

        setTimeout(() => {
            floater.remove();
        }, duration * 1000);
    }, delay);
}

function showFloatingXP(amount) {
    if (amount === 0) return;
    createBubble(amount, 0);
    createBubble(amount, 800);
    createBubble(amount, 2200);
}

// 更新宠物状态显示
function updatePetDisplay(state) {
    const { sittingMinutes, maxWorkTime, isPaused, sickStartTime, zenMode, levelInfo, xp, language } = state;

    // 更新语言环境
    const lang = language || 'zh';
    updateStaticTexts(lang);

    // XP 变化检测
    if (xp !== undefined && lastXP !== null) {
        const xpDiff = xp - lastXP;
        if (xpDiff !== 0 && !isNaN(xpDiff)) {
            showFloatingXP(xpDiff);
        }
    }
    lastXP = xp;

    // 更新等级显示
    if (levelInfo && petLevelText) {
        const levelLabel = lang === 'en' ? 'Lv.' : 'Lv.';
        const maxLabel = lang === 'en' ? 'Max' : '满级';

        // 翻译等级标题
        const title = t(levelInfo.titleKey, lang);

        if (levelInfo.nextLevelXp) {
            petLevelText.textContent = `${title} (${levelLabel}${levelInfo.level}) - ${levelInfo.currentLevelXp}/${levelInfo.nextLevelXp} XP`;
        } else {
            petLevelText.textContent = `${title} (${levelLabel}${levelInfo.level}) - ${maxLabel}`;
        }
    }

    // 纯净模式
    if (zenMode) {
        document.body.classList.add('zen-mode');
    } else {
        document.body.classList.remove('zen-mode');
    }

    // 更新暂停按钮状态
    if (isPaused) {
        pauseBtn.classList.add('is-paused');
        pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>';
        pauseBtn.title = t('ui.resumeTooltip', lang);

        petImage.src = 'icon-sleep.png';
        petImage.className = 'pet-image anim-sleep';
        petStatus.textContent = t('status.restPaused', lang);
        petTime.textContent = t('status.paused', lang);

        // 隐藏/显示处理
        if (restBtn) restBtn.style.display = 'none';

        return;
    } else {
        pauseBtn.classList.remove('is-paused');
        pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        pauseBtn.title = t('ui.pauseTooltip', lang);
    }

    // 更新重置按钮
    const btnContent = resetBtn.querySelector('.btn-content');
    if (!btnContent) {
        resetBtn.innerHTML = `
            <svg class="long-press-ring" width="100%" height="100%" viewBox="0 0 44 44">
               <circle class="ring-circle" cx="22" cy="22" r="21" fill="none" stroke="currentColor" stroke-width="3" />
            </svg>
            <span class="btn-content"></span>
        `;
        return updatePetDisplay(state);
    }

    if (!isShowingFeedback) {
        if (sickStartTime) {
            resetBtn.classList.add('btn-treatment');
            resetBtn.title = t('ui.resetTooltip', lang) + ' (-30 XP)'; // 简单处理，或者添加专门的 treatmentTooltip
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>';
        } else {
            resetBtn.classList.remove('btn-treatment');
            resetBtn.title = t('ui.resetTooltip', lang);
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6h12v12H6z"/></svg>';
        }
    }

    // 休息模式
    if (state.restStartTime) {
        const elapsedMinutes = (Date.now() - state.restStartTime) / 60000;
        const remainingMinutes = state.breakDuration - elapsedMinutes;

        if (remainingMinutes > 0) {
            petImage.src = 'icon-sleep.png';
            petImage.className = 'pet-image anim-sleep';
            petStatus.textContent = t('status.sleeping', lang);

            const totalSeconds = Math.max(0, Math.floor(remainingMinutes * 60));
            const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');

            petTime.textContent = `${m}:${s}`;
            petTime.style.fontSize = '20px';
            petTime.style.fontFamily = '"SF Mono", "Menlo", "Monaco", "Courier New", monospace';
            petTime.style.fontWeight = '600';
            petTime.style.letterSpacing = '1px';

            if (restBtn) restBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'none';
            return;
        }
    } else {
        petTime.style.fontSize = '';
        petTime.style.fontFamily = '';
        petTime.style.fontWeight = '';
        if (pauseBtn) pauseBtn.style.display = 'flex';
    }

    // 计算状态
    const percentage = (sittingMinutes / maxWorkTime) * 100;

    if (sickStartTime) {
        if (restBtn) {
            restBtn.style.display = 'flex';
            restBtn.title = t('ui.restTooltip', lang);
        }

        const sickDuration = Math.floor((Date.now() - sickStartTime) / 60000);
        if (sickDuration >= 60) {
            petImage.src = 'icon-soul.png';
            petImage.className = 'pet-image anim-soul';
            petStatus.textContent = t('status.soul', lang);
        } else {
            petImage.src = 'icon-sick.png';
            petImage.className = 'pet-image anim-sick';
            petStatus.textContent = t('status.sick', lang);
        }
    } else {
        if (restBtn) restBtn.style.display = 'none';

        if (percentage < 70) {
            petImage.src = 'icon-happy.png';
            petImage.className = 'pet-image anim-happy';
            petStatus.textContent = t('status.happy', lang);
        } else if (percentage < 100) {
            petImage.src = 'icon-anxious.png';
            petImage.className = 'pet-image anim-anxious';
            petStatus.textContent = t('status.anxious', lang);
        }
    }

    // 时间显示 (需要支持多语言格式)
    // 简单起见，这里直接由 JS 拼接
    const unit = lang === 'en' ? 'm' : 'm'; // 保持 m 单位
    const split = lang === 'en' ? '/' : '/';
    const limit = lang === 'en' ? 'Max' : '上限';
    // "Sitting"
    const sittingText = lang === 'en' ? 'Sitting' : '已久坐';

    petTime.textContent = `${sittingText} ${sittingMinutes}${unit} ${split} ${limit} ${maxWorkTime}${unit}`;

    // Zen Mode 进度条
    if (zenMode && pixelProgressBar) {
        const totalBlocks = 20;
        const progress = Math.min(sittingMinutes / maxWorkTime, 1);
        const activeCount = Math.floor(progress * totalBlocks);

        let html = '';
        for (let i = 0; i < totalBlocks; i++) {
            let colorClass = 'green';
            if (i >= 10) colorClass = 'orange';
            if (i >= 18) colorClass = 'red';
            const isActive = (i < activeCount) || (i === 0 && sittingMinutes > 0) ? 'active' : '';
            html += `<div class="pixel-block ${colorClass} ${isActive}"></div>`;
        }
        pixelProgressBar.innerHTML = html;
    }
}

// 从后台获取状态
async function refreshState() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getState' });
        if (response) {
            updatePetDisplay(response);

            // 同步设置面板数值 (如果面板打开)
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel && settingsPanel.style.display !== 'none') {
                document.getElementById('maxWorkTimeValue').textContent = response.maxWorkTime + 'm';
                document.getElementById('breakDurationValue').textContent = response.breakDuration + 'm';
                document.getElementById('notificationToggle').checked = response.notificationEnabled;
                document.getElementById('maxWorkTimeSlider').value = response.maxWorkTime;
                document.getElementById('breakDurationSlider').value = response.breakDuration;

                // 同步语言选择
                if (response.language) {
                    const langSelect = document.getElementById('popupLanguageSelect');
                    if (langSelect) langSelect.value = response.language;
                }
            }
        }
    } catch (error) {
        console.error('获取状态失败:', error);
    }
}

// 休息按钮
const restBtn = document.getElementById('restBtn');
if (restBtn) {
    restBtn.addEventListener('click', async () => {
        try {
            await chrome.runtime.sendMessage({ action: 'startRest' });
            refreshState();
        } catch (error) {
            console.error('开始休息失败:', error);
        }
    });
}

// 暂停按钮
pauseBtn.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ action: 'getState' });
    const newPausedState = !response.isPaused;
    try {
        await chrome.runtime.sendMessage({
            action: 'setPause',
            isPaused: newPausedState
        });
        refreshState();
    } catch (error) {
        console.error('切换暂停状态失败:', error);
    }
});

// 重置按钮长按
let pressTimer = null;
let isShowingFeedback = false;
const PRESS_DURATION = 1000;

async function executeReset() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'resetTimer' });
        isShowingFeedback = true;
        const btnContent = resetBtn.querySelector('.btn-content');

        if (response && response.punished) {
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" style="width: 24px !important; height: 24px !important; color: #FF3B30"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        } else {
            btnContent.innerHTML = '<svg viewBox="0 0 24 24" style="width: 24px !important; height: 24px !important; color: #34C759"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
        }

        setTimeout(() => {
            isShowingFeedback = false;
            refreshState();
        }, 1500);
        refreshState();
    } catch (error) {
        console.error('重置失败:', error);
        isShowingFeedback = false;
        refreshState();
    }
}

function startPress(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    e.preventDefault();
    const ringCircle = resetBtn.querySelector('.ring-circle');
    resetBtn.classList.add('pressing');
    if (ringCircle) {
        ringCircle.style.transition = `stroke-dashoffset ${PRESS_DURATION}ms linear`;
        ringCircle.getBoundingClientRect();
        ringCircle.style.strokeDashoffset = '0';
    }
    pressTimer = setTimeout(() => {
        executeReset();
        endPress();
    }, PRESS_DURATION);
}

function endPress() {
    clearTimeout(pressTimer);
    resetBtn.classList.remove('pressing');
    const ringCircle = resetBtn.querySelector('.ring-circle');
    if (ringCircle) {
        ringCircle.style.transition = 'none';
        ringCircle.style.strokeDashoffset = '132';
    }
}

resetBtn.addEventListener('mousedown', startPress);
resetBtn.addEventListener('touchstart', startPress, { passive: false });
['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
    resetBtn.addEventListener(evt, endPress);
});

// 设置面板切换
const settingsPanel = document.getElementById('settingsPanel');
if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
}
settingsBtn.addEventListener('click', () => {
    if (settingsPanel.style.display === 'none') {
        settingsPanel.style.display = 'block';
        refreshState(); // 加载设置
    } else {
        settingsPanel.style.display = 'none';
        // 关闭时保存也行，但有专门的保存按钮
    }
});

// 滑块监听
document.getElementById('maxWorkTimeSlider').addEventListener('input', (e) => {
    document.getElementById('maxWorkTimeValue').textContent = e.target.value + 'm';
});
document.getElementById('breakDurationSlider').addEventListener('input', (e) => {
    document.getElementById('breakDurationValue').textContent = e.target.value + 'm';
});

// 语言选择预览 (立即生效)
document.getElementById('popupLanguageSelect').addEventListener('change', (e) => {
    const lang = e.target.value;
    updateStaticTexts(lang);
    // 可选：同时也更新 state 中的语言，以便立刻预览效果
    chrome.storage.local.set({ language: lang }); // 预先保存，虽然点击保存按钮也会保存
});

// 保存设置
document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const maxWorkTime = parseInt(document.getElementById('maxWorkTimeSlider').value);
    const breakDuration = parseInt(document.getElementById('breakDurationSlider').value);
    const notificationEnabled = document.getElementById('notificationToggle').checked;
    const language = document.getElementById('popupLanguageSelect').value;

    try {
        await chrome.storage.local.set({ maxWorkTime, breakDuration, notificationEnabled, language });
        await chrome.runtime.sendMessage({
            action: 'updateSettings',
            maxWorkTime, breakDuration, notificationEnabled
            // language 会通过 storage listener 自动更新
        });

        // 手动触发 UI 更新确保一致性
        updateStaticTexts(language);
        refreshState();

        const saveMessage = document.getElementById('saveMessage');
        saveMessage.style.display = 'block';
        setTimeout(() => {
            saveMessage.style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('保存设置失败:', error);
    }
});

// 纯净模式
async function toggleZenMode() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getState' });
        const newZenModeState = !response.zenMode;
        await chrome.runtime.sendMessage({ action: 'setZenMode', zenMode: newZenModeState });
        refreshState();
    } catch (error) {
        console.error('切换纯净模式失败:', error);
    }
}
petDisplay.addEventListener('click', toggleZenMode);
const zenBtn = document.getElementById('zenBtn');
if (zenBtn) {
    zenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleZenMode();
    });
}

// 初始加载
refreshState();
setInterval(refreshState, 2000);

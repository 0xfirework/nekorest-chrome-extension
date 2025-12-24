importScripts('locales.js');
// NekoRest Background Service Worker
// 核心后台服务：负责久坐检测、状态管理、XP系统逻辑及系统通知发送
// 即使弹窗关闭，此脚本也会在后台持续运行（受 Chrome 生命周期管理）

// === 1. 默认配置与状态定义 ===
const DEFAULT_CONFIG = {
  maxWorkTime: 45,       // 工作时长阈值（分钟）
  breakDuration: 5,      // 休息时长阈值（分钟）
  isPaused: false,       // 是否手动暂停
  sittingMinutes: 0,     // 当前连续久坐分钟数
  lastUpdateTime: Date.now(), // 上次活跃时间戳
  notificationSent: false,    // 是否已发送首次提醒
  secondNotificationSent: false, // 是否已发送第二次紧急提醒
  sickStartTime: null,   // 生病状态开始时间戳（用于计算生病时长）
  notificationEnabled: true,  // 全局通知开关
  xp: 0,                 // 用户积累的经验值
  lastLoginDate: null,   // 上次登录日期（用于每日签到）
  restStartTime: null,   // 休息模式开始时间戳
  zenMode: false,        // 纯净模式开关
  language: 'zh'         // 语言设置 (zh: 中文, en: 英文)
};

// 等级系统配置表
// 定义了每一级所需的总经验值及对应的多语言标题 Key
const LEVEL_SYSTEM = [
  { level: 1, xp: 0, titleKey: "levels.l1" },    // 幼崽猫 / Egg Cat
  { level: 2, xp: 50, titleKey: "levels.l2" },   // 学步猫 / Baby Cat
  { level: 3, xp: 150, titleKey: "levels.l3" },  // 好奇猫 / Curious Cat
  { level: 4, xp: 350, titleKey: "levels.l4" },  // 探险猫 / Adventure Cat
  { level: 5, xp: 700, titleKey: "levels.l5" },  // 猎手猫 / Hunter Cat
  { level: 6, xp: 1200, titleKey: "levels.l6" }, // 守护猫 / Guardian Cat
  { level: 7, xp: 1800, titleKey: "levels.l7" }, // 猫咪领主 / Cat Lord
  { level: 8, xp: 2500, titleKey: "levels.l8" }, // 传说之猫 / Legendary Cat
  { level: 9, xp: 3500, titleKey: "levels.l9" }  // 猫神 / Cat God
];

// 运行时状态对象，初始化为默认配置
let state = { ...DEFAULT_CONFIG };

// === 2. 辅助函数 ===

/**
 * 根据当前 XP 计算等级信息
 * @param {number} xp - 当前经验值
 * @returns {Object} 等级信息对象 (当前等级, 标题 Key, 下一级所需 XP, 进度百分比)
 */
function getLevelInfo(xp) {
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_SYSTEM[i].xp) {
      const current = LEVEL_SYSTEM[i];
      const next = LEVEL_SYSTEM[i + 1];
      return {
        level: current.level,
        titleKey: current.titleKey,
        currentLevelXp: current.xp,
        nextLevelXp: next ? next.xp : null, // 满级为 null
        progress: next ? Math.floor(((xp - current.xp) / (next.xp - current.xp)) * 100) : 100
      };
    }
  }
  return LEVEL_SYSTEM[0];
}

/**
 * 更新经验值 (XP)
 * 处理升级逻辑、发送升级通知并保存状态
 * @param {number} amount - 经验值变化量 (正数增加，负数减少)
 */
async function updateXP(amount) {
  const oldLevel = getLevelInfo(state.xp).level;
  state.xp = Math.max(0, state.xp + amount); // 保证 XP 不为负数
  const newLevelInfo = getLevelInfo(state.xp);

  if (amount > 0) {

  }

  // 检测是否升级
  if (newLevelInfo.level > oldLevel) {


    // 只在开启通知时发送系统通知
    const { notificationEnabled } = await chrome.storage.local.get(['notificationEnabled']);
    if (notificationEnabled !== false) {
      const title = t(newLevelInfo.titleKey, state.language);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: state.language === 'en' ? '🎉 Level Up!' : '🎉 升级啦！',
        message: state.language === 'en' ?
          `Congrats! Your pet evolved into ${title}` :
          `恭喜！您的猫咪进化为 ${title}`,
        priority: 2
      });
    }
  }

  saveState();
  // 广播 XP 更新事件，以便 Popup 界面实时刷新
  chrome.runtime.sendMessage({ action: 'xpUpdated', state: state }).catch(() => { });
}

/**
 * 每日签到奖励检测
 * 每天首次启动插件时给予 20 XP 奖励
 */
function checkDailyReward() {
  const today = new Date().toDateString();
  if (state.lastLoginDate !== today) {
    updateXP(20); // 每日首次启动 +20 XP
    state.lastLoginDate = today;
    saveState();
  }
}

// === 3. 状态持久化与初始化 ===

/**
 * 初始化状态
 * 从 chrome.storage.local 读取数据，若无数据则使用默认配置
 */
async function initializeState() {
  try {
    const stored = await chrome.storage.local.get([
      'maxWorkTime', 'breakDuration', 'isPaused',
      'sittingMinutes', 'lastUpdateTime', 'notificationSent', 'secondNotificationSent', 'sickStartTime', 'notificationEnabled',
      'xp', 'lastLoginDate', 'zenMode', 'restStartTime', 'language'
    ]);

    // 合并存储状态与默认配置，确保新字段有默认值
    state = {
      maxWorkTime: stored.maxWorkTime ?? DEFAULT_CONFIG.maxWorkTime,
      breakDuration: stored.breakDuration ?? DEFAULT_CONFIG.breakDuration,
      isPaused: stored.isPaused ?? DEFAULT_CONFIG.isPaused,
      sittingMinutes: stored.sittingMinutes ?? DEFAULT_CONFIG.sittingMinutes,
      lastUpdateTime: stored.lastUpdateTime ?? DEFAULT_CONFIG.lastUpdateTime,
      notificationSent: stored.notificationSent ?? DEFAULT_CONFIG.notificationSent,
      secondNotificationSent: stored.secondNotificationSent ?? DEFAULT_CONFIG.secondNotificationSent,
      sickStartTime: stored.sickStartTime ?? DEFAULT_CONFIG.sickStartTime,
      notificationEnabled: stored.notificationEnabled ?? DEFAULT_CONFIG.notificationEnabled,
      zenMode: stored.zenMode ?? DEFAULT_CONFIG.zenMode,
      xp: stored.xp ?? DEFAULT_CONFIG.xp,
      lastLoginDate: stored.lastLoginDate ?? DEFAULT_CONFIG.lastLoginDate,
      restStartTime: stored.restStartTime ?? DEFAULT_CONFIG.restStartTime,
      language: stored.language ?? DEFAULT_CONFIG.language
    };


    checkDailyReward(); // 检查每日奖励
    updateBadge();      // 更新图标徽标 (目前为空函数，预留)
    updateTooltip(state); // 初始化悬停提示
  } catch (error) {
    console.error('初始化状态失败，使用默认值:', error);
    state = { ...DEFAULT_CONFIG };
  }
}

/**
 * 保存当前状态到 chrome.storage.local
 */
async function saveState() {
  try {
    await chrome.storage.local.set({
      sittingMinutes: state.sittingMinutes,
      lastUpdateTime: state.lastUpdateTime,
      notificationSent: state.notificationSent,
      secondNotificationSent: state.secondNotificationSent,
      sickStartTime: state.sickStartTime,
      zenMode: state.zenMode,
      xp: state.xp,
      lastLoginDate: state.lastLoginDate,
      restStartTime: state.restStartTime,
      language: state.language
    });
  } catch (error) {
    console.error('保存状态失败:', error);
  }
}

/**
 * 更新扩展图标的 Badge (暂未使用)
 * 设计决定保持界面极简，不显示红点数字
 */
function updateBadge() {
  // 不再动态切换图标，仅保留函数结构以备未来扩展
}

/**
 * 更新扩展图标的 Tooltip (鼠标悬停提示)
 * 根据当前状态 (休息/生病/快乐/焦虑) 动态生成提示文本
 */
function updateTooltip(currentState) {
  const { sittingMinutes, maxWorkTime, isPaused, sickStartTime, xp, language } = currentState;
  const levelInfo = getLevelInfo(xp || 0);
  const titleText = t(levelInfo.titleKey, language);
  let title = '';

  const lang = language || 'zh';
  const statusPrefix = lang === 'en' ? 'Status: ' : '状态：';
  const sittingText = lang === 'en' ? 'Sitting: ' : '已久坐：';
  const limitText = lang === 'en' ? ' / Max ' : ' / 上限 ';
  const unit = lang === 'en' ? 'm' : 'm';

  // 1. 暂停/休息状态
  if (isPaused) {
    const restText = lang === 'en' ? '💤 Resting...\nTimer Paused' : '💤 休息中...\n已暂停计时';
    title = `${statusPrefix}${restText}\n${titleText} (Lv.${levelInfo.level})`;
  }
  // 2. 生病状态
  else if (sickStartTime) {
    const sickDuration = Math.floor((Date.now() - sickStartTime) / 60000);
    let sickStatus = '';
    // 生病超过 1 小时 -> 灵魂升天
    if (sickDuration >= 60) {
      sickStatus = lang === 'en' ? '👻 Ascending...' : '👻 灵魂升天...';
    } else {
      sickStatus = lang === 'en' ? '🤒 Sick!' : '🤒 生病了！';
    }
    title = `${statusPrefix}${sickStatus}\n${sittingText}${sittingMinutes}${unit}${limitText}${maxWorkTime}${unit}\n${titleText} (Lv.${levelInfo.level})`;
  }
  // 3. 正常状态 (快乐/焦虑)
  else {
    const percentage = (sittingMinutes / maxWorkTime) * 100;
    let mood = lang === 'en' ? '🐱 Happy' : '🐱 开心';
    // 超过 70% 时间 -> 焦虑
    if (percentage >= 70) mood = lang === 'en' ? '😿 Anxious' : '😿 有点不安';

    title = `${statusPrefix}${mood}\n${sittingText}${sittingMinutes}${unit}${limitText}${maxWorkTime}${unit}\n${titleText} (Lv.${levelInfo.level})`;
  }

  // 设置浏览器图标悬停文字
  chrome.action.setTitle({ title: title });
}

// === 4. 核心业务逻辑 ===

/**
 * 核心检测循环 (每 10 秒执行一次)
 * 结合 chrome.idle API 判断用户是否活跃，并更新久坐时长
 */
async function checkIdleState() {
  try {
    // --- 场景 A: 休息模式 (Rest Mode) ---
    // 如果处于休息模式，计算休息时长，不进行久坐累计
    if (state.restStartTime) {
      const elapsedMinutes = (Date.now() - state.restStartTime) / 60000;

      // 检查是否完成休息目标
      if (elapsedMinutes >= state.breakDuration) {

        // 休息完成 -> 痊愈并重置所有状态
        state.sittingMinutes = 0;
        state.sickStartTime = null;
        state.notificationSent = false;
        state.secondNotificationSent = false;
        state.restStartTime = null;
        state.isPaused = false; // 自动恢复计时

        // 给予休息奖励
        updateXP(20);

        // 发送休息结束通知
        if (state.notificationEnabled) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon-happy.png',
            title: t('notification.restTitle', state.language),
            message: t('notification.restMessage', state.language),
            priority: 2
          });
        }
        saveState();
        updateBadge();
      }
      return; // 休息模式下直接返回
    }

    // --- 场景 B: 正常工作监测 ---
    // 获取用户 60秒 内的活跃状态
    const idleState = await chrome.idle.queryState(60);
    //  Debug info removed for cleaner production code

    if (idleState === 'active') {
      // 用户活跃且未暂停
      if (!state.isPaused) {
        state.tickCount = (state.tickCount || 0) + 1;
        state.lastUpdateTime = Date.now();

        // --- ⚡️ 高频反馈 (每10秒触发) ---

        // 机制 1: 专注奖励 (健康工作时，每10秒 +1 XP)
        if (state.sittingMinutes < state.maxWorkTime) {
          updateXP(1);
        }

        // 机制 2: 生病惩罚 (生病时，每10秒 -1 XP)
        if (state.sittingMinutes >= state.maxWorkTime) {
          updateXP(-1);
        }

        // --- ⏱️ 分钟级逻辑 (每 6 个 tick = 60秒 触发一次) ---
        if (state.tickCount % 6 === 0) {
          state.sittingMinutes += 1;

          // 检查是否达到生病状态
          if (state.sittingMinutes >= state.maxWorkTime) {

            // 首次进入生病状态处理
            if (!state.sickStartTime) {
              state.sickStartTime = Date.now();
              updateXP(-50); // 生病瞬间惩罚 -50 XP
            }

            const sickDuration = Math.floor((Date.now() - state.sickStartTime) / 60000);

            // 机制 3: 幽灵状态大额扣分 (每生病 5 分钟额外 -100 XP)
            if (sickDuration >= 60) {
              if ((sickDuration - 60) % 5 === 0) {

                updateXP(-100);
              }
            }

            // 发送第一次通知 (刚生病时)
            if (!state.notificationSent) {
              sendNotification();
              state.notificationSent = true;
            }

            // 发送第二次紧急通知 (生病 50 分钟后)
            if (state.sickStartTime && !state.secondNotificationSent) {
              if (sickDuration >= 50) {
                sendUrgentNotification();
                state.secondNotificationSent = true;
              }
            }
          }
        }

        await saveState();
        updateBadge();
        updateTooltip(state);
      }
    } else if (idleState === 'idle' || idleState === 'locked') {
      // --- 场景 C: 用户离开或锁屏 ---
      // 计算离开时长
      const idleMinutes = Math.floor((Date.now() - state.lastUpdateTime) / 60000);

      // 如果离开时间超过设定的休息阈值，视为自然休息完成 -> 自动重置
      if (idleMinutes >= state.breakDuration) {


        // 只有当之前有久坐积累时才给予奖励 (防止反复挂机刷分)
        if (state.sittingMinutes > 0) {
          updateXP(10); // 自然休息奖励 +10 XP
        }

        state.sittingMinutes = 0;
        state.notificationSent = false;
        state.secondNotificationSent = false;
        state.sickStartTime = null;
        await saveState();
        updateBadge();
        updateTooltip(state);
      }
    }
  } catch (error) {
    console.error('检测状态出错:', error);
  }
}

/**
 * 发送久坐提醒通知
 */
function sendNotification() {
  if (!state.notificationEnabled) return;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon-soul.png', // 使用稍显严重的图标
    title: t('notification.urgentTitle', state.language),
    message: t('notification.urgentMessage', state.language),
    priority: 2,
    requireInteraction: true // 要求用户手动关闭，防止错过
  });
}

/**
 * 发送第二次紧急提醒通知
 */
function sendUrgentNotification() {
  if (!state.notificationEnabled) return;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: state.language === 'en' ? '😿 Owner, please move...' : '😿 主人再不动我真的要走了…',
    message: state.language === 'en' ? 'I\'ve been waiting for too long!' : '已经很久没活动了，快起来救救我吧！',
    priority: 2
  });
}

// === 5. 消息通信 ===

// 监听来自 popup.js 和 options.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // A. 获取当前状态
  if (request.action === 'getState') {
    const levelInfo = getLevelInfo(state.xp || 0);
    sendResponse({ ...state, levelInfo });
  }
  // B. 设置暂停/继续
  else if (request.action === 'setPause') {
    state.isPaused = request.isPaused;
    chrome.storage.local.set({ isPaused: state.isPaused });
    updateBadge();
    updateTooltip(state);
    sendResponse({ success: true });
  }
  // C. 手动重置计时器
  else if (request.action === 'resetTimer') {
    let result = { success: true };

    // 惩罚机制: 生病状态下手动重置 ("开挂") 会扣分
    if (state.sickStartTime) {
      updateXP(-30);
      result.punished = true;
      result.xpChange = -30;
    }

    state.sittingMinutes = 0;
    state.notificationSent = false;
    state.secondNotificationSent = false;
    state.sickStartTime = null;
    state.lastUpdateTime = Date.now();
    saveState();
    updateBadge();
    updateTooltip(state);
    sendResponse(result);
  }
  // D. 开启休息模式
  else if (request.action === 'startRest') {
    state.restStartTime = Date.now();
    state.isPaused = true; // 休息自动暂停计时
    saveState();
    updateTooltip(state);
    sendResponse({ success: true });
  }
  // E. 停止休息模式
  else if (request.action === 'stopRest') {
    state.restStartTime = null;
    state.isPaused = true; // 停止后保持暂停，等待用户手动继续
    saveState();
    updateTooltip(state);
    sendResponse({ success: true });
  }
  // F. 更新配置 (从设置页)
  else if (request.action === 'updateSettings') {
    state.maxWorkTime = request.maxWorkTime;
    state.breakDuration = request.breakDuration;
    if (request.notificationEnabled !== undefined) {
      state.notificationEnabled = request.notificationEnabled;
    }
    // 注意: language 通过 storage listener 自动同步，这里不需要显式处理
    sendResponse({ success: true });
  }
  // G. 切换纯净模式
  else if (request.action === 'setZenMode') {
    state.zenMode = request.zenMode;
    saveState();
    sendResponse({ success: true });
  }
  return true; // 保持消息通道开启，支持异步响应
});

// 监听配置变更 (如 settings 修改)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.maxWorkTime) state.maxWorkTime = changes.maxWorkTime.newValue;
    if (changes.breakDuration) state.breakDuration = changes.breakDuration.newValue;
    if (changes.notificationEnabled) state.notificationEnabled = changes.notificationEnabled.newValue;
    if (changes.zenMode) state.zenMode = changes.zenMode.newValue;
    if (changes.language) state.language = changes.language.newValue; // 语言变更实时生效

  }
});

// === 6. 生命周期钩子 ===

// 首次安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 安装成功后自动打开设置页引导用户
    chrome.runtime.openOptionsPage();
  }
  initializeState();
});

// 启动定时器
// Service Worker 可能由事件唤醒，这里确保状态加载和定时器运行
initializeState();
// Chrome 限制 Service Worker 的生命周期，但 setInterval 在活跃期间有效
// 实际生产中可能需要配合 chrome.alarms，但对于简单计时类扩展，只要 popup 活跃或有事件，Worker 就会运行
setInterval(checkIdleState, 10 * 1000);


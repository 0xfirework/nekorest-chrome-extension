const TRANSLATIONS = {
    zh: {
        appName: "NekoRest - 猫咪久坐提醒助手",
        status: {
            happy: "状态良好",
            anxious: "有点不安",
            sick: "生病了！",
            soul: "灵魂升天...",
            sleeping: "补觉中... 💤",
            restPaused: "休息中...",
            paused: "计时已暂停"
        },
        notification: {
            firstTitle: "🐱 喵~",
            firstMessage: "陪我起来走走吧！已经 {maxWorkTime} 分钟没活动了",
            urgentTitle: "😿 救救我...",
            urgentMessage: "再不动我真的要走了... 已经很久没活动了！",
            restTitle: "✨ 精力恢复！",
            restMessage: "休息结束，我又充满活力啦！"
        },
        ui: {
            resetTooltip: "重置状态",
            pauseTooltip: "暂停计时",
            resumeTooltip: "继续计时",
            restTooltip: "休息一下",
            zenTooltip: "纯净模式",
            settingsTooltip: "完整设置",
            openSettings: "打开完整设置页"
        },
        options: {
            title: "⚙️ NekoRest 设置",
            subtitle: "调整你的久坐提醒参数",
            success: "✅ 设置已保存！",
            languageLabel: "🌍 语言设置 (Language)",
            workTimeLabel: "🕐 工作时长阈值",
            workTimeDesc: "（超过此时长宠物会生病）",
            breakTimeLabel: "☕ 休息时长阈值",
            breakTimeDesc: "（休息多久后重置计时器）",
            notificationLabel: "🔔 通知提醒",
            notificationDesc: "（允许发送系统通知）",
            saveBtn: "💾 保存设置",
            infoTitle: "📖 状态说明 (Status Guide)",
            statusTips: [
                "久坐时宠物会生病，这是提醒你该休息啦",
                "离开电脑（锁屏/空闲）后，计时会自动重置",
                "你可以随时点击咖啡杯进入休息模式"
            ],
            recommend: "✨ 推荐设置：工作 45 分钟，休息 5 分钟"
        },
        levels: {
            l1: "🥚 幼崽猫",
            l2: "🍼 学步猫",
            l3: "🎒 求学猫",
            l4: "🧢 打工猫",
            l5: "👔 经理猫",
            l6: "🎩 老板猫",
            l7: "🧘 禅师猫",
            l8: "😇 天使猫",
            l9: "👑 喵神"
        }
    },
    en: {
        appName: "NekoRest - Cat Assistant",
        status: {
            happy: "Feeling Great!",
            anxious: "Kinda Anxious",
            sick: "I'm Sick...",
            soul: "Ascending... 👻",
            sleeping: "Napping... 💤",
            restPaused: "Resting...",
            paused: "Paused"
        },
        notification: {
            firstTitle: "🐱 Meow!",
            firstMessage: "Let's stretch legs! {maxWorkTime} mins passed!",
            urgentTitle: "😿 Help me...",
            urgentMessage: "I'm fading away... Please stand up and save me!",
            restTitle: "✨ Energy Restored!",
            restMessage: "All better now! Ready to crush it?"
        },
        ui: {
            resetTooltip: "Reset Timer",
            pauseTooltip: "Pause Timer",
            resumeTooltip: "Resume Timer",
            restTooltip: "Take a Break",
            zenTooltip: "Zen Mode",
            settingsTooltip: "Settings",
            openSettings: "Open Settings"
        },
        options: {
            title: "⚙️ NekoRest Settings",
            subtitle: "Customize your focus timer",
            success: "✅ Saved!",
            languageLabel: "🌍 Language",
            workTimeLabel: "🕐 Focus Duration",
            workTimeDesc: "(Pet gets sick after this)",
            breakTimeLabel: "☕ Break Duration",
            breakTimeDesc: "(Auto-reset after idling this long)",
            notificationLabel: "🔔 Notifications",
            notificationDesc: "(Enable system alerts)",
            saveBtn: "💾 Save Changes",
            infoTitle: "📖 Status Guide",
            statusTips: [
                "Pet gets sick when you sit too long. Time to move!",
                "Timer resets automatically when you leave your PC.",
                "Click the coffee cup to take a structured break."
            ],
            recommend: "✨ Pro Tip: 45m Focus + 5m Break (Pomodoro)"
        },
        levels: {
            l1: "🥚 Egg Cat",
            l2: "🍼 Toddler Cat",
            l3: "🎒 Student Cat",
            l4: "🧢 Worker Cat",
            l5: "👔 Manager Cat",
            l6: "🎩 Boss Cat",
            l7: "🧘 Zen Cat",
            l8: "😇 Angel Cat",
            l9: "👑 God Cat"
        }
    }
};

// Helper function to get text
function t(key, lang = 'zh', params = {}) {
    const keys = key.split('.');
    let value = TRANSLATIONS[lang];

    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key; // Fallback to key if not found
        }
    }

    // Replace params like {time}
    if (typeof value === 'string') {
        Object.keys(params).forEach(param => {
            value = value.replace(`{${param}}`, params[param]);
        });
    }

    return value;
}

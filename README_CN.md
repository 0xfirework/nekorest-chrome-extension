# NekoRest - 猫咪久坐提醒助手

![Version](https://img.shields.io/badge/version-1.0.6-blue) ![Chrome](https://img.shields.io/badge/platform-Chrome%20Extension-green) ![License](https://img.shields.io/badge/license-MIT-orange)

[English](./README.md) | 中文文档

## 🐱 简介 (Introduction)

**NekoRest** 是一款运行在 Chrome 浏览器上的像素风电子宠物插件。

它不仅仅是一个番茄钟，更是一只有生命的猫咪。当你专注工作时，猫咪会开心地陪伴你；但如果你连续久坐太久，猫咪会生病、甚至"灵魂出窍"来抗议！

用最可爱的方式，提醒你关注健康。

![Demo](demo.png) ![Rest Mode](rest_mode_demo.png)

## ✨ 核心功能 (Features)

*   **🧘 智能久坐监测**：
    *   利用 Chrome Idle API 智能判断你的活跃状态。
    *   **自动重置**：当你离开电脑（锁屏或离开）超过设定时长（默认 5 分钟），计时器自动重置。
    *   无需手动操作，一切都在后台默默守护。
*   **🎮 RPG 养成系统**：
    *   **XP 升级**：健康工作每 10 分钟获得经验值，达成休息目标也有奖励。
    *   **猫咪进化**：从"幼崽猫"一路进化到"猫神"，解锁 9 个不同等级称号。
    *   **生病惩罚**：久坐超时会扣除经验值，"开挂"（强制重置）也会受到惩罚！
*   **🎨 丰富的状态反馈**：
    *   **开心 (Happy)**：工作时间在安全范围内。
    *   **焦虑 (Anxious)**：接近久坐阈值 (70%)。
    *   **生病 (Sick)**：久坐超时，猫咪倒地不起。
    *   **灵魂升天 (Soul)**：严重超时 (超 1 小时)，猫咪灵魂出窍！
    *   **休息模式 (Sleep)**：点击咖啡杯进入倒计时休息，猫咪会打呼噜睡觉。
*   **🌍 双语支持 (i18n)**：
    *   支持 **简体中文** 和 **English**。
    *   界面语言可一键切换，实时生效。
*   **☯️ 纯净模式 (Zen Mode)**：
    *   点击猫咪或切换开关，隐藏所有UI文字，仅保留极简的像素进度条，打造沉浸式专注体验。

## 📦 安装说明 (Installation)

### 商店安装 (推荐)
> 正在审核中，敬请期待 Chrome Web Store 链接...

### 开发者模式安装 (手动)
1. 下载最新发布的 `nekorest-v1.0.x.zip` 压缩包并解压。
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
3. 打开右上角的 **"开发者模式"** 开关。
4. 点击左上角的 **"加载已解压的扩展程序"**。
5. 选择解压后的文件夹即可。

## ⚙️ 推荐设置 (Recommended Settings)

为了达到最佳的"番茄工作法"体验，建议设置如下：

*   **工作时长阈值**：45 分钟（每专注 45 分钟休息一次）
*   **休息时长阈值**：5 分钟（离开电脑 5 分钟视为完成休息）

## 🛠️ 开发指南 (Development)

本项目使用原生 JavaScript/HTML/CSS 开发，无复杂构建流程。

### 目录结构
```text
/
├── manifest.json      # 扩展配置文件 (MV3)
├── background.js      # 后台服务 (状态管理、久坐核心逻辑)
├── popup.html/js      # 弹出界面 (UI交互、动画)
├── options.html/js    # 设置页面
├── locales.js         # 多语言资源文件
├── styles.css         # 全局样式
└── icons/             # 图标资源
```

### 调试
*   **Popup**: 右键扩展图标 -> "审查弹出内容"。
*   **Background**: 在扩展管理页点击 "Service Worker" 查看后台日志。

## 📝 版本历史 (Changelog)

*   **v1.0.6**: 优化语言切换体验，UI 细节打磨。
*   **v1.0.4**: 新增 Popup 内联语言切换，修复重复加载 Bug。
*   **v1.0.0**: 初始版本发布，包含完整久坐检测与 XP 系统。

## 📄 许可证 (License)

MIT License. 欢迎 Fork 和提交 PR！

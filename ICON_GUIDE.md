# 图标文件准备说明

## 需要准备的图标文件

请准备以下 4 个图标文件（推荐尺寸：128x128 像素，PNG 格式）：

### 1. icon-happy.png（开心状态）
- 🟢 绿色系的猫咪图标
- 表情开心、健康
- 久坐 < 70% 阈值时显示

### 2. icon-anxious.png（焦虑状态）
- 🟠 橙色系的猫咪图标
- 表情焦虑、不安
- 久坐 70%-100% 阈值时显示

### 3. icon-sick.png（生病状态）
- 🔴 红色系的猫咪图标
- 表情生病、难受
- 久坐 ≥ 100% 阈值时显示

### 4. icon-sleep.png（睡眠/暂停状态）
- ⚪ 灰色系的猫咪图标
- 表情睡觉、z z z
- 暂停计时时显示

---

## 图标设计建议

**方案一：使用 AI 生成**
- 使用 Midjourney, DALL-E, Stable Diffusion 生成
- 提示词示例：
  - "cute pixel art cat icon, happy face, green color scheme, 128x128"
  - "cute pixel art cat icon, worried face, orange color scheme, 128x128"
  - "cute pixel art cat icon, sick face, red color scheme, 128x128"
  - "cute pixel art cat icon, sleeping face, gray color scheme, 128x128"

**方案二：使用在线工具**
- [Canva](https://canva.com) - 免费图标设计
- [Figma](https://figma.com) - 专业设计工具
- [Flaticon](https://flaticon.com) - 下载现成图标后修改颜色

**方案三：使用 Emoji + 背景色**
- 使用系统 Emoji 截图保存为图标
- 😺 开心 → 绿色背景
- 🙀 焦虑 → 橙色背景
- ☠️ 生病 → 红色背景
- 😴 睡觉 → 灰色背景

---

## 文件放置位置

将这 4 个图标文件放在项目根目录：
```
/Users/maimai/mytools/pixpet/
├── icon-happy.png      (绿色-开心)
├── icon-anxious.png    (橙色-焦虑)
├── icon-sick.png       (红色-生病)
├── icon-sleep.png      (灰色-睡觉)
└── ... (其他文件)
```

准备好图标后，重新加载插件即可看到动态切换效果！

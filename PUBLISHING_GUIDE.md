# 🚀 Chrome 插件发布指南

将 **NekoRest** 发布到 Chrome 应用商店（Chrome Web Store）的完整流程。

## 1. 准备工作 (Preparation)

### ✅ 代码检查
- [ ] **Manifest 版本**: 确保 `manifest.json` 中的 `"version"` 是正确的（当前为 `1.0.0`）。
- [ ] **Console Logs**: 建议移除或注释掉开发时的 `console.log` 调试信息（尤其是高频打印的），保持后台干净。
- [ ] **ZIP 打包**: 将项目文件夹内的所有文件打包成一个 `.zip` 文件（**不包含** `.git`, `.DS_Store`, `node_modules` 等无关文件）。

### 🎨 素材准备 (Store Assets)
商店页面需要专门的宣传素材，这些非常重要，直接决定了用户的下载意愿：

1.  **应用图标 (Icons)**:
    -   虽然代码里可以用同一个图标，但在商店提交时，最好准备准确尺寸的 PNG 图标：
    -   `128x128` px (必须)
    -   `16x16`, `48x48` px (推荐)
2.  **商店宣传图 (Promotional Images)**:
    -   **Marquee (大横幅)**: `440x280` px (必须)
    -   **Screenshot (截图)**: 至少一张，推荐 `1280x800` px。展示小猫在屏幕上的样子，以及设置界面的截图。
    -   **Small Tile (小图标)**: `440x280` px (可选)

### 📝 文字资料
-   **标题 (Title)**: `NekoRest - 猫咪久坐提醒助手`
-   **描述 (Description)**: 准备一段 132 字以内的简短描述，和一段详细的富文本描述（可以直接复用 README.md 的内容，但要更营销化一点）。
-   **分类 (Category)**: 建议选择 `Lifestyle` (生活方式) 或 `Productivity` (生产力)。

## ⚠️ 谷歌商店审核红线 (Critical Requirements)

谷歌的审核非常严格，以下几点是**必须要满足**的，否则会被拒审：

1.  **单一用途原则 (Single Purpose Policy)**:
    -   插件必须只做一件事，且功能单一聚焦。
    -   **我们的优势**: NekoRest 非常聚焦（只做久坐提醒），这一点完全符合。不要在描述里写太多无关的功能（比如"还能当闹钟、还能看天气"之类）。

2.  **权限最小化 (Permission Justification)**:
    -   只申请必须的权限。
    -   我们在 `manifest.json` 里只用了 `idle` (检测空闲), `storage` (保存设置), `notifications` (发通知)。
    -   **注意**: 提交时，系统会问你"为什么需要这个权限？"。
        -   *Storage*: "To store user preferences like work duration and break time locally."
        -   *Idle*: "To detect user inactivity and automatically pause the timer or reset the status."
        -   *Notifications*: "To notify the user when the work timer ends or when the pet changes status."

3.  **无远程代码 (No Remote Code)**:
    -   严禁引入外部 JS (如 CDN 上的 jquery, analytics 等)。
    -   **检查**: 我们现在的代码全是本地的，没有任何 `<script src="https://...">`，完全合规。

4.  **隐私政策 (Privacy Policy)**:
    -   虽然我们不收集数据，但因为用了权限，最好还是填写 "No, I will not collect user data"。

## 2. 注册开发者账号

1.  访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)。
2.  使用 Google 账号登录。
3.  **支付注册费**: 首次发布需要支付 **$5 美元** 的一次性注册费（只需付一次，以后发多少插件都免费）。

## 3. 上传与发布

1.  **创建新条目**: 点击 "New Item" (+ 号)。
2.  **上传 ZIP**: 拖入你打包好的 `.zip` 文件。
3.  **填写信息**:
    -   填写标题、描述。
    -   上传图标和截图。
    -   选择分类。
    -   **Privacy Policy (隐私政策)**:
        -   由于我们使用了 `storage` 权限，但**不收集**用户个人信息发送到服务器，我们属于 "Not using user data for inconsistent purposes"。
        -   你可能需要一个简单的隐私政策链接（可以用 GitHub Gist 写一段，声明“所有数据仅保存在用户本地浏览器 (`chrome.storage.local`)，不上传任何服务器”）。
        -   在 "Privacy practices" 栏目中，勾选 "No, I will not collect user data"（如果我们确实不传服务器的话）。
4.  **提交审核 (Submit for Review)**:
    -   点击 "Submit"。
    -   审核通常需要 **1-3 个工作日**。

## 4. 隐私政策模板 (Privacy Policy Template)

如果你需要一个简单的隐私政策，可以参考以下内容创建：

> **Privacy Policy for NekoRest**
>
> NekoRest ("we", "our", or "us") is committed to protecting your privacy.
>
> **Data Collection and Usage**
> NekoRest is a local-only browser extension. We do not collect, store, share, or transmit any user's personal data, browsing history, or activity analytics to any external servers.
>
> **Permissions**
> - **Storage**: Used solely to save your local user preferences (e.g., work timer settings, pet status) within your browser.
> - **Idle**: Used to detect when you are away from your computer to pause the timer or trigger rest mode.
> - **Notifications**: Used to send you local alerts when it's time to rest.
>
> **Contact**
> If you have any questions, please contact us at [your-email].

---

## 💡 我可以协助你做的：

1.  **自动打包**: 我可以帮你运行命令生成纯净的 `nekorest-v1.0.0.zip`。
2.  **生成图标**: 我可以尝试用 `sips` 命令帮你把 `icon.png` 缩放成标准的 `128x128`, `48x48`, `16x16` 尺寸，方便你提交。
3.  **清理代码**: 如果需要，我可以帮你移除 `background.js` 里的 console.log。

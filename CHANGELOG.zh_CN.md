# 6.0.0 (2025-04-10)

### ✔️ Refactor

- 重构图标模块，使用`@iconify/json`替换不再维护更新的`@iconify-icons/*`依赖，优化使用体验，确保图标库可持续更新并支持`Tree-shaking`
- 升级`tailwindcss`至`v4`版本，带来更快的构建速度、更简化的安装和配置、提供专属`vite`插件

### 🎫 Feat

- 添加`Ai`聊天组件示例
- 添加`tagOnClick`标签切换全局公共事件
- 添加代码编辑器示例
- 添加`Markdown`示例
- 添加滑块示例

### 🐞 Bug fixes

- 修复`aria-hidden`报错
- 修复使用`this`语法时无法显示代码提示的问题并更新`pinia`相关语法

### 🍏 Perf

- 修复组件-瀑布流无限滚动示例中失效的链接
- 更新`vue-flow`，相关兼容处理
- 删除已弃用的依赖包`eslint-define-config`，升级`eslint`至最新版本，相关兼容处理
- 优化`src/style/dark.scss`语法
- 优化登录传参
- 使用`keydown`替换`keypress`，`keypress`事件已弃用


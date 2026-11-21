# 平台适配

[简体中文](platform-adapters.md) | [English](../docs/en/platform-adapters.md)

先识别实际项目的平台与已有组件，再选材质实现。不要为了玻璃效果迁移框架、切换小程序渲染器或引入完整引擎。这里的适配思路不等于所有平台都已运行测试；实际结果见 `docs/` 中的验证记录。

## Web、React、Vue、Svelte

沿用[实现说明](implementation.md)。装饰图层独立于内容；框架负责真实状态；浏览器控制器只负责装饰。SSR 期间不访问 DOM；挂载与清理成对。指定图片折射和任意 DOM backdrop 分开验证。横向、RTL、纵向 tabs 均需保留对应方向键规则。

## Flutter

随附[glass_surface.dart](../assets/adapters/flutter/glass_surface.dart)是仅使用 Flutter SDK 的基础磨砂容器：外部阴影、圆角裁切、BackdropFilter、主题底色和高对比回退，子控件继续使用原生语义。

```dart
GlassSurface(
  reduceTransparency: userPrefersSolid,
  child: const Text('Readable glass'),
)
```

把文件复制到项目后导入；`userPrefersSolid` 来自项目设置，而不是假定 Flutter 自动提供统一的减少透明度信号。需要动画时读 `MediaQuery.disableAnimations`，不要让装饰层截获手势。多个重叠 BackdropFilter 不盲目共用 backdrop key。使用平台视图时先确认合成限制。

基础模糊不是折射。Flutter 的 `ImageFilter.shader` 路线需要检查当前 SDK、Impeller 和 `ImageFilter.isShaderFilterSupported`；不支持则用基础容器。随附样板不提供 shader，也不要求安装第三方包。[官方 BackdropFilter](https://api.flutter.dev/flutter/widgets/BackdropFilter-class.html)与[ImageFilter.shader](https://api.flutter.dev/flutter/dart-ui/ImageFilter/ImageFilter.shader.html)说明是版本核对入口。

## Apple 原生

已有 SwiftUI/UIKit 项目优先评估系统材质，不要把 Web 代码搬进原生界面。较新系统可按项目部署目标检查 `glassEffect` 可用性；较旧目标保留已有材质或不透明底。使用系统按钮和容器时避免再叠一层重复玻璃；让系统负责其可用的无障碍和交互适配。

只有在匹配 SDK 的分支中才调用新 API，使用 `#available` 或项目既有兼容方式。具体支持版本以[官方 glassEffect 文档](https://developer.apple.com/documentation/swiftui/view/glasseffect(_:in:))为准。此包没有 Swift 构建产物，不声称已完成 Apple 真机验证。

## Android 与桌面

Android 先分清模糊自身内容和采样后方场景；给内容层加 blur 不会自动得到背景玻璃。优先沿用项目现有 Compose/渲染能力，核对 SDK、设备与功耗。原生 shader 或第三方库只在实际需求下引入，并保留稳定底色。

Electron、Tauri、WebView 界面根据实际引擎测试 Web 路线。窗口背后的系统 Mica、Acrylic、vibrancy 与窗口内部的玻璃控件是不同能力，不能互相作为折射成功的证明。不要按操作系统名称推断所有 WebView 行为相同。

## 微信小程序 / uni-app

随附[glass-view 组件](../assets/adapters/miniprogram/glass-view/index.json)包含 JS、JSON、WXML、WXSS。在项目自己的 `usingComponents` 中注册真实复制路径；内部 slot 保留业务控件。

```xml
<glass-view dark="{{isDark}}" enhanced="{{glassVerified}}">
  <button bindtap="save">保存</button>
</glass-view>
```

`enhanced` 默认 false，以实色底保证可读；只有目标渲染器和真机验证通过后才传 true。不要以 `wx.canIUse` 的任意字符串、浏览器 `CSS.supports` 或开发者工具画面代替真实绘制验证。不要为了本 Skill 自动更改 `app.json` 的渲染器、基础库或 A/B 配置。

WXSS 与浏览器 CSS 能力不同；降级应由显式类/属性控制，不只依赖 `@supports`。重点检查圆角裁切、原生组件层级、滚动性能、键盘和安全区。分别记录 iOS、Android 与桌面微信结果；uni-app 的 H5、小程序、App 输出也分别验证。背景副本只能用于明确提供的装饰图片，不能复制有状态表单或假设固定偏移永远对齐。参照[WXSS 官方说明](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)。

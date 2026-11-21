# Platform adapters

[English](platform-adapters.md) | [简体中文](../../references/platform-adapters.md)

Identify the real platform and existing components before choosing an implementation. Do not migrate frameworks, switch mini-program renderers, or add a complete engine just for glass. Guidance here is not proof of runtime testing on every platform; consult the actual records in `docs/`.

## Web, React, Vue, and Svelte

Follow [implementation](implementation.md). Keep decorative layers separate from content; the framework owns real state and the browser controller owns decoration. Avoid DOM access during SSR and pair mounting with cleanup. Validate known-image refraction separately from arbitrary-DOM backdrop filtering. Horizontal, RTL, and vertical tabs keep their respective keyboard rules.

## Flutter

The included [glass_surface.dart](../../assets/adapters/flutter/glass_surface.dart) uses only the Flutter SDK for a baseline frosted container: external shadow, rounded clipping, BackdropFilter, theme-aware fill, and a high-contrast fallback. Child controls retain native semantics.

```dart
GlassSurface(
  reduceTransparency: userPrefersSolid,
  child: const Text('Readable glass'),
)
```

Copy and import the file in the project. Obtain `userPrefersSolid` from application preferences rather than assuming Flutter exposes a universal reduced-transparency signal. For animation, consult `MediaQuery.disableAnimations`. Decorative layers must not intercept gestures. Do not blindly share a backdrop key among overlapping BackdropFilters; check composition limits with platform views.

Baseline blur is not refraction. The `ImageFilter.shader` route needs checks for the current SDK, Impeller, and `ImageFilter.isShaderFilterSupported`; otherwise use the baseline container. This adapter contains no shader and requires no third-party package. Consult official [BackdropFilter](https://api.flutter.dev/flutter/widgets/BackdropFilter-class.html) and [ImageFilter.shader](https://api.flutter.dev/flutter/dart-ui/ImageFilter/ImageFilter.shader.html) documentation for version details.

## Apple native

For an existing SwiftUI/UIKit project, assess system materials before transplanting Web code. Check `glassEffect` availability against the deployment target; retain existing materials or solid fills on older targets. Avoid applying a second glass layer over system buttons and containers. Let the system handle its supported accessibility and interaction adaptation.

Call newer APIs only within an appropriate SDK/availability branch, using `#available` or the project's established compatibility approach. The [official glassEffect documentation](https://developer.apple.com/documentation/swiftui/view/glasseffect(_:in:)) defines supported versions. This package includes no Swift build and makes no claim of Apple device validation.

## Android and desktop

On Android, distinguish blurring a view's own content from sampling the scene behind it. Blurring the content layer does not automatically create backdrop glass. Prefer the project's existing Compose/rendering capabilities and check SDK, device, and power constraints. Add native shaders or libraries only for a real requirement, retaining a stable fill.

For Electron, Tauri, and WebViews, test the Web route in the actual engine. System Mica, Acrylic, or vibrancy behind a window is different from glass controls inside it; one does not prove the other's refraction. Do not infer identical WebView behavior from operating-system names.

## WeChat mini programs and uni-app

The included [glass-view component](../../assets/adapters/miniprogram/glass-view/index.json) contains JS, JSON, WXML, and WXSS. Register its actual copied location in the project's `usingComponents`. Business controls remain inside the slot.

```xml
<glass-view dark="{{isDark}}" enhanced="{{glassVerified}}">
  <button bindtap="save">Save</button>
</glass-view>
```

`enhanced` defaults to false for a readable solid surface; enable it only after testing the target renderer and devices. Arbitrary `wx.canIUse` strings, browser `CSS.supports`, and developer-tool previews are not proof of rendering. Do not automatically change `app.json` renderer, base-library, or A/B settings for this skill.

WXSS capabilities differ from browser CSS. Use explicit classes/properties for fallbacks rather than relying solely on `@supports`. Check corner clipping, native-component stacking, scrolling, keyboard behavior, and safe areas. Record iOS, Android, and desktop WeChat separately; also test uni-app H5, mini-program, and App outputs separately. Background copies are limited to explicitly supplied decorative images, not stateful forms or permanently hardcoded offsets. Consult [official WXSS documentation](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html).

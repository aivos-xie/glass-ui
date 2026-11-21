# 参考项目与取舍

[简体中文](research-notes.md) | [English](../docs/en/research-notes.md)

本轮于 2026-11-21 阅读下列仓库的 Skill 和相关实现说明。下列版本用于复现本次阅读；来源的性能/兼容性声明不自动成为本项目的实测结果。本项目新增样板为独立编写，没有复制这些仓库的代码、图片或整段指令。

| 项目与阅读版本 | 借鉴的思路 | 本项目的处理 |
| --- | --- | --- |
| [gentpan/liquidglass](https://github.com/gentpan/liquidglass/tree/d5db099ef00828496aa2733e4f35542c05a0b1f8) · MIT | 按背景来源选渲染路径；位移图复用；多引擎验证 | 指定图片透镜与任意 DOM backdrop 分开；不复制前景内容；不直接移植 UA 补丁 |
| [Chiytako/liquid-glass-skills](https://github.com/Chiytako/liquid-glass-skills/tree/0959875c8ea88f56db3c6fd8afb8ad6a90a2862a) · 仓库 API 未识别独立许可证 | 基础/折射/交互分层；Flutter 路线；减少透明度 | 原创基础 Flutter 容器、显式质量与可读性开关；未复制代码 |
| [Armitanemati/liquid-glass-claude-skill](https://github.com/Armitanemati/liquid-glass-claude-skill/tree/05e99d959198aef012caefaadcd15e088f19c48c) · MIT | 材质用途、品牌与内容层级、实际对比验证 | 增加按需设计决策；保留用户指定范围，不引入强制提案审批流程 |
| [xenitV1/liquid-glass-skill](https://github.com/xenitV1/liquid-glass-skill/tree/8cf508b2e5474c80d4ad6a649186f505b8548307) · MIT | 平台能力区分、原生材质优先、排版与状态一致 | 增加平台适配指南；系统材质、Web 基础、shader 与真机测试分别记录 |
| [hellogitd/uiskills](https://github.com/hellogitd/uiskills/tree/e074d046f6527d995a7bc02d0c7e04d2a2c0b47c) · MIT | WXSS 降级、圆角裁切、真实设备验证 | 原创保守默认的小程序容器；不自动切换渲染器或照抄背景固定偏移 |

阅读范围包括各项目的核心 Skill、gentpan 的 optics/browser-quirks/patterns、Chiytako 的 CSS/Flutter recipes、xenit 的 materials/platforms/typography/motion-accessibility，以及 hellogitd 的 compatibility/pitfalls/skyline-config。若今后实际引入第三方实现，应再次检查对应文件许可证并保留所需声明。

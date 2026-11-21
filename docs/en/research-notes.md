# Reference projects and adoption decisions

[English](research-notes.md) | [简体中文](../../references/research-notes.md)

The following skill and implementation references were read on November 21, 2026. Pinned revisions reproduce that review. Source projects' performance and compatibility claims are not automatically this project's test results. New examples here were independently written; no source code, images, or long instruction passages were copied from these repositories.

| Project and reviewed revision | Ideas considered | Adoption here |
| --- | --- | --- |
| [gentpan/liquidglass](https://github.com/gentpan/liquidglass/tree/d5db099ef00828496aa2733e4f35542c05a0b1f8) · MIT | Source-specific rendering routes, map reuse, multiple-engine checks | Separate known-image lenses from arbitrary DOM backdrop; do not clone foreground content or blindly import UA patches |
| [Chiytako/liquid-glass-skills](https://github.com/Chiytako/liquid-glass-skills/tree/0959875c8ea88f56db3c6fd8afb8ad6a90a2862a) · No standalone license identified by repository API | Base/refraction/interaction layers, Flutter route, reduced transparency | Original baseline Flutter container and explicit quality/readability switches; no code copied |
| [Armitanemati/liquid-glass-claude-skill](https://github.com/Armitanemati/liquid-glass-claude-skill/tree/05e99d959198aef012caefaadcd15e088f19c48c) · MIT | Material purpose, brand/content hierarchy, measured contrast | Optional design-decision guide preserving user scope; no mandatory proposal-approval workflow |
| [xenitV1/liquid-glass-skill](https://github.com/xenitV1/liquid-glass-skill/tree/8cf508b2e5474c80d4ad6a649186f505b8548307) · MIT | Platform boundaries, native material preference, typography and state consistency | Platform guide distinguishing system materials, Web baselines, shaders, and device validation |
| [hellogitd/uiskills](https://github.com/hellogitd/uiskills/tree/e074d046f6527d995a7bc02d0c7e04d2a2c0b47c) · MIT | WXSS fallbacks, rounded clipping, device checks | Original mini-program container with conservative defaults; no renderer switching or copied fixed background offsets |

Review covered each core skill; gentpan's optics/browser-quirks/patterns; Chiytako's CSS/Flutter recipes; xenit's materials/platforms/typography/motion-accessibility; and hellogitd's compatibility/pitfalls/skyline-config. If future work imports third-party implementations, recheck each file's license and retain the required notices.

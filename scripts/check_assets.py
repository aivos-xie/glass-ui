#!/usr/bin/env python3
"""Check this skill's local references and demo HTML without third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.nodes = []
        self.label_depth = 0
        self.implicit_labels = set()

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'label':
            self.label_depth += 1
        if tag in ['input', 'select', 'textarea'] and self.label_depth:
            self.implicit_labels.add(values.get('id'))
        self.nodes.append((tag, values))

    def handle_endtag(self, tag):
        if tag == 'label':
            self.label_depth = max(0, self.label_depth - 1)


def check_page(page_path, errors):
    issues = []
    page = Page()
    page.feed(page_path.read_text(encoding='utf-8'))
    ids = [attrs['id'] for _, attrs in page.nodes if 'id' in attrs]
    if len(ids) != len(set(ids)):
        issues.append('Duplicate HTML ids')
    id_set = set(ids)
    labels = {attrs.get('for') for tag, attrs in page.nodes if tag == 'label'} | page.implicit_labels
    for tag, attrs in page.nodes:
        for name in ['src', 'href']:
            value = attrs.get(name, '')
            parsed = urlsplit(value)
            if not value or parsed.scheme:
                continue
            if parsed.path and not (page_path.parent / unquote(parsed.path)).is_file():
                issues.append(f'Missing HTML asset: {value}')
            if not parsed.path and parsed.fragment not in id_set:
                issues.append(f'Missing HTML fragment: {value}')
        for name in ['aria-controls', 'aria-labelledby', 'aria-describedby']:
            for target in attrs.get(name, '').split():
                if target not in id_set:
                    issues.append(f'Missing {name} target: {target}')
        if attrs.get('role') == 'tab' and not attrs.get('aria-controls'):
            issues.append(f'Tab has no associated panel: {attrs.get("id")}')
        if tag in ['input', 'select', 'textarea']:
            if attrs.get('id') and attrs['id'] not in labels and not attrs.get('aria-label') and not attrs.get('aria-labelledby'):
                issues.append(f'Control lacks label: {attrs["id"]}')
        if tag == 'img' and 'alt' not in attrs:
            issues.append('Image missing alt text')
    errors.extend(f'{page_path.parent.name}/{page_path.name}: {issue}' for issue in issues)
    return len(ids)


def main():
    root = Path(__file__).resolve().parents[1]
    demo = root / 'assets' / 'demo'
    errors = []
    required = ['SKILL.md', 'INSTALL.md', 'references/materials-and-motion.md',
                'references/components.md', 'references/implementation.md',
                'references/validation.md', 'assets/demo/index.html',
                'assets/demo/glass.css', 'assets/demo/glass.js',
                'assets/demo/demo.css', 'assets/demo/demo.js',
                'assets/demo/lens-map.js', 'assets/demo/image-lens.js', 'assets/demo/grid.svg',
                'references/design-system.md', 'references/rendering-and-performance.md',
                'references/platform-adapters.md', 'references/research-notes.md',
                'assets/adapters/flutter/glass_surface.dart',
                'assets/adapters/miniprogram/glass-view/index.js',
                'assets/adapters/miniprogram/glass-view/index.json',
                'assets/adapters/miniprogram/glass-view/index.wxml',
                'assets/adapters/miniprogram/glass-view/index.wxss',
                'scripts/validate_browser.mjs', 'references/presets.md', 'docs/en/presets.md',
                'docs/presets/index.html', 'docs/presets/presets.css', 'docs/presets/presets.js']
    for relative in required:
        if not (root / relative).is_file():
            errors.append(f'Missing resource: {relative}')
    if errors:
        print('\n'.join(errors)); return 1
    mini_config = json.loads((root / 'assets/adapters/miniprogram/glass-view/index.json').read_text(encoding='utf-8'))
    if mini_config.get('component') is not True:
        errors.append('Mini-program adapter must be registered as a component')
    pages = [demo / 'index.html', root / 'docs' / 'presets' / 'index.html']
    ids = sum(check_page(page, errors) for page in pages)
    for source in [*sorted(root.glob('*.md')), *sorted((root / 'references').glob('*.md')),
                   *sorted((root / 'docs').rglob('*.md'))]:
        text = source.read_text(encoding='utf-8')
        for path in re.findall(r'\]\(([^)]+)\)', text):
            parsed = urlsplit(path)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            if not (source.parent / unquote(parsed.path)).exists():
                errors.append(f'{source.name}: missing relative reference {path}')
        if '[TODO:' in text or '\ufffd' in text:
            errors.append(f'{source.name}: unfinished placeholder or broken encoding')
    for source in [*demo.iterdir(), *(root / 'docs' / 'presets').iterdir()]:
        if source.suffix in ['.html', '.js', '.css', '.svg']:
            text = source.read_text(encoding='utf-8')
            if '\ufffd' in text:
                errors.append(f'Broken encoding: {source.name}')
    if errors:
        print('\n'.join(errors)); return 1
    print(f'PASS: {len(required)} resources, {ids} HTML ids, local links, adapter configuration and sample semantics.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

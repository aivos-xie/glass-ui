#!/usr/bin/env python3
"""Check this skill's local references and demo HTML without third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
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


def main():
    root = Path(__file__).resolve().parents[1]
    demo = root / 'assets' / 'demo'
    errors = []
    required = ['SKILL.md', 'agents/openai.yaml', 'references/materials-and-motion.md',
                'references/components.md', 'references/implementation.md',
                'references/validation.md', 'assets/demo/index.html',
                'assets/demo/glass.css', 'assets/demo/glass.js',
                'assets/demo/demo.css', 'assets/demo/demo.js',
                'assets/demo/lens-map.js', 'assets/demo/grid.svg']
    for relative in required:
        if not (root / relative).is_file():
            errors.append(f'Missing resource: {relative}')
    if errors:
        print('\n'.join(errors)); return 1
    page = Page()
    page.feed((demo / 'index.html').read_text(encoding='utf-8'))
    ids = [attrs['id'] for _, attrs in page.nodes if 'id' in attrs]
    if len(ids) != len(set(ids)):
        errors.append('Duplicate HTML ids')
    id_set = set(ids)
    labels = {attrs.get('for') for tag, attrs in page.nodes if tag == 'label'} | page.implicit_labels
    for tag, attrs in page.nodes:
        for name in ['src', 'href']:
            value = attrs.get(name, '')
            parsed = urlsplit(value)
            if not value or parsed.scheme:
                continue
            if parsed.path and not (demo / unquote(parsed.path)).is_file():
                errors.append(f'Missing HTML asset: {value}')
            if not parsed.path and parsed.fragment not in id_set:
                errors.append(f'Missing HTML fragment: {value}')
        for name in ['aria-controls', 'aria-labelledby', 'aria-describedby']:
            for target in attrs.get(name, '').split():
                if target not in id_set:
                    errors.append(f'Missing {name} target: {target}')
        if attrs.get('role') == 'tab' and not attrs.get('aria-controls'):
            errors.append(f'Tab has no associated panel: {attrs.get("id")}')
        if tag in ['input', 'select', 'textarea']:
            if attrs.get('id') and attrs['id'] not in labels and not attrs.get('aria-label') and not attrs.get('aria-labelledby'):
                errors.append(f'Control lacks label: {attrs["id"]}')
        if tag == 'img' and 'alt' not in attrs:
            errors.append('Image missing alt text')
    for source in [root / 'SKILL.md', *sorted((root / 'references').glob('*.md'))]:
        text = source.read_text(encoding='utf-8')
        for path in re.findall(r'\]\(([^)]+)\)', text):
            if urlsplit(path).scheme or path.startswith('#'):
                continue
            if not (source.parent / unquote(path.split('#')[0])).exists():
                errors.append(f'{source.name}: missing relative reference {path}')
        if '[TODO:' in text or '\ufffd' in text:
            errors.append(f'{source.name}: unfinished placeholder or broken encoding')
    for source in demo.iterdir():
        if source.suffix in ['.html', '.js', '.css', '.svg']:
            text = source.read_text(encoding='utf-8')
            if '\ufffd' in text:
                errors.append(f'Broken encoding: {source.name}')
    if errors:
        print('\n'.join(errors)); return 1
    print(f'PASS: {len(required)} resources, {len(ids)} unique ids, local links and demo semantics.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

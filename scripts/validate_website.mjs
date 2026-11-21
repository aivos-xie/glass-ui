#!/usr/bin/env node
// Optional QA dependencies: playwright and pngjs. No production dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  assert.ok(process.argv[i].startsWith('--') && process.argv[i + 1], 'Every option needs a value');
  args[process.argv[i].slice(2)] = process.argv[i + 1];
}
const require = createRequire(path.join(path.resolve(args['module-dir'] || process.cwd()), 'website-validation.cjs'));
const { chromium, firefox, webkit } = require('playwright');
const site = path.resolve(args.site || path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs'));
const output = path.resolve(args.output || 'glass-ui-website-results');
await fs.mkdir(output, { recursive: true });
const report = { testedAt: new Date().toISOString(), browser: args.browser || 'edge', tests: [], limitations: [
  'Automated desktop engine checks do not certify physical devices, all accessibility requirements, or production performance.',
  'The large-text check doubles computed text sizes in a fresh context; it is not an OS accessibility-settings certification.'
] };
let server;
let baseUrl = args.url;
if (!baseUrl) {
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json; charset=utf-8' };
  server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const target = path.resolve(site, '.' + (pathname === '/' ? '/index.html' : pathname));
      const relative = path.relative(site, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end(); return; }
      const bytes = await fs.readFile(target);
      response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' }); response.end(bytes);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/`;
}
baseUrl = new URL(baseUrl).href;
const origin = new URL(baseUrl).origin;
report.target = args.url ? baseUrl : 'local static server';
const browserType = report.browser === 'edge' ? chromium : ({ chromium, firefox, webkit })[report.browser];
assert.ok(browserType, 'Use --browser edge|chromium|firefox|webkit');
let browser, context, page;
const errors = [], failedResponses = [], externalRequests = [];
const check = async (name, run) => {
  try { const details = await run(); report.tests.push({ name, pass: true, ...(details ? { details } : {}) }); console.log(`PASS: ${name}`); }
  catch (error) { report.tests.push({ name, pass: false, error: error.message }); console.log(`FAIL: ${name}: ${error.message}`); }
};
const watch = current => {
  current.on('pageerror', error => errors.push(error.message));
  current.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  current.on('response', response => { if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() }); });
  current.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== origin) externalRequests.push(request.url()); });
};
const language = async value => {
  const current = await page.locator('html').getAttribute('lang');
  if (!current.startsWith(value)) await page.locator('#language-toggle').click();
  await page.waitForFunction(expected => document.documentElement.lang.startsWith(expected), value);
};
const choosePanel = async suffix => {
  await page.locator(`#tab-${suffix}`).click();
  assert.equal(await page.locator(`#tab-${suffix}`).getAttribute('aria-selected'), 'true');
  assert.ok(await page.locator(`#panel-${suffix}`).isVisible());
};
const noOverflow = async current => {
  const result = await current.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('body *')].filter(element => {
      if (!element.getClientRects().length || element.closest('svg,.icon-sprite')) return false;
      const rect = element.getBoundingClientRect();
      return rect.right > width + 1 && rect.width > 0 && getComputedStyle(element).position !== 'fixed';
    }).slice(0, 6).map(element => ({ tag: element.tagName, id: element.id, class: element.className, right: Math.round(element.getBoundingClientRect().right) }));
    return { clientWidth: width, scrollWidth: document.documentElement.scrollWidth, offenders };
  });
  assert.ok(result.scrollWidth <= result.clientWidth + 1, JSON.stringify(result)); return result;
};

try {
  browser = await browserType.launch({ headless: true, ...(report.browser === 'edge' ? { channel: 'msedge' } : {}) });
  report.browserVersion = browser.version();
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  if (['edge', 'chromium'].includes(report.browser)) await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  page = await context.newPage(); watch(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await check('Default Chinese page, complete gallery and glass rendering', async () => {
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
    assert.match(await page.title(), /Glass UI/);
    assert.ok(await page.locator('#hero-card').isVisible());
    assert.ok(await page.locator('#component-search').isVisible());
    for (const selector of ['#buttons-title', '#form-title', '#overlay-title', '#notice-demo', '#people-demo', '#pagination-demo', '#breadcrumb-demo', '#accordion-demo', '#usage']) assert.equal(await page.locator(selector).count(), 1, selector);
    const filter = await page.locator('.focus-card').evaluate(el => getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter);
    assert.match(filter, /blur\(/); assert.deepEqual(errors, []);
    await page.screenshot({ path: path.join(output, 'website-zh-desktop.png'), fullPage: true });
  });
  await check('English switch translates static content, accessible labels and form feedback', async () => {
    await language('en');
    assert.doesNotMatch(await page.locator('#hero-title').innerText(), /[\u3400-\u9fff]/);
    assert.doesNotMatch(await page.locator('#component-search').getAttribute('placeholder'), /[\u3400-\u9fff]/);
    assert.doesNotMatch(await page.locator('#theme-toggle').getAttribute('aria-label'), /[\u3400-\u9fff]/);
    await choosePanel('components');
    await page.locator('#demo-form button[type="submit"]').click();
    assert.equal(await page.locator('#name-input').getAttribute('aria-invalid'), 'true');
    assert.doesNotMatch(await page.locator('#name-error').innerText(), /[\u3400-\u9fff]/);
    await page.locator('#name-input').fill('Aurora'); await page.locator('#demo-form button[type="submit"]').click();
    assert.match(await page.locator('#form-result').innerText(), /Aurora/);
    assert.doesNotMatch(await page.locator('#form-result').innerText(), /[\u3400-\u9fff]/);
    const untranslated = await page.evaluate(() => {
      const leaks = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('script,style,svg,pre,code,#language-toggle')) continue;
        if (/[\u3400-\u9fff]/.test(node.nodeValue)) leaks.push(node.nodeValue.trim());
      }
      for (const element of document.querySelectorAll('[aria-label],[placeholder],[alt],[title]')) {
        if (element.closest('#language-toggle')) continue;
        for (const attribute of ['aria-label', 'placeholder', 'alt', 'title']) {
          const value = element.getAttribute(attribute);
          if (value && /[\u3400-\u9fff]/.test(value)) leaks.push(`${attribute}: ${value}`);
        }
      }
      return [...new Set(leaks)];
    });
    assert.deepEqual(untranslated, []);
    await page.screenshot({ path: path.join(output, 'website-en-desktop.png'), fullPage: true });
  });
  await check('Component search opens the material panel and navigates to the requested lens', async () => {
    await language('zh'); await page.locator('#component-search').fill('透镜');
    const result = page.locator('#component-results a[href="#lens-experiment"]');
    assert.ok(await result.isVisible()); await result.click();
    assert.equal(await page.locator('#tab-materials').getAttribute('aria-selected'), 'true');
    assert.ok(await page.locator('#lens-experiment').isVisible());
    assert.equal(new URL(page.url()).hash, '#lens-experiment');
  });
  await check('English component search reaches pagination; unmatched queries have feedback', async () => {
    await language('en'); await page.locator('#component-search').fill('pagination');
    const result = page.locator('#component-results a[href="#pagination-demo"]');
    assert.ok(await result.isVisible()); await result.click();
    assert.equal(await page.locator('#tab-components').getAttribute('aria-selected'), 'true');
    assert.ok(await page.locator('#pagination-demo').isVisible());
    await page.locator('#component-search').fill('zzzz-no-component');
    assert.equal(await page.locator('#component-results a').count(), 0);
    assert.match(await page.locator('#component-search-status').innerText(), /no|not|0/i);
    await page.locator('#component-search').fill('');
  });
  await check('Code copy writes the displayed reusable example to the clipboard', async () => {
    const expected = (await page.locator('#usage-code').innerText()).trim();
    await page.locator('#copy-code').click();
    const actual = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(actual.replace(/\r\n/g, '\n').trim(), expected.replace(/\r\n/g, '\n')); assert.match(actual, /g-button/);
    assert.doesNotMatch(await page.locator('#copy-status').innerText(), /[\u3400-\u9fff]/);
  });
  const configuredSettings = { theme: 'dark', material: 'tinted', blur: '16px', glow: '.13', quality: 'balanced', transparency: 'reduced', motion: 'off' };
  await check('Configuration menu copies the current changed settings as JSON', async () => {
    await page.locator('#theme-toggle').click();
    await choosePanel('materials'); await page.locator('[name="material"][value="tinted"]').check();
    await choosePanel('motion'); await page.locator('#quality-select').selectOption('balanced');
    await page.locator('#transparency-toggle').check(); await page.locator('#motion-toggle').uncheck();
    await choosePanel('components'); await page.locator('#action-menu summary').click();
    await page.locator('#copy-settings').click();
    await page.waitForFunction(() => !document.querySelector('#action-menu').open);
    const copied = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
    assert.deepEqual(copied, configuredSettings);
    assert.equal(await page.locator('#action-menu').getAttribute('open'), null);
    assert.doesNotMatch(await page.locator('#toast').innerText(), /[\u3400-\u9fff]/);
  });
  await check('Configuration export downloads a real JSON file with the current settings', async () => {
    await page.locator('#action-menu summary').click();
    const downloadEvent = page.waitForEvent('download'); await page.locator('#export-settings').click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), 'glass-ui-settings.json');
    const downloadedPath = path.join(output, 'glass-ui-settings.json'); await download.saveAs(downloadedPath);
    assert.deepEqual(JSON.parse(await fs.readFile(downloadedPath, 'utf8')), configuredSettings);
    assert.equal(await page.locator('#action-menu').getAttribute('open'), null);
    assert.doesNotMatch(await page.locator('#toast').innerText(), /[\u3400-\u9fff]/);
  });
  await page.locator('#theme-toggle').click();
  await choosePanel('materials'); await page.locator('[name="material"][value="frosted"]').check();
  await choosePanel('motion'); await page.locator('#quality-select').selectOption('full');
  await page.locator('#transparency-toggle').uncheck(); await page.locator('#motion-toggle').check();
  await check('Notice can be dismissed and restored with keyboard activation', async () => {
    await choosePanel('components'); await page.locator('#dismiss-notice').click();
    assert.ok(!(await page.locator('#notice-banner').isVisible()));
    assert.ok(await page.locator('#restore-notice').isVisible());
    await page.locator('#restore-notice').focus(); await page.keyboard.press('Enter');
    assert.ok(await page.locator('#notice-banner').isVisible());
  });
  await check('Avatar choices expose meaningful collaborator feedback', async () => {
    for (const person of ['Lin', 'Mia', 'Kai']) {
      await page.locator(`[data-person="${person}"]`).click();
      assert.match(await page.locator('#person-detail').innerText(), new RegExp(person));
    }
    await page.locator('#invite-person').click(); assert.ok((await page.locator('#person-detail').innerText()).length > 10);
  });
  await check('Pagination changes rows and honors first and last page boundaries', async () => {
    const initial = await page.locator('#project-list').innerText(); assert.ok(initial.length > 0);
    assert.ok(await page.locator('#page-prev').isDisabled());
    await page.locator('[data-page="3"]').click();
    assert.equal(await page.locator('[data-page="3"]').getAttribute('aria-current'), 'page');
    assert.notEqual(await page.locator('#project-list').innerText(), initial);
    assert.ok(await page.locator('#page-next').isDisabled());
    await page.locator('#page-prev').click(); assert.equal(await page.locator('[data-page="2"]').getAttribute('aria-current'), 'page');
    await page.locator('[data-page="1"]').click(); assert.equal(await page.locator('#project-list').innerText(), initial);
  });
  await check('Breadcrumb links navigate to real component and home destinations', async () => {
    const links = page.locator('#breadcrumb-demo .breadcrumbs a'); assert.equal(await links.count(), 2);
    await links.nth(1).click(); assert.equal(new URL(page.url()).hash, '#showcase');
    assert.equal(await page.locator('#tab-components').getAttribute('aria-selected'), 'true');
    await links.nth(0).click(); assert.equal(new URL(page.url()).hash, '#top');
  });
  await check('Accordion retains native keyboard disclosure behavior', async () => {
    const details = page.locator('#accordion-demo details').nth(1);
    const summary = details.locator('summary');
    if (await details.getAttribute('open') !== null) await summary.click();
    await summary.focus(); await page.keyboard.press('Enter'); assert.notEqual(await details.getAttribute('open'), null);
    assert.ok(await details.locator('p').isVisible());
    await page.keyboard.press('Space'); assert.equal(await details.getAttribute('open'), null);
  });
  await check('Language changes retain native form values, checked state and selected page', async () => {
    await page.locator('#name-input').fill('Preserve me'); await page.locator('#notify-check').uncheck();
    await page.locator('[data-page="2"]').click(); await language('zh'); await language('en');
    assert.equal(await page.locator('#name-input').inputValue(), 'Preserve me');
    assert.ok(!(await page.locator('#notify-check').isChecked()));
    assert.equal(await page.locator('[data-page="2"]').getAttribute('aria-current'), 'page');
    await page.locator('#notify-check').check();
  });
  await check('390px, 768px and 1440px layouts fit in both languages across all panels', async () => {
    for (const locale of ['zh', 'en']) {
      await language(locale);
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
        for (const panel of ['components', 'materials', 'motion']) {
          await choosePanel(panel); await noOverflow(page);
        }
        await choosePanel('components');
        if (width === 390) await page.screenshot({ path: path.join(output, `website-${locale}-mobile.png`), fullPage: true });
      }
    }
    return { viewports: [390, 768, 1440], languages: ['zh-CN', 'en'], panelsPerCombination: 3 };
  });
  await check('200 percent text resizing preserves page reflow and reachable controls', async () => {
    const textContext = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    const textPage = await textContext.newPage(); watch(textPage);
    try {
      await textPage.goto(baseUrl, { waitUntil: 'networkidle' });
      await textPage.evaluate(() => {
        const text = [...document.querySelectorAll('body *')].filter(el => !el.closest('svg') && !['SCRIPT', 'STYLE'].includes(el.tagName));
        const sizes = text.map(el => parseFloat(getComputedStyle(el).fontSize));
        text.forEach((el, index) => { if (sizes[index] > 0) el.style.fontSize = `${sizes[index] * 2}px`; });
      });
      await noOverflow(textPage); assert.ok(await textPage.locator('#language-toggle').isVisible());
      await textPage.screenshot({ path: path.join(output, 'website-large-text.png'), fullPage: true });
    } finally { await textContext.close(); }
  });
  await check('Skip link and tab navigation remain keyboard accessible', async () => {
    await page.goto(baseUrl); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('skip-link')), true);
    await page.keyboard.press('Enter'); assert.equal(new URL(page.url()).hash, '#showcase');
    await choosePanel('motion'); await page.locator('#vertical-general').focus(); await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('#vertical-appearance').getAttribute('aria-selected'), 'true');
  });
  await check('Reduced motion, solid surfaces and forced colors retain working website controls', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#quality-select').selectOption('static');
    await page.locator('#language-toggle').click();
    assert.equal(await page.locator('.focus-card').evaluate(el => getComputedStyle(el).transform), 'none');
    await choosePanel('components'); await page.locator('[data-page="2"]').click();
    assert.equal(await page.locator('[data-page="2"]').getAttribute('aria-current'), 'page');
    await page.emulateMedia({ forcedColors: 'active' });
    assert.notEqual(await page.locator('.pagination [aria-current="page"]').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'none' });
  });
  await check('Every local link targets an existing section or bundled resource', async () => {
    const bad = await page.evaluate(async () => {
      const errors = [];
      for (const link of document.querySelectorAll('a[href]')) {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && !document.getElementById(decodeURIComponent(href.slice(1)))) errors.push(href);
      }
      return errors;
    });
    assert.deepEqual(bad, []);
    const styles = await page.request.get(new URL('glass.css', baseUrl).href); assert.equal(styles.status(), 200);
  });
  await check('No browser errors, failed resources or third-party asset requests', async () => {
    assert.deepEqual(errors, []); assert.deepEqual(failedResponses, []); assert.deepEqual(externalRequests, []);
  });
} catch (error) { report.tests.push({ name: 'Browser session', pass: false, error: error.message }); }
finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
report.summary = { passed: report.tests.filter(test => test.pass).length, failed: report.tests.filter(test => !test.pass).length };
await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary));
if (report.summary.failed || !report.summary.passed) process.exitCode = 1;

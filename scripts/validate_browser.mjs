#!/usr/bin/env node
// Optional development tooling: npm install --no-save playwright pngjs
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  assert.ok(process.argv[i].startsWith('--') && process.argv[i + 1], 'Options require a value');
  args[process.argv[i].slice(2)] = process.argv[i + 1];
}
const require = createRequire(path.join(path.resolve(args['module-dir'] || process.cwd()), 'glass-validation.cjs'));
let engines, PNG;
try { engines = require('playwright'); ({ PNG } = require('pngjs')); }
catch { console.error('Optional validation dependencies missing. Install playwright and pngjs in your development environment.'); process.exit(1); }
const packageRoot = path.resolve(args.package || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const demo = args.site ? path.resolve(args.site) : path.join(packageRoot, 'assets/demo');
const output = path.resolve(args.output || 'glass-ui-browser-results');
await fs.mkdir(output, { recursive: true });
const names = (args.browser || 'chromium,firefox,webkit').split(',');
assert.ok(names.every(name => ['chromium', 'edge', 'firefox', 'webkit'].includes(name)), 'Unknown browser');
const report = { testedAt: new Date().toISOString(), platform: process.platform, browsers: [], limitations: [
  'Playwright WebKit is an engine test, not a Safari or physical iOS device certification.',
  'Known-image SVG refraction is measured separately from optional arbitrary-DOM backdrop refraction.',
  'These checks do not constitute a full accessibility or performance audit.',
  'Increased contrast is checked in a fresh context; runtime contrast emulation left existing MediaQueryList objects stale in the tested Firefox build.'
] };
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = path.resolve(demo, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(demo, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end(); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
    response.end(await fs.readFile(target));
  } catch { if (!response.headersSent) response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;

function pixelDifference(a, b, rectangle) {
  const first = PNG.sync.read(a), second = PNG.sync.read(b);
  assert.equal(first.width, second.width); assert.equal(first.height, second.height);
  const box = rectangle || { x: 0, y: 0, width: first.width, height: first.height };
  let pixels = 0, changed = 0, sum = 0, max = 0;
  for (let y = Math.max(0, Math.round(box.y)); y < Math.min(first.height, Math.round(box.y + box.height)); y++) {
    for (let x = Math.max(0, Math.round(box.x)); x < Math.min(first.width, Math.round(box.x + box.width)); x++) {
      let difference = 0;
      for (let c = 0; c < 3; c++) difference = Math.max(difference, Math.abs(first.data[(y * first.width + x) * 4 + c] - second.data[(y * second.width + x) * 4 + c]));
      pixels++; sum += difference; max = Math.max(max, difference); if (difference > 8) changed++;
    }
  }
  return { pixels, changed, meanMaxChannelDifference: sum / Math.max(1, pixels), maxChannelDifference: max };
}

async function run(name) {
  const entry = { engine: name, status: 'running', tests: [] };
  report.browsers.push(entry);
  let browser;
  try { browser = await (name === 'edge' ? engines.chromium : engines[name]).launch({ headless: true, ...(name === 'edge' ? { channel: 'msedge' } : {}) }); }
  catch (error) { entry.status = 'skipped'; entry.reason = error.message.split('\n')[0]; console.log(`SKIP ${name}: ${entry.reason}`); return; }
  entry.version = browser.version();
  const errors = [], external = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
    window.__glassFrames = new Set();
    window.requestAnimationFrame = callback => { let id; id = request(time => { window.__glassFrames.delete(id); callback(time); }); window.__glassFrames.add(id); return id; };
    window.cancelAnimationFrame = id => { window.__glassFrames.delete(id); cancel(id); };
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(url)) external.push(request.url()); });
  const check = async (label, callback) => {
    try { const details = await callback(); entry.tests.push({ name: label, pass: true, ...(details ? { details } : {}) }); console.log(`PASS ${name}: ${label}`); }
    catch (error) { entry.tests.push({ name: label, pass: false, error: error.message }); console.log(`FAIL ${name}: ${label}: ${error.message}`); }
  };
  const tab = label => page.getByRole('tab', { name: label, exact: true });
  const alignment = selector => page.$eval(selector, track => {
    const target = track.querySelector('[aria-selected="true"]').getBoundingClientRect();
    const pill = track.querySelector('[data-glass-pill]').getBoundingClientRect();
    return { left: pill.left - target.left, top: pill.top - target.top, width: pill.width - target.width, height: pill.height - target.height };
  });
  const aligned = async selector => { const result = await alignment(selector); assert.ok(Object.values(result).every(value => Math.abs(value) <= 1), JSON.stringify(result)); return result; };
  try {
    await page.goto(url);
    await check('Local resources and offline-capable payload', async () => { assert.equal(await page.title(), args.site ? 'Glass UI · 玻璃组件交互展厅' : 'Glass UI · 让界面透一点光'); assert.deepEqual(errors, []); assert.deepEqual(external, []); });
    await check('4 degree total tilt over 6561 points', async () => {
      const assertTheme=async dark=>{
        assert.equal(await page.locator('html').getAttribute('data-theme'),dark?'dark':'light');
        assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'),String(dark));
        assert.equal(await page.locator('#drawer-theme').isChecked(),dark);
        assert.equal(await page.locator('#theme-toggle use').getAttribute('href'),dark?'#i-sun':'#i-moon');
        assert.match(await page.locator('#theme-toggle').getAttribute('aria-label'),dark?/浅色/:/深色/);
      };
      await assertTheme(true); await page.screenshot({path:path.join(output,`${name}-initial-dark.png`),fullPage:true});
      await page.locator('#theme-toggle').click();await assertTheme(false);
      await page.locator('#theme-toggle').click();await assertTheme(true);
      await page.locator('#theme-toggle').click();await assertTheme(false);

      const max = await page.evaluate(() => { let max = 0; for (let i = -40; i <= 40; i++) for (let j = -40; j <= 40; j++) { const t = GlassUI.math.tiltAt(i / 40, j / 40); max = Math.max(max, GlassUI.math.normalAngle(t.x, t.y)); } return max; });
      assert.ok(max <= 4.00001); return { maxDegrees: max };
    });
    await check('Pointer light and smooth card reset', async () => {
      const box = await page.locator('#hero-card').boundingBox(); await page.mouse.move(box.x + box.width * .8, box.y + box.height * .2);
      await page.waitForFunction(() => Number(document.querySelector('#hero-card [data-glass-face]').style.getPropertyValue('--g-lit')) > .7, null, { timeout: 5000 });
      assert.ok(await page.$eval('#hero-card [data-glass-face]', el => Number(el.style.getPropertyValue('--g-lit')) > .5));
      await page.mouse.move(5, 5);
      await page.waitForFunction(() => ['--g-rx', '--g-ry', '--g-lit'].every(key => Math.abs(parseFloat(document.querySelector('#hero-card [data-glass-face]').style.getPropertyValue(key))) < .003), null, { timeout: 5000 });
      assert.ok(await page.$eval('#hero-card [data-glass-face]', el => ['--g-rx', '--g-ry', '--g-lit'].every(key => Math.abs(parseFloat(el.style.getPropertyValue(key))) < .003)));
    });
    await page.screenshot({ path: path.join(output, `${name}-light.png`), fullPage: true });
    await check('Rapid horizontal retarget and settled alignment', async () => {
      await tab('交互与状态').click(); await tab('高级设置').click(); await page.waitForTimeout(50); await tab('我的').click(); await page.waitForTimeout(45); await tab('功能').click(); await page.waitForTimeout(1200);
      assert.equal(await page.locator('#demo-tabs [data-glass-pill]').count(), 1); return aligned('#demo-tabs');
    });
    await check('Horizontal keyboard selection and panels', async () => {
      await tab('功能').focus(); await page.keyboard.press('End'); assert.equal(await tab('我的').getAttribute('aria-selected'), 'true');
      await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight'); assert.equal(await tab('高级设置').getAttribute('aria-selected'), 'true'); assert.ok(await page.locator('#demo-settings-panel').isVisible());
    });
    await check('Vertical spring, disabled skip and keyboard', async () => {
      await tab('通用设置').focus(); await page.keyboard.press('ArrowDown'); assert.equal(await tab('外观与主题').getAttribute('aria-selected'), 'true');
      await page.waitForTimeout(1200); await aligned('#vertical-tabs'); await page.keyboard.press('Home'); await page.waitForTimeout(1000); return aligned('#vertical-tabs');
    });
    await check('RTL tab navigation and alignment', async () => {
      await page.$eval('#demo-tabs', element => element.dir = 'rtl'); await tab('功能').click(); await page.keyboard.press('ArrowLeft'); assert.equal(await tab('高级设置').getAttribute('aria-selected'), 'true');
      await page.waitForTimeout(1200); await aligned('#demo-tabs'); await page.$eval('#demo-tabs', element => element.removeAttribute('dir'));
    });
    await check('Buttons, disabled loading and pressed states', async () => {
      await tab('组件库').click(); await page.locator('#favorite-button').click(); assert.equal(await page.locator('#favorite-button').getAttribute('aria-pressed'), 'true');
      await page.locator('#save-button').click(); assert.ok(await page.locator('#save-button').isDisabled()); assert.equal(await page.locator('#save-button').getAttribute('aria-busy'), 'true');
      await page.waitForTimeout(1300); assert.ok(!(await page.locator('#save-button').isDisabled()));
    });
    await check('Form error, safe text and slider values', async () => {
      await page.getByRole('button', { name: '创建项目', exact: true }).click(); assert.equal(await page.locator('#name-input').getAttribute('aria-invalid'), 'true');
      await page.locator('#name-input').fill('<img src=x onerror=alert(1)>'); await page.getByRole('button', { name: '创建项目', exact: true }).click(); assert.equal(await page.locator('#form-result img').count(), 0); assert.ok((await page.locator('#form-result').textContent()).includes('<img'));
      await page.locator('#progress-range').focus(); await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('#range-value').textContent(), '69%');
    });
    await check('Native form selection and switch synchronization', async () => {
      await page.getByLabel('紧凑布局', { exact: true }).check(); assert.equal(await page.$eval('html', el => el.dataset.density), 'compact'); await page.getByLabel('舒适布局', { exact: true }).check();
      await page.locator('#notify-check').uncheck(); assert.ok(!(await page.locator('#drawer-notify').isChecked())); await page.locator('#notify-check').check();
    });
    await check('Dialog focus, Escape and return focus', async () => {
      await page.getByRole('button', { name: '打开对话框', exact: true }).click(); await page.keyboard.press('Tab'); assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog')));
      await page.keyboard.press('Escape'); assert.ok(!(await page.locator('#preview-dialog').isVisible())); assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), '打开对话框');
      await page.getByRole('button', { name: '设置抽屉', exact: true }).click(); await page.locator('#drawer-theme').check(); await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(output, `${name}-dark.png`), fullPage: true }); await page.locator('#theme-toggle').click();
    });
    await check('Disclosure outside click and tooltip dismissal', async () => {
      await page.locator('#action-menu summary').click(); await page.locator('#overlay-title').click(); assert.equal(await page.locator('#action-menu').getAttribute('open'), null);
      await page.getByRole('button', { name: '显示使用提示', exact: true }).focus(); assert.ok(await page.locator('#tip-content').isVisible()); await page.keyboard.press('Escape'); assert.ok(!(await page.locator('#tip-content').isVisible()));
    });
    await check('Material presets and blur controls', async () => {
      await tab('材质实验室').click(); for (const value of ['clear', 'tinted', 'prism', 'frosted']) { await page.locator(`[name="material"][value="${value}"]`).check(); assert.equal(await page.$eval('html', el => el.dataset.material), value); }
      await page.locator('#blur-range').focus(); await page.keyboard.press('Home'); assert.equal(await page.locator('#blur-value').textContent(), '0px'); await page.locator('[name="material"][value="clear"]').check(); await page.locator('[name="material"][value="frosted"]').check();
    });
    await check('Known-image refraction changes rim pixels', async () => {
      await page.mouse.move(5, 5); await page.locator('#refraction-toggle').uncheck(); await page.evaluate(() => GlassDemo.imageLens.setPosition(.5, .5));
      const before = await page.locator('#lens-experiment').screenshot({ path: path.join(output, `${name}-lens-base.png`) });
      await page.locator('#refraction-toggle').check(); await page.waitForTimeout(250);
      const after = await page.locator('#lens-experiment').screenshot({ path: path.join(output, `${name}-lens-enhanced.png`) });
      const delta = pixelDifference(before, after); assert.ok(delta.changed > 20, JSON.stringify(delta));
      assert.ok(await page.$eval('[data-glass-lens] image', element => element.getAttribute('filter')?.startsWith('url('))); return delta;
    });
    await check('Image movement reuses displacement map and keyboard alternative', async () => {
      const mapBefore = await page.locator('feImage').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
      await page.evaluate(() => { GlassDemo.imageLens.setPosition(.1, .2); GlassDemo.imageLens.setPosition(.9, .8); });
      const mapAfter = await page.locator('feImage').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))); assert.deepEqual(mapAfter, mapBefore);
      await page.locator('#lens-position').focus(); await page.keyboard.press('End'); assert.equal((await page.evaluate(() => GlassDemo.imageLens.getState())).x, 1);
      assert.equal(await page.locator('[data-glass-lens]').getAttribute('aria-hidden'), 'true');
    });
    await check('Quality and transparency fallbacks preserve controls', async () => {
      await tab('交互与状态').click(); await page.locator('#quality-select').selectOption('balanced'); assert.ok(!(await page.evaluate(() => GlassDemo.imageLens.getState())).enabled);
      await page.locator('#quality-select').selectOption('static'); await tab('我的').click(); await aligned('#demo-tabs'); assert.equal(await page.locator('.focus-card').evaluate(el => getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter), 'none');
      await page.locator('#quality-select').selectOption('full'); await page.locator('#transparency-toggle').check(); assert.ok(!(await page.evaluate(() => GlassDemo.imageLens.getState())).enabled); await page.locator('#transparency-toggle').uncheck();
    });
    await check('Runtime reduced motion disables tilt, spring and refraction', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' }); await tab('高级设置').click(); await aligned('#demo-tabs'); assert.ok(!(await page.evaluate(() => GlassDemo.imageLens.getState())).enabled);
      assert.equal(await page.locator('#hero-card [data-glass-face]').evaluate(el => getComputedStyle(el).transform), 'none'); await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
    await check('No-blur and increased-contrast fallbacks', async () => {
      await page.locator('#fallback-toggle').check(); assert.equal(await page.locator('.focus-card').evaluate(el => getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter), 'none'); await page.locator('#fallback-toggle').uncheck();
      const contrastPage = await browser.newPage({ contrast: 'more', viewport: { width: 1280, height: 960 } });
      try {
        await contrastPage.goto(url); await contrastPage.getByRole('tab', { name: '材质实验室', exact: true }).click(); await contrastPage.locator('#refraction-toggle').check();
        assert.ok(await contrastPage.evaluate(() => matchMedia('(prefers-contrast: more)').matches));
        assert.ok(!(await contrastPage.evaluate(() => GlassDemo.imageLens.getState())).enabled);
        assert.equal(await contrastPage.locator('.focus-card').evaluate(el => getComputedStyle(el).backdropFilter || getComputedStyle(el).webkitBackdropFilter), 'none');
      } finally { await contrastPage.close(); }
      return { contrastValidation: 'new context', runtimeReducedMotionValidatedSeparately: true };
    });
    await check('390px layout, long labels and responsive pill', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      for (const label of ['组件库', '材质实验室', '交互与状态']) { await tab(label).click(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)); }
      await page.waitForTimeout(1100); await aligned('#main-tabs'); await page.screenshot({ path: path.join(output, `${name}-mobile.png`), fullPage: true });
    });
    await check('Forced-colors boundaries and selection', async () => {
      await page.emulateMedia({ forcedColors: 'active' }); assert.equal(await page.locator('#main-tabs').evaluate(el => getComputedStyle(el).borderTopWidth), '1px'); await page.emulateMedia({ forcedColors: 'none' });
    });
    await check('Idle RAF and controller disposal', async () => {
      await page.mouse.move(5, 5); await page.waitForTimeout(1700); assert.equal(await page.evaluate(() => __glassFrames.size), 0);
      await page.evaluate(() => GlassDemo.dispose()); const before = await page.locator('#hero-card [data-glass-face]').getAttribute('style');
      await page.locator('#hero-card').dispatchEvent('pointermove', { clientX: 100, clientY: 100, pointerType: 'mouse' }); await page.waitForTimeout(50);
      assert.equal(await page.locator('#hero-card [data-glass-face]').getAttribute('style'), before); assert.equal(await page.evaluate(() => __glassFrames.size), 0);
    });
    await check('No browser errors or external resource requests', async () => { assert.deepEqual(errors, []); assert.deepEqual(external, []); });
  } catch (error) { entry.tests.push({ name: 'Browser session', pass: false, error: error.message }); }
  finally { await browser.close(); }
  entry.status = entry.tests.some(test => !test.pass) ? 'failed' : 'passed';
  entry.summary = { passed: entry.tests.filter(test => test.pass).length, failed: entry.tests.filter(test => !test.pass).length };
}
try { for (const name of names) await run(name); }
catch (error) { report.fatalError = error.message; }
finally { await new Promise(resolve => server.close(resolve)); }
report.summary = { passed: report.browsers.reduce((sum, entry) => sum + (entry.summary?.passed || 0), 0), failed: report.browsers.reduce((sum, entry) => sum + (entry.summary?.failed || 0), 0), skippedBrowsers: report.browsers.filter(entry => entry.status === 'skipped').map(entry => entry.engine) };
await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary));
if (report.fatalError || report.summary.failed || !report.summary.passed || (args['require-all'] === 'true' && report.summary.skippedBrowsers.length)) process.exitCode = 1;

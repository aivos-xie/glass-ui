#!/usr/bin/env node
// Independent checks for the spotlight card. Development dependencies: playwright, pngjs.
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
const require = createRequire(path.join(path.resolve(args['module-dir'] || process.cwd()), 'card-hover-validation.cjs'));
const engines = require('playwright');
const engine = args.browser || 'edge';
const { PNG } = require('pngjs');
const site = path.resolve(args.site || path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs'));
const output = path.resolve(args.output || 'glass-ui-card-results');
await fs.mkdir(output, { recursive: true });
const selectors = { host: '#spotlight-card', face: '#spotlight-face', light: '#spotlight-light', edge: '#spotlight-edge', action: '#spotlight-pin', stage: '#spotlight-demo' };
const report = { testedAt: new Date().toISOString(), browser: engine, tests: [], limitations: [
  'Screenshots and pointer motion use the real controller. Layer-pixel isolation only removes the face transform and hides the other light layer to prevent geometric changes from being mistaken for light.',
  'The isolation checks do not add glow, alter material colors, or change the pointer-generated variables.',
  'Coarse pointer and accessibility preferences are browser emulation, not physical-device or operating-system certification.',
  'Pixel checks quantify this sample scene and do not establish full accessibility or general performance compliance.'
] };
let server, baseUrl = args.url;
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
report.target = args.url ? baseUrl : 'local static server';
let browser, context, page;
const errors = [], failures = [];
const check = async (name, callback) => {
  try { const details = await callback(); report.tests.push({ name, pass: true, ...(details ? { details } : {}) }); console.log(`PASS: ${name}`); }
  catch (error) { report.tests.push({ name, pass: false, error: error.message }); console.log(`FAIL: ${name}: ${error.message}`); }
};
const watch = current => {
  current.on('pageerror', error => errors.push(error.message));
  current.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  current.on('response', response => { if (response.status() >= 400) failures.push({ status: response.status(), url: response.url() }); });
};
const angle = (x, y) => Math.acos(Math.min(1, Math.max(-1, Math.cos(x * Math.PI / 180) * Math.cos(y * Math.PI / 180)))) * 180 / Math.PI;
const state = async current => current.locator(selectors.face).evaluate(element => {
  const style = getComputedStyle(element);
  return { x: parseFloat(style.getPropertyValue('--g-rx')) || 0, y: parseFloat(style.getPropertyValue('--g-ry')) || 0, lit: parseFloat(style.getPropertyValue('--g-lit')) || 0, transform: style.transform };
});
const pointerAt = async (current, x, y, settle = 450) => {
  await current.locator(selectors.host).scrollIntoViewIfNeeded();
  const box = await current.locator(selectors.host).boundingBox();
  await current.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 8 });
  if (settle) await current.waitForTimeout(settle);
  return state(current);
};
const neutral = async current => { await current.mouse.move(4, 4); await current.waitForTimeout(900); };
const noOverflow = async current => {
  const dimensions = await current.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(dimensions.scrollWidth <= dimensions.width + 1, JSON.stringify(dimensions)); return dimensions;
};
const difference = (before, after, region) => {
  const a = PNG.sync.read(before), b = PNG.sync.read(after);
  assert.equal(a.width, b.width); assert.equal(a.height, b.height);
  let samples = 0, changed = 0, sum = 0, max = 0;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    if (region && !region(x, y, a.width, a.height)) continue;
    const i = (y * a.width + x) * 4;
    const delta = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
    samples++; if (delta > 2) changed++; sum += delta; max = Math.max(max, delta);
  }
  return { samples, changed, meanMaxChannelDifference: samples ? sum / samples : 0, maxChannelDifference: max };
};
const imageLayerCheck = async (theme, point, x, y) => {
  const stamp = `${theme}-${point}`;
  await pointerAt(page, x, y, 650);
  const actual = await state(page); assert.ok(actual.lit > .98, JSON.stringify(actual));
  await page.locator(selectors.stage).screenshot({ path: path.join(output, `${stamp}-actual.png`) });
  const isolation = await page.addStyleTag({ content: `${selectors.face}{transform:none !important;} [data-card-test-hide-light] ${selectors.light},[data-card-test-hide-edge] ${selectors.edge}{visibility:hidden !important;}` });
  const root = page.locator('html');
  try {
    await root.evaluate(el => { el.setAttribute('data-card-test-hide-light', ''); el.setAttribute('data-card-test-hide-edge', ''); });
    const base = await page.locator(selectors.face).screenshot({ path: path.join(output, `${stamp}-base-isolated.png`) });
    await root.evaluate(el => el.removeAttribute('data-card-test-hide-light'));
    const light = await page.locator(selectors.face).screenshot({ path: path.join(output, `${stamp}-light-isolated.png`) });
    await root.evaluate(el => { el.setAttribute('data-card-test-hide-light', ''); el.removeAttribute('data-card-test-hide-edge'); });
    const edge = await page.locator(selectors.face).screenshot({ path: path.join(output, `${stamp}-edge-isolated.png`) });
    const near = (px, py, w, h) => Math.hypot(px - w * x, py - h * y) < Math.min(w, h) * .23;
    const far = (px, py, w, h) => Math.hypot(px - w * (1 - x), py - h * (1 - y)) < Math.min(w, h) * .2;
    const rim = (px, py, w, h) => px < 5 || py < 5 || px >= w - 5 || py >= h - 5;
    const lightNear = difference(base, light, near), lightFar = difference(base, light, far);
    const edgeNear = difference(base, edge, (px, py, w, h) => rim(px, py, w, h) && near(px, py, w, h));
    const edgeFar = difference(base, edge, (px, py, w, h) => rim(px, py, w, h) && far(px, py, w, h));
    assert.ok(lightNear.changed > 30 && lightNear.maxChannelDifference >= 3, JSON.stringify({ lightNear, lightFar }));
    if (point !== 'center') {
      assert.ok(lightNear.meanMaxChannelDifference > lightFar.meanMaxChannelDifference + .1, JSON.stringify({ lightNear, lightFar }));
      assert.ok(edgeNear.changed >= 3 && edgeNear.maxChannelDifference >= 3, JSON.stringify({ edgeNear, edgeFar }));
      assert.ok(edgeNear.meanMaxChannelDifference > edgeFar.meanMaxChannelDifference + .05, JSON.stringify({ edgeNear, edgeFar }));
    }
    return { actualAngle: angle(actual.x, actual.y), lightNear, lightFar, edgeNear, edgeFar };
  } finally {
    await root.evaluate(el => { el.removeAttribute('data-card-test-hide-light'); el.removeAttribute('data-card-test-hide-edge'); }); await isolation.evaluate(el => el.remove());
  }
};

try {
  browser = await (engine === 'edge' ? engines.chromium : engines[engine]).launch({ headless: true, ...(engine === 'edge' ? { channel: 'msedge' } : {}) }); report.browserVersion = browser.version();
  context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  page = await context.newPage(); watch(page); await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await check('Dedicated sample has a fixed measurement host, clipped frost and independent non-intercepting light layers', async () => {
    for (const selector of Object.values(selectors)) assert.equal(await page.locator(selector).count(), 1, selector);
    const structure = await page.evaluate(selectors => {
      const host = document.querySelector(selectors.host), face = document.querySelector(selectors.face), light = document.querySelector(selectors.light), edge = document.querySelector(selectors.edge);
      return { nested: host.contains(face) && face.contains(light) && face.contains(edge), hostTransform: getComputedStyle(host).transform, overflow: getComputedStyle(face).overflow, radius: getComputedStyle(face).borderRadius, blur: getComputedStyle(face).backdropFilter || getComputedStyle(face).webkitBackdropFilter, lightPointerEvents: getComputedStyle(light).pointerEvents, edgePointerEvents: getComputedStyle(edge).pointerEvents, edgeMask: getComputedStyle(edge).maskComposite || getComputedStyle(edge).webkitMaskComposite };
    }, selectors);
    assert.ok(structure.nested); assert.equal(structure.hostTransform, 'none'); assert.equal(structure.overflow, 'hidden');
    assert.match(structure.blur, /blur\(/); assert.equal(structure.lightPointerEvents, 'none'); assert.equal(structure.edgePointerEvents, 'none');
    return structure;
  });
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
    await neutral(page);
    await page.locator(selectors.stage).screenshot({ path: path.join(output, `${theme}-idle.png`) });
    for (const [point, x, y] of [['center', .5, .5], ['top-left', .08, .08], ['top-right', .92, .08], ['bottom-right', .92, .92], ['bottom-left', .08, .92]]) {
      await check(`${theme} ${point}: real hover plus isolated interior light and local border pixel evidence`, () => imageLayerCheck(theme, point, x, y));
    }
  }
  await check('Real pointer grid and continuous motion stay within a four-degree total tilt', async () => {
    await page.evaluate(selectors => {
      window.__cardSamples = []; window.__cardRecord = true;
      const sample = () => { if (!window.__cardRecord) return; const style = getComputedStyle(document.querySelector(selectors.face)); window.__cardSamples.push({ x: parseFloat(style.getPropertyValue('--g-rx')) || 0, y: parseFloat(style.getPropertyValue('--g-ry')) || 0 }); requestAnimationFrame(sample); }; requestAnimationFrame(sample);
    }, selectors);
    const endpoints = [];
    for (const [x, y] of [[.02,.02],[.5,.02],[.98,.02],[.98,.5],[.98,.98],[.5,.98],[.02,.98],[.02,.5],[.5,.5]]) {
      const value = await pointerAt(page, x, y, 280); endpoints.push({ point: [x,y], ...value, totalAngle: angle(value.x, value.y) });
    }
    const samples = await page.evaluate(() => { window.__cardRecord = false; return window.__cardSamples; });
    const maxAngle = Math.max(...samples.map(value => angle(value.x, value.y)), ...endpoints.map(value => value.totalAngle));
    assert.ok(maxAngle <= 4.0002, JSON.stringify({ maxAngle, endpoints }));
    assert.ok(maxAngle >= 3.5, 'Pointer movement never produced a visible tilt');
    return { sampleCount: samples.length, maxAngle, endpoints };
  });
  await check('Pointer exit resets gradually, monotonically and finally returns to zero', async () => {
    await pointerAt(page, .92, .08, 600);
    await page.evaluate(selectors => {
      window.__cardExit = []; const start = performance.now();
      const sample = time => { const style = getComputedStyle(document.querySelector(selectors.face)); window.__cardExit.push({ ms:time-start, x:parseFloat(style.getPropertyValue('--g-rx'))||0,y:parseFloat(style.getPropertyValue('--g-ry'))||0,lit:parseFloat(style.getPropertyValue('--g-lit'))||0 }); if(time-start<2200)requestAnimationFrame(sample); }; requestAnimationFrame(sample);
    }, selectors);
    await page.mouse.move(4, 4); await page.waitForTimeout(2400);
    const samples = await page.evaluate(() => window.__cardExit);
    const values = samples.map(value => ({ ...value, angle: angle(value.x, value.y) }));
    assert.ok(values.length > 8, JSON.stringify({sampleCount:values.length,samples:values}));
    const initial = values[0].angle, final = values.at(-1).angle;
    assert.ok(initial > 2.5 && final < .01, JSON.stringify({ initial, final }));
    assert.ok(values.some(value => value.angle > .2 && value.angle < initial * .9), 'No intermediate reset frames were observed');
    for (let i=1;i<values.length;i++) assert.ok(values[i].angle <= values[i-1].angle + .001, 'Reset reversed or overshot');
    assert.ok(values.at(-1).lit < .003); return { initialAngle: initial, finalAngle: final, samples: values };
  });
  await check('Inner action receives clicks during tilt and stays keyboard operable', async () => {
    await pointerAt(page, .8, .25); const before = await page.locator(selectors.action).getAttribute('aria-pressed');
    await page.locator(selectors.action).click(); assert.notEqual(await page.locator(selectors.action).getAttribute('aria-pressed'), before);
    await page.locator(selectors.action).focus(); await page.keyboard.press('Space'); assert.equal(await page.locator(selectors.action).getAttribute('aria-pressed'), before);
    assert.ok((await page.locator('#spotlight-status').textContent()).length > 0);
  });
  await check('Reduced motion disables hover decoration without hiding the real action', async () => {
    await page.emulateMedia({ reducedMotion:'reduce' }); await pointerAt(page,.9,.1,100);
    const value = await state(page); assert.equal(value.transform,'none'); assert.equal(value.lit,0);
    const before = await page.locator(selectors.action).getAttribute('aria-pressed'); await page.locator(selectors.action).click(); assert.notEqual(await page.locator(selectors.action).getAttribute('aria-pressed'),before);
    await page.locator(selectors.stage).screenshot({path:path.join(output,'reduced-motion.png')}); await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await check('Solid transparency fallback and forced colors preserve readable, operable content', async () => {
    await page.evaluate(()=>document.documentElement.dataset.glassTransparency='reduced'); await pointerAt(page,.9,.1,150);
    assert.equal(await page.locator(selectors.light).evaluate(el=>getComputedStyle(el).display),'none');
    assert.equal(await page.locator(selectors.face).evaluate(el=>getComputedStyle(el).backdropFilter||getComputedStyle(el).webkitBackdropFilter),'none');
    const before=await page.locator(selectors.action).getAttribute('aria-pressed');await page.locator(selectors.action).click();assert.notEqual(await page.locator(selectors.action).getAttribute('aria-pressed'),before);
    await page.locator(selectors.stage).screenshot({path:path.join(output,'reduced-transparency.png')});
    await page.evaluate(()=>delete document.documentElement.dataset.glassTransparency); await page.emulateMedia({forcedColors:'active'});
    assert.equal(await page.locator(selectors.light).evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await page.locator(selectors.edge).evaluate(el=>getComputedStyle(el).display),'none');
    assert.equal(await page.locator(selectors.face).evaluate(el=>getComputedStyle(el).borderTopStyle),'solid');
    await page.locator(selectors.action).focus();await page.keyboard.press('Enter'); await page.locator(selectors.stage).screenshot({path:path.join(output,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
  });
  await check('Touch and coarse pointer need no hover and do not activate tilt', async () => {
    const touchContext=await browser.newContext({viewport:{width:390,height:844},...(engine === 'firefox' ? {} : {isMobile:true}),hasTouch:true,deviceScaleFactor:1});const touchPage=await touchContext.newPage();watch(touchPage);
    try{
      await touchPage.goto(baseUrl,{waitUntil:'networkidle'});await touchPage.locator(selectors.host).scrollIntoViewIfNeeded();
      assert.ok(await touchPage.evaluate(()=>matchMedia('(pointer: coarse)').matches));
      await pointerAt(touchPage,.9,.1,200);const value=await state(touchPage);assert.ok(Math.abs(value.x)+Math.abs(value.y)<.001);assert.equal(value.lit,0);
      const before=await touchPage.locator(selectors.action).getAttribute('aria-pressed');await touchPage.locator(selectors.action).tap();assert.notEqual(await touchPage.locator(selectors.action).getAttribute('aria-pressed'),before);
      await noOverflow(touchPage);await touchPage.locator(selectors.stage).screenshot({path:path.join(output,'touch-coarse.png')});return {coarsePointer:true,hoverActivated:false};
    }finally{await touchContext.close();}
  });
  await check('Dedicated card works in both languages at 390, 768 and 1440 pixels without overflow', async () => {
    await neutral(page);
    for(const language of ['zh-CN','en']){
      await page.evaluate(value=>GlassSite.setLanguage(value),language);
      for(const width of [390,768,1440]){
        await page.setViewportSize({width,height:width===390?844:1100});await noOverflow(page);await page.locator(selectors.host).scrollIntoViewIfNeeded();
        assert.ok(await page.locator(selectors.action).isVisible());
        const text=await page.locator(selectors.stage).innerText();if(language==='en')assert.doesNotMatch(text,/[\u3400-\u9fff]/);
        await page.locator(selectors.stage).screenshot({path:path.join(output,`${language}-${width}-layout.png`)});
      }
    }
    return {languages:['zh-CN','en'],viewports:[390,768,1440]};
  });
  await check('No console or resource failures during pointer and preference tests',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);});
} catch(error) { report.tests.push({name:'Browser session',pass:false,error:error.message}); }
finally {if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
report.summary={passed:report.tests.filter(test=>test.pass).length,failed:report.tests.filter(test=>!test.pass).length};
await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary));
if(report.summary.failed||!report.summary.passed)process.exitCode=1;




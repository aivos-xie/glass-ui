(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const dictionary = window.GlassLocale;
  let language = 'zh-CN', currentPage = 1, highlightTimer, settingsToastTimer;
  const records = new WeakMap();
  const attributes = ['aria-label', 'placeholder', 'alt', 'title', 'content'];
  const translate = source => {
    if (language !== 'en') return source;
    const trimmed = source.trim();
    let result = dictionary[trimmed];
    if (result === undefined) {
      let match;
      if ((match = trimmed.match(/^第 (\d+) 页，共 3 页$/))) result = `Page ${match[1]} of 3`;
      else if ((match = trimmed.match(/^找到 (\d+) 个组件，选择一个开始体验。$/))) result = `${match[1]} components found. Choose one to explore.`;
      else if (trimmed === '没有找到匹配组件，试试“按钮”或“透镜”。') result = 'No matching component. Try “button” or “lens”.';
      else if ((match = trimmed.match(/^已创建「(.*)」$/))) result = `Created “${match[1]}”`;
      else if ((match = trimmed.match(/^「(.*)」已创建。$/))) result = `“${match[1]}” was created.`;
      else if ((match = trimmed.match(/^找到 (\d+) 类组件：(.*)$/))) result = `Found ${match[1]} categories: ${match[2].split('；').map(text => text.split(' / ').map(item => dictionary[item] || ({'图标按钮':'Icon buttons','加载与禁用':'Loading and disabled','选项':'Selection','单选':'Radios','复选框':'Checkboxes','开关':'Switches','标签':'Chips','输入':'Inputs','搜索':'Search','下拉':'Selects','滑块':'Sliders','卡片':'Cards','统计':'Statistics','追光':'Spotlight','倾斜':'Tilt','对话框':'Dialogs','抽屉':'Drawers','通知':'Toasts','提示':'Tooltips','菜单':'Menus','标签页':'Tabs','胶囊':'Pills'}[item] || item)).join(' / ')).join('; ')}`;
      else if ((match = trimmed.match(/^(Lin|Mia|Kai) · (.*)$/))) result = `${match[1]} · ${{'界面设计师，喜欢安静的磨砂。':'Interface designer. A fan of quiet frost.','前端工程师，让每次点击都有回应。':'Frontend engineer. Makes every click count.','创意伙伴，关注细节与可用性。':'Creative partner. Cares about detail and usability.'}[match[2]] || match[2]}`;
    }
    return result === undefined ? source : source.replace(trimmed, result);
  };
  function processText(node) {
    let record = records.get(node);
    const value = node.nodeValue;
    if (!record || value !== record.rendered) record = { original: value, rendered: value };
    const next = translate(record.original);
    record.rendered = next; records.set(node, record);
    if (value !== next) node.nodeValue = next;
  }
  const attributeRecords = new WeakMap();
  function processAttributes(element) {
    if (!(element instanceof Element)) return;
    let saved = attributeRecords.get(element) || {};
    for (const attr of attributes) {
      if (!element.hasAttribute(attr)) continue;
      const value = element.getAttribute(attr);
      let record = saved[attr];
      if (!record || value !== record.rendered) record = { original:value, rendered:value };
      record.rendered = translate(record.original); saved[attr] = record;
      if (value !== record.rendered) element.setAttribute(attr, record.rendered);
    }
    attributeRecords.set(element, saved);
  }
  function localize(root) {
    if (root.nodeType === Node.TEXT_NODE) { if (!root.parentElement?.closest('script,style,pre,code')) processText(root); return; }
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof Element) processAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {acceptNode(node) {return node.parentElement?.closest('script,style,pre,code') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;}});
    while (walker.nextNode()) { const node = walker.currentNode; if (node.nodeType === Node.TEXT_NODE) processText(node); else processAttributes(node); }
  }
  function setLanguage(value) {
    language = value === 'en' ? 'en' : 'zh-CN';
    document.documentElement.lang = language;
    localize(document);
    const toggle = $('#language-toggle');
    toggle.textContent = language === 'en' ? '中文' : 'EN';
    toggle.lang = language === 'en' ? 'zh-CN' : 'en';
    toggle.setAttribute('aria-label', language === 'en' ? '切换到简体中文' : 'Switch to English');
    renderSearch();
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') localize(mutation.target);
      else if (mutation.type === 'attributes') processAttributes(mutation.target);
      else for (const added of mutation.addedNodes) localize(added);
    }
  });
  localize(document);
  observer.observe(document.documentElement, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:attributes });
  $('#language-toggle').addEventListener('click', () => setLanguage(language === 'en' ? 'zh-CN' : 'en'));

  const catalog = [
    {zh:'按钮与图标',en:'Buttons and icons',keys:'button icon loading disabled 按钮 图标 加载 禁用',id:'buttons-title',panel:'components'},
    {zh:'选择与开关',en:'Selection and switches',keys:'checkbox radio switch chip 单选 复选 开关 标签',id:'options-title',panel:'components'},
    {zh:'输入与表单',en:'Inputs and forms',keys:'input search select textarea range form 输入 搜索 下拉 滑块 表单',id:'form-title',panel:'components'},
    {zh:'追光与 3D 卡片',en:'Spotlight and 3D cards',keys:'card tilt spotlight frost frosted 3d 卡片 倾斜 追光 磨砂 柔光 高光 边框',id:'spotlight-demo',panel:'components'},
    {zh:'统计卡片',en:'Statistics cards',keys:'stat progress statistics chart 卡片 统计 进度 图表',id:'stat-card',panel:'components'},
    {zh:'对话框与弹层',en:'Dialogs and overlays',keys:'dialog drawer toast tooltip menu overlay 对话框 抽屉 提示 菜单 通知 弹层',id:'overlay-title',panel:'components'},
    {zh:'通知横幅',en:'Notice banners',keys:'notice banner alert 通知 横幅 消息',id:'notice-demo',panel:'components'},
    {zh:'头像组',en:'Avatar groups',keys:'avatar people team invite 头像 团队 邀请',id:'people-demo',panel:'components'},
    {zh:'分页',en:'Pagination',keys:'pagination page list 分页 列表',id:'pagination-demo',panel:'components'},
    {zh:'面包屑',en:'Breadcrumbs',keys:'breadcrumb navigation 面包屑 路径 导航',id:'breadcrumb-demo',panel:'components'},
    {zh:'折叠面板',en:'Accordion',keys:'accordion disclosure faq details 折叠 展开 问答',id:'accordion-demo',panel:'components'},
    {zh:'四种玻璃材质',en:'Four glass materials',keys:'frosted clear tinted prism blur material 磨砂 清透 染色 棱镜 模糊 材质',id:'panel-materials',panel:'materials'},
    {zh:'图片折射透镜',en:'Refractive image lens',keys:'image lens refraction 图片 折射 透镜',id:'lens-experiment',panel:'materials'},
    {zh:'滑动导航胶囊',en:'Sliding navigation pills',keys:'pill spring tabs navigation motion 胶囊 回弹 导航 动画',id:'demo-tabs',panel:'motion'},
    {zh:'画质与无障碍',en:'Quality and accessibility',keys:'quality accessibility contrast motion transparency 画质 质量 无障碍 高对比 减少动态 透明',id:'quality-select',panel:'motion'},
    {zh:'纵向导航',en:'Vertical navigation',keys:'vertical tabs keyboard 纵向 导航 键盘',id:'vertical-tabs',panel:'motion'}
  ];
  function renderSearch() {
    const query = $('#component-search').value.trim().toLowerCase();
    const list = $('#component-results'); list.replaceChildren(); list.hidden = !query;
    if (!query) { $('#component-search-status').textContent = '25+ 组件与变体，点击即可体验。'; localize($('#component-search-status')); return; }
    const matches = catalog.filter(item => `${item.zh} ${item.en} ${item.keys}`.toLowerCase().includes(query));
    $('#component-search-status').textContent = matches.length ? `找到 ${matches.length} 个组件，选择一个开始体验。` : '没有找到匹配组件，试试“按钮”或“透镜”。'; localize($('#component-search-status'));
    for (const item of matches) {
      const li = document.createElement('li'), link = document.createElement('a'), name = document.createElement('strong'), section = document.createElement('span');
      link.href = `#${item.id}`; link.dataset.openPanel = item.panel; name.textContent = language === 'en' ? item.en : item.zh;
      section.textContent = translate({components:'组件库',materials:'材质实验室',motion:'交互与状态'}[item.panel]); link.append(name, section); li.append(link); list.append(li);
    }
  }
  $('#component-search').addEventListener('input', renderSearch);
  // Keep the original form's small search example useful in either language.
  $('#search-input').addEventListener('input', event => {
    const query=event.target.value.trim().toLowerCase();
    if (!query || /[\u3400-\u9fff]/.test(query)) return;
    const groups=[
      ['button icon loading disabled','按钮 / 图标按钮 / 加载与禁用'],
      ['checkbox radio switch chip selection','选项 / 单选 / 复选框 / 开关 / 标签'],
      ['input search select range slider textarea form','表单 / 输入 / 搜索 / 下拉 / 滑块'],
      ['card stat spotlight tilt','卡片 / 统计 / 追光 / 倾斜'],
      ['overlay dialog drawer toast tooltip menu','弹层 / 对话框 / 抽屉 / 通知 / 提示 / 菜单'],
      ['navigation tab pill','导航 / 标签页 / 胶囊']
    ];
    const matches=groups.filter(entry=>entry[0].includes(query));
    $('#search-results').hidden=false;
    $('#search-results').textContent=matches.length?`找到 ${matches.length} 类组件：${matches.map(entry=>entry[1]).join('；')}`:'暂未找到匹配组件。试试“按钮”“卡片”或“开关”。';
    localize($('#search-results'));
  });
  $('#component-search').addEventListener('keydown', event => { if (event.key === 'Escape') { event.currentTarget.value = ''; renderSearch(); } });
  function visit(target, panel, focus = true) {
    const tab = $(`#tab-${panel}`); if(tab) tab.click();
    const element = document.getElementById(target); if(!element) return;
    requestAnimationFrame(() => {
      element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'center'});
      if (focus) { if (!element.matches('input,button,a,select,textarea,[tabindex]')) element.tabIndex = -1; element.focus({preventScroll:true}); }
      $$('.site-highlight').forEach(node=>node.classList.remove('site-highlight'));
      element.classList.add('site-highlight'); clearTimeout(highlightTimer); highlightTimer = setTimeout(()=>element.classList.remove('site-highlight'),1700);
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-open-panel]'); if(!link) return;
    const target = link.getAttribute('href').slice(1); if(!document.getElementById(target)) return;
    event.preventDefault(); history.replaceState(null,'',`#${target}`); visit(target,link.dataset.openPanel);
  });
  $('#dismiss-notice').addEventListener('click',()=>{ $('#notice-banner').hidden=true; $('#restore-notice').hidden=false; $('#restore-notice').focus(); });
  $('#restore-notice').addEventListener('click',()=>{ $('#notice-banner').hidden=false; $('#restore-notice').hidden=true; $('#dismiss-notice').focus(); });
  const people = {Lin:'界面设计师，喜欢安静的磨砂。',Mia:'前端工程师，让每次点击都有回应。',Kai:'创意伙伴，关注细节与可用性。'};
  $$('[data-person]').forEach(button=>button.addEventListener('click',()=>{ $('#person-detail').textContent=`${button.dataset.person} · ${people[button.dataset.person]}`; localize($('#person-detail')); }));
  $('#invite-person').addEventListener('click',()=>{ $('#person-detail').textContent='邀请已准备好。把这个展示站分享给伙伴吧。'; localize($('#person-detail')); });
  const projects = [['晨间灵感','待开始'],['轻盈仪表盘','进行中'],['流动日历','进行中'],['安静的收件箱','已完成'],['灵感笔记','待开始'],['新的起点','已完成']];
  function renderPage(page) {
    currentPage=Math.min(3,Math.max(1,page)); $('#project-list').replaceChildren();
    for(const entry of projects.slice((currentPage-1)*2,currentPage*2)) { const li=document.createElement('li'); for(const value of entry){const span=document.createElement('span');span.textContent=value;li.append(span);} $('#project-list').append(li); }
    $$('[data-page]').forEach(button=>{if(Number(button.dataset.page)===currentPage)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    $('#page-prev').disabled=currentPage===1;$('#page-next').disabled=currentPage===3;$('#page-status').textContent=`第 ${currentPage} 页，共 3 页`; localize($('#pagination-demo'));
  }
  $$('[data-page]').forEach(button=>button.addEventListener('click',()=>renderPage(Number(button.dataset.page))));
  $('#page-prev').addEventListener('click',()=>renderPage(currentPage-1));$('#page-next').addEventListener('click',()=>renderPage(currentPage+1)); renderPage(1);
  function settingsJSON() {
    const root=document.documentElement, styles=getComputedStyle(root);
    return JSON.stringify({theme:root.dataset.theme,material:root.dataset.material,blur:styles.getPropertyValue('--g-blur').trim(),glow:styles.getPropertyValue('--g-glow').trim(),quality:root.dataset.glassQuality||'full',transparency:root.dataset.glassTransparency||'auto',motion:root.dataset.glassMotion||'on'},null,2);
  }
  function settingsFeedback(message) {
    $('#action-menu').open=false;$('#action-menu summary').focus();
    clearTimeout(settingsToastTimer);$('#toast').textContent=message;localize($('#toast'));
    settingsToastTimer=setTimeout(()=>{$('#toast').textContent='';},3500);
  }
  $('#copy-settings').addEventListener('click',async()=>{
    let success=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(settingsJSON());success=true;}}catch(_){}
    settingsFeedback(success?'当前演示配置已复制为 JSON。':'当前环境无法复制，请使用“导出配置”保存 JSON。');
  });
  $('#export-settings').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([settingsJSON()+'\n'],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='glass-ui-settings.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    settingsFeedback('当前演示配置已导出为 JSON 文件。');
  });
  $('#copy-code').addEventListener('click',async()=>{
    const code=$('#usage-code').textContent; let success=false;
    try { if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(code);success=true;} } catch (_) {}
    if(!success){const selection=getSelection(), range=document.createRange();range.selectNodeContents($('#usage-code'));selection.removeAllRanges();selection.addRange(range);try{success=document.execCommand('copy');}catch(_){} if(success)selection.removeAllRanges();}
    $('#copy-status').textContent=success?'复制成功，可以粘贴到你的页面。':'无法自动复制，请选中上方代码后手动复制。'; localize($('#copy-status'));
  });
  // The original GlassUI.mount(document) in demo.js owns the card controller.
  // This observer only reports its state; it never writes transforms or pointer positions.
  const spotlightHost=$('#spotlight-card'), spotlightFace=$('#spotlight-face'), spotlightStage=$('#spotlight-stage');
  let spotlightHovered=false, spotlightPreferences;
  function updateSpotlightAngle() {
    const prefs=spotlightPreferences?.current();
    const x=parseFloat(spotlightFace.style.getPropertyValue('--g-rx'))||0, y=parseFloat(spotlightFace.style.getPropertyValue('--g-ry'))||0;
    const angle=!prefs || prefs.reduced || prefs.solid || !prefs.fine ? 0 : Math.min(4,GlassUI.math.normalAngle(x,y));
    const value=`${angle.toFixed(1)}°`;if($('#spotlight-angle').textContent!==value)$('#spotlight-angle').textContent=value;
  }
  function updateSpotlightStatus(prefs=spotlightPreferences.current()) {
    let state='ready',message='将鼠标或触控笔移到左侧卡片上，开始体验。';
    if(prefs.solid){state='solid';message='实色或高对比回退已生效：隐藏装饰光与倾斜，按钮仍可操作。';}
    else if(prefs.reduced){state='reduced';message='减少动态已生效：卡片保持静止，按钮仍可操作。';}
    else if(!prefs.fine){state='coarse';message='当前为触屏或粗指针：保留静态磨砂与可操作按钮。';}
    else if(spotlightHovered){state='active';message='追光已激活：缓慢扫过四角或边缘，观察光照与倾斜。';}
    spotlightStage.dataset.spotlightMode=state;
    $('#spotlight-status').textContent=message;localize($('#spotlight-status'));updateSpotlightAngle();
  }
  spotlightPreferences=GlassUI.observePreferences(spotlightHost,updateSpotlightStatus);
  const spotlightStyleObserver=new MutationObserver(updateSpotlightAngle);
  spotlightStyleObserver.observe(spotlightFace,{attributes:true,attributeFilter:['style']});
  function enterSpotlight(){spotlightHovered=true;updateSpotlightStatus();}
  function leaveSpotlight(){spotlightHovered=false;updateSpotlightStatus();}
  spotlightHost.addEventListener('pointerenter',enterSpotlight);
  spotlightHost.addEventListener('pointerleave',leaveSpotlight);
  spotlightHost.addEventListener('pointercancel',leaveSpotlight);
  window.addEventListener('blur',leaveSpotlight);
  $('#spotlight-pin').addEventListener('click',()=>{
    const button=$('#spotlight-pin'),selected=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(selected));
    $('#spotlight-pin-state').textContent=selected?'灵感已置顶':'给灵感留个位置';localize($('#spotlight-pin-state'));
  });
  updateSpotlightStatus();
  const disposeDemo=window.GlassDemo.dispose.bind(window.GlassDemo);
  window.GlassDemo.dispose=function(){disposeDemo();observer.disconnect();spotlightPreferences.dispose();spotlightStyleObserver.disconnect();spotlightHost.removeEventListener('pointerenter',enterSpotlight);spotlightHost.removeEventListener('pointerleave',leaveSpotlight);spotlightHost.removeEventListener('pointercancel',leaveSpotlight);window.removeEventListener('blur',leaveSpotlight);clearTimeout(highlightTimer);clearTimeout(settingsToastTimer);};
  window.GlassSite={setLanguage,translate,get language(){return language;},visit};
  const hash=decodeURIComponent(location.hash.slice(1));
  const item=catalog.find(entry=>entry.id===hash);if(item)visit(item.id,item.panel,false);
})();

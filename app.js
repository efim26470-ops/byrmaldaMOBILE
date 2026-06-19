
(function(){
  'use strict';

  const VERSION = 'mobile-clean-3.0.0';
  const SAVE_KEY = 'cs2_mobile_clean_save_v3';
  const CURRENCY = '₽LC';
  const START_BALANCE = 15000;
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_LIMIT = 10;
  const AD_REWARD = 750;
  const PROMOS = Object.freeze({
    WELCOMEMOBILE:5000, IOSFIX:10000, FASTCASE:3000, MOBILEKING:15000,
    TEST100K:100000, KNIFEDREAM:25000, RUBLEDROP:12000, CLEANV3:20000
  });

  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt = n => `${Math.round(Number(n)||0).toLocaleString('ru-RU')} ${CURRENCY}`;
  const now = () => Date.now();
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const slug = s => String(s||'').toLowerCase().replace(/★/g,'star').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  function rnd(){ try{ const a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]/4294967296; }catch(e){ return Math.random(); } }
  function uid(){ return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2)); }

  const rarityColor = {
    'Consumer Grade':'#b0c3d9','Base Grade':'#b0c3d9','Industrial Grade':'#5e98d9','Mil-Spec Grade':'#4b69ff','Restricted':'#8847ff','Classified':'#d32ce6','Covert':'#eb4b4b','Contraband':'#e4ae33','Rare Special Item':'#ffd700','Exceedingly Rare':'#ffd700','Extraordinary':'#e4ae33','High Grade':'#4b69ff','Remarkable':'#8847ff','Exotic':'#d32ce6','Distinguished':'#4b69ff','Exceptional':'#8847ff','Superior':'#d32ce6','Master':'#eb4b4b','Master Agent':'#eb4b4b','Superior Agent':'#d32ce6','Exceptional Agent':'#8847ff','Distinguished Agent':'#4b69ff'
  };
  const baseWeights = {
    'Consumer Grade':90,'Base Grade':90,'Industrial Grade':72,'Mil-Spec Grade':58,'Restricted':18,'Classified':6,'Covert':2.1,'Contraband':0.06,'Rare Special Item':0.42,'Exceedingly Rare':0.42,'Extraordinary':0.42,'High Grade':32,'Remarkable':12,'Exotic':4,'Distinguished':24,'Exceptional':10,'Superior':4,'Master':1.4,'Master Agent':1.4,'Superior Agent':4,'Exceptional Agent':10,'Distinguished Agent':24
  };
  const wearMult = [['Factory New',1.35],['Minimal Wear',1.15],['Field-Tested',.95],['Well-Worn',.78],['Battle-Scarred',.62]];
  const REAL = {
    akRedline:'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9hazQ3X2N1X2FrNDdfY29icmFfbGlnaHQuZjQ1OGMxMDVhYjc1ZmM3NGU4ZGVjMTlhZDU4YmJlZTkwNzJhMTE1YS5wbmc-/auto/auto/85/notrim/512a8c5e2da478fafdbd7648d0ccf5ba.webp',
    awpHyper:'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9hd3BfY3VfYXdwX2h5cGVyX2JlYXN0X2xpZ2h0Ljk1YWRjNTkyNTc5ZTJkYjNlMmZjNzU4MDkxZjU0MGM4ZWY2NGY1ZTYucG5n/auto/auto/85/notrim/526d33d62002109270055c4d9d65e9d0.webp',
    karambit:'https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9rbmlmZV9rYXJhbWJpdF9hbV9kb3BwbGVyX3BoYXNlMV9saWdodC4yYjdjYWFhMmE5OGRiNmY2NWU1MWJiMmQ5YThlNzA0MDhkNjAwOWE3LnBuZw--/auto/auto/85/notrim/bde86cbbe92dc9a7671a61764d6d82dd.webp',
    kilowatt:'https://cdn.csgoskins.gg/public/uih/inspections/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvaW5zcGVjdGlvbnMvdjIva2lsb3dhdHQtY2FzZS5wbmc-/auto/auto/85/notrim/d520932d9c745aceb17664cbb57b33bc.webp'
  };
  const IMG_BASE = 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/static/panorama/images/econ/';
  const caseImg = p => IMG_BASE + p;
  const FALLBACK_CASE_IMAGES = {
    'Kilowatt Case': REAL.kilowatt,
    'Revolution Case': caseImg('weapon_cases/crate_community_31_png.png'),
    'Recoil Case': caseImg('weapon_cases/crate_community_30_png.png'),
    'Dreams & Nightmares Case': caseImg('weapon_cases/crate_community_29_png.png'),
    'Snakebite Case': caseImg('weapon_cases/crate_community_27_png.png'),
    'Fracture Case': caseImg('weapon_cases/crate_community_26_png.png'),
    'Clutch Case': caseImg('weapon_cases/crate_community_17_png.png'),
    'Prisma 2 Case': caseImg('weapon_cases/crate_community_25_png.png'),
    'Spectrum 2 Case': caseImg('weapon_cases/crate_community_16_png.png'),
    'Gamma 2 Case': caseImg('weapon_cases/crate_gamma_2_png.png'),
    'Glove Case': caseImg('weapon_cases/crate_glove_png.png'),
    'Chroma 3 Case': caseImg('weapon_cases/crate_community_12_png.png')
  };

  let items = buildFallbackItems();
  let cases = buildFallbackCases(items);
  let apiLoaded = false;

  function fixImageUrl(url){
    url = String(url||'').trim();
    if(!url) return '';
    const rawTracker = 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/';
    const rawApi = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/';
    if(url.startsWith(rawTracker)) return 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/' + url.slice(rawTracker.length);
    if(url.startsWith(rawApi)) return 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/' + url.slice(rawApi.length);
    return url;
  }
  function fallbackImageFor(name){
    const n=String(name||'').toLowerCase();
    if(n.includes('awp')) return REAL.awpHyper;
    if(n.includes('knife')||n.includes('karambit')||n.includes('bayonet')||n.includes('butterfly')) return REAL.karambit;
    return REAL.akRedline;
  }
  function mapRarity(raw){
    if(!raw) return 'Mil-Spec Grade';
    if(typeof raw === 'string') return raw;
    return raw.name || raw.id || 'Mil-Spec Grade';
  }
  function priceFor(name, rarity, type='skin'){
    const n=String(name||'').toLowerCase();
    const anchors = [
      ['dragon lore', 440000], ['gungnir', 560000], ['howl', 520000], ['wild lotus', 330000], ['medusa', 220000], ['case hardened', 22000], ['vulcan', 18500], ['printstream', 8800], ['asiimov', 10500], ['hyper beast', 6900], ['redline', 3000], ['empress', 6200], ['doppler', 82000], ['fade', 76000], ['crimson web', 52000], ['vice', 72000], ['pandora', 140000]
    ];
    for(const [key,val] of anchors){ if(n.includes(key)) return val; }
    if(type==='knife') return 52000 + Math.round(rnd()*52000);
    if(type==='glove') return 38000 + Math.round(rnd()*76000);
    if(type==='sticker') return n.includes('katowice') ? 95000 : (rarity==='Exotic'?1800:rarity==='Remarkable'?520:180);
    if(type==='agent') return rarity==='Master Agent'||rarity==='Master' ? 5600 : 1200;
    const base = {'Consumer Grade':45,'Base Grade':35,'Industrial Grade':95,'Mil-Spec Grade':220,'Restricted':620,'Classified':1900,'Covert':5200,'Contraband':120000,'High Grade':180,'Remarkable':520,'Exotic':1800}[rarity] || 350;
    return Math.max(25, Math.round(base * (0.75 + rnd()*0.7)));
  }
  function normItem(raw, type='skin'){
    const name = raw.name || raw.market_hash_name || 'CS2 Item';
    let rarity = mapRarity(raw.rarity);
    if(type==='knife') rarity = 'Rare Special Item';
    if(type==='glove') rarity = 'Extraordinary';
    const img = fixImageUrl(raw.image) || fallbackImageFor(name);
    return { id: raw.id || slug(name), name, rarity, rarityColor: raw.rarity?.color || rarityColor[rarity] || '#60a5fa', value: priceFor(name,rarity,type), weight: baseWeights[rarity] || 8, image: img, type };
  }
  function localItem(id,name,rarity,value,img,type='skin'){
    return {id,name,rarity,value,rarityColor:rarityColor[rarity]||'#60a5fa',weight:baseWeights[rarity]||8,image:img,type};
  }
  function buildFallbackItems(){
    return [
      localItem('ak-redline','AK-47 | Redline','Classified',3000,REAL.akRedline),
      localItem('awp-hyper','AWP | Hyper Beast','Covert',6900,REAL.awpHyper),
      localItem('karambit-doppler','★ Karambit | Doppler','Rare Special Item',82000,REAL.karambit,'knife'),
      localItem('ak-vulcan','AK-47 | Vulcan','Covert',18500,REAL.akRedline),
      localItem('awp-asiimov','AWP | Asiimov','Covert',10500,REAL.awpHyper),
      localItem('m4-print','M4A1-S | Printstream','Covert',8800,REAL.akRedline),
      localItem('de-print','Desert Eagle | Printstream','Covert',4200,REAL.akRedline),
      localItem('glock-water','Glock-18 | Water Elemental','Classified',920,REAL.akRedline),
      localItem('tec-isaac','Tec-9 | Isaac','Mil-Spec Grade',190,REAL.akRedline),
      localItem('butterfly-doppler','★ Butterfly Knife | Doppler','Rare Special Item',76000,REAL.karambit,'knife')
    ];
  }
  function buildFallbackCases(pool){
    const names = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Snakebite Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Gamma 2 Case','Glove Case','Chroma 3 Case'];
    return names.map((name,i)=>({id:slug(name),name,price:[840,501,690,760,420,390,620,520,740,980,1400,650][i]||600,image:FALLBACK_CASE_IMAGES[name]||REAL.kilowatt,items:pool,profit:.25+rnd()*.18}));
  }

  async function fetchJSON(url, ms=4500){
    const ctrl = new AbortController();
    const t = setTimeout(()=>ctrl.abort(), ms);
    try{ const r = await fetch(url,{cache:'no-store',signal:ctrl.signal}); if(!r.ok) throw new Error('HTTP '+r.status); return await r.json(); }
    finally{ clearTimeout(t); }
  }
  async function getEndpoint(file){
    const urls = [`https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/${file}`, `https://bymykel.github.io/CSGO-API/api/en/${file}`];
    let err;
    for(const u of urls){ try{ return await fetchJSON(u); }catch(e){ err=e; } }
    throw err || new Error(file);
  }
  async function loadRealCatalog(){
    try{
      const [skinsRes, cratesRes, stickersRes, agentsRes, keychainsRes, patchesRes] = await Promise.allSettled([
        getEndpoint('skins.json'), getEndpoint('crates.json'), getEndpoint('stickers.json'), getEndpoint('agents.json'), getEndpoint('keychains.json'), getEndpoint('patches.json')
      ]);
      const skins = skinsRes.status==='fulfilled' && Array.isArray(skinsRes.value) ? skinsRes.value : [];
      const crates = cratesRes.status==='fulfilled' && Array.isArray(cratesRes.value) ? cratesRes.value : [];
      const stickers = stickersRes.status==='fulfilled' && Array.isArray(stickersRes.value) ? stickersRes.value : [];
      const agents = agentsRes.status==='fulfilled' && Array.isArray(agentsRes.value) ? agentsRes.value : [];
      const charms = keychainsRes.status==='fulfilled' && Array.isArray(keychainsRes.value) ? keychainsRes.value : [];
      const patches = patchesRes.status==='fulfilled' && Array.isArray(patchesRes.value) ? patchesRes.value : [];
      if(skins.length < 20) throw new Error('skins empty');
      const wanted = ['AK-47 | Redline','AK-47 | Vulcan','AK-47 | The Empress','AK-47 | Head Shot','M4A1-S | Printstream','M4A1-S | Decimator','M4A4 | Temukau','M4A4 | Neo-Noir','AWP | Asiimov','AWP | Hyper Beast','AWP | Duality','AWP | Fever Dream','Desert Eagle | Printstream','Desert Eagle | Ocean Drive','USP-S | Kill Confirmed','USP-S | Cortex','Glock-18 | Water Elemental','Glock-18 | Bullet Queen','P250 | Asiimov','Tec-9 | Isaac','MP9 | Food Chain','MAC-10 | Neon Rider','P90 | Death Grip','SSG 08 | Fever Dream','FAMAS | Mecha Industries','Galil AR | Chatterbox','★ Karambit | Doppler','★ Karambit | Gamma Doppler','★ Butterfly Knife | Doppler','★ M9 Bayonet | Fade'];
      const byName = new Map(skins.map(x=>[String(x.name||'').toLowerCase(),x]));
      let realItems = wanted.map(n=>byName.get(n.toLowerCase())).filter(Boolean).map(x=>normItem(x, /knife|bayonet|karambit|butterfly/i.test(x.name)?'knife':'skin'));
      skins.forEach(x=>{ if(realItems.length<72 && x.image && !realItems.some(i=>i.name===x.name)) realItems.push(normItem(x)); });
      const stickerItems = stickers.filter(x=>x.image).slice(0,12).map(x=>normItem(x,'sticker'));
      const agentItems = agents.filter(x=>x.image).slice(0,8).map(x=>normItem(x,'agent'));
      const charmItems = charms.filter(x=>x.image).slice(0,8).map(x=>normItem(x,'charm'));
      const patchItems = patches.filter(x=>x.image).slice(0,6).map(x=>normItem(x,'patch'));
      items = realItems.concat(stickerItems, agentItems, charmItems, patchItems).filter(uniqueByName);
      const crateWanted = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Snakebite Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Gamma 2 Case','Glove Case','Chroma 3 Case','Operation Broken Fang Case','Fever Case','Gallery Case'];
      const crateBy = new Map(crates.map(c=>[String(c.name||'').toLowerCase(), c]));
      let realCases = crateWanted.map((name,idx)=>{
        const c = crateBy.get(name.toLowerCase());
        if(!c) return null;
        const poolRaw = ([]).concat(Array.isArray(c.contains)?c.contains:[], Array.isArray(c.contains_rare)?c.contains_rare:[]);
        let pool = poolRaw.filter(x=>x && x.image).map(x=>normItem(x, /knife|bayonet|karambit|butterfly|glove/i.test(x.name||'')?'knife':'skin')).filter(uniqueByName);
        if(pool.length<8) pool = items.filter(x=>['skin','knife','glove'].includes(x.type)).slice(idx, idx+24);
        return {id:slug(c.name), name:c.name, price:casePrice(c.name, idx), image:fixImageUrl(c.image)||FALLBACK_CASE_IMAGES[c.name]||REAL.kilowatt, items:pool, profit:.22 + (idx%5)*.045};
      }).filter(Boolean);
      const skinsOnly = items.filter(x=>x.type==='skin');
      const knives = items.filter(x=>x.type==='knife');
      const stickersOnly = items.filter(x=>x.type==='sticker');
      const agentsAll = items.filter(x=>['agent','charm','patch'].includes(x.type));
      realCases = realCases.concat([
        {id:'budget-blue',name:'Budget Blue Case',price:220,image:realCases[5]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Mil-Spec Grade','Restricted','Industrial Grade'].includes(x.rarity)).slice(0,32),profit:.20},
        {id:'red-covert',name:'Red Covert Case',price:4200,image:realCases[1]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Covert','Classified'].includes(x.rarity)).slice(0,36),profit:.18},
        {id:'knife-case',name:'Knife Case',price:24500,image:REAL.karambit,items:knives.length?knives:items.filter(x=>x.type==='knife'),profit:.16},
        {id:'stickers-case',name:'Tournament Stickers',price:350,image:stickersOnly[0]?.image||realCases[0]?.image||REAL.kilowatt,items:stickersOnly.length?stickersOnly:items.slice(0,8),profit:.38},
        {id:'agents-charms',name:'Agents & Charms',price:950,image:agentsAll[0]?.image||realCases[0]?.image||REAL.kilowatt,items:agentsAll.length?agentsAll:items.slice(0,8),profit:.34}
      ]);
      cases = realCases.filter(c=>c.items && c.items.length);
      state.inventory.forEach(inv => { const src=items.find(i=>i.name===inv.name); if(src){ inv.image=src.image; inv.rarityColor=src.rarityColor; }});
      apiLoaded = true;
      save(false);
      route();
    }catch(e){ console.warn('Real catalog fallback', e); }
  }
  function uniqueByName(x,idx,arr){ return x && x.name && arr.findIndex(y=>y.name===x.name)===idx; }
  function casePrice(name, idx){
    const n=String(name).toLowerCase();
    if(n.includes('kilowatt')) return 840; if(n.includes('revolution')) return 501; if(n.includes('recoil')) return 690; if(n.includes('dream')) return 760; if(n.includes('snake')) return 420; if(n.includes('fracture')) return 390; if(n.includes('glove')) return 1400; if(n.includes('fever')) return 640;
    return 500 + (idx%7)*120;
  }

  function defaultState(){return {balance:START_BALANCE,inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,lastWheel:0,adViews:{},usedPromos:[],tx:[]};}
  function load(){ try{ const raw=localStorage.getItem(SAVE_KEY); if(raw){ const s={...defaultState(),...JSON.parse(raw)}; if(!Number.isFinite(+s.balance)||s.balance<0)s.balance=START_BALANCE; if(!Array.isArray(s.inventory))s.inventory=[]; return s; } }catch(e){} return defaultState(); }
  let state = load();
  function save(render=true){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} if(render) renderGlobals(); }
  function addTx(text,amount){ state.tx.unshift({text,amount,at:now()}); state.tx=state.tx.slice(0,40); }
  function addMoney(amount,reason){ amount=Math.round(amount); state.balance+=amount; state.earned+=Math.max(0,amount); addTx(reason||'Начисление',amount); save(); }
  function spend(amount,reason){ amount=Math.round(amount); if(state.balance<amount){ toast('Недостаточно ₽LC: нужно '+fmt(amount),'bad'); return false;} state.balance-=amount; state.spent+=amount; addTx(reason||'Списание',-amount); save(); return true; }
  function invItem(base){ const w=wearMult[Math.floor(rnd()*wearMult.length)]; return {...base,uid:uid(),wear:w[0],value:Math.max(1,Math.round(base.value*w[1]*(.88+rnd()*.24))),addedAt:now()}; }

  function renderGlobals(){
    $$('.js-balance').forEach(x=>x.textContent=fmt(state.balance));
    $$('.js-inv-count').forEach(x=>x.textContent=state.inventory.length);
    $$('.bottom-nav a').forEach(a=>a.classList.toggle('active', a.dataset.tab===currentPage()));
  }
  function currentPage(){ return (location.hash||'#home').replace('#','') || 'home'; }
  function pageTitle(h,p){ return `<div class="page-title"><h1>${h}</h1>${p?`<p>${p}</p>`:''}</div>`; }
  function statCards(){ return `<div class="stats"><div class="stat"><small>Баланс</small><b>${fmt(state.balance)}</b></div><div class="stat"><small>Инвентарь</small><b>${state.inventory.length}</b></div><div class="stat"><small>Открыто</small><b>${state.opened}</b></div><div class="stat"><small>Заработано</small><b>${fmt(state.earned)}</b></div></div>`; }
  function route(){
    renderGlobals();
    const app=$('#app'); if(!app) return;
    const p=currentPage();
    if(p==='cases') return renderCases(app);
    if(p==='inventory') return renderInventory(app);
    if(p==='upgrade') return renderUpgrade(app);
    if(p==='contracts') return renderContracts(app);
    if(p==='wheel') return renderWheel(app);
    if(p==='battle') return renderBattle(app);
    if(p==='ads') return renderAds(app);
    if(p==='promo') return renderPromo(app);
    if(p==='profile') return renderProfile(app);
    if(p==='install') return renderInstall(app);
    if(p==='more') return renderMore(app);
    renderHome(app);
  }
  function renderHome(app){
    app.innerHTML = pageTitle('Главная','Открывай кейсы, продавай предметы и используй апгрейд.') +
      `<section class="card hero-card"><span class="kicker">${apiLoaded?'real CS2 catalog':'real-image fallback'}</span><h1>CS2 Mobile Lab</h1><p>Мобильная версия с реальными изображениями предметов и кейсов.</p><div class="hero-actions"><a class="btn primary" href="#cases">Открыть кейсы</a><a class="btn blue" href="#promo">Промокоды</a><a class="btn" href="#ads">Получить ₽LC</a></div><div class="hero-show">${[items.find(i=>i.name==='AK-47 | Redline')||items[0],items.find(i=>i.name==='AWP | Hyper Beast')||items[1],items.find(i=>/Karambit.*Doppler/i.test(i.name))||items[2]].map(i=>heroSkin(i)).join('')}</div></section>`+
      `<section class="section"><div class="section-head"><h2>Статистика</h2></div>${statCards()}</section>`+
      `<section class="section"><div class="section-head"><h2>Популярные кейсы</h2><a class="btn small" href="#cases">Все</a></div><div class="grid">${cases.slice(0,4).map(caseCard).join('')}</div></section>`;
    wireButtons();
  }
  function heroSkin(i){ return `<div class="hero-skin"><img src="${esc(i.image)}" alt="${esc(i.name)}" onerror="this.style.visibility='hidden'"><b>${esc(i.name)}</b><span>${esc(i.rarity)}</span></div>`; }
  function caseCard(c){ return `<article class="case-card"><div class="case-img-wrap"><img src="${esc(c.image)}" onerror="this.style.visibility='hidden'" alt="${esc(c.name)}"></div><h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b class="price">${fmt(c.price)}</b></div><div class="chips">${[...new Set(c.items.map(i=>i.rarity))].slice(0,4).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><div class="case-actions"><button class="btn primary" type="button" data-action="open-case" data-case="${esc(c.id)}">Крутить</button><button class="btn" type="button" data-action="case-pool" data-case="${esc(c.id)}">Пул</button></div></article>`; }
  function itemCard(it, opts={}){ const actions=opts.actions||''; return `<article class="item-card ${opts.selected?'selected':''}" style="--rar:${it.rarityColor||'#60a5fa'}" data-uid="${esc(it.uid||'')}"><div class="item-art"><img src="${esc(it.image)}" onerror="this.style.visibility='hidden'" alt="${esc(it.name)}"></div><h4>${esc(it.name)}</h4><small>${esc(it.rarity)}${it.wear?' · '+esc(it.wear):''}</small><div class="item-value"><b>${fmt(it.value)}</b>${opts.badge?`<span class="chip">${opts.badge}</span>`:''}</div>${actions?`<div class="item-actions">${actions}</div>`:''}</article>`; }
  function renderCases(app){ app.innerHTML=pageTitle('Кейсы', apiLoaded?'Реальные изображения из открытого CS2-каталога.':'Открываю на резервном каталоге, реальные изображения подгружаются.')+`<div class="grid">${cases.map(caseCard).join('')}</div>`; wireButtons(); }
  function renderInventory(app){ const total=state.inventory.reduce((s,i)=>s+i.value,0); app.innerHTML=pageTitle('Инвентарь','Продажа, сортировка и отправка в апгрейд.')+`<div class="notice"><b>Стоимость инвентаря:</b> ${fmt(total)}</div><div class="row section"><button class="btn green" data-action="sell-all" ${state.inventory.length?'':'disabled'}>Продать всё</button><button class="btn" data-action="sort-inv">Сортировать</button></div>${state.inventory.length?`<div class="grid">${state.inventory.map(i=>itemCard(i,{actions:`<button data-action="sell-item" data-uid="${i.uid}">Продать</button><button data-action="to-upgrade" data-uid="${i.uid}">Апгрейд</button>`})).join('')}</div>`:'<div class="empty">Инвентарь пуст.</div>'}`; wireButtons(); }
  function renderUpgrade(app){ const own=state.inventory[0]; const pool=items.filter(i=>['skin','knife','glove'].includes(i.type)&&i.value>(own?own.value:0)).sort((a,b)=>a.value-b.value).slice(0,36); app.innerHTML=pageTitle('Апгрейд','Выбери свой предмет и цель.')+(own?`<div class="notice">Твой предмет: <b>${esc(own.name)}</b> · ${fmt(own.value)}</div>`:'<div class="notice">Сначала выбей предмет.</div>')+`<div class="grid two">${pool.map(i=>itemCard(i,{badge:'цель',actions:`<button class="btn small" data-action="upgrade" data-target="${esc(i.id)}">Цель</button>`})).join('')}</div>`; wireButtons(); }
  function renderContracts(app){ const selected=state.inventory.slice(0,10); app.innerHTML=pageTitle('Контракты','Первые 3–10 предметов инвентаря участвуют в контракте.')+`<div class="notice">Выбрано: <b>${Math.min(selected.length,10)}</b>. Нужно минимум 3.</div><button class="btn primary" data-action="contract" ${selected.length>=3?'':'disabled'}>Собрать контракт</button><div class="grid section">${selected.map(i=>itemCard(i,{selected:true})).join('')}</div>`; wireButtons(); }
  function renderWheel(app){ const left=Math.max(0,WHEEL_COOLDOWN-(now()-state.lastWheel)); app.innerHTML=pageTitle('Колесо бонусов','Одна прокрутка раз в 2 часа.')+`<div class="pointer"></div><div class="big-wheel" id="wheel"><span>LAB</span></div>${left?`<div class="notice">До следующей прокрутки: <b>${Math.ceil(left/60000)} мин.</b></div>`:`<button class="btn primary" data-action="spin-wheel">Крутить колесо</button>`}`; wireButtons(); }
  function renderBattle(app){ app.innerHTML=pageTitle('Battle','Открой кейс против бота. Победитель забирает оба предмета.')+`<div class="grid">${cases.slice(0,8).map(c=>`<div class="panel battle-card"><img src="${esc(c.image)}" alt=""><h3>${esc(c.name)}</h3><p class="price">${fmt(c.price)}</p><button class="btn primary" data-action="battle" data-case="${esc(c.id)}">Начать</button></div>`).join('')}</div>`; wireButtons(); }
  function renderAds(app){ const day=new Date().toISOString().slice(0,10); const used=state.adViews[day]||0; app.innerHTML=pageTitle('Реклама','10 секунд просмотра = 750 ₽LC.')+`<div class="notice">Сегодня: <b>${used}/${AD_LIMIT}</b></div><button class="btn primary" data-action="watch-ad" ${used>=AD_LIMIT?'disabled':''}>Смотреть рекламу</button>`; wireButtons(); }
  function renderPromo(app){ app.innerHTML=pageTitle('Промокоды','Каждый код активируется один раз.')+`<div class="controls"><input class="field" id="promoInput" placeholder="Введите промокод"><button class="btn primary" data-action="promo">Активировать</button></div><div class="notice section">Рабочие: WELCOMEMOBILE, IOSFIX, FASTCASE, MOBILEKING, TEST100K, CLEANV3</div>`; wireButtons(); }
  function renderProfile(app){ app.innerHTML=pageTitle('Профиль','Сохранение хранится на устройстве.')+statCards()+`<section class="section controls"><button class="btn blue" data-action="export">Экспорт save</button><textarea class="field" id="saveBox" rows="5" placeholder="save"></textarea><button class="btn" data-action="import">Импорт save</button><button class="btn red" data-action="reset">Сбросить прогресс</button></section>`; wireButtons(); }
  function renderInstall(app){ app.innerHTML=pageTitle('Установка','iPhone: Safari → Поделиться → На экран Домой.')+`<div class="notice">Эта мобильная сборка публикуется отдельно от desktop-версии.</div>`; wireButtons(); }
  function renderMore(app){ app.innerHTML=pageTitle('Ещё','Дополнительные разделы.')+`<div class="grid"><a class="btn" href="#contracts">Контракты</a><a class="btn" href="#wheel">Колесо</a><a class="btn" href="#battle">Battle</a><a class="btn" href="#promo">Промо</a><a class="btn" href="#ads">Реклама</a><a class="btn" href="#profile">Профиль</a><a class="btn" href="#install">Установка</a></div>`; wireButtons(); }

  function findCase(id){ return cases.find(c=>c.id===id); }
  function weighted(c){ const pool=c.items && c.items.length?c.items:items; let total=0; const arr=pool.map(it=>{ let w=Math.max(.01, it.weight||baseWeights[it.rarity]||6); const ratio=(it.value||0)/Math.max(1,c.price||1); if(ratio>1) w*=c.profit||.3; if(ratio>2) w*=.25; if(ratio<.5) w*=1.2; w*=.9+rnd()*.2; total+=w; return [it,w]; }); let r=rnd()*total; for(const [it,w] of arr){ r-=w; if(r<=0) return it; } return pool[pool.length-1]; }
  function openCase(id,count=1){ const c=findCase(id); if(!c) return toast('Кейс не найден','bad'); count=clamp(Math.round(count||1),1,10); const cost=c.price*count; if(!spend(cost,`Открытие ${c.name} x${count}`)) return; const drops=[]; for(let i=0;i<count;i++){ const d=invItem(weighted(c)); drops.push(d); state.inventory.unshift(d); } state.opened+=count; save(); showDrops(c,drops); }
  function showDrops(c,drops){ openModal(`Дроп: ${c.name}`, `<div class="results-grid">${drops.map(d=>`<div class="result-mini" style="--rar:${d.rarityColor}"><img src="${esc(d.image)}" alt=""><b>${esc(d.name)}</b><small>${fmt(d.value)}</small></div>`).join('')}</div><div class="drop-actions"><button class="btn green" data-action="sell-drops" data-uids="${drops.map(d=>d.uid).join(',')}">Продать всё</button><button class="btn primary" data-action="open-case" data-case="${esc(c.id)}">Ещё 1</button></div><div class="multi-grid"><button class="btn small" data-action="open-case-x" data-case="${esc(c.id)}" data-count="3">x3</button><button class="btn small" data-action="open-case-x" data-case="${esc(c.id)}" data-count="5">x5</button><button class="btn small" data-action="open-case-x" data-case="${esc(c.id)}" data-count="10">x10</button></div>`); }
  function sellUids(uids){ const set=new Set(uids); const sell=state.inventory.filter(i=>set.has(i.uid)); if(!sell.length)return; const value=sell.reduce((s,i)=>s+i.value,0); state.inventory=state.inventory.filter(i=>!set.has(i.uid)); state.sold+=value; addMoney(value,'Продажа предметов'); closeModal(); route(); toast('Продано: '+fmt(value),'good'); }
  function upgrade(id){ if(!state.inventory.length) return toast('Нет предмета','bad'); const target=items.find(i=>i.id===id); const base=state.inventory[0]; if(!target) return; const chance=clamp((base.value/target.value)*82,2,72); const win=rnd()*100<chance; state.inventory.shift(); state.upgrades++; if(win){ state.inventory.unshift(invItem(target)); toast('Апгрейд успешен: '+Math.round(chance)+'%','good'); } else toast('Апгрейд не прошёл: '+Math.round(chance)+'%','bad'); save(); route(); }
  function contract(){ const selected=state.inventory.slice(0,10); if(selected.length<3) return toast('Нужно минимум 3 предмета','bad'); const val=selected.reduce((s,i)=>s+i.value,0); const pool=items.filter(i=>i.value>=val*.35 && i.value<=val*1.9); const target=invItem(pool.length?pool[Math.floor(rnd()*pool.length)]:items[Math.floor(rnd()*items.length)]); state.inventory=state.inventory.filter(i=>!selected.some(x=>x.uid===i.uid)); state.inventory.unshift(target); state.contracts++; save(); openModal('Контракт', `<img class="drop-img" src="${esc(target.image)}"><h3 class="drop-title">${esc(target.name)}</h3><p>${fmt(target.value)}</p><button class="btn primary" data-close-modal>Ок</button>`); }
  function spinWheel(){ const left=Math.max(0,WHEEL_COOLDOWN-(now()-state.lastWheel)); if(left) return toast('Колесо ещё на кулдауне','warn'); const rewards=[250,500,750,1000,1500,2000,3000,items[Math.floor(rnd()*items.length)]]; const reward=rewards[Math.floor(rnd()*rewards.length)]; const wheel=$('#wheel'); if(wheel) wheel.style.transform=`rotate(${720+rnd()*720}deg)`; state.lastWheel=now(); setTimeout(()=>{ if(typeof reward==='number'){ addMoney(reward,'Колесо бонусов'); toast('Колесо: '+fmt(reward),'good'); } else { state.inventory.unshift(invItem(reward)); save(); toast('Колесо: предмет','good'); } route(); },900); }
  function battle(id){ const c=findCase(id); if(!c || !spend(c.price,'Battle '+(c&&c.name))) return; const me=invItem(weighted(c)), bot=invItem(weighted(c)); state.battles++; let body=`<div class="results-grid"><div class="result-mini" style="--rar:${me.rarityColor}"><img src="${esc(me.image)}"><b>Ты: ${esc(me.name)}</b><small>${fmt(me.value)}</small></div><div class="result-mini" style="--rar:${bot.rarityColor}"><img src="${esc(bot.image)}"><b>Бот: ${esc(bot.name)}</b><small>${fmt(bot.value)}</small></div></div>`; if(me.value>=bot.value){ state.inventory.unshift(me,bot); state.wins++; body+=`<div class="notice">Победа! Оба предмета в инвентаре.</div>`; } else body+=`<div class="notice">Поражение. Предметы забрал бот.</div>`; save(); openModal('Case Battle', body+`<button class="btn primary" data-close-modal>Ок</button>`); }
  function watchAd(){ const day=new Date().toISOString().slice(0,10); const used=state.adViews[day]||0; if(used>=AD_LIMIT)return toast('Лимит рекламы на сегодня','warn'); let sec=10; openModal('Реклама проекта', `<div class="notice"><b>Портфолио · YouTube · GitHub</b><br>Окно закроется через <span id="adSec">${sec}</span> сек.</div><button class="btn" disabled>Подожди таймер</button>`, false); const t=setInterval(()=>{sec--; const el=$('#adSec'); if(el)el.textContent=sec; if(sec<=0){clearInterval(t); state.adViews[day]=used+1; closeModal(); addMoney(AD_REWARD,'Реклама'); route();}},1000); }
  function promo(){ const code=($('#promoInput')?.value||'').trim().toUpperCase(); if(!PROMOS[code]) return toast('Код не найден','bad'); if(state.usedPromos.includes(code)) return toast('Код уже активирован','warn'); state.usedPromos.push(code); addMoney(PROMOS[code],'Промокод '+code); toast('Начислено '+fmt(PROMOS[code]),'good'); route(); }
  function sortInv(){ state.inventory.sort((a,b)=>b.value-a.value); save(); route(); }
  function openModal(title,body,closable=true){ $('#modalTitle').textContent=title; $('#modalBody').innerHTML=body; const m=$('#modal'); m.hidden=false; m.dataset.closable=closable?'1':'0'; wireButtons(); }
  function closeModal(){ const m=$('#modal'); if(m) m.hidden=true; }
  function toast(msg,type=''){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.className='toast '+type; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true,2400); }
  function act(action,el){
    if(action==='open-case') return openCase(el.dataset.case,1);
    if(action==='open-case-x') return openCase(el.dataset.case,parseInt(el.dataset.count||'1',10));
    if(action==='case-pool'){ const c=findCase(el.dataset.case); if(c) openModal(c.name, `<div class="grid two">${c.items.map(i=>itemCard(i)).join('')}</div>`); return; }
    if(action==='sell-drops') return sellUids((el.dataset.uids||'').split(',').filter(Boolean));
    if(action==='sell-item') return sellUids([el.dataset.uid]);
    if(action==='sell-all') return sellUids(state.inventory.map(i=>i.uid));
    if(action==='sort-inv') return sortInv();
    if(action==='to-upgrade'){ const idx=state.inventory.findIndex(i=>i.uid===el.dataset.uid); if(idx>0){ const [x]=state.inventory.splice(idx,1); state.inventory.unshift(x); save(); } location.hash='upgrade'; return; }
    if(action==='upgrade') return upgrade(el.dataset.target);
    if(action==='contract') return contract();
    if(action==='spin-wheel') return spinWheel();
    if(action==='battle') return battle(el.dataset.case);
    if(action==='watch-ad') return watchAd();
    if(action==='promo') return promo();
    if(action==='export'){ const box=$('#saveBox'); if(box) box.value=btoa(unescape(encodeURIComponent(JSON.stringify(state)))); return toast('Save экспортирован','good'); }
    if(action==='import'){ try{ const box=$('#saveBox'); const s=JSON.parse(decodeURIComponent(escape(atob(box.value.trim())))); state={...defaultState(),...s}; save(); route(); toast('Save импортирован','good'); }catch(e){ toast('Не удалось импортировать','bad'); } return; }
    if(action==='reset'){ state=defaultState(); save(); route(); return toast('Прогресс сброшен','good'); }
  }
  let touchMoved=false, lastTouch=0;
  function handleTap(e){
    const target=e.target && e.target.closest ? e.target.closest('[data-action], [data-close-modal], a[href^="#"]') : null;
    if(!target) return;
    if(e.type==='touchmove'){ touchMoved=true; return; }
    if(e.type==='touchstart'){ touchMoved=false; return; }
    if(e.type==='touchend'){
      if(touchMoved) return;
      lastTouch=Date.now(); e.preventDefault(); e.stopPropagation();
    } else if(Date.now()-lastTouch<520) return;
    if(target.matches('[data-close-modal]')){ const m=$('#modal'); if(!m || m.dataset.closable!=='0') closeModal(); return; }
    if(target.matches('a[href^="#"]')){ const h=target.getAttribute('href'); if(location.hash!==h) location.hash=h; else route(); return; }
    const a=target.dataset.action; if(a) act(a,target);
  }
  function wireButtons(){ $$('[data-action], [data-close-modal], a[href^="#"]').forEach(el=>{ el.style.pointerEvents='auto'; el.style.touchAction='manipulation'; }); }

  ['touchstart','touchmove','touchend','pointerup','click'].forEach(ev=>document.addEventListener(ev, handleTap, {capture:true, passive:ev==='touchstart'||ev==='touchmove'}));
  window.addEventListener('hashchange', route);
  window.addEventListener('pageshow', ()=>{ route(); wireButtons(); });
  document.addEventListener('DOMContentLoaded', ()=>{
    try{ if(location.search.includes('clear=mobile-clean-v3')) localStorage.removeItem(SAVE_KEY); }catch(e){}
    if(!location.hash) location.hash='home';
    route(); wireButtons();
    setTimeout(loadRealCatalog, 100);
    setInterval(wireButtons, 1200);
  });
})();

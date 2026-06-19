(function(){
  'use strict';

  const VERSION = 'mobile-1.0.0';
  const LS_KEY = 'cs2_case_lab_save';
  const BACKUP_KEY = 'cs2_case_lab_session_backup';
  const WINDOW_SAVE_PREFIX = 'CS2_CASE_LAB_WINDOW_SAVE:';
  const IDB_DB = 'cs2_case_lab_db';
  const IDB_STORE = 'saves';
  const IDB_SAVE_ID = 'main';
  const LEGACY_KEYS = ['cs2_case_lab_state','cs2_case_lab_state_backup','cs2_case_lab_v8_state','cs2_case_lab_v7_state','cs2_case_lab_v6_state','cs2_case_lab_v5_state','cs2_case_lab_v4_state','cs2_case_lab_v3_state','cs2_case_lab_v2_state'];
  const API_BASES = [
    'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/',
    'https://bymykel.github.io/CSGO-API/api/en/',
    'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/'
  ];
  const API_ENDPOINTS = {crates:'crates.json', stickers:'stickers.json', agents:'agents.json', patches:'patches.json', keychains:'keychains.json', collectibles:'collectibles.json', skins:'skins.json', collections:'collections.json'};
  const RUB_PER_USD = 92;
  const CURRENCY = '₽LC';
  const PRICE_VERSION = 'market-rub-mobile-v1';
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_DAILY_LIMIT = 10;
  const AD_REWARD = 750;
  const PROMO_CODES = Object.freeze({
    WELCOME30: 5000, EFIMDROP: 7500, IOSLAB: 3000, FASTOPEN: 2500, BATTLEFIX: 6000, RUBLELC: 10000, CASEKING: 15000, GREENLUCK: 4000, REDHUNT: 8000,
    KNIFEDREAM: 25000, ARMORYPASS: 12000, STICKER2026: 2000, DAILYBOOST: 1500, MEGALAB: 50000, TEST100K: 100000
  });
  const DAY_KEY = () => new Date().toISOString().slice(0,10);
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const rnd = (a,b) => a + cryptoRandom() * (b-a);
  function cryptoRandom(){
    try{ const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
    catch(e){ return Math.random(); }
  }
  const sample = arr => arr[Math.floor(cryptoRandom() * arr.length)];
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt = n => `${Math.round(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString('ru-RU')} ${CURRENCY}`;
  function fixImageUrl(url){
    url = String(url || '').trim();
    if(!url) return '';
    // raw.githubusercontent иногда не отдает картинки на мобильных/у провайдеров.
    // Переводим ассеты ByMykel на jsDelivr CDN, чтобы фото кейсов и скинов грузились стабильнее на GitHub Pages/iOS.
    const imgRaw = 'https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/';
    if(url.startsWith(imgRaw)) return 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/' + url.slice(imgRaw.length);
    const apiRaw = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/';
    if(url.startsWith(apiRaw)) return 'https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/' + url.slice(apiRaw.length);
    return url;
  }
  function imgSrc(url, fallback){ return fixImageUrl(url) || fallback || svgSkin('CS2 Skin'); }
  const imgSafe = v => esc(imgSrc(v,''));
  const id = () => (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

  const rarityColors = {
    'Consumer Grade':'#b0c3d9','Base Grade':'#b0c3d9','Industrial Grade':'#5e98d9','Mil-Spec Grade':'#4b69ff',
    'Restricted':'#8847ff','Classified':'#d32ce6','Covert':'#eb4b4b','Exceedingly Rare':'#ffd700','Extraordinary':'#e4ae33','Contraband':'#e4ae33',
    'High Grade':'#4b69ff','Remarkable':'#8847ff','Exotic':'#d32ce6','Distinguished':'#4b69ff','Exceptional':'#8847ff','Superior':'#d32ce6','Master':'#eb4b4b','Master Agent':'#eb4b4b','Superior Agent':'#d32ce6','Exceptional Agent':'#8847ff','Distinguished Agent':'#4b69ff'
  };
  const rarityValue = {
    'Consumer Grade':45,'Base Grade':45,'Industrial Grade':85,'Mil-Spec Grade':180,'Restricted':430,'Classified':1000,'Covert':2600,
    'Exceedingly Rare':9000,'Extraordinary':8200,'Contraband':15000,'High Grade':120,'Remarkable':360,'Exotic':850,'Distinguished':320,'Exceptional':780,'Superior':1550,'Master':3600,'Master Agent':3600,'Superior Agent':1550,'Exceptional Agent':780,'Distinguished Agent':320
  };
  const rarityWeight = {
    'Consumer Grade':90,'Base Grade':90,'Industrial Grade':75,'Mil-Spec Grade':62,'Restricted':18,'Classified':6,'Covert':2.2,
    'Exceedingly Rare':0.5,'Extraordinary':0.5,'Contraband':0.08,'High Grade':28,'Remarkable':10,'Exotic':3.5,'Distinguished':24,'Exceptional':9,'Superior':4,'Master':1.3,'Master Agent':1.3,'Superior Agent':4,'Exceptional Agent':9,'Distinguished Agent':24
  };
  const wears = [
    ['Factory New',1.38,0.00,0.07],['Minimal Wear',1.16,0.07,0.15],['Field-Tested',0.96,0.15,0.38],['Well-Worn',0.78,0.38,0.45],['Battle-Scarred',0.64,0.45,0.99]
  ];
  const bots = ['CaseFan','MIRAGEKING','dropzilla','AWP_ORACLE','rush_b','NAVIboy','knifeHunter','FlashMe','EfimDrop','bananaPeek','PixelPro','s1mpleFan','donkPeek'];

  const svgCase = (name='CS2') => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#ef4444"/></linearGradient><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffffff" stop-opacity=".25"/><stop offset="1" stop-color="#000000" stop-opacity=".25"/></linearGradient></defs><rect x="110" y="130" width="420" height="240" rx="34" fill="#111827" stroke="#334155" stroke-width="14"/><path d="M190 130V95c0-34 25-58 60-58h140c35 0 60 24 60 58v35" fill="none" stroke="#475569" stroke-width="20"/><rect x="145" y="168" width="350" height="158" rx="24" fill="url(#g)"/><rect x="145" y="168" width="350" height="158" rx="24" fill="url(#m)"/><path d="M170 203h300M170 248h300M170 293h300" stroke="#111827" stroke-width="10" opacity=".28"/><text x="320" y="272" font-family="Arial" font-weight="900" font-size="68" fill="#0b1020" text-anchor="middle">${esc(name).slice(0,9)}</text></svg>`);
  const svgSkin = (name='CS2 Skin', c1='#60a5fa', c2='#f97316') => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${c1}"/><stop offset=".55" stop-color="#8b5cf6"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".55"/></filter></defs><rect width="760" height="360" rx="38" fill="#111827"/><circle cx="110" cy="80" r="120" fill="${c1}" opacity=".15"/><circle cx="640" cy="270" r="150" fill="${c2}" opacity=".13"/><g filter="url(#s)" transform="translate(46 50)"><path d="M62 148h362l38-42h112c31 0 58 20 69 50l31 86h-93l-18-46h-98l-55 62h-94l58-65H180l-36 44H62l32-51H55c-42 0-42-38 7-38z" fill="url(#g)"/><path d="M132 112h198l40-50h96l-42 50h124c24 0 44 14 54 36H92c4-20 18-36 40-36z" fill="#e5e7eb" opacity=".25"/><path d="M205 185h105M425 150h125M520 198h72" stroke="#0f172a" stroke-width="14" stroke-linecap="round" opacity=".42"/><circle cx="605" cy="238" r="22" fill="#0b1020"/></g><text x="380" y="56" fill="#fff" font-family="Arial" font-size="34" font-weight="900" text-anchor="middle">${esc(name).slice(0,30)}</text></svg>`);

  const cs2Img = path => 'https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/static/panorama/images/econ/' + path;

  const fallbackItems = [
    ['ak_redline','AK-47 | Redline','Classified',1200,'#111827','#ef4444'],['ak_vulcan','AK-47 | Vulcan','Covert',3600,'#38bdf8','#2563eb'],['ak_headshot','AK-47 | Head Shot','Covert',4100,'#22c55e','#ef4444'],
    ['ak_ice','AK-47 | Ice Coaled','Classified',1100,'#67e8f9','#14b8a6'],['m4a1_print','M4A1-S | Printstream','Covert',4300,'#f8fafc','#a855f7'],['m4a1_decimator','M4A1-S | Decimator','Classified',1250,'#ec4899','#2563eb'],
    ['m4a4_neo','M4A4 | Neo-Noir','Covert',3100,'#f472b6','#60a5fa'],['awp_asiimov','AWP | Asiimov','Covert',5400,'#f97316','#f8fafc'],['awp_hyper','AWP | Hyper Beast','Covert',3900,'#22c55e','#ec4899'],
    ['awp_duality','AWP | Duality','Classified',900,'#fbbf24','#7c3aed'],['deagle_print','Desert Eagle | Printstream','Covert',2400,'#f8fafc','#06b6d4'],['deagle_ocean','Desert Eagle | Ocean Drive','Covert',2200,'#06b6d4','#f97316'],
    ['usp_kill','USP-S | Kill Confirmed','Covert',3300,'#ef4444','#f8fafc'],['usp_cortex','USP-S | Cortex','Classified',820,'#fb7185','#a855f7'],['glock_water','Glock-18 | Water Elemental','Classified',980,'#38bdf8','#ef4444'],
    ['p250_asiimov','P250 | Asiimov','Classified',760,'#f97316','#f8fafc'],['tec9_isaac','Tec-9 | Isaac','Mil-Spec Grade',210,'#ef4444','#f97316'],['mp9_food','MP9 | Food Chain','Classified',900,'#84cc16','#ec4899'],
    ['mac10_neon','MAC-10 | Neon Rider','Covert',1800,'#ec4899','#22d3ee'],['p90_death','P90 | Death Grip','Restricted',420,'#94a3b8','#ef4444'],['ssg_fever','SSG 08 | Fever Dream','Restricted',380,'#a855f7','#f472b6'],
    ['ump_primal','UMP-45 | Primal Saber','Classified',870,'#f59e0b','#eab308'],['famas_mecha','FAMAS | Mecha Industries','Classified',900,'#e5e7eb','#f97316'],['galil_chatter','Galil AR | Chatterbox','Covert',1700,'#facc15','#111827'],
    ['knife_butterfly','★ Butterfly Knife | Doppler','Exceedingly Rare',12800,'#22d3ee','#a855f7'],['knife_karambit','★ Karambit | Gamma Doppler','Exceedingly Rare',14200,'#22c55e','#38bdf8'],['knife_kukri','★ Kukri Knife | Case Hardened','Exceedingly Rare',9800,'#f59e0b','#60a5fa'],
    ['gloves_sport','★ Sport Gloves | Vice','Extraordinary',11000,'#f472b6','#8b5cf6'],['gloves_driver','★ Driver Gloves | King Snake','Extraordinary',8700,'#f8fafc','#94a3b8'],['gloves_broken','★ Broken Fang Gloves | Jade','Extraordinary',7600,'#22c55e','#064e3b']
  ].map(x => ({id:x[0],name:x[1],rarity:x[2],value:x[3],rarityColor:rarityColors[x[2]]||'#60a5fa',weight:rarityWeight[x[2]]||8,image:svgSkin(x[1],x[4],x[5])})).map(applySteamLikePrice);
  const fallbackCases = [
    {id:'kilowatt',name:'Kilowatt Case',price:690,image:cs2Img('weapon_cases/crate_community_33_png.png'),items:fallbackItems.slice(0,18).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'revolution',name:'Revolution Case',price:760,image:cs2Img('weapon_cases/crate_community_31_png.png'),items:fallbackItems.slice(4,23).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'recoil',name:'Recoil Case',price:720,image:cs2Img('weapon_cases/crate_community_30_png.png'),items:fallbackItems.slice(2,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'dreams',name:'Dreams & Nightmares Case',price:650,image:cs2Img('weapon_cases/crate_community_29_png.png'),items:fallbackItems.slice(8,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'snakebite',name:'Snakebite Case',price:520,image:cs2Img('weapon_cases/crate_community_27_png.png'),items:fallbackItems.slice(0,20).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'fracture',name:'Fracture Case',price:540,image:cs2Img('weapon_cases/crate_community_26_png.png'),items:fallbackItems.slice(3,22).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'clutch',name:'Clutch Case',price:620,image:cs2Img('weapon_cases/crate_community_17_png.png'),items:fallbackItems.slice(5,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'prisma2',name:'Prisma 2 Case',price:590,image:cs2Img('weapon_cases/crate_community_25_png.png'),items:fallbackItems.slice(0,21).concat(fallbackItems.slice(-4)),source:'offline-classic',kind:'case'},
    {id:'spectrum2',name:'Spectrum 2 Case',price:820,image:cs2Img('weapon_cases/crate_community_16_png.png'),items:fallbackItems.slice(4,24).concat(fallbackItems.slice(-5)),source:'offline-classic',kind:'case'},
    {id:'premium',name:'Covert Premium Case',price:1500,image:svgCase('VIP'),items:fallbackItems.filter(i => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity)),source:'offline-fallback',kind:'special'},
    {id:'knife',name:'Knife & Gloves Case',price:3200,image:svgCase('GOLD'),items:fallbackItems.filter(i => ['Covert','Exceedingly Rare','Extraordinary'].includes(i.rarity)),source:'offline-fallback',kind:'special'}
  ].map((c,i)=>withHiddenOdds(c,i));
  let catalog = {items:fallbackItems, cases:fallbackCases, source:'fallback'};
  let storageWarned = false;
  let storageHealth = {local:false, session:false, indexedDB:false, windowName:false, mode:'starting', lastError:''};
  cleanupStorageBeforeLoad();
  let state = loadState();
  let busy = {case:false,wheel:false,battle:false,ad:false,upgrade:false};
  let bootLoaded = false;
  let live = [];
  let wheelDeg = 0;
  let currentCase = null;

  function defaultState(){ return {version:VERSION,balance:15000,inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,tx:[],pendingUpgrade:null,contractSelected:[],lastWheelAt:0,adViews:{},usedPromos:[],createdAt:Date.now(),savedAt:Date.now()}; }
  function toNum(v,d=0){ const n = Number(String(v).replace(/\s/g,'').replace(',','.')); return Number.isFinite(n) ? n : d; }
  function normalizeState(raw){
    const base = defaultState();
    const s = Object.assign(base, raw && typeof raw === 'object' ? raw : {});
    s.balance = toNum(s.balance, 15000);
    if(s.balance < 0 || !Number.isFinite(s.balance)) s.balance = 15000;
    ['opened','earned','spent','sold','upgrades','contracts','battles','wins'].forEach(k => s[k] = Math.max(0, Math.round(toNum(s[k],0))));
    s.inventory = Array.isArray(s.inventory) ? s.inventory.filter(Boolean).map(normalizeInvItem).filter(Boolean) : [];
    s.tx = Array.isArray(s.tx) ? s.tx.slice(0,60) : [];
    s.contractSelected = Array.isArray(s.contractSelected) ? s.contractSelected : [];
    s.lastWheelAt = Math.max(0, Math.round(toNum(s.lastWheelAt,0)));
    s.adViews = (s.adViews && typeof s.adViews === 'object') ? s.adViews : {};
    s.usedPromos = Array.isArray(s.usedPromos) ? s.usedPromos.map(x=>String(x).toUpperCase()).slice(0,100) : [];
    return s;
  }
  function normalizeInvItem(it){
    if(!it || !(it.name || it.displayName)) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    let normalized = Object.assign({}, it, {uid:it.uid||id(), name:it.name||it.displayName, displayName:it.displayName||it.name, rarity:r, rarityColor:it.rarityColor||rarityColors[r]||'#60a5fa', value:Math.max(1,Math.round(toNum(it.value,100))), image:fixImageUrl(it.image)||svgSkin(it.name||'Skin'), currency:it.currency||CURRENCY, priceVersion:it.priceVersion||''});
    if(normalized.priceVersion !== PRICE_VERSION){
      const repriced = applySteamLikePrice(normalized);
      normalized.value = repriced.value; normalized.steamUsd = repriced.steamUsd; normalized.steamRub = repriced.steamRub; normalized.currency = CURRENCY; normalized.priceVersion = PRICE_VERSION;
    }
    return normalized;
  }
  function allSaveKeys(){
    const keys = new Set([LS_KEY, ...LEGACY_KEYS]);
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && /cs2_case_lab/i.test(k)) keys.add(k);
      }
    }catch(e){}
    return Array.from(keys);
  }
  function compactInvItem(it){
    if(!it) return null;
    const r = it.rarity || 'Mil-Spec Grade';
    return {
      uid: it.uid || id(), id: it.id || it.baseId || slug(it.name || it.displayName || 'item'), baseId: it.baseId || it.id || slug(it.name || it.displayName || 'item'),
      name: it.name || it.displayName || 'CS2 Item', displayName: it.displayName || it.name || 'CS2 Item',
      rarity: r, rarityColor: it.rarityColor || rarityColors[r] || '#60a5fa', category: it.category || 'skin',
      value: Math.max(1, Math.round(toNum(it.value, 100))), steamUsd: it.steamUsd || undefined, steamRub: it.steamRub || undefined, currency: it.currency || CURRENCY, priceVersion: it.priceVersion || PRICE_VERSION, marketHashName: it.marketHashName || it.market_hash_name || it.name,
      image: fixImageUrl(it.image) || svgSkin(it.name || it.displayName || 'CS2 Item'), wear: it.wear || '', float: it.float || '', source: it.source || '', addedAt: Math.max(0, Math.round(toNum(it.addedAt, Date.now())))
    };
  }
  function compactState(raw){
    const s = normalizeState(raw);
    return {
      version: VERSION, balance: Math.max(0, Math.round(toNum(s.balance,15000))), inventory: s.inventory.map(compactInvItem).filter(Boolean).slice(0,700),
      opened:s.opened, earned:s.earned, spent:s.spent, sold:s.sold, upgrades:s.upgrades, contracts:s.contracts, battles:s.battles, wins:s.wins,
      tx:(s.tx||[]).slice(0,80).map(t=>({id:t.id||id(), text:String(t.text||'Операция').slice(0,120), amount:Math.round(toNum(t.amount,0)), time:Math.max(0,Math.round(toNum(t.time,Date.now())))})),
      pendingUpgrade:s.pendingUpgrade||null, contractSelected:Array.isArray(s.contractSelected)?s.contractSelected.slice(0,10):[], lastWheelAt:s.lastWheelAt||0, adViews:s.adViews||{}, usedPromos:Array.isArray(s.usedPromos)?s.usedPromos.slice(0,100):[],
      createdAt:s.createdAt||Date.now(), savedAt:Date.now()
    };
  }
  function cleanupStorageBeforeLoad(){
    try{
      const keepRaw = localStorage.getItem(LS_KEY);
      const legacyRaw = !keepRaw ? LEGACY_KEYS.map(k => { try{return localStorage.getItem(k)}catch(e){return null} }).find(Boolean) : null;
      for(let i=localStorage.length-1;i>=0;i--){
        const k = localStorage.key(i);
        if(k && /cs2_case_lab/i.test(k) && k !== LS_KEY) localStorage.removeItem(k);
      }
      if(!keepRaw && legacyRaw){
        try{ localStorage.setItem(LS_KEY, JSON.stringify(compactState(JSON.parse(legacyRaw)))); }catch(e){}
      }
    }catch(e){}
  }
  function parseStateRaw(raw){
    if(!raw || typeof raw !== 'string') return null;
    try{ return normalizeState(JSON.parse(raw)); }catch(e){ return null; }
  }
  function readWindowNameState(){
    try{
      const wn = String(window.name || '');
      const idx = wn.indexOf(WINDOW_SAVE_PREFIX);
      if(idx < 0) return null;
      return parseStateRaw(wn.slice(idx + WINDOW_SAVE_PREFIX.length));
    }catch(e){ return null; }
  }
  function writeWindowName(raw){
    try{
      window.name = WINDOW_SAVE_PREFIX + raw;
      storageHealth.windowName = true;
      return true;
    }catch(e){ return false; }
  }
  function bestState(candidates){
    const valid = candidates.filter(Boolean).map(normalizeState);
    if(!valid.length) return defaultState();
    valid.sort((a,b)=>{
      const sa = toNum(a.savedAt || a.createdAt,0), sb = toNum(b.savedAt || b.createdAt,0);
      if(sa !== sb) return sb - sa;
      const ia = Array.isArray(a.inventory) ? a.inventory.length : 0;
      const ib = Array.isArray(b.inventory) ? b.inventory.length : 0;
      if(ia !== ib) return ib - ia;
      return toNum(b.balance,0) - toNum(a.balance,0);
    });
    return valid[0];
  }
  function loadState(fallback=true){
    const candidates = [];
    try{ const raw = localStorage.getItem(LS_KEY); if(raw){ storageHealth.local = true; candidates.push(parseStateRaw(raw)); } }catch(e){ storageHealth.local = false; storageHealth.lastError = e && e.name ? e.name : String(e); }
    try{ const raw = sessionStorage.getItem(BACKUP_KEY); if(raw){ storageHealth.session = true; candidates.push(parseStateRaw(raw)); } }catch(e){ storageHealth.session = false; }
    const wn = readWindowNameState(); if(wn) candidates.push(wn);
    return candidates.length ? bestState(candidates) : (fallback ? defaultState() : null);
  }
  function openIDB(){
    return new Promise((resolve, reject)=>{
      if(!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => { try{ req.result.createObjectStore(IDB_STORE); }catch(e){} };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB error'));
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
  }
  async function idbGet(){
    let db;
    try{
      db = await openIDB();
      return await new Promise((resolve,reject)=>{
        const tx = db.transaction(IDB_STORE,'readonly');
        const req = tx.objectStore(IDB_STORE).get(IDB_SAVE_ID);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error('IDB get error'));
      });
    }catch(e){ storageHealth.indexedDB = false; storageHealth.lastError = e && e.name ? e.name : String(e); return null; }
    finally{ try{ db && db.close(); }catch(e){} }
  }
  async function idbSet(raw){
    let db;
    try{
      db = await openIDB();
      await new Promise((resolve,reject)=>{
        const tx = db.transaction(IDB_STORE,'readwrite');
        tx.objectStore(IDB_STORE).put(raw, IDB_SAVE_ID);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('IDB put error'));
      });
      storageHealth.indexedDB = true;
      storageHealth.mode = storageHealth.local ? 'localStorage + IndexedDB backup' : 'IndexedDB fallback';
      return true;
    }catch(e){ storageHealth.indexedDB = false; storageHealth.lastError = e && e.name ? e.name : String(e); return false; }
    finally{ try{ db && db.close(); }catch(e){} }
  }
  async function idbDelete(){
    let db;
    try{
      db = await openIDB();
      await new Promise((resolve,reject)=>{
        const tx = db.transaction(IDB_STORE,'readwrite');
        tx.objectStore(IDB_STORE).delete(IDB_SAVE_ID);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('IDB delete error'));
      });
    }catch(e){}
    finally{ try{ db && db.close(); }catch(e){} }
  }
  async function loadStateAsync(){
    const sync = loadState(false);
    const idbRaw = await idbGet();
    const idbState = parseStateRaw(idbRaw);
    const best = bestState([sync, idbState]);
    storageHealth.mode = storageHealth.local ? 'localStorage' : (storageHealth.indexedDB ? 'IndexedDB fallback' : (storageHealth.session ? 'sessionStorage' : 'window.name / memory'));
    return best;
  }
  function save(){
    state = compactState(state);
    const raw = JSON.stringify(state);
    let okLocal = false, okSession = false, okWindow = false;
    try{ sessionStorage.setItem(BACKUP_KEY, raw); okSession = true; storageHealth.session = true; }catch(e){ storageHealth.session = false; }
    okWindow = writeWindowName(raw);
    try{
      cleanupStorageBeforeLoad();
      localStorage.setItem(LS_KEY, raw);
      okLocal = true;
      storageHealth.local = true;
    }catch(e){
      storageHealth.local = false;
      storageHealth.lastError = e && e.name ? e.name : String(e);
      try{
        for(let i=localStorage.length-1;i>=0;i--){ const k = localStorage.key(i); if(k && /cs2_case_lab/i.test(k) && k !== LS_KEY) localStorage.removeItem(k); }
        localStorage.setItem(LS_KEY, raw);
        okLocal = true;
        storageHealth.local = true;
      }catch(err){ storageHealth.lastError = err && err.name ? err.name : String(err); }
    }
    idbSet(raw).then(ok => {
      if(ok){ storageHealth.indexedDB = true; renderGlobals(); }
      else if(!okLocal && !okSession && !okWindow && !storageWarned){
        storageWarned = true;
        toast('Браузер запретил постоянное сохранение. Прогресс держится только в памяти этой вкладки.', 'bad');
      }
    });
    if(okLocal) storageHealth.mode = 'localStorage';
    else if(storageHealth.indexedDB) storageHealth.mode = 'IndexedDB fallback';
    else if(okSession) storageHealth.mode = 'sessionStorage';
    else if(okWindow) storageHealth.mode = 'window.name';
    else storageHealth.mode = 'memory';
    renderGlobals();
    return okLocal || storageHealth.indexedDB || okSession || okWindow;
  }
  function addTx(text, amount){ state.tx.unshift({id:id(), text, amount:Math.round(amount), time:Date.now()}); state.tx = state.tx.slice(0,60); }
  function earn(amount, reason='Начисление'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    state.balance = Math.round(toNum(state.balance,15000) + amount);
    state.earned += amount;
    addTx(reason, amount);
    save();
    toast(`+${fmt(amount)} · ${reason}`,'good');
  }
  function spend(amount, reason='Списание'){
    amount = Math.max(0, Math.round(toNum(amount,0)));
    state.balance = Math.round(toNum(state.balance,15000));
    if(state.balance < amount){ toast(`Недостаточно ₽LC: нужно ${fmt(amount)}, у тебя ${fmt(state.balance)}`,'bad'); save(); return false; }
    state.balance -= amount;
    state.spent += amount;
    addTx(reason, -amount);
    save();
    toast(`-${fmt(amount)} · ${reason}`,'warn');
    return true;
  }
  function addItem(base, source='drop'){
    const w = sample(wears);
    const stattrak = cryptoRandom() < 0.07 && !String(base.name).startsWith('★');
    const value = Math.max(1, Math.round(toNum(base.value,100) * w[1] * (stattrak?1.5:1) * rnd(.88,1.16)));
    const item = compactInvItem(Object.assign({}, base, {uid:id(), baseId:base.id, displayName:(stattrak?'StatTrak™ ':'') + base.name, wear:w[0], float:rnd(w[2],w[3]).toFixed(5), value, source, addedAt:Date.now()}));
    state.inventory.unshift(item);
    state.inventory = state.inventory.slice(0,600);
    save();
    return item;
  }
  function removeItems(uids){
    const set = new Set(Array.isArray(uids)?uids:[uids]);
    state.inventory = state.inventory.filter(x => !set.has(x.uid));
    state.contractSelected = (state.contractSelected||[]).filter(x => !set.has(x));
    if(set.has(state.pendingUpgrade)) state.pendingUpgrade = null;
    save();
  }
  function sellItem(uid){
    const it = state.inventory.find(x => x.uid === uid);
    if(!it) return toast('Предмет уже не найден в инвентаре','bad');
    removeItems(uid);
    state.sold += it.value;
    earn(it.value, `Продажа ${it.displayName||it.name}`);
    route();
  }

  async function boot(){
    try{
      addToasts();
      initIOSViewport();
      initScrollFix();
      initResponsiveMenu();
      initInstallPrompt();
      bindEvents();
      initMobileOnlyRuntime();
      purgeOldCaches();
      // v23: service worker отключён, чтобы телефон не держал старый JS/картинки.
      // registerServiceWorker();
      seedLive();
      renderLive();
      setInterval(fakeLive, 4800);
      routeLoading();
      try{ state = await promiseTimeout(loadStateAsync(), 900, loadState(false)); }
      catch(e){ console.warn('save load fallback', e); state = loadState(false); }
      bootLoaded = true;
      window.addEventListener('pagehide', () => { try{ save(); }catch(e){} });
      window.addEventListener('beforeunload', () => { try{ save(); }catch(e){} });
      window.addEventListener('storage', e => { if(e.key === LS_KEY || e.key === BACKUP_KEY){ state = loadState(); renderGlobals(); } });
      renderGlobals();
      save();

      // v30: страницы не ждут внешний API. Сначала мгновенно рисуем встроенный каталог,
      // затем пробуем обновить его онлайн в фоне. Поэтому вкладки не зависают на «Загружаю…».
      catalog = buildOfflineCatalog();
      updateHeroShowcase();
      seedLive(true);
      renderLive();
      route();

      promiseTimeout(loadCatalog(), 6500, null).then(online => {
        if(online && online.cases && online.cases.length){
          catalog = online;
          updateHeroShowcase();
          seedLive(true);
          renderLive();
          route();
        }
      }).catch(e => console.warn('background catalog failed', e));
    }catch(err){
      console.error('Boot failed, emergency mode:', err);
      try{ addToasts(); }catch(e){}
      try{ bindEvents(); initMobileOnlyRuntime(); }catch(e){}
      try{ catalog = buildOfflineCatalog(); updateHeroShowcase(); route(); renderGlobals(); }catch(e){}
      try{ toast('Включён аварийный мобильный режим. Обнови страницу, если интерфейс загрузился не полностью.','warn'); }catch(e){}
    }
  }
  function promiseTimeout(p, ms, fallback){
    return new Promise(resolve => {
      let done = false;
      const t = setTimeout(() => { if(!done){ done = true; resolve(fallback); } }, ms);
      Promise.resolve(p).then(v => { if(!done){ done = true; clearTimeout(t); resolve(v); } }).catch(() => { if(!done){ done = true; clearTimeout(t); resolve(fallback); } });
    });
  }
  function routeLoading(){ const r = $('[data-route-root]'); if(r) r.innerHTML = '<div class="empty">Загружаю данные...</div>'; }

  function purgeOldCaches(){
    if('caches' in window){
      caches.keys().then(keys => Promise.all(keys.filter(k => /cs2-case-lab/i.test(k)).map(k => caches.delete(k)))).catch(()=>{});
    }
    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(()=>{});
    }
  }

  async function loadJSON(url, timeoutMs=6500){
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try{
      const res = await fetch(url, {cache:'no-store', signal:controller.signal});
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }finally{ clearTimeout(timeout); }
  }
  async function loadEndpoint(name){
    const file = API_ENDPOINTS[name];
    let lastError = null;
    for(const base of API_BASES){
      try{ return await loadJSON(base + file); }
      catch(e){ lastError = e; }
    }
    throw lastError || new Error('API endpoint failed: ' + name);
  }
  async function loadCatalog(){
    try{
      const [cratesRes, stickersRes, agentsRes, patchesRes, keychainsRes, collectiblesRes, skinsRes, collectionsRes] = await Promise.allSettled([
        loadEndpoint('crates'), loadEndpoint('stickers'), loadEndpoint('agents'), loadEndpoint('patches'), loadEndpoint('keychains'), loadEndpoint('collectibles'), loadEndpoint('skins'), loadEndpoint('collections')
      ]);
      const crates = cratesRes.status === 'fulfilled' ? cratesRes.value : [];
      const stickers = stickersRes.status === 'fulfilled' ? stickersRes.value : [];
      const agents = agentsRes.status === 'fulfilled' ? agentsRes.value : [];
      const patches = patchesRes.status === 'fulfilled' ? patchesRes.value : [];
      const keychains = keychainsRes.status === 'fulfilled' ? keychainsRes.value : [];
      const collectibles = collectiblesRes.status === 'fulfilled' ? collectiblesRes.value : [];
      const skins = skinsRes.status === 'fulfilled' ? skinsRes.value : [];
      const collections = collectionsRes.status === 'fulfilled' ? collectionsRes.value : [];
      const built = buildCatalog({crates, stickers, agents, patches, keychains, collectibles, skins, collections});
      if(built.cases.length < 8 || built.items.length < 30) throw new Error('empty catalog');
      return built;
    }catch(e){
      console.warn('CS2 API fallback:', e);
      toast('Онлайн-каталог не загрузился — включил встроенный резервный пул со старыми кейсами. Механики всё равно работают.','warn');
      return buildOfflineCatalog();
    }
  }
  function buildOfflineCatalog(){
    const stickers = ['Sticker | Natus Vincere | Copenhagen 2024','Sticker | Team Spirit | Shanghai 2024','Sticker | FaZe Clan | Paris 2023','Sticker | G2 Esports | Austin 2025','Sticker | m0NESY | Copenhagen 2024'].map((n,i)=>({id:'offline-sticker-'+i,name:n,rarity:['High Grade','Remarkable','Exotic','Extraordinary'][i%4],rarityColor:rarityColors[['High Grade','Remarkable','Exotic','Extraordinary'][i%4]],value:120+i*180,weight:20-i*3,image:svgSkin(n,'#facc15','#60a5fa'),category:'sticker'}));
    const agents = ['Sir Bloody Miami Darryl | The Professionals','Cmdr. Mae | SWAT','Number K | The Professionals','Special Agent Ava | FBI'].map((n,i)=>({id:'offline-agent-'+i,name:n,rarity:['Master','Superior','Exceptional','Distinguished'][i%4],rarityColor:rarityColors[['Master','Superior','Exceptional','Distinguished'][i%4]],value:900+i*620,weight:9+i*2,image:svgSkin(n,'#111827','#f59e0b'),category:'agent'}));
    const charms = ['Charm | Hot Hands','Charm | Baby Karat T','Charm | Lil Squirt','Charm | Chicken Lil'].map((n,i)=>({id:'offline-charm-'+i,name:n,rarity:['High Grade','Remarkable','Exotic'][i%3],rarityColor:rarityColors[['High Grade','Remarkable','Exotic'][i%3]],value:180+i*190,weight:18-i*3,image:svgSkin(n,'#22c55e','#f97316'),category:'keychain'}));
    const patches = ['Patch | Metal Gold Nova','Patch | Bravo','Patch | Bayonet Frog','Patch | Phoenix'].map((n,i)=>({id:'offline-patch-'+i,name:n,rarity:['High Grade','Remarkable','Exotic'][i%3],rarityColor:rarityColors[['High Grade','Remarkable','Exotic'][i%3]],value:110+i*160,weight:18-i*3,image:svgSkin(n,'#94a3b8','#ef4444'),category:'patch'}));
    const items = [...fallbackItems, ...stickers, ...agents, ...charms, ...patches];
    const base = fallbackCases.map((c,i)=>{ const pricedItems = c.items.map(applySteamLikePrice); return withHiddenOdds(Object.assign({}, c, {items:pricedItems, price:calcPrice(pricedItems,i,'case'), profitOdds:.42 + (i%4)*.08}),i); });
    return {items, cases:[...base,
      createSpecialCase('budget-random','Budget Random Case','Mil-Spec Grade',items.filter(x=>x.value<=450),85,'Очень дешёвый рандомный пул.'),
      createSpecialCase('profit-hunter','Profit Hunter Case','Classified',items.filter(x=>x.value>=300&&x.value<=5000),780,'Скрыто более щедрый профиль окупа.'),
      createSpecialCase('highroller-red','High Roller Red Case','Covert',items.filter(x=>x.value>=900),2800,'Дорогой рискованный пул.'),
      createSpecialCase('quality-covert','Red Covert Case','Covert',items.filter(x=>x.rarity==='Covert'),2600,'Кейс с красными Covert-скинами.'),
      createSpecialCase('quality-classified','Pink Classified Case','Classified',items.filter(x=>x.rarity==='Classified'),1500,'Кейс с Classified-скинами.'),
      createSpecialCase('quality-restricted','Purple Restricted Case','Restricted',items.filter(x=>x.rarity==='Restricted'),850,'Кейс с Restricted-скинами.'),
      createSpecialCase('quality-milspec','Blue Mil-Spec Case','Mil-Spec Grade',items.filter(x=>x.rarity==='Mil-Spec Grade'),430,'Кейс с Mil-Spec-скинами.'),
      createSpecialCase('stickers-tournament','Tournament Stickers Case','High Grade',stickers,320,'Наклейки турниров.'),
      createSpecialCase('agents-case','Agents Case','Exceptional',agents,900,'Агенты CS2.'),
      createSpecialCase('charms-case','Armory Charms Case','Remarkable',charms,420,'Брелоки/charms.'),
      createSpecialCase('patches-case','Patches Case','Remarkable',patches,360,'Нашивки CS2.')
    ].filter(c=>c && c.items && c.items.length), source:'offline-fallback'};
  }
  function buildCatalog(data){
    const crates = Array.isArray(data.crates) ? data.crates : [];
    const stickersRaw = Array.isArray(data.stickers) ? data.stickers : [];
    const agentsRaw = Array.isArray(data.agents) ? data.agents : [];
    const patchesRaw = Array.isArray(data.patches) ? data.patches : [];
    const keychainsRaw = Array.isArray(data.keychains) ? data.keychains : [];
    const collectiblesRaw = Array.isArray(data.collectibles) ? data.collectibles : [];
    const skinsRaw = Array.isArray(data.skins) ? data.skins : [];
    const collectionsMetaRaw = Array.isArray(data.collections) ? data.collections : [];

    const preferredCases = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Operation Riptide Case','Snakebite Case','Horizon Case','Gamma 2 Case','Danger Zone Case','CS20 Case','Glove Case','Operation Broken Fang Case','Chroma 3 Case','Falchion Case','Shadow Case','Winter Offensive Weapon Case','Gallery Case','Fever Case','Operation Wildfire Case','Operation Vanguard Weapon Case','Huntsman Weapon Case','Operation Phoenix Weapon Case','CS:GO Weapon Case 2','CS:GO Weapon Case 3'];
    const preferredCollections = ['The Graphic Design Collection','The Sport & Field Collection','The Overpass 2024 Collection','The Gallery Collection','The Armory Collection','The Ascent Collection','The Boreal Collection','The Radiant Collection','The Anubis Collection','The 2021 Mirage Collection','The 2021 Dust 2 Collection','The 2021 Vertigo Collection','The Ancient Collection','The Norse Collection','The Canals Collection','The St. Marc Collection','The Cobblestone Collection','The Cache Collection','The Overpass Collection','The Gods and Monsters Collection','The Chop Shop Collection','The Control Collection','The Havoc Collection'];
    const casesRaw = crates.filter(c => c && /case/i.test(String(c.type || c.name || '')) && Array.isArray(c.contains) && c.contains.length > 5);
    const collectionsRaw = crates.filter(c => c && /collection/i.test(String(c.type || c.name || '')) && Array.isArray(c.contains) && c.contains.length > 5);
    const pickedCases = [];
    preferredCases.forEach(n => { const f = casesRaw.find(c => c.name === n); if(f && !pickedCases.includes(f)) pickedCases.push(f); });
    casesRaw.forEach(c => { if(pickedCases.length < 80 && !pickedCases.includes(c)) pickedCases.push(c); });
    const pickedCollections = [];
    preferredCollections.forEach(n => { const f = collectionsRaw.find(c => c.name === n); if(f && !pickedCollections.includes(f)) pickedCollections.push(f); });
    collectionsRaw.forEach(c => { if(pickedCollections.length < 50 && !pickedCollections.includes(c)) pickedCollections.push(c); });

    const all = new Map();
    function remember(items){ items.forEach(it => { if(it && it.id) all.set(it.id, it); }); return items; }
    function mapCrate(c, idx, kind='case'){
      const rawList = [...(c.contains||[]), ...(c.contains_rare||[])];
      const items = remember(rawList.map(raw => apiItem(raw, kind)).filter(Boolean));
      const price = calcPrice(items, idx, kind);
      return withHiddenOdds({id:(kind==='collection'?'col-':'case-') + (c.id || slug(c.name)), name:c.name, price, image:fixImageUrl(c.image) || svgCase(c.name), items, source:kind==='collection'?'CS2 Collection':'CS2 Case', kind, rareText:c.loot_list && c.loot_list.footer ? c.loot_list.footer : (kind==='collection'?'Коллекция CS2 с реальными названиями предметов.':'Редкий спецпредмет внутри')}, idx);
    }
    const cases = [];
    pickedCases.forEach((c,idx) => { const mapped = mapCrate(c, idx, 'case'); if(mapped.items.length) cases.push(mapped); });
    pickedCollections.forEach((c,idx) => { const mapped = mapCrate(c, idx, 'collection'); if(mapped.items.length) cases.push(mapped); });

    const stickers = remember(stickersRaw.map(x=>apiItem(x,'sticker')).filter(Boolean));
    const agents = remember(agentsRaw.map(x=>apiItem(x,'agent')).filter(Boolean));
    const patches = remember(patchesRaw.map(x=>apiItem(x,'patch')).filter(Boolean));
    const keychains = remember(keychainsRaw.map(x=>apiItem(x,'keychain')).filter(Boolean));
    const collectibles = remember(collectiblesRaw.map(x=>apiItem(x,'collectible')).filter(Boolean));
    const skinItems = remember(skinsRaw.map(x=>apiItem(x,'skin')).filter(Boolean));

    const byCollection = new Map();
    skinsRaw.forEach(raw => {
      const mapped = apiItem(raw,'skin');
      const cols = raw.collections || raw.collection || raw.crates || [];
      const arr = Array.isArray(cols) ? cols : [cols];
      arr.forEach(col => {
        const name = typeof col === 'string' ? col : (col && (col.name || col.id));
        if(!name || !mapped) return;
        if(!byCollection.has(name)) byCollection.set(name, []);
        byCollection.get(name).push(mapped);
      });
    });
    collectionsMetaRaw.forEach((col,idx) => {
      const name = col && (col.name || col.id);
      const pool = byCollection.get(name) || (Array.isArray(col && col.contains) ? col.contains.map(x=>apiItem(x,'skin')).filter(Boolean) : []);
      if(pool && pool.length >= 4){
        const cc = withHiddenOdds({id:'collection-api-'+slug(name), name, price:calcPrice(pool,idx,'collection'), image:(fixImageUrl(col.image) || svgCase(name)), items:pool, source:'CS2 Collection', kind:'collection', rareText:'Коллекция CS2 / Armory с реальными названиями предметов.'}, cases.length);
        cases.push(cc);
      }
    });

    const itemList = () => Array.from(all.values()).filter(Boolean);
    const items = itemList().length > 30 ? itemList() : fallbackItems;

    const add = c => { if(c && c.items && c.items.length >= 2) cases.push(withHiddenOdds(c, cases.length)); };
    add(createSpecialCase('budget-random','Budget Random Case','Mil-Spec Grade',items.filter(i=>toNum(i.value,0) <= 450),85,'Очень дешёвый микс: чаще низкая цена, иногда окуп.'));
    add(createSpecialCase('budget-green','Cheap Green Case','High Grade',items.filter(i=>toNum(i.value,0) <= 650 && ['High Grade','Base Grade','Industrial Grade','Mil-Spec Grade'].includes(i.rarity)),120,'Дешёвый зелёный/синий пул.'));
    add(createSpecialCase('mid-risk','Risky Mid Case','Restricted',items.filter(i=>toNum(i.value,0) >= 180 && toNum(i.value,0) <= 2600),520,'Средний риск: может дать плюс, но часто минус.'));
    add(createSpecialCase('profit-hunter','Profit Hunter Case','Classified',items.filter(i=>toNum(i.value,0) >= 300 && toNum(i.value,0) <= 5000),780,'Скрыто более щедрый профиль окупа.'));
    add(createSpecialCase('highroller-red','High Roller Red Case','Covert',items.filter(i=>toNum(i.value,0) >= 900),2800,'Дорогой рискованный пул с большими перепадами.'));
    add(createSpecialCase('quality-consumer','Grey / Consumer Case','Consumer Grade',items.filter(i=>['Consumer Grade','Base Grade'].includes(i.rarity)),120,'Низкая редкость / серый пул.'));
    add(createSpecialCase('quality-industrial','Light Blue Industrial Case','Industrial Grade',items.filter(i=>i.rarity === 'Industrial Grade'),220,'Industrial Grade пул.'));
    add(createSpecialCase('quality-green','Green High Grade / Charms Case','High Grade',items.filter(i=>['High Grade','Base Grade'].includes(i.rarity) || /charm|keychain|sticker/i.test(i.category || i.name)),310,'Зелёный пул: High Grade, брелоки и недорогие наклейки.'));
    add(createSpecialCase('quality-milspec','Blue Mil-Spec Case','Mil-Spec Grade',items.filter(i=>i.rarity === 'Mil-Spec Grade'),430,'Синий Mil-Spec пул.'));
    add(createSpecialCase('quality-restricted','Purple Restricted Case','Restricted',items.filter(i=>i.rarity === 'Restricted'),820,'Фиолетовый Restricted пул.'));
    add(createSpecialCase('quality-classified','Pink Classified Case','Classified',items.filter(i=>i.rarity === 'Classified'),1500,'Розовый Classified пул.'));
    add(createSpecialCase('quality-covert','Red Covert Case','Covert',items.filter(i=>i.rarity === 'Covert'),2700,'Красный Covert пул.'));
    add(createSpecialCase('special-knives','Knife Case','Exceedingly Rare',items.filter(i => i.name.startsWith('★') && !/gloves/i.test(i.name)),5400,'Отдельный пул ножей.'));
    add(createSpecialCase('special-gloves','Gloves Case','Extraordinary',items.filter(i => /gloves/i.test(i.name)),5200,'Отдельный пул перчаток.'));
    add(createSpecialCase('special-rare','Knives & Gloves Case','Exceedingly Rare',items.filter(i => i.name.startsWith('★') || /gloves/i.test(i.name)),6500,'Ножи и перчатки в одном дорогом кейсе.'));

    add(createSpecialCase('stickers-all','Sticker Capsule','High Grade',stickers,280,'Капсула с наклейками CS2.'));
    add(createSpecialCase('stickers-tournament','Tournament Stickers Case','Remarkable',filterByWords(stickers,['Major','Copenhagen','Shanghai','Austin','Paris','Antwerp','Stockholm','Rio','Katowice','Cologne','Berlin','Krakow','Atlanta']),360,'Турнирные наклейки.'));
    add(createSpecialCase('stickers-copenhagen','Copenhagen Stickers Capsule','Remarkable',filterByWords(stickers,['Copenhagen 2024']),390,'Наклейки Copenhagen 2024.'));
    add(createSpecialCase('stickers-shanghai','Shanghai Stickers Capsule','Remarkable',filterByWords(stickers,['Shanghai 2024']),390,'Наклейки Shanghai 2024.'));
    add(createSpecialCase('stickers-austin','Austin Stickers Capsule','Remarkable',filterByWords(stickers,['Austin 2025']),390,'Наклейки Austin 2025.'));
    add(createSpecialCase('stickers-paris','Paris Stickers Capsule','Remarkable',filterByWords(stickers,['Paris 2023']),390,'Наклейки Paris 2023.'));

    add(createSpecialCase('agents-all','Agents Case','Exceptional',agents,900,'Кейс с агентами CS2.'));
    add(createSpecialCase('agents-master','Master Agents Case','Master',agents.filter(i=>/Master/i.test(i.rarity)),2300,'Пул дорогих агентов Master.'));
    add(createSpecialCase('charms-all','Armory Charms Case','Remarkable',keychains,420,'Брелоки / charms из Armory.'));
    add(createSpecialCase('charms-small-arms','Small Arms Charms Case','Remarkable',filterByWords(keychains,['Small Arms','Charm']),470,'Брелоки Small Arms.'));
    add(createSpecialCase('patches-all','Patches Case','Remarkable',patches,330,'Кейс с нашивками.'));
    add(createSpecialCase('collectibles-all','Collectibles Case','High Grade',collectibles,260,'Коллекционные предметы.'));

    return {items, cases:dedupeCases(cases), source:'CSGO-API'};
  }
  function dedupeCases(arr){
    const seen = new Set();
    return arr.filter(c => { if(!c || !c.id || seen.has(c.id)) return false; seen.add(c.id); return true; });
  }
  function filterByWords(items, words){
    const low = words.map(w=>String(w).toLowerCase());
    return items.filter(i => low.some(w => String(i.name).toLowerCase().includes(w)));
  }
  function thematicCaseImage(name, color){
    const safe = esc(name).slice(0,16);
    const c = color || '#ff7a18';
    const c2 = c === '#22c55e' ? '#064e3b' : c === '#ef4444' ? '#7f1d1d' : c === '#4b69ff' ? '#1e3a8a' : c === '#8b5cf6' ? '#4c1d95' : c === '#ec4899' ? '#831843' : '#111827';
    const icon = /knife/i.test(name) ? '★' : /glove/i.test(name) ? '✋' : /sticker|capsule|tournament/i.test(name) ? '◆' : /agent/i.test(name) ? '♟' : /charm|keychain/i.test(name) ? '✦' : /patch/i.test(name) ? '⬢' : /green/i.test(name) ? 'GREEN' : /red|covert/i.test(name) ? 'RED' : /blue|mil/i.test(name) ? 'BLUE' : /pink|classified/i.test(name) ? 'PINK' : 'CS2';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 460"><defs><radialGradient id="r" cx="50%" cy="0%" r="80%"><stop stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></radialGradient><linearGradient id="g" x1="0" x2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="${c}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="26" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter></defs><rect width="680" height="460" rx="44" fill="#090d18"/><circle cx="135" cy="80" r="170" fill="${c}" opacity=".22"/><circle cx="550" cy="380" r="190" fill="${c}" opacity=".16"/><g filter="url(#s)"><path d="M120 165h440c24 0 43 19 43 43v230c0 24-19 43-43 43H120c-24 0-43-19-43-43V208c0-24 19-43 43-43z" fill="url(#g)" stroke="rgba(255,255,255,.22)" stroke-width="10"/><path d="M190 165v-36c0-44 32-76 76-76h148c44 0 76 32 76 76v36" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="22"/><rect x="110" y="205" width="460" height="132" rx="22" fill="url(#r)" opacity=".92"/><path d="M140 235h400M140 272h400M140 309h400" stroke="#020617" stroke-opacity=".28" stroke-width="9"/></g><text x="340" y="303" font-family="Arial" font-weight="900" font-size="76" fill="#fff" text-anchor="middle">${icon}</text><text x="340" y="392" font-family="Arial" font-weight="900" font-size="32" fill="#fff" text-anchor="middle">${safe}</text></svg>`);
  }
  function createSpecialCase(idv,name,rar,pool,price,text){
    pool = (pool || []).filter(Boolean).slice(0,240);
    if(pool.length < 2) return null;
    const items = pool.map(x => Object.assign({}, x, {weight: (rarityWeight[x.rarity] || 8) * (x.value > price ? .6 : 1.2)}));
    return {id:idv, name, price, image:thematicCaseImage(name, rarityColors[rar] || themeColor({id:idv,name})), items, source:'Custom Pool', kind:'special', rareText:text};
  }
  function withHiddenOdds(c, idx=0){
    const profiles = [
      {profitOdds:.16,jackpot:.07,cheap:.55,priceMult:1.18},
      {profitOdds:.26,jackpot:.12,cheap:.38,priceMult:1.05},
      {profitOdds:.38,jackpot:.20,cheap:.24,priceMult:1.00},
      {profitOdds:.52,jackpot:.33,cheap:.14,priceMult:.92},
      {profitOdds:.74,jackpot:.48,cheap:.08,priceMult:.84},
      {profitOdds:1.02,jackpot:.72,cheap:.04,priceMult:.78}
    ];
    const p = profiles[Math.abs(idx) % profiles.length];
    c._odds = p;
    if(!c._priced){ c.price = clamp(Math.round(toNum(c.price,300) * (p.priceMult || 1)), 45, c.kind === 'special' ? 18000 : 9000); c._priced = true; }
    return c;
  }
  function apiItem(raw, category='skin'){
    if(!raw || !raw.name) return null;
    const r = rarityName(raw, category);
    const base = applySteamLikePrice({id:raw.id || slug(raw.market_hash_name || raw.name), name:raw.name, rarity:r, rarityColor:rarityColor(raw,r), image:fixImageUrl(raw.image) || svgSkin(raw.name), category, marketHashName:raw.market_hash_name || raw.name, weight:rarityWeight[r] || 7});
    return base;
  }
  function rarityName(raw, category){
    const v = raw.rarity;
    let r = typeof v === 'string' ? v : (v && (v.name || v.id)) || raw.rarity_name || '';
    r = String(r || '').replace(/_/g,' ').trim();
    if(!r){
      if(category === 'agent') r = 'Exceptional';
      else if(category === 'sticker' || category === 'patch' || category === 'keychain') r = 'High Grade';
      else r = 'Mil-Spec Grade';
    }
    if(/master/i.test(r) && category === 'agent') return 'Master';
    if(/superior/i.test(r) && category === 'agent') return 'Superior';
    if(/exceptional/i.test(r) && category === 'agent') return 'Exceptional';
    if(/distinguished/i.test(r) && category === 'agent') return 'Distinguished';
    return r;
  }
  function rarityColor(raw,r){ return (raw.rarity && raw.rarity.color) || raw.color || rarityColors[r] || '#60a5fa'; }
  function applySteamLikePrice(it){
    const name = String(it.name || it.marketHashName || '');
    const lower = name.toLowerCase();
    const rarity = it.rarity || 'Mil-Spec Grade';
    const category = String(it.category || 'skin').toLowerCase();
    const knownRub = knownMarketRub(lower);
    const rarityBase = {
      'Consumer Grade': 18, 'Base Grade': 25, 'Industrial Grade': 65, 'Mil-Spec Grade': 170,
      'Restricted': 620, 'Classified': 2300, 'Covert': 7800, 'Contraband': 520000,
      'Exceedingly Rare': 36000, 'Extraordinary': 32000,
      'High Grade': 65, 'Remarkable': 360, 'Exotic': 1350,
      'Distinguished': 520, 'Exceptional': 1350, 'Superior': 3200, 'Master': 7600,
      'Master Agent': 7600, 'Superior Agent': 3200, 'Exceptional Agent': 1350, 'Distinguished Agent': 520
    };
    let rub = knownRub || rarityBase[rarity] || 180;

    if(!knownRub){
      const weaponTier = /ak-47|awp|m4a1-s|m4a4|desert eagle|usp-s/i.test(name) ? 1.65 : /glock|mac-10|mp9|ssg 08|famas|galil|p250|tec-9/i.test(name) ? 1.18 : 1;
      const collector = /printstream|asiimov|neo-noir|hyper beast|bloodsport|empress|vulcan|redline|case hardened|fade|doppler|slaughter|crimson web|gold arabesque|welcome to the jungle|hot rod|icarus fell|blue phosphor|wild lotus|gungnir|dragon lore|medusa|howl|hydroponic|fire serpent|fuel injector/i.test(name) ? 2.25 : 1;
      const cheapPattern = /sand dune|safari mesh|predator|storm|urban dashed|forest ddpat|groundwater|boreal forest|scorched|contractor|colony|army sheen/i.test(name) ? 0.38 : 1;
      const newCaseBump = /kilowatt|revolution|recoil|snakebite|dreams|nightmares|fracture|prisma|clutch|spectrum/i.test(name) ? 1.08 : 1;
      rub *= weaponTier * collector * cheapPattern * newCaseBump;

      if(name.startsWith('★') || /knife|bayonet|karambit|butterfly|m9|talon|kukri|skeleton|nomad|stiletto|ursus|paracord|survival|classic|flip|gut|navaja|falchion|shadow daggers/i.test(name)) rub = knifeRub(lower);
      if(/gloves/i.test(name)) rub = glovesRub(lower);
      if(category === 'sticker') rub = stickerRub(lower, rarity);
      if(category === 'patch') rub = patchRub(lower, rarity);
      if(category === 'keychain') rub = keychainRub(lower, rarity);
      if(category === 'agent') rub = agentRub(lower, rarity);
      if(category === 'collectible') rub *= 0.85;
    }

    const volatility = knownRub ? 0.08 : 0.34;
    const noise = 1 - volatility / 2 + stableNoise(name) * volatility;
    const value = Math.max(3, Math.round(rub * noise));
    return Object.assign({}, it, {
      value,
      steamUsd: Math.round((value / RUB_PER_USD) * 100) / 100,
      steamRub: value,
      currency: CURRENCY,
      priceVersion: PRICE_VERSION,
      weight: it.weight || rarityWeight[rarity] || 7
    });
  }
  function knownMarketRub(lower){
    const exact = [
      ['awp | dragon lore', 950000], ['m4a4 | howl', 580000], ['ak-47 | wild lotus', 780000], ['awp | gungnir', 820000], ['awp | medusa', 380000],
      ['awp | desert hydra', 175000], ['awp | the prince', 220000], ['ak-47 | fire serpent', 92000], ['ak-47 | hydroponic', 160000], ['ak-47 | gold arabesque', 145000],
      ['m4a1-s | knight', 155000], ['m4a4 | poseidon', 120000], ['m4a1-s | hot rod', 95000], ['m4a1-s | blue phosphor', 76000], ['m4a1-s | icarus fell', 44000],
      ['ak-47 | vulcan', 18500], ['ak-47 | fuel injector', 14000], ['ak-47 | bloodsport', 6500], ['ak-47 | the empress', 6200], ['ak-47 | head shot', 4200], ['ak-47 | redline', 2700], ['ak-47 | legion of anubis', 2100], ['ak-47 | ice coaled', 1500],
      ['awp | asiimov', 11800], ['awp | hyper beast', 6900], ['awp | neo-noir', 3300], ['awp | containment breach', 7800], ['awp | chromatic aberration', 3200], ['awp | duality', 900], ['awp | fever dream', 620], ['awp | paw', 380],
      ['m4a1-s | printstream', 8800], ['m4a1-s | hyper beast', 3800], ['m4a1-s | decimator', 1850], ['m4a1-s | nightmare', 1300], ['m4a1-s | player two', 3100], ['m4a1-s | leaded glass', 850],
      ['m4a4 | neo-noir', 3100], ['m4a4 | the emperor', 3400], ['m4a4 | desolate space', 1700], ['m4a4 | in living color', 1800], ['m4a4 | temukau', 5600],
      ['desert eagle | printstream', 6500], ['desert eagle | ocean drive', 2500], ['desert eagle | code red', 2600], ['desert eagle | golden koi', 5200], ['desert eagle | conspiracy', 1100],
      ['usp-s | kill confirmed', 7800], ['usp-s | printstream', 4800], ['usp-s | the traitor', 3200], ['usp-s | cortex', 820], ['usp-s | neo-noir', 2200],
      ['glock-18 | gamma doppler', 2600], ['glock-18 | bullet queen', 1700], ['glock-18 | water elemental', 920], ['glock-18 | vogue', 680], ['glock-18 | moonrise', 240],
      ['p250 | asiimov', 780], ['p250 | see ya later', 650], ['tec-9 | fuel injector', 650], ['tec-9 | isaac', 190], ['five-seven | hyper beast', 1800], ['five-seven | fairy tale', 950],
      ['mp9 | food chain', 720], ['mp9 | starlight protector', 1200], ['mac-10 | neon rider', 1350], ['mac-10 | disco tech', 780], ['p90 | death grip', 380], ['ssg 08 | fever dream', 390], ['ump-45 | primal saber', 680], ['famas | mecha industries', 820], ['galil ar | chatterbox', 560],
      ['sticker | crown', 45000], ['sticker | howl', 42000], ['katowice 2014', 32000], ['ibuyPower | katowice 2014', 920000], ['titan | katowice 2014', 540000], ['vox eminor | katowice 2014', 92000], ['reason gaming | katowice 2014', 250000], ['dignitas | katowice 2014', 180000]
    ];
    const found = exact.find(([key]) => lower.includes(String(key).toLowerCase()));
    return found ? found[1] : 0;
  }
  function knifeRub(lower){
    let rub = 18000;
    if(/butterfly/.test(lower)) rub = 95000;
    else if(/karambit/.test(lower)) rub = 76000;
    else if(/m9 bayonet/.test(lower)) rub = 56000;
    else if(/talon/.test(lower)) rub = 39000;
    else if(/skeleton/.test(lower)) rub = 42000;
    else if(/bayonet/.test(lower)) rub = 31000;
    else if(/kukri/.test(lower)) rub = 28000;
    else if(/stiletto|nomad|ursus|classic/.test(lower)) rub = 23000;
    else if(/flip|falchion/.test(lower)) rub = 16000;
    else if(/gut|navaja|shadow daggers/.test(lower)) rub = 9500;
    if(/emerald|sapphire|ruby|black pearl/.test(lower)) rub *= 2.9;
    else if(/gamma doppler/.test(lower)) rub *= 1.75;
    else if(/doppler|fade/.test(lower)) rub *= 1.45;
    else if(/slaughter|marble fade|tiger tooth/.test(lower)) rub *= 1.25;
    else if(/crimson web|case hardened/.test(lower)) rub *= 1.18;
    return rub;
  }
  function glovesRub(lower){
    let rub = 18000;
    if(/pandora/.test(lower)) rub = 260000;
    else if(/vice/.test(lower)) rub = 145000;
    else if(/hedge maze|superconductor/.test(lower)) rub = 120000;
    else if(/king snake/.test(lower)) rub = 56000;
    else if(/imperial plaid/.test(lower)) rub = 42000;
    else if(/sport gloves/.test(lower)) rub = 52000;
    else if(/specialist gloves/.test(lower)) rub = 36000;
    else if(/driver gloves/.test(lower)) rub = 24000;
    else if(/broken fang|hydra|bloodhound/.test(lower)) rub = 11500;
    if(/factory new|minimal wear/.test(lower)) rub *= 1.35;
    return rub;
  }
  function stickerRub(lower, rarity){
    let rub = {'High Grade':35,'Remarkable':220,'Exotic':780,'Extraordinary':3600}[rarity] || 80;
    if(/gold/.test(lower)) rub *= 8.5;
    if(/holo|lenticular|foil/.test(lower)) rub *= 2.6;
    if(/katowice 2014/.test(lower)) rub *= 120;
    if(/copenhagen|shanghai|austin|paris|antwerp|stockholm|rio/.test(lower)) rub *= 1.15;
    return rub;
  }
  function patchRub(lower, rarity){
    let rub = {'High Grade':30,'Remarkable':130,'Exotic':550,'Extraordinary':1800}[rarity] || 70;
    if(/gold|bravo|phoenix|howl/.test(lower)) rub *= 2.2;
    return rub;
  }
  function keychainRub(lower, rarity){
    let rub = {'High Grade':55,'Remarkable':180,'Exotic':620,'Extraordinary':1900}[rarity] || 110;
    if(/karat|diamond|hot hands|weapon/.test(lower)) rub *= 1.8;
    return rub;
  }
  function agentRub(lower, rarity){
    let rub = {'Distinguished':320,'Exceptional':850,'Superior':1850,'Master':5200,'Master Agent':5200}[rarity] || 750;
    if(/darryl|number k|ava|miami|bloody/.test(lower)) rub *= 1.75;
    return rub;
  }
  function stableNoise(str){
    let h=2166136261; str=String(str||'');
    for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h,16777619); }
    return ((h>>>0) % 1000) / 1000;
  }
  function calcPrice(items, idx, kind='case'){
    if(!items.length) return 300;
    const avg = weightedAverageValue(items);
    const mult = kind === 'collection' ? .34 : kind === 'special' ? .42 : .36;
    const spread = [45, 85, 150, 260, 480, 850, 1500, 2800, 5200][idx % 9];
    const raw = avg * mult + spread + idx * 9;
    return clamp(Math.round(raw), kind === 'special' ? 350 : 35, kind === 'special' ? 65000 : 14000);
  }
  function weightedAverageValue(items){
    const sumW = items.reduce((s,x)=>s+(rarityWeight[x.rarity]||x.weight||6),0) || 1;
    return items.reduce((s,x)=>s+(x.value||0)*(rarityWeight[x.rarity]||x.weight||6),0) / sumW;
  }
  function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9а-яё]+/gi,'-').replace(/^-|-$/g,''); }

  function bindEvents(){
    if(document.documentElement.dataset.bound === '1') return;
    document.documentElement.dataset.bound = '1';

    const selector = '[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]';
    let touchStart = null;
    let lastHandledAt = 0;
    let lastHandledEl = null;

    const actionHandler = e => {
      const btn = e.target && e.target.closest ? e.target.closest(selector) : null;
      if(!btn) return;
      if(btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;

      const isTouchLike = e.type === 'touchend' || (e.type === 'pointerup' && (e.pointerType === 'touch' || e.pointerType === 'pen'));
      if(isTouchLike && e.type === 'touchend' && touchStart && e.changedTouches && e.changedTouches[0]){
        const t = e.changedTouches[0];
        if(Math.abs(t.clientX - touchStart.x) > 14 || Math.abs(t.clientY - touchStart.y) > 14) return;
      }
      const now = Date.now();
      if(lastHandledEl === btn && now - lastHandledAt < 420){
        if(isTouchLike || e.type === 'click') e.preventDefault();
        return;
      }
      lastHandledEl = btn;
      lastHandledAt = now;
      if(isTouchLike){ e.preventDefault(); e.stopPropagation(); }

      if(btn.matches('[data-close-modal]')) return closeModal(btn.closest('.modal'));
      if(btn.dataset.openCase) return openCaseModal(btn.dataset.openCase, true);
      if(btn.dataset.viewCase) return openCaseModal(btn.dataset.viewCase, false);
      if(btn.dataset.sell) return sellItem(btn.dataset.sell);
      if(btn.dataset.upgradeItem){ state.pendingUpgrade = btn.dataset.upgradeItem; save(); location.href = 'upgrade.html'; return; }
      if(btn.dataset.contractItem){ toggleContract(btn.dataset.contractItem); route(); toast('Выбор контракта обновлён','good'); return; }
      const a = btn.dataset.action;
      if(a === 'spin-current-case') return spinCase(currentCase, {fast:false,count:1});
      if(a === 'spin-fast') return spinCase(currentCase, {fast:true,count:1});
      if(a === 'open-again') return spinCase(currentCase, {fast:false,count:1});
      if(a === 'open-again-fast') return spinCase(currentCase, {fast:true,count:1});
      if(a === 'open-multi') return spinCase(currentCase, {fast:true,count:btn.dataset.count||1});
      if(a === 'sell-batch') return sellBatch((btn.dataset.uids||'').split(',').filter(Boolean));
      if(a === 'redeem-promo') return redeemPromo();
      if(a === 'spin-wheel') return spinWheel();
      if(a === 'start-ad') return startAd();
      if(a === 'start-battle') return startBattle();
      if(a === 'make-contract') return makeContract();
      if(a === 'clear-contract'){ state.contractSelected=[]; save(); route(); return; }
      if(a === 'do-upgrade') return doUpgrade();
      if(a === 'sell-cheap') return sellCheap();
      if(a === 'sell-all-inventory') return sellAllInventory();
      if(a === 'reset-save') return resetSave();
      if(a === 'export-save') return exportSave();
      if(a === 'import-save') return importSave();
      if(a === 'add-debug-coins') return earn(10000, 'Тестовое начисление');
      if(a === 'install-pwa') return installPWA();
      if(a === 'show-ios') return showIOSGuide();
    };

    document.addEventListener('touchstart', e => {
      const t = e.changedTouches && e.changedTouches[0];
      touchStart = t ? {x:t.clientX, y:t.clientY} : null;
    }, {passive:true, capture:true});
    document.addEventListener('touchend', actionHandler, {passive:false, capture:true});
    if(window.PointerEvent) document.addEventListener('pointerup', actionHandler, {passive:false, capture:true});
    document.addEventListener('click', actionHandler, {capture:false});

    document.addEventListener('touchend', e => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if(!a || a.closest(selector) || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if(!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if(a.target && a.target !== '_self') return;
      if(!/\.html($|[?#])/.test(href) && !/^[a-z0-9_-]+\.html/i.test(href)) return;
      e.preventDefault();
      document.body.classList.remove('nav-open');
      location.href = href;
    }, {passive:false, capture:true});

    document.addEventListener('input', e => {
      if(['invSearch','invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'targetSearch') renderUpgradeTargets();
    });
    document.addEventListener('change', e => {
      if(['invRarity','invSort'].includes(e.target.id)) renderInventory();
      if(e.target.id === 'upgradeSource'){ state.pendingUpgrade = e.target.value; save(); renderUpgrade(); }
      if(e.target.id === 'battleCase' || e.target.id === 'battleMode') renderBattleInfo();
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') $$('.modal.show').forEach(m => { if(!m.dataset.locked) closeModal(m); }); if(e.key === 'Enter' && e.target && e.target.id === 'promoInput') redeemPromo(); });
  }

  function initMobileOnlyRuntime(){
    document.documentElement.classList.add('mobile-only-runtime');
    const unlock = () => {
      document.body.classList.remove('scroll-lock','no-scroll','lock-scroll');
      const bd = document.querySelector('.menu-backdrop');
      if(bd && !document.body.classList.contains('nav-open')) bd.style.pointerEvents = 'none';
      document.querySelectorAll('.modal:not(.show)').forEach(m => m.style.pointerEvents = 'none');
      document.querySelectorAll('.modal.show').forEach(m => m.style.pointerEvents = 'auto');
    };
    unlock();
    window.addEventListener('pageshow', unlock, {passive:true});
    setInterval(unlock, 600);
  }

  function route(){
    state = bootLoaded ? bestState([state, loadState(false)]) : loadState();
    renderGlobals();
    setActiveNav();
    const page = document.body.dataset.page || 'home';
    if(page === 'home') return renderHome();
    if(page === 'cases') return renderCases();
    if(page === 'inventory') return renderInventory();
    if(page === 'upgrade') return renderUpgrade();
    if(page === 'contracts') return renderContracts();
    if(page === 'wheel') return renderWheel();
    if(page === 'battle') return renderBattle();
    if(page === 'ads') return renderAds();
    if(page === 'promos') return renderPromos();
    if(page === 'profile') return renderProfile();
    if(page === 'install') return renderInstall();
  }
  function setActiveNav(){
    const file = location.pathname.split('/').pop() || 'index.html';
    $$('.navlinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === file));
  }
  function renderGlobals(){
    state = normalizeState(state);
    $$('.js-balance').forEach(x => x.textContent = fmt(state.balance));
    $$('.js-inv-count').forEach(x => x.textContent = String(state.inventory.length));
    $$('.js-version').forEach(x => x.textContent = VERSION);
  }
  function addToasts(){ if(!$('.toast-wrap')) document.body.insertAdjacentHTML('beforeend','<div class="toast-wrap"></div>'); }
  function toast(text,type=''){
    const wrap = $('.toast-wrap'); if(!wrap) return;
    const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = text; wrap.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(()=>el.remove(),260); }, 4200);
  }
  function openModal(sel){ const m = typeof sel === 'string' ? $(sel) : sel; if(m) m.classList.add('show'); }
  function closeModal(m){ if(!m) return; if(m.dataset.locked === '1') return toast('Окно закроется после окончания таймера','warn'); m.classList.remove('show'); }

  function seedLive(force=false){
    if(live.length && !force) return;
    live = [];
    const items = catalog.items && catalog.items.length ? catalog.items : fallbackItems;
    for(let i=0;i<12;i++){ const it = sample(items); live.push({user:sample(bots), item:it, value:Math.round((it.value||100)*rnd(.75,1.45))}); }
  }
  function fakeLive(){ const it = sample(catalog.items.length?catalog.items:fallbackItems); live.unshift({user:sample(bots),item:it,value:Math.round((it.value||100)*rnd(.8,1.5))}); live=live.slice(0,18); renderLive(); }
  function addLive(user,item){ live.unshift({user,item,value:item.value||0}); live=live.slice(0,18); renderLive(); }
  function renderLive(){
    const root = $('#liveFeed'); if(!root) return;
    root.innerHTML = live.map(x => `<div class="live-card" style="--rar:${x.item.rarityColor||'#60a5fa'}"><img src="${esc(imgSrc(x.item.image, svgSkin('CS2 Skin')))}" onerror="this.src='${svgSkin('CS2 Skin')}'" loading="lazy" referrerpolicy="no-referrer"><div><b>${esc(x.user)} выбил</b><small>${esc(x.item.name)} · ${fmt(x.value)}</small></div></div>`).join('');
  }

  function statCards(){ return `<div class="grid cards-4"><div class="stat"><small>Баланс</small><b class="js-balance">${fmt(state.balance)}</b></div><div class="stat"><small>Предметов</small><b>${state.inventory.length}</b></div><div class="stat"><small>Открыто кейсов</small><b>${state.opened}</b></div><div class="stat"><small>Заработано</small><b>${fmt(state.earned)}</b></div></div>`; }
  function itemCard(it, opts={}){
    const buttons = opts.buttons ? `<div class="item-actions">${opts.buttons}</div>` : '';
    return `<article class="item-card ${opts.selected?'selected':''}" data-uid="${esc(it.uid||'')}" data-item-id="${esc(it.id||'')}" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="item-art"><img src="${esc(imgSrc(it.image, svgSkin(it.name||'CS2 Skin')))}" onerror="this.src='${svgSkin(it.name||'CS2 Skin')}'" alt="${esc(it.name)}" loading="lazy" referrerpolicy="no-referrer"></div><h4>${esc(it.displayName||it.name)}</h4><small>${esc(it.rarity||'Skin')}${it.wear?` · ${esc(it.wear)}`:''}${it.float?` · ${esc(it.float)}`:''}</small><div class="value-row"><b>${fmt(it.value)}</b>${opts.badge?`<span class="pill">${esc(opts.badge)}</span>`:''}</div>${buttons}</article>`;
  }
  function themeColor(c){
    const key = `${c.id||''} ${c.name||''}`.toLowerCase();
    if(/green|high grade|charm|keychain/.test(key)) return '#22c55e';
    if(/red|covert/.test(key)) return '#ef4444';
    if(/pink|classified/.test(key)) return '#ec4899';
    if(/purple|restricted/.test(key)) return '#8b5cf6';
    if(/blue|mil-spec/.test(key)) return '#4b69ff';
    if(/industrial|light blue/.test(key)) return '#5e98d9';
    if(/grey|consumer/.test(key)) return '#b0c3d9';
    if(/knife|glove|rare/.test(key)) return '#ffd166';
    if(/sticker|capsule|tournament|copenhagen|shanghai|austin|paris/.test(key)) return '#facc15';
    if(/agent/.test(key)) return '#f97316';
    if(/patch/.test(key)) return '#94a3b8';
    return '#ff7a18';
  }
  function coverItems(c){
    const pool = (c && c.items ? c.items : []).filter(x=>x && x.image);
    const expensive = [...pool].sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,8);
    const byRarity = [...pool].sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0)).slice(0,8);
    const merged = [];
    [...expensive, ...byRarity, ...pool].forEach(x => { if(merged.length < 5 && !merged.some(m=>m.id===x.id)) merged.push(x); });
    return merged.slice(0,5);
  }
  function caseVisual(c, big=false){
    const color = themeColor(c);
    const classes = big ? 'case-visual big' : 'case-visual';
    const isClassic = c && (c.kind === 'case' || c.kind === 'collection' || c.source === 'offline-classic');
    const covers = isClassic ? [] : coverItems(c);
    const coverHtml = covers.length ? `<div class="case-cover-items">${covers.map((x,i)=>`<img class="cover-${i}" src="${esc(imgSrc(x.image, svgSkin(x.name)))}" onerror="this.remove()" alt="${esc(x.name)}" loading="lazy" referrerpolicy="no-referrer">`).join('')}</div>` : '';
    return `<div class="${classes} ${isClassic?'classic-case':''}" style="--theme:${color}"><img class="case-img ${big?'big':''}" src="${esc(imgSrc(c.image, svgCase(c.name)))}" onerror="this.src='${svgCase(c.name)}'" alt="${esc(c.name)}" loading="lazy" referrerpolicy="no-referrer">${coverHtml}<span class="case-sheen"></span></div>`;
  }
  function caseCard(c){
    const kindLabel = c.kind === 'collection' ? 'Коллекция' : c.kind === 'special' ? 'Особый пул' : 'Кейс';
    return `<article class="case-card" style="--theme:${themeColor(c)}"><span class="case-kind">${esc(kindLabel)}</span><span class="price-tier">${c.price<750?'дешёвый':c.price>6500?'дорогой':'средний'}</span>${caseVisual(c)}<h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b>${fmt(c.price)}</b></div><div class="mini-list">${[...new Set(c.items.map(i=>i.rarity))].slice(0,5).map(r=>`<span class="pill">${esc(r)}</span>`).join('')}</div><small class="source">${esc(c.source||catalog.source)}</small><div class="case-actions"><button class="btn primary" data-open-case="${esc(c.id)}">Крутить</button><button class="btn" data-view-case="${esc(c.id)}">Пул</button></div></article>`;
  }
  function renderHome(){
    updateHeroShowcase();
    const root = $('#homeRoot'); if(!root) return;
    const top = [...catalog.items].sort((a,b)=>b.value-a.value).slice(0,8);
    root.innerHTML = `${statCards()}<section class="block"><div class="head"><div><h2>Популярные кейсы</h2><p>Кнопка «Крутить» сразу открывает модальное окно, списывает баланс и запускает рулетку.</p></div><a class="btn primary" href="cases.html">Все кейсы</a></div><div class="grid case-grid">${catalog.cases.slice(0,6).map(caseCard).join('')}</div></section><section class="block"><div class="head"><div><h2>Редкие дропы</h2><p>Скины из текущего пула CS2.</p></div><a class="btn" href="ads.html">Получить ₽LC</a></div><div class="grid item-grid">${top.map(x=>itemCard(x,{badge:'топ'})).join('')}</div></section>`;
  }

  function updateHeroShowcase(){
    // mobile build: на главной оставляем жёстко заданные реальные URL картинок, не заменяем их SVG/API.
    return;
  }

  function renderCases(){
    const root = $('#casesRoot'); if(!root) return;
    const classicRx = /Kilowatt|Revolution|Recoil|Dreams|Nightmares|Fracture|Clutch|Prisma|Spectrum|Snakebite|Horizon|Gamma|Danger Zone|CS20|Glove|Broken Fang|Chroma|Falchion|Shadow|Wildfire|Vanguard|Huntsman|Phoenix/i;
    const classic = catalog.cases.filter(c=>c.kind==='case' && classicRx.test(c.name)).slice(0,24);
    const classicIds = new Set(classic.map(c=>c.id));
    const officialRest = catalog.cases.filter(c=>c.kind==='case' && !classicIds.has(c.id));
    const groups = [
      ['Классические CS2-кейсы', classic],
      ['Официальные оружейные кейсы', officialRest],
      ['Коллекции CS2 / Armory Pass', catalog.cases.filter(c=>c.kind==='collection')],
      ['Кейсы по качеству / цвету', catalog.cases.filter(c=>/^quality-/.test(c.id))],
      ['Ножи и перчатки', catalog.cases.filter(c=>/^special-/.test(c.id))],
      ['Турнирные наклейки', catalog.cases.filter(c=>/^stickers-/.test(c.id))],
      ['Агенты, брелоки, нашивки', catalog.cases.filter(c=>/^(agents|charms|patches|collectibles)-/.test(c.id))]
    ];
    root.innerHTML = `<div class="notice"><b>Каталог обновлён:</b> классические CS2-кейсы, коллекции, quality-пулы, стикеры, агенты, брелоки и нашивки. Доступны x3/x5/x10 и быстрое открытие.</div>${groups.map(([title,arr]) => arr.length ? `<section class="block"><div class="head"><h2>${title}</h2><p>${arr.length} шт.</p></div><div class="case-grid grid">${arr.map(caseCard).join('')}</div></section>` : '').join('')}`;
  }
  function openCaseModal(caseId, autoSpin){
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    currentCase = c.id;
    $('#caseModalTitle').textContent = c.name;
    const content = [...c.items].sort((a,b)=>(rarityValue[a.rarity]||0)-(rarityValue[b.rarity]||0)).map(x=>caseContentCard(x)).join('');
    $('#caseModalBody').innerHTML = `<div class="case-open-layout"><aside class="open-aside">${caseVisual(c,true)}<div class="notice">Цена открытия: <b>${fmt(c.price)}</b><br>${esc(c.rareText||'Внутри могут быть редкие предметы.')}</div><button class="btn primary huge" data-action="spin-current-case">Открыть 1x за ${fmt(c.price)}</button><button class="btn blue huge" data-action="spin-fast">Открыть быстро 1x</button><div class="multi-open-row"><button class="small-btn" data-action="open-multi" data-count="3">Быстро x3 · ${fmt(c.price*3)}</button><button class="small-btn" data-action="open-multi" data-count="5">Быстро x5 · ${fmt(c.price*5)}</button><button class="small-btn" data-action="open-multi" data-count="10">Быстро x10 · ${fmt(c.price*10)}</button></div><button class="btn" data-action="add-debug-coins">+10 000 ₽LC для теста</button><p class="small">Стрелка по центру показывает предмет при обычном прокруте. Быстрое открытие пропускает анимацию и сразу начисляет дроп.</p></aside><section class="case-main"><div class="roulette-box"><div class="roulette-center-arrow"><span></span></div><div class="roulette-pointer"></div><div class="roulette-strip" id="rouletteStrip">${Array.from({length:20},()=>rollCard(weighted(c))).join('')}</div></div><h3>Содержимое кейса</h3><div class="case-contents">${content}</div></section></div>`;
    openModal('#caseModal');
    if(autoSpin) setTimeout(() => spinCase(c.id), 120);
  }
  function caseContentCard(it){
    return `<article class="content-card" style="--rar:${it.rarityColor||'#60a5fa'}"><div class="content-art"><img src="${esc(imgSrc(it.image, svgSkin(it.name||'CS2 Skin')))}" onerror="this.src='${svgSkin(it.name||'CS2 Skin')}'" alt="${esc(it.name)}" loading="lazy" referrerpolicy="no-referrer"></div><b>${esc(it.name)}</b><small>${esc(it.rarity||'Skin')}</small><span>${fmt(it.value)}</span></article>`;
  }
  function rollCard(it){ return `<div class="roll-card" style="--rar:${it.rarityColor||'#60a5fa'}"><img src="${esc(imgSrc(it.image, svgSkin(it.name||'Skin')))}" onerror="this.src='${svgSkin(it.name||'Skin')}'" loading="lazy" referrerpolicy="no-referrer"><b>${esc(it.name)}</b></div>`; }
  function weighted(c){
    const pool = c && c.items && c.items.length ? c.items : fallbackItems;
    const weights = pool.map(it => hiddenCaseWeight(it,c));
    const total = weights.reduce((s,x)=>s+x,0) || 1;
    let r = cryptoRandom() * total;
    for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
    return pool[pool.length-1];
  }
  function hiddenCaseWeight(it,c){
    let w = Math.max(0.01, toNum(it.weight, rarityWeight[it.rarity] || 6));
    const price = Math.max(1, toNum(c && c.price, 1));
    const ratio = toNum(it.value,0) / price;
    const odds = (c && c._odds) || {profitOdds:.42,jackpot:.25,cheap:.1};
    if(ratio >= 1) w *= odds.profitOdds;
    if(ratio >= 1.35) w *= (odds.profitOdds * 0.9);
    if(ratio >= 2.2) w *= odds.jackpot;
    if(ratio < .55) w *= (1 + odds.cheap);
    if(ratio < .25) w *= (1 + odds.cheap * 0.8);
    if(c && c.kind === 'special') w *= ratio >= 1 ? 0.76 : 1.12;
    w *= rnd(.86, 1.18);
    return w;
  }
  function spinCase(caseId, opts={}){
    if(busy.case) return toast('Рулетка уже крутится','warn');
    const c = catalog.cases.find(x => x.id === caseId);
    if(!c) return toast('Кейс не найден','bad');
    const fast = !!(opts && opts.fast);
    const count = clamp(Math.round(toNum(opts && opts.count, 1)), 1, 25);
    const totalCost = Math.max(1, Math.round(toNum(c.price,0) * count));
    if(!spend(totalCost, count > 1 ? `Открытие ${c.name} x${count}` : `Открытие ${c.name}`)) return;
    state.opened += count;
    save();
    busy.case = true;
    const buttons = $$('[data-action="spin-current-case"],[data-action="spin-fast"],[data-action="open-multi"],[data-action="open-again"],[data-action="open-again-fast"]');
    buttons.forEach(b => b.disabled = true);
    const mainBtn = $('[data-action="spin-current-case"]'); if(mainBtn) mainBtn.textContent = fast || count > 1 ? 'Открываю...' : 'Крутится...';

    if(fast || count > 1){
      const drops = Array.from({length:count}, () => addItem(weighted(c), c.name));
      drops.forEach(d => addLive('Ты', d));
      busy.case = false;
      buttons.forEach(b => b.disabled = false);
      if(mainBtn) mainBtn.textContent = `Открыть 1x за ${fmt(c.price)}`;
      if(count === 1) showDrop(drops[0], c); else showBatchDrop(drops, c, totalCost);
      return;
    }

    const strip = $('#rouletteStrip'); const box = strip && strip.closest('.roulette-box');
    const win = weighted(c); const winIndex = 41;
    if(!strip || !box){ finishDrop(win,c,mainBtn); return; }
    const cards = Array.from({length:62},(_,i)=> i===winIndex ? win : weighted(c));
    strip.style.transition='none'; strip.style.transform='translateX(0px)'; strip.innerHTML = cards.map(rollCard).join('');
    strip.getBoundingClientRect();
    requestAnimationFrame(() => {
      const card = strip.children[winIndex];
      const target = Math.max(0, card.offsetLeft - box.clientWidth/2 + card.clientWidth/2 + rnd(-18,18));
      strip.style.transition='transform 4.6s cubic-bezier(.08,.75,.08,1)';
      strip.style.transform=`translateX(-${target}px)`;
    });
    setTimeout(() => finishDrop(win,c,mainBtn), 4850);
  }
  function finishDrop(win,c,btn){
    const inv = addItem(win, c.name);
    addLive('Ты', inv);
    busy.case = false;
    $$('[data-action="spin-current-case"],[data-action="spin-fast"],[data-action="open-multi"],[data-action="open-again"],[data-action="open-again-fast"]').forEach(b => b.disabled=false);
    if(btn){ btn.disabled=false; btn.textContent=`Открыть 1x за ${fmt(c.price)}`; }
    showDrop(inv, c);
  }
  function showDrop(it,c){
    $('#dropModalBody').innerHTML = `<div class="drop-box"><p class="kicker">Выпал предмет</p><img class="drop-img" src="${esc(imgSrc(it.image, svgSkin(it.name)))}" onerror="this.src='${svgSkin(it.name)}'" loading="lazy" referrerpolicy="no-referrer"><h2 style="color:${it.rarityColor||'#fff'}">${esc(it.displayName||it.name)}</h2><p>${esc(it.rarity)} · ${esc(it.wear||'')} · float ${esc(it.float||'')}</p><h3>${fmt(it.value)}</h3><div class="drop-actions"><button class="btn green" data-sell="${esc(it.uid)}">Продать за ${fmt(it.value)}</button><button class="btn" data-close-modal>Оставить</button><button class="btn blue" data-upgrade-item="${esc(it.uid)}">В апгрейд</button><button class="btn" data-contract-item="${esc(it.uid)}">В контракт</button>${c?`<button class="btn primary" data-action="open-again">Открыть ещё</button><button class="btn blue" data-action="open-again-fast">Быстро ещё</button>`:''}</div></div>`;
    openModal('#dropModal');
  }

  function showBatchDrop(items,c,totalCost){
    items = Array.isArray(items) ? items.filter(Boolean) : [];
    const totalValue = items.reduce((sum,it)=>sum + toNum(it.value,0),0);
    const profit = Math.round(totalValue - toNum(totalCost,0));
    const uids = items.map(x=>x.uid).join(',');
    $('#dropModalBody').innerHTML = `<div class="drop-box batch-drop"><p class="kicker">Массовое открытие</p><h2>${esc(c && c.name ? c.name : 'Кейс')} · x${items.length}</h2><div class="batch-summary"><span>Потрачено: <b>${fmt(totalCost)}</b></span><span>Выпало на: <b>${fmt(totalValue)}</b></span><span class="${profit>=0?'plus':'minus'}">Итог: <b>${profit>=0?'+':''}${fmt(profit)}</b></span></div><div class="batch-grid">${items.map(it=>itemCard(it,{badge:'drop'})).join('')}</div><div class="drop-actions"><button class="btn green" data-action="sell-batch" data-uids="${esc(uids)}">Продать всё за ${fmt(totalValue)}</button><button class="btn" data-close-modal>Оставить всё</button>${c?`<button class="btn primary" data-action="open-multi" data-count="${items.length}">Открыть ещё x${items.length}</button><button class="btn blue" data-action="open-again-fast">Быстро 1x</button>`:''}</div></div>`;
    openModal('#dropModal');
  }
  function sellBatch(uids){
    const set = new Set(Array.isArray(uids)?uids:[]);
    const items = state.inventory.filter(x => set.has(x.uid));
    if(!items.length) return toast('Эти предметы уже проданы или не найдены','bad');
    const total = items.reduce((s,x)=>s+toNum(x.value,0),0);
    removeItems(items.map(x=>x.uid));
    state.sold += Math.round(total);
    earn(total, `Массовая продажа x${items.length}`);
    closeModal($('#dropModal'));
    route();
  }

  function renderInventory(){
    state = bestState([state, loadState(false)]);
    renderGlobals();
    const root = $('#inventoryRoot'); if(!root) return;
    const controls = $('#inventoryControls');
    const prevQ = ($('#invSearch') && $('#invSearch').value || '').toLowerCase().trim();
    const prevR = $('#invRarity') ? $('#invRarity').value : 'all';
    const prevS = $('#invSort') ? $('#invSort').value : 'new';
    const fullInv = [...state.inventory].map(normalizeInvItem).filter(Boolean);
    const fullTotal = fullInv.reduce((sum,x)=>sum + toNum(x.value,0),0);
    const avgValue = fullInv.length ? Math.round(fullTotal / fullInv.length) : 0;
    const rarities = [...new Set(fullInv.map(x=>x.rarity).filter(Boolean))].sort((a,b)=>(rarityValue[b]||0)-(rarityValue[a]||0));
    if(controls){
      controls.innerHTML = `<div class="inventory-topline"><div class="inv-total-card"><small>Стоимость инвентаря</small><b>${fmt(fullTotal)}</b><span>${fullInv.length} предметов · среднее ${fmt(avgValue)}</span></div><div class="inv-total-actions"><button class="btn green" data-action="sell-all-inventory" ${fullInv.length?'':'disabled'}>Продать всё</button><button class="small-btn" data-action="sell-cheap" ${fullInv.length?'':'disabled'}>Продать дешевле 200 ₽LC</button></div></div><div class="filters"><input id="invSearch" placeholder="Поиск по названию" value="${esc(prevQ)}"><select id="invRarity"><option value="all">Все редкости</option>${rarities.map(x=>`<option value="${esc(x)}" ${prevR===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="invSort"><option value="new" ${prevS==='new'?'selected':''}>Сначала новые</option><option value="valueDesc" ${prevS==='valueDesc'?'selected':''}>Сначала дорогие</option><option value="valueAsc" ${prevS==='valueAsc'?'selected':''}>Сначала дешёвые</option><option value="rarity" ${prevS==='rarity'?'selected':''}>По редкости</option></select></div>`;
    }
    const q = ($('#invSearch') && $('#invSearch').value || prevQ).toLowerCase().trim();
    const r = $('#invRarity') ? $('#invRarity').value : prevR;
    const srt = $('#invSort') ? $('#invSort').value : prevS;
    let arr = [...fullInv];
    if(q) arr = arr.filter(x => (x.displayName||x.name).toLowerCase().includes(q));
    if(r !== 'all') arr = arr.filter(x => x.rarity === r);
    if(srt === 'valueDesc') arr.sort((a,b)=>b.value-a.value);
    else if(srt === 'valueAsc') arr.sort((a,b)=>a.value-b.value);
    else if(srt === 'rarity') arr.sort((a,b)=>(rarityValue[b.rarity]||0)-(rarityValue[a.rarity]||0));
    else arr.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    const visibleTotal = arr.reduce((sum,x)=>sum + toNum(x.value,0),0);
    root.innerHTML = arr.length ? `<div class="notice inv-visible-summary"><b>Показано:</b> ${arr.length} из ${fullInv.length} предметов · сумма видимых: <b>${fmt(visibleTotal)}</b></div><div class="grid item-grid">${arr.map(x=>itemCard(x,{buttons:`<button data-sell="${esc(x.uid)}">Продать</button><button data-upgrade-item="${esc(x.uid)}">Апгрейд</button><button data-contract-item="${esc(x.uid)}">Контракт</button>`})).join('')}</div>` : `<div class="empty"><h3>Инвентарь пуст</h3><p>Открой кейс, выиграй battle или прокрути колесо. Если только что обновлял сайт на GitHub Pages — нажми Ctrl+F5, чтобы браузер не держал старый cache.</p><a class="btn primary" href="cases.html">К кейсам</a></div>`;
  }
  function sellAllInventory(){
    const items = [...state.inventory].map(normalizeInvItem).filter(Boolean);
    if(!items.length) return toast('Инвентарь пуст','warn');
    const total = Math.round(items.reduce((sum,x)=>sum + toNum(x.value,0),0));
    if(!confirm(`Продать весь инвентарь: ${items.length} предметов за ${fmt(total)}?`)) return;
    removeItems(items.map(x=>x.uid));
    state.sold += total;
    earn(total, `Продажа всего инвентаря x${items.length}`);
    renderInventory();
  }
  function sellCheap(){
    const cheap = state.inventory.filter(x => x.value < 200);
    if(!cheap.length) return toast('Нет предметов дешевле 200 ₽LC','warn');
    const total = cheap.reduce((s,x)=>s+x.value,0);
    removeItems(cheap.map(x=>x.uid));
    state.sold += total;
    earn(total, `Массовая продажа ${cheap.length} предметов`);
    renderInventory();
  }

  let currentTarget = null;
  function renderUpgrade(){
    const root = $('#upgradeRoot'); if(!root) return;
    const selected = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0] || null;
    if(selected) state.pendingUpgrade = selected.uid;
    const options = state.inventory.map(x=>`<option value="${esc(x.uid)}" ${selected&&selected.uid===x.uid?'selected':''}>${esc(x.displayName||x.name)} · ${fmt(x.value)}</option>`).join('');
    root.innerHTML = `<div class="upgrade-layout"><aside class="panel"><h3>Твой предмет</h3>${selected?itemCard(selected):'<div class="empty">Нет предмета</div>'}<select id="upgradeSource">${options}</select><div id="upgradeChance"></div><button class="btn primary huge" data-action="do-upgrade" ${selected?'':'disabled'}>Апгрейд</button><p class="small">При проигрыше предмет исчезает. Это локальный фан-симулятор.</p></aside><section><div class="upgrade-roulette" id="upgradeRoulette"><div class="upgrade-arrow"></div><div class="upgrade-lane" id="upgradeLane"><span class="zone lose">LOSE</span><span class="zone win">WIN</span><span class="zone lose">LOSE</span></div></div><div class="filters"><input id="targetSearch" placeholder="Поиск цели"></div><div id="upgradeTargets" class="target-row"></div></section></div>`;
    renderUpgradeTargets();
  }
  function renderUpgradeTargets(){
    const selected = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0] || null;
    const q = ($('#targetSearch') && $('#targetSearch').value || '').toLowerCase();
    let targets = catalog.items.filter(x => !selected || x.value > selected.value * 1.15);
    if(q) targets = targets.filter(x => x.name.toLowerCase().includes(q));
    targets = targets.sort((a,b)=>a.value-b.value).slice(0,60);
    currentTarget = targets[0] || null;
    const box = $('#upgradeTargets'); if(!box) return;
    box.innerHTML = targets.map((x,i)=>itemCard(x,{selected:i===0,badge:'цель'})).join('') || '<div class="empty">Целей дороже текущего предмета не найдено.</div>';
    $$('#upgradeTargets .item-card').forEach((card,i)=>card.addEventListener('click',()=>{
      $$('#upgradeTargets .item-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected'); currentTarget = targets[i]; updateUpgradeChance();
    }));
    updateUpgradeChance();
  }
  function chance(src,tgt){
    if(!src || !tgt) return 0;
    const ratio = toNum(src.value,0) / Math.max(1, toNum(tgt.value,1));
    // House-edge upgrade formula: чем дороже цель, тем ниже шанс. Максимум урезан, чтобы апгрейд не превращался в постоянную победу.
    return clamp(ratio * 67, 0.35, 58);
  }
  function updateUpgradeChance(){
    const src = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0] || null;
    const ch = chance(src,currentTarget);
    const el = $('#upgradeChance');
    if(el) el.innerHTML = src && currentTarget ? `<p>Цель: <b>${esc(currentTarget.name)}</b> · ${fmt(currentTarget.value)}</p><div class="chance"><span style="width:${ch}%"></span></div><b>${ch.toFixed(2)}%</b>` : '';
    const win = $('#upgradeLane .win'); if(win) win.style.width = `${clamp(ch,4,76)}%`;
  }
  function doUpgrade(){
    if(busy.upgrade) return toast('Апгрейд уже крутится','warn');
    const src = state.inventory.find(x=>x.uid===state.pendingUpgrade) || state.inventory[0];
    const tgt = currentTarget;
    if(!src || !tgt) return toast('Выбери предмет и цель','bad');
    const ch = chance(src,tgt);
    busy.upgrade = true;
    const btn = $('[data-action="do-upgrade"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    const lane = $('#upgradeLane');
    const success = cryptoRandom() < (ch / 100);
    const winStart = 50 - ch/2;
    const winEnd = 50 + ch/2;
    const stopPercent = success ? rnd(winStart+1, winEnd-1) : (cryptoRandom()<.5 ? rnd(2, Math.max(3,winStart-1)) : rnd(Math.min(97,winEnd+1),98));
    if(lane){
      lane.style.transition='none'; lane.style.transform='translateX(0)'; lane.getBoundingClientRect();
      requestAnimationFrame(()=>{ lane.style.transition='transform 3.6s cubic-bezier(.08,.75,.08,1)'; lane.style.transform=`translateX(calc(-${stopPercent}% + 50%))`; });
    }
    setTimeout(()=>{
      removeItems(src.uid); state.upgrades += 1;
      if(success){ const win = addItem(tgt,'upgrade'); state.pendingUpgrade=win.uid; addLive('Ты',win); toast(`Апгрейд успешен: ${win.displayName}`,'good'); showDrop(win,null); }
      else{ state.pendingUpgrade=null; toast('Апгрейд не прошёл, предмет сгорел','bad'); }
      busy.upgrade=false; save(); renderUpgrade();
    }, 3900);
  }

  function toggleContract(uid){
    const set = new Set(state.contractSelected||[]);
    if(set.has(uid)) set.delete(uid); else if(set.size < 10) set.add(uid); else return toast('В контракт можно максимум 10 предметов','bad');
    state.contractSelected = Array.from(set); save();
  }
  function renderContracts(){
    const root = $('#contractsRoot'); if(!root) return;
    const set = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(x=>set.has(x.uid));
    const total = selected.reduce((s,x)=>s+x.value,0);
    root.innerHTML = `<div class="contract-layout"><aside class="panel"><h3>Контракт</h3><div class="big-count">${selected.length}/10</div><p>Минимум 3 предмета.</p><p>Сумма: <b>${fmt(total)}</b></p><p>Примерный результат: <b>${fmt(total*rnd(1.05,1.85))}</b></p><button class="btn primary huge" data-action="make-contract" ${selected.length>=3?'':'disabled'}>Создать контракт</button><button class="btn" data-action="clear-contract">Очистить</button></aside><section><div class="grid item-grid">${state.inventory.map(x=>itemCard(x,{selected:set.has(x.uid),buttons:`<button data-contract-item="${esc(x.uid)}">${set.has(x.uid)?'Убрать':'Добавить'}</button>`})).join('') || '<div class="empty">Нет предметов.</div>'}</div></section></div>`;
  }
  function makeContract(){
    const set = new Set(state.contractSelected||[]);
    const selected = state.inventory.filter(x=>set.has(x.uid));
    if(selected.length < 3) return toast('Нужно минимум 3 предмета','bad');
    const total = selected.reduce((s,x)=>s+x.value,0);
    let candidates = catalog.items.filter(x => x.value >= total*.5 && x.value <= total*2.3);
    if(!candidates.length) candidates = catalog.items;
    const base = Object.assign({}, sample(candidates), {value:Math.round(total*rnd(.92,1.9))});
    removeItems(selected.map(x=>x.uid));
    state.contractSelected=[]; state.contracts += 1;
    const reward = addItem(base,'contract'); addLive('Ты',reward); save(); renderContracts(); showDrop(reward,null);
    toast(`Контракт создан: ${reward.displayName}`,'good');
  }

  function cooldownLeft(){ return Math.max(0, (state.lastWheelAt || 0) + WHEEL_COOLDOWN - Date.now()); }
  function formatTime(ms){ const s=Math.ceil(ms/1000); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; return h>0?`${h}ч ${m}м ${sec}с`:`${m}м ${sec}с`; }
  function renderWheel(){
    const root = $('#wheelRoot'); if(!root) return;
    const left = cooldownLeft();
    root.innerHTML = `<div class="wheel-page"><div class="wheel-pointer"></div><div class="wheel" id="wheel"><span>LAB</span></div><button class="btn primary huge" data-action="spin-wheel" ${left?'disabled':''}>${left?'Доступно через '+formatTime(left):'Крутить бонусное колесо'}</button><div class="notice">Лимит: 1 прокрутка в 2 часа. После остановки сразу начисляет ₽LC или предмет.</div><div id="wheelResult" class="wheel-result"></div></div>`;
    if(left) setTimeout(renderWheel, Math.min(left, 1000));
  }
  function spinWheel(){
    if(busy.wheel) return toast('Колесо уже крутится','warn');
    const left = cooldownLeft();
    if(left) return toast(`Колесо будет доступно через ${formatTime(left)}`,'warn');
    busy.wheel = true;
    state.lastWheelAt = Date.now(); save();
    const btn = $('[data-action="spin-wheel"]'); if(btn){ btn.disabled=true; btn.textContent='Крутится...'; }
    const rewards = [
      ['+250 ₽LC','coins',250],['+500 ₽LC','coins',500],['+750 ₽LC','coins',750],['+1 000 ₽LC','coins',1000],['+2 500 ₽LC','coins',2500],['Промо +1 500 ₽LC','coins',1500],['Случайный скин','item',0],['Редкий скин','rare',0]
    ];
    const idx = Math.floor(cryptoRandom()*rewards.length);
    wheelDeg += 360*6 + (360 - idx*45) + rnd(8,35);
    const wh = $('#wheel'); if(wh) wh.style.transform = `rotate(${wheelDeg}deg)`;
    setTimeout(()=>{
      const [label,type,amount] = rewards[idx];
      if(type === 'coins'){ earn(amount,'Бонусное колесо'); $('#wheelResult').innerHTML = `<div class="result-card"><h2>${esc(label)}</h2><p>Баланс обновлён: ${fmt(state.balance)}</p></div>`; }
      else{
        let pool = catalog.items;
        if(type === 'rare') pool = catalog.items.filter(x => ['Classified','Covert','Exceedingly Rare','Extraordinary'].includes(x.rarity));
        const it = addItem(sample(pool.length?pool:catalog.items),'wheel'); addLive('Ты',it); $('#wheelResult').innerHTML = itemCard(it,{badge:'колесо'});
      }
      busy.wheel=false; renderWheel();
    }, 3300);
  }

  function todayAdViews(){ const k = DAY_KEY(); return Math.max(0, Math.round(toNum(state.adViews && state.adViews[k],0))); }
  function renderAds(){
    const root = $('#adsRoot'); if(!root) return;
    const used = todayAdViews();
    root.innerHTML = `<div class="ad-card"><div><span class="kicker">Реклама своих проектов</span><h2>10 секунд просмотра = ${fmt(AD_REWARD)}</h2><p>Окно рекламы нельзя закрыть до конца таймера. Лимит в статической версии: ${AD_DAILY_LIMIT} просмотров в сутки на браузер/устройство.</p><button class="btn primary huge" data-action="start-ad" ${used>=AD_DAILY_LIMIT?'disabled':''}>${used>=AD_DAILY_LIMIT?'Лимит на сегодня исчерпан':'Смотреть рекламу'}</button><p class="small">Сегодня использовано: <b>${used}/${AD_DAILY_LIMIT}</b></p></div><div class="project-grid">${projectCards()}</div></div>`;
  }
  function projectCards(){
    const p = [['Портфолио','Сайт-визитка и проекты','#'],['YouTube / видео','Ролики, конференции, обзоры','#'],['Подкаст','Финансы и учебные задания','#'],['GitHub','HTML-проекты и демо','#']];
    return p.map(x=>`<a class="project-card" href="${x[2]}"><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></a>`).join('');
  }
  function startAd(){
    if(busy.ad) return;
    const used = todayAdViews();
    if(used >= AD_DAILY_LIMIT) return toast('Лимит рекламы на сегодня исчерпан','warn');
    busy.ad = true;
    const modal = document.createElement('div');
    modal.className = 'modal show ad-lock-modal'; modal.dataset.locked = '1';
    modal.innerHTML = `<div class="modal-card ad-watch"><div class="modal-head"><h3>Реклама проекта</h3><button class="close" data-close-modal title="Закроется после таймера">×</button></div><div class="modal-body"><div class="ad-card"><div><span class="kicker">Просмотр ${fmt(AD_REWARD)}</span><h2 id="adLockTitle">Осталось 10 секунд</h2><p>Закрытие заблокировано до конца просмотра.</p><div class="progress"><span id="adProgress"></span></div><p id="adTimer">10 сек.</p></div><div class="project-grid">${projectCards()}</div></div></div></div>`;
    document.body.appendChild(modal);
    const bar = $('#adProgress', modal); const timer = $('#adTimer', modal); const title = $('#adLockTitle', modal);
    let sec = 10; if(bar) bar.style.width='0%';
    const int = setInterval(()=>{
      sec--; if(bar) bar.style.width = `${(10-sec)*10}%`; if(timer) timer.textContent = sec>0 ? `${sec} сек.` : 'Готово'; if(title) title.textContent = sec>0 ? `Осталось ${sec} сек.` : 'Просмотр завершён';
      if(sec <= 0){
        clearInterval(int);
        const k = DAY_KEY(); state.adViews[k] = todayAdViews() + 1;
        earn(AD_REWARD,'Просмотр рекламы');
        busy.ad=false; modal.dataset.locked='0';
        modal.querySelector('.close').textContent = '×';
        setTimeout(()=>{ closeModal(modal); modal.remove(); renderAds(); }, 700);
      }
    },1000);
  }

  function renderBattle(){
    const root = $('#battleRoot'); if(!root) return;
    const first = catalog.cases[0];
    root.innerHTML = `<div class="battle-layout improved-battle"><aside class="panel battle-sidebar"><span class="kicker">Case Battle</span><h3>Баттл против ботов</h3><p>Ты оплачиваешь своё место. Каждый игрок открывает один и тот же кейс. Победитель по сумме дропа забирает весь пул.</p><label class="field-label">Кейс</label><select id="battleCase">${catalog.cases.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${fmt(c.price)}</option>`).join('')}</select><label class="field-label">Режим</label><select id="battleMode"><option value="1v1">1 vs 1</option><option value="1v1v1" selected>1 vs 1 vs 1</option><option value="2v2">2 vs 2 Team</option></select><div id="battleInfo"></div><button class="btn primary huge" data-action="start-battle">Начать баттл</button><p class="small">Без реальных ставок и вывода. Всё сохраняется в localStorage.</p></aside><section class="battle-stage"><div class="battle-top"><h2>Арена</h2><p id="battleStatus">Выбери кейс и режим, затем начни баттл.</p></div><div id="battleArena" class="battle-arena"><div class="empty">Пока баттла нет.</div></div></section></div>`;
    if(first) $('#battleCase').value = first.id;
    renderBattleInfo();
  }
  function battlePlayers(mode){
    if(mode === '1v1') return ['Ты','BOT Max'];
    if(mode === '2v2') return ['Ты','BOT Max','BOT Neo','BOT Rex'];
    return ['Ты','BOT Max','BOT Neo'];
  }
  function renderBattleInfo(){
    const c = catalog.cases.find(x=>x.id === ($('#battleCase') && $('#battleCase').value));
    const mode = ($('#battleMode') && $('#battleMode').value) || '1v1v1';
    const players = battlePlayers(mode);
    const el = $('#battleInfo');
    if(el && c) el.innerHTML = `<div class="battle-price"><span>Твоё место</span><b>${fmt(c.price)}</b></div><div class="battle-price"><span>Игроков</span><b>${players.length}</b></div><div class="battle-price"><span>Потенциальный пул</span><b>${fmt(c.price * players.length)}</b></div>`;
  }
  function battleRollStrip(c, finalItem){
    const cards = Array.from({length:34},()=>rollCard(weighted(c)));
    cards.push(rollCard(finalItem));
    return `<div class="roulette-box small battle-roll"><div class="roulette-center-arrow"><span></span></div><div class="roulette-pointer"></div><div class="roulette-strip">${cards.join('')}</div></div>`;
  }
  function startBattle(){
    if(busy.battle) return toast('Баттл уже идёт','warn');
    const c = catalog.cases.find(x=>x.id === ($('#battleCase') && $('#battleCase').value)); if(!c) return toast('Выбери кейс','bad');
    const mode = ($('#battleMode') && $('#battleMode').value) || '1v1v1';
    const names = battlePlayers(mode);
    if(!spend(c.price, `Case Battle: ${c.name}`)) return;
    busy.battle = true;
    state.battles += 1;
    save();
    const players = names.map((name,idx) => ({name, team: mode==='2v2' ? (idx%2===0?'A':'B') : name, item: weighted(c)}));
    const arena = $('#battleArena');
    const status = $('#battleStatus');
    if(status) status.textContent = 'Кейсы открываются...';
    arena.innerHTML = players.map(p => `<article class="battle-player"><div class="battle-player-head"><b>${esc(p.name)}</b>${mode==='2v2'?`<span class="pill">Team ${p.team}</span>`:''}</div>${battleRollStrip(c,p.item)}<p class="small">Крутится...</p></article>`).join('');
    $$('#battleArena .roulette-strip').forEach(strip => {
      strip.style.transition = 'none';
      strip.style.transform = 'translateX(0px)';
      strip.getBoundingClientRect();
      requestAnimationFrame(()=>{
        const last = strip.lastElementChild;
        const box = strip.closest('.roulette-box');
        const target = Math.max(0, last.offsetLeft - box.clientWidth/2 + last.clientWidth/2 + rnd(-14,14));
        strip.style.transition='transform 3.9s cubic-bezier(.08,.75,.08,1)';
        strip.style.transform=`translateX(-${target}px)`;
      });
    });
    setTimeout(()=>{
      const results = players.map(p => ({...p, inv: normalizeInvItem(Object.assign({}, p.item, {uid:id(), source:'battle', addedAt:Date.now(), value:Math.max(1,Math.round(toNum(p.item.value,100)*rnd(.92,1.12)))}))}));
      let winner;
      if(mode === '2v2'){
        const sums = results.reduce((m,x)=>{m[x.team]=(m[x.team]||0)+x.inv.value; return m;},{});
        const winTeam = (sums.A >= sums.B) ? 'A' : 'B';
        winner = {team:winTeam, name:`Team ${winTeam}`, value:sums[winTeam]};
      }else{
        const top = [...results].sort((a,b)=>b.inv.value-a.inv.value)[0];
        winner = {team:top.team, name:top.name, value:top.inv.value};
      }
      const userWon = mode === '2v2' ? winner.team === 'A' : winner.name === 'Ты';
      arena.innerHTML = `<div class="battle-summary ${userWon?'win':'lose'}"><h2>${userWon?'Победа!':'Поражение'}</h2><p>${esc(winner.name)} забирает пул на ${fmt(results.reduce((s,x)=>s+x.inv.value,0))}</p></div>` + results.map(x => `<article class="battle-player result ${((mode==='2v2' && x.team===winner.team) || (mode!=='2v2' && x.name===winner.name))?'winner':''}"><div class="battle-player-head"><b>${esc(x.name)}</b>${mode==='2v2'?`<span class="pill">Team ${x.team}</span>`:''}</div>${itemCard(x.inv,{badge:fmt(x.inv.value)})}</article>`).join('');
      if(userWon){
        state.wins += 1;
        results.forEach(x => { const it = addItem(Object.assign({}, x.inv, {uid:undefined}), 'battle-win'); addLive('Ты',it); });
        toast('Ты выиграл баттл — весь пул добавлен в инвентарь','good');
      }else{
        toast(`${winner.name} выиграл. Твой дроп не добавлен в инвентарь.`, 'bad');
      }
      if(status) status.textContent = userWon ? 'Пул начислен в инвентарь.' : 'Баттл завершён.';
      busy.battle = false;
      save();
      renderBattleInfo();
    }, 4300);
  }

  function isIOSDevice(){
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isStandaloneMode(){
    return !!(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
  }

  function initResponsiveMenu(){
    const nav = $('.navlinks');
    if(!nav) return;
    let btn = $('.menu-toggle');
    if(!btn){
      nav.insertAdjacentHTML('beforebegin', '<button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false"><span class="menu-lines"><i></i><i></i><i></i></span><b>Меню</b></button>');
      btn = $('.menu-toggle');
    }
    let backdrop = $('.menu-backdrop');
    if(!backdrop){
      document.body.insertAdjacentHTML('afterbegin', '<div class="menu-backdrop" aria-hidden="true"></div>');
      backdrop = $('.menu-backdrop');
    }
    const close = () => { document.body.classList.remove('nav-open'); btn.setAttribute('aria-expanded','false'); };
    const open = () => { document.body.classList.add('nav-open'); btn.setAttribute('aria-expanded','true'); };
    let lastMenuTap = 0;
    const toggleMenu = e => {
      if(e){ e.preventDefault(); e.stopPropagation(); }
      const now = Date.now();
      if(now - lastMenuTap < 260) return;
      lastMenuTap = now;
      document.body.classList.contains('nav-open') ? close() : open();
    };
    btn.addEventListener('click', toggleMenu);
    btn.addEventListener('pointerup', toggleMenu, {passive:false});
    btn.addEventListener('touchend', toggleMenu, {passive:false});
    if(backdrop){ backdrop.addEventListener('click', close); backdrop.addEventListener('touchend', e => { e.preventDefault(); close(); }, {passive:false}); }
    nav.addEventListener('click', e => { if(e.target.closest('a')) close(); });
    nav.addEventListener('touchend', e => { if(e.target.closest('a')) close(); }, {passive:true});
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if(innerWidth > 1100) close(); }, {passive:true});
  }

  function initScrollFix(){
    const root = document.documentElement;
    const body = document.body;
    const unlock = () => {
      try{
        root.style.overflowY = 'auto';
        body.style.overflowY = 'auto';
        body.style.overflowX = 'hidden';
        body.style.position = 'relative';
        body.classList.remove('scroll-lock','no-scroll','lock-scroll');
      }catch(e){}
    };
    unlock();
    window.addEventListener('pageshow', unlock, {passive:true});
    window.addEventListener('focus', unlock, {passive:true});
    document.addEventListener('wheel', e => {
      if(e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if(e.target.closest('.modal.show .modal-card')) return;
      const horizontalZone = e.target.closest('.topbar,.live-wrap,.navlinks,.live-feed');
      if(!horizontalZone || document.body.classList.contains('nav-open')) return;
      const scroller = document.scrollingElement || document.documentElement;
      const max = scroller.scrollHeight - window.innerHeight;
      if(max > 4) scroller.scrollTop += e.deltaY;
    }, {passive:true, capture:true});
  }

  function initIOSViewport(){
    const html = document.documentElement;
    const setVh = () => {
      try{ html.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); }catch(e){}
    };
    setVh();
    window.addEventListener('resize', setVh, {passive:true});
    window.addEventListener('orientationchange', () => setTimeout(setVh, 250), {passive:true});
    document.addEventListener('visibilitychange', setVh, {passive:true});
    if(isIOSDevice()) html.classList.add('ios');
    if(isStandaloneMode()) html.classList.add('standalone');
    try{ document.addEventListener('touchstart', function(){}, {passive:true}); }catch(e){}
  }

  function initMobileTapBridge(){
    if(document.documentElement.dataset.tapBridge === '1') return;
    document.documentElement.dataset.tapBridge = '1';
    const actionSelector = '[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]';
    const linkSelector = 'a[href]';
    let lastTarget = null, lastAt = 0;
    const getTouchTarget = e => {
      let target = e.target && e.target.closest ? e.target.closest(actionSelector) : null;
      if(target) return target;
      try{
        const t = e.changedTouches && e.changedTouches[0];
        if(t){
          const el = document.elementFromPoint(t.clientX, t.clientY);
          if(el && el.closest) target = el.closest(actionSelector);
        }
      }catch(err){}
      return target;
    };
    const bridge = e => {
      const target = getTouchTarget(e);
      if(!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
      const now = Date.now();
      if(lastTarget === target && now - lastAt < 420) return;
      lastTarget = target; lastAt = now;
      target.__tapBridgeAt = now;
      try{ e.preventDefault(); e.stopPropagation(); }catch(err){}
      const ev = new MouseEvent('click', {bubbles:true, cancelable:true, view:window});
      ev.__tapBridge = true;
      target.dispatchEvent(ev);
    };
    document.addEventListener('touchend', bridge, {passive:false, capture:true});
    if(window.PointerEvent){
      document.addEventListener('pointerup', e => {
        if(e.pointerType === 'touch' || e.pointerType === 'pen') bridge(e);
      }, {passive:false, capture:true});
    }
    // Страховка для обычных ссылок-кнопок на iOS: если Safari не отдаёт click, переходим вручную.
    document.addEventListener('touchend', e => {
      const a = e.target && e.target.closest ? e.target.closest(linkSelector) : null;
      if(!a || a.closest('[data-action]') || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') || '';
      if(!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if(a.target && a.target !== '_self') return;
      if(!/\.html($|[?#])/.test(href) && !/^[a-z0-9_-]+\.html/i.test(href)) return;
      try{ e.preventDefault(); document.body.classList.remove('nav-open'); location.href = href; }catch(err){}
    }, {passive:false, capture:true});
    document.addEventListener('touchstart', e => {
      if(document.body.classList.contains('nav-open')) return;
      const b = document.querySelector('.menu-backdrop');
      if(b) b.style.pointerEvents = 'none';
      $$('.modal:not(.show)').forEach(m => { m.style.pointerEvents = 'none'; });
    }, {passive:true});
  }


  // v30: non-invasive iOS tap insurance. It does NOT replace desktop click logic.
  // It only mirrors touch/pointer activation into the same internal actions if iOS drops click.
  function initV30MobileActionPatch(){
    if(document.documentElement.dataset.v30MobilePatch === '1') return;
    document.documentElement.dataset.v30MobilePatch = '1';

    const selector = '[data-action],[data-open-case],[data-view-case],[data-sell],[data-upgrade-item],[data-contract-item],[data-close-modal]';
    const run = (el) => {
      if(!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      if(el.matches('[data-close-modal]')){ closeModal(el.closest('.modal')); return true; }
      if(el.dataset.openCase){ openCaseModal(el.dataset.openCase, true); return true; }
      if(el.dataset.viewCase){ openCaseModal(el.dataset.viewCase, false); return true; }
      if(el.dataset.sell){ sellItem(el.dataset.sell); return true; }
      if(el.dataset.upgradeItem){ state.pendingUpgrade = el.dataset.upgradeItem; save(); location.href = 'upgrade.html'; return true; }
      if(el.dataset.contractItem){ toggleContract(el.dataset.contractItem); route(); toast('Выбор контракта обновлён','good'); return true; }
      const a = el.dataset.action;
      if(!a) return false;
      if(a === 'spin-current-case'){ spinCase(currentCase, {fast:false,count:1}); return true; }
      if(a === 'spin-fast'){ spinCase(currentCase, {fast:true,count:1}); return true; }
      if(a === 'open-again'){ spinCase(currentCase, {fast:false,count:1}); return true; }
      if(a === 'open-again-fast'){ spinCase(currentCase, {fast:true,count:1}); return true; }
      if(a === 'open-multi'){ spinCase(currentCase, {fast:true,count:el.dataset.count||1}); return true; }
      if(a === 'sell-batch'){ sellBatch((el.dataset.uids||'').split(',').filter(Boolean)); return true; }
      if(a === 'redeem-promo'){ redeemPromo(); return true; }
      if(a === 'spin-wheel'){ spinWheel(); return true; }
      if(a === 'start-ad'){ startAd(); return true; }
      if(a === 'start-battle'){ startBattle(); return true; }
      if(a === 'make-contract'){ makeContract(); return true; }
      if(a === 'clear-contract'){ state.contractSelected=[]; save(); route(); return true; }
      if(a === 'do-upgrade'){ doUpgrade(); return true; }
      if(a === 'sell-cheap'){ sellCheap(); return true; }
      if(a === 'sell-all-inventory'){ sellAllInventory(); return true; }
      if(a === 'reset-save'){ resetSave(); return true; }
      if(a === 'export-save'){ exportSave(); return true; }
      if(a === 'import-save'){ importSave(); return true; }
      if(a === 'add-debug-coins'){ earn(10000, 'Тестовое начисление'); return true; }
      if(a === 'install-pwa'){ installPWA(); return true; }
      if(a === 'show-ios'){ showIOSGuide(); return true; }
      return false;
    };

    let touchMoved = false;
    let sx = 0, sy = 0, last = 0;
    document.addEventListener('touchstart', e => {
      const t = e.changedTouches && e.changedTouches[0];
      if(t){ sx = t.clientX; sy = t.clientY; }
      touchMoved = false;
    }, {passive:true, capture:true});
    document.addEventListener('touchmove', e => {
      const t = e.changedTouches && e.changedTouches[0];
      if(t && (Math.abs(t.clientX - sx) > 12 || Math.abs(t.clientY - sy) > 12)) touchMoved = true;
    }, {passive:true, capture:true});
    document.addEventListener('touchend', e => {
      if(touchMoved) return;
      let el = e.target && e.target.closest ? e.target.closest(selector) : null;
      if(!el){
        const t = e.changedTouches && e.changedTouches[0];
        if(t){
          const hit = document.elementFromPoint(t.clientX, t.clientY);
          el = hit && hit.closest ? hit.closest(selector) : null;
        }
      }
      if(!el) return;
      const now = Date.now();
      if(now - last < 300) return;
      last = now;
      e.preventDefault();
      e.stopPropagation();
      el.__tapBridgeAt = now;
      run(el);
    }, {passive:false, capture:true});

    // Ensure closed overlays never capture taps.
    const unlock = () => {
      const bd = document.querySelector('.menu-backdrop');
      if(bd && !document.body.classList.contains('nav-open')) bd.style.pointerEvents = 'none';
      document.querySelectorAll('.modal:not(.show)').forEach(m => m.style.pointerEvents = 'none');
      document.querySelectorAll('.modal.show').forEach(m => m.style.pointerEvents = 'auto');
    };
    unlock();
    setInterval(unlock, 800);
  }

  let deferredInstallPrompt = null;
  function initInstallPrompt(){
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; $$('.js-install-ready').forEach(x=>x.textContent='Готово к установке'); });
  }
  function registerServiceWorker(){ return; }
  async function installPWA(){
    if(deferredInstallPrompt){
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(()=>null);
      deferredInstallPrompt = null;
      return;
    }
    toast('Если кнопка установки недоступна: Chrome/Edge → меню ⋮ → Установить приложение. На iOS используй инструкцию ниже.','warn');
  }
  function showIOSGuide(){
    let modal = $('#iosGuideModal');
    if(!modal){
      document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="iosGuideModal"><div class="modal-card"><div class="modal-head"><h3>Как добавить на экран iPhone</h3><button class="close" data-close-modal>×</button></div><div class="modal-body"><div class="panel"><ol class="steps"><li>Открой сайт именно в <b>Safari</b>, не во встроенном браузере мессенджера.</li><li>Нажми кнопку <b>«Поделиться»</b> ⬆︎ внизу Safari.</li><li>Прокрути меню и выбери <b>«На экран Домой»</b>.</li><li>Нажми <b>«Добавить»</b>. Иконка появится как обычное приложение.</li><li>После первого запуска из иконки зайди в <b>Профиль</b> и проверь статус сохранения.</li></ol><p>В standalone-режиме iOS сайт использует safe-area: элементы не залезают под Dynamic Island/чёлку и нижнюю домашнюю полоску.</p></div></div></div></div>`);
      modal = $('#iosGuideModal');
    }
    openModal(modal);
  }
  function renderInstall(){
    const root = $('#installRoot'); if(!root) return;
    const ios = isIOSDevice();
    const standalone = isStandaloneMode();
    root.innerHTML = `<div class="grid cards-3 install-grid"><article class="panel install-card"><span class="kicker">Windows / Chrome / Edge</span><h2>Установить как приложение</h2><p>На GitHub Pages сайт можно открыть с любого устройства. На Windows кнопка вызовет установку PWA, если браузер поддерживает её.</p><button class="btn primary huge" data-action="install-pwa">Установить на Windows</button><p class="small js-install-ready">Если кнопка не появилась: меню браузера → «Установить приложение».</p></article><article class="panel install-card ${ios?'ios-device':''}"><span class="kicker">iPhone / iPad</span><h2>${standalone?'Открыто как приложение':'Добавить на экран Домой'}</h2><p>${standalone?'Сайт уже запущен в standalone-режиме iOS. Нижняя панель Safari скрыта, safe-area активна.':'Открой сайт именно в Safari: кнопка «Поделиться» → «На экран Домой». После установки будет полноэкранный режим с iOS-иконкой.'}</p><button class="btn blue huge" data-action="show-ios">Показать инструкцию iOS</button><div class="ios-mini-guide"><b>Быстро:</b> Safari → ⬆︎ Поделиться → На экран Домой → Добавить</div></article><article class="panel install-card"><span class="kicker">Offline ZIP</span><h2>Скачать сборку</h2><p>ZIP можно распаковать на Windows и открыть <b>index.html</b> или залить содержимое на GitHub Pages.</p><a class="btn huge" href="download/cs2-case-lab-windows.zip" download>Скачать ZIP для Windows</a></article></div><div class="notice block ios-notice"><b>iOS v23:</b> добавлены apple-touch-icon, viewport-fit=cover, safe-area отступы, standalone-режим, исправления тач-кликов, модалок и горизонтального скролла на iPhone. Для установки используй Safari, не встроенный браузер Telegram/Discord/VK.</div>`;
  }

  function normalizePromoCode(code){ return String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').trim(); }
  function renderPromos(){
    const root = $('#promosRoot'); if(!root) return;
    const used = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    const totalCodes = Object.keys(PROMO_CODES).length;
    root.innerHTML = `<div class="promo-layout"><article class="panel promo-card"><span class="kicker">Промокоды</span><h2>Активировать бонус</h2><p>Промокод можно использовать один раз на одно сохранение. Валюта сразу начисляется на баланс в ₽LC.</p><div class="promo-form"><input id="promoInput" placeholder="Введи промокод" autocomplete="off" autocapitalize="characters"><button class="btn primary" data-action="redeem-promo">Активировать</button></div><p class="small">Использовано: <b>${used.length}</b> / ${totalCodes}. Пример формата: <b>WELCOME30</b></p></article><article class="panel"><h3>История промокодов</h3><div class="promo-used">${used.length ? used.map(x=>`<span class="pill">${esc(x)}</span>`).join('') : '<p class="small">Пока промокодов не активировано.</p>'}</div></article></div>`;
  }
  function redeemPromo(){
    const input = $('#promoInput');
    const code = normalizePromoCode(input && input.value);
    if(!code) return toast('Введи промокод','bad');
    const amount = PROMO_CODES[code];
    if(!amount) return toast('Промокод не найден','bad');
    state.usedPromos = Array.isArray(state.usedPromos) ? state.usedPromos : [];
    if(state.usedPromos.includes(code)) return toast('Этот промокод уже активирован','warn');
    state.usedPromos.push(code);
    earn(amount, `Промокод ${code}`);
    if(input) input.value = '';
    renderPromos();
  }

  function storageStatusText(){
    let localOk = false, sessionOk = false, idbOk = !!storageHealth.indexedDB, winOk = !!storageHealth.windowName;
    try{ const test = '__cs2_case_lab_test__'; localStorage.setItem(test,'1'); localStorage.removeItem(test); localOk = true; }catch(e){ localOk = false; }
    try{ const test = '__cs2_case_lab_session_test__'; sessionStorage.setItem(test,'1'); sessionStorage.removeItem(test); sessionOk = true; }catch(e){ sessionOk = false; }
    const rawLen = (()=>{ try{ return (localStorage.getItem(LS_KEY)||'').length; }catch(e){ return JSON.stringify(compactState(state)).length; } })();
    if(localOk) return `<span class="plus">localStorage работает</span><br><small>Постоянный save активен · ${Math.round(rawLen/1024)} KB · ключ: ${LS_KEY}</small>`;
    if(idbOk) return `<span class="plus">Сохранение работает через IndexedDB</span><br><small>localStorage недоступен или не используется, но постоянный save активен через IndexedDB. Баланс и инвентарь должны сохраняться.</small>`;
    if(sessionOk || winOk) return `<span class="minus">Постоянное сохранение ограничено</span><br><small>Сайт использует sessionStorage/window.name. Прогресс держится в текущей вкладке; экспортируй save перед закрытием.</small>`;
    return `<span class="minus">Все хранилища заблокированы</span><br><small>Проверь private mode, расширения и настройки site data. Пока прогресс только в памяти страницы.</small>`;
  }
  function renderProfile(){
    const root = $('#profileRoot'); if(!root) return;
    root.innerHTML = `${statCards()}<div class="grid cards-3 block"><div class="panel"><h3>Статистика</h3><p>Апгрейды: <b>${state.upgrades}</b></p><p>Контракты: <b>${state.contracts}</b></p><p>Баттлы: <b>${state.battles}</b></p><p>Победы: <b>${state.wins}</b></p><p>Продано: <b>${fmt(state.sold)}</b></p></div><div class="panel"><h3>Сохранение</h3><p>Версия save: <b>${esc(state.version||VERSION)}</b></p><p>${storageStatusText()}</p><button class="btn" data-action="export-save">Экспорт</button><button class="btn" data-action="import-save">Импорт</button><textarea id="saveBox" placeholder="Тут появится или сюда вставляется save"></textarea></div><div class="panel danger"><h3>Сброс</h3><p>Полностью чистит сохранение и возвращает 15 000 ₽LC. Также убирает старые сломанные ключи v3–v8.</p><button class="btn red" data-action="reset-save">Сбросить прогресс</button><button class="btn" data-action="add-debug-coins">+10 000 ₽LC</button></div></div><section class="block"><div class="head"><h2>История баланса</h2></div><div class="tx-list">${state.tx.slice(0,25).map(t=>`<div class="tx"><div><b>${esc(t.text)}</b><small>${new Date(t.time).toLocaleString('ru-RU')}</small></div><strong class="${t.amount>=0?'plus':'minus'}">${t.amount>=0?'+':''}${fmt(t.amount)}</strong></div>`).join('') || '<div class="empty">История пуста.</div>'}</div></section>`;
  }
  function resetSave(){
    if(!confirm('Сбросить прогресс и вернуть стартовый баланс 15 000 ₽LC?')) return;
    try{ allSaveKeys().forEach(k => localStorage.removeItem(k)); localStorage.removeItem(LS_KEY); }catch(e){}
    try{ sessionStorage.removeItem(BACKUP_KEY); }catch(e){}
    try{ if(String(window.name||'').startsWith(WINDOW_SAVE_PREFIX)) window.name=''; }catch(e){}
    idbDelete();
    state = defaultState(); save(); toast('Прогресс сброшен','good'); route();
  }
  function exportSave(){ const box=$('#saveBox'); if(box) box.value = btoa(unescape(encodeURIComponent(JSON.stringify(compactState(state))))); toast('Save выгружен в поле','good'); }
  function importSave(){
    const box=$('#saveBox'); if(!box || !box.value.trim()) return toast('Вставь save в поле','bad');
    try{ state = compactState(JSON.parse(decodeURIComponent(escape(atob(box.value.trim()))))); save(); toast('Save импортирован','good'); route(); }
    catch(e){ toast('Не удалось импортировать save','bad'); }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

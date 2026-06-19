
(function(){
  'use strict';

  const VERSION = 'mobile-clean-4.0.0';
  const SAVE_KEY = 'cs2_mobile_clean_save_v4';
  const CURRENCY = '₽LC';
  const START_BALANCE = 15000;
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_LIMIT = 10;
  const AD_REWARD = 750;
  const PROMOS = Object.freeze({
    WELCOMEMOBILE:5000, IOSFIX:10000, FASTCASE:3000, MOBILEKING:15000,
    TEST100K:100000, KNIFEDREAM:25000, RUBLEDROP:12000, CLEANV3:20000, CLEANV4:30000
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
      ['dragon lore', 720000], ['gungnir', 610000], ['howl', 560000], ['wild lotus', 360000], ['medusa', 260000], ['poseidon', 170000], ['prince', 165000],
      ['welcome to the jungle', 180000], ['gold arabesque', 150000], ['fire serpent', 72000], ['hydroponic', 64000], ['icarus fell', 46000], ['blue phosphor', 42000],
      ['case hardened', 38000], ['vulcan', 18500], ['fuel injector', 14500], ['bloodsport', 8200], ['the empress', 7600], ['head shot', 5400], ['redline', 3200], ['legion of anubis', 2300], ['ice coaled', 1450], ['slate', 600],
      ['asiimov', 11200], ['hyper beast', 7400], ['neo-noir', 3300], ['containment breach', 8400], ['chromatic aberration', 3400], ['duality', 950], ['fever dream', 650], ['paw', 320],
      ['printstream', 9200], ['decimator', 1900], ['nightmare', 1250], ['player two', 3100], ['mecha industries', 1200], ['temukau', 7600], ['bullet queen', 1800], ['water elemental', 950],
      ['doppler', 92000], ['gamma doppler', 118000], ['fade', 98000], ['marble fade', 90000], ['slaughter', 52000], ['crimson web', 56000], ['tiger tooth', 72000], ['case hardened', 62000],
      ['vice', 98000], ['pandora', 170000], ['king snake', 42000], ['imperial plaid', 47000], ['racing green', 16000], ['jade', 22000]
    ];
    for(const [key,val] of anchors){ if(n.includes(key)) return val; }
    if(type==='knife') return 54000 + Math.round(rnd()*86000);
    if(type==='glove') return 32000 + Math.round(rnd()*110000);
    if(type==='sticker') return n.includes('katowice 2014') ? 950000 : n.includes('gold') ? 9000 : (rarity==='Extraordinary'?4200:rarity==='Exotic'?1900:rarity==='Remarkable'?560:160);
    if(type==='agent') return rarity==='Master Agent'||rarity==='Master' ? 6200 : rarity==='Superior'?2600:1150;
    if(type==='charm'||type==='patch') return rarity==='Exotic'?2400:rarity==='Remarkable'?850:260;
    const base = {'Consumer Grade':35,'Base Grade':30,'Industrial Grade':90,'Mil-Spec Grade':230,'Restricted':720,'Classified':2100,'Covert':5800,'Contraband':140000,'High Grade':160,'Remarkable':560,'Exotic':1900}[rarity] || 360;
    const spread = .72 + rnd()*.82;
    return Math.max(25, Math.round(base * spread));
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
    const skin = (id,name,rarity,value,img=REAL.akRedline,type='skin') => localItem(id,name,rarity,value,img,type);
    return [
      skin('ak-redline','AK-47 | Redline','Classified',3200,REAL.akRedline),
      skin('awp-hyper','AWP | Hyper Beast','Covert',7400,REAL.awpHyper),
      skin('karambit-doppler','★ Karambit | Doppler','Rare Special Item',92000,REAL.karambit,'knife'),
      skin('ak-vulcan','AK-47 | Vulcan','Covert',18500,REAL.akRedline),
      skin('ak-empress','AK-47 | The Empress','Covert',7600,REAL.akRedline),
      skin('ak-headshot','AK-47 | Head Shot','Covert',5400,REAL.akRedline),
      skin('ak-legion','AK-47 | Legion of Anubis','Covert',2300,REAL.akRedline),
      skin('ak-ice','AK-47 | Ice Coaled','Classified',1450,REAL.akRedline),
      skin('awp-asiimov','AWP | Asiimov','Covert',11200,REAL.awpHyper),
      skin('awp-duality','AWP | Duality','Classified',950,REAL.awpHyper),
      skin('awp-fever','AWP | Fever Dream','Classified',650,REAL.awpHyper),
      skin('awp-neo','AWP | Neo-Noir','Covert',3300,REAL.awpHyper),
      skin('m4-print','M4A1-S | Printstream','Covert',9200,REAL.akRedline),
      skin('m4-decimator','M4A1-S | Decimator','Classified',1900,REAL.akRedline),
      skin('m4-nightmare','M4A1-S | Nightmare','Classified',1250,REAL.akRedline),
      skin('m4-temukau','M4A4 | Temukau','Covert',7600,REAL.akRedline),
      skin('de-print','Desert Eagle | Printstream','Covert',4200,REAL.akRedline),
      skin('de-ocean','Desert Eagle | Ocean Drive','Covert',2600,REAL.akRedline),
      skin('usp-kill','USP-S | Kill Confirmed','Covert',5400,REAL.akRedline),
      skin('usp-cortex','USP-S | Cortex','Classified',800,REAL.akRedline),
      skin('glock-water','Glock-18 | Water Elemental','Classified',950,REAL.akRedline),
      skin('glock-bullet','Glock-18 | Bullet Queen','Covert',1800,REAL.akRedline),
      skin('p250-asiimov','P250 | Asiimov','Classified',780,REAL.akRedline),
      skin('tec-isaac','Tec-9 | Isaac','Mil-Spec Grade',190,REAL.akRedline),
      skin('mp9-food','MP9 | Food Chain','Classified',980,REAL.akRedline),
      skin('mac-neon','MAC-10 | Neon Rider','Covert',1700,REAL.akRedline),
      skin('p90-death','P90 | Death Grip','Restricted',420,REAL.akRedline),
      skin('ssg-fever','SSG 08 | Fever Dream','Restricted',380,REAL.awpHyper),
      skin('famas-mecha','FAMAS | Mecha Industries','Classified',1200,REAL.akRedline),
      skin('galil-chat','Galil AR | Chatterbox','Covert',2100,REAL.akRedline),
      skin('butterfly-doppler','★ Butterfly Knife | Doppler','Rare Special Item',98000,REAL.karambit,'knife'),
      skin('m9-fade','★ M9 Bayonet | Fade','Rare Special Item',105000,REAL.karambit,'knife'),
      skin('bayonet-tiger','★ Bayonet | Tiger Tooth','Rare Special Item',76000,REAL.karambit,'knife'),
      skin('sport-vice','★ Sport Gloves | Vice','Extraordinary',98000,REAL.karambit,'glove'),
      skin('driver-king','★ Driver Gloves | King Snake','Extraordinary',42000,REAL.karambit,'glove')
    ];
  }

  function buildFallbackCases(pool){
    const skinsOnly = pool.filter(x=>x.type==='skin');
    const knives = pool.filter(x=>x.type==='knife');
    const gloves = pool.filter(x=>x.type==='glove');
    const official = [
      ['kilowatt-case','Kilowatt Case',840,'Kilowatt Case'], ['revolution-case','Revolution Case',620,'Revolution Case'], ['recoil-case','Recoil Case',690,'Recoil Case'], ['dreams-nightmares','Dreams & Nightmares Case',760,'Dreams & Nightmares Case'],
      ['snakebite-case','Snakebite Case',420,'Snakebite Case'], ['fracture-case','Fracture Case',390,'Fracture Case'], ['clutch-case','Clutch Case',620,'Clutch Case'], ['prisma-2-case','Prisma 2 Case',520,'Prisma 2 Case'],
      ['spectrum-2-case','Spectrum 2 Case',740,'Spectrum 2 Case'], ['gamma-2-case','Gamma 2 Case',980,'Gamma 2 Case'], ['glove-case','Glove Case',1400,'Glove Case'], ['chroma-3-case','Chroma 3 Case',650,'Chroma 3 Case'],
      ['horizon-case','Horizon Case',560,'Kilowatt Case'], ['danger-zone-case','Danger Zone Case',470,'Fracture Case'], ['cs20-case','CS20 Case',820,'Revolution Case'], ['broken-fang-case','Operation Broken Fang Case',1150,'Glove Case'],
      ['gallery-case','Gallery Case',780,'Kilowatt Case'], ['fever-case','Fever Case',640,'Dreams & Nightmares Case']
    ].map((x,i)=>({id:x[0],name:x[1],price:x[2],image:FALLBACK_CASE_IMAGES[x[3]]||REAL.kilowatt,items:rotatePool(pool,i,28),profit:.18+(i%6)*.035}));
    const special = [
      {id:'budget-case',name:'Budget Blue Case',price:240,image:FALLBACK_CASE_IMAGES['Snakebite Case']||REAL.kilowatt,items:skinsOnly.filter(i=>['Mil-Spec Grade','Restricted','Industrial Grade'].includes(i.rarity)).concat(skinsOnly).slice(0,32),profit:.34},
      {id:'purple-case',name:'Purple Restricted Case',price:850,image:FALLBACK_CASE_IMAGES['Fracture Case']||REAL.kilowatt,items:skinsOnly.filter(i=>i.rarity==='Restricted'||i.rarity==='Classified').concat(skinsOnly).slice(0,28),profit:.27},
      {id:'pink-case',name:'Pink Classified Case',price:2200,image:FALLBACK_CASE_IMAGES['Prisma 2 Case']||REAL.kilowatt,items:skinsOnly.filter(i=>i.rarity==='Classified'||i.rarity==='Covert').concat(skinsOnly).slice(0,28),profit:.22},
      {id:'red-case',name:'Red Covert Case',price:5600,image:FALLBACK_CASE_IMAGES['Revolution Case']||REAL.kilowatt,items:skinsOnly.filter(i=>i.rarity==='Covert').concat(skinsOnly).slice(0,28),profit:.17},
      {id:'knife-case',name:'Knife Case',price:36000,image:REAL.karambit,items:knives.length?knives:pool.filter(i=>i.type==='knife'),profit:.14},
      {id:'gloves-case',name:'Gloves Case',price:29000,image:REAL.karambit,items:gloves.length?gloves:pool.filter(i=>i.type==='glove'),profit:.15},
      {id:'knife-glove-case',name:'Knives & Gloves Case',price:42000,image:REAL.karambit,items:knives.concat(gloves).length?knives.concat(gloves):pool.filter(i=>i.type==='knife'||i.type==='glove'),profit:.13}
    ].filter(c=>c.items && c.items.length);
    return official.concat(special);
  }
  function rotatePool(pool, start, count){
    const arr = pool && pool.length ? pool : buildFallbackItems();
    return Array.from({length:Math.min(count, arr.length)}, (_,i)=>arr[(start+i)%arr.length]);
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
      const wanted = ['AK-47 | Redline','AK-47 | Vulcan','AK-47 | The Empress','AK-47 | Head Shot','AK-47 | Legion of Anubis','AK-47 | Ice Coaled','AK-47 | Slate','M4A1-S | Printstream','M4A1-S | Decimator','M4A1-S | Nightmare','M4A1-S | Player Two','M4A4 | Temukau','M4A4 | Neo-Noir','AWP | Asiimov','AWP | Hyper Beast','AWP | Duality','AWP | Fever Dream','AWP | Neo-Noir','AWP | Chromatic Aberration','Desert Eagle | Printstream','Desert Eagle | Ocean Drive','USP-S | Kill Confirmed','USP-S | Cortex','Glock-18 | Water Elemental','Glock-18 | Bullet Queen','P250 | Asiimov','Tec-9 | Isaac','MP9 | Food Chain','MAC-10 | Neon Rider','P90 | Death Grip','SSG 08 | Fever Dream','FAMAS | Mecha Industries','Galil AR | Chatterbox','★ Karambit | Doppler','★ Karambit | Gamma Doppler','★ Butterfly Knife | Doppler','★ M9 Bayonet | Fade','★ Bayonet | Tiger Tooth','★ Sport Gloves | Vice','★ Driver Gloves | King Snake'];
      const byName = new Map(skins.map(x=>[String(x.name||'').toLowerCase(),x]));
      let realItems = wanted.map(n=>byName.get(n.toLowerCase())).filter(Boolean).map(x=>normItem(x, /knife|bayonet|karambit|butterfly/i.test(x.name)?'knife':'skin'));
      skins.forEach(x=>{ if(realItems.length<72 && x.image && !realItems.some(i=>i.name===x.name)) realItems.push(normItem(x)); });
      const stickerItems = stickers.filter(x=>x.image).slice(0,12).map(x=>normItem(x,'sticker'));
      const agentItems = agents.filter(x=>x.image).slice(0,8).map(x=>normItem(x,'agent'));
      const charmItems = charms.filter(x=>x.image).slice(0,8).map(x=>normItem(x,'charm'));
      const patchItems = patches.filter(x=>x.image).slice(0,6).map(x=>normItem(x,'patch'));
      items = realItems.concat(stickerItems, agentItems, charmItems, patchItems).filter(uniqueByName);
      const crateWanted = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Snakebite Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Gamma 2 Case','Glove Case','Chroma 3 Case','Horizon Case','Danger Zone Case','CS20 Case','Operation Broken Fang Case','Operation Riptide Case','Gallery Case','Fever Case','Prisma Case','Spectrum Case','Chroma 2 Case','Chroma Case','Falchion Case','Shadow Case','Operation Wildfire Case','Operation Vanguard Weapon Case','Operation Phoenix Weapon Case','Huntsman Weapon Case'];
      const crateBy = new Map(crates.map(c=>[String(c.name||'').toLowerCase(), c]));
      let realCases = crateWanted.map((name,idx)=>{
        const c = crateBy.get(name.toLowerCase());
        if(!c) return null;
        const poolRaw = ([]).concat(Array.isArray(c.contains)?c.contains:[], Array.isArray(c.contains_rare)?c.contains_rare:[]);
        let pool = poolRaw.filter(x=>x && x.name && x.image).map(x=>normItem(x, /knife|bayonet|karambit|butterfly|glove/i.test(x.name||'')?'knife':'skin')).filter(uniqueByName);
        if(pool.length<10) pool = rotatePool(items.filter(x=>['skin','knife','glove'].includes(x.type)), idx*3, 34);
        return {id:slug(c.name), name:c.name, price:casePrice(c.name, idx), image:fixImageUrl(c.image)||FALLBACK_CASE_IMAGES[c.name]||REAL.kilowatt, items:pool, profit:.16 + (idx%7)*.032};
      }).filter(Boolean);
      const skinsOnly = items.filter(x=>x.type==='skin');
      const knives = items.filter(x=>x.type==='knife');
      const stickersOnly = items.filter(x=>x.type==='sticker');
      const agentsAll = items.filter(x=>['agent','charm','patch'].includes(x.type));
      realCases = realCases.concat([
        {id:'budget-blue',name:'Budget Blue Case',price:240,image:realCases[5]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Mil-Spec Grade','Restricted','Industrial Grade'].includes(x.rarity)).slice(0,40),profit:.34},
        {id:'green-industrial',name:'Green Industrial Case',price:160,image:realCases[0]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Consumer Grade','Industrial Grade','Mil-Spec Grade'].includes(x.rarity)).slice(0,40),profit:.42},
        {id:'purple-restricted',name:'Purple Restricted Case',price:850,image:realCases[6]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Restricted','Classified'].includes(x.rarity)).slice(0,40),profit:.27},
        {id:'pink-classified',name:'Pink Classified Case',price:2300,image:realCases[7]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Classified','Covert'].includes(x.rarity)).slice(0,40),profit:.22},
        {id:'red-covert',name:'Red Covert Case',price:5600,image:realCases[1]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>['Covert'].includes(x.rarity)).slice(0,40),profit:.16},
        {id:'high-roller',name:'High Roller Case',price:12500,image:realCases[2]?.image||REAL.kilowatt,items:skinsOnly.filter(x=>x.value>5000).concat(knives).slice(0,40),profit:.13},
        {id:'knife-case',name:'Knife Case',price:36000,image:REAL.karambit,items:knives.length?knives:items.filter(x=>x.type==='knife'),profit:.14},
        {id:'gloves-case',name:'Gloves Case',price:29000,image:REAL.karambit,items:items.filter(x=>x.type==='glove'),profit:.15},
        {id:'knife-glove-case',name:'Knives & Gloves Case',price:42000,image:REAL.karambit,items:knives.concat(items.filter(x=>x.type==='glove')),profit:.13},
        {id:'stickers-case',name:'Tournament Stickers',price:390,image:stickersOnly.find(x=>x.image)?.image||realCases[0]?.image||REAL.kilowatt,items:stickersOnly.filter(x=>x.image).slice(0,40),profit:.38},
        {id:'agents-case',name:'Agents Case',price:1250,image:agentsAll.find(x=>x.image)?.image||realCases[0]?.image||REAL.kilowatt,items:agentsAll.filter(x=>x.image).slice(0,40),profit:.34},
        {id:'charms-patches-case',name:'Charms & Patches Case',price:650,image:agentsAll.find(x=>x.type==='charm'&&x.image)?.image||realCases[0]?.image||REAL.kilowatt,items:agentsAll.filter(x=>['charm','patch'].includes(x.type)&&x.image).slice(0,40),profit:.35}
      ]);
      cases = realCases.filter(c=>c.items && c.items.length);
      if(cases.length < 16) cases = buildFallbackCases(items);
      state.inventory.forEach(inv => { const src=items.find(i=>i.name===inv.name); if(src){ inv.image=src.image; inv.rarityColor=src.rarityColor; }});
      apiLoaded = true;
      save(false);
      route();
    }catch(e){ console.warn('Real catalog fallback', e); }
  }
  function uniqueByName(x,idx,arr){ return x && x.name && arr.findIndex(y=>y.name===x.name)===idx; }
  function casePrice(name, idx){
    const n=String(name).toLowerCase();
    const m = [
      ['kilowatt',840], ['revolution',620], ['recoil',690], ['dream',760], ['snake',420], ['fracture',390], ['clutch',620], ['prisma 2',520], ['spectrum 2',740], ['gamma 2',980], ['glove',1400], ['chroma 3',650],
      ['horizon',560], ['danger zone',470], ['cs20',820], ['broken fang',1150], ['riptide',1750], ['gallery',780], ['fever',640], ['prisma',620], ['spectrum',940], ['chroma 2',850], ['chroma case',760], ['falchion',780], ['shadow',720], ['wildfire',1550], ['vanguard',2800], ['phoenix',1900], ['huntsman',2200]
    ];
    const hit=m.find(([k])=>n.includes(k));
    return hit?hit[1]:500 + (idx%7)*140;
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
  function renderPromo(app){ app.innerHTML=pageTitle('Промокоды','Каждый код активируется один раз.')+`<div class="controls"><input class="field" id="promoInput" placeholder="Введите промокод"><button class="btn primary" data-action="promo">Активировать</button></div><div class="notice section">Рабочие: WELCOMEMOBILE, IOSFIX, FASTCASE, MOBILEKING, TEST100K, CLEANV4</div>`; wireButtons(); }
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
    try{ if(location.search.includes('clear=mobile-clean-v4')) localStorage.removeItem(SAVE_KEY); }catch(e){}
    if(!location.hash) location.hash='home';
    route(); wireButtons();
    setTimeout(loadRealCatalog, 100);
    setInterval(wireButtons, 1200);
  });
})();

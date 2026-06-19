
(function(){
  'use strict';

  const VERSION = 'mobile-clean-6.0.0';
  const SAVE_KEY = 'cs2_mobile_clean_save_v6';
  const CURRENCY = '₽LC';
  const START_BALANCE = 15000;
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_LIMIT = 10;
  const AD_REWARD = 750;
  const PROMOS = Object.freeze({
    WELCOMEMOBILE:5000, IOSFIX:10000, FASTCASE:3000, MOBILEKING:15000,
    TEST100K:100000, KNIFEDREAM:25000, RUBLEDROP:12000, CLEANV3:20000, CLEANV5:30000
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
  function hashCode(s){ s=String(s||''); let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function hue(name){ return hashCode(name)%360; }
  function dataSvg(svg){ return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg); }
  function artText(name){ return esc(String(name||'CS2').replace(/★/g,'').slice(0,28)); }
  function skinPlaceholder(name,type='skin'){
    const h=hue(name), h2=(h+72)%360, label=artText(name);
    const knife=/knife|karambit|bayonet|butterfly|daggers|talon|kukri/i.test(name)||type==='knife';
    const glove=/glove/i.test(name)||type==='glove';
    const awp=/awp|ssg|scar/i.test(name);
    const pistol=/glock|usp|p250|deagle|tec|five-seven|revolver/i.test(name);
    let shape = glove
      ? `<path d="M185 206c-28-42-34-85-14-124 13-25 40-15 42 12l6 78 18-99c5-28 40-26 40 4l-4 100 33-89c9-24 42-15 36 12l-26 96 46-72c16-23 48-6 34 19l-64 111c-20 36-113 28-147-48z"/>`
      : knife
      ? `<path d="M96 202C135 99 247 45 382 58c-76 27-142 76-196 144 77-35 179-45 309-28-62 67-145 106-251 119-70 9-121-27-148-91z"/><circle cx="101" cy="210" r="43" fill="none" stroke="hsl(${h2} 85% 76%)" stroke-width="18"/>`
      : awp
      ? `<path d="M62 182h410l72-50h88c35 0 57 16 70 42l19 42h-87l-12-22h-146l-68 60H299l57-59H146l-51 47H43l31-39H55c-33 0-31-21 7-21z"/><path d="M138 132h330l42-44h95l-45 44h78c29 0 51 11 64 30H103c8-18 19-30 35-30z" opacity=".55"/>`
      : pistol
      ? `<path d="M158 145h315c61 0 92 25 103 62H423l-45 73H250l54-73H120c-37 0-35-62 38-62z"/><path d="M214 93h277l42 52H174c8-32 20-52 40-52z" opacity=".55"/>`
      : `<path d="M57 176h410l44-52h127c35 0 64 22 79 58l27 67h-104l-18-40H504l-59 74H341l62-73H181l-45 55H45l42-61H54c-46 0-44-28 3-28z"/><path d="M136 126h236l47-61h103l-50 61h154c34 0 58 18 70 44H96c6-28 19-44 40-44z" opacity=".55"/>`;
    return dataSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="hsl(${h} 90% 54%)"/><stop offset=".52" stop-color="hsl(${(h+38)%360} 88% 58%)"/><stop offset="1" stop-color="hsl(${h2} 85% 52%)"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".55"/></filter></defs><rect width="760" height="360" rx="42" fill="#111827"/><circle cx="130" cy="72" r="112" fill="hsl(${h} 90% 55%)" opacity=".13"/><circle cx="650" cy="285" r="150" fill="hsl(${h2} 90% 55%)" opacity=".11"/><g filter="url(#s)" transform="translate(30 35)" fill="url(#g)">${shape}<path d="M178 192h110M405 157h155M520 222h72" stroke="#0b1020" stroke-width="14" stroke-linecap="round" opacity=".42" fill="none"/></g><text x="40" y="315" fill="#f8fafc" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="900">${label}</text></svg>`);
  }
  function stickerPlaceholder(name){ const h=hue(name); return dataSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="hsl(${h} 85% 55%)"/><stop offset="1" stop-color="hsl(${(h+80)%360} 85% 56%)"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000" flood-opacity=".5"/></filter></defs><rect width="520" height="360" rx="38" fill="#101827"/><g filter="url(#s)"><path d="M120 72h280l44 44v172H120z" fill="url(#g)"/><path d="M400 72v44h44" fill="#fff" opacity=".38"/><circle cx="260" cy="183" r="74" fill="#0b1020" opacity=".78"/><text x="260" y="198" text-anchor="middle" font-family="Inter,Arial" font-size="32" font-weight="900" fill="#fff">STICKER</text></g><text x="260" y="328" text-anchor="middle" font-family="Inter,Arial" font-size="22" font-weight="900" fill="#f8fafc">${artText(name)}</text></svg>`); }
  function agentPlaceholder(name,type='agent'){ const h=hue(name); return dataSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${h} 70% 45%)"/><stop offset="1" stop-color="#111827"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#000" flood-opacity=".5"/></filter></defs><rect width="520" height="360" rx="38" fill="#101827"/><g filter="url(#s)"><circle cx="260" cy="105" r="55" fill="hsl(${h} 75% 62%)"/><path d="M150 305c12-88 62-135 110-135s98 47 110 135z" fill="url(#g)"/><path d="M205 202h110" stroke="#e5e7eb" stroke-width="18" stroke-linecap="round" opacity=".35"/></g><text x="260" y="334" text-anchor="middle" font-family="Inter,Arial" font-size="22" font-weight="900" fill="#f8fafc">${artText(name)}</text></svg>`); }
  function casePlaceholder(name){ const h=hue(name), label=artText(name).replace(' Case',''); return dataSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${h} 85% 56%)"/><stop offset="1" stop-color="hsl(${(h+48)%360} 90% 45%)"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#000" flood-opacity=".45"/></filter></defs><rect width="640" height="440" rx="44" fill="#101827"/><g filter="url(#s)"><path d="M146 145h348c40 0 70 30 70 70v118c0 40-30 70-70 70H146c-40 0-70-30-70-70V215c0-40 30-70 70-70z" fill="#111827" stroke="#354156" stroke-width="14"/><path d="M230 145v-34c0-36 26-62 64-62h52c38 0 64 26 64 62v34" fill="none" stroke="#94a3b8" stroke-width="22" stroke-linecap="round"/><rect x="118" y="205" width="404" height="124" rx="24" fill="url(#c)"/><path d="M145 240h350M145 286h350" stroke="#0b1020" stroke-width="10" opacity=".25"/><text x="320" y="285" text-anchor="middle" font-family="Inter,Arial" font-size="40" font-weight="900" fill="#0b1020">${label.slice(0,12)}</text></g></svg>`); }
  function placeholderFor(name,type='skin'){ if(type==='case') return casePlaceholder(name); if(type==='sticker') return stickerPlaceholder(name); if(type==='agent'||type==='charm'||type==='patch') return agentPlaceholder(name,type); return skinPlaceholder(name,type); }

  function thematicCaseImage(name, color){
    const c = color || '#ff7a18';
    const c2 = c === '#22c55e' ? '#064e3b' : c === '#ef4444' ? '#7f1d1d' : c === '#4b69ff' ? '#1e3a8a' : c === '#8b5cf6' ? '#4c1d95' : c === '#ec4899' ? '#831843' : '#111827';
    const safe = artText(String(name||'CS2').replace(/ Case| Collection| Capsule/gi,'')).slice(0,22);
    const icon = /knife/i.test(name) ? '★' : /glove/i.test(name) ? '✋' : /sticker|capsule|tournament/i.test(name) ? '◆' : /agent/i.test(name) ? '♟' : /charm|keychain/i.test(name) ? '✦' : /patch/i.test(name) ? '⬢' : /collection/i.test(name) ? 'COL' : /green/i.test(name) ? 'GREEN' : /red|covert/i.test(name) ? 'RED' : /blue|mil/i.test(name) ? 'BLUE' : /pink|classified/i.test(name) ? 'PINK' : 'CS2';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 460"><defs><radialGradient id="r" cx="50%" cy="0%" r="80%"><stop stop-color="${c}"/><stop offset="1" stop-color="${c2}"/></radialGradient><linearGradient id="g" x1="0" x2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="${c}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="26" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter></defs><rect width="680" height="460" rx="44" fill="#090d18"/><circle cx="135" cy="80" r="170" fill="${c}" opacity=".22"/><circle cx="550" cy="380" r="190" fill="${c}" opacity=".16"/><g filter="url(#s)"><path d="M120 165h440c24 0 43 19 43 43v230c0 24-19 43-43 43H120c-24 0-43-19-43-43V208c0-24 19-43 43-43z" fill="url(#g)" stroke="rgba(255,255,255,.22)" stroke-width="10"/><path d="M190 165v-36c0-44 32-76 76-76h148c44 0 76 32 76 76v36" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="22"/><rect x="110" y="205" width="460" height="132" rx="22" fill="url(#r)" opacity=".92"/><path d="M140 235h400M140 272h400M140 309h400" stroke="#020617" stroke-opacity=".28" stroke-width="9"/></g><text x="340" y="303" font-family="Arial" font-weight="900" font-size="76" fill="#fff" text-anchor="middle">${icon}</text><text x="340" y="392" font-family="Arial" font-weight="900" font-size="32" fill="#fff" text-anchor="middle">${safe}</text></svg>`);
  }
  function specialCaseImage(name, pool, color){
    const hit = (pool||[]).find(i => i && i.image && !String(i.image).startsWith('data:image/svg+xml'));
    return hit ? hit.image : thematicCaseImage(name, color);
  }
  function makeSpecialCase(id, name, price, pool, profit=.25, color='#ff7a18', kind='special', source='Custom Pool'){
    pool = (pool || []).filter(Boolean);
    return {id, name, price, image:specialCaseImage(name, pool, color), items:pool.slice(0, 60), profit, kind, source};
  }
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
  function itemTypeFromName(name, fallback='skin'){
    const n=String(name||'').toLowerCase();
    if(/sticker|graffiti|capsule/.test(n)) return 'sticker';
    if(/agent|operator|sir bloody|ava|darryl|mae|number k|seal|swat|fbi|professional/.test(n)) return 'agent';
    if(/patch/.test(n)) return 'patch';
    if(/charm|keychain/.test(n)) return 'charm';
    if(/glove|wraps|hand wraps/.test(n)) return 'glove';
    if(/knife|karambit|bayonet|butterfly|daggers|talon|kukri|falchion|stiletto|ursus|navaja|nomad|skeleton|paracord|survival/.test(n)) return 'knife';
    return fallback;
  }
  function fallbackImageFor(name,type){
    return placeholderFor(name, itemTypeFromName(name,type||'skin'));
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
    type = itemTypeFromName(name, type || 'skin');
    let rarity = mapRarity(raw.rarity);
    if(type==='knife') rarity = 'Rare Special Item';
    if(type==='glove') rarity = 'Extraordinary';
    const img = fixImageUrl(raw.image) || fallbackImageFor(name,type);
    return { id: raw.id || slug(name), name, rarity, rarityColor: raw.rarity?.color || rarityColor[rarity] || '#60a5fa', value: priceFor(name,rarity,type), weight: baseWeights[rarity] || 8, image: img, type };
  }
  function localItem(id,name,rarity,value,img,type='skin'){
    type = itemTypeFromName(name,type);
    return {id,name,rarity,value,rarityColor:rarityColor[rarity]||'#60a5fa',weight:baseWeights[rarity]||8,image:img||fallbackImageFor(name,type),type};
  }
  function buildFallbackItems(){
    const s = (id,name,rarity,value,type='skin',img='') => localItem(id,name,rarity,value,img||fallbackImageFor(name,type),type);
    return [
      s('ak-redline','AK-47 | Redline','Classified',3200,'skin',REAL.akRedline),
      s('awp-hyper','AWP | Hyper Beast','Covert',7400,'skin',REAL.awpHyper),
      s('karambit-doppler','★ Karambit | Doppler','Rare Special Item',92000,'knife',REAL.karambit),
      s('ak-vulcan','AK-47 | Vulcan','Covert',18500), s('ak-empress','AK-47 | The Empress','Covert',7600), s('ak-headshot','AK-47 | Head Shot','Covert',5400), s('ak-legion','AK-47 | Legion of Anubis','Covert',2300), s('ak-ice','AK-47 | Ice Coaled','Classified',1450), s('ak-slate','AK-47 | Slate','Restricted',620), s('ak-bloodsport','AK-47 | Bloodsport','Covert',8200),
      s('awp-asiimov','AWP | Asiimov','Covert',11200), s('awp-duality','AWP | Duality','Classified',950), s('awp-fever','AWP | Fever Dream','Classified',650), s('awp-neo','AWP | Neo-Noir','Covert',3300), s('awp-chromatic','AWP | Chromatic Aberration','Covert',3400), s('awp-paw','AWP | PAW','Restricted',320), s('awp-containment','AWP | Containment Breach','Covert',8400),
      s('m4-print','M4A1-S | Printstream','Covert',9200), s('m4-decimator','M4A1-S | Decimator','Classified',1900), s('m4-nightmare','M4A1-S | Nightmare','Classified',1250), s('m4-player','M4A1-S | Player Two','Covert',3100), s('m4a4-temukau','M4A4 | Temukau','Covert',7600), s('m4a4-neo','M4A4 | Neo-Noir','Covert',3300), s('m4a4-desolate','M4A4 | Desolate Space','Classified',1700), s('m4a4-dragon','M4A4 | 龍王','Classified',2100),
      s('de-print','Desert Eagle | Printstream','Covert',4200), s('de-ocean','Desert Eagle | Ocean Drive','Covert',2600), s('de-conspiracy','Desert Eagle | Conspiracy','Classified',1200), s('de-mecha','Desert Eagle | Mecha Industries','Classified',950),
      s('usp-kill','USP-S | Kill Confirmed','Covert',5400), s('usp-cortex','USP-S | Cortex','Classified',800), s('usp-print','USP-S | Printstream','Covert',7800), s('usp-ticket','USP-S | Ticket to Hell','Restricted',450),
      s('glock-water','Glock-18 | Water Elemental','Classified',950), s('glock-bullet','Glock-18 | Bullet Queen','Covert',1800), s('glock-vogue','Glock-18 | Vogue','Classified',680), s('glock-moonrise','Glock-18 | Moonrise','Restricted',240),
      s('p250-asiimov','P250 | Asiimov','Classified',780), s('p250-see','P250 | See Ya Later','Covert',650), s('tec-isaac','Tec-9 | Isaac','Mil-Spec Grade',190), s('tec-fuel','Tec-9 | Fuel Injector','Classified',650), s('five-hyper','Five-SeveN | Hyper Beast','Covert',1800), s('five-fairy','Five-SeveN | Fairy Tale','Classified',950),
      s('mp9-food','MP9 | Food Chain','Classified',980), s('mp9-starlight','MP9 | Starlight Protector','Covert',2300), s('mac-neon','MAC-10 | Neon Rider','Covert',1700), s('mac-disco','MAC-10 | Disco Tech','Classified',900), s('p90-death','P90 | Death Grip','Restricted',420), s('p90-asiimov','P90 | Asiimov','Covert',1450), s('ump-primal','UMP-45 | Primal Saber','Classified',1100),
      s('ssg-fever','SSG 08 | Fever Dream','Restricted',380), s('ssg-dragonfire','SSG 08 | Dragonfire','Covert',2100), s('famas-mecha','FAMAS | Mecha Industries','Classified',1200), s('famas-rapid','FAMAS | Rapid Eye Movement','Classified',900), s('galil-chat','Galil AR | Chatterbox','Covert',2100), s('galil-eco','Galil AR | Eco','Classified',1300),
      s('butterfly-doppler','★ Butterfly Knife | Doppler','Rare Special Item',98000,'knife'), s('m9-fade','★ M9 Bayonet | Fade','Rare Special Item',105000,'knife'), s('bayonet-tiger','★ Bayonet | Tiger Tooth','Rare Special Item',76000,'knife'), s('talon-slaughter','★ Talon Knife | Slaughter','Rare Special Item',64000,'knife'), s('kukri-case','★ Kukri Knife | Case Hardened','Rare Special Item',58000,'knife'), s('stiletto-fade','★ Stiletto Knife | Fade','Rare Special Item',72000,'knife'),
      s('sport-vice','★ Sport Gloves | Vice','Extraordinary',98000,'glove'), s('driver-king','★ Driver Gloves | King Snake','Extraordinary',42000,'glove'), s('sport-pandora','★ Sport Gloves | Pandora\'s Box','Extraordinary',170000,'glove'), s('hand-cobalt','★ Hand Wraps | Cobalt Skulls','Extraordinary',62000,'glove'),
      s('sticker-navi','Sticker | NAVI | Copenhagen 2024','High Grade',180,'sticker'), s('sticker-spirit','Sticker | Team Spirit | Shanghai 2024','Remarkable',560,'sticker'), s('sticker-faze','Sticker | FaZe Clan | Paris 2023','High Grade',160,'sticker'), s('sticker-gold','Sticker | MOUZ Gold | Copenhagen 2024','Extraordinary',5200,'sticker'),
      s('agent-ava','Special Agent Ava | FBI','Master Agent',6200,'agent'), s('agent-darryl','Sir Bloody Darryl | The Professionals','Master Agent',6900,'agent'), s('agent-mae','Cmdr. Mae | SWAT','Superior Agent',2600,'agent'),
      s('charm-hot','Charm | Hot Hands','Remarkable',850,'charm'), s('charm-baby','Charm | Baby Karat T','Exotic',2400,'charm'), s('patch-bravo','Patch | Bravo','Remarkable',850,'patch'), s('patch-phoenix','Patch | Phoenix','High Grade',260,'patch')
    ];
  }

  function buildFallbackCases(pool){
    const skinsOnly = pool.filter(x=>x.type==='skin');
    const knives = pool.filter(x=>x.type==='knife');
    const gloves = pool.filter(x=>x.type==='glove');
    const stickers = pool.filter(x=>x.type==='sticker');
    const agents = pool.filter(x=>x.type==='agent');
    const charms = pool.filter(x=>x.type==='charm');
    const patches = pool.filter(x=>x.type==='patch');
    const officialNames = [
      ['kilowatt-case','Kilowatt Case',840], ['revolution-case','Revolution Case',620], ['recoil-case','Recoil Case',690], ['dreams-nightmares','Dreams & Nightmares Case',760], ['snakebite-case','Snakebite Case',420], ['fracture-case','Fracture Case',390], ['clutch-case','Clutch Case',620], ['prisma-2-case','Prisma 2 Case',520], ['spectrum-2-case','Spectrum 2 Case',740], ['gamma-2-case','Gamma 2 Case',980], ['glove-case','Glove Case',1400], ['chroma-3-case','Chroma 3 Case',650],
      ['horizon-case','Horizon Case',560], ['danger-zone-case','Danger Zone Case',470], ['cs20-case','CS20 Case',820], ['broken-fang-case','Operation Broken Fang Case',1150], ['riptide-case','Operation Riptide Case',1750], ['gallery-case','Gallery Case',780], ['fever-case','Fever Case',640], ['prisma-case','Prisma Case',620], ['spectrum-case','Spectrum Case',940], ['chroma-2-case','Chroma 2 Case',850], ['chroma-case','Chroma Case',760], ['falchion-case','Falchion Case',780], ['shadow-case','Shadow Case',720], ['wildfire-case','Operation Wildfire Case',1550], ['vanguard-case','Operation Vanguard Weapon Case',2800], ['phoenix-case','Operation Phoenix Weapon Case',1900], ['huntsman-case','Huntsman Weapon Case',2200], ['winter-case','Winter Offensive Weapon Case',2100], ['breakout-case','Operation Breakout Weapon Case',2400], ['bravo-case','Operation Bravo Case',8600], ['arms-deal-case','CS:GO Weapon Case',15000], ['arms-deal-2-case','CS:GO Weapon Case 2',9800], ['arms-deal-3-case','CS:GO Weapon Case 3',9200]
    ];
    const official = officialNames.map((x,i)=>({id:x[0],name:x[1],price:x[2],image:FALLBACK_CASE_IMAGES[x[1]]||casePlaceholder(x[1]),items:rotatePool(skinsOnly.concat(knives,gloves),i*3,32),profit:.18+(i%6)*.035,kind:'case',source:'CS2 Case'}));
    const qualityCase = (id,name,price,filter,profit=.25,color='#4b69ff') => makeSpecialCase(id,name,price,skinsOnly.filter(filter).concat(skinsOnly).slice(0,40),profit,color);
    const special = [
      qualityCase('blue-case','Blue Mil-Spec Case',260,i=>['Mil-Spec Grade','Industrial Grade'].includes(i.rarity),.38,'#4b69ff'),
      qualityCase('green-case','Green Industrial Case',180,i=>['Consumer Grade','Industrial Grade'].includes(i.rarity),.42,'#22c55e'),
      qualityCase('purple-case','Purple Restricted Case',850,i=>i.rarity==='Restricted'||i.rarity==='Classified',.27,'#8847ff'),
      qualityCase('pink-case','Pink Classified Case',2200,i=>i.rarity==='Classified'||i.rarity==='Covert',.22,'#ec4899'),
      qualityCase('red-case','Red Covert Case',5600,i=>i.rarity==='Covert',.17,'#ef4444'),
      qualityCase('premium-case','Premium Rifle Case',9800,i=>/AK-47|M4A1|M4A4|AWP/.test(i.name),.16,'#f59e0b'),
      makeSpecialCase('knife-case','Knife Case',36000,knives.length?knives:pool.filter(i=>i.type==='knife'),.14,'#f59e0b'),
      makeSpecialCase('gloves-case','Gloves Case',29000,gloves.length?gloves:pool.filter(i=>i.type==='glove'),.15,'#8b5cf6'),
      makeSpecialCase('knife-glove-case','Knives & Gloves Case',42000,knives.concat(gloves),.13,'#f97316'),
      makeSpecialCase('stickers-all','Sticker Capsule',280,stickers,.40,'#4b69ff'),
      makeSpecialCase('stickers-tournament','Tournament Stickers Case',390,stickers.filter(i=>/copenhagen|shanghai|austin|paris|antwerp|stockholm|rio|katowice|cologne|berlin|krakow|atlanta/i.test(i.name)),.38,'#8b5cf6'),
      makeSpecialCase('agents-case','Agents Case',1250,agents,.34,'#ef4444'),
      makeSpecialCase('master-agents','Master Agents Case',2400,agents.filter(i=>/master/i.test(i.rarity)),.22,'#eab308'),
      makeSpecialCase('charms-case','Armory Charms Case',620,charms,.35,'#22c55e'),
      makeSpecialCase('patches-case','Patches Case',520,patches,.35,'#06b6d4'),
      makeSpecialCase('charms-patches-case','Charms & Patches Case',650,charms.concat(patches),.35,'#84cc16')
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
      const [skinsRes, cratesRes, stickersRes, agentsRes, keychainsRes, patchesRes, collectiblesRes, collectionsRes] = await Promise.allSettled([
        getEndpoint('skins.json'), getEndpoint('crates.json'), getEndpoint('stickers.json'), getEndpoint('agents.json'), getEndpoint('keychains.json'), getEndpoint('patches.json'), getEndpoint('collectibles.json'), getEndpoint('collections.json')
      ]);
      const skins = skinsRes.status==='fulfilled' && Array.isArray(skinsRes.value) ? skinsRes.value : [];
      const crates = cratesRes.status==='fulfilled' && Array.isArray(cratesRes.value) ? cratesRes.value : [];
      const stickers = stickersRes.status==='fulfilled' && Array.isArray(stickersRes.value) ? stickersRes.value : [];
      const agents = agentsRes.status==='fulfilled' && Array.isArray(agentsRes.value) ? agentsRes.value : [];
      const charms = keychainsRes.status==='fulfilled' && Array.isArray(keychainsRes.value) ? keychainsRes.value : [];
      const patches = patchesRes.status==='fulfilled' && Array.isArray(patchesRes.value) ? patchesRes.value : [];
      const collectibles = collectiblesRes.status==='fulfilled' && Array.isArray(collectiblesRes.value) ? collectiblesRes.value : [];
      const collectionsMeta = collectionsRes.status==='fulfilled' && Array.isArray(collectionsRes.value) ? collectionsRes.value : [];
      if(skins.length < 20) throw new Error('skins empty');

      const wanted = ['AK-47 | Redline','AK-47 | Vulcan','AK-47 | The Empress','AK-47 | Head Shot','AK-47 | Legion of Anubis','AK-47 | Ice Coaled','AK-47 | Slate','M4A1-S | Printstream','M4A1-S | Decimator','M4A1-S | Nightmare','M4A1-S | Player Two','M4A4 | Temukau','M4A4 | Neo-Noir','AWP | Asiimov','AWP | Hyper Beast','AWP | Duality','AWP | Fever Dream','AWP | Neo-Noir','AWP | Chromatic Aberration','Desert Eagle | Printstream','Desert Eagle | Ocean Drive','USP-S | Kill Confirmed','USP-S | Cortex','Glock-18 | Water Elemental','Glock-18 | Bullet Queen','P250 | Asiimov','Tec-9 | Isaac','MP9 | Food Chain','MAC-10 | Neon Rider','P90 | Death Grip','SSG 08 | Fever Dream','FAMAS | Mecha Industries','Galil AR | Chatterbox','★ Karambit | Doppler','★ Karambit | Gamma Doppler','★ Butterfly Knife | Doppler','★ M9 Bayonet | Fade','★ Bayonet | Tiger Tooth','★ Sport Gloves | Vice','★ Driver Gloves | King Snake'];
      const byName = new Map(skins.map(x=>[String(x.name||'').toLowerCase(),x]));
      let realItems = wanted.map(n=>byName.get(n.toLowerCase())).filter(Boolean).map(x=>normItem(x, itemTypeFromName(x.name,'skin')));
      skins.forEach(x=>{ if(realItems.length<180 && x.image && !realItems.some(i=>i.name===x.name)) realItems.push(normItem(x, itemTypeFromName(x.name,'skin'))); });
      const stickerItems = stickers.filter(x=>x.image).slice(0,120).map(x=>normItem(x,'sticker'));
      const agentItems = agents.filter(x=>x.image).slice(0,40).map(x=>normItem(x,'agent'));
      const charmItems = charms.filter(x=>x.image).slice(0,40).map(x=>normItem(x,'charm'));
      const patchItems = patches.filter(x=>x.image).slice(0,40).map(x=>normItem(x,'patch'));
      const collectibleItems = collectibles.filter(x=>x.image).slice(0,30).map(x=>normItem(x,'sticker'));
      items = realItems.concat(stickerItems, agentItems, charmItems, patchItems, collectibleItems).filter(uniqueByName);

      const preferredCases = ['Kilowatt Case','Revolution Case','Recoil Case','Dreams & Nightmares Case','Fracture Case','Clutch Case','Prisma 2 Case','Spectrum 2 Case','Operation Riptide Case','Snakebite Case','Horizon Case','Gamma 2 Case','Danger Zone Case','CS20 Case','Glove Case','Operation Broken Fang Case','Chroma 3 Case','Falchion Case','Shadow Case','Winter Offensive Weapon Case','Gallery Case','Fever Case','Operation Wildfire Case','Operation Vanguard Weapon Case','Huntsman Weapon Case','Operation Phoenix Weapon Case','CS:GO Weapon Case 2','CS:GO Weapon Case 3','Operation Breakout Weapon Case','Operation Bravo Case','CS:GO Weapon Case'];
      const preferredCollections = ['The Graphic Design Collection','The Sport & Field Collection','The Overpass 2024 Collection','The Gallery Collection','The Armory Collection','The Ascent Collection','The Boreal Collection','The Radiant Collection','The Anubis Collection','The 2021 Mirage Collection','The 2021 Dust 2 Collection','The 2021 Vertigo Collection','The Ancient Collection','The Norse Collection','The Canals Collection','The St. Marc Collection'];

      const allCrates = crates.filter(c => c && Array.isArray(c.contains) && c.contains.length > 3);
      const casesRaw = allCrates.filter(c => /case/i.test(String((c.type||'') + ' ' + (c.name||''))));
      const collectionsRaw = allCrates.filter(c => /collection/i.test(String((c.type||'') + ' ' + (c.name||''))));
      const pickedCases = [];
      preferredCases.forEach(name => { const f = casesRaw.find(c => c.name === name); if(f && !pickedCases.includes(f)) pickedCases.push(f); });
      casesRaw.forEach(c => { if(pickedCases.length < 42 && !pickedCases.includes(c)) pickedCases.push(c); });
      const pickedCollections = [];
      preferredCollections.forEach(name => { const f = collectionsRaw.find(c => c.name === name); if(f && !pickedCollections.includes(f)) pickedCollections.push(f); });
      collectionsRaw.forEach(c => { if(pickedCollections.length < 18 && !pickedCollections.includes(c)) pickedCollections.push(c); });

      function mapCrate(c, idx, kind='case'){
        const rawPool = ([]).concat(Array.isArray(c.contains)?c.contains:[], Array.isArray(c.contains_rare)?c.contains_rare:[]);
        let pool = rawPool.filter(x=>x && x.name).map(x=>normItem(x, itemTypeFromName(x.name,'skin'))).filter(uniqueByName);
        if(kind==='case') pool = pool.filter(x=>['skin','knife','glove'].includes(x.type));
        if(kind==='collection') pool = pool.filter(x=>['skin'].includes(x.type));
        if(pool.length < 8){
          const fallbackSource = kind==='collection' ? items.filter(x=>x.type==='skin') : items.filter(x=>['skin','knife','glove'].includes(x.type));
          pool = rotatePool(fallbackSource, idx*3, 34);
        }
        const image = fixImageUrl(c.image) || FALLBACK_CASE_IMAGES[c.name] || thematicCaseImage(c.name, kind==='collection' ? '#4b69ff' : '#ff7a18');
        return {id:(kind==='collection'?'col-':'') + slug(c.name), name:c.name, price:casePrice(c.name, idx, kind), image, items:pool, profit:kind==='collection' ? .24 + (idx%4)*.03 : .16 + (idx%7)*.032, kind, source:kind==='collection' ? 'CS2 Collection' : 'CS2 Case'};
      }

      let realCases = pickedCases.map((c,idx)=>mapCrate(c,idx,'case')).filter(Boolean)
        .concat(pickedCollections.map((c,idx)=>mapCrate(c,idx,'collection')).filter(Boolean));
      const skinsOnly = items.filter(x=>x.type==='skin');
      const knives = items.filter(x=>x.type==='knife');
      const gloves = items.filter(x=>x.type==='glove');
      const stickersOnly = items.filter(x=>x.type==='sticker');
      const agentsOnly = items.filter(x=>x.type==='agent');
      const charmsOnly = items.filter(x=>x.type==='charm');
      const patchesOnly = items.filter(x=>x.type==='patch');
      const collectibleOnly = collectibleItems;

      realCases = realCases.concat([
        makeSpecialCase('budget-blue','Budget Blue Case',240,skinsOnly.filter(x=>['Mil-Spec Grade','Restricted','Industrial Grade'].includes(x.rarity)).slice(0,40),.34,'#4b69ff'),
        makeSpecialCase('green-industrial','Green Industrial Case',160,skinsOnly.filter(x=>['Consumer Grade','Industrial Grade','Mil-Spec Grade'].includes(x.rarity)).slice(0,40),.42,'#22c55e'),
        makeSpecialCase('purple-restricted','Purple Restricted Case',850,skinsOnly.filter(x=>['Restricted','Classified'].includes(x.rarity)).slice(0,40),.27,'#8847ff'),
        makeSpecialCase('pink-classified','Pink Classified Case',2300,skinsOnly.filter(x=>['Classified','Covert'].includes(x.rarity)).slice(0,40),.22,'#ec4899'),
        makeSpecialCase('red-covert','Red Covert Case',5600,skinsOnly.filter(x=>['Covert'].includes(x.rarity)).slice(0,40),.16,'#ef4444'),
        makeSpecialCase('high-roller','High Roller Case',12500,skinsOnly.filter(x=>x.value>5000).concat(knives).slice(0,40),.13,'#f59e0b'),
        makeSpecialCase('knife-case','Knife Case',36000,knives,.14,'#f59e0b'),
        makeSpecialCase('gloves-case','Gloves Case',29000,gloves,.15,'#8b5cf6'),
        makeSpecialCase('knife-glove-case','Knives & Gloves Case',42000,knives.concat(gloves),.13,'#f97316'),
        makeSpecialCase('stickers-all','Sticker Capsule',280,stickersOnly,.40,'#4b69ff'),
        makeSpecialCase('stickers-tournament','Tournament Stickers Case',390,stickersOnly.filter(x=>/copenhagen|shanghai|austin|paris|antwerp|stockholm|rio|katowice|cologne|berlin|krakow|atlanta/i.test(x.name)).slice(0,80),.38,'#8b5cf6'),
        makeSpecialCase('stickers-copenhagen','Copenhagen Stickers Capsule',390,stickersOnly.filter(x=>/copenhagen 2024/i.test(x.name)).slice(0,80),.38,'#60a5fa'),
        makeSpecialCase('stickers-shanghai','Shanghai Stickers Capsule',390,stickersOnly.filter(x=>/shanghai 2024/i.test(x.name)).slice(0,80),.38,'#06b6d4'),
        makeSpecialCase('stickers-austin','Austin Stickers Capsule',390,stickersOnly.filter(x=>/austin 2025/i.test(x.name)).slice(0,80),.38,'#10b981'),
        makeSpecialCase('stickers-paris','Paris Stickers Capsule',390,stickersOnly.filter(x=>/paris 2023/i.test(x.name)).slice(0,80),.38,'#f472b6'),
        makeSpecialCase('agents-case','Agents Case',1250,agentsOnly,.34,'#ef4444'),
        makeSpecialCase('master-agents','Master Agents Case',2400,agentsOnly.filter(x=>/master/i.test(x.rarity)),.22,'#eab308'),
        makeSpecialCase('charms-case','Armory Charms Case',620,charmsOnly,.35,'#22c55e'),
        makeSpecialCase('patches-case','Patches Case',520,patchesOnly,.35,'#06b6d4'),
        makeSpecialCase('charms-patches-case','Charms & Patches Case',650,charmsOnly.concat(patchesOnly),.35,'#84cc16'),
        makeSpecialCase('collectibles-case','Collectibles Case',520,collectibleOnly,.33,'#f59e0b')
      ]);
      cases = realCases.filter(c=>c.items && c.items.length).filter(uniqueCaseById);
      if(cases.length < 20) cases = buildFallbackCases(items);
      state.inventory.forEach(inv => { const src=items.find(i=>i.name===inv.name); if(src){ inv.image=src.image; inv.rarityColor=src.rarityColor; }});
      apiLoaded = true;
      save(false);
      route();
    }catch(e){ console.warn('Real catalog fallback', e); }
  }
  function uniqueByName(x,idx,arr){ return x && x.name && arr.findIndex(y=>y.name===x.name)===idx; }
  function uniqueCaseById(x,idx,arr){ return x && x.id && arr.findIndex(y=>y.id===x.id)===idx; }
  function casePrice(name, idx, kind='case'){
    const n=String(name).toLowerCase();
    const m = [
      ['kilowatt',840], ['revolution',620], ['recoil',690], ['dream',760], ['snake',420], ['fracture',390], ['clutch',620], ['prisma 2',520], ['spectrum 2',740], ['gamma 2',980], ['glove',1400], ['chroma 3',650],
      ['horizon',560], ['danger zone',470], ['cs20',820], ['broken fang',1150], ['riptide',1750], ['gallery',780], ['fever',640], ['prisma',620], ['spectrum',940], ['chroma 2',850], ['chroma case',760], ['falchion',780], ['shadow',720], ['wildfire',1550], ['vanguard',2800], ['phoenix',1900], ['huntsman',2200]
    ];
    const hit=m.find(([k])=>n.includes(k));
    if(hit) return hit[1];
    if(kind==='collection') return 780 + (idx%10)*170;
    return 500 + (idx%7)*140;
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
  function heroSkin(i){ const fb=placeholderFor(i.name,i.type); return `<div class="hero-skin"><img src="${esc(i.image||fb)}" data-fallback="${esc(fb)}" alt="${esc(i.name)}" onerror="this.onerror=null;this.src=this.dataset.fallback"><b>${esc(i.name)}</b><span>${esc(i.rarity)}</span></div>`; }
  function caseCard(c){ const fb=casePlaceholder(c.name); const kind=(c.kind==='collection'?'Коллекция':(c.kind==='special'?'Спецкейс':'Кейс')); const source=c.source||'CS2'; return `<article class="case-card"><div class="case-topline"><span class="case-label">${esc(kind)}</span><span class="case-source">${esc(source)}</span></div><div class="case-img-wrap"><img src="${esc(c.image||fb)}" data-fallback="${esc(fb)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(c.name)}"></div><h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b class="price">${fmt(c.price)}</b></div><div class="chips">${[...new Set(c.items.map(i=>i.rarity))].slice(0,4).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><div class="case-actions"><button class="btn primary" type="button" data-action="open-case" data-case="${esc(c.id)}">Крутить</button><button class="btn" type="button" data-action="case-pool" data-case="${esc(c.id)}">Пул</button></div></article>`; }
  function itemCard(it, opts={}){ const actions=opts.actions||''; const fb=placeholderFor(it.name,it.type); return `<article class="item-card ${opts.selected?'selected':''}" style="--rar:${it.rarityColor||'#60a5fa'}" data-uid="${esc(it.uid||'')}"><div class="item-art"><img src="${esc(it.image||fb)}" data-fallback="${esc(fb)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(it.name)}"></div><h4>${esc(it.name)}</h4><small>${esc(it.rarity)}${it.wear?' · '+esc(it.wear):''}</small><div class="item-value"><b>${fmt(it.value)}</b>${opts.badge?`<span class="chip">${opts.badge}</span>`:''}</div>${actions?`<div class="item-actions">${actions}</div>`:''}</article>`; }
  function renderCases(app){ app.innerHTML=pageTitle('Кейсы', (apiLoaded?'Каталог приближен к десктопной версии: больше кейсов, коллекций и спецпулов.':'Резервный каталог уже содержит много разных кейсов и спецпулов.') + ' Всего: ' + cases.length)+`<div class="grid">${cases.map(caseCard).join('')}</div>`; wireButtons(); }
  function renderInventory(app){ const total=state.inventory.reduce((s,i)=>s+i.value,0); app.innerHTML=pageTitle('Инвентарь','Продажа, сортировка и отправка в апгрейд.')+`<div class="notice"><b>Стоимость инвентаря:</b> ${fmt(total)}</div><div class="row section"><button class="btn green" data-action="sell-all" ${state.inventory.length?'':'disabled'}>Продать всё</button><button class="btn" data-action="sort-inv">Сортировать</button></div>${state.inventory.length?`<div class="grid">${state.inventory.map(i=>itemCard(i,{actions:`<button data-action="sell-item" data-uid="${i.uid}">Продать</button><button data-action="to-upgrade" data-uid="${i.uid}">Апгрейд</button>`})).join('')}</div>`:'<div class="empty">Инвентарь пуст.</div>'}`; wireButtons(); }
  function renderUpgrade(app){ const own=state.inventory[0]; const pool=items.filter(i=>['skin','knife','glove'].includes(i.type)&&i.value>(own?own.value:0)).sort((a,b)=>a.value-b.value).slice(0,36); app.innerHTML=pageTitle('Апгрейд','Выбери свой предмет и цель.')+(own?`<div class="notice">Твой предмет: <b>${esc(own.name)}</b> · ${fmt(own.value)}</div>`:'<div class="notice">Сначала выбей предмет.</div>')+`<div class="grid two">${pool.map(i=>itemCard(i,{badge:'цель',actions:`<button class="btn small" data-action="upgrade" data-target="${esc(i.id)}">Цель</button>`})).join('')}</div>`; wireButtons(); }
  function renderContracts(app){ const selected=state.inventory.slice(0,10); app.innerHTML=pageTitle('Контракты','Первые 3–10 предметов инвентаря участвуют в контракте.')+`<div class="notice">Выбрано: <b>${Math.min(selected.length,10)}</b>. Нужно минимум 3.</div><button class="btn primary" data-action="contract" ${selected.length>=3?'':'disabled'}>Собрать контракт</button><div class="grid section">${selected.map(i=>itemCard(i,{selected:true})).join('')}</div>`; wireButtons(); }
  function renderWheel(app){ const left=Math.max(0,WHEEL_COOLDOWN-(now()-state.lastWheel)); app.innerHTML=pageTitle('Колесо бонусов','Одна прокрутка раз в 2 часа.')+`<div class="pointer"></div><div class="big-wheel" id="wheel"><span>LAB</span></div>${left?`<div class="notice">До следующей прокрутки: <b>${Math.ceil(left/60000)} мин.</b></div>`:`<button class="btn primary" data-action="spin-wheel">Крутить колесо</button>`}`; wireButtons(); }
  function renderBattle(app){ app.innerHTML=pageTitle('Battle','Открой кейс против бота. Победитель забирает оба предмета.')+`<div class="grid">${cases.slice(0,12).map(c=>{const fb=casePlaceholder(c.name);return `<div class="panel battle-card"><img src="${esc(c.image||fb)}" data-fallback="${esc(fb)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt=""><h3>${esc(c.name)}</h3><p class="price">${fmt(c.price)}</p><button class="btn primary" data-action="battle" data-case="${esc(c.id)}">Начать</button></div>`}).join('')}</div>`; wireButtons(); }
  function renderAds(app){ const day=new Date().toISOString().slice(0,10); const used=state.adViews[day]||0; app.innerHTML=pageTitle('Реклама','10 секунд просмотра = 750 ₽LC.')+`<div class="notice">Сегодня: <b>${used}/${AD_LIMIT}</b></div><button class="btn primary" data-action="watch-ad" ${used>=AD_LIMIT?'disabled':''}>Смотреть рекламу</button>`; wireButtons(); }
  function renderPromo(app){ app.innerHTML=pageTitle('Промокоды','Каждый код активируется один раз.')+`<div class="controls"><input class="field" id="promoInput" placeholder="Введите промокод"><button class="btn primary" data-action="promo">Активировать</button></div><div class="notice section">Рабочие: WELCOMEMOBILE, IOSFIX, FASTCASE, MOBILEKING, TEST100K, CLEANV5</div>`; wireButtons(); }
  function renderProfile(app){ app.innerHTML=pageTitle('Профиль','Сохранение хранится на устройстве.')+statCards()+`<section class="section controls"><button class="btn blue" data-action="export">Экспорт save</button><textarea class="field" id="saveBox" rows="5" placeholder="save"></textarea><button class="btn" data-action="import">Импорт save</button><button class="btn red" data-action="reset">Сбросить прогресс</button></section>`; wireButtons(); }
  function renderInstall(app){ app.innerHTML=pageTitle('Установка','iPhone: Safari → Поделиться → На экран Домой.')+`<div class="notice">Эта мобильная сборка публикуется отдельно от desktop-версии.</div>`; wireButtons(); }
  function renderMore(app){ app.innerHTML=pageTitle('Ещё','Дополнительные разделы.')+`<div class="grid"><a class="btn" href="#contracts">Контракты</a><a class="btn" href="#wheel">Колесо</a><a class="btn" href="#battle">Battle</a><a class="btn" href="#promo">Промо</a><a class="btn" href="#ads">Реклама</a><a class="btn" href="#profile">Профиль</a><a class="btn" href="#install">Установка</a></div>`; wireButtons(); }

  function findCase(id){ return cases.find(c=>c.id===id); }
  function weighted(c){ const pool=c.items && c.items.length?c.items:items; let total=0; const arr=pool.map(it=>{ let w=Math.max(.01, it.weight||baseWeights[it.rarity]||6); const ratio=(it.value||0)/Math.max(1,c.price||1); if(ratio>1) w*=c.profit||.3; if(ratio>2) w*=.25; if(ratio<.5) w*=1.2; w*=.9+rnd()*.2; total+=w; return [it,w]; }); let r=rnd()*total; for(const [it,w] of arr){ r-=w; if(r<=0) return it; } return pool[pool.length-1]; }
  function resultMini(d,label='') { const fb=placeholderFor(d.name,d.type); return `<div class="result-mini" style="--rar:${d.rarityColor}"><img src="${esc(d.image||fb)}" data-fallback="${esc(fb)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt=""><b>${label?esc(label)+': ':''}${esc(d.name)}</b><small>${fmt(d.value)}</small></div>`; }
  function openCase(id,count=1){ const c=findCase(id); if(!c) return toast('Кейс не найден','bad'); count=clamp(Math.round(count||1),1,10); const cost=c.price*count; if(!spend(cost,`Открытие ${c.name} x${count}`)) return; const drops=[]; for(let i=0;i<count;i++){ const d=invItem(weighted(c)); drops.push(d); state.inventory.unshift(d); } state.opened+=count; save(); showDrops(c,drops); }
  function showDrops(c,drops){ openModal(`Дроп: ${c.name}`, `<div class="results-grid">${drops.map(d=>resultMini(d)).join('')}</div><div class="drop-actions"><button class="btn green" data-action="sell-drops" data-uids="${drops.map(d=>d.uid).join(',')}">Продать всё</button><button class="btn primary" data-action="open-case" data-case="${esc(c.id)}">Ещё 1</button></div><div class="multi-grid"><button class="btn small" data-action="open-case-x" data-case="${esc(c.id)}" data-count="3">x3</button><button class="btn small" data-action="open-case-x" data-case="${esc(c.id)}" data-count="5">x5</button><button class="btn small" data-action="open-case-x" data-case="${esc(c.id)}" data-count="10">x10</button></div>`); }
  function sellUids(uids){ const set=new Set(uids); const sell=state.inventory.filter(i=>set.has(i.uid)); if(!sell.length)return; const value=sell.reduce((s,i)=>s+i.value,0); state.inventory=state.inventory.filter(i=>!set.has(i.uid)); state.sold+=value; addMoney(value,'Продажа предметов'); closeModal(); route(); toast('Продано: '+fmt(value),'good'); }
  function upgrade(id){ if(!state.inventory.length) return toast('Нет предмета','bad'); const target=items.find(i=>i.id===id); const base=state.inventory[0]; if(!target) return; const chance=clamp((base.value/target.value)*82,2,72); const win=rnd()*100<chance; state.inventory.shift(); state.upgrades++; if(win){ state.inventory.unshift(invItem(target)); toast('Апгрейд успешен: '+Math.round(chance)+'%','good'); } else toast('Апгрейд не прошёл: '+Math.round(chance)+'%','bad'); save(); route(); }
  function contract(){ const selected=state.inventory.slice(0,10); if(selected.length<3) return toast('Нужно минимум 3 предмета','bad'); const val=selected.reduce((s,i)=>s+i.value,0); const pool=items.filter(i=>i.value>=val*.35 && i.value<=val*1.9); const target=invItem(pool.length?pool[Math.floor(rnd()*pool.length)]:items[Math.floor(rnd()*items.length)]); state.inventory=state.inventory.filter(i=>!selected.some(x=>x.uid===i.uid)); state.inventory.unshift(target); state.contracts++; save(); const fb=placeholderFor(target.name,target.type); openModal('Контракт', `<img class="drop-img" src="${esc(target.image||fb)}" data-fallback="${esc(fb)}" onerror="this.onerror=null;this.src=this.dataset.fallback"><h3 class="drop-title">${esc(target.name)}</h3><p>${fmt(target.value)}</p><button class="btn primary" data-close-modal>Ок</button>`); }
  function spinWheel(){ const left=Math.max(0,WHEEL_COOLDOWN-(now()-state.lastWheel)); if(left) return toast('Колесо ещё на кулдауне','warn'); const rewards=[250,500,750,1000,1500,2000,3000,items[Math.floor(rnd()*items.length)]]; const reward=rewards[Math.floor(rnd()*rewards.length)]; const wheel=$('#wheel'); if(wheel) wheel.style.transform=`rotate(${720+rnd()*720}deg)`; state.lastWheel=now(); setTimeout(()=>{ if(typeof reward==='number'){ addMoney(reward,'Колесо бонусов'); toast('Колесо: '+fmt(reward),'good'); } else { state.inventory.unshift(invItem(reward)); save(); toast('Колесо: предмет','good'); } route(); },900); }
  function battle(id){ const c=findCase(id); if(!c || !spend(c.price,'Battle '+(c&&c.name))) return; const me=invItem(weighted(c)), bot=invItem(weighted(c)); state.battles++; let body=`<div class="results-grid">${resultMini(me,'Ты')}${resultMini(bot,'Бот')}</div>`; if(me.value>=bot.value){ state.inventory.unshift(me,bot); state.wins++; body+=`<div class="notice">Победа! Оба предмета в инвентаре.</div>`; } else body+=`<div class="notice">Поражение. Предметы забрал бот.</div>`; save(); openModal('Case Battle', body+`<button class="btn primary" data-close-modal>Ок</button>`); }
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
    try{ if(location.search.includes('clear=mobile-clean-v6')) localStorage.removeItem(SAVE_KEY); }catch(e){}
    if(!location.hash) location.hash='home';
    route(); wireButtons();
    setTimeout(loadRealCatalog, 100);
    setInterval(wireButtons, 1200);
  });
})();

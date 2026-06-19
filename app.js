(function(){
  'use strict';
  const VERSION = 'mobile-clean-1.0.0';
  const SAVE_KEY = 'cs2_mobile_clean_save_v1';
  const CURRENCY = '₽LC';
  const WHEEL_COOLDOWN = 2 * 60 * 60 * 1000;
  const AD_LIMIT = 10;
  const AD_REWARD = 750;
  const PROMOS = {WELCOMEMOBILE:5000, IOSFIX:10000, FASTCASE:3000, MOBILEKING:15000, TEST100K:100000, KNIFEDREAM:25000, RUBLEDROP:12000};
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const fmt = n => `${Math.round(Number(n)||0).toLocaleString('ru-RU')} ${CURRENCY}`;
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const now = ()=>Date.now();
  function rnd(){ try{ const a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]/4294967296; }catch(e){ return Math.random(); } }
  const uid = ()=> (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const rarityColor = {'Consumer Grade':'#b0c3d9','Industrial Grade':'#5e98d9','Mil-Spec Grade':'#4b69ff','Restricted':'#8847ff','Classified':'#d32ce6','Covert':'#eb4b4b','Rare Special Item':'#ffd700','Extraordinary':'#e4ae33','High Grade':'#4b69ff','Remarkable':'#8847ff','Exotic':'#d32ce6','Master Agent':'#eb4b4b','Superior':'#d32ce6','Exceptional':'#8847ff','Distinguished':'#4b69ff'};
  const weights = {'Consumer Grade':85,'Industrial Grade':72,'Mil-Spec Grade':58,'Restricted':18,'Classified':6,'Covert':2.2,'Rare Special Item':0.45,'Extraordinary':0.45,'High Grade':32,'Remarkable':12,'Exotic':4,'Master Agent':1.3,'Superior':4,'Exceptional':10,'Distinguished':24};
  const wearMult = [['Factory New',1.35],['Minimal Wear',1.15],['Field-Tested',.95],['Well-Worn',.78],['Battle-Scarred',.62]];
  const colors = {
    red:['#111827','#ef4444'], blue:['#38bdf8','#2563eb'], green:['#22c55e','#064e3b'], pink:['#ec4899','#8b5cf6'], orange:['#f97316','#f8fafc'], gold:['#facc15','#f59e0b'], white:['#f8fafc','#94a3b8'], cyan:['#22d3ee','#8b5cf6']
  };
  function weaponSvg(name, palette='red', type='rifle'){
    const c = colors[palette] || colors.red;
    const blade = type==='knife';
    const sticker = type==='sticker'||type==='agent'||type==='patch'||type==='charm';
    let art;
    if(blade){
      art = `<path d="M95 145C135 65 230 32 350 45c-72 22-126 60-174 114 74-28 165-30 282-12-58 64-143 99-244 101-52 1-92-28-119-103z" fill="url(#g)"/><circle cx="92" cy="152" r="38" fill="none" stroke="#dbeafe" stroke-width="18"/><circle cx="92" cy="152" r="17" fill="#0b1020"/>`;
    } else if(sticker){
      art = `<rect x="190" y="70" width="220" height="170" rx="36" fill="url(#g)"/><path d="M225 110h150M225 150h118M225 190h150" stroke="#0b1020" stroke-width="16" stroke-linecap="round" opacity=".45"/><text x="300" y="268" text-anchor="middle" font-family="Arial" font-size="28" font-weight="900" fill="#f8fafc">${type.toUpperCase()}</text>`;
    } else {
      art = `<path d="M68 146h350l32-38h118c31 0 59 19 72 49l25 55h-92l-17-37h-96l-49 58h-90l52-58H171l-35 40H52l33-47H56c-39 0-39-22 12-22z" fill="url(#g)"/><path d="M135 108h194l38-47h88l-38 47h132c31 0 51 13 59 38H98c5-23 17-38 37-38z" fill="#e5e7eb" opacity=".23"/><path d="M185 171h100M420 140h128M520 184h70" stroke="#0b1020" stroke-width="13" stroke-linecap="round" opacity=".45"/>`;
    }
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 330"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="${c[0]}"/><stop offset=".52" stop-color="#8b5cf6"/><stop offset="1" stop-color="${c[1]}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000" flood-opacity=".5"/></filter></defs><rect width="720" height="330" rx="34" fill="#111827"/><circle cx="92" cy="75" r="115" fill="${c[0]}" opacity=".12"/><g filter="url(#s)" transform="translate(28 35)">${art}</g></svg>`);
  }
  function caseSvg(name, palette='orange'){
    const c = colors[palette] || colors.orange;
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#000" flood-opacity=".45"/></filter></defs><rect width="640" height="420" rx="38" fill="#111827"/><g filter="url(#s)"><rect x="105" y="145" width="430" height="190" rx="30" fill="#0c1220" stroke="#334155" stroke-width="12"/><path d="M210 145v-36c0-36 26-62 62-62h96c36 0 62 26 62 62v36" fill="none" stroke="#94a3b8" stroke-width="18" stroke-linecap="round"/><rect x="140" y="188" width="360" height="104" rx="20" fill="url(#g)"/><text x="320" y="255" text-anchor="middle" font-family="Arial" font-size="44" font-weight="900" fill="#0b1020">${esc(name).slice(0,9)}</text></g></svg>`);
  }
  const items = [
    it('ak-redline','AK-47 | Redline','Classified',2700,'red'), it('ak-vulcan','AK-47 | Vulcan','Covert',18500,'blue'), it('ak-empress','AK-47 | The Empress','Covert',6200,'pink'), it('ak-head','AK-47 | Head Shot','Covert',4200,'green'),
    it('m4-print','M4A1-S | Printstream','Covert',8800,'white'), it('m4-dec','M4A1-S | Decimator','Classified',1850,'pink'), it('m4-neo','M4A4 | Neo-Noir','Covert',3300,'pink'), it('m4-dragon','M4A4 | Dragon King','Classified',1200,'orange'),
    it('awp-asiimov','AWP | Asiimov','Covert',11800,'orange'), it('awp-hyper','AWP | Hyper Beast','Covert',6900,'green'), it('awp-duality','AWP | Duality','Classified',900,'gold'), it('awp-fever','AWP | Fever Dream','Restricted',620,'pink'),
    it('de-print','Desert Eagle | Printstream','Covert',4200,'white'), it('de-ocean','Desert Eagle | Ocean Drive','Covert',2400,'cyan'), it('usp-kill','USP-S | Kill Confirmed','Covert',3600,'red'), it('usp-cortex','USP-S | Cortex','Classified',820,'pink'),
    it('glock-water','Glock-18 | Water Elemental','Classified',920,'cyan'), it('glock-queen','Glock-18 | Bullet Queen','Covert',1700,'pink'), it('p250-asiimov','P250 | Asiimov','Classified',780,'orange'), it('tec-isaac','Tec-9 | Isaac','Mil-Spec Grade',190,'red'),
    it('mp9-food','MP9 | Food Chain','Classified',900,'green'), it('mac-neon','MAC-10 | Neon Rider','Covert',1800,'pink'), it('p90-death','P90 | Death Grip','Restricted',420,'white'), it('ssg-fever','SSG 08 | Fever Dream','Restricted',380,'pink'),
    it('butterfly-doppler','★ Butterfly Knife | Doppler','Rare Special Item',65000,'cyan','knife'), it('karambit-doppler','★ Karambit | Doppler','Rare Special Item',82000,'pink','knife'), it('karambit-gamma','★ Karambit | Gamma Doppler','Rare Special Item',98000,'green','knife'), it('m9-fade','★ M9 Bayonet | Fade','Rare Special Item',72000,'gold','knife'),
    it('sport-vice','★ Sport Gloves | Vice','Extraordinary',72000,'pink','sticker'), it('driver-snake','★ Driver Gloves | King Snake','Extraordinary',52000,'white','sticker'),
    it('sticker-navi','Sticker | NAVI | Copenhagen 2024','High Grade',180,'gold','sticker'), it('sticker-spirit','Sticker | Team Spirit | Shanghai 2024','Remarkable',520,'blue','sticker'), it('sticker-kato','Sticker | Titan | Katowice 2014','Extraordinary',95000,'cyan','sticker'),
    it('agent-ava','Special Agent Ava | FBI','Master Agent',4200,'blue','agent'), it('agent-darryl','Sir Bloody Miami Darryl','Master Agent',5600,'pink','agent'), it('charm-karat','Charm | Baby Karat T','Remarkable',760,'gold','charm'), it('patch-bravo','Patch | Bravo','Exotic',920,'orange','patch')
  ];
  function it(id,name,rarity,value,palette,type='rifle'){ return {id,name,rarity,value,rarityColor:rarityColor[rarity]||'#60a5fa',weight:weights[rarity]||10,image:weaponSvg(name,palette,type),type}; }
  const cases = [
    cs('kilowatt','Kilowatt Case',840,'orange',items.slice(0,24).concat(items.slice(24,30)),.35), cs('revolution','Revolution Case',501,'gold',items.slice(1,23).concat(items.slice(24,29)),.28), cs('recoil','Recoil Case',690,'blue',items.slice(2,22).concat(items.slice(24,30)),.32), cs('dreams','Dreams & Nightmares Case',760,'pink',items.slice(4,24).concat(items.slice(24,30)),.36),
    cs('cheap','Budget Blue Case',180,'blue',items.filter(x=>['Mil-Spec Grade','Restricted'].includes(x.rarity)).concat(items.slice(30,34)),.24), cs('red','Red Covert Case',3900,'red',items.filter(x=>['Covert','Rare Special Item'].includes(x.rarity)),.22), cs('knife','Knife Case',24500,'gold',items.filter(x=>x.type==='knife'),.18), cs('gloves','Gloves Case',21000,'pink',items.filter(x=>x.name.includes('Gloves')), .2),
    cs('stickers','Tournament Stickers',350,'cyan',items.filter(x=>x.type==='sticker'),.42), cs('agents','Agents & Charms',950,'green',items.filter(x=>['agent','charm','patch'].includes(x.type)),.38)
  ];
  function cs(id,name,price,palette,pool,profit){ return {id,name,price,image:caseSvg(name,palette),items:pool.length?pool:items,profit}; }
  function defaultState(){return {balance:15000,inventory:[],opened:0,earned:0,spent:0,sold:0,upgrades:0,contracts:0,battles:0,wins:0,lastWheel:0,adViews:{},usedPromos:[],tx:[]};}
  function load(){ try{ const raw=localStorage.getItem(SAVE_KEY); if(raw){ const s={...defaultState(),...JSON.parse(raw)}; if(!Number.isFinite(+s.balance)||s.balance<1)s.balance=15000; if(!Array.isArray(s.inventory))s.inventory=[]; return s; } }catch(e){} return defaultState(); }
  let state=load();
  function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} renderGlobals(); }
  function tx(text, amount){ state.tx.unshift({text,amount,at:now()}); state.tx=state.tx.slice(0,40); }
  function addMoney(amount, reason){ state.balance+=Math.round(amount); state.earned+=Math.max(0,amount); tx(reason||'Начисление',amount); save(); }
  function spend(amount, reason){ amount=Math.round(amount); if(state.balance<amount){ toast('Недостаточно ₽LC: нужно '+fmt(amount),'bad'); return false;} state.balance-=amount; state.spent+=amount; tx(reason||'Списание',-amount); save(); return true; }
  function invItem(base){ const w=wearMult[Math.floor(rnd()*wearMult.length)]; const copy={...base,uid:uid(),wear:w[0],value:Math.max(1,Math.round(base.value*w[1]*(.88+rnd()*.24))),addedAt:now()}; return copy; }
  function renderGlobals(){ $$('.js-balance').forEach(x=>x.textContent=fmt(state.balance)); $$('.js-inv-count').forEach(x=>x.textContent=state.inventory.length); $$('.bottom-nav a').forEach(a=>a.classList.toggle('active', a.dataset.tab===currentPage())); }
  function currentPage(){ return (location.hash||'#home').replace('#','')||'home'; }
  function pageTitle(h,p){ return `<div class="page-title"><h1>${h}</h1>${p?`<p>${p}</p>`:''}</div>`; }
  function statCards(){ return `<div class="stats"><div class="stat"><small>Баланс</small><b>${fmt(state.balance)}</b></div><div class="stat"><small>Инвентарь</small><b>${state.inventory.length}</b></div><div class="stat"><small>Открыто</small><b>${state.opened}</b></div><div class="stat"><small>Заработано</small><b>${fmt(state.earned)}</b></div></div>`; }
  function route(){ const p=currentPage(); renderGlobals(); const app=$('#app'); if(!app)return; if(p==='cases')return renderCases(app); if(p==='inventory')return renderInventory(app); if(p==='upgrade')return renderUpgrade(app); if(p==='contracts')return renderContracts(app); if(p==='wheel')return renderWheel(app); if(p==='battle')return renderBattle(app); if(p==='ads')return renderAds(app); if(p==='promo')return renderPromo(app); if(p==='profile')return renderProfile(app); if(p==='install')return renderInstall(app); if(p==='more')return renderMore(app); renderHome(app); }
  function renderHome(app){ app.innerHTML=pageTitle('Главная','Открывай кейсы, продавай предметы, используй апгрейд и промокоды.')+`<section class="card hero-card"><span class="kicker">mobile build</span><h1>CS2 Case Lab</h1><p>Стабильная версия с нуля для iPhone и Android.</p><div class="hero-actions"><a class="btn primary" href="#cases">Открыть кейсы</a><a class="btn blue" href="#promo">Промокоды</a><a class="btn" href="#ads">Получить ₽LC</a></div><div class="hero-show"><div class="hero-skin"><img src="${items[0].image}" alt=""><b>AK-47 | Redline</b><span>Classified</span></div><div class="hero-skin"><img src="${items[9].image}" alt=""><b>AWP | Hyper Beast</b><span>Covert</span></div><div class="hero-skin"><img src="${items[25].image}" alt=""><b>★ Karambit | Doppler</b><span>Rare Special Item</span></div></div></section><section class="section"><div class="section-head"><h2>Статистика</h2></div>${statCards()}</section><section class="section"><div class="section-head"><h2>Популярные кейсы</h2><a class="btn small" href="#cases">Все</a></div><div class="grid">${cases.slice(0,3).map(caseCard).join('')}</div></section>`; }
  function caseCard(c){ return `<article class="case-card"><div class="case-img-wrap"><img src="${c.image}" alt="${esc(c.name)}"></div><h3>${esc(c.name)}</h3><div class="case-meta"><span>${c.items.length} предметов</span><b class="price">${fmt(c.price)}</b></div><div class="chips">${[...new Set(c.items.map(i=>i.rarity))].slice(0,4).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><div class="case-actions"><button class="btn primary" type="button" data-action="open-case" data-case="${c.id}">Крутить</button><button class="btn" type="button" data-action="case-pool" data-case="${c.id}">Пул</button></div></article>`; }
  function itemCard(it, opts={}){ return `<article class="item-card ${opts.selected?'selected':''}" style="--rar:${it.rarityColor}" data-uid="${esc(it.uid||'')}"><div class="item-art"><img src="${it.image}" alt="${esc(it.name)}"></div><h4>${esc(it.name)}</h4><small>${esc(it.rarity)}${it.wear?' · '+esc(it.wear):''}</small><div class="item-value"><b>${fmt(it.value)}</b>${opts.badge?`<span class="chip">${opts.badge}</span>`:''}</div>${opts.actions?`<div class="item-actions">${opts.actions}</div>`:''}</article>`; }
  function renderCases(app){ app.innerHTML=pageTitle('Кейсы','Кнопка «Крутить» списывает баланс и открывает кейс.')+`<div class="grid">${cases.map(caseCard).join('')}</div>`; }
  function weighted(c){ const total=c.items.reduce((s,i)=>s+(i.weight||10)*odds(i,c),0); let r=rnd()*total; for(const i of c.items){ r-=(i.weight||10)*odds(i,c); if(r<=0)return i;} return c.items[0]; }
  function odds(i,c){ const ratio=i.value/c.price; let m=1; if(ratio>1)m*=c.profit; if(ratio>2)m*=.42; if(ratio<.6)m*=1.25; return m*(.88+rnd()*.24); }
  function openCase(id,count=1){ const c=cases.find(x=>x.id===id); if(!c)return; const cost=c.price*count; if(!spend(cost,`Открытие ${c.name} x${count}`))return; const drops=[]; for(let k=0;k<count;k++){ const d=invItem(weighted(c)); state.inventory.unshift(d); drops.push(d); } state.opened+=count; save(); showDrops(c,drops); }
  function showDrops(c,drops){ openModal(`Дроп: ${c.name}`, `<div class="results-grid">${drops.map(d=>`<div class="result-mini" style="--rar:${d.rarityColor}"><img src="${d.image}" alt=""><b>${esc(d.name)}</b><small>${fmt(d.value)}</small></div>`).join('')}</div><div class="drop-actions"><button class="btn green" data-action="sell-drops" data-uids="${drops.map(d=>d.uid).join(',')}">Продать всё</button><button class="btn primary" data-action="open-case" data-case="${c.id}">Ещё 1</button></div><div class="multi-grid"><button class="btn small" data-action="open-case-x" data-case="${c.id}" data-count="3">x3</button><button class="btn small" data-action="open-case-x" data-case="${c.id}" data-count="5">x5</button><button class="btn small" data-action="open-case-x" data-case="${c.id}" data-count="10">x10</button></div>`); }
  function renderInventory(app){ const value=state.inventory.reduce((s,i)=>s+i.value,0); app.innerHTML=pageTitle('Инвентарь','Продажа, выбор для апгрейда и контрактов.')+`<div class="stats"><div class="stat"><small>Предметов</small><b>${state.inventory.length}</b></div><div class="stat"><small>Сумма</small><b>${fmt(value)}</b></div></div><div class="section row"><button class="btn green" data-action="sell-all">Продать всё</button><button class="btn" data-action="sort-inv">Сортировать</button></div><div class="grid two">${state.inventory.length?state.inventory.map(i=>itemCard(i,{actions:`<button data-action="sell-item" data-uid="${i.uid}">Продать</button><button data-action="to-upgrade" data-uid="${i.uid}">Апгрейд</button>`})).join(''):'<div class="empty">Инвентарь пуст</div>'}</div>`; }
  function sellUids(uids){ let sum=0; state.inventory=state.inventory.filter(i=>{ if(uids.includes(i.uid)){sum+=i.value; return false;} return true; }); if(sum){ state.sold+=sum; addMoney(sum,'Продажа предметов'); toast('Продано на '+fmt(sum),'good'); } route(); }
  function renderUpgrade(app){ const src=state.inventory[0]; const targets=items.filter(i=>!src||i.value>src.value).sort((a,b)=>a.value-b.value).slice(0,12); app.innerHTML=pageTitle('Апгрейд','Выбери предмет и цель. При проигрыше предмет исчезает.')+`${src?`<div class="notice">Твой предмет: <b>${esc(src.name)}</b> · ${fmt(src.value)}</div>`:'<div class="empty">Сначала открой кейс и получи предмет.</div>'}<div class="grid two">${targets.map(t=>itemCard(t,{actions:`<button data-action="upgrade" data-target="${t.id}">Цель</button>`})).join('')}</div>`; }
  function upgrade(targetId){ const src=state.inventory[0]; if(!src)return toast('Нет предмета для апгрейда','bad'); const target=items.find(i=>i.id===targetId); if(!target)return; const chance=clamp((src.value/target.value)*0.82,0.03,0.82); state.inventory=state.inventory.filter(i=>i.uid!==src.uid); state.upgrades++; if(rnd()<chance){ const won=invItem(target); state.inventory.unshift(won); toast('Апгрейд успешен: '+won.name,'good'); } else toast('Апгрейд проигран','bad'); save(); route(); }
  function renderContracts(app){ app.innerHTML=pageTitle('Контракты','Контракт берёт 3–10 самых дешёвых предметов и выдаёт новый.')+`${state.inventory.length>=3?`<button class="btn primary" data-action="contract">Собрать контракт</button>`:'<div class="empty">Нужно минимум 3 предмета.</div>'}<div class="grid two section">${state.inventory.slice().sort((a,b)=>a.value-b.value).slice(0,10).map(i=>itemCard(i)).join('')}</div>`; }
  function contract(){ const selected=state.inventory.slice().sort((a,b)=>a.value-b.value).slice(0,Math.min(10,Math.max(3,state.inventory.length))); const val=selected.reduce((s,i)=>s+i.value,0); const pool=items.filter(i=>i.value>=val*.45 && i.value<=val*1.8); const target=invItem(pool.length?pool[Math.floor(rnd()*pool.length)]:items[Math.floor(rnd()*items.length)]); state.inventory=state.inventory.filter(i=>!selected.some(x=>x.uid===i.uid)); state.inventory.unshift(target); state.contracts++; save(); openModal('Контракт', `<img class="drop-img" src="${target.image}"><h3 class="drop-title">${esc(target.name)}</h3><p>${fmt(target.value)}</p><button class="btn primary" data-close-modal>Ок</button>`); }
  function renderWheel(app){ const left=Math.max(0,WHEEL_COOLDOWN-(now()-state.lastWheel)); app.innerHTML=pageTitle('Колесо бонусов','Одна прокрутка раз в 2 часа.')+`<div class="pointer"></div><div class="big-wheel" id="wheel"><span>LAB</span></div>${left?`<div class="notice">До следующей прокрутки: <b>${Math.ceil(left/60000)} мин.</b></div>`:`<button class="btn primary" data-action="spin-wheel">Крутить колесо</button>`}`; }
  function spinWheel(){ const left=Math.max(0,WHEEL_COOLDOWN-(now()-state.lastWheel)); if(left)return toast('Колесо ещё на кулдауне','warn'); const rewards=[250,500,750,1000,1500,2000,3000,items[Math.floor(rnd()*items.length)]]; const reward=rewards[Math.floor(rnd()*rewards.length)]; const wheel=$('#wheel'); if(wheel) wheel.style.transform=`rotate(${720+rnd()*720}deg)`; state.lastWheel=now(); setTimeout(()=>{ if(typeof reward==='number'){addMoney(reward,'Колесо бонусов'); toast('Колесо: '+fmt(reward),'good');} else {state.inventory.unshift(invItem(reward)); save(); toast('Колесо: предмет','good');} route();},900); }
  function renderBattle(app){ app.innerHTML=pageTitle('Battle','Открой кейс против бота. Победитель забирает оба предмета.')+`<div class="grid">${cases.slice(0,5).map(c=>`<div class="panel" style="padding:16px"><h3>${esc(c.name)}</h3><p class="price">${fmt(c.price)}</p><button class="btn primary" data-action="battle" data-case="${c.id}">Начать</button></div>`).join('')}</div>`; }
  function battle(id){ const c=cases.find(x=>x.id===id); if(!spend(c.price,'Battle '+c.name))return; const me=invItem(weighted(c)), bot=invItem(weighted(c)); state.battles++; let body=`<div class="results-grid"><div class="result-mini" style="--rar:${me.rarityColor}"><img src="${me.image}"><b>Ты: ${esc(me.name)}</b><small>${fmt(me.value)}</small></div><div class="result-mini" style="--rar:${bot.rarityColor}"><img src="${bot.image}"><b>Бот: ${esc(bot.name)}</b><small>${fmt(bot.value)}</small></div></div>`; if(me.value>=bot.value){ state.inventory.unshift(me,bot); state.wins++; body+=`<div class="notice">Победа! Оба предмета в инвентаре.</div>`; } else body+=`<div class="notice">Поражение. Предметы забрал бот.</div>`; save(); openModal('Case Battle', body+`<button class="btn primary" data-close-modal>Ок</button>`); }
  function renderAds(app){ const day=new Date().toISOString().slice(0,10); const used=state.adViews[day]||0; app.innerHTML=pageTitle('Реклама','10 секунд просмотра = 750 ₽LC.')+`<div class="notice">Сегодня: <b>${used}/${AD_LIMIT}</b></div><button class="btn primary" data-action="watch-ad" ${used>=AD_LIMIT?'disabled':''}>Смотреть рекламу</button>`; }
  function watchAd(){ const day=new Date().toISOString().slice(0,10); const used=state.adViews[day]||0; if(used>=AD_LIMIT)return toast('Лимит рекламы на сегодня','warn'); let sec=10; openModal('Реклама проекта', `<div class="notice"><b>Портфолио · YouTube · GitHub</b><br>Окно закроется через <span id="adSec">${sec}</span> сек.</div><button class="btn" disabled>Подожди таймер</button>`, false); const t=setInterval(()=>{sec--; const el=$('#adSec'); if(el)el.textContent=sec; if(sec<=0){clearInterval(t); state.adViews[day]=used+1; closeModal(); addMoney(AD_REWARD,'Реклама'); route();}},1000); }
  function renderPromo(app){ app.innerHTML=pageTitle('Промокоды','Каждый код активируется один раз.')+`<div class="controls"><input class="field" id="promoInput" placeholder="Введите промокод"><button class="btn primary" data-action="promo">Активировать</button></div><div class="notice section">Рабочие: WELCOMEMOBILE, IOSFIX, FASTCASE, MOBILEKING, TEST100K</div>`; }
  function promo(){ const code=($('#promoInput')?.value||'').trim().toUpperCase(); if(!PROMOS[code])return toast('Код не найден','bad'); if(state.usedPromos.includes(code))return toast('Код уже активирован','warn'); state.usedPromos.push(code); addMoney(PROMOS[code], 'Промокод '+code); toast('Начислено '+fmt(PROMOS[code]),'good'); route(); }
  function renderProfile(app){ app.innerHTML=pageTitle('Профиль','Сохранение хранится на устройстве.')+statCards()+`<section class="section controls"><button class="btn blue" data-action="export">Экспорт save</button><textarea class="field" id="saveBox" rows="5" placeholder="save"></textarea><button class="btn" data-action="import">Импорт save</button><button class="btn red" data-action="reset">Сбросить прогресс</button></section>`; }
  function renderInstall(app){ app.innerHTML=pageTitle('Установка','iPhone: Safari → Поделиться → На экран Домой.')+`<div class="notice">Эта мобильная сборка публикуется отдельно от desktop-версии.</div>`; }
  function renderMore(app){ app.innerHTML=pageTitle('Ещё','Дополнительные разделы.')+`<div class="grid"><a class="btn" href="#contracts">Контракты</a><a class="btn" href="#wheel">Колесо</a><a class="btn" href="#battle">Battle</a><a class="btn" href="#promo">Промо</a><a class="btn" href="#ads">Реклама</a><a class="btn" href="#profile">Профиль</a><a class="btn" href="#install">Установка</a></div>`; }
  function sortInv(){ state.inventory.sort((a,b)=>b.value-a.value); save(); route(); }
  function openModal(title,body,closable=true){ $('#modalTitle').textContent=title; $('#modalBody').innerHTML=body; const m=$('#modal'); m.hidden=false; m.dataset.closable=closable?'1':'0'; wireButtons(); }
  function closeModal(){ const m=$('#modal'); if(m)m.hidden=true; }
  function toast(msg,type=''){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.className='toast '+type; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true,2300); }
  function act(action,el){
    if(action==='open-case')return openCase(el.dataset.case,1);
    if(action==='open-case-x')return openCase(el.dataset.case,parseInt(el.dataset.count||'1',10));
    if(action==='case-pool'){ const c=cases.find(x=>x.id===el.dataset.case); if(c) openModal(c.name, `<div class="grid two">${c.items.map(i=>itemCard(i)).join('')}</div>`); return; }
    if(action==='sell-drops')return sellUids((el.dataset.uids||'').split(',').filter(Boolean));
    if(action==='sell-item')return sellUids([el.dataset.uid]);
    if(action==='sell-all')return sellUids(state.inventory.map(i=>i.uid));
    if(action==='sort-inv')return sortInv();
    if(action==='to-upgrade'){ const idx=state.inventory.findIndex(i=>i.uid===el.dataset.uid); if(idx>0){ const [x]=state.inventory.splice(idx,1); state.inventory.unshift(x); save(); } location.hash='upgrade'; return; }
    if(action==='upgrade')return upgrade(el.dataset.target);
    if(action==='contract')return contract();
    if(action==='spin-wheel')return spinWheel();
    if(action==='battle')return battle(el.dataset.case);
    if(action==='watch-ad')return watchAd();
    if(action==='promo')return promo();
    if(action==='export'){ const box=$('#saveBox'); if(box)box.value=btoa(unescape(encodeURIComponent(JSON.stringify(state)))); return toast('Save экспортирован','good'); }
    if(action==='import'){ try{ const box=$('#saveBox'); const s=JSON.parse(decodeURIComponent(escape(atob(box.value.trim())))); state={...defaultState(),...s}; save(); route(); toast('Save импортирован','good'); }catch(e){toast('Не удалось импортировать','bad')} return; }
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
      lastTouch=Date.now();
      e.preventDefault(); e.stopPropagation();
    } else if(Date.now()-lastTouch<520) return;
    if(target.matches('[data-close-modal]')){ const m=$('#modal'); if(!m || m.dataset.closable!=='0') closeModal(); return; }
    if(target.matches('a[href^="#"]')){ const h=target.getAttribute('href'); if(location.hash!==h) location.hash=h; else route(); return; }
    const a=target.dataset.action; if(a) act(a,target);
  }
  function wireButtons(){ $$('[data-action], [data-close-modal], a[href^="#"]').forEach(el=>{ el.style.pointerEvents='auto'; el.style.touchAction='manipulation'; }); }
  ['touchstart','touchmove','touchend','pointerup','click'].forEach(ev=>document.addEventListener(ev, handleTap, {capture:true, passive:ev==='touchstart'||ev==='touchmove'}));
  window.addEventListener('hashchange', route);
  window.addEventListener('pageshow', ()=>{ route(); wireButtons(); });
  document.addEventListener('DOMContentLoaded', ()=>{ if(!location.hash) location.hash='home'; route(); wireButtons(); setInterval(wireButtons,1000); });
})();

import { useState, useEffect, useRef, useCallback } from "react";

const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0";

const SUPABASE_URL = "https://czlahqkmbjimlcfcdbtx.supabase.co";
const SUPABASE_KEY = "sb_publishable_w3i1WTsi18V9LJUM-4ynXQ_EKTIdcGR";


// ─── SOUND SYSTEM ─────────────────────────────────────────────────────────────

let audioCtx = null;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
    // Play a silent buffer to fully unlock
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
    audioUnlocked = true;
  } catch(e) { console.log("Audio unlock error:", e); }
}

function playSound(type, vol=0.7) {
  try {
    if (!audioCtx || !audioUnlocked) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    if (type === "click") {
      // Short crisp tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
      gain.gain.setValueAtTime(vol * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);

    } else if (type === "buy") {
      // Ascending two-tone chime
      [0, 0.08].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(i === 0 ? 523 : 784, now + delay);
        gain.gain.setValueAtTime(vol * 0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
        osc.start(now + delay); osc.stop(now + delay + 0.18);
      });

    } else if (type === "achievement") {
      // Triumphant ascending arpeggio
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(vol * 0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.25);
      });

    } else if (type === "dividend") {
      // Soft coins sound
      [0, 0.05, 0.1].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200 + i * 200, now + delay);
        osc.frequency.exponentialRampToValueAtTime(600, now + delay + 0.15);
        gain.gain.setValueAtTime(vol * 0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        osc.start(now + delay); osc.stop(now + delay + 0.15);
      });

    } else if (type === "prestige") {
      // Epic fanfare
      const notes = [523, 659, 784, 659, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(vol * 0.18, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
        osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 0.3);
      });

    } else if (type === "upgrade") {
      // Power-up whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(vol * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);

    } else if (type === "news") {
      // Notification ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
      gain.gain.setValueAtTime(vol * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);

    } else if (type === "mission") {
      // Mission complete fanfare
      [659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(vol * 0.14, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.22);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.22);
      });

    } else if (type === "sell") {
      // Descending tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(vol * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);

    } else if (type === "manager") {
      // Hire sound - professional tone
      [440, 550, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(vol * 0.1, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.15);
        osc.start(now + i * 0.07); osc.stop(now + i * 0.07 + 0.15);
      });
    }
  } catch(e) {
    // Silently fail if audio not available
  }
}

// ─── MUSIC SYSTEM ─────────────────────────────────────────────────────────────
let musicGainNode = null;
let musicActive   = false;
let musicTimer    = null;
let musicBeat     = 0;
let musicNextTime = 0;

const M_BPM      = 74;
const M_BEAT     = 60 / M_BPM;
const M_AHEAD    = 0.18;
const M_INTERVAL = 80;

// 4-chord loop: Cmaj7 → Am7 → Fmaj7 → G7  (each chord = 2 beats)
const M_CHORDS = [
  { bass:65.41,  pad:[130.81, 164.81, 196.00, 246.94] },
  { bass:55.00,  pad:[110.00, 130.81, 164.81, 196.00] },
  { bass:43.65,  pad:[87.31,  110.00, 130.81, 164.81] },
  { bass:49.00,  pad:[98.00,  123.47, 146.83, 174.61] },
];
const M_MEL = [
  [523.25, 659.25, 783.99, 987.77],
  [440.00, 523.25, 659.25, 783.99],
  [349.23, 440.00, 523.25, 659.25],
  [392.00, 493.88, 587.33, 698.46],
];

function _mNote(freq, type, vol, t0, dur) {
  try {
    if (!audioCtx || !musicGainNode) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(musicGainNode);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.06, dur * 0.1));
    gain.gain.setValueAtTime(vol, t0 + dur - 0.08);
    gain.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch(e) {}
}

function _schedBeat(beat, t) {
  const chord = M_CHORDS[Math.floor(beat / 2) % 4];
  const mel   = M_MEL[Math.floor(beat / 2) % 4];
  if (beat % 2 === 0) {
    _mNote(chord.bass,     "sine",     0.28, t,        M_BEAT * 1.7);
    _mNote(chord.bass * 2, "triangle", 0.06, t + 0.01, M_BEAT * 1.5);
    chord.pad.forEach((f, i) => {
      _mNote(f * (1 + (i-1)*0.0025), "sine",     0.07, t + 0.02, M_BEAT * 3.6);
      _mNote(f * 2 * (1+i*0.002),   "triangle", 0.03, t + 0.04, M_BEAT * 3.4);
    });
  }
  const mb = beat % 8;
  if ([0, 3, 4, 6].includes(mb) && Math.random() > 0.25) {
    const freq = mel[Math.floor(Math.random() * mel.length)];
    _mNote(freq, "sine", 0.055, t + M_BEAT * 0.08, M_BEAT * 0.65);
  }
  if (mb === 1 && Math.random() > 0.5) {
    _mNote(mel[0] * 0.75, "sine", 0.035, t + M_BEAT * 0.5, M_BEAT * 0.4);
  }
  if (Math.random() > 0.5) {
    try {
      const buf  = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * 0.04), audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * (1 - i/data.length) * 0.6;
      const src = audioCtx.createBufferSource();
      const hpf = audioCtx.createBiquadFilter();
      const hg  = audioCtx.createGain();
      hpf.type = "highpass"; hpf.frequency.value = 7000;
      src.buffer = buf;
      src.connect(hpf); hpf.connect(hg); hg.connect(musicGainNode);
      hg.gain.setValueAtTime(0.012, t);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      src.start(t); src.stop(t + 0.05);
    } catch(e) {}
  }
}

function startMusic(vol) {
  if (!audioCtx || !audioUnlocked || musicActive) return;
  musicActive   = true;
  if (audioCtx.state === "suspended") audioCtx.resume();
  musicGainNode = audioCtx.createGain();
  musicGainNode.gain.setValueAtTime(vol ?? 0.28, audioCtx.currentTime);
  musicGainNode.connect(audioCtx.destination);
  musicBeat     = 0;
  musicNextTime = audioCtx.currentTime + 0.12;
  function tick() {
    if (!musicActive) return;
    if (audioCtx.state === "suspended") {
      audioCtx.resume().then(() => {
        if (!musicActive) return;
        if (musicNextTime < audioCtx.currentTime) musicNextTime = audioCtx.currentTime + 0.12;
        musicTimer = setTimeout(tick, M_INTERVAL);
      });
      return;
    }
    if (musicNextTime < audioCtx.currentTime) musicNextTime = audioCtx.currentTime + 0.12;
    while (musicNextTime < audioCtx.currentTime + M_AHEAD) {
      _schedBeat(musicBeat, musicNextTime);
      musicNextTime += M_BEAT;
      musicBeat = (musicBeat + 1) % 16;
    }
    musicTimer = setTimeout(tick, M_INTERVAL);
  }
  tick();
}

function stopMusic() {
  musicActive = false;
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
  if (musicGainNode && audioCtx) {
    try {
      musicGainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
      setTimeout(() => { try { musicGainNode.disconnect(); } catch(e){} musicGainNode = null; }, 700);
    } catch(e) { musicGainNode = null; }
  }
}

function setMusicVol(vol) {
  if (musicGainNode && audioCtx) {
    musicGainNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.1);
  }
}


// ─── CARD COMPONENT ─────────────────────────────────────────────────────────
// Defined OUTSIDE App to avoid re-mount flicker on every re-render
function CardEl({card, hidden}) {
  if (hidden) {
    return (
      <div style={{ width:44, height:64, background:"linear-gradient(135deg,#1a1a3e,#0e0e28)",
        border:"2px solid #4a4a8a", borderRadius:6, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:22, color:"#4a4a8a", fontWeight:700,
        flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,.6)" }}>
        🂠
      </div>
    );
  }
  const suit = card.slice(-1);
  const value = card.slice(0, -1);
  const isRed = suit === "♥" || suit === "♦";
  return (
    <div style={{ width:44, height:64, background:"linear-gradient(135deg,#f5f0e0,#e8e0c8)",
      border:"1px solid #bbb", borderRadius:6, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", color: isRed ? "#c03030" : "#111",
      fontWeight:800, flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,.5)", userSelect:"none" }}>
      <div style={{fontSize:13, lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:18, lineHeight:1}}>{suit}</div>
    </div>
  );
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const T = {
  en: {
    title:"EL GRAN CAPITALISTA", total:"TOTAL EARNED", portfolio:"PORTFOLIO",
    click:"CLICK", incomePerSec:"Income/s", perClick:"Per click",
    dividends:"Dividends", businesses:"Businesses", shares:"Shares",
    prestige:"Prestige", prestigeReset:"PRESTIGE RESET", prestigeSub:"Resets everything · +1 prestige",
    tabBusinesses:"Businesses", tabUpgrades:"Upgrades", tabManagers:"Managers",
    tabStocks:"Stock Market", tabCrypto:"Crypto", tabPortfolio:"Portfolio", tabCasino:"Casino", tabAchievements:"Achievements",
    catFactory:"🏭 Industry", catTech:"💻 Technology", catFinance:"🏦 Finance",
    upgAvailable:"AVAILABLE UPGRADES", bought:"PURCHASED",
    market:"Market", myShares:"My Shares",
    price:"PRICE", change:"CHANGE", owned:"OWNED",
    buyBtn:"BUY", sellBtn:"SELL", sellAll:"SELL ALL", maxBtn:"MAX",
    acquired:"★ ACQUIRED", acquiredFull:"★ COMPANY ACQUIRED",
    divEvery:"every 5 min", divEstimate:"Est. div/5min",
    portfolioTitle:"YOUR EMPIRE SUMMARY", acquiredCompanies:"★ COMPANIES ACQUIRED 100%",
    noBusinesses:"You have nothing yet. Start investing!", noShares:"No shares. Go to the market to invest.",
    achievementsTitle:"ACHIEVEMENTS", achievementsUnlocked:"unlocked",
    saveIndicator:"Saved", totalShares:"shares",
    startTitle:"EL GRAN CAPITALISTA", startSub:"Build your global empire from scratch",
    startName:"Your CEO name", startRegion:"Your region (permanent, cannot be changed)",
    startLang:"Language", startBtn:"START EMPIRE",
    startNamePlaceholder:"e.g. John Smith", regionWarning:"⚠️ The region cannot be changed once the game starts.",
    every5min:"every 5 min", companyValue:"Portfolio value",
    tabManagers:"Managers", managerHire:"HIRE", managerUpgrade:"UPGRADE",
    managerTitle:"MANAGERS", managerSub:"Hire managers to automate your businesses",
    managerLvl:"Lv", managerBonus:"bonus", managerAutomates:"Automates",
    managerNoBiz:"You need at least 1 of this business to hire a manager.",
    managerHired:"Manager hired!", managerUpgraded:"Manager upgraded!",
    managerMaxLevel:"MAX LEVEL", managerCost:"Cost",
    optTitle:"OPTIONS", optSound:"Sound", optVolume:"Volume", optUiScale:"UI Scale", optFps:"Show FPS", optLang:"Language", optFullscreen:"Fullscreen (F11)", optReset:"Reset Save", optResetConfirm:"Are you sure? This cannot be undone.", optClose:"CLOSE", optSaveExit:"💾  Save & Exit", optFeedback:"🐛  Bug / Suggestions", feedbackType:"TYPE", feedbackSuggestion:"Suggestion", feedbackDesc:"DESCRIPTION", feedbackPlaceholder:"Describe the bug or suggestion...", feedbackEmail:"EMAIL (OPTIONAL)", feedbackSend:"Send", feedbackThanks:"Thanks! We will take a look.", feedbackErr:"Error sending. Please try again.", optMusic:"Music", optMusicVol:"Music Volume", optSaved:"Settings saved",
    sectorAll:"All", sectorIndustry:"Industry", sectorTechnology:"Technology", sectorFinance:"Finance", sectorRealEstate:"Real Estate", sectorConsumer:"Consumer", sectorEnergy:"Energy",
    chartTitle:"Wealth History", chartSub:"Last hour of play", chartNoData:"Play for 30 seconds to see your first data point.", chartTime:"Time", chartWealth:"Net Worth", chartAll:"All",
    prestigeReady:"✅ Ready to prestige", prestigeNeed:"Need:", prestigeNext:"Next:", prestigeGlobalIncome:"global income", prestigeStocksKept:"Stocks kept", prestigeCostBiz:"-20% biz cost", prestigeCostMgr:"-50% mgr cost", prestigeUnlock:"Reach", prestigeUnlockSuffix:"to unlock",
    tabMissions:"Missions", missionProgress:"Progress", missionDaily:"Daily", missionChains:"Chains", missionClaim:"CLAIM", missionCompleted:"COMPLETED", missionReward:"Reward", missionActive:"ACTIVE", missionExpires:"expires in",
    newsTitle:"MARKET NEWS",
    prestigeInfo:"Prestige Info", prestigeReq:"Required", prestigeRewards:"Permanent Rewards", prestigeKeeps:"You keep", prestigeResets:"Resets", prestigeStocks:"Stock portfolio", prestigeAchs:"All achievements", prestigeTitle:"Title", catRealEstate:"🏢 Real Estate",
    tutSkip:"Skip tutorial", tutNext:"Next →", tutFinish:"Let's go! 🚀",
    tut1t:"Welcome to El Gran Capitalista!", tut1b:"Build your business empire from scratch and become the wealthiest CEO on the planet.",
    tut2t:"Click to earn money", tut2b:"Click the big button to earn your first dollars. The more you click, the faster you grow!",
    tut3t:"Buy businesses", tut3b:"Open the Businesses tab and invest in your first company. Each business generates passive income every second.",
    tut4t:"Hire managers", tut4b:"Managers automate your businesses (no clicking needed) and multiply their income up to ×30. Go to the Managers tab.",
    tut5t:"Buy upgrades", tut5b:"The Upgrades tab has permanent multipliers that massively boost your click value and passive income.",
    tut6t:"Invest in stocks", tut6b:"Open the Market tab to buy shares, earn dividends every 5 minutes, and even acquire whole companies.",
    tut7t:"Complete missions", tut7b:"The Missions tab has Progress, Daily and Chain missions. Complete them for powerful temporary bonuses!",
    tut8t:"Prestige to multiply everything", tut8b:"When you earn enough, Prestige resets progress but gives a permanent income multiplier. The more you prestige, the more powerful you become!",
    offlineTitle:"Welcome back!", offlineSub:"While you were away", offlineCollect:"Collect",
    menuContinue:"Continue", menuNew:"New Game", menuNewConfirm:"This will delete your current save. Are you sure?", menuExit:"Exit Game", menuBack:"Menu",
    bjDeal:"DEAL",bjHit:"HIT",bjStand:"STAND",bjPlayAgain:"PLAY AGAIN",bjDealer:"DEALER",bjPlayer:"YOU",bjDesc:"Beat the dealer without going over 21. Blackjack pays ×2.5",bjBlackjack:"🎉 BLACKJACK!",bjWin:"✓ WIN",bjPush:"PUSH",bjBust:"✗ BUST",casinoDaily:"Daily limit",casinoRemaining:"remaining",roulSpin:"SPIN",roulSpinning:"Spinning...",roulHistory:"Last numbers",roulBetsActive:"Active bets",roulNoBets:"No bets placed",roulAddBet:"ADD BET",roulClearBets:"CLEAR",roulColorBet:"COLOR",roulParityBet:"EVEN / ODD",roulHalfBet:"HALF",roulDozenBet:"DOZEN",roulColBet:"COLUMN",roulNumBet:"NUMBER",roulRed:"RED",roulBlack:"BLACK",roulGreen:"GREEN (0)",roulEven:"EVEN",roulOdd:"ODD",roulLow:"LOW 1-18",roulHigh:"HIGH 19-36",roulD1:"1st 12",roulD2:"2nd 12",roulD3:"3rd 12",roulC1:"COL 1",roulC2:"COL 2",roulC3:"COL 3",saveInfoTitle:"Auto-Save",saveInfoOk:"Got it! Let's play 🚀",saveInfoBody:"Your game saves every 5 min and when you exit via Options → Save & Quit.",
    toAcquire:"To acquire", rankTitle:"Hall of Fame", rankScore:"Score", rankDate:"Date", rankNoData:"Play more to fill your Hall of Fame!", rankYourBest:"Your Best Runs", holding:"Holding:", valueLabel:"Value:", offlineLabel:"OFFLINE EARNINGS",
  },
  es: {
    title:"EL GRAN CAPITALISTA", total:"TOTAL GANADO", portfolio:"CARTERA",
    click:"CLICK", incomePerSec:"Ingresos/s", perClick:"Por click",
    dividends:"Dividendos", businesses:"Negocios", shares:"Acciones",
    prestige:"Prestigio", prestigeReset:"REINICIO DE PRESTIGIO", prestigeSub:"Reinicia todo · +1 Prestigio",
    tabBusinesses:"Negocios", tabUpgrades:"Mejoras", tabManagers:"Managers",
    tabStocks:"Bolsa", tabCrypto:"Cripto", tabPortfolio:"Portfolio", tabCasino:"Casino", tabAchievements:"Logros",
    catFactory:"🏭 Industria", catTech:"💻 Tecnología", catFinance:"🏦 Finanzas",
    upgAvailable:"MEJORAS DISPONIBLES", bought:"COMPRADO",
    market:"Mercado", myShares:"Mis Acciones",
    price:"PRECIO", change:"CAMBIO", owned:"TENGO",
    buyBtn:"COMPRAR", sellBtn:"VENDER", sellAll:"VENDER TODO", maxBtn:"MAX",
    acquired:"★ ADQUIRIDA", acquiredFull:"★ EMPRESA ADQUIRIDA",
    divEvery:"cada 5 min", divEstimate:"Div. est./5min",
    portfolioTitle:"RESUMEN DE TU IMPERIO", acquiredCompanies:"★ EMPRESAS ADQUIRIDAS AL 100%",
    noBusinesses:"Aún no tienes nada. ¡Empieza a invertir!", noShares:"No tienes acciones. Ve al mercado a invertir.",
    achievementsTitle:"LOGROS", achievementsUnlocked:"desbloqueados",
    saveIndicator:"Guardado", totalShares:"acciones",
    startTitle:"EL GRAN CAPITALISTA", startSub:"Construye tu imperio global desde cero",
    startName:"Nombre de tu CEO", startRegion:"Tu región (permanente, no se puede cambiar)",
    startLang:"Idioma", startBtn:"EMPEZAR IMPERIO",
    startNamePlaceholder:"Ej: Juan García", regionWarning:"⚠️ La región no se puede cambiar una vez iniciado el juego.",
    every5min:"cada 5 min", companyValue:"Valor cartera",
    managerHire:"CONTRATAR", managerUpgrade:"MEJORAR",
    managerTitle:"MANAGERS", managerSub:"Contrata managers para automatizar tus negocios",
    managerLvl:"Nv", managerBonus:"bonus", managerAutomates:"Automatiza",
    managerNoBiz:"Necesitas al menos 1 de este negocio para contratar un manager.",
    managerHired:"¡Manager contratado!", managerUpgraded:"¡Manager mejorado!",
    managerMaxLevel:"NIVEL MÁX", managerCost:"Coste",
    optTitle:"OPCIONES", optSound:"Sonido", optVolume:"Volumen", optUiScale:"Escala UI", optFps:"Mostrar FPS", optLang:"Idioma", optFullscreen:"Pantalla completa (F11)", optReset:"Borrar Partida", optResetConfirm:"¿Seguro? Esto no se puede deshacer.", optClose:"CERRAR", optSaveExit:"💾  Guardar y salir", optFeedback:"🐛  Bug / Sugerencias", feedbackType:"TIPO", feedbackSuggestion:"Sugerencia", feedbackDesc:"DESCRIPCIÓN", feedbackPlaceholder:"Describe el bug o sugerencia...", feedbackEmail:"EMAIL (OPCIONAL)", feedbackSend:"Enviar", feedbackThanks:"¡Gracias! Lo revisaremos.", feedbackErr:"Error al enviar. Inténtalo de nuevo.", optMusic:"Música", optMusicVol:"Volumen música", optSaved:"Configuración guardada",
    sectorAll:"Todos", sectorIndustry:"Industria", sectorTechnology:"Tecnología", sectorFinance:"Finanzas", sectorRealEstate:"Inmobiliario", sectorConsumer:"Consumo", sectorEnergy:"Energía",
    chartTitle:"Historial de Riqueza", chartSub:"Última hora de juego", chartNoData:"Juega 30 segundos para ver tu primer punto.", chartTime:"Tiempo", chartWealth:"Patrimonio", chartAll:"Todo",
    prestigeReady:"✅ Listo para prestige", prestigeNeed:"Necesitas:", prestigeNext:"Próximo:", prestigeGlobalIncome:"ingresos globales", prestigeStocksKept:"Stocks se conservan", prestigeCostBiz:"-20% coste negocios", prestigeCostMgr:"-50% coste managers", prestigeUnlock:"Alcanza", prestigeUnlockSuffix:"para desbloquear",
    tabMissions:"Misiones", missionProgress:"Progreso", missionDaily:"Diarias", missionChains:"Cadenas", missionClaim:"RECLAMAR", missionCompleted:"COMPLETADA", missionReward:"Recompensa", missionActive:"ACTIVO", missionExpires:"expira en",
    newsTitle:"NOTICIAS DE MERCADO",
    prestigeInfo:"Info Prestige", prestigeReq:"Necesario", prestigeRewards:"Recompensas Permanentes", prestigeKeeps:"Conservas", prestigeResets:"Se reinicia", prestigeStocks:"Cartera acciones", prestigeAchs:"Todos los logros", prestigeTitle:"Título", catRealEstate:"🏢 Inmobiliario",
    tutSkip:"Saltar tutorial", tutNext:"Siguiente →", tutFinish:"¡Vamos! 🚀",
    tut1t:"¡Bienvenido a El Gran Capitalista!", tut1b:"Construye tu imperio empresarial desde cero y conviértete en el CEO más rico del planeta.",
    tut2t:"Haz click para ganar dinero", tut2b:"Pulsa el botón grande para ganar tus primeros dólares. ¡Cuanto más hagas click, más rápido creces!",
    tut3t:"Compra negocios", tut3b:"Abre la pestaña Negocios e invierte en tu primera empresa. Cada negocio genera ingresos pasivos cada segundo.",
    tut4t:"Contrata managers", tut4b:"Los managers automatizan tus negocios (sin necesidad de hacer click) y multiplican sus ingresos hasta ×30. Ve a la pestaña Managers.",
    tut5t:"Compra mejoras", tut5b:"La pestaña Mejoras tiene multiplicadores permanentes que disparan tu valor de click e ingresos pasivos.",
    tut6t:"Invierte en bolsa y cripto", tut6b:"Abre la pestaña Mercado para comprar acciones, cobrar dividendos cada 5 minutos y adquirir empresas enteras.",
    tut7t:"Completa misiones", tut7b:"La pestaña Misiones tiene misiones de Progreso, Diarias y Cadenas. ¡Compléblas para obtener poderosos bonos temporales!",
    tut8t:"Prestigia para multiplicar todo", tut8b:"Cuando acumules suficiente dinero, el Prestige reinicia tu progreso pero te da un multiplicador permanente. ¡Cuanto más prestigies, más poderoso te vuelves!",
    offlineTitle:"¡Bienvenido de vuelta!", offlineSub:"Mientras estabas fuera", offlineCollect:"Cobrar",
    menuContinue:"Continuar", menuNew:"Nueva partida", menuNewConfirm:"Esto borrará tu partida actual. ¿Estás seguro?", menuExit:"Salir del juego", menuBack:"Menú",
    bjDeal:"REPARTIR",bjHit:"PEDIR",bjStand:"PLANTARSE",bjPlayAgain:"OTRA PARTIDA",bjDealer:"BANCA",bjPlayer:"TÚ",bjDesc:"Gana a la banca sin pasarte de 21. Blackjack paga ×2.5",bjBlackjack:"🎉 ¡BLACKJACK!",bjWin:"✓ GANASTE",bjPush:"EMPATE",bjBust:"✗ TE PASASTE",casinoDaily:"Límite diario",casinoRemaining:"restante",roulSpin:"GIRAR",roulSpinning:"Girando...",roulHistory:"Últimos números",roulBetsActive:"Apuestas activas",roulNoBets:"Sin apuestas",roulAddBet:"AÑADIR",roulClearBets:"LIMPIAR",roulColorBet:"COLOR",roulParityBet:"PAR / IMPAR",roulHalfBet:"MITAD",roulDozenBet:"DOCENA",roulColBet:"COLUMNA",roulNumBet:"NÚMERO",roulRed:"ROJO",roulBlack:"NEGRO",roulGreen:"VERDE (0)",roulEven:"PAR",roulOdd:"IMPAR",roulLow:"BAJAS 1-18",roulHigh:"ALTAS 19-36",roulD1:"1ª Doc.",roulD2:"2ª Doc.",roulD3:"3ª Doc.",roulC1:"COL 1",roulC2:"COL 2",roulC3:"COL 3",saveInfoTitle:"Guardado Automático",saveInfoOk:"¡Entendido! A jugar 🚀",saveInfoBody:"El juego se guarda cada 5 minutos y cuando sales por Opciones → Guardar y salir.",
    toAcquire:"Faltan", rankTitle:"Hall of Fame", rankScore:"Puntuación", rankDate:"Fecha", rankNoData:"¡Sigue jugando para llenar tu Hall of Fame!", rankYourBest:"Tus Mejores Partidas", holding:"Posees:", valueLabel:"Valor:", offlineLabel:"INGRESOS OFFLINE",
  },
  fr: {
    title:"EL GRAN CAPITALISTA", total:"TOTAL GAGNÉ", portfolio:"PORTEFEUILLE",
    click:"CLIQUER", incomePerSec:"Revenus/s", perClick:"Par clic",
    dividends:"Dividendes", businesses:"Entreprises", shares:"Actions",
    prestige:"Prestige", prestigeReset:"RÉINITIALISATION", prestigeSub:"Réinitialise tout · +1 prestige",
    tabBusinesses:"Entreprises", tabUpgrades:"Améliorations", tabManagers:"Managers",
    tabStocks:"Bourse", tabCrypto:"Crypto", tabPortfolio:"Portefeuille", tabCasino:"Casino", tabAchievements:"Succès",
    catFactory:"🏭 Industrie", catTech:"💻 Technologie", catFinance:"🏦 Finance",
    upgAvailable:"AMÉLIORATIONS DISPONIBLES", bought:"ACHETÉ",
    market:"Marché", myShares:"Mes Actions",
    price:"PRIX", change:"VARIATION", owned:"POSSÉDÉ",
    buyBtn:"ACHETER", sellBtn:"VENDRE", sellAll:"TOUT VENDRE", maxBtn:"MAX",
    acquired:"★ ACQUISE", acquiredFull:"★ ENTREPRISE ACQUISE",
    divEvery:"toutes les 5 min", divEstimate:"Div. est./5min",
    portfolioTitle:"RÉSUMÉ DE VOTRE EMPIRE", acquiredCompanies:"★ ENTREPRISES ACQUISES À 100%",
    noBusinesses:"Vous n'avez rien encore. Commencez à investir!", noShares:"Pas d'actions. Allez au marché pour investir.",
    achievementsTitle:"SUCCÈS", achievementsUnlocked:"débloqués",
    saveIndicator:"Sauvegardé", totalShares:"actions",
    startTitle:"EL GRAN CAPITALISTA", startSub:"Construisez votre empire mondial de zéro",
    startName:"Nom de votre PDG", startRegion:"Votre région (permanente, non modifiable)",
    startLang:"Langue", startBtn:"DÉMARRER L'EMPIRE",
    startNamePlaceholder:"Ex: Jean Dupont", regionWarning:"⚠️ La région ne peut pas être modifiée après le démarrage.",
    every5min:"toutes les 5 min", companyValue:"Valeur portefeuille",
    managerHire:"EMBAUCHER", managerUpgrade:"AMÉLIORER",
    managerTitle:"MANAGERS", managerSub:"Embauchez des managers pour automatiser vos entreprises",
    managerLvl:"Nv", managerBonus:"bonus", managerAutomates:"Automatise",
    managerNoBiz:"Vous avez besoin d'au moins 1 de cette entreprise pour embaucher un manager.",
    managerHired:"Manager embauché!", managerUpgraded:"Manager amélioré!",
    managerMaxLevel:"NIVEAU MAX", managerCost:"Coût",
    optTitle:"OPTIONS", optSound:"Son", optVolume:"Volume", optUiScale:"Échelle UI", optFps:"Afficher FPS", optLang:"Langue", optFullscreen:"Plein écran (F11)", optReset:"Réinitialiser", optResetConfirm:"Êtes-vous sûr? Cela ne peut pas être annulé.", optClose:"FERMER", optSaveExit:"💾  Sauvegarder et quitter", optFeedback:"🐛  Bug / Suggestions", feedbackType:"TYPE", feedbackSuggestion:"Suggestion", feedbackDesc:"DESCRIPTION", feedbackPlaceholder:"Décrivez le bug ou la suggestion...", feedbackEmail:"EMAIL (OPTIONNEL)", feedbackSend:"Envoyer", feedbackThanks:"Merci! Nous allons vérifier.", feedbackErr:"Erreur d'envoi. Réessayez.", optMusic:"Musique", optMusicVol:"Volume musique", optSaved:"Paramètres sauvegardés",
    sectorAll:"Tous", sectorIndustry:"Industrie", sectorTechnology:"Technologie", sectorFinance:"Finance", sectorRealEstate:"Immobilier", sectorConsumer:"Consommation", sectorEnergy:"Énergie",
    chartTitle:"Historique de Richesse", chartSub:"Dernière heure de jeu", chartNoData:"Jouez 30 secondes pour voir votre premier point.", chartTime:"Temps", chartWealth:"Patrimoine", chartAll:"Tout",
    prestigeReady:"✅ Prêt pour le prestige", prestigeNeed:"Requis:", prestigeNext:"Prochain:", prestigeGlobalIncome:"revenus globaux", prestigeStocksKept:"Actions conservées", prestigeCostBiz:"-20% coût entreprises", prestigeCostMgr:"-50% coût managers", prestigeUnlock:"Atteignez", prestigeUnlockSuffix:"pour débloquer",
    tabMissions:"Missions", missionProgress:"Progression", missionDaily:"Quotidiennes", missionChains:"Chaînes", missionClaim:"RÉCLAMER", missionCompleted:"TERMINÉE", missionReward:"Récompense", missionActive:"ACTIF", missionExpires:"expire dans",
    newsTitle:"ACTUALITÉS MARCHÉ",
    prestigeInfo:"Info Prestige", prestigeReq:"Requis", prestigeRewards:"Récompenses Permanentes", prestigeKeeps:"Vous conservez", prestigeResets:"Réinitialise", prestigeStocks:"Portefeuille", prestigeAchs:"Tous les succès", prestigeTitle:"Titre", catRealEstate:"🏢 Immobilier",
    tutSkip:"Passer le tutoriel", tutNext:"Suivant →", tutFinish:"C'est parti ! 🚀",
    tut1t:"Bienvenue dans El Gran Capitalista !", tut1b:"Construisez votre empire depuis zéro et devenez le PDG le plus riche de la planète.",
    tut2t:"Cliquez pour gagner de l'argent", tut2b:"Appuyez sur le grand bouton pour gagner vos premiers dollars. Plus vous cliquez, plus vite vous grandissez !",
    tut3t:"Achetez des entreprises", tut3b:"Ouvrez l'onglet Entreprises et investissez dans votre première société. Chaque entreprise génère des revenus passifs.",
    tut4t:"Embauchez des managers", tut4b:"Les managers automatisent vos entreprises (sans cliquer) et multiplient leurs revenus jusqu'à ×30. Allez dans l'onglet Managers.",
    tut5t:"Achetez des améliorations", tut5b:"L'onglet Améliorations offre des multiplicateurs permanents qui boostent massivement vos revenus.",
    tut6t:"Investissez en bourse", tut6b:"Ouvrez l'onglet Marché pour acheter des actions, percevoir des dividendes toutes les 5 minutes et acquérir des sociétés.",
    tut7t:"Complétez des missions", tut7b:"L'onglet Missions propose des missions de Progression, Quotidiennes et Enchaînées. Complétez-les pour des bonus temporaires puissants !",
    tut8t:"Le Prestige multiplie tout", tut8b:"Quand vous avez assez d'argent, le Prestige remet à zéro mais vous donne un multiplicateur permanent. Plus vous prestigiez, plus vous devenez puissant !",
    offlineTitle:"Bienvenue de retour!", offlineSub:"Pendant votre absence", offlineCollect:"Collecter",
    menuContinue:"Continuer", menuNew:"Nouvelle partie", menuNewConfirm:"Cela supprimera votre sauvegarde. Êtes-vous sûr?", menuExit:"Quitter", menuBack:"Menu",
    bjDeal:"DISTRIBUER",bjHit:"TIRER",bjStand:"RESTER",bjPlayAgain:"REJOUER",bjDealer:"CROUPIER",bjPlayer:"VOUS",bjDesc:"Battez le croupier sans dépasser 21. Blackjack paie ×2.5",bjBlackjack:"🎉 BLACKJACK!",bjWin:"✓ GAGNÉ",bjPush:"ÉGALITÉ",bjBust:"✗ PERDU",casinoDaily:"Limite quotidienne",casinoRemaining:"restant",roulSpin:"TOURNER",roulSpinning:"En cours...",roulHistory:"Derniers numéros",roulBetsActive:"Paris actifs",roulNoBets:"Aucun pari",roulAddBet:"MISER",roulClearBets:"EFFACER",roulColorBet:"COULEUR",roulParityBet:"PAIR / IMPAIR",roulHalfBet:"MOITIÉ",roulDozenBet:"DOUZAINE",roulColBet:"COLONNE",roulNumBet:"NUMÉRO",roulRed:"ROUGE",roulBlack:"NOIR",roulGreen:"VERT (0)",roulEven:"PAIR",roulOdd:"IMPAIR",roulLow:"BAS 1-18",roulHigh:"HAUT 19-36",roulD1:"1ère Doz.",roulD2:"2ème Doz.",roulD3:"3ème Doz.",roulC1:"COL 1",roulC2:"COL 2",roulC3:"COL 3",saveInfoTitle:"Sauvegarde auto",saveInfoOk:"Compris ! Jouons 🚀",saveInfoBody:"Jeu sauvegardé toutes les 5 min et en quittant via Options → Sauvegarder.",
    toAcquire:"Restants", rankTitle:"Hall of Fame", rankScore:"Score", rankDate:"Date", rankNoData:"Jouez encore pour remplir votre Hall of Fame !", rankYourBest:"Vos Meilleures Parties", holding:"En portefeuille:", valueLabel:"Valeur:", offlineLabel:"GAINS HORS LIGNE",
  },
  de: {
    title:"EL GRAN CAPITALISTA", total:"GESAMT VERDIENT", portfolio:"PORTFOLIO",
    click:"KLICKEN", incomePerSec:"Einnahmen/s", perClick:"Pro Klick",
    dividends:"Dividenden", businesses:"Unternehmen", shares:"Aktien",
    prestige:"Prestige", prestigeReset:"PRESTIGE RESET", prestigeSub:"Alles zurücksetzen · +1 Prestige",
    tabBusinesses:"Unternehmen", tabUpgrades:"Verbesserungen", tabManagers:"Manager",
    tabStocks:"Börse", tabCrypto:"Krypto", tabPortfolio:"Portfolio", tabCasino:"Casino", tabAchievements:"Errungenschaften",
    catFactory:"🏭 Industrie", catTech:"💻 Technologie", catFinance:"🏦 Finanzen",
    upgAvailable:"VERFÜGBARE VERBESSERUNGEN", bought:"GEKAUFT",
    market:"Markt", myShares:"Meine Aktien",
    price:"PREIS", change:"ÄNDERUNG", owned:"BESITZE",
    buyBtn:"KAUFEN", sellBtn:"VERKAUFEN", sellAll:"ALLES VERKAUFEN", maxBtn:"MAX",
    acquired:"★ ERWORBEN", acquiredFull:"★ UNTERNEHMEN ERWORBEN",
    divEvery:"alle 5 Min", divEstimate:"Div. est./5min",
    portfolioTitle:"IHR EMPIRE ÜBERBLICK", acquiredCompanies:"★ 100% ERWORBENE UNTERNEHMEN",
    noBusinesses:"Noch nichts. Fangen Sie an zu investieren!", noShares:"Keine Aktien. Gehen Sie zum Markt.",
    achievementsTitle:"ERRUNGENSCHAFTEN", achievementsUnlocked:"freigeschaltet",
    saveIndicator:"Gespeichert", totalShares:"Aktien",
    startTitle:"EL GRAN CAPITALISTA", startSub:"Bauen Sie Ihr globales Imperium von Grund auf",
    startName:"Ihr CEO-Name", startRegion:"Ihre Region (dauerhaft, nicht änderbar)",
    startLang:"Sprache", startBtn:"IMPERIUM STARTEN",
    startNamePlaceholder:"z.B. Hans Müller", regionWarning:"⚠️ Die Region kann nach dem Start nicht mehr geändert werden.",
    every5min:"alle 5 Min", companyValue:"Portfoliowert",
    managerHire:"EINSTELLEN", managerUpgrade:"VERBESSERN",
    managerTitle:"MANAGER", managerSub:"Stellen Sie Manager ein, um Ihre Unternehmen zu automatisieren",
    managerLvl:"Lv", managerBonus:"Bonus", managerAutomates:"Automatisiert",
    managerNoBiz:"Sie benötigen mindestens 1 dieses Unternehmens, um einen Manager einzustellen.",
    managerHired:"Manager eingestellt!", managerUpgraded:"Manager verbessert!",
    managerMaxLevel:"MAX LEVEL", managerCost:"Kosten",
    optTitle:"OPTIONEN", optSound:"Ton", optVolume:"Lautstärke", optUiScale:"UI-Skalierung", optFps:"FPS anzeigen", optLang:"Sprache", optFullscreen:"Vollbild (F11)", optReset:"Spielstand löschen", optResetConfirm:"Sicher? Dies kann nicht rückgängig gemacht werden.", optClose:"SCHLIESSEN", optSaveExit:"💾  Speichern & Beenden", optFeedback:"🐛  Bug / Vorschläge", feedbackType:"TYP", feedbackSuggestion:"Vorschlag", feedbackDesc:"BESCHREIBUNG", feedbackPlaceholder:"Beschreibe den Bug oder Vorschlag...", feedbackEmail:"E-MAIL (OPTIONAL)", feedbackSend:"Senden", feedbackThanks:"Danke! Wir schauen uns das an.", feedbackErr:"Fehler beim Senden. Bitte erneut versuchen.", optMusic:"Musik", optMusicVol:"Musik-Lautstärke", optSaved:"Einstellungen gespeichert",
    sectorAll:"Alle", sectorIndustry:"Industrie", sectorTechnology:"Technologie", sectorFinance:"Finanzen", sectorRealEstate:"Immobilien", sectorConsumer:"Konsum", sectorEnergy:"Energie",
    chartTitle:"Vermögensverlauf", chartSub:"Letzte Spielstunde", chartNoData:"Spiele 30 Sekunden für den ersten Datenpunkt.", chartTime:"Zeit", chartWealth:"Vermögen", chartAll:"Alles",
    prestigeReady:"✅ Bereit für Prestige", prestigeNeed:"Benötigt:", prestigeNext:"Nächste:", prestigeGlobalIncome:"globales Einkommen", prestigeStocksKept:"Aktien behalten", prestigeCostBiz:"-20% Unternehmenskosten", prestigeCostMgr:"-50% Managerkosten", prestigeUnlock:"Erreiche", prestigeUnlockSuffix:"zum Entsperren",
    tabMissions:"Missionen", missionProgress:"Fortschritt", missionDaily:"Täglich", missionChains:"Ketten", missionClaim:"EINLÖSEN", missionCompleted:"ABGESCHLOSSEN", missionReward:"Belohnung", missionActive:"AKTIV", missionExpires:"läuft ab in",
    newsTitle:"MARKTNACHRICHTEN",
    prestigeInfo:"Prestige Info", prestigeReq:"Benötigt", prestigeRewards:"Permanente Belohnungen", prestigeKeeps:"Du behältst", prestigeResets:"Setzt zurück", prestigeStocks:"Aktienportfolio", prestigeAchs:"Alle Errungenschaften", prestigeTitle:"Titel", catRealEstate:"🏢 Immobilien",
    tutSkip:"Tutorial überspringen", tutNext:"Weiter →", tutFinish:"Los geht's! 🚀",
    tut1t:"Willkommen bei El Gran Capitalista!", tut1b:"Baue dein Geschäftsimperium von Grund auf und werde der reichste CEO des Planeten.",
    tut2t:"Klicken zum Geld verdienen", tut2b:"Drücke den großen Knopf, um deine ersten Dollar zu verdienen. Je mehr du klickst, desto schneller wächst du!",
    tut3t:"Unternehmen kaufen", tut3b:"Öffne den Reiter Unternehmen und investiere in deine erste Firma. Jedes Unternehmen generiert passives Einkommen.",
    tut4t:"Manager einstellen", tut4b:"Manager automatisieren deine Unternehmen (kein Klicken nötig) und multiplizieren ihre Einnahmen bis zu ×30. Gehe zum Manager-Reiter.",
    tut5t:"Upgrades kaufen", tut5b:"Der Reiter Upgrades hat permanente Multiplikatoren, die dein Klickeinkommen und passives Einkommen enorm steigern.",
    tut6t:"In Aktien investieren", tut6b:"Öffne den Markt-Reiter, um Aktien zu kaufen, alle 5 Minuten Dividenden zu kassieren und Firmen zu übernehmen.",
    tut7t:"Missionen erfüllen", tut7b:"Im Missions-Reiter gibt es Fortschritts-, Tages- und Kettenmissionen. Erfülle sie für mächtige temporäre Boni!",
    tut8t:"Prestige multipliziert alles", tut8b:"Wenn du genug verdient hast, setzt Prestige deinen Fortschritt zurück, gibt dir aber einen permanenten Multiplikator. Je mehr Prestige, desto mächtiger!",
    offlineTitle:"Willkommen zurück!", offlineSub:"Während du weg warst", offlineCollect:"Einsammeln",
    menuContinue:"Weiterspielen", menuNew:"Neues Spiel", menuNewConfirm:"Dein Spielstand wird gelöscht. Sicher?", menuExit:"Spiel beenden", menuBack:"Menü",
    bjDeal:"GEBEN",bjHit:"ZIEHEN",bjStand:"HALTEN",bjPlayAgain:"NOCHMAL",bjDealer:"DEALER",bjPlayer:"DU",bjDesc:"Schlage den Dealer, ohne 21 zu überschreiten. Blackjack zahlt ×2.5",bjBlackjack:"🎉 BLACKJACK!",bjWin:"✓ GEWONNEN",bjPush:"UNENTSCHIEDEN",bjBust:"✗ VERLOREN",casinoDaily:"Tageslimit",casinoRemaining:"übrig",roulSpin:"DREHEN",roulSpinning:"Dreht...",roulHistory:"Letzte Zahlen",roulBetsActive:"Aktive Einsätze",roulNoBets:"Keine Einsätze",roulAddBet:"SETZEN",roulClearBets:"LÖSCHEN",roulColorBet:"FARBE",roulParityBet:"GERADE / UNGERADE",roulHalfBet:"HÄLFTE",roulDozenBet:"DUTZEND",roulColBet:"KOLONNE",roulNumBet:"ZAHL",roulRed:"ROT",roulBlack:"SCHWARZ",roulGreen:"GRÜN (0)",roulEven:"GERADE",roulOdd:"UNGERADE",roulLow:"NIEDRIG 1-18",roulHigh:"HOCH 19-36",roulD1:"1. Dutz.",roulD2:"2. Dutz.",roulD3:"3. Dutz.",roulC1:"KOL 1",roulC2:"KOL 2",roulC3:"KOL 3",saveInfoTitle:"Auto-Speichern",saveInfoOk:"Verstanden! Spielen 🚀",saveInfoBody:"Spiel speichert alle 5 Min und beim Beenden via Optionen → Speichern.",
    toAcquire:"Fehlen", rankTitle:"Hall of Fame", rankScore:"Punkte", rankDate:"Datum", rankNoData:"Spiel mehr, um deine Hall of Fame zu füllen!", rankYourBest:"Deine Besten Spiele", holding:"Gehalten:", valueLabel:"Wert:", offlineLabel:"OFFLINE-EINNAHMEN",
  },
  zh: {
    title:"El Gran Capitalista", total:"总收益", portfolio:"投资组合",
    click:"点击", incomePerSec:"收入/秒", perClick:"每次点击",
    dividends:"股息", businesses:"企业", shares:"股份",
    prestige:"声望", prestigeReset:"声望重置", prestigeSub:"重置一切 · +1声望",
    tabBusinesses:"企业", tabUpgrades:"升级", tabManagers:"管理者",
    tabStocks:"股市", tabCrypto:"加密货币", tabPortfolio:"投资组合", tabCasino:"赌场", tabAchievements:"成就",
    catFactory:"🏭 工业", catTech:"💻 科技", catFinance:"🏦 金融",
    upgAvailable:"可用升级", bought:"已购买",
    market:"市场", myShares:"我的股份",
    price:"价格", change:"涨跌", owned:"持有",
    buyBtn:"购买", sellBtn:"出售", sellAll:"全部出售", maxBtn:"最大",
    acquired:"★ 已收购", acquiredFull:"★ 企业已全部收购",
    divEvery:"每5分钟", divEstimate:"预计股息/5分钟",
    portfolioTitle:"您的帝国总览", acquiredCompanies:"★ 100%收购的企业",
    noBusinesses:"还没有任何资产，开始投资吧！", noShares:"没有股份，去市场投资吧。",
    achievementsTitle:"成就", achievementsUnlocked:"已解锁",
    saveIndicator:"已保存", totalShares:"股份",
    startTitle:"El Gran Capitalista", startSub:"从零开始建立您的全球帝国",
    startName:"您的CEO名称", startRegion:"您的地区（永久，不可更改）",
    startLang:"语言", startBtn:"开始帝国",
    startNamePlaceholder:"例如：李明", regionWarning:"⚠️ 游戏开始后地区无法更改。",
    every5min:"每5分钟", companyValue:"投资组合价值",
    managerHire:"雇用", managerUpgrade:"升级",
    managerTitle:"管理者", managerSub:"雇用管理者自动化您的企业",
    managerLvl:"等", managerBonus:"奖励", managerAutomates:"自动化",
    managerNoBiz:"您需要至少拥有1个该企业才能雇用管理者。",
    managerHired:"管理者已雇用！", managerUpgraded:"管理者已升级！",
    managerMaxLevel:"最高等级", managerCost:"费用",
    optTitle:"选项", optSound:"音效", optVolume:"音量", optUiScale:"界面缩放", optFps:"显示FPS", optLang:"语言", optFullscreen:"全屏 (F11)", optReset:"重置存档", optResetConfirm:"确定吗？此操作无法撤销。", optClose:"关闭", optSaveExit:"💾  保存并退出", optFeedback:"🐛  Bug/建议", feedbackType:"类型", feedbackSuggestion:"建议", feedbackDesc:"描述", feedbackPlaceholder:"描述bug或建议...", feedbackEmail:"邮箱（可选）", feedbackSend:"发送", feedbackThanks:"谢谢！我们会查看的。", feedbackErr:"发送失败，请重试。", optMusic:"音乐", optMusicVol:"音乐音量", optSaved:"设置已保存",
    sectorAll:"全部", sectorIndustry:"工业", sectorTechnology:"科技", sectorFinance:"金融", sectorRealEstate:"房地产", sectorConsumer:"消费", sectorEnergy:"能源",
    chartTitle:"财富历史", chartSub:"最近一小时", chartNoData:"游戏30秒后查看第一个数据点。", chartTime:"时间", chartWealth:"净资产", chartAll:"全部",
    prestigeInfo:"声望信息", prestigeReq:"所需", prestigeRewards:"永久奖励", prestigeKeeps:"保留", prestigeResets:"重置", prestigeStocks:"股票组合", prestigeAchs:"所有成就", prestigeTitle:"称号", catRealEstate:"🏢 房地产",
    tabMissions:"任务", missionProgress:"进度", missionDaily:"每日", missionChains:"链式", missionClaim:"领取", missionCompleted:"已完成", missionReward:"奖励", missionActive:"进行中", missionExpires:"到期",
    newsTitle:"市场新闻",
    prestigeReady:"✅ 可以声望重置", prestigeNeed:"需要:", prestigeNext:"下一个:", prestigeGlobalIncome:"全球收入", prestigeStocksKept:"保留股票", prestigeCostBiz:"-20%企业成本", prestigeCostMgr:"-50%管理者成本", prestigeUnlock:"达到", prestigeUnlockSuffix:"以解锁",
    tutSkip:"跳过教程", tutNext:"下一步 →", tutFinish:"出发！🚀",
    tut1t:"欢迎来到El Gran Capitalista！", tut1b:"从零开始建立你的商业帝国，成为地球上最富有的CEO。",
    tut2t:"点击赚钱", tut2b:"按下大按钮赚取你的第一笔钱。点击越多，成长越快！",
    tut3t:"购买企业", tut3b:"打开企业标签页，投资你的第一家公司。每家企业每秒产生被动收入。",
    tut4t:"雇用管理者", tut4b:"管理者自动化你的企业（无需点击），并将收入提升至×30。前往管理者标签页。",
    tut5t:"购买升级", tut5b:"升级标签提供永久倍增器，大幅提升你的点击价值和被动收入。",
    tut6t:"投资股市和加密货币", tut6b:"打开市场标签购买股票，每5分钟获得股息，并收购整个公司。",
    tut7t:"完成任务", tut7b:"任务标签有进度任务、每日任务和连锁任务。完成它们可获得强力的临时加成！",
    tut8t:"声望让一切倍增", tut8b:"积累足够资金后，声望重置进度但给予永久收入倍增器。声望次数越多，实力越强！",
    offlineTitle:"欢迎回来！", offlineSub:"你不在的时候", offlineCollect:"领取",
    menuContinue:"继续游戏", menuNew:"新游戏", menuNewConfirm:"这将删除你的存档，确定吗？", menuExit:"退出游戏", menuBack:"菜单",
    bjDeal:"发牌",bjHit:"要牌",bjStand:"停牌",bjPlayAgain:"再玩一局",bjDealer:"庄家",bjPlayer:"你",bjDesc:"打败庄家，不超过21点。Blackjack赔率×2.5",bjBlackjack:"🎉 二十一点!",bjWin:"✓ 赢了",bjPush:"平局",bjBust:"✗ 爆牌",casinoDaily:"每日限额",casinoRemaining:"剩余",roulSpin:"旋转",roulSpinning:"旋转中...",roulHistory:"最近号码",roulBetsActive:"当前下注",roulNoBets:"未下注",roulAddBet:"下注",roulClearBets:"清除",roulColorBet:"颜色",roulParityBet:"单/双",roulHalfBet:"大/小",roulDozenBet:"打数",roulColBet:"列",roulNumBet:"号码",roulRed:"红色",roulBlack:"黑色",roulGreen:"绿色 (0)",roulEven:"双",roulOdd:"单",roulLow:"小 1-18",roulHigh:"大 19-36",roulD1:"第一打",roulD2:"第二打",roulD3:"第三打",roulC1:"第1列",roulC2:"第2列",roulC3:"第3列",saveInfoTitle:"自动保存",saveInfoOk:"明白了！开始游戏 🚀",saveInfoBody:"游戏每5分钟自动保存，退出时也会保存。",
    toAcquire:"剩余", rankTitle:"名人堂", rankScore:"分数", rankDate:"日期", rankNoData:"继续游戏填满你的名人堂！", rankYourBest:"你的最佳成绩", holding:"持有:", valueLabel:"价值:", offlineLabel:"离线收益",
  },
  ja: {
    title:"El Gran Capitalista", total:"総収益", portfolio:"ポートフォリオ",
    click:"クリック", incomePerSec:"収入/秒", perClick:"クリックごと",
    dividends:"配当金", businesses:"企業", shares:"株式",
    prestige:"プレステージ", prestigeReset:"プレステージリセット", prestigeSub:"すべてリセット · +1プレステージ",
    tabBusinesses:"企業", tabUpgrades:"アップグレード", tabManagers:"マネージャー",
    tabStocks:"株式市場", tabCrypto:"暗号資産", tabPortfolio:"ポートフォリオ", tabCasino:"カジノ", tabAchievements:"実績",
    catFactory:"🏭 産業", catTech:"💻 テクノロジー", catFinance:"🏦 金融",
    upgAvailable:"利用可能なアップグレード", bought:"購入済み",
    market:"市場", myShares:"保有株式",
    price:"価格", change:"変動", owned:"保有",
    buyBtn:"購入", sellBtn:"売却", sellAll:"全て売却", maxBtn:"最大",
    acquired:"★ 買収済み", acquiredFull:"★ 企業を完全買収",
    divEvery:"5分ごと", divEstimate:"配当見込み/5分",
    portfolioTitle:"帝国の概要", acquiredCompanies:"★ 100%買収した企業",
    noBusinesses:"まだ何もありません。投資を始めましょう！", noShares:"株式なし。市場で投資しましょう。",
    achievementsTitle:"実績", achievementsUnlocked:"解除済み",
    saveIndicator:"保存済み", totalShares:"株",
    startTitle:"El Gran Capitalista", startSub:"ゼロからグローバル帝国を築く",
    startName:"CEOの名前", startRegion:"地域（永久、変更不可）",
    startLang:"言語", startBtn:"帝国を開始",
    startNamePlaceholder:"例：田中太郎", regionWarning:"⚠️ ゲーム開始後、地域は変更できません。",
    every5min:"5分ごと", companyValue:"ポートフォリオ価値",
    managerHire:"雇用", managerUpgrade:"昇格",
    managerTitle:"マネージャー", managerSub:"マネージャーを雇用してビジネスを自動化",
    managerLvl:"Lv", managerBonus:"ボーナス", managerAutomates:"自動化",
    managerNoBiz:"マネージャーを雇用するには、このビジネスが1つ以上必要です。",
    managerHired:"マネージャーを雇用しました！", managerUpgraded:"マネージャーを昇格しました！",
    managerMaxLevel:"最大レベル", managerCost:"費用",
    optTitle:"オプション", optSound:"サウンド", optVolume:"音量", optUiScale:"UIスケール", optFps:"FPS表示", optLang:"言語", optFullscreen:"フルスクリーン (F11)", optReset:"セーブデータ削除", optResetConfirm:"本当ですか？この操作は取り消せません。", optClose:"閉じる", optSaveExit:"💾  保存して終了", optFeedback:"🐛  バグ/提案", feedbackType:"タイプ", feedbackSuggestion:"提案", feedbackDesc:"説明", feedbackPlaceholder:"バグや提案を説明してください...", feedbackEmail:"メール（任意）", feedbackSend:"送信", feedbackThanks:"ありがとう！確認します。", feedbackErr:"送信エラー。もう一度お試しください。", optMusic:"音楽", optMusicVol:"音楽音量", optSaved:"設定が保存されました",
    sectorAll:"すべて", sectorIndustry:"産業", sectorTechnology:"テクノロジー", sectorFinance:"金融", sectorRealEstate:"不動産", sectorConsumer:"消費", sectorEnergy:"エネルギー",
    chartTitle:"資産履歴", chartSub:"直近1時間のプレイ", chartNoData:"30秒プレイすると最初のデータポイントが表示されます。", chartTime:"時間", chartWealth:"純資産", chartAll:"全て",
    prestigeReady:"✅ プレステージ準備完了", prestigeNeed:"必要:", prestigeNext:"次:", prestigeGlobalIncome:"グローバル収入", prestigeStocksKept:"株式を保持", prestigeCostBiz:"-20%企業コスト", prestigeCostMgr:"-50%マネージャーコスト", prestigeUnlock:"達成", prestigeUnlockSuffix:"でアンロック",
    tabMissions:"ミッション", missionProgress:"進捗", missionDaily:"デイリー", missionChains:"チェーン", missionClaim:"受け取る", missionCompleted:"完了", missionReward:"報酬", missionActive:"アクティブ", missionExpires:"残り時間",
    newsTitle:"市場ニュース",
    prestigeInfo:"プレステージ情報", prestigeReq:"必要条件", prestigeRewards:"永続報酬", prestigeKeeps:"保持", prestigeResets:"リセット", prestigeStocks:"株式ポートフォリオ", prestigeAchs:"全実績", prestigeTitle:"称号", catRealEstate:"🏢 不動産",
    tutSkip:"チュートリアルをスキップ", tutNext:"次へ →", tutFinish:"始めよう！🚀",
    tut1t:"El Gran Capitalistaへようこそ！", tut1b:"ゼロからビジネス帝国を築き上げ、地球一の富豪CEOになりましょう。",
    tut2t:"クリックしてお金を稼ごう", tut2b:"大きなボタンを押して最初のお金を稼ごう。クリックすればするほど、早く成長できます！",
    tut3t:"企業を購入しよう", tut3b:"企業タブを開いて最初の会社に投資しましょう。各企業は毎秒受動収入を生み出します。",
    tut4t:"マネージャーを雇用しよう", tut4b:"マネージャーは企業を自動化（クリック不要）し、収入を最大×30に増加させます。マネージャータブへ。",
    tut5t:"アップグレードを購入しよう", tut5b:"アップグレードタブには永続倍率があり、クリック価値と受動収入を大幅に向上させます。",
    tut6t:"株式・暗号資産に投資しよう", tut6b:"市場タブを開いて株を購入し、5分ごとに配当金を受け取り、企業全体を買収しましょう。",
    tut7t:"ミッションをクリアしよう", tut7b:"ミッションタブには進捗・デイリー・チェーンミッションがあります。クリアして強力な一時ボーナスをゲット！",
    tut8t:"プレステージで全てを増幅", tut8b:"十分なお金を稼いだらプレステージ！進捗はリセットされますが永続倍率を獲得。プレステージを重ねるほど強くなります！",
    offlineTitle:"おかえりなさい！", offlineSub:"不在中の収益", offlineCollect:"受け取る",
    menuContinue:"続ける", menuNew:"新しいゲーム", menuNewConfirm:"セーブデータが削除されます。よろしいですか？", menuExit:"ゲーム終了", menuBack:"メニュー",
    bjDeal:"カードを配る",bjHit:"ヒット",bjStand:"スタンド",bjPlayAgain:"もう一度",bjDealer:"ディーラー",bjPlayer:"あなた",bjDesc:"21を超えずにディーラーに勝て。ブラックジャックは×2.5",bjBlackjack:"🎉 ブラックジャック!",bjWin:"✓ 勝利",bjPush:"引き分け",bjBust:"✗ バスト",casinoDaily:"1日の上限",casinoRemaining:"残り",roulSpin:"スピン",roulSpinning:"回転中...",roulHistory:"直近の番号",roulBetsActive:"現在の貭け",roulNoBets:"貭けなし",roulAddBet:"ベット",roulClearBets:"クリア",roulColorBet:"色",roulParityBet:"偶数/奇数",roulHalfBet:"大小",roulDozenBet:"ダズン",roulColBet:"コラム",roulNumBet:"番号",roulRed:"赤",roulBlack:"黒",roulGreen:"緑 (0)",roulEven:"偶数",roulOdd:"奇数",roulLow:"低 1-18",roulHigh:"高 19-36",roulD1:"1st 12",roulD2:"2nd 12",roulD3:"3rd 12",roulC1:"列1",roulC2:"列2",roulC3:"列3",saveInfoTitle:"自動保存",saveInfoOk:"了解！プレイ開始 🚀",saveInfoBody:"ゲームは5分ごと、またはオプション→保存終了で自動保存されます。",
    toAcquire:"残り", rankTitle:"殿堂", rankScore:"スコア", rankDate:"日付", rankNoData:"プレイしてホール・オブ・フェームを埋めよう！", rankYourBest:"あなたのベスト", holding:"保有:", valueLabel:"評価額:", offlineLabel:"オフライン収益",
  },
  pt: {
    title:"EL GRAN CAPITALISTA", total:"TOTAL GANHO", portfolio:"PORTFÓLIO",
    click:"CLIQUE", incomePerSec:"Receita/s", perClick:"Por clique",
    dividends:"Dividendos", businesses:"Empresas", shares:"Ações",
    prestige:"Prestígio", prestigeReset:"RESET DE PRESTÍGIO", prestigeSub:"Reinicia tudo · +1 prestígio",
    tabBusinesses:"Empresas", tabUpgrades:"Melhorias", tabManagers:"Gerentes",
    tabStocks:"Bolsa", tabCrypto:"Cripto", tabPortfolio:"Portfólio", tabCasino:"Casino", tabAchievements:"Conquistas",
    catFactory:"🏭 Indústria", catTech:"💻 Tecnologia", catFinance:"🏦 Finanças",
    upgAvailable:"MELHORIAS DISPONÍVEIS", bought:"COMPRADO",
    market:"Mercado", myShares:"Minhas Ações",
    price:"PREÇO", change:"VARIAÇÃO", owned:"TENHO",
    buyBtn:"COMPRAR", sellBtn:"VENDER", sellAll:"VENDER TUDO", maxBtn:"MÁX",
    acquired:"★ ADQUIRIDA", acquiredFull:"★ EMPRESA ADQUIRIDA",
    divEvery:"a cada 5 min", divEstimate:"Div. est./5min",
    portfolioTitle:"RESUMO DO SEU IMPÉRIO", acquiredCompanies:"★ EMPRESAS ADQUIRIDAS 100%",
    noBusinesses:"Ainda não tem nada. Comece a investir!", noShares:"Sem ações. Vá ao mercado investir.",
    achievementsTitle:"CONQUISTAS", achievementsUnlocked:"desbloqueadas",
    saveIndicator:"Salvo", totalShares:"ações",
    startTitle:"EL GRAN CAPITALISTA", startSub:"Construa seu império global do zero",
    startName:"Nome do seu CEO", startRegion:"Sua região (permanente, não alterável)",
    startLang:"Idioma", startBtn:"INICIAR IMPÉRIO",
    startNamePlaceholder:"Ex: João Silva", regionWarning:"⚠️ A região não pode ser alterada após iniciar o jogo.",
    every5min:"a cada 5 min", companyValue:"Valor do portfólio",
    managerHire:"CONTRATAR", managerUpgrade:"MELHORAR",
    managerTitle:"GERENTES", managerSub:"Contrate gerentes para automatizar seus negócios",
    managerLvl:"Nv", managerBonus:"bônus", managerAutomates:"Automatiza",
    managerNoBiz:"Você precisa de pelo menos 1 deste negócio para contratar um gerente.",
    managerHired:"Gerente contratado!", managerUpgraded:"Gerente melhorado!",
    managerMaxLevel:"NÍVEL MÁX", managerCost:"Custo",
    optTitle:"OPÇÕES", optSound:"Som", optVolume:"Volume", optUiScale:"Escala UI", optFps:"Mostrar FPS", optLang:"Idioma", optFullscreen:"Tela cheia (F11)", optReset:"Apagar Jogo", optResetConfirm:"Tem certeza? Isso não pode ser desfeito.", optClose:"FECHAR", optSaveExit:"💾  Salvar e sair", optFeedback:"🐛  Bug / Sugestões", feedbackType:"TIPO", feedbackSuggestion:"Sugestão", feedbackDesc:"DESCRIÇÃO", feedbackPlaceholder:"Descreva o bug ou sugestão...", feedbackEmail:"EMAIL (OPCIONAL)", feedbackSend:"Enviar", feedbackThanks:"Obrigado! Vamos verificar.", feedbackErr:"Erro ao enviar. Tente novamente.", optMusic:"Música", optMusicVol:"Volume música", optSaved:"Configurações salvas",
    sectorAll:"Todos", sectorIndustry:"Indústria", sectorTechnology:"Tecnologia", sectorFinance:"Finanças", sectorRealEstate:"Imóveis", sectorConsumer:"Consumo", sectorEnergy:"Energia",
    chartTitle:"Histórico de Riqueza", chartSub:"Última hora de jogo", chartNoData:"Jogue 30 segundos para ver seu primeiro ponto.", chartTime:"Tempo", chartWealth:"Patrimônio", chartAll:"Tudo",
    prestigeReady:"✅ Pronto para prestígio", prestigeNeed:"Necessário:", prestigeNext:"Próximo:", prestigeGlobalIncome:"renda global", prestigeStocksKept:"Ações mantidas", prestigeCostBiz:"-20% custo empresas", prestigeCostMgr:"-50% custo gerentes", prestigeUnlock:"Alcance", prestigeUnlockSuffix:"para desbloquear",
    tabMissions:"Missões", missionProgress:"Progresso", missionDaily:"Diárias", missionChains:"Cadeias", missionClaim:"RESGATAR", missionCompleted:"CONCLUÍDA", missionReward:"Recompensa", missionActive:"ATIVO", missionExpires:"expira em",
    newsTitle:"NOTÍCIAS DE MERCADO",
    prestigeInfo:"Info Prestígio", prestigeReq:"Necessário", prestigeRewards:"Recompensas Permanentes", prestigeKeeps:"Você mantém", prestigeResets:"Reinicia", prestigeStocks:"Portfólio", prestigeAchs:"Todas as conquistas", prestigeTitle:"Título", catRealEstate:"🏢 Imóveis",
    tutSkip:"Pular tutorial", tutNext:"Próximo →", tutFinish:"Vamos! 🚀",
    tut1t:"Bem-vindo ao El Gran Capitalista!", tut1b:"Construa seu império empresarial do zero e torne-se o CEO mais rico do planeta.",
    tut2t:"Clique para ganhar dinheiro", tut2b:"Pressione o grande botão para ganhar seus primeiros dólares. Quanto mais clicar, mais rápido cresce!",
    tut3t:"Compre empresas", tut3b:"Abra a aba Empresas e invista na sua primeira companhia. Cada empresa gera renda passiva por segundo.",
    tut4t:"Contrate gerentes", tut4b:"Gerentes automatizam suas empresas (sem clicar) e multiplicam a renda até ×30. Abra a aba Gerentes.",
    tut5t:"Compre melhorias", tut5b:"A aba Melhorias tem multiplicadores permanentes que disparam seu valor de clique e renda passiva.",
    tut6t:"Invista na bolsa e cripto", tut6b:"Abra a aba Mercado para comprar ações, receber dividendos a cada 5 minutos e adquirir empresas inteiras.",
    tut7t:"Complete missões", tut7b:"A aba Missões tem missões de Progresso, Diárias e em Cadeia. Complete-as para bônus temporários poderosos!",
    tut8t:"Prestígio multiplica tudo", tut8b:"Quando acumular dinheiro suficiente, o Prestígio reinicia o progresso mas dá um multiplicador permanente. Quanto mais prestígios, mais poderoso você fica!",
    offlineTitle:"Bem-vindo de volta!", offlineSub:"Enquanto você estava fora", offlineCollect:"Cobrar",
    menuContinue:"Continuar", menuNew:"Novo Jogo", menuNewConfirm:"Isso apagará seu save atual. Tem certeza?", menuExit:"Sair do Jogo", menuBack:"Menu",
    bjDeal:"DISTRIBUIR",bjHit:"PEDIR",bjStand:"PARAR",bjPlayAgain:"JOGAR NOVAMENTE",bjDealer:"DEALER",bjPlayer:"VOCÊ",bjDesc:"Vence o dealer sem passar de 21. Blackjack paga ×2.5",bjBlackjack:"🎉 BLACKJACK!",bjWin:"✓ GANHOU",bjPush:"EMPATE",bjBust:"✗ PASSOU",casinoDaily:"Limite diário",casinoRemaining:"restante",roulSpin:"GIRAR",roulSpinning:"Girando...",roulHistory:"Últimos números",roulBetsActive:"Apostas ativas",roulNoBets:"Sem apostas",roulAddBet:"APOSTAR",roulClearBets:"LIMPAR",roulColorBet:"COR",roulParityBet:"PAR / ÍMPAR",roulHalfBet:"METADE",roulDozenBet:"DÚzia",roulColBet:"COLUNA",roulNumBet:"NÚMERO",roulRed:"VERMELHO",roulBlack:"PRETO",roulGreen:"VERDE (0)",roulEven:"PAR",roulOdd:"ÍMPAR",roulLow:"BAIXO 1-18",roulHigh:"ALTO 19-36",roulD1:"1ª Dúzia",roulD2:"2ª Dúzia",roulD3:"3ª Dúzia",roulC1:"COL 1",roulC2:"COL 2",roulC3:"COL 3",saveInfoTitle:"Salvamento Automático",saveInfoOk:"Entendido! Vamos jogar 🚀",saveInfoBody:"O jogo salva a cada 5 min e ao sair via Opções → Salvar.",
    toAcquire:"Faltam", rankTitle:"Hall da Fama", rankScore:"Pontuação", rankDate:"Data", rankNoData:"Continue jogando para preencher seu Hall da Fama!", rankYourBest:"Suas Melhores Partidas", holding:"Em carteira:", valueLabel:"Valor:", offlineLabel:"GANHOS OFFLINE",
  },
  ru: {
    title:"El Gran Capitalista", total:"ВСЕГО ЗАРАБОТАНО", portfolio:"ПОРТФЕЛЬ",
    click:"КЛИК", incomePerSec:"Доход/с", perClick:"За клик",
    dividends:"Дивиденды", businesses:"Бизнесы", shares:"Акции",
    prestige:"Престиж", prestigeReset:"СБРОС ПРЕСТИЖА", prestigeSub:"Сбросить всё · +1 престиж",
    tabBusinesses:"Бизнесы", tabUpgrades:"Улучшения", tabManagers:"Менеджеры",
    tabStocks:"Биржа", tabCrypto:"Крипто", tabPortfolio:"Портфель", tabCasino:"Казино", tabAchievements:"Достижения",
    catFactory:"🏭 Промышленность", catTech:"💻 Технологии", catFinance:"🏦 Финансы",
    upgAvailable:"ДОСТУПНЫЕ УЛУЧШЕНИЯ", bought:"КУПЛЕНО",
    market:"Рынок", myShares:"Мои акции",
    price:"ЦЕНА", change:"ИЗМЕНЕНИЕ", owned:"ИМЕЮ",
    buyBtn:"КУПИТЬ", sellBtn:"ПРОДАТЬ", sellAll:"ПРОДАТЬ ВСЁ", maxBtn:"МАКС",
    acquired:"★ ПРИОБРЕТЕНА", acquiredFull:"★ КОМПАНИЯ ПРИОБРЕТЕНА",
    divEvery:"каждые 5 мин", divEstimate:"Дивид./5мин",
    portfolioTitle:"ОБЗОР ВАШЕЙ ИМПЕРИИ", acquiredCompanies:"★ КОМПАНИИ ПРИОБРЕТЕНЫ НА 100%",
    noBusinesses:"Пока ничего нет. Начните инвестировать!", noShares:"Нет акций. Идите на рынок.",
    achievementsTitle:"ДОСТИЖЕНИЯ", achievementsUnlocked:"разблокировано",
    saveIndicator:"Сохранено", totalShares:"акций",
    startTitle:"El Gran Capitalista", startSub:"Постройте глобальную империю с нуля",
    startName:"Имя вашего CEO", startRegion:"Ваш регион (постоянный, нельзя изменить)",
    startLang:"Язык", startBtn:"НАЧАТЬ ИМПЕРИЮ",
    startNamePlaceholder:"Напр.: Иван Петров", regionWarning:"⚠️ Регион нельзя изменить после начала игры.",
    every5min:"каждые 5 мин", companyValue:"Стоимость портфеля",
    managerHire:"НАНЯТЬ", managerUpgrade:"УЛУЧШИТЬ",
    managerTitle:"МЕНЕДЖЕРЫ", managerSub:"Наймите менеджеров для автоматизации бизнеса",
    managerLvl:"Ур", managerBonus:"бонус", managerAutomates:"Автоматизирует",
    managerNoBiz:"Вам нужен хотя бы 1 такой бизнес, чтобы нанять менеджера.",
    managerHired:"Менеджер нанят!", managerUpgraded:"Менеджер улучшен!",
    managerMaxLevel:"МАКС УРОВЕНЬ", managerCost:"Стоимость",
    optTitle:"НАСТРОЙКИ", optSound:"Звук", optVolume:"Громкость", optUiScale:"Масштаб UI", optFps:"Показать FPS", optLang:"Язык", optFullscreen:"Полный экран (F11)", optReset:"Сбросить сохранение", optResetConfirm:"Вы уверены? Это нельзя отменить.", optClose:"ЗАКРЫТЬ", optSaveExit:"💾  Сохранить и выйти", optFeedback:"🐛  Баг / Предложения", feedbackType:"ТИП", feedbackSuggestion:"Предложение", feedbackDesc:"ОПИСАНИЕ", feedbackPlaceholder:"Опишите баг или предложение...", feedbackEmail:"EMAIL (НЕОБЯЗАТЕЛЬНО)", feedbackSend:"Отправить", feedbackThanks:"Спасибо! Мы разберёмся.", feedbackErr:"Ошибка отправки. Попробуйте снова.", optMusic:"Музыка", optMusicVol:"Громкость музыки", optSaved:"Настройки сохранены",
    sectorAll:"Все", sectorIndustry:"Промышленность", sectorTechnology:"Технологии", sectorFinance:"Финансы", sectorRealEstate:"Недвижимость", sectorConsumer:"Потребительский", sectorEnergy:"Энергетика",
    chartTitle:"История Богатства", chartSub:"Последний час игры", chartNoData:"Играйте 30 секунд, чтобы увидеть первую точку.", chartTime:"Время", chartWealth:"Состояние", chartAll:"Всё",
    prestigeReady:"✅ Готово к престижу", prestigeNeed:"Требуется:", prestigeNext:"Следующий:", prestigeGlobalIncome:"глобальный доход", prestigeStocksKept:"Акции сохраняются", prestigeCostBiz:"-20% стоимость бизнеса", prestigeCostMgr:"-50% стоимость менеджеров", prestigeUnlock:"Достигните", prestigeUnlockSuffix:"для разблокировки",
    tabMissions:"Миссии", missionProgress:"Прогресс", missionDaily:"Ежедневные", missionChains:"Цепочки", missionClaim:"ПОЛУЧИТЬ", missionCompleted:"ВЫПОЛНЕНО", missionReward:"Награда", missionActive:"АКТИВНО", missionExpires:"истекает через",
    newsTitle:"НОВОСТИ РЫНКА",
    prestigeInfo:"Инфо Престиж", prestigeReq:"Требуется", prestigeRewards:"Постоянные награды", prestigeKeeps:"Сохраняете", prestigeResets:"Сбрасывается", prestigeStocks:"Портфель акций", prestigeAchs:"Все достижения", prestigeTitle:"Титул", catRealEstate:"🏢 Недвижимость",
    tutSkip:"Пропустить обучение", tutNext:"Далее →", tutFinish:"Вперёд! 🚀",
    tut1t:"Добро пожаловать в El Gran Capitalista!", tut1b:"Стройте бизнес-империю с нуля и станьте самым богатым CEO на планете.",
    tut2t:"Кликайте, чтобы зарабатывать", tut2b:"Нажмите большую кнопку, чтобы заработать первые деньги. Чем больше кликов — тем быстрее рост!",
    tut3t:"Покупайте предприятия", tut3b:"Откройте вкладку Бизнес и инвестируйте в первую компанию. Каждое предприятие приносит пассивный доход каждую секунду.",
    tut4t:"Нанимайте менеджеров", tut4b:"Менеджеры автоматизируют бизнес (клик не нужен) и умножают его доход до ×30. Перейдите во вкладку Менеджеры.",
    tut5t:"Покупайте улучшения", tut5b:"Во вкладке Улучшения есть постоянные множители, которые резко увеличивают ценность клика и пассивный доход.",
    tut6t:"Инвестируйте в акции и крипто", tut6b:"Откройте вкладку Рынок, покупайте акции, получайте дивиденды каждые 5 минут и приобретайте целые компании.",
    tut7t:"Выполняйте миссии", tut7b:"Во вкладке Миссии есть задания Прогресса, Ежедневные и Цепочки. Выполняйте их ради мощных временных бонусов!",
    tut8t:"Престиж умножает всё", tut8b:"Накопив достаточно денег, Престиж сбрасывает прогресс, но даёт постоянный множитель дохода. Чем больше Престижей, тем мощнее вы становитесь!",
    offlineTitle:"С возвращением!", offlineSub:"Пока вас не было", offlineCollect:"Получить",
    menuContinue:"Продолжить", menuNew:"Новая игра", menuNewConfirm:"Сохранение будет удалено. Вы уверены?", menuExit:"Выйти из игры", menuBack:"Меню",
    bjDeal:"РАЗДАТЬ",bjHit:"ЕЩЁ",bjStand:"СТОП",bjPlayAgain:"ИГРАТЬ СНОВА",bjDealer:"ДИЛЕР",bjPlayer:"ВЫ",bjDesc:"Обыграй дилера, не превышая 21. Блэкджек платит ×2.5",bjBlackjack:"🎉 БЛЭКДЖЕК!",bjWin:"✓ ВЫИГРАЛ",bjPush:"НИЧЬЯ",bjBust:"✗ ПЕРЕБОР",casinoDaily:"Дневной лимит",casinoRemaining:"осталось",roulSpin:"КРУТИТЬ",roulSpinning:"Крутится...",roulHistory:"Последние числа",roulBetsActive:"Текущие ставки",roulNoBets:"Нет ставок",roulAddBet:"ПОСТАВИТЬ",roulClearBets:"ОЧИСТИТЬ",roulColorBet:"ЦВЕТ",roulParityBet:"ЧЁТ / НЕЧЕТ",roulHalfBet:"ПОЛОВИНА",roulDozenBet:"ДЮЖИНА",roulColBet:"КОЛОНКА",roulNumBet:"ЧИСЛО",roulRed:"КРАСНОЕ",roulBlack:"ЧЁРНОЕ",roulGreen:"ЗЕЛЁНОЕ (0)",roulEven:"ЧЁТНОЕ",roulOdd:"НЕЧЁТНОЕ",roulLow:"МАЛО 1-18",roulHigh:"МНОГО 19-36",roulD1:"1-я Дюж.",roulD2:"2-я Дюж.",roulD3:"3-я Дюж.",roulC1:"КОЛ 1",roulC2:"КОЛ 2",roulC3:"КОЛ 3",saveInfoTitle:"Автосохранение",saveInfoOk:"Понятно! Играем 🚀",saveInfoBody:"Игра сохраняется каждые 5 мин и при выходе через Опции → Сохранить.",
    toAcquire:"Осталось", rankTitle:"Зал Славы", rankScore:"Очки", rankDate:"Дата", rankNoData:"Играйте больше, чтобы заполнить Зал Славы!", rankYourBest:"Ваши Лучшие Игры", holding:"В портфеле:", valueLabel:"Стоимость:", offlineLabel:"ОФЛАЙН ДОХОДЫ",
  },
};

const LANG_NAMES = { en:"English", es:"Español", fr:"Français", de:"Deutsch", zh:"中文", ja:"日本語", pt:"Português", ru:"Русский" };
const REGIONS_UNIQUE = ["North America","South America","Europe","Middle East & Africa","Asia Pacific","Russia & CIS","Oceania"];

// ─── UTILS ────────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1e12) return "$" + (n/1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n/1e9).toFixed(2)  + "B";
  if (n >= 1e6)  return "$" + (n/1e6).toFixed(2)  + "M";
  if (n >= 1e3)  return "$" + (n/1e3).toFixed(2)  + "K";
  return "$" + n.toFixed(2);
}
function fmtShares(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
  return n.toString();
}
function pct(n) { return (n >= 0 ? "+" : "") + n.toFixed(2) + "%"; }
function getBizCost(biz, count, costReduce=1) { return Math.floor(biz.baseCost * Math.pow(1.15, count) * costReduce); }
function getCeoLevel(totalEarned) {
  let level = CEO_LEVELS[0];
  for (const l of CEO_LEVELS) { if (totalEarned >= l.minWealth) level = l; }
  return level;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CEO_LEVELS = [
  { name:{en:"Intern",   es:"Becario",  fr:"Stagiaire",  de:"Praktikant", zh:"实习生",  ja:"インターン",    pt:"Estagiário", ru:"Стажёр"},    minWealth:0,     bonus:1.0  },
  { name:{en:"Analyst",  es:"Analista", fr:"Analyste",   de:"Analyst",    zh:"分析师",  ja:"アナリスト",    pt:"Analista",   ru:"Аналитик"},  minWealth:2e3,   bonus:1.15 },
  { name:{en:"Manager",  es:"Manager",  fr:"Manager",    de:"Manager",    zh:"经理",    ja:"マネージャー",  pt:"Gerente",    ru:"Менеджер"},  minWealth:20e3,  bonus:1.35 },
  { name:{en:"Director", es:"Director", fr:"Directeur",  de:"Direktor",   zh:"总监",    ja:"ディレクター",  pt:"Diretor",    ru:"Директор"},  minWealth:150e3, bonus:1.6  },
  { name:{en:"VP",       es:"VP",       fr:"VP",         de:"VP",         zh:"副总裁",  ja:"副社長",        pt:"VP",         ru:"ВП"},        minWealth:1e6,   bonus:2.0  },
  { name:{en:"C-Suite",  es:"C-Suite",  fr:"Comité Exéc",de:"Vorstand",   zh:"高管",    ja:"役員",          pt:"C-Suite",    ru:"Топ-менеджер"},minWealth:8e6, bonus:2.8  },
  { name:{en:"CEO",      es:"CEO",      fr:"PDG",        de:"CEO",        zh:"首席执行官",ja:"CEO",          pt:"CEO",        ru:"Генеральный"},minWealth:50e6, bonus:4.0  },
  { name:{en:"Mogul",    es:"Magnate",  fr:"Magnat",     de:"Mogul",      zh:"大亨",    ja:"大物",          pt:"Magnata",    ru:"Магнат"},    minWealth:300e6, bonus:6.0  },
  { name:{en:"Tycoon",   es:"Tycoon",   fr:"Tycoon",     de:"Tycoon",     zh:"巨头",    ja:"タイクーン",    pt:"Magnata",    ru:"Тайкун"},    minWealth:2e9,   bonus:10.0 },
  { name:{en:"Oligarch", es:"Oligarca", fr:"Oligarque",  de:"Oligarch",   zh:"寡头",    ja:"オリガルヒ",    pt:"Oligarca",   ru:"Олигарх"},   minWealth:20e9,  bonus:18.0 },
];

const BUSINESSES = [
  { id:"f1", name:{en:"Scrapyard",          es:"Chatarrera",          fr:"Ferrailleur",          de:"Schrottplatz",       zh:"废品场",      ja:"スクラップ場",      pt:"Ferro Velho",        ru:"Металлолом"},      category:"factory", baseCost:80,     baseIncome:0.4,   icon:"🏚️", img:"biz_f1.png" },
  { id:"f2", name:{en:"Repair Shop",        es:"Taller Mecánico",     fr:"Atelier Mécanique",    de:"Werkstatt",          zh:"修理厂",      ja:"修理工場",          pt:"Oficina Mecânica",   ru:"Мастерская"},      category:"factory", baseCost:400,    baseIncome:2.0,   icon:"🔧", img:"biz_f2.png" },
  { id:"f3", name:{en:"Textile Factory",    es:"Fábrica Textil",      fr:"Usine Textile",        de:"Textilfabrik",       zh:"纺织厂",      ja:"繊維工場",          pt:"Fábrica Têxtil",     ru:"Текстиль"},        category:"factory", baseCost:1500,   baseIncome:7.5,   icon:"🧵", img:"biz_f3.png" },
  { id:"f4", name:{en:"Chemical Plant",     es:"Planta Química",      fr:"Usine Chimique",       de:"Chemiewerk",         zh:"化工厂",      ja:"化学工場",          pt:"Planta Química",     ru:"Химзавод"},        category:"factory", baseCost:6000,   baseIncome:30,    icon:"⚗️", img:"biz_f4.png" },
  { id:"f5", name:{en:"Car Factory",        es:"Fábrica Automotriz",  fr:"Usine Automobile",     de:"Autofabrik",         zh:"汽车工厂",    ja:"自動車工場",        pt:"Fábrica de Carros",  ru:"Автозавод"},       category:"factory", baseCost:25000,  baseIncome:125,   icon:"🚗", img:"biz_f5.png" },
  { id:"f6", name:{en:"Pharma Lab",         es:"Laboratorio Pharma",  fr:"Labo Pharmaceutique",  de:"Pharmalabor",        zh:"制药实验室",  ja:"製薬ラボ",          pt:"Laboratório Pharma", ru:"Фарм.лаб."},       category:"factory", baseCost:100000, baseIncome:550,   icon:"💊", img:"biz_f6.png" },
  { id:"f7", name:{en:"Oil Refinery",       es:"Refinería Petróleo",  fr:"Raffinerie de Pétrole",de:"Ölraffinerie",       zh:"炼油厂",      ja:"石油精製所",        pt:"Refinaria de Petróleo",ru:"Нефтезавод"},    category:"factory", baseCost:500000, baseIncome:3000,  icon:"🛢️", img:"biz_f7.png" },
  { id:"t1", name:{en:"Affiliate Blog",     es:"Blog de Afiliados",   fr:"Blog d'Affiliation",   de:"Affiliate-Blog",     zh:"联盟博客",    ja:"アフィリエイトブログ",pt:"Blog de Afiliados",  ru:"Блог"},            category:"tech",    baseCost:150,    baseIncome:0.8,   icon:"📝", img:"biz_t1.png" },
  { id:"t2", name:{en:"Viral App",          es:"App Viral",           fr:"App Virale",            de:"Virale App",         zh:"爆款应用",    ja:"バイラルアプリ",    pt:"App Viral",          ru:"Вирусное приложение"},category:"tech",baseCost:800,    baseIncome:4.5,   icon:"📱", img:"biz_t2.png" },
  { id:"t3", name:{en:"Digital Agency",     es:"Agencia Digital",     fr:"Agence Digitale",       de:"Digitalagentur",     zh:"数字营销",    ja:"デジタルエージェンシー",pt:"Agência Digital",  ru:"Digital агентство"},category:"tech",baseCost:4000,   baseIncome:22,    icon:"🎯", img:"biz_t3.png" },
  { id:"t4", name:{en:"SaaS Platform",      es:"SaaS Platform",       fr:"Plateforme SaaS",       de:"SaaS Plattform",     zh:"SaaS平台",    ja:"SaaSプラットフォーム",pt:"Plataforma SaaS",   ru:"SaaS платформа"},  category:"tech",    baseCost:18000,  baseIncome:95,    icon:"💻", img:"biz_t4.png" },
  { id:"t5", name:{en:"eCommerce Platform", es:"Plataforma eCommerce",fr:"Plateforme eCommerce",  de:"eCommerce Plattform",zh:"电商平台",    ja:"ECプラットフォーム",pt:"Plataforma eCommerce",ru:"Интернет-магазин"}, category:"tech",    baseCost:70000,  baseIncome:400,   icon:"🛒", img:"biz_t5.png" },
  { id:"t6", name:{en:"AI Startup",         es:"Startup de IA",       fr:"Startup IA",            de:"KI-Startup",         zh:"AI创业公司",  ja:"AIスタートアップ",  pt:"Startup de IA",      ru:"ИИ стартап"},       category:"tech",    baseCost:250000, baseIncome:1500,  icon:"🤖", img:"biz_t6.png" },
  { id:"t7", name:{en:"Global Datacenter",  es:"Datacenter Global",   fr:"Datacenter Mondial",    de:"Globales Datacenter",zh:"全球数据中心",ja:"グローバルデータセンター",pt:"Datacenter Global",ru:"Дата-центр"},    category:"tech",    baseCost:1e6,    baseIncome:7000,  icon:"🖥️", img:"biz_t7.png" },
  { id:"b1", name:{en:"Forex Exchange",     es:"Cambio de Divisas",   fr:"Change de Devises",     de:"Devisenhandel",      zh:"外汇交易",    ja:"外国為替",          pt:"Câmbio de Divisas",  ru:"Форекс"},          category:"finance", baseCost:600,    baseIncome:3.5,   icon:"💱", img:"biz_b1.png" },
  { id:"b2", name:{en:"Microlending",       es:"Microcréditos",       fr:"Microcrédit",           de:"Mikrokredite",       zh:"小额贷款",    ja:"マイクロクレジット",pt:"Microcrédito",       ru:"Микрокредиты"},    category:"finance", baseCost:3000,   baseIncome:17,    icon:"💳", img:"biz_b2.png" },
  { id:"b3", name:{en:"Insurance Co.",      es:"Aseguradora",         fr:"Assurances",            de:"Versicherung",       zh:"保险公司",    ja:"保険会社",          pt:"Seguradora",         ru:"Страховая"},       category:"finance", baseCost:12000,  baseIncome:70,    icon:"🛡️", img:"biz_b3.png" },
  { id:"b4", name:{en:"Hedge Fund",         es:"Hedge Fund",          fr:"Fonds Spéculatif",      de:"Hedgefonds",         zh:"对冲基金",    ja:"ヘッジファンド",    pt:"Hedge Fund",         ru:"Хедж-фонд"},       category:"finance", baseCost:60000,  baseIncome:350,   icon:"📈", img:"biz_b4.png" },
  { id:"b5", name:{en:"Private Bank",       es:"Banco Privado",       fr:"Banque Privée",         de:"Privatbank",         zh:"私人银行",    ja:"プライベートバンク",pt:"Banco Privado",      ru:"Частный банк"},    category:"finance", baseCost:300000, baseIncome:1800,  icon:"🏦", img:"biz_b5.png" },
  { id:"b6", name:{en:"Sovereign Fund",     es:"Fondo Soberano",      fr:"Fonds Souverain",       de:"Staatsfonds",        zh:"主权基金",    ja:"ソブリンファンド",  pt:"Fundo Soberano",     ru:"Суверенный фонд"}, category:"finance", baseCost:1.5e6,  baseIncome:9000,  icon:"🌐", img:"biz_b6.png" },
  { id:"b7", name:{en:"Central Bank",       es:"Banco Central",       fr:"Banque Centrale",       de:"Zentralbank",        zh:"中央银行",    ja:"中央銀行",          pt:"Banco Central",      ru:"Центральный банк"},category:"finance", baseCost:8e6,    baseIncome:50000, icon:"🏛️", img:"biz_b7.png" },
];

const UPGRADES = [
  { id:"uc1", name:{en:"Executive Briefcase",   es:"Maletín Ejecutivo",    fr:"Mallette Exécutive",   de:"Aktentasche",        zh:"公文包",    ja:"重役カバン",      pt:"Pasta Executiva",    ru:"Портфель"},       desc:{en:"+2$/click",        es:"+2$/click",        fr:"+2$/clic",        de:"+2$/Klick",        zh:"+2$/点击",   ja:"+2$/クリック",  pt:"+2$/clique",       ru:"+2$/клик"},        cost:300,    effect:"clickFlat",  value:2,   cat:null,      bought:false },
  { id:"uc2", name:{en:"Gold Watch",            es:"Reloj de Oro",         fr:"Montre en Or",         de:"Goldene Uhr",        zh:"金表",      ja:"金時計",          pt:"Relógio de Ouro",    ru:"Золотые часы"},   desc:{en:"+10$/click",       es:"+10$/click",       fr:"+10$/clic",       de:"+10$/Klick",       zh:"+10$/点击",  ja:"+10$/クリック", pt:"+10$/clique",      ru:"+10$/клик"},       cost:5000,   effect:"clickFlat",  value:10,  cat:null,      bought:false },
  { id:"uc3", name:{en:"Institutional Click",   es:"Click Institucional",  fr:"Clic Institutionnel",  de:"Institutioneller K.",zh:"机构点击",  ja:"機関クリック",    pt:"Clique Institucional",ru:"Институц. клик"}, desc:{en:"+50$/click",       es:"+50$/click",       fr:"+50$/clic",       de:"+50$/Klick",       zh:"+50$/点击",  ja:"+50$/クリック", pt:"+50$/clique",      ru:"+50$/клик"},       cost:80000,  effect:"clickFlat",  value:50,  cat:null,      bought:false },
  { id:"uc4", name:{en:"Million Dollar Sign.",  es:"Firma Millonaria",     fr:"Signature Millionnaire",de:"Millionen-Signatur", zh:"百万签名",  ja:"百万ドル署名",    pt:"Assinatura Milionária",ru:"Подпись на млн"}, desc:{en:"x3 click value",   es:"x3 por click",     fr:"x3 par clic",     de:"x3 Klickwert",     zh:"x3点击价值", ja:"x3クリック価値",pt:"x3 por clique",    ru:"x3 ценность"},     cost:500000, effect:"clickMult",  value:3,   cat:null,      bought:false },
  { id:"uf1", name:{en:"Basic Automation",      es:"Automatización Básica",fr:"Automatisation Basique",de:"Basisautomatisierung",zh:"基础自动化",ja:"基本的自動化",   pt:"Automação Básica",   ru:"Базовая автоматизация"},desc:{en:"Industry x1.5",  es:"Industria x1.5",   fr:"Industrie x1.5",  de:"Industrie x1.5",   zh:"工业 x1.5",  ja:"産業 x1.5",     pt:"Indústria x1.5",   ru:"Промышл. x1.5"},   cost:2000,   effect:"catMult",    value:1.5, cat:"factory", bought:false },
  { id:"uf2", name:{en:"Advanced Robotics",     es:"Robótica Avanzada",    fr:"Robotique Avancée",    de:"Fortgeschr. Robotik",zh:"先进机器人", ja:"先進ロボティクス", pt:"Robótica Avançada",  ru:"Продв. роботика"},desc:{en:"Industry x2",     es:"Industria x2",     fr:"Industrie x2",    de:"Industrie x2",     zh:"工业 x2",    ja:"産業 x2",       pt:"Indústria x2",     ru:"Промышл. x2"},     cost:30000,  effect:"catMult",    value:2,   cat:"factory", bought:false },
  { id:"uf3", name:{en:"Industry 4.0",          es:"Industria 4.0",        fr:"Industrie 4.0",        de:"Industrie 4.0",      zh:"工业4.0",   ja:"インダストリー4.0",pt:"Indústria 4.0",     ru:"Индустрия 4.0"},  desc:{en:"Industry x4",     es:"Industria x4",     fr:"Industrie x4",    de:"Industrie x4",     zh:"工业 x4",    ja:"産業 x4",       pt:"Indústria x4",     ru:"Промышл. x4"},     cost:800000, effect:"catMult",    value:4,   cat:"factory", bought:false },
  { id:"ut1", name:{en:"Growth Hacking",        es:"Growth Hacking",       fr:"Growth Hacking",       de:"Growth Hacking",     zh:"增长黑客",  ja:"グロースハック",  pt:"Growth Hacking",     ru:"Рост хакинг"},    desc:{en:"Tech x1.5",        es:"Tech x1.5",        fr:"Tech x1.5",       de:"Tech x1.5",        zh:"科技 x1.5",  ja:"テック x1.5",   pt:"Tech x1.5",        ru:"Технол. x1.5"},    cost:5000,   effect:"catMult",    value:1.5, cat:"tech",    bought:false },
  { id:"ut2", name:{en:"Silicon Valley Mode",   es:"Silicon Valley Mode",  fr:"Mode Silicon Valley",  de:"Silicon Valley Modus",zh:"硅谷模式",  ja:"シリコンバレーモード",pt:"Modo Silicon Valley",ru:"Режим Силикон. долины"},desc:{en:"Tech x2",        es:"Tech x2",          fr:"Tech x2",         de:"Tech x2",          zh:"科技 x2",    ja:"テック x2",     pt:"Tech x2",          ru:"Технол. x2"},      cost:60000,  effect:"catMult",    value:2,   cat:"tech",    bought:false },
  { id:"ut3", name:{en:"Digital Monopoly",      es:"Monopolio Digital",    fr:"Monopole Numérique",   de:"Digitales Monopol",  zh:"数字垄断",  ja:"デジタル独占",    pt:"Monopólio Digital",  ru:"Цифровая монополия"},desc:{en:"Tech x4",          es:"Tech x4",          fr:"Tech x4",         de:"Tech x4",          zh:"科技 x4",    ja:"テック x4",     pt:"Tech x4",          ru:"Технол. x4"},      cost:1.5e6,  effect:"catMult",    value:4,   cat:"tech",    bought:false },
  { id:"ub1", name:{en:"Leverage",              es:"Apalancamiento",       fr:"Levier Financier",     de:"Hebelwirkung",       zh:"杠杆",      ja:"レバレッジ",      pt:"Alavancagem",        ru:"Кредитное плечо"},desc:{en:"Finance x1.5",    es:"Finanzas x1.5",    fr:"Finance x1.5",    de:"Finanzen x1.5",    zh:"金融 x1.5",  ja:"金融 x1.5",     pt:"Finanças x1.5",    ru:"Финансы x1.5"},    cost:8000,   effect:"catMult",    value:1.5, cat:"finance", bought:false },
  { id:"ub2", name:{en:"Quantitative Easing",   es:"Quantitative Easing",  fr:"Assouplissement Quant.",de:"Quantitative Lockerung",zh:"量化宽松", ja:"量的緩和",       pt:"Flexibilização Quant.",ru:"Кол. смягчение"},desc:{en:"Finance x2",      es:"Finanzas x2",      fr:"Finance x2",      de:"Finanzen x2",      zh:"金融 x2",    ja:"金融 x2",       pt:"Finanças x2",      ru:"Финансы x2"},      cost:100000, effect:"catMult",    value:2,   cat:"finance", bought:false },
  { id:"ub3", name:{en:"Too Big To Fail",       es:"Too Big To Fail",      fr:"Trop Grand Pour Echouer",de:"Too Big To Fail",  zh:"大而不倒",  ja:"大きすぎて潰せない",pt:"Grande Demais Para Falir",ru:"Слишком крупный"},desc:{en:"Finance x4",      es:"Finanzas x4",      fr:"Finance x4",      de:"Finanzen x4",      zh:"金融 x4",    ja:"金融 x4",       pt:"Finanças x4",      ru:"Финансы x4"},      cost:2e6,    effect:"catMult",    value:4,   cat:"finance", bought:false },
  { id:"ug1", name:{en:"Economies of Scale",    es:"Economías de Escala",  fr:"Economies d'Echelle",  de:"Skaleneffekte",      zh:"规模经济",  ja:"規模の経済",      pt:"Economias de Escala",ru:"Экономия масштаба"},desc:{en:"Everything x1.5", es:"Todo x1.5",        fr:"Tout x1.5",       de:"Alles x1.5",       zh:"全部 x1.5",  ja:"全部 x1.5",     pt:"Tudo x1.5",        ru:"Всё x1.5"},         cost:200000, effect:"globalMult", value:1.5, cat:null,      bought:false },
  { id:"ug2", name:{en:"Total Conglomerate",    es:"Conglomerado Total",   fr:"Conglomerat Total",    de:"Totales Konglomerat",zh:"企业集团",  ja:"総合コングロマリット",pt:"Conglomerado Total",ru:"Тотальный конгломерат"},desc:{en:"Everything x2",   es:"Todo x2",          fr:"Tout x2",         de:"Alles x2",         zh:"全部 x2",    ja:"全部 x2",       pt:"Tudo x2",          ru:"Всё x2"},           cost:2e6,    effect:"globalMult", value:2,   cat:null,      bought:false },
  { id:"ug3", name:{en:"Total Monopoly",        es:"Monopolio Total",      fr:"Monopole Total",       de:"Totales Monopol",    zh:"完全垄断",  ja:"完全独占",        pt:"Monopólio Total",    ru:"Тотальная монополия"},desc:{en:"Everything x5",   es:"Todo x5",          fr:"Tout x5",         de:"Alles x5",         zh:"全部 x5",    ja:"全部 x5",       pt:"Tudo x5",          ru:"Всё x5"},           cost:20e6,   effect:"globalMult", value:5,   cat:null,      bought:false },
  { id:"ug4", name:{en:"New Economic Order",    es:"Nuevo Orden Económico",fr:"Nouvel Ordre Economique",de:"Neue Wirtschaftsordnung",zh:"新经济秩序",ja:"新経済秩序",  pt:"Nova Ordem Econômica",ru:"Новый эк. порядок"},desc:{en:"Everything x10",  es:"Todo x10",         fr:"Tout x10",        de:"Alles x10",        zh:"全部 x10",   ja:"全部 x10",      pt:"Tudo x10",         ru:"Всё x10"},          cost:200e6,  effect:"globalMult", value:10,  cat:null,      bought:false },
];

// Real Estate sector (unlocked at Prestige 3)
const REAL_ESTATE_BUSINESSES = [
  { id:"r1", name:{en:"Parking Lot",        es:"Parking",              fr:"Parking",               de:"Parkplatz",          zh:"停车场",      ja:"駐車場",            pt:"Estacionamento",     ru:"Парковка"},        category:"realestate", baseCost:5000,   baseIncome:25,    icon:"🅿️", img:"biz_r1.png" },
  { id:"r2", name:{en:"Apartment Block",    es:"Bloque de Pisos",      fr:"Immeuble",              de:"Wohnblock",          zh:"公寓楼",      ja:"アパート",          pt:"Bloco de Apartamentos",ru:"Жилой блок"},    category:"realestate", baseCost:40000,  baseIncome:200,   icon:"🏠", img:"biz_r2.png" },
  { id:"r3", name:{en:"Shopping Mall",      es:"Centro Comercial",     fr:"Centre Commercial",     de:"Einkaufszentrum",    zh:"购物中心",    ja:"ショッピングモール",pt:"Shopping Center",    ru:"Торговый центр"},  category:"realestate", baseCost:250000, baseIncome:1400,  icon:"🏬", img:"biz_r3.png" },
  { id:"r4", name:{en:"Office Tower",       es:"Torre de Oficinas",    fr:"Tour de Bureaux",       de:"Büroturm",           zh:"写字楼",      ja:"オフィスタワー",    pt:"Torre de Escritórios",ru:"Офисная башня"},  category:"realestate", baseCost:2e6,    baseIncome:12000, icon:"🏢", img:"biz_r4.png" },
  { id:"r5", name:{en:"Luxury Resort",      es:"Resort de Lujo",       fr:"Resort de Luxe",        de:"Luxusresort",        zh:"豪华度假村",  ja:"ラグジュアリーリゾート",pt:"Resort de Luxo",   ru:"Люкс-курорт"},    category:"realestate", baseCost:20e6,   baseIncome:120000,icon:"🏖️", img:"biz_r5.png" },
];

// Short descriptions for each business (used in the business cards)
const BUSINESS_DESCS = {
  f1:{en:"Buy cheap, sell scrap metal for profit.",           es:"Compra barato y vende chatarra.",                   fr:"Achetez et revendez de la ferraille.",            de:"Schrott sammeln und mit Gewinn verkaufen.",     zh:"低价收购废料，转手盈利。",       ja:"廃材を安く買い転売する。",            pt:"Compre barato e revenda sucata.",                ru:"Покупай дёшево, продавай металлолом."},
  f2:{en:"Fix machines and vehicles for steady pay.",         es:"Repara máquinas y coches con ingresos estables.",   fr:"Réparez machines et véhicules régulièrement.",    de:"Repariere Maschinen für regelmäßige Einnahmen.", zh:"修理机械获得稳定收益。",         ja:"機械を修理して安定収入を得る。",       pt:"Repare máquinas para renda estável.",            ru:"Чини технику — стабильный доход."},
  f3:{en:"Produce fabrics and clothing at scale.",            es:"Fabrica telas y ropa a gran escala.",               fr:"Produisez des vêtements à grande échelle.",       de:"Stoffe und Kleidung im großen Maßstab herstellen.",zh:"大规模生产面料和服装。",       ja:"繊維製品を大量生産する。",            pt:"Produza tecidos e roupas em escala.",            ru:"Производство тканей и одежды в масштабе."},
  f4:{en:"Manufacture industrial chemicals for markets.",     es:"Fabrica químicos industriales para el mercado.",    fr:"Produisez des produits chimiques industriels.",   de:"Industriechemikalien für den Markt herstellen.", zh:"为市场生产工业化学品。",         ja:"工業用化学品を製造する。",            pt:"Fabrique produtos químicos industriais.",        ru:"Производи промышленные химикаты."},
  f5:{en:"Assemble and sell automobiles worldwide.",          es:"Ensambla y vende automóviles en todo el mundo.",    fr:"Assemblez et vendez des voitures dans le monde.", de:"Autos weltweit zusammenbauen und verkaufen.",   zh:"全球组装并销售汽车。",           ja:"世界中に自動車を製造・販売する。",    pt:"Monte e venda automóveis no mundo inteiro.",     ru:"Собирай и продавай автомобили по всему миру."},
  f6:{en:"Develop and patent highly profitable drugs.",       es:"Desarrolla y patenta medicamentos rentables.",      fr:"Développez et brevetez des médicaments.",         de:"Entwickle und patentiere profitable Medikamente.",zh:"开发并申请专利高利润药物。",    ja:"高収益な医薬品を開発・特許登録。",    pt:"Desenvolva e patente medicamentos lucrativos.",  ru:"Разрабатывай и патентуй прибыльные лекарства."},
  f7:{en:"Refine crude oil into high-margin products.",       es:"Refina petróleo en productos de alto margen.",      fr:"Raffinez le pétrole brut en produits.",           de:"Rohöl zu hochmargigen Produkten raffinieren.",  zh:"将原油精炼为高利润产品。",       ja:"原油を高収益製品に精製する。",        pt:"Refine petróleo bruto em produtos de alto valor.",ru:"Переработка нефти в высокомаржинальные продукты."},
  t1:{en:"Earn commissions promoting products online.",       es:"Gana comisiones promocionando productos online.",   fr:"Gagnez des commissions en promouvant des produits.",de:"Verdiene Provisionen durch Online-Werbung.",    zh:"通过推广产品赚取佣金。",         ja:"商品プロモートで手数料収入。",        pt:"Ganhe comissões promovendo produtos online.",    ru:"Зарабатывай комиссию, продвигая товары онлайн."},
  t2:{en:"Monetize a viral app with millions of users.",      es:"Monetiza una app viral con millones de usuarios.",  fr:"Monétisez une app virale avec des millions.",      de:"Monetarisiere eine virale App mit Millionen.",  zh:"通过爆款应用变现数百万用户。",   ja:"数百万ユーザーのウイルスアプリを収益化。",pt:"Monetize um app viral com milhões de usuários.",ru:"Монетизируй вирусное приложение с миллионами."},
  t3:{en:"Sell marketing and web services to companies.",     es:"Vende marketing y servicios web a empresas.",       fr:"Vendez des services marketing aux entreprises.",  de:"Verkaufe Marketing- und Web-Dienste an Firmen.", zh:"向企业销售营销和网络服务。",     ja:"企業にマーケティングとWebサービスを提供。",pt:"Venda marketing e serviços web a empresas.",     ru:"Продавай маркетинг и веб-услуги компаниям."},
  t4:{en:"Charge monthly subscriptions for your software.",   es:"Cobra suscripciones mensuales por tu software.",    fr:"Facturez des abonnements pour votre logiciel.",   de:"Verdiene monatliche Abonnements für Software.",  zh:"向用户收取软件订阅费。",         ja:"自社ソフトウェアで月額課金。",        pt:"Cobre assinaturas mensais pelo seu software.",   ru:"Зарабатывай на подписке на своё ПО."},
  t5:{en:"Run a marketplace — take a cut of every sale.",     es:"Gestiona un marketplace y cobra por cada venta.",   fr:"Gérez une marketplace et prélevez une commission.",de:"Betreibe einen Marktplatz und kassiere Provision.",zh:"运营电商平台，从每笔交易中抽佣。",ja:"マーケットプレイスを運営し手数料を得る。",pt:"Gerencie um marketplace e fique com parte das vendas.",ru:"Запусти маркетплейс и получай % с каждой продажи."},
  t6:{en:"Sell AI-powered solutions to corporations.",        es:"Vende soluciones de IA a grandes corporaciones.",   fr:"Vendez des solutions IA aux grandes entreprises.", de:"Verkaufe KI-Lösungen an Großunternehmen.",       zh:"向大公司出售AI解决方案。",       ja:"AIソリューションを法人向けに販売する。", pt:"Venda soluções de IA para grandes empresas.",   ru:"Продавай ИИ-решения корпорациям."},
  t7:{en:"Host the world's data and charge a premium fee.",   es:"Aloja datos del mundo y cobra una tarifa premium.", fr:"Hébergez les données mondiales et facturez.",     de:"Hoste Weltdaten und berechne eine Premiumgebühr.",zh:"托管全球数据，收取溢价费用。",   ja:"世界のデータをホストしてプレミアム課金。",pt:"Hospede dados mundiais e cobre tarifas premium.",ru:"Храни мировые данные и бери премиум-тариф."},
  b1:{en:"Trade currency differences for daily profit.",      es:"Gana con diferencias de tipo de cambio diarias.",   fr:"Profitez des différences de taux de change.",     de:"Verdiene an täglichen Währungsdifferenzen.",     zh:"通过汇率差赚取日常利润。",       ja:"毎日の為替差益を稼ぐ。",              pt:"Lucre com diferenças diárias nas taxas de câmbio.",ru:"Зарабатывай на курсовых разницах каждый день."},
  b2:{en:"Lend small amounts at high interest rates.",         es:"Presta cantidades pequeñas a alto interés.",        fr:"Prêtez de petites sommes à fort taux d'intérêt.", de:"Verleihe kleine Summen zu hohen Zinsen.",        zh:"以高利率放出小额贷款。",         ja:"高金利で少額融資を行う。",            pt:"Empreste pequenas quantias a altas taxas de juros.",ru:"Давай микрозаймы под высокий процент."},
  b3:{en:"Collect premiums and grow your financial reserves.", es:"Cobra primas de seguro y haz crecer las reservas.", fr:"Collectez des primes et faites croître vos réserves.",de:"Sammle Prämien und baue deine Reserven aus.",    zh:"收取保险费，积累金融储备。",     ja:"保険料を集めて財務準備金を増やす。",   pt:"Colete prêmios e expanda suas reservas.",        ru:"Собирай страховые премии и наращивай резервы."},
  b4:{en:"Bet big on markets and keep all the gains.",         es:"Apuesta fuerte en mercados y quédate las ganancias.",fr:"Pariez gros sur les marchés et gardez les bénéfices.",de:"Setze groß auf Märkte und behalte alle Gewinne.",zh:"大举押注市场，独占所有收益。",   ja:"市場に大きく賭けて全利益を得る。",    pt:"Aposte alto nos mercados e fique com os lucros.",ru:"Делай большие ставки на рынках и забирай прибыль."},
  b5:{en:"Manage and grow the fortunes of the ultra-wealthy.",  es:"Gestiona fortunas de los ultra-ricos.",           fr:"Gérez et faites croître les fortunes des ultra-riches.",de:"Verwalte und vermehre die Vermögen der Super-Reichen.",zh:"管理并增值超级富豪的财富。", ja:"超富裕層の資産を管理・運用する。",    pt:"Gerencie e aumente fortunas dos ultra-ricos.",   ru:"Управляй и приумножай состояния сверхбогатых."},
  b6:{en:"Invest national reserves for massive returns.",       es:"Invierte reservas nacionales para retornos masivos.",fr:"Investissez les réserves nationales massivement.", de:"Investiere Nationalreserven für massive Renditen.",zh:"将国家储备用于大规模投资回报。",ja:"国家準備金を大規模に運用する。",      pt:"Invista reservas nacionais para retornos massivos.",ru:"Инвестируй национальные резервы для огромной прибыли."},
  b7:{en:"Control monetary policy — print money legally.",     es:"Controla la política monetaria — imprime dinero.",  fr:"Contrôlez la politique monétaire légalement.",    de:"Steuere Geldpolitik — drucke legal Geld.",       zh:"控制货币政策，合法印钞。",       ja:"金融政策を支配し、合法的にお金を刷る。",pt:"Controle a política monetária — imprima dinheiro.", ru:"Контролируй монетарную политику — печатай деньги."},
  r1:{en:"Rent out urban parking spaces by the hour.",         es:"Alquila aparcamientos urbanos por horas.",          fr:"Louez des places de parking urbaines à l'heure.",  de:"Vermiete Stadtparkplätze stundenweise.",         zh:"按小时出租城市停车位。",         ja:"都市の駐車場を時間貸しする。",        pt:"Alugue vagas de estacionamento urbanas por hora.", ru:"Сдавай городские парковки в почасовую аренду."},
  r2:{en:"Collect monthly rent from dozens of tenants.",       es:"Cobra alquiler mensual de decenas de inquilinos.",  fr:"Collectez le loyer mensuel de nombreux locataires.",de:"Erhebe Monatsmieten von Dutzenden Mietern.",     zh:"向数十位租户收取月租。",         ja:"多くの入居者から毎月家賃を受け取る。", pt:"Colete aluguel mensal de dezenas de inquilinos.", ru:"Собирай ежемесячную аренду с десятков жильцов."},
  r3:{en:"Earn rent from hundreds of retail stores.",          es:"Cobra alquiler de cientos de tiendas.",             fr:"Percevez le loyer de centaines de boutiques.",    de:"Kassiere Miete von Hunderten von Geschäften.",   zh:"从数百家零售店收取租金。",       ja:"何百もの店舗から賃料を得る。",        pt:"Receba aluguel de centenas de lojas.",            ru:"Получай аренду с сотен магазинов."},
  r4:{en:"Lease premium office space to major corporations.",  es:"Alquila oficinas premium a grandes empresas.",      fr:"Louez des bureaux premium aux grandes entreprises.",de:"Vermiete Premium-Büros an große Unternehmen.",   zh:"向大公司租赁高端办公空间。",     ja:"大企業にプレミアムオフィスを賃貸する。", pt:"Alugue espaços premium para grandes corporações.",ru:"Сдавай премиальные офисы крупным корпорациям."},
  r5:{en:"Maximum prestige — run a 5-star global resort.",     es:"Máximo prestigio — dirige un resort 5 estrellas.",  fr:"Prestige absolu — gérez un resort 5 étoiles.",   de:"Maximales Prestige — führe ein 5-Sterne-Resort.", zh:"最高声誉——运营五星级全球度假村。", ja:"最高の格——5つ星リゾートを経営する。",pt:"Máximo prestígio — gerencie um resort 5 estrelas.",ru:"Максимальный престиж — управляй люкс-курортом."},
};

const STOCK_COMPANIES = [
  { id:"s1",  name:"AeroTech Industries", sector:"Industry",   totalShares:100000, basePrice:12,  volatility:0.04, icon:"✈️" },
  { id:"s2",  name:"GreenSteel Corp",     sector:"Industry",   totalShares:80000,  basePrice:8,   volatility:0.03, icon:"🏗️" },
  { id:"s3",  name:"NovaPharma SA",       sector:"Industry",   totalShares:60000,  basePrice:45,  volatility:0.05, icon:"💉" },
  { id:"s4",  name:"OilMax Global",       sector:"Industry",   totalShares:200000, basePrice:6,   volatility:0.06, icon:"⛽" },
  { id:"s5",  name:"QuantumSoft",         sector:"Technology", totalShares:150000, basePrice:25,  volatility:0.05, icon:"💾" },
  { id:"s6",  name:"DataStream Inc",      sector:"Technology", totalShares:90000,  basePrice:18,  volatility:0.04, icon:"📡" },
  { id:"s7",  name:"CyberVault Systems",  sector:"Technology", totalShares:70000,  basePrice:55,  volatility:0.06, icon:"🔐" },
  { id:"s8",  name:"NeuralLink Labs",     sector:"Technology", totalShares:50000,  basePrice:120, volatility:0.08, icon:"🧠" },
  { id:"s9",  name:"MetaVerse Co",        sector:"Technology", totalShares:300000, basePrice:4,   volatility:0.07, icon:"🥽" },
  { id:"s10", name:"AlphaCapital",        sector:"Finance",    totalShares:100000, basePrice:30,  volatility:0.04, icon:"💰" },
  { id:"s11", name:"GlobalTrust Bank",    sector:"Finance",    totalShares:120000, basePrice:22,  volatility:0.03, icon:"🏦" },
  { id:"s12", name:"CryptoVault AG",      sector:"Finance",    totalShares:500000, basePrice:2,   volatility:0.10, icon:"₿"  },
  { id:"s13", name:"InsureCorp",          sector:"Finance",    totalShares:80000,  basePrice:15,  volatility:0.03, icon:"📋" },
  { id:"s14", name:"RealEstate Global",   sector:"Real Estate",totalShares:60000,  basePrice:80,  volatility:0.03, icon:"🏢" },
  { id:"s15", name:"LuxuryBrand Group",   sector:"Consumer",   totalShares:40000,  basePrice:200, volatility:0.04, icon:"👜" },
  { id:"s16", name:"FoodChain Inc",       sector:"Consumer",   totalShares:200000, basePrice:5,   volatility:0.03, icon:"🍔" },
  { id:"s17", name:"EnergyFuture SA",     sector:"Energy",     totalShares:150000, basePrice:10,  volatility:0.05, icon:"⚡" },
  { id:"s18", name:"SpaceCorp",           sector:"Technology", totalShares:30000,  basePrice:350, volatility:0.09, icon:"🚀" },
];

// ─── CRYPTO MARKET ────────────────────────────────────────────────────────────
const CRYPTOS = [
  { id:"btc",  icon:"₿",  name:"Bitcoin",   symbol:"BTC", basePrice:42000,  volatility:0.08, color:"#f7931a" },
  { id:"eth",  icon:"Ξ",  name:"Ethereum",  symbol:"ETH", basePrice:2800,   volatility:0.10, color:"#627eea" },
  { id:"sol",  icon:"◎",  name:"Solana",    symbol:"SOL", basePrice:110,    volatility:0.13, color:"#9945ff" },
  { id:"doge", icon:"Ð",  name:"Dogecoin",  symbol:"DOGE",basePrice:0.12,   volatility:0.18, color:"#c2a633" },
  { id:"xrp",  icon:"✕",  name:"XRP",       symbol:"XRP", basePrice:0.65,   volatility:0.12, color:"#0085c0" },
  { id:"nexo", icon:"⬡",  name:"NexoCoin",  symbol:"NEXO",basePrice:0.038,  volatility:0.22, color:"#6c36ff" },
];

const CRYPTO_EVENTS = [
  { id:"ce1", impact:+0.35, dur:600,  icon:"🚀", text:{ en:"Institutional whale buys massive BTC position!", es:"¡Una ballena institucional compra una posición masiva de BTC!", fr:"Une baleine institutionnelle achète massivement du BTC!", de:"Institutioneller Wal kauft massiv BTC!", zh:"机构巨鲸大量买入BTC！", ja:"機関投資家の大口BTC購入！", pt:"Baleia institucional compra posição massiva de BTC!", ru:"Институциональный кит скупает BTC!" }, affects:"all" },
  { id:"ce2", impact:-0.28, dur:480,  icon:"🔥", text:{ en:"Major exchange hacked — funds at risk.", es:"Hackeo a un exchange importante — fondos en riesgo.", fr:"Piratage d'un exchange majeur — fonds en danger.", de:"Großer Exchange gehackt — Gelder gefährdet.", zh:"主要交易所遭黑客攻击——资金面临风险。", ja:"主要取引所がハッキング — 資産が危険に。", pt:"Exchange importante hackeada — fundos em risco.", ru:"Крупная биржа взломана — средства под угрозой." }, affects:"all" },
  { id:"ce3", impact:+0.50, dur:900,  icon:"⚡", text:{ en:"Bitcoin halving confirmed — supply shock incoming!", es:"¡Halving de Bitcoin confirmado — shock de oferta inminente!", fr:"Halving Bitcoin confirmé — choc d'offre imminent!", de:"Bitcoin Halving bestätigt — Angebotsschock steht bevor!", zh:"比特币减半确认——供应冲击即将到来！", ja:"ビットコイン半減期確定 — 供給ショック到来！", pt:"Halving do Bitcoin confirmado — choque de oferta chegando!", ru:"Халвинг Bitcoin подтверждён — шок предложения близко!" }, affects:"btc" },
  { id:"ce4", impact:-0.42, dur:720,  icon:"⚖️", text:{ en:"Government announces strict crypto regulation.", es:"El gobierno anuncia regulación estricta de criptos.", fr:"Le gouvernement annonce une régulation stricte des cryptos.", de:"Regierung kündigt strenge Krypto-Regulierung an.", zh:"政府宣布严格的加密货币监管。", ja:"政府が厳格な暗号資産規制を発表。", pt:"Governo anuncia regulamentação rígida de criptos.", ru:"Правительство объявляет о жёстком регулировании крипты." }, affects:"all" },
  { id:"ce5", impact:+0.38, dur:600,  icon:"🌐", text:{ en:"Major nation adopts ETH as legal tender!", es:"¡Una nación importante adopta ETH como moneda de curso legal!", fr:"Une grande nation adopte ETH comme monnaie légale!", de:"Großes Land nimmt ETH als gesetzliches Zahlungsmittel an!", zh:"某大国将ETH纳为法定货币！", ja:"主要国家がETHを法定通貨に採用！", pt:"Grande nação adota ETH como moeda legal!", ru:"Крупное государство принимает ETH как законное средство платежа!" }, affects:"eth" },
  { id:"ce6", impact:+0.60, dur:480,  icon:"🎰", text:{ en:"NexoCoin listed on all major exchanges!", es:"¡NexoCoin cotiza en todos los grandes exchanges!", fr:"NexoCoin listé sur tous les grands échanges!", de:"NexoCoin auf allen großen Börsen gelistet!", zh:"NexoCoin在所有主流交易所上市！", ja:"NexoCoinが全主要取引所に上場！", pt:"NexoCoin listada em todas as grandes exchanges!", ru:"NexoCoin листингован на всех крупных биржах!" }, affects:"nexo" },
  { id:"ce7", impact:-0.35, dur:600,  icon:"📉", text:{ en:"Crypto winter: panic selling sweeps the market.", es:"Invierno cripto: ventas de pánico arrastran el mercado.", fr:"Hiver crypto : ventes panique balayent le marché.", de:"Krypto-Winter: Panikverkäufe fegen den Markt.", zh:"加密寒冬：恐慌抛售席卷市场。", ja:"クリプト冬：パニック売りが市場を席巻。", pt:"Inverno cripto: vendas em pânico varrem o mercado.", ru:"Крипто-зима: паническая продажа охватывает рынок." }, affects:"all" },
  { id:"ce8", impact:+0.45, dur:900,  icon:"💎", text:{ en:"DOGE endorsed by a tech billionaire — to the moon!", es:"¡DOGE respaldado por un multimillonario tech — a la luna!", fr:"DOGE soutenu par un milliardaire tech — vers la lune!", de:"DOGE von Tech-Milliardär unterstützt — zum Mond!", zh:"科技亿万富翁力推DOGE——冲向月球！", ja:"テック億万長者がDOGEを支持 — 月へ！", pt:"DOGE endossado por bilionário tech — rumo à lua!", ru:"DOGE поддержан техническим миллиардером — на луну!" }, affects:"doge" },
];


// ─── GLOBAL MARKET EVENTS ────────────────────────────────────────────────────
const MARKET_EVENTS = [
  { id:"me1", type:"crash",  icon:"💥", dur:600,  stockImpact:-0.40, cryptoImpact:-0.35, bizImpact:0,
    text:{ en:"MARKET CRASH — Panic selling across all sectors!", es:"CRASH DE MERCADO — ¡Venta de pánico en todos los sectores!", fr:"KRACH BOURSIER — Panique généralisée!", de:"MARKTCRASH — Panikverkäufe!", zh:"市场崩盘——各板块恐慌性抛售！", ja:"市場崩壊 — 全セクターでパニック売り！", pt:"CRASH DO MERCADO — Venda de pânico!", ru:"ОБВАЛ РЫНКА — Паника во всех секторах!" } },
  { id:"me2", type:"boom",   icon:"🚀", dur:480,  stockImpact:+0.35, cryptoImpact:+0.25, bizImpact:+0.5,
    text:{ en:"BULL RUN — Tech sector explodes upward!", es:"¡BULL RUN — El sector tech explota al alza!", fr:"BULL RUN — Le secteur tech explose!", de:"BULLENMARKT — Tech-Sektor explodiert!", zh:"牛市来袭——科技板块暴涨！", ja:"強気相場 — テクセクター急騰！", pt:"BULL RUN — Setor tech dispara!", ru:"БЫЧИЙ РЫНОК — Тех-сектор взлетает!" } },
  { id:"me3", type:"crash",  icon:"🛢️", dur:720,  stockImpact:-0.25, cryptoImpact:-0.15, bizImpact:-0.3,
    text:{ en:"OIL CRISIS — Energy prices collapse, markets tremble.", es:"CRISIS DEL PETRÓLEO — Precios energéticos colapsan.", fr:"CRISE PÉTROLIÈRE — Effondrement des prix de l'énergie.", de:"ÖLKRISE — Energiepreise kollabieren.", zh:"石油危机——能源价格崩溃，市场震颤。", ja:"石油危機 — エネルギー価格崩壊。", pt:"CRISE DO PETRÓLEO — Preços de energia colapsam.", ru:"НЕФТЯНОЙ КРИЗИС — Обвал цен на энергоносители." } },
  { id:"me4", type:"boom",   icon:"🌐", dur:540,  stockImpact:+0.28, cryptoImpact:+0.20, bizImpact:+0.4,
    text:{ en:"GLOBAL DEAL — G20 signs historic trade agreement!", es:"¡ACUERDO GLOBAL — El G20 firma tratado histórico!", fr:"ACCORD MONDIAL — Le G20 signe un accord historique!", de:"GLOBALER DEAL — G20 unterzeichnet historisches Abkommen!", zh:"全球协议——G20签署历史性贸易协定！", ja:"グローバル協定 — G20が歴史的合意に署名！", pt:"ACORDO GLOBAL — G20 assina acordo histórico!", ru:"ГЛОБАЛЬНАЯ СДЕЛКА — G20 подписывает соглашение!" } },
  { id:"me5", type:"crash",  icon:"🏦", dur:900,  stockImpact:-0.50, cryptoImpact:-0.45, bizImpact:-0.4,
    text:{ en:"BANK COLLAPSE — Major financial institution insolvent!", es:"¡QUIEBRA BANCARIA — Gran institución financiera insolvente!", fr:"FAILLITE BANCAIRE — Grande institution financière insolvable!", de:"BANKENCRASH — Großes Finanzinstitut insolvent!", zh:"银行倒闭——主要金融机构资不抵债！", ja:"銀行破綻 — 主要金融機関が破綻！", pt:"COLAPSO BANCÁRIO — Grande instituição financeira insolvente!", ru:"БАНКРОТСТВО БАНКА — Крупный финансовый институт банкрот!" } },
  { id:"me6", type:"boom",   icon:"💊", dur:480,  stockImpact:+0.22, cryptoImpact:+0.10, bizImpact:+0.6,
    text:{ en:"PHARMA BREAKTHROUGH — Cure announced, markets surge!", es:"¡AVANCE FARMACÉUTICO — Se anuncia cura, mercados suben!", fr:"PERCÉE PHARMA — Remède annoncé, marchés en hausse!", de:"PHARMA-DURCHBRUCH — Heilmittel angekündigt!", zh:"医药突破——宣布治愈方案，市场大涨！", ja:"製薬突破 — 治療法発表、市場急上昇！", pt:"AVANÇO PHARMA — Cura anunciada, mercados sobem!", ru:"ФАРМА-ПРОРЫВ — Объявлено лечение, рынки растут!" } },
  { id:"me7", type:"crash",  icon:"⚡", dur:600,  stockImpact:-0.30, cryptoImpact:-0.20, bizImpact:-0.2,
    text:{ en:"CYBER ATTACK — Infrastructure breach halts global trading.", es:"CIBERATAQUE — Brecha en infraestructura paraliza trading.", fr:"CYBERATTAQUE — Violation d'infrastructure.", de:"CYBERANGRIFF — Infrastruktur-Hack stoppt Handel.", zh:"网络攻击——基础设施遭攻击，全球交易停摆。", ja:"サイバー攻撃 — インフラ侵害で取引停止。", pt:"ATAQUE CIBERNÉTICO — Violação paralisa negociações.", ru:"КИБЕРАТАКА — Взлом инфраструктуры остановил торги." } },
  { id:"me8", type:"boom",   icon:"🏆", dur:600,  stockImpact:+0.45, cryptoImpact:+0.35, bizImpact:+0.8,
    text:{ en:"GOLDEN ERA — Record employment, record profits!", es:"¡ERA DORADA — Empleo récord, beneficios récord!", fr:"ÈRE DORÉE — Emploi record, profits record!", de:"GOLDENE ÄRA — Rekord-Beschäftigung, Rekord-Gewinne!", zh:"黄金时代——就业和利润双双创纪录！", ja:"黄金時代 — 雇用・利益ともに過去最高！", pt:"ERA DOURADA — Emprego recorde, lucros recorde!", ru:"ЗОЛОТАЯ ЭРА — Рекордная занятость и прибыль!" } },
];


// ─── MANAGERS ─────────────────────────────────────────────────────────────────

const MANAGER_LEVELS = [
  { level:1,  multiplier:1.5,  costFactor:1     },
  { level:2,  multiplier:2.0,  costFactor:5     },
  { level:3,  multiplier:3.0,  costFactor:15    },
  { level:4,  multiplier:4.5,  costFactor:40    },
  { level:5,  multiplier:6.0,  costFactor:100   },
  { level:6,  multiplier:8.0,  costFactor:250   },
  { level:7,  multiplier:11.0, costFactor:600   },
  { level:8,  multiplier:15.0, costFactor:1500  },
  { level:9,  multiplier:20.0, costFactor:4000  },
  { level:10, multiplier:30.0, costFactor:10000 },
];

const MAX_MANAGER_LEVEL = 10;

// Business milestone bonuses: reaching these counts gives x2 to that business
const BIZ_MILESTONES = [10, 25, 50, 100, 200, 300, 500, 1000];
function getBizMilestoneMultiplier(count) {
  let mult = 1;
  for (const m of BIZ_MILESTONES) { if (count >= m) mult *= 2; }
  return mult;
}
function nextMilestone(count) {
  return BIZ_MILESTONES.find(m => m > count) || null;
}

// Prestige requirements and rewards
const PRESTIGE_REQUIREMENTS = [1e9, 10e9, 100e9, 1e12, 10e12, 100e12, 1e15, 10e15, 100e15, 1e18];
function getPrestigeRequirement(currentPrestige) {
  if (currentPrestige < PRESTIGE_REQUIREMENTS.length) return PRESTIGE_REQUIREMENTS[currentPrestige];
  return PRESTIGE_REQUIREMENTS[PRESTIGE_REQUIREMENTS.length - 1] * Math.pow(10, currentPrestige - PRESTIGE_REQUIREMENTS.length + 1);
}
function getPrestigeIncomeMultiplier(prestigeCount) {
  if (prestigeCount === 0) return 1;
  // Each prestige adds 0.5x, compounding
  const mults = [1.5, 2.0, 3.0, 4.0, 5.0, 6.5, 8.0, 10.0, 13.0, 17.0, 22.0, 28.0, 35.0, 45.0, 55.0,
                 70.0, 85.0, 105.0, 130.0, 160.0, 200.0, 250.0, 300.0, 375.0, 450.0, 550.0];
  return mults[Math.min(prestigeCount - 1, mults.length - 1)];
}
function getPrestigeBizCostReduction(prestigeCount) {
  if (prestigeCount >= 5) return 0.8; // 20% cheaper
  return 1.0;
}
function getPrestigeManagerCostReduction(prestigeCount) {
  if (prestigeCount >= 10) return 0.5; // 50% cheaper
  return 1.0;
}
function getPrestigeStartingMoney(prestigeCount) {
  if (prestigeCount >= 25) return 10000;
  return 0;
}
function prestigeUnlocksRealEstate(prestigeCount) {
  return prestigeCount >= 3;
}
function getPrestigeTitle(prestigeCount) {
  if (prestigeCount >= 50) return "👑 Legend";
  if (prestigeCount >= 25) return "🌟 Tycoon Elite";
  if (prestigeCount >= 10) return "💎 Mogul";
  if (prestigeCount >= 5)  return "🔥 Veteran";
  if (prestigeCount >= 3)  return "⭐ Rising";
  if (prestigeCount >= 1)  return "✦ Prestige";
  return "";
}

const MANAGERS_DEF = [
  { bizId:"f1", name:{en:"Mike 'Scrap' Johnson", es:"Miguel 'Chapa' Ruiz",    fr:"Michel 'Ferraille' Dupont",de:"Hans 'Schrott' Müller", zh:"张铁手",     ja:"スクラップの田中",   pt:"Miguel 'Ferro' Santos", ru:"Миша 'Лом' Иванов"},   baseCost:500,    icon:"🦺" },
  { bizId:"f2", name:{en:"Tony Wrench",          es:"Antonio Llave",          fr:"Antoine Clé",              de:"Anton Schrauber",       zh:"李扳手",     ja:"レンチの鈴木",       pt:"Antônio Chave",         ru:"Тони Гаечник"},        baseCost:2000,   icon:"🔩" },
  { bizId:"f3", name:{en:"Clara Threads",        es:"Clara Hilo",             fr:"Claire Fil",               de:"Klara Faden",           zh:"陈丝线",     ja:"スレッドの山田",     pt:"Clara Fio",             ru:"Клара Ниточкина"},     baseCost:8000,   icon:"🧶" },
  { bizId:"f4", name:{en:"Dr. Werner Koch",      es:"Dr. Carlos Mezcla",      fr:"Dr. Pierre Chimie",        de:"Dr. Werner Koch",       zh:"化学博士王", ja:"化学の中村博士",     pt:"Dr. Carlos Mistura",    ru:"Доктор Кох"},          baseCost:30000,  icon:"🥼" },
  { bizId:"f5", name:{en:"James 'Gear' Ford",    es:"Jaime 'Rueda' García",   fr:"Jacques 'Engrenage' Martin",de:"Karl 'Getriebe' Schmidt",zh:"汽车大师刘", ja:"ギアの佐藤",         pt:"James 'Roda' Ford",     ru:"Джеймс Шестерня"},    baseCost:120000, icon:"🚘" },
  { bizId:"f6", name:{en:"Prof. Lisa Chen",      es:"Prof. Ana Química",      fr:"Prof. Marie Pasteur",      de:"Prof. Heike Labor",     zh:"陈教授",     ja:"製薬の木村教授",     pt:"Prof. Ana Química",     ru:"Профессор Лиза"},      baseCost:500000, icon:"👩‍🔬" },
  { bizId:"f7", name:{en:"Rex Barrel Hughes",    es:"Rex Barril López",       fr:"Rex Baril Leblanc",        de:"Rex Fass Wagner",       zh:"石油大亨陈", ja:"バレルのヒューズ",   pt:"Rex Barril Hughes",     ru:"Рекс Бочка Хьюз"},    baseCost:2e6,    icon:"⛽" },
  { bizId:"t1", name:{en:"Blogger Bob",          es:"Bloguero Beto",          fr:"Blogueur Bob",             de:"Blogger Bernd",         zh:"博客小王",   ja:"ブロガーのボブ",     pt:"Blogueiro Bob",         ru:"Блогер Боб"},          baseCost:800,    icon:"✍️" },
  { bizId:"t2", name:{en:"Dev Dana Swift",       es:"Dev Dana Código",        fr:"Dev Dana Code",            de:"Dev Dana Code",         zh:"代码达人Dana",ja:"開発者のダナ",       pt:"Dev Dana Código",       ru:"Дев Дана Свифт"},      baseCost:4000,   icon:"👩‍💻" },
  { bizId:"t3", name:{en:"Marco Clicks",         es:"Marco Clics",            fr:"Marco Cliques",            de:"Marco Klicks",          zh:"营销马可",   ja:"クリックのマルコ",   pt:"Marco Cliques",         ru:"Марко Клики"},         baseCost:20000,  icon:"📊" },
  { bizId:"t4", name:{en:"Sarah Cloud",          es:"Sara Nube",              fr:"Sarah Nuage",              de:"Sarah Wolke",           zh:"云端莎拉",   ja:"クラウドのサラ",     pt:"Sara Nuvem",            ru:"Сара Клауд"},          baseCost:90000,  icon:"☁️" },
  { bizId:"t5", name:{en:"Jeff Warehouse",       es:"Jeff Almacén",           fr:"Jeff Entrepot",            de:"Jeff Lager",            zh:"仓储杰夫",   ja:"倉庫のジェフ",       pt:"Jeff Armazém",          ru:"Джефф Склад"},         baseCost:350000, icon:"📦" },
  { bizId:"t6", name:{en:"ARIA-7 (AI Manager)",  es:"ARIA-7 (Manager IA)",    fr:"ARIA-7 (Manager IA)",      de:"ARIA-7 (KI-Manager)",   zh:"ARIA-7(AI管家)",ja:"ARIA-7(AIマネージャー)",pt:"ARIA-7 (Gerente IA)",  ru:"АРИЯ-7 (ИИ-Менеджер)"},baseCost:1.2e6,  icon:"🤖" },
  { bizId:"t7", name:{en:"Max Bandwidth",        es:"Max Ancho de Banda",     fr:"Max Bande Passante",       de:"Max Bandbreite",        zh:"带宽麦克斯", ja:"帯域のマックス",     pt:"Max Largura de Banda",  ru:"Макс Пропускник"},     baseCost:5e6,    icon:"🌐" },
  { bizId:"b1", name:{en:"Forex Frank",          es:"Franco Divisas",         fr:"François Change",          de:"Franz Devisen",         zh:"外汇弗兰克", ja:"外為のフランク",     pt:"Franco Câmbio",         ru:"Форекс Франк"},        baseCost:3000,   icon:"💱" },
  { bizId:"b2", name:{en:"Penny Lender",         es:"Penélope Crédito",       fr:"Penelope Pret",            de:"Petra Kredit",          zh:"信贷小彭",   ja:"貸付のペニー",       pt:"Penélope Crédito",      ru:"Пенни Кредитор"},      baseCost:15000,  icon:"💵" },
  { bizId:"b3", name:{en:"Victor Risk",          es:"Víctor Riesgo",          fr:"Victor Risque",            de:"Viktor Risiko",         zh:"风控维克多", ja:"リスクのビクター",   pt:"Victor Risco",          ru:"Виктор Риск"},         baseCost:60000,  icon:"🛡️" },
  { bizId:"b4", name:{en:"Hedge Hanna",          es:"Ana Cobertura",          fr:"Hanna Couverture",         de:"Hanna Absicherung",     zh:"对冲汉娜",   ja:"ヘッジのハンナ",     pt:"Ana Cobertura",         ru:"Хедж Ханна"},          baseCost:300000, icon:"📈" },
  { bizId:"b5", name:{en:"Sir Edmund Vault",     es:"Sir Edmundo Caja",       fr:"Sir Edmund Coffre",        de:"Sir Edmund Tresor",     zh:"保险库爵士", ja:"金庫のエドマンド卿", pt:"Sir Edmundo Cofre",     ru:"Сэр Эдмунд Хранилище"},baseCost:1.5e6,  icon:"🏛️" },
  { bizId:"b6", name:{en:"Sovereign Stella",     es:"Estela Soberana",        fr:"Stella Souveraine",        de:"Stella Souveran",       zh:"主权斯特拉", ja:"ソブリンのステラ",   pt:"Estela Soberana",       ru:"Суверен Стелла"},      baseCost:7.5e6,  icon:"🌍" },
  { bizId:"b7", name:{en:"Central Commander",    es:"Comandante Central",     fr:"Commandant Central",       de:"Zentralkommandant",     zh:"中央指挥官", ja:"中央司令官",         pt:"Comandante Central",    ru:"Центральный Командир"},baseCost:40e6,   icon:"🏦" },
];

const REAL_ESTATE_MANAGERS = [
  { bizId:"r1", name:{en:"Pete Parking",       es:"Pedro Parking",      fr:"Pierre Parking",        de:"Peter Parkhaus",     zh:"停车佩特",    ja:"パーキングのピート",  pt:"Pedro Estacionamento", ru:"Пит Паркинг"},    baseCost:25000,  icon:"🅿️" },
  { bizId:"r2", name:{en:"Landlord Larry",      es:"Larry Casero",       fr:"Laurent Proprio",       de:"Lars Vermieter",     zh:"房东拉里",    ja:"大家のラリー",        pt:"Larry Senhorio",       ru:"Лорд Ларри"},     baseCost:200000, icon:"🏠" },
  { bizId:"r3", name:{en:"Mall Manager Maya",   es:"Maya Centro",        fr:"Maya Centre Com.",      de:"Maya Einkauf",       zh:"商场玛雅",    ja:"モール管理のマヤ",    pt:"Maya Shopping",        ru:"Майя Молл"},      baseCost:1.2e6,  icon:"🏬" },
  { bizId:"r4", name:{en:"Corporate Carl",      es:"Carlos Corporativo", fr:"Charles Corporate",     de:"Karl Konzern",       zh:"企业卡尔",    ja:"コーポレートのカール",pt:"Carlos Corporativo",   ru:"Корп. Карл"},     baseCost:10e6,   icon:"🏢" },
  { bizId:"r5", name:{en:"Baroness Beatrice",   es:"Baronesa Beatriz",   fr:"Baronne Béatrice",      de:"Baronin Beatrix",    zh:"比阿特丽斯",  ja:"ビアトリス男爵夫人",  pt:"Baronesa Beatriz",     ru:"Баронесса Б."},   baseCost:100e6,  icon:"🏖️" },
];

function getManagerHireCost(mgr) { return mgr.baseCost; }
function getManagerUpgradeCost(mgr, currentLevel) {
  return Math.floor(mgr.baseCost * MANAGER_LEVELS[Math.min(currentLevel, MAX_MANAGER_LEVEL - 1)].costFactor);
}
function getManagerMultiplier(level) {
  return MANAGER_LEVELS[Math.min(level - 1, MAX_MANAGER_LEVEL - 1)].multiplier;
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

const ACHIEVEMENTS_DEF = [
  { id:"a1",  icon:"💵", name:{en:"First Dollar",       es:"Primer Dólar",        fr:"Premier Dollar",       de:"Erster Dollar",       zh:"第一桶金",   ja:"最初の1ドル",       pt:"Primeiro Dólar",      ru:"Первый доллар"},    desc:{en:"Earn your first $1",                    es:"Gana tu primer $1"},               check: s => s.totalEarned >= 1 },
  { id:"a2",  icon:"🏭", name:{en:"Factory Owner",      es:"Dueño de Fábrica",    fr:"Propriétaire Usine",   de:"Fabrikbesitzer",      zh:"工厂主",     ja:"工場オーナー",      pt:"Dono de Fábrica",     ru:"Владелец завода"},  desc:{en:"Buy your first factory",                es:"Compra tu primera fábrica"},        check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("f")) },
  { id:"a3",  icon:"💻", name:{en:"Tech Pioneer",       es:"Pionero Tech",        fr:"Pionnier Tech",        de:"Tech-Pionier",        zh:"科技先锋",   ja:"テックパイオニア",  pt:"Pioneiro Tech",       ru:"Пионер технологий"},desc:{en:"Buy your first tech business",           es:"Compra tu primer negocio tech"},    check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("t")) },
  { id:"a4",  icon:"🏦", name:{en:"Banker",             es:"Banquero",            fr:"Banquier",             de:"Banker",              zh:"银行家",     ja:"銀行家",            pt:"Banqueiro",           ru:"Банкир"},           desc:{en:"Buy your first finance business",        es:"Compra tu primer negocio financiero"},check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("b")) },
  { id:"a5",  icon:"📈", name:{en:"First Investor",     es:"Primer Inversor",     fr:"Premier Investisseur", de:"Erster Investor",     zh:"初级投资者", ja:"初めての投資家",    pt:"Primeiro Investidor", ru:"Первый инвестор"},  desc:{en:"Buy your first stock",                  es:"Compra tus primeras acciones"},     check: s => Object.values(s.portfolio).some(v=>v>0) },
  { id:"a6",  icon:"💰", name:{en:"Thousandaire",       es:"Millonario de Mil",   fr:"Millionnaire de Mille",de:"Tausendär",           zh:"千元富翁",   ja:"千ドル長者",        pt:"Milionário de Mil",   ru:"Тысячник"},         desc:{en:"Earn $1,000",                            es:"Gana $1.000"},                      check: s => s.totalEarned >= 1000 },
  { id:"a7",  icon:"💎", name:{en:"Millionaire",        es:"Millonario",          fr:"Millionnaire",         de:"Millionär",           zh:"百万富翁",   ja:"ミリオネア",        pt:"Milionário",          ru:"Миллионер"},        desc:{en:"Earn $1,000,000",                        es:"Gana $1.000.000"},                  check: s => s.totalEarned >= 1e6 },
  { id:"a8",  icon:"👑", name:{en:"Billionaire",        es:"Billonario",          fr:"Milliardaire",         de:"Milliardär",          zh:"亿万富翁",   ja:"億万長者",          pt:"Bilionário",          ru:"Миллиардер"},       desc:{en:"Earn $1,000,000,000",                    es:"Gana $1.000.000.000"},              check: s => s.totalEarned >= 1e9 },
  { id:"a9",  icon:"🌍", name:{en:"Trillionaire",       es:"Trillonario",         fr:"Trillionnaire",        de:"Trillionär",          zh:"万亿富翁",   ja:"兆万長者",          pt:"Trilionário",         ru:"Триллионер"},       desc:{en:"Earn $1,000,000,000,000",                es:"Gana $1.000.000.000.000"},          check: s => s.totalEarned >= 1e12 },
  { id:"a10", icon:"🔟", name:{en:"10 Businesses",      es:"10 Negocios",         fr:"10 Entreprises",       de:"10 Unternehmen",      zh:"10家企业",   ja:"10事業",            pt:"10 Empresas",         ru:"10 бизнесов"},      desc:{en:"Own 10 businesses total",               es:"Posee 10 negocios en total"},       check: s => Object.values(s.owned).reduce((a,b)=>a+b,0)>=10 },
  { id:"a11", icon:"💯", name:{en:"100 Businesses",     es:"100 Negocios",        fr:"100 Entreprises",      de:"100 Unternehmen",     zh:"100家企业",  ja:"100事業",           pt:"100 Empresas",        ru:"100 бизнесов"},     desc:{en:"Own 100 businesses total",              es:"Posee 100 negocios en total"},      check: s => Object.values(s.owned).reduce((a,b)=>a+b,0)>=100 },
  { id:"a12", icon:"🤝", name:{en:"First Acquisition",  es:"Primera Adquisición", fr:"Premiere Acquisition", de:"Erste Übernahme",     zh:"首次收购",   ja:"初めての買収",      pt:"Primeira Aquisição",  ru:"Первое поглощение"},desc:{en:"Acquire 100% of a listed company",       es:"Adquiere el 100% de una empresa"},  check: s => s.stocks.some(st=>(s.portfolio[st.id]||0)>=st.totalShares) },
  { id:"a13", icon:"🏆", name:{en:"Stock Mogul",        es:"Magnate Bursátil",    fr:"Magnat Boursier",      de:"Börsenmogul",         zh:"股市大亨",   ja:"株式大物",          pt:"Magnata da Bolsa",    ru:"Биржевой магнат"},  desc:{en:"Acquire 5 companies at 100%",           es:"Adquiere 5 empresas al 100%"},      check: s => s.stocks.filter(st=>(s.portfolio[st.id]||0)>=st.totalShares).length>=5 },
  { id:"a14", icon:"⚡", name:{en:"Speed Clicker",      es:"Clicker Veloz",       fr:"Cliqueur Rapide",      de:"Schnellklicker",      zh:"快速点击者", ja:"スピードクリッカー", pt:"Clicador Veloz",      ru:"Быстрый кликер"},   desc:{en:"Click 100 times",                       es:"Haz 100 clicks"},                   check: s => s.totalClicks>=100 },
  { id:"a15", icon:"🖱️", name:{en:"Click Master",      es:"Maestro del Click",   fr:"Maitre du Clic",       de:"Klick-Meister",       zh:"点击大师",   ja:"クリックマスター",  pt:"Mestre do Clique",    ru:"Мастер кликов"},    desc:{en:"Click 1,000 times",                     es:"Haz 1.000 clicks"},                 check: s => s.totalClicks>=1000 },
  { id:"a16", icon:"✨", name:{en:"First Prestige",     es:"Primer Prestige",     fr:"Premier Prestige",     de:"Erstes Prestige",     zh:"初次声望",   ja:"初めてのプレステージ",pt:"Primeiro Prestígio", ru:"Первый престиж"},   desc:{en:"Complete your first Prestige",          es:"Completa tu primer Prestige"},      check: s => s.prestige>=1 },
  { id:"a17", icon:"🌟", name:{en:"Prestige Master",   es:"Maestro del Prestige",fr:"Maitre du Prestige",   de:"Prestige-Meister",    zh:"声望大师",   ja:"プレステージマスター",pt:"Mestre do Prestígio", ru:"Мастер престижа"},  desc:{en:"Reach Prestige 5",                      es:"Alcanza Prestige 5"},               check: s => s.prestige>=5 },
  { id:"a18", icon:"📊", name:{en:"All Upgrades",      es:"Todas las Mejoras",   fr:"Toutes les Ameliorations",de:"Alle Verbesserungen",zh:"全部升级",   ja:"全アップグレード",  pt:"Todas as Melhorias",  ru:"Все улучшения"},     desc:{en:"Buy all available upgrades",            es:"Compra todas las mejoras"},         check: s => s.upgrades.every(u=>u.bought) },
  { id:"a19", icon:"🎯", name:{en:"Diversified",       es:"Diversificado",       fr:"Diversifié",           de:"Diversifiziert",      zh:"多元化",     ja:"多角化",            pt:"Diversificado",       ru:"Диверсифицированный"},desc:{en:"Own at least 1 business in each sector",es:"Posee al menos 1 negocio en cada sector"},check: s=>["f","t","b"].every(p=>Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith(p))) },
  { id:"a20", icon:"🌐", name:{en:"World Domination",  es:"Dominación Mundial",  fr:"Domination Mondiale",  de:"Weltbeherrschung",    zh:"世界统治",   ja:"世界征服",          pt:"Dominação Mundial",   ru:"Мировое господство"},desc:{en:"Acquire all 18 listed companies",        es:"Adquiere las 18 empresas cotizadas"},check: s => s.stocks.every(st=>(s.portfolio[st.id]||0)>=st.totalShares) },
  { id:"a21", icon:"👔", name:{en:"First Manager",     es:"Primer Manager",      fr:"Premier Manager",      de:"Erster Manager",      zh:"第一位管理者",ja:"初めてのマネージャー",pt:"Primeiro Gerente",   ru:"Первый менеджер"},  desc:{en:"Hire your first manager",               es:"Contrata tu primer manager"},       check: s => Object.values(s.managers||{}).some(v=>v>0) },
  { id:"a22", icon:"🏢", name:{en:"Full Staff",        es:"Plantilla Completa",  fr:"Personnel Complet",    de:"Vollständiges Team",  zh:"满员",       ja:"フルスタッフ",      pt:"Equipe Completa",     ru:"Полный штат"},      desc:{en:"Hire managers for all your businesses", es:"Contrata managers para todos"},     check: s => BUSINESSES.filter(b=>(s.owned[b.id]||0)>0).every(b=>(s.managers||{})[b.id]>0) },
  { id:"a23", icon:"⭐", name:{en:"Top Management",    es:"Alta Dirección",      fr:"Direction Generale",   de:"Top-Management",      zh:"顶级管理",   ja:"トップマネジメント",pt:"Alta Gestão",         ru:"Топ-менеджмент"},   desc:{en:"Upgrade any manager to level 5",        es:"Mejora cualquier manager al nivel 5"},check: s => Object.values(s.managers||{}).some(v=>v>=5) },
  // ── New achievements ──
  { id:"a24", icon:"🎰", name:{en:"Lucky Break",       es:"Golpe de Suerte",     fr:"Coup de Chance",       de:"Glücksschlag",        zh:"幸运一击",   ja:"ラッキーブレーク",  pt:"Golpe de Sorte",      ru:"Счастливый шанс"},   desc:{en:"Win anything at the casino",            es:"Gana algo en el casino"},            check: s => (s.totalCasinoWon||0) >= 1 },
  { id:"a25", icon:"🃏", name:{en:"Card Sharp",        es:"Maestro de Cartas",   fr:"Expert en Cartes",     de:"Kartenprofi",         zh:"纸牌高手",   ja:"カードシャープ",    pt:"Mestre de Cartas",    ru:"Карточный мастер"},  desc:{en:"Win 10 blackjack hands",                es:"Gana 10 manos de blackjack"},        check: s => (s.totalBjWins||0) >= 10 },
  { id:"a26", icon:"💸", name:{en:"High Roller",       es:"Gran Apostador",      fr:"Grand Joueur",         de:"Hocheinsatz-Spieler", zh:"豪赌者",     ja:"ハイローラー",      pt:"Apostador Alto",      ru:"Высокий ставщик"},   desc:{en:"Win $10,000 at the casino",             es:"Gana $10.000 en el casino"},         check: s => (s.totalCasinoWon||0) >= 10000 },
  { id:"a27", icon:"🏅", name:{en:"Casino King",       es:"Rey del Casino",      fr:"Roi du Casino",        de:"Casino-König",        zh:"赌场之王",   ja:"カジノキング",      pt:"Rei do Cassino",      ru:"Король казино"},     desc:{en:"Win $1,000,000 at the casino",          es:"Gana $1.000.000 en el casino"},      check: s => (s.totalCasinoWon||0) >= 1e6 },
  { id:"a28", icon:"🖱️", name:{en:"Click Maniac",     es:"Maníaco del Click",   fr:"Maniaque du Clic",     de:"Klick-Maniak",        zh:"点击狂人",   ja:"クリックマニア",    pt:"Maníaco do Clique",   ru:"Кликомания"},        desc:{en:"Click 10,000 times",                    es:"Haz 10.000 clicks"},                check: s => (s.totalClicks||0) >= 10000 },
  { id:"a29", icon:"🔥", name:{en:"Click Legend",      es:"Leyenda del Click",   fr:"Légende du Clic",      de:"Klick-Legende",       zh:"点击传奇",   ja:"クリックレジェンド",pt:"Lenda do Clique",     ru:"Легенда кликов"},    desc:{en:"Click 100,000 times",                   es:"Haz 100.000 clicks"},               check: s => (s.totalClicks||0) >= 100000 },
  { id:"a30", icon:"🏗️", name:{en:"500 Businesses",   es:"500 Negocios",        fr:"500 Entreprises",      de:"500 Unternehmen",     zh:"500家企业",  ja:"500事業",           pt:"500 Empresas",        ru:"500 бизнесов"},      desc:{en:"Own 500 businesses total",              es:"Posee 500 negocios en total"},       check: s => Object.values(s.owned).reduce((a,b)=>a+b,0) >= 500 },
  { id:"a31", icon:"🌆", name:{en:"1000 Businesses",  es:"1000 Negocios",       fr:"1000 Entreprises",     de:"1000 Unternehmen",    zh:"1000家企业", ja:"1000事業",          pt:"1000 Empresas",       ru:"1000 бизнесов"},     desc:{en:"Own 1,000 businesses total",            es:"Posee 1.000 negocios en total"},     check: s => Object.values(s.owned).reduce((a,b)=>a+b,0) >= 1000 },
  { id:"a32", icon:"🤵", name:{en:"Full Team",         es:"Equipo Completo",     fr:"Équipe Complète",      de:"Vollständiges Team",  zh:"满员团队",   ja:"フルチーム",        pt:"Equipe Completa",     ru:"Полная команда"},    desc:{en:"Hire 10 different managers",            es:"Contrata 10 managers distintos"},    check: s => Object.values(s.managers||{}).filter(v=>v>0).length >= 10 },
  { id:"a33", icon:"🎖️", name:{en:"Manager Max",      es:"Manager al Máximo",   fr:"Manager au Maximum",   de:"Manager-Maximum",     zh:"顶级经理",   ja:"マネージャーMAX",   pt:"Gerente Máximo",      ru:"Максимум менеджера"},desc:{en:"Max out any manager to level 10",        es:"Lleva cualquier manager al nivel 10"},check: s => Object.values(s.managers||{}).some(v=>v>=10) },
  { id:"a34", icon:"✦",  name:{en:"Prestige X",       es:"Prestige X",          fr:"Prestige X",           de:"Prestige X",          zh:"声望十",     ja:"プレステージX",     pt:"Prestígio X",         ru:"Престиж X"},         desc:{en:"Reach Prestige 10",                     es:"Alcanza Prestige 10"},               check: s => (s.prestige||0) >= 10 },
  { id:"a35", icon:"👑", name:{en:"Living Legend",    es:"Leyenda Viva",         fr:"Légende Vivante",      de:"Lebende Legende",     zh:"活着的传奇", ja:"生きる伝説",        pt:"Lenda Viva",          ru:"Живая легенда"},     desc:{en:"Reach Prestige 25",                     es:"Alcanza Prestige 25"},               check: s => (s.prestige||0) >= 25 },
  { id:"a36", icon:"🌴", name:{en:"Real Estate Baron",es:"Barón Inmobiliario",   fr:"Baron de l'Immobilier",de:"Immobilien-Baron",    zh:"房地产大亨", ja:"不動産男爵",        pt:"Barão Imobiliário",   ru:"Барон недвижимости"},desc:{en:"Buy your first real estate business",   es:"Compra tu primer negocio inmobiliario"},check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("r")) },
  { id:"a37", icon:"🌐", name:{en:"All Sectors",      es:"Todos los Sectores",  fr:"Tous les Secteurs",    de:"Alle Sektoren",       zh:"全行业",     ja:"全セクター",        pt:"Todos os Setores",    ru:"Все секторы"},       desc:{en:"Own businesses in all 4 sectors",       es:"Posee negocios en los 4 sectores"},  check: s => ["f","t","b","r"].every(p=>Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith(p))) },
  { id:"a38", icon:"🂡",  name:{en:"Blackjack Master", es:"Maestro del Blackjack",fr:"Maître du Blackjack",  de:"Blackjack-Meister",   zh:"21点大师",   ja:"ブラックジャックマスター",pt:"Mestre do Blackjack",ru:"Мастер блэкджека"}, desc:{en:"Win 50 blackjack hands",               es:"Gana 50 manos de blackjack"},        check: s => (s.totalBjWins||0) >= 50 },
];


// ─── NEWS SYSTEM ─────────────────────────────────────────────────────────────

// Each news item: { text (per lang), stockId, impact (+/- 0.05 to 0.25) }
const NEWS_POOL = [
  { text:{en:"AeroTech wins $2B defense contract 🚀",          es:"AeroTech gana contrato de defensa de $2B 🚀",     fr:"AeroTech remporte un contrat de défense de 2B$ 🚀", de:"AeroTech gewinnt 2B$-Verteidigungsvertrag 🚀",  zh:"AeroTech赢得20亿美元国防合同 🚀",  ja:"AeroTechが20億ドルの防衛契約を獲得 🚀",  pt:"AeroTech vence contrato de defesa de $2B 🚀",  ru:"AeroTech выигрывает контракт на $2B 🚀"},  stockId:"s1",  impact:+0.18 },
  { text:{en:"AeroTech faces safety investigation ⚠️",         es:"AeroTech enfrenta investigación de seguridad ⚠️",  fr:"AeroTech sous enquête de sécurité ⚠️",             de:"AeroTech unter Sicherheitsuntersuchung ⚠️",    zh:"AeroTech面临安全调查 ⚠️",           ja:"AeroTechが安全調査に直面 ⚠️",           pt:"AeroTech enfrenta investigação de segurança ⚠️",ru:"AeroTech под следствием ⚠️"},              stockId:"s1",  impact:-0.15 },
  { text:{en:"GreenSteel wins EU green initiative grant 🌿",    es:"GreenSteel recibe subvención verde de la UE 🌿",   fr:"GreenSteel reçoit une subvention verte de l'UE 🌿",de:"GreenSteel erhält EU-Grünsubvention 🌿",        zh:"GreenSteel获得欧盟绿色补贴 🌿",     ja:"GreenSteelがEUグリーン補助金を獲得 🌿",  pt:"GreenSteel recebe subsídio verde da UE 🌿",    ru:"GreenSteel получает грант ЕС 🌿"},         stockId:"s2",  impact:+0.14 },
  { text:{en:"Steel prices collapse on China oversupply 📉",    es:"Precios del acero colapsan por exceso chino 📉",   fr:"Prix de l'acier en chute libre 📉",                de:"Stahlpreise brechen ein 📉",                    zh:"中国产能过剩导致钢铁价格崩溃 📉",   ja:"中国の過剰供給で鉄鋼価格が崩壊 📉",       pt:"Preços do aço colapsam com excesso chinês 📉", ru:"Цены на сталь рухнули 📉"},               stockId:"s2",  impact:-0.20 },
  { text:{en:"NovaPharma FDA approval for blockbuster drug 💊", es:"NovaPharma recibe aprobación FDA 💊",              fr:"NovaPharma approuvée par la FDA 💊",               de:"NovaPharma erhält FDA-Zulassung 💊",            zh:"NovaPharma获得FDA批准 💊",           ja:"NovaPharmaがFDA承認を取得 💊",            pt:"NovaPharma aprovada pelo FDA 💊",              ru:"NovaPharma одобрена FDA 💊"},             stockId:"s3",  impact:+0.25 },
  { text:{en:"NovaPharma drug recall hits profits hard 🚨",     es:"Recall de NovaPharma golpea beneficios 🚨",        fr:"Rappel de médicament NovaPharma 🚨",               de:"NovaPharma-Rückruf belastet Gewinne 🚨",        zh:"NovaPharma药品召回重创利润 🚨",      ja:"NovaPharmaの薬品回収が利益を直撃 🚨",     pt:"Recall de NovaPharma impacta lucros 🚨",       ru:"Отзыв препарата NovaPharma 🚨"},          stockId:"s3",  impact:-0.22 },
  { text:{en:"OilMax profits surge on supply crunch ⛽",        es:"OilMax dispara beneficios por escasez ⛽",         fr:"OilMax profite de la pénurie d'approvisionnement ⛽",de:"OilMax profitiert von Lieferengpässen ⛽",    zh:"供应短缺推动OilMax利润飙升 ⛽",      ja:"供給不足でOilMaxの利益が急増 ⛽",          pt:"OilMax lucra com crise de oferta ⛽",          ru:"OilMax выигрывает от дефицита ⛽"},        stockId:"s4",  impact:+0.20 },
  { text:{en:"OPEC+ increases oil output, prices plunge 🛢️",   es:"OPEC+ aumenta producción, precios caen 🛢️",       fr:"OPEP+ augmente la production, prix en baisse 🛢️", de:"OPEC+ erhöht Produktion, Preise fallen 🛢️",    zh:"OPEC+增产，油价暴跌 🛢️",            ja:"OPEC+が増産、価格急落 🛢️",               pt:"OPEC+ aumenta produção, preços despencam 🛢️", ru:"ОПЕК+ увеличивает добычу, цены падают 🛢️"},  stockId:"s4",  impact:-0.18 },
  { text:{en:"QuantumSoft launches revolutionary OS 💾",        es:"QuantumSoft lanza SO revolucionario 💾",           fr:"QuantumSoft lance un OS révolutionnaire 💾",       de:"QuantumSoft bringt revolutionäres OS 💾",       zh:"QuantumSoft发布革命性操作系统 💾",   ja:"QuantumSoftが革命的なOSをリリース 💾",    pt:"QuantumSoft lança SO revolucionário 💾",       ru:"QuantumSoft выпускает революционную ОС 💾"}, stockId:"s5",  impact:+0.22 },
  { text:{en:"QuantumSoft hit by massive data breach 🔓",       es:"QuantumSoft sufre brecha de datos masiva 🔓",      fr:"QuantumSoft victime d'une faille massive 🔓",      de:"QuantumSoft von massivem Datenleck getroffen 🔓",zh:"QuantumSoft遭遇大规模数据泄露 🔓",  ja:"QuantumSoftが大規模情報漏洩に遭遇 🔓",    pt:"QuantumSoft sofre grande vazamento de dados 🔓",ru:"QuantumSoft пострадал от утечки данных 🔓"}, stockId:"s5",  impact:-0.19 },
  { text:{en:"DataStream signs deal with 50 governments 📡",    es:"DataStream firma acuerdo con 50 gobiernos 📡",     fr:"DataStream signe avec 50 gouvernements 📡",        de:"DataStream schließt Deals mit 50 Regierungen 📡",zh:"DataStream与50国政府签约 📡",        ja:"DataStreamが50カ国政府と契約 📡",          pt:"DataStream assina contrato com 50 governos 📡",ru:"DataStream подписывает соглашения с 50 правительствами 📡"}, stockId:"s6", impact:+0.16 },
  { text:{en:"CyberVault stops global ransomware attack 🔐",    es:"CyberVault detiene ataque de ransomware 🔐",       fr:"CyberVault arrête une attaque ransomware 🔐",      de:"CyberVault stoppt globalen Ransomware-Angriff 🔐",zh:"CyberVault阻止全球勒索软件攻击 🔐", ja:"CyberVaultがランサムウェア攻撃を阻止 🔐",  pt:"CyberVault detém ataque ransomware global 🔐", ru:"CyberVault останавливает атаку 🔐"},      stockId:"s7",  impact:+0.21 },
  { text:{en:"NeuralLink Labs achieves AGI breakthrough 🧠",    es:"NeuralLink Labs logra avance en AGI 🧠",           fr:"NeuralLink Labs réalise une percée AGI 🧠",        de:"NeuralLink Labs erzielt AGI-Durchbruch 🧠",     zh:"NeuralLink Labs实现AGI突破 🧠",      ja:"NeuralLink LabsがAGIのブレークスルーを達成 🧠",pt:"NeuralLink Labs conquista avanço AGI 🧠",    ru:"NeuralLink Labs достигает прорыва в AGI 🧠"}, stockId:"s8",  impact:+0.30 },
  { text:{en:"NeuralLink Labs EU regulatory block 🚫",          es:"NeuralLink Labs bloqueada por reguladores EU 🚫",  fr:"NeuralLink Labs bloquée par l'UE 🚫",              de:"NeuralLink Labs von EU blockiert 🚫",            zh:"NeuralLink Labs被欧盟监管机构封锁 🚫",ja:"NeuralLink LabsがEUの規制で封鎖 🚫",       pt:"NeuralLink Labs bloqueada pela UE 🚫",         ru:"NeuralLink Labs заблокирована ЕС 🚫"},    stockId:"s8",  impact:-0.25 },
  { text:{en:"MetaVerse Co. reaches 1B daily users 🥽",         es:"MetaVerse Co. alcanza 1B usuarios diarios 🥽",     fr:"MetaVerse Co. atteint 1 milliard d'utilisateurs 🥽",de:"MetaVerse Co. erreicht 1B tägl. Nutzer 🥽",   zh:"MetaVerse Co.日活用户达10亿 🥽",     ja:"MetaVerse Co.が1日10億ユーザー達成 🥽",    pt:"MetaVerse Co. atinge 1B usuários diários 🥽",  ru:"MetaVerse Co. достигает 1B пользователей 🥽"}, stockId:"s9", impact:+0.20 },
  { text:{en:"AlphaCapital under SEC investigation 💰",         es:"AlphaCapital bajo investigación de la SEC 💰",     fr:"AlphaCapital sous enquête de la SEC 💰",           de:"AlphaCapital unter SEC-Untersuchung 💰",        zh:"AlphaCapital受到SEC调查 💰",         ja:"AlphaCapitalがSECの調査下に 💰",           pt:"AlphaCapital sob investigação da SEC 💰",      ru:"AlphaCapital под следствием SEC 💰"},      stockId:"s10", impact:-0.17 },
  { text:{en:"GlobalTrust Bank raises dividend 12% 🏦",         es:"GlobalTrust Bank sube dividendo 12% 🏦",           fr:"GlobalTrust Bank augmente son dividende de 12% 🏦",de:"GlobalTrust Bank erhöht Dividende um 12% 🏦",  zh:"GlobalTrust Bank提高股息12% 🏦",     ja:"GlobalTrust Bankが配当を12%引上げ 🏦",     pt:"GlobalTrust Bank eleva dividendo 12% 🏦",      ru:"GlobalTrust Bank повышает дивиденды на 12% 🏦"}, stockId:"s11", impact:+0.13 },
  { text:{en:"CryptoVault AG exchange hacked, $500M stolen ₿",  es:"CryptoVault AG hackeada, $500M robados ₿",        fr:"CryptoVault AG piratée, 500M$ volés ₿",           de:"CryptoVault AG gehackt, $500M gestohlen ₿",    zh:"CryptoVault AG遭黑客攻击，5亿美元被盗 ₿",ja:"CryptoVault AGがハッキング被害、5億ドル盗難 ₿",pt:"CryptoVault AG hackeada, $500M roubados ₿", ru:"CryptoVault AG взломан, $500M украдено ₿"},  stockId:"s12", impact:-0.35 },
  { text:{en:"CryptoVault AG listed on NYSE ₿",                 es:"CryptoVault AG cotiza en NYSE ₿",                 fr:"CryptoVault AG cotée au NYSE ₿",                  de:"CryptoVault AG an der NYSE gelistet ₿",         zh:"CryptoVault AG在纽交所上市 ₿",       ja:"CryptoVault AGがニューヨーク証券取引所に上場 ₿",pt:"CryptoVault AG listada na NYSE ₿",          ru:"CryptoVault AG листингуется на NYSE ₿"},  stockId:"s12", impact:+0.30 },
  { text:{en:"RealEstate Global acquires Manhattan block 🏢",    es:"RealEstate Global adquiere manzana en Manhattan 🏢",fr:"RealEstate Global acquiert Manhattan 🏢",         de:"RealEstate Global kauft Manhattan-Block 🏢",    zh:"RealEstate Global收购曼哈顿街区 🏢", ja:"RealEstate Globalがマンハッタンブロックを取得 🏢",pt:"RealEstate Global adquire bloco em Manhattan 🏢",ru:"RealEstate Global покупает Манхэттен 🏢"},stockId:"s14", impact:+0.16 },
  { text:{en:"LuxuryBrand Group opens 200 new stores 👜",        es:"LuxuryBrand Group abre 200 nuevas tiendas 👜",     fr:"LuxuryBrand Group ouvre 200 nouveaux magasins 👜",de:"LuxuryBrand Group eröffnet 200 Filialen 👜",   zh:"LuxuryBrand Group新开200家店 👜",    ja:"LuxuryBrand Groupが200店舗を新規開店 👜",  pt:"LuxuryBrand Group abre 200 novas lojas 👜",    ru:"LuxuryBrand Group открывает 200 магазинов 👜"}, stockId:"s15", impact:+0.15 },
  { text:{en:"EnergyFuture SA wins solar megaproject ⚡",        es:"EnergyFuture SA gana megaproyecto solar ⚡",       fr:"EnergyFuture SA remporte un méga-projet solaire ⚡",de:"EnergyFuture SA gewinnt Solargroßprojekt ⚡",  zh:"EnergyFuture SA赢得太阳能大型项目 ⚡", ja:"EnergyFuture SAが太陽光発電メガプロジェクトを獲得 ⚡",pt:"EnergyFuture SA ganha megaprojeto solar ⚡", ru:"EnergyFuture SA выигрывает солнечный мегапроект ⚡"}, stockId:"s17", impact:+0.19 },
  { text:{en:"SpaceCorp successfully lands on Mars 🚀",          es:"SpaceCorp aterriza con éxito en Marte 🚀",         fr:"SpaceCorp atterrit avec succès sur Mars 🚀",       de:"SpaceCorp landet erfolgreich auf dem Mars 🚀",  zh:"SpaceCorp成功登陆火星 🚀",           ja:"SpaceCorpが火星着陸に成功 🚀",             pt:"SpaceCorp pousa com sucesso em Marte 🚀",      ru:"SpaceCorp успешно садится на Марс 🚀"},   stockId:"s18", impact:+0.35 },
  { text:{en:"SpaceCorp rocket explodes on launch pad 💥",       es:"Cohete de SpaceCorp explota en plataforma 💥",     fr:"Fusée SpaceCorp explose sur le pas de tir 💥",    de:"SpaceCorp-Rakete explodiert auf Startrampe 💥", zh:"SpaceCorp火箭在发射台爆炸 💥",       ja:"SpaceCorpのロケットが発射台で爆発 💥",      pt:"Foguete SpaceCorp explode na plataforma 💥",   ru:"Ракета SpaceCorp взрывается на стартовой площадке 💥"}, stockId:"s18", impact:-0.30 },
  // Generic market news
  { text:{en:"Fed raises interest rates 0.5% 📊",               es:"La Fed sube tipos de interés 0.5% 📊",             fr:"La Fed augmente ses taux de 0,5% 📊",             de:"Fed erhöht Zinsen um 0,5% 📊",                  zh:"美联储加息0.5% 📊",                  ja:"FRBが金利を0.5%引き上げ 📊",               pt:"Fed eleva taxa de juros em 0,5% 📊",           ru:"ФРС повышает ставку на 0,5% 📊"},         stockId:null,  impact:-0.08 },
  { text:{en:"Global markets hit all-time high 📈",             es:"Mercados globales alcanzan máximos históricos 📈",  fr:"Les marchés mondiaux atteignent un record 📈",    de:"Weltmärkte erreichen Allzeithoch 📈",            zh:"全球市场创历史新高 📈",               ja:"世界市場が史上最高値を記録 📈",             pt:"Mercados globais atingem máxima histórica 📈",  ru:"Мировые рынки достигают рекорда 📈"},     stockId:null,  impact:+0.06 },
  { text:{en:"Recession fears grip global markets 😱",          es:"Miedo a recesión golpea mercados globales 😱",     fr:"La crainte d'une récession secoue les marchés 😱",de:"Rezessionsangst erschüttert Märkte 😱",          zh:"全球市场笼罩衰退恐慌 😱",             ja:"景気後退懸念が世界市場を揺るがす 😱",       pt:"Medo de recessão abala mercados globais 😱",   ru:"Страхи рецессии охватывают рынки 😱"},    stockId:null,  impact:-0.10 },
  { text:{en:"Inflation drops to 2%, markets rally 🎉",         es:"Inflación cae al 2%, mercados suben 🎉",           fr:"L'inflation tombe à 2%, les marchés rebondissent 🎉",de:"Inflation fällt auf 2%, Märkte steigen 🎉",    zh:"通胀降至2%，市场大涨 🎉",             ja:"インフレ2%に低下、市場が急騰 🎉",           pt:"Inflação cai para 2%, mercados sobem 🎉",      ru:"Инфляция падает до 2%, рынки растут 🎉"}, stockId:null,  impact:+0.09 },
  { text:{en:"Surprise G20 stimulus package announced 💵",       es:"Paquete de estímulo del G20 sorprende 💵",         fr:"Le G20 annonce un plan de relance surprise 💵",     de:"G20-Konjunkturpaket überrascht Märkte 💵",      zh:"G20意外宣布刺激计划 💵",              ja:"G20が予期せぬ景気刺激策を発表 💵",          pt:"Pacote de estímulo do G20 surpreende 💵",      ru:"Внезапный пакет стимулов G20 💵"},        stockId:null,  impact:+0.12 },
  { text:{en:"Global supply chain crisis hits all sectors ⛓️",   es:"Crisis de cadena de suministro golpea todo ⛓️",    fr:"Crise de la chaîne d'approvisionnement mondiale ⛓️",de:"Globale Lieferkettenkrise trifft alle Sektoren ⛓️",zh:"全球供应链危机冲击各行业 ⛓️",         ja:"グローバルサプライチェーン危機が全セクターに打撃 ⛓️",pt:"Crise global da cadeia de suprimentos ⛓️",  ru:"Глобальный кризис цепочки поставок ⛓️"},  stockId:null,  impact:-0.13 },
  { text:{en:"Sovereign wealth funds pour $500B into equities 📥",es:"Fondos soberanos invierten $500B en bolsa 📥",      fr:"Les fonds souverains investissent 500B$ en actions 📥",de:"Staatsfonds investieren 500B$ in Aktien 📥",   zh:"主权财富基金投入5000亿美元入股 📥",       ja:"ソブリン・ウェルス・ファンドが5000億ドルを株式に注入 📥",pt:"Fundos soberanos investem $500B em ações 📥",ru:"Суверенные фонды вливают $500B в акции 📥"}, stockId:null, impact:+0.11 },
  { text:{en:"Cyberattack downs global banking infrastructure 💻", es:"Ciberataque paraliza la banca mundial 💻",         fr:"Cyberattaque mondiale contre les banques 💻",       de:"Cyberangriff legt globale Bankeninfrastruktur lahm 💻",zh:"网络攻击瘫痪全球银行基础设施 💻",    ja:"サイバー攻撃が世界の銀行インフラをダウン 💻",   pt:"Ciberataque derruba infraestrutura bancária 💻",ru:"Кибератака парализует банковскую инфраструктуру 💻"}, stockId:null, impact:-0.14 },
  { text:{en:"AI productivity boom lifts all tech stocks 🤖",     es:"Boom de productividad IA dispara tecnología 🤖",   fr:"Le boom de l'IA propulse toutes les valeurs tech 🤖",de:"KI-Produktivitätsboom hebt Tech-Aktien 🤖",    zh:"AI生产力繁荣提振科技股 🤖",            ja:"AI生産性ブームが全テクノロジー株を押し上げ 🤖",  pt:"Boom de produtividade de IA eleva tecnologia 🤖",ru:"Бум производительности ИИ поднимает все технологии 🤖"}, stockId:"s5", impact:+0.20 },
  { text:{en:"Record heatwave disrupts energy and industry 🌡️",   es:"Ola de calor récord afecta energía e industria 🌡️",fr:"Vague de chaleur record perturbe énergie et industrie 🌡️",de:"Rekord-Hitzewelle stört Energie und Industrie 🌡️",zh:"破纪录热浪冲击能源和工业 🌡️",       ja:"記録的な熱波がエネルギーと工業に打撃 🌡️",      pt:"Onda de calor recorde afeta energia e indústria 🌡️",ru:"Рекордная жара нарушает энергетику и промышленность 🌡️"}, stockId:"s4", impact:-0.11 },
];

const NEWS_INTERVAL_MS = 90000; // new headline every 90 seconds


// ─── MISSIONS ────────────────────────────────────────────────────────────────

const PROGRESS_MISSIONS = [
  { id:"pm1",  icon:"🏭", name:{en:"First Factory",       es:"Primera Fábrica",       fr:"Première Usine",        de:"Erste Fabrik",         zh:"第一家工厂",   ja:"最初の工場"},       desc:{en:"Buy your first factory",              es:"Compra tu primera fábrica"},             check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("f")),         reward:{type:"money", amount:500} },
  { id:"pm2",  icon:"💻", name:{en:"Tech Visionary",      es:"Visionario Tech",       fr:"Visionnaire Tech",      de:"Tech-Visionär",        zh:"科技先锋",     ja:"テックビジョナリー"}, desc:{en:"Buy your first tech business",         es:"Compra tu primer negocio tech"},          check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("t")),         reward:{type:"money", amount:800} },
  { id:"pm3",  icon:"🏦", name:{en:"Money Moves",         es:"Movimientos de Dinero", fr:"Mouvements d'Argent",   de:"Geldbewegungen",       zh:"金融大佬",     ja:"マネームーブ"},      desc:{en:"Buy your first finance business",      es:"Compra tu primer negocio financiero"},    check: s => Object.entries(s.owned).some(([id,c])=>c>0&&id.startsWith("b")),         reward:{type:"money", amount:1000} },
  { id:"pm4",  icon:"💰", name:{en:"Five Figures",        es:"Cinco Cifras",          fr:"Cinq Chiffres",         de:"Fünfstellig",          zh:"五位数",       ja:"5桁達成"},          desc:{en:"Earn $10,000 total",                   es:"Gana $10.000 en total"},                  check: s => s.totalEarned >= 10000,                                                   reward:{type:"money", amount:5000} },
  { id:"pm5",  icon:"👔", name:{en:"First Manager",       es:"Primer Manager",        fr:"Premier Manager",       de:"Erster Manager",       zh:"第一位经理",   ja:"初めてのマネージャー"},desc:{en:"Hire your first manager",             es:"Contrata tu primer manager"},             check: s => Object.values(s.managers||{}).some(v=>v>0),                               reward:{type:"money", amount:3000} },
  { id:"pm6",  icon:"📈", name:{en:"Stock Rookie",        es:"Novato Bursátil",       fr:"Novice Boursier",       de:"Börsen-Neuling",       zh:"股市新手",     ja:"株式初心者"},        desc:{en:"Buy shares in 3 different companies",  es:"Compra acciones en 3 empresas distintas"}, check: s => Object.values(s.portfolio).filter(v=>v>0).length >= 3,                    reward:{type:"money", amount:8000} },
  { id:"pm7",  icon:"🔟", name:{en:"Growing Empire",      es:"Imperio Creciente",     fr:"Empire Grandissant",    de:"Wachsendes Imperium",  zh:"帝国崛起",     ja:"成長する帝国"},      desc:{en:"Own 10 businesses total",              es:"Posee 10 negocios en total"},             check: s => Object.values(s.owned).reduce((a,b)=>a+b,0) >= 10,                        reward:{type:"mult", amount:2, duration:300} },
  { id:"pm8",  icon:"🤖", name:{en:"Automation Begins",   es:"Empieza la Automatización",fr:"L'Automatisation Commence",de:"Automatisierung beginnt",zh:"自动化开始",ja:"自動化の始まり"},   desc:{en:"Hire 5 managers",                      es:"Contrata 5 managers"},                    check: s => Object.values(s.managers||{}).filter(v=>v>0).length >= 5,                 reward:{type:"discount", amount:0.5, duration:180} },
  { id:"pm9",  icon:"💎", name:{en:"Millionaire Club",    es:"Club de Millonarios",   fr:"Club des Millionnaires",de:"Millionärsclub",        zh:"百万富翁俱乐部",ja:"ミリオネアクラブ"},  desc:{en:"Earn $1,000,000 total",                es:"Gana $1.000.000 en total"},               check: s => s.totalEarned >= 1e6,                                                     reward:{type:"money", amount:200000} },
  { id:"pm10", icon:"🏢", name:{en:"Corporate Raider",    es:"Tiburón Corporativo",   fr:"Raider Corporatif",     de:"Unternehmensräuber",    zh:"企业掠夺者",   ja:"コーポレートレイダー"},desc:{en:"Acquire 100% of a listed company",    es:"Adquiere el 100% de una empresa cotizada"}, check: s => s.stocks.some(st=>(s.portfolio[st.id]||0)>=st.totalShares),               reward:{type:"mult", amount:2, duration:300} },
  { id:"pm11", icon:"⭐", name:{en:"Manager Elite",       es:"Manager Élite",         fr:"Manager Élite",         de:"Elite-Manager",         zh:"精英经理",     ja:"エリートマネージャー"},desc:{en:"Upgrade any manager to level 5",      es:"Mejora cualquier manager al nivel 5"},     check: s => Object.values(s.managers||{}).some(v=>v>=5),                              reward:{type:"money", amount:500000} },
  { id:"pm12", icon:"✦",  name:{en:"Prestige Unlocked",   es:"Prestige Desbloqueado", fr:"Prestige Débloqué",     de:"Prestige Freigeschaltet",zh:"声望解锁",    ja:"プレステージ解放"},   desc:{en:"Complete your first Prestige",         es:"Completa tu primer Prestige"},             check: s => s.prestige >= 1,                                                          reward:{type:"mult", amount:2, duration:600} },
  { id:"pm13", icon:"🎰", name:{en:"Casino Debut",       es:"Debut en el Casino",    fr:"Débuts au Casino",      de:"Casino-Debüt",         zh:"赌场首秀",    ja:"カジノデビュー"},      desc:{en:"Place your first casino bet",          es:"Realiza tu primera apuesta en el casino"},  check: s => (s.totalCasinoPlays||0) >= 1,                                             reward:{type:"money", amount:10000} },
  { id:"pm14", icon:"📦", name:{en:"Tycoon",             es:"Magnate",               fr:"Magnat",                de:"Tycoon",               zh:"大亨",        ja:"タイクーン"},           desc:{en:"Own 50 businesses total",              es:"Posee 50 negocios en total"},               check: s => Object.values(s.owned).reduce((a,b)=>a+b,0) >= 50,                        reward:{type:"mult", amount:2, duration:300} },
  { id:"pm15", icon:"🏆", name:{en:"Market Dominator",  es:"Dominador del Mercado", fr:"Dominateur du Marché",  de:"Marktdominator",       zh:"市场霸主",    ja:"マーケットドミネーター"},desc:{en:"Acquire 5 companies at 100%",          es:"Adquiere 5 empresas al 100%"},             check: s => s.stocks.filter(st=>(s.portfolio[st.id]||0)>=st.totalShares).length >= 5, reward:{type:"money", amount:5e6} },
  { id:"pm16", icon:"⚡", name:{en:"Max Manager",       es:"Manager Máximo",        fr:"Manager Maximum",       de:"Max-Manager",          zh:"顶级经理",    ja:"マックスマネージャー"}, desc:{en:"Max out a manager to level 10",        es:"Lleva un manager al nivel 10"},            check: s => Object.values(s.managers||{}).some(v => v >= 10),                          reward:{type:"mult", amount:3, duration:600} },
];

const CHAIN_MISSIONS = [
  { id:"chain_industry", icon:"🏭",
    name:{en:"Industrial Tycoon",es:"Magnate Industrial",fr:"Magnat Industriel",de:"Industrie-Mogul",zh:"工业大亨",ja:"インダストリアルタイクーン"},
    steps:[
      { desc:{en:"Buy 1 factory",       es:"Compra 1 fábrica"},      target:1,   check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("f")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:1000} },
      { desc:{en:"Buy 10 factories",    es:"Compra 10 fábricas"},     target:10,  check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("f")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:10000} },
      { desc:{en:"Buy 25 factories",    es:"Compra 25 fábricas"},     target:25,  check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("f")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:50000} },
      { desc:{en:"Buy 50 factories",    es:"Compra 50 fábricas"},     target:50,  check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("f")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:200000} },
      { desc:{en:"Buy 100 factories",   es:"Compra 100 fábricas"},    target:100, check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("f")).reduce((a,[,c])=>a+c,0), reward:{type:"mult",amount:2,duration:600} },
    ]
  },
  { id:"chain_finance", icon:"🏦",
    name:{en:"Finance Lord",es:"Señor de las Finanzas",fr:"Seigneur des Finances",de:"Finanzherr",zh:"金融大佬",ja:"ファイナンスロード"},
    steps:[
      { desc:{en:"Buy 1 finance business",  es:"Compra 1 negocio financiero"},  target:1,   check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("b")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:2000} },
      { desc:{en:"Buy 10 finance businesses",es:"Compra 10 negocios financieros"},target:10, check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("b")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:20000} },
      { desc:{en:"Buy 25 finance businesses",es:"Compra 25 negocios financieros"},target:25, check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("b")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:100000} },
      { desc:{en:"Buy 50 finance businesses",es:"Compra 50 negocios financieros"},target:50, check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("b")).reduce((a,[,c])=>a+c,0), reward:{type:"money",amount:500000} },
      { desc:{en:"Buy 100 finance businesses",es:"Compra 100 negocios financieros"},target:100,check:(s)=>Object.entries(s.owned).filter(([id])=>id.startsWith("b")).reduce((a,[,c])=>a+c,0), reward:{type:"discount",amount:0.5,duration:300} },
    ]
  },
  { id:"chain_investor", icon:"📈",
    name:{en:"Master Investor",es:"Inversor Maestro",fr:"Maître Investisseur",de:"Meisterinvestor",zh:"投资大师",ja:"マスター投資家"},
    steps:[
      { desc:{en:"Buy shares in 1 company",  es:"Compra acciones en 1 empresa"},   target:1,  check:(s)=>Object.values(s.portfolio).filter(v=>v>0).length, reward:{type:"money",amount:5000} },
      { desc:{en:"Buy shares in 5 companies",es:"Compra acciones en 5 empresas"},  target:5,  check:(s)=>Object.values(s.portfolio).filter(v=>v>0).length, reward:{type:"money",amount:30000} },
      { desc:{en:"Buy shares in 10 companies",es:"Compra acciones en 10 empresas"},target:10, check:(s)=>Object.values(s.portfolio).filter(v=>v>0).length, reward:{type:"money",amount:150000} },
      { desc:{en:"Acquire 1 company at 100%",es:"Adquiere 1 empresa al 100%"},     target:1,  check:(s)=>s.stocks.filter(st=>(s.portfolio[st.id]||0)>=st.totalShares).length, reward:{type:"mult",amount:2,duration:300} },
      { desc:{en:"Acquire 5 companies at 100%",es:"Adquiere 5 empresas al 100%"},  target:5,  check:(s)=>s.stocks.filter(st=>(s.portfolio[st.id]||0)>=st.totalShares).length, reward:{type:"mult",amount:3,duration:600} },
    ]
  },
  { id:"chain_empire", icon:"👑",
    name:{en:"Empire Builder",es:"Constructor de Imperio",fr:"Bâtisseur d'Empire",de:"Imperiumsbauer",zh:"帝国建造者",ja:"帝国ビルダー"},
    steps:[
      { desc:{en:"Hire 1 manager",      es:"Contrata 1 manager"},     target:1,  check:(s)=>Object.values(s.managers||{}).filter(v=>v>0).length, reward:{type:"money",amount:3000} },
      { desc:{en:"Hire 5 managers",     es:"Contrata 5 managers"},    target:5,  check:(s)=>Object.values(s.managers||{}).filter(v=>v>0).length, reward:{type:"money",amount:25000} },
      { desc:{en:"Hire 10 managers",    es:"Contrata 10 managers"},   target:10, check:(s)=>Object.values(s.managers||{}).filter(v=>v>0).length, reward:{type:"money",amount:100000} },
      { desc:{en:"Reach Prestige 1",    es:"Alcanza Prestige 1"},     target:1,  check:(s)=>s.prestige, reward:{type:"money",amount:1e6} },
      { desc:{en:"Reach Prestige 3",    es:"Alcanza Prestige 3"},     target:3,  check:(s)=>s.prestige, reward:{type:"mult",amount:3,duration:900} },
    ]
  },
  { id:"chain_casino", icon:"🎰",
    name:{en:"Casino Mogul",es:"Magnate del Casino",fr:"Magnat du Casino",de:"Casino-Mogul",zh:"赌场大亨",ja:"カジノモーグル",pt:"Magnata do Cassino",ru:"Казино-магнат"},
    steps:[
      { desc:{en:"Place your first bet",              es:"Realiza tu primera apuesta"},          target:1,      check:(s)=>(s.totalCasinoPlays||0), reward:{type:"money",amount:5000} },
      { desc:{en:"Win $1,000 at the casino",          es:"Gana $1.000 en el casino"},            target:1000,   check:(s)=>(s.totalCasinoWon||0), reward:{type:"money",amount:25000} },
      { desc:{en:"Win $50,000 at the casino",         es:"Gana $50.000 en el casino"},           target:50000,  check:(s)=>(s.totalCasinoWon||0), reward:{type:"money",amount:200000} },
      { desc:{en:"Win 10 blackjack hands",            es:"Gana 10 manos de blackjack"},          target:10,     check:(s)=>(s.totalBjWins||0), reward:{type:"mult",amount:2,duration:300} },
      { desc:{en:"Win $1,000,000 at the casino",      es:"Gana $1.000.000 en el casino"},        target:1e6,    check:(s)=>(s.totalCasinoWon||0), reward:{type:"mult",amount:3,duration:600} },
    ]
  },
];

function generateDailyMissions(totalEarned, seed) {
  const scale = Math.max(1, Math.floor(Math.log10(Math.max(1, totalEarned))));
  const base = Math.pow(10, scale);
  const rng = (n) => ((seed * 9301 + n * 49297) % 233280) / 233280;
  return [
    { id:"daily1", icon:"💵", name:{en:"Daily Earner",es:"Ganador Diario",fr:"Gagnant Quotidien",de:"Tagesverdiener",zh:"日常收益",ja:"デイリー収益"},
      desc:{en:"Earn " + (base >= 1e6 ? "$"+(base/1e6).toFixed(0)+"M" : base >= 1e3 ? "$"+(base/1e3).toFixed(0)+"K" : "$"+base) + " today",
            es:"Gana " + (base >= 1e6 ? "$"+(base/1e6).toFixed(0)+"M" : base >= 1e3 ? "$"+(base/1e3).toFixed(0)+"K" : "$"+base) + " hoy"},
      target: base, type:"earn", reward:{type:"money", amount: base * 0.5} },
    { id:"daily2", icon:"🏪", name:{en:"Shopping Spree",es:"Día de Compras",fr:"Journée Shopping",de:"Einkaufstag",zh:"购物日",ja:"ショッピングデー"},
      desc:{en:"Buy " + (Math.floor(rng(1)*3)+3) + " businesses today", es:"Compra " + (Math.floor(rng(1)*3)+3) + " negocios hoy"},
      target: Math.floor(rng(1)*3)+3, type:"buy", reward:{type:"discount", amount:0.5, duration:180} },
    { id:"daily3", icon:"📊", name:{en:"Market Player",es:"Jugador de Mercado",fr:"Joueur de Marché",de:"Marktspieler",zh:"市场玩家",ja:"市場プレイヤー"},
      desc:{en:"Trade stocks " + (Math.floor(rng(2)*3)+2) + " times today", es:"Opera en bolsa " + (Math.floor(rng(2)*3)+2) + " veces hoy"},
      target: Math.floor(rng(2)*3)+2, type:"trade", reward:{type:"mult", amount:2, duration:300} },
  ];
}

const DIVIDEND_INTERVAL_MS = 5 * 60 * 1000;
const DIVIDEND_RATE = 0.0002;
const SAVE_KEY = "business_empire_save_v3";

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function BusinessEmpire() {
  const [lang, setLang]                 = useState("en");
  const [started, setStarted]           = useState(false);
  const [playerName, setPlayerName]     = useState("");
  const [playerRegion, setPlayerRegion] = useState("");
  const [deviceId] = useState(() => {
    try {
      let id = localStorage.getItem("business_empire_device_id");
      if (!id) {
        // crypto.randomUUID() = 122 bits de entropía, criptográficamente seguro
        id = typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "dev_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 15);
        localStorage.setItem("business_empire_device_id", id);
      }
      return id;
    } catch(e) {
      return "dev_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 15);
    }
  });
  const [nameInput, setNameInput]       = useState("");
  const [regionInput, setRegionInput]   = useState(REGIONS_UNIQUE[0]);
  const [langInput, setLangInput]       = useState(() => { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)||"{}"); return d.lang || "en"; } catch(e) { return "en"; } });

  const [money, setMoney]               = useState(0);
  const [totalEarned, setTotalEarned]   = useState(0);
  const [totalClicks, setTotalClicks]   = useState(0);
  const [owned, setOwned]               = useState({});
  const [upgrades, setUpgrades]         = useState(UPGRADES);
  const [managers, setManagers]         = useState({});
  const [prestige, setPrestige]         = useState(0);
  const [unlockedAch, setUnlockedAch]   = useState([]);

  const [activeTab, setActiveTab]       = useState("businesses");
  const [bizCatTab, setBizCatTab]       = useState("factory");
  const [buyMultiplier, setBuyMultiplier] = useState(1); // 1 | 10 | 100 | "max"
  const [managerCatTab, setManagerCatTab] = useState("factory");
  const [clickAnim, setClickAnim]       = useState(false);
  const [floats, setFloats]             = useState([]);
  const [notification, setNotification] = useState(null);
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [stocks, setStocks] = useState(() =>
    STOCK_COMPANIES.map(c => ({ ...c, price:c.basePrice, prevPrice:c.basePrice, history:[c.basePrice] }))
  );
  const [portfolio, setPortfolio]       = useState({});
  const [stockTab, setStockTab]         = useState("market");
  const [stockSector, setStockSector]   = useState("All");
  const [cryptos, setCryptos]           = useState(() => CRYPTOS.map(c => ({ ...c, price:c.basePrice, history:[], prevPrice:c.basePrice })));
  const [cryptoWallet, setCryptoWallet] = useState({});  // { id: qty }
  const [cryptoAvgBuy, setCryptoAvgBuy] = useState({});  // { id: avgCostBasis }
  const [activeCryptoEvent, setActiveCryptoEvent] = useState(null); // { event, endsAt }
  const [activeMarketEvent, setActiveMarketEvent]  = useState(null); // { event, endsAt }
  const [cryptoInput, setCryptoInput]   = useState({});  // { id: "qty string" }
  const [cryptoBuyMode, setCryptoBuyMode] = useState({}); // per-coin: "qty" | "usd"

  // ── CASINO ──
  const [casinoGame, setCasinoGame]         = useState("roulette"); // "roulette" | "blackjack"
  const [casinoBet, setCasinoBet]           = useState("");
  const [roulettePick, setRoulettePick]     = useState("red");      // "red"|"black"|0-36
  const [rouletteResult, setRouletteResult] = useState(null);       // { number, color, won, gain }
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [bjState, setBjState]               = useState(null);       // null | { playerCards, dealerCards, phase, result }
  const [casinoDailyWagered, setCasinoDailyWagered] = useState(0);
  const [casinoDailyDate, setCasinoDailyDate]       = useState("");
  const [rouletteHistory, setRouletteHistory]       = useState([]);   // [{number, color}]
  const [rouletteBets, setRouletteBets]             = useState([]);   // [{type, value, amount, label, mult}]
  const [roulBetType, setRoulBetType]               = useState("color");
  const [roulBetInput, setRoulBetInput]             = useState("");
  const [roulBetValue, setRoulBetValue]             = useState("red");
  const [showSaveInfo, setShowSaveInfo]             = useState(false);
  const [showCeoLevels, setShowCeoLevels]         = useState(false);
  const [achSubTab, setAchSubTab]                 = useState("ach"); // "ach" | "local" | "global"
  const [globalLeaderboard, setGlobalLeaderboard]     = useState([]);
  const [regionalLeaderboard, setRegionalLeaderboard] = useState([]);
  const [globalLoading, setGlobalLoading]             = useState(false);
  const [regionalLoading, setRegionalLoading]         = useState(false);
  const [globalLoaded, setGlobalLoaded]               = useState(false);
  const [regionalLoaded, setRegionalLoaded]           = useState(false);
  const [rankingView, setRankingView]                 = useState("mundial"); // "mundial" | "regional"
  const [localRanking, setLocalRanking]           = useState(() => {
    try { return JSON.parse(localStorage.getItem("business_empire_ranking")||"[]"); } catch(e) { return []; }
  });
  const [totalCasinoWon, setTotalCasinoWon]       = useState(0);
  const [totalBjWins, setTotalBjWins]             = useState(0);
  const [totalCasinoPlays, setTotalCasinoPlays]   = useState(0);
  const CASINO_DAILY_LIMIT = 1e9; // $1B límite diario

  const [buyQty, setBuyQty]             = useState({});
  const [activeNews, setActiveNews]     = useState(null);
  const [completedProgress, setCompletedProgress] = useState([]);
  const [chainStep, setChainStep]       = useState({ chain_industry:0, chain_finance:0, chain_investor:0, chain_empire:0, chain_casino:0 });
  const [dailyMissions, setDailyMissions] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({ daily1:0, daily2:0, daily3:0 });
  const [dailySeed, setDailySeed]       = useState(() => Math.floor(Date.now() / 86400000));
  const [dailyCompleted, setDailyCompleted] = useState([]);
  const [activeMult, setActiveMult]     = useState(null);   // { value, expiresAt }
  const [activeDiscount, setActiveDiscount] = useState(null);
  const [missionTab, setMissionTab]     = useState("progress");
  const [wealthHistory, setWealthHistory] = useState([]);
  const [chartRange, setChartRange]       = useState("1h");
  const [showStockGuide, setShowStockGuide] = useState(false);
  const [tutorialStep, setTutorialStep]   = useState(0);
  const [tutorialDone, setTutorialDone]   = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(null); // { earned, seconds }
  const [soundEnabled, setSoundEnabled]   = useState(true);
  const [musicEnabled, setMusicEnabled]   = useState(true);
  const [musicVolume, setMusicVolume]     = useState(0.28);
  const [showOptions, setShowOptions]     = useState(false);
  const [showFeedback, setShowFeedback]     = useState(false);
  const [feedbackType, setFeedbackType]     = useState("bug");
  const [feedbackText, setFeedbackText]     = useState("");
  const [feedbackEmail, setFeedbackEmail]   = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null); // null | "sending" | "ok" | "err"
  const [volume, setVolume]               = useState(0.7);
  const [uiScale, setUiScale]             = useState(1.0);
  const [showFPS, setShowFPS]             = useState(false);
  const [fps, setFps]                     = useState(0);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const fpsRef                            = useRef({ frames:0, last:Date.now() });
  const sfxRef = useRef(null);
  sfxRef.current = (type) => { if (soundEnabled) playSound(type, volume); };
  const sfx = useCallback((type) => sfxRef.current(type), []);

  // ── MUSIC CONTROL ──
  const musicEnabledRef = useRef(musicEnabled);
  const musicVolumeRef  = useRef(musicVolume);
  useEffect(() => { musicEnabledRef.current = musicEnabled; }, [musicEnabled]);
  useEffect(() => { musicVolumeRef.current  = musicVolume;  }, [musicVolume]);

  useEffect(() => {
    if (!started) return;
    if (musicEnabled) {
      if (!musicActive) startMusic(musicVolume);
      else setMusicVol(musicVolume);
    } else {
      if (musicActive) stopMusic();
    }
  }, [started, musicEnabled, musicVolume]);

  // Limpiar música al desmontar
  useEffect(() => () => stopMusic(), []);


  // Detect if running inside Electron
  const isElectron = typeof window !== "undefined" && !!window.electronAPI;

  // Fullscreen toggle — Electron IPC or browser Fullscreen API
  const toggleFullscreen = useCallback(() => {
    if (isElectron) {
      window.electronAPI.toggleFullscreen().then(fs => setIsFullscreen(fs));
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  }, [isElectron]);

  // Sync fullscreen state with Electron events + browser API
  useEffect(() => {
    if (isElectron) {
      const unsub = window.electronAPI.onFullscreenChange(fs => setIsFullscreen(fs));
      window.electronAPI.isFullscreen().then(fs => setIsFullscreen(fs));
      return unsub;
    } else {
      const handler = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handler);
      return () => document.removeEventListener("fullscreenchange", handler);
    }
  }, [isElectron]);

  // F11 shortcut in browser mode (Electron handles it via globalShortcut)
  useEffect(() => {
    if (isElectron) return;
    const handler = (e) => { if (e.key === "F11") { e.preventDefault(); toggleFullscreen(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isElectron, toggleFullscreen]);

  // Unlock audio on first user gesture
  useEffect(() => {
    const onFirstGesture = () => {
      unlockAudio();
      // Remove after first successful unlock
      ["click","mousedown","keydown","touchstart"].forEach(evt => {
        document.removeEventListener(evt, onFirstGesture);
      });
    };
    ["click","mousedown","keydown","touchstart"].forEach(evt => {
      document.addEventListener(evt, onFirstGesture, { passive: true });
    });
    return () => {
      ["click","mousedown","keydown","touchstart"].forEach(evt => {
        document.removeEventListener(evt, onFirstGesture);
      });
    };
  }, []);  // [{ t: timestamp, v: totalEarned }]   // { text, stockId, impact, id }
  const [newsTicker, setNewsTicker]     = useState([]);     // last 5 headlines
  const newsId = useRef(0);

  const moneyRef = useRef(0);
  const floatId  = useRef(0);
  const t = T[lang] || T.en;

  useEffect(() => { moneyRef.current = money; }, [money]);
  const totalEarnedRef = useRef(0);
  const prestigeRef    = useRef(0);
  useEffect(() => { totalEarnedRef.current = totalEarned; }, [totalEarned]);
  useEffect(() => { prestigeRef.current    = prestige;    }, [prestige]);

  // ── LOAD ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d.started) return;
      setStarted(true);
      setPlayerName(d.playerName || "");
      setPlayerRegion(d.playerRegion || "");
      setLang(d.lang || "en");
      setMoney(d.money || 0);
      setTotalEarned(d.totalEarned || 0);
      setTotalClicks(d.totalClicks || 0);
      setOwned(d.owned || {});
      setPrestige(d.prestige || 0);
      setUnlockedAch(d.unlockedAch || []);
      setManagers(d.managers || {});
      if (d.upgrades)  setUpgrades(d.upgrades);
      if (d.portfolio)    setPortfolio(d.portfolio);
      if (d.stocks)      setStocks(d.stocks);
      if (d.cryptoWallet)        setCryptoWallet(d.cryptoWallet);
      if (d.cryptoAvgBuy)         setCryptoAvgBuy(d.cryptoAvgBuy);
      if (d.cryptos)             setCryptos(d.cryptos);
      if (d.casinoDailyWagered)  setCasinoDailyWagered(d.casinoDailyWagered);
      if (d.casinoDailyDate)     setCasinoDailyDate(d.casinoDailyDate);
      if (d.totalCasinoWon)     setTotalCasinoWon(d.totalCasinoWon||0);
      if (d.totalBjWins)        setTotalBjWins(d.totalBjWins||0);
      if (d.totalCasinoPlays)   setTotalCasinoPlays(d.totalCasinoPlays||0);
      if (d.soundEnabled  !== undefined) setSoundEnabled(d.soundEnabled);
      if (d.musicEnabled  !== undefined) setMusicEnabled(d.musicEnabled);
      if (d.musicVolume   !== undefined) setMusicVolume(d.musicVolume);
      if (d.volume        !== undefined) setVolume(d.volume);
      if (d.uiScale    !== undefined) setUiScale(d.uiScale);
      if (d.showFPS    !== undefined) setShowFPS(d.showFPS);
      if (d.completedProgress) setCompletedProgress(d.completedProgress);
      if (d.chainStep)         setChainStep(d.chainStep);
      if (d.dailyCompleted)    setDailyCompleted(d.dailyCompleted);
      if (d.dailyProgress)     setDailyProgress(d.dailyProgress);
      if (d.dailySeed)         setDailySeed(d.dailySeed);
      if (d.tutorialDone)      setTutorialDone(true);

      // ── OFFLINE EARNINGS ──
      if (d.lastSaveTime && d.started) {
        const elapsedSec = Math.min((Date.now() - d.lastSaveTime) / 1000, 12 * 3600); // cap 12h
        if (elapsedSec > 60) {
          // Calcular incomePerSec desde los datos raw
          const rawOwned    = d.owned || {};
          const rawUpgrades = d.upgrades || [];
          const rawManagers = d.managers || {};
          const rawPrestige = d.prestige || 0;
          const rawTotalEarned = d.totalEarned || 0;

          const upgradeEffects = rawUpgrades.filter(u => u.bought);
          const rawGlobalMult  = upgradeEffects.filter(u => u.effect === "globalMult").reduce((a,u) => a*u.value, 1);
          const rawCatMult     = cat => upgradeEffects.filter(u => u.effect === "catMult" && u.cat === cat).reduce((a,u) => a*u.value, 1);
          const rawCeoBonus    = getCeoLevel(rawTotalEarned).bonus;
          const rawPrestigeMult = getPrestigeIncomeMultiplier(rawPrestige);
          const rawRealEstate  = prestigeUnlocksRealEstate(rawPrestige);
          const allBiz         = rawRealEstate ? [...BUSINESSES, ...REAL_ESTATE_BUSINESSES] : BUSINESSES;

          const rawIncome = allBiz.reduce((total, biz) => {
            const count = rawOwned[biz.id] || 0;
            if (!count) return total;
            const mgrLvl = rawManagers[biz.id] || 0;
            const mgrMult = mgrLvl > 0 ? getManagerMultiplier(mgrLvl) : 1;
            return total + biz.baseIncome * count * rawCatMult(biz.category) * rawCeoBonus * rawGlobalMult * mgrMult * getBizMilestoneMultiplier(count) * rawPrestigeMult;
          }, 0);

          if (rawIncome > 0) {
            const earned = rawIncome * elapsedSec;
            setMoney(m => m + earned);
            setTotalEarned(te => te + earned);
            setOfflineEarnings({ earned, seconds: Math.floor(elapsedSec) });
          }
        }
      }
    } catch(e) {}
  }, []);

  // ── SAVE ──
  const save = useCallback(() => {
    try {
      const data = {
        started:true, playerName, playerRegion, lang,
        money:moneyRef.current, totalEarned, totalClicks,
        owned, upgrades, managers, prestige, unlockedAch, portfolio,
        stocks, cryptoWallet, cryptoAvgBuy, cryptos, casinoDailyWagered, casinoDailyDate,
        totalCasinoWon, totalBjWins, totalCasinoPlays,
        soundEnabled, musicEnabled, musicVolume, volume, uiScale, showFPS,
        completedProgress, chainStep, dailyCompleted, dailyProgress, dailySeed,
        tutorialDone,
        lastSaveTime: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2000);
    } catch(e) {}
  }, [playerName, playerRegion, lang, totalEarned, totalClicks, owned, upgrades, managers, prestige, unlockedAch, portfolio, stocks, soundEnabled, volume, uiScale, showFPS, completedProgress, chainStep, dailyCompleted, dailyProgress, dailySeed]);

  useEffect(() => {
    const id = setInterval(save, 30000);
    return () => clearInterval(id);
  }, [save]);

  // Guardar al cerrar la ventana (Alt+F4, X, navegador)
  useEffect(() => {
    const handleBeforeUnload = () => { save(); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save]);

  // Auto-refresh del leaderboard — movido debajo de fetchGlobalLeaderboard

  // ── DERIVED ──
  const ceoLevel   = getCeoLevel(totalEarned);
  const nextCeo    = CEO_LEVELS.find(l => l.minWealth > totalEarned);
  const ceoProgress = nextCeo ? Math.min(100, ((totalEarned - ceoLevel.minWealth) / (nextCeo.minWealth - ceoLevel.minWealth)) * 100) : 100;

  const upgradeEffects = upgrades.filter(u => u.bought);
  const clickFlat  = upgradeEffects.filter(u => u.effect === "clickFlat").reduce((a,u) => a+u.value, 0);
  const clickMult  = upgradeEffects.filter(u => u.effect === "clickMult").reduce((a,u) => a*u.value, 1);
  const globalMult = upgradeEffects.filter(u => u.effect === "globalMult").reduce((a,u) => a*u.value, 1);
  const catMult    = cat => upgradeEffects.filter(u => u.effect === "catMult" && u.cat === cat).reduce((a,u) => a*u.value, 1);
  // Manager multiplier: level 0 = x1.0 (no manager), level 1-5 = bonus
  const getManagerMult = bizId => {
    const lvl = managers[bizId] || 0;
    return lvl > 0 ? getManagerMultiplier(lvl) : 1.0;
  };

  const prestigeMult     = getPrestigeIncomeMultiplier(prestige);
  const activeMultValue  = (activeMult && activeMult.expiresAt > Date.now()) ? activeMult.value : 1;
  const activeDiscountVal = (activeDiscount && activeDiscount.expiresAt > Date.now()) ? activeDiscount.value : 1;
  const bizCostReduce    = getPrestigeBizCostReduction(prestige) * activeDiscountVal;
  const mgrCostReduce    = getPrestigeManagerCostReduction(prestige);
  const startingMoney    = getPrestigeStartingMoney(prestige);
  const realEstateUnlocked = prestigeUnlocksRealEstate(prestige);
  const prestigeTitle    = getPrestigeTitle(prestige);
  const nextPrestigeReq  = getPrestigeRequirement(prestige);

  // All businesses (including real estate if unlocked) generate passive income
  const allBusinesses = realEstateUnlocked
    ? [...BUSINESSES, ...REAL_ESTATE_BUSINESSES]
    : BUSINESSES;

  const incomePerSec = allBusinesses.reduce((total, biz) => {
    const count = owned[biz.id] || 0;
    if (!count) return total;
    const milestoneMult = getBizMilestoneMultiplier(count);
    return total + biz.baseIncome * count * catMult(biz.category) * ceoLevel.bonus * globalMult * getManagerMult(biz.id) * milestoneMult * prestigeMult * activeMultValue;
  }, 0);

  // Click value = base click value only
  const clickValue = (1 + clickFlat) * clickMult * ceoLevel.bonus * globalMult;

  const portfolioValue = Object.entries(portfolio).reduce((sum, [id, shares]) => {
    const s = stocks.find(x => x.id === id);
    return sum + (s ? shares * s.price : 0);
  }, 0);

  const totalBizOwned      = Object.values(owned).reduce((a,b) => a+b, 0);
  const automatedBusinesses = allBusinesses.filter(b => (managers[b.id]||0) > 0 && (owned[b.id]||0) > 0).length;

  // ── ACHIEVEMENTS ──
  useEffect(() => {
    const state = { totalEarned, owned, portfolio, stocks, upgrades, prestige, totalClicks, managers, allBusinesses, totalCasinoWon, totalBjWins, totalCasinoPlays };
    ACHIEVEMENTS_DEF.forEach(ach => {
      if (!unlockedAch.includes(ach.id) && ach.check(state)) {
        setUnlockedAch(prev => {
          if (prev.includes(ach.id)) return prev;
          sfx('achievement');
          showNotification(ach.icon + " " + (ach.name[lang] || ach.name.en));
          return [...prev, ach.id];
        });
      }
    });
  }, [totalEarned, owned, portfolio, stocks, upgrades, prestige, totalClicks, managers]);

  // ── TICKS ──
  useEffect(() => {
    const id = setInterval(() => {
      if (incomePerSec > 0) {
        const gain = incomePerSec / 20;
        setMoney(m => m + gain);
        setTotalEarned(te => te + gain);
      }
    }, 50);
    return () => clearInterval(id);
  }, [incomePerSec]);

  useEffect(() => {
    const id = setInterval(() => {
      setStocks(prev => prev.map(s => {
        const change   = (Math.random() - 0.48) * s.volatility;
        const newPrice = Math.max(0.01, s.price * (1 + change));
        return { ...s, prevPrice:s.price, price:newPrice, history:[...s.history.slice(-59), newPrice] };
      }));
    }, 60000);
    return () => clearInterval(id);
  }, []);


  // ── CRYPTO TICKER (cada 30s, más volátil que stocks) ──
  useEffect(() => {
    const id = setInterval(() => {
      setCryptos(prev => prev.map(c => {
        const evt    = activeCryptoEvent;
        let evtBoost = 0;
        if (evt && (evt.event.affects === "all" || evt.event.affects === c.id)) {
          evtBoost = evt.event.impact * 0.15; // el evento empuja gradualmente
        }
        const change   = (Math.random() - 0.47) * c.volatility + evtBoost;
        const newPrice = Math.max(0.000001, c.price * (1 + change));
        return { ...c, prevPrice:c.price, price:newPrice, history:[...( c.history||[]).slice(-59), newPrice] };
      }));
    }, 30000);
    return () => clearInterval(id);
  }, [activeCryptoEvent]);

  // ── CRYPTO EVENTS (cada 8-20 min aleatorios) ──
  useEffect(() => {
    let timeout;
    function scheduleNext() {
      const delay = (8 + Math.random() * 12) * 60 * 1000; // 8-20 min
      timeout = setTimeout(() => {
        const evt = CRYPTO_EVENTS[Math.floor(Math.random() * CRYPTO_EVENTS.length)];
        setActiveCryptoEvent({ event: evt, endsAt: Date.now() + evt.dur * 1000 });
        // Aplicar impacto inmediato al precio
        setCryptos(prev => prev.map(c => {
          if (evt.affects !== "all" && evt.affects !== c.id) return c;
          const newPrice = Math.max(0.000001, c.price * (1 + evt.impact));
          return { ...c, prevPrice: c.price, price: newPrice, history: [...(c.history||[]).slice(-59), newPrice] };
        }));
        sfx('news');
        // Auto-expirar evento
        setTimeout(() => setActiveCryptoEvent(null), evt.dur * 1000);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timeout);
  }, []);


  // ── GLOBAL MARKET EVENTS (cada 15-30 min) ──
  useEffect(() => {
    let timeout;
    function scheduleNext() {
      const delay = (15 + Math.random() * 15) * 60 * 1000;
      timeout = setTimeout(() => {
        const evt = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
        const endsAt = Date.now() + evt.dur * 1000;
        setActiveMarketEvent({ event: evt, endsAt });
        // Aplicar impacto masivo en stocks
        setStocks(prev => prev.map(s => {
          const newPrice = Math.max(0.01, s.price * (1 + evt.stockImpact * (0.7 + Math.random() * 0.6)));
          return { ...s, prevPrice: s.price, price: newPrice, history: [...(s.history||[]).slice(-59), newPrice] };
        }));
        // Aplicar impacto en cryptos
        setCryptos(prev => prev.map(c => {
          const newPrice = Math.max(0.000001, c.price * (1 + evt.cryptoImpact * (0.7 + Math.random() * 0.6)));
          return { ...c, prevPrice: c.price, price: newPrice, history: [...(c.history||[]).slice(-59), newPrice] };
        }));
        sfx('news');
        setTimeout(() => setActiveMarketEvent(null), evt.dur * 1000);
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  // News tick
  useEffect(() => {
    const id = setInterval(() => {
      const item = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
      const nid  = newsId.current++;
      const headline = { ...item, id:nid, timestamp: Date.now() };
      setActiveNews(headline);
      sfx('news');
      setNewsTicker(prev => [headline, ...prev].slice(0, 8));
      // Apply price impact to the affected stock
      if (item.stockId) {
        setStocks(prev => prev.map(s => {
          if (s.id !== item.stockId) return s;
          const newPrice = Math.max(0.01, s.price * (1 + item.impact));
          return { ...s, prevPrice:s.price, price:newPrice, history:[...s.history.slice(-59), newPrice] };
        }));
      } else {
        // Generic news: affect all stocks slightly
        setStocks(prev => prev.map(s => {
          const newPrice = Math.max(0.01, s.price * (1 + item.impact * (0.5 + Math.random() * 0.5)));
          return { ...s, prevPrice:s.price, price:newPrice, history:[...s.history.slice(-59), newPrice] };
        }));
      }
      // Auto-dismiss news banner after 8s
      setTimeout(() => setActiveNews(n => n?.id === nid ? null : n), 8000);
    }, NEWS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [lang]);

  useEffect(() => {
    const id = setInterval(() => {
      let totalDiv = 0;
      stocks.forEach(s => {
        const sh = portfolio[s.id] || 0;
        if (sh > 0) totalDiv += sh * s.price * DIVIDEND_RATE;
      });
      if (totalDiv > 0) {
        setMoney(m => m + totalDiv);
        setTotalEarned(te => te + totalDiv);
        sfx('dividend');
        showNotification("💰 " + t.dividends + ": +" + fmt(totalDiv));
      }
    }, DIVIDEND_INTERVAL_MS);
    return () => clearInterval(id);
  }, [portfolio, stocks, lang]);

  const showNotification = msg => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // ── ACTIONS ──
  const handleClick = useCallback(e => {
    const gain = clickValue;
    setMoney(m => m + gain);
    setTotalEarned(te => te + gain);
    setTotalClicks(c => c + 1);
    sfx('click');
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 120);
    const rect = e.currentTarget.getBoundingClientRect();
    const id = floatId.current++;
    setFloats(f => [...f, { id, value:gain, x:e.clientX-rect.left, y:e.clientY-rect.top }]);
    setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id)), 900);
  }, [clickValue]);

  // Coste total de comprar N unidades partiendo de count actual
  const getBizBulkCost = (biz, currentCount, n, reduce) => {
    let total = 0;
    for (let i = 0; i < n; i++) total += getBizCost(biz, currentCount + i, reduce);
    return total;
  };
  // Cuántas unidades puedo permitirme con el dinero actual
  const getMaxAffordable = (biz, currentCount, reduce) => {
    let n = 0, total = 0;
    while (true) {
      const next = getBizCost(biz, currentCount + n, reduce);
      if (total + next > moneyRef.current) break;
      total += next;
      n++;
      if (n >= 10000) break; // safety cap
    }
    return n;
  };

  const buyBiz = useCallback((biz, qty) => {
    const count = owned[biz.id] || 0;
    const n = qty === "max" ? getMaxAffordable(biz, count, bizCostReduce) : (qty || 1);
    if (n <= 0) return;
    const totalCost = getBizBulkCost(biz, count, n, bizCostReduce);
    if (moneyRef.current < totalCost) return;
    setMoney(m => m - totalCost);
    setOwned(o => ({ ...o, [biz.id]:(o[biz.id]||0)+n }));
    setDailyProgress(p => ({ ...p, daily2:(p.daily2||0)+n }));
    sfx('buy');
  }, [owned, bizCostReduce]);

  const buyUpgrade = useCallback(upg => {
    if (upg.bought || moneyRef.current < upg.cost) return;
    setMoney(m => m - upg.cost);
    setUpgrades(u => u.map(x => x.id === upg.id ? {...x, bought:true} : x));
    sfx('upgrade');
  }, []);

  const hireManager = useCallback(mgr => {
    const cost = Math.floor(getManagerHireCost(mgr) * mgrCostReduce);
    if (moneyRef.current < cost || (owned[mgr.bizId]||0) === 0) return;
    setMoney(m => m - cost);
    setManagers(m => ({ ...m, [mgr.bizId]:1 }));
    sfx('manager');
    showNotification(mgr.icon + " " + t.managerHired);
  }, [owned, lang, mgrCostReduce]);

  const upgradeManager = useCallback(mgr => {
    const currentLevel = managers[mgr.bizId] || 0;
    if (currentLevel >= MAX_MANAGER_LEVEL) return;
    const cost = Math.floor(getManagerUpgradeCost(mgr, currentLevel) * mgrCostReduce);
    if (moneyRef.current < cost) return;
    setMoney(m => m - cost);
    setManagers(m => ({ ...m, [mgr.bizId]:currentLevel+1 }));
    sfx('manager');
    showNotification(mgr.icon + " " + t.managerUpgraded);
  }, [managers, lang, mgrCostReduce]);

  // ── MISSIONS ──
  const claimReward = useCallback((reward) => {
    sfx('mission');
    if (reward.type === "money") {
      setMoney(m => m + reward.amount);
      setTotalEarned(te => te + reward.amount);
      showNotification("💰 +" + fmt(reward.amount) + " reward!");
    } else if (reward.type === "mult") {
      const expiresAt = Date.now() + reward.duration * 1000;
      setActiveMult({ value: reward.amount, expiresAt });
      showNotification("⚡ x" + reward.amount + " income for " + Math.floor(reward.duration/60) + "min!");
    } else if (reward.type === "discount") {
      const expiresAt = Date.now() + reward.duration * 1000;
      setActiveDiscount({ value: reward.amount, expiresAt });
      showNotification("🏷️ " + Math.round((1-reward.amount)*100) + "% discount for " + Math.floor(reward.duration/60) + "min!");
    }
  }, []);

  const claimProgressMission = useCallback((mission) => {
    if (completedProgress.includes(mission.id)) return;
    setCompletedProgress(prev => [...prev, mission.id]);
    claimReward(mission.reward);
  }, [completedProgress, claimReward]);

  const claimChainStep = useCallback((chainId, stepIdx, reward) => {
    setChainStep(prev => ({ ...prev, [chainId]: stepIdx + 1 }));
    claimReward(reward);
  }, [claimReward]);

  const claimDaily = useCallback((dailyId, reward) => {
    if (dailyCompleted.includes(dailyId)) return;
    setDailyCompleted(prev => [...prev, dailyId]);
    claimReward(reward);
  }, [dailyCompleted, claimReward]);

  // Init/refresh daily missions
  useEffect(() => {
    const today = Math.floor(Date.now() / 86400000);
    if (today !== dailySeed) {
      setDailySeed(today);
      setDailyCompleted([]);
      setDailyProgress({ daily1:0, daily2:0, daily3:0 });
    }
    setDailyMissions(generateDailyMissions(totalEarned, today));
  }, [dailySeed, totalEarned]);

  // Check active mult/discount expiry
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setActiveMult(m => m && m.expiresAt > now ? m : null);
      setActiveDiscount(d => d && d.expiresAt > now ? d : null);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // FPS counter
  useEffect(() => {
    if (!showFPS) return;
    let animId;
    const tick = () => {
      fpsRef.current.frames++;
      const now = Date.now();
      if (now - fpsRef.current.last >= 1000) {
        setFps(fpsRef.current.frames);
        fpsRef.current.frames = 0;
        fpsRef.current.last = now;
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [showFPS]);

  // Record wealth history every 30s (keep last 120 points = 1 hour)
  useEffect(() => {
    const id = setInterval(() => {
      setWealthHistory(h => [...h.slice(-719), { t: Date.now(), v: totalEarned }]);
    }, 30000);
    return () => clearInterval(id);
  }, [totalEarned]);

  // Guardar ranking al cerrar la sesión (beforeunload)
  useEffect(() => {
    const handleUnload = () => {
      const score = Math.floor(totalEarnedRef.current * (1 + prestigeRef.current * 0.5));
      const entry = {
        name: playerName,
        region: playerRegion,
        score,
        money: totalEarnedRef.current,
        prestige: prestigeRef.current,
        date: new Date().toLocaleDateString(),
      };
      try {
        const prev = JSON.parse(localStorage.getItem("business_empire_ranking") || "[]");
        const updated = [...prev, entry].sort((a,b) => b.score - a.score).slice(0, 10);
        localStorage.setItem("business_empire_ranking", JSON.stringify(updated));
      } catch(e) {}
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [playerName, playerRegion]);

  const buyShares = useCallback((stock, qty) => {
    const amount = parseInt(qty) || 0;
    if (amount <= 0) return;
    const cur = stocks.find(s => s.id === stock.id);
    const alreadyOwned = portfolio[stock.id] || 0;
    const toBuy = Math.min(amount, stock.totalShares - alreadyOwned);
    if (toBuy <= 0 || moneyRef.current < toBuy * cur.price) return;
    setMoney(m => m - toBuy * cur.price);
    setPortfolio(p => ({ ...p, [stock.id]:(p[stock.id]||0)+toBuy }));
    if (alreadyOwned + toBuy >= stock.totalShares) { sfx('achievement'); showNotification("🏢 " + t.acquiredFull + ": " + stock.name); } else { sfx('buy'); }
    setBuyQty(q => ({ ...q, [stock.id]:"" }));
    setDailyProgress(p => ({ ...p, daily3:(p.daily3||0)+1 }));
  }, [stocks, portfolio, lang]);

  const sellShares = useCallback((stock, qty) => {
    const toSell = Math.min(parseInt(qty)||0, portfolio[stock.id]||0);
    if (toSell <= 0) return;
    const cur = stocks.find(s => s.id === stock.id);
    setMoney(m => m + toSell * cur.price);
    setPortfolio(p => ({ ...p, [stock.id]:p[stock.id]-toSell }));
    sfx('sell');
    setBuyQty(q => ({ ...q, [stock.id]:"" }));
    setDailyProgress(p => ({ ...p, daily3:(p.daily3||0)+1 }));
  }, [stocks, portfolio]);

  // ── SUPABASE LEADERBOARD ──
  const pushScoreToSupabase = async (entry) => {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/submit-score`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          player_name: entry.name,
          region: entry.region,
          score: entry.score,
          money: entry.money,
          prestige: entry.prestige,
          device_id: deviceId,
        })
      });
    } catch(e) {}
  };

  const fetchGlobalLeaderboard = async () => {
    setGlobalLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/leaderboard?select=player_name,region,score,prestige,created_at,device_id&order=score.desc&limit=100`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setGlobalLeaderboard(Array.isArray(data) ? data : []);
        setGlobalLoaded(true);
      }
    } catch(e) {}
    setGlobalLoading(false);
  };

  const fetchRegionalLeaderboard = async () => {
    if (!playerRegion) return;
    setRegionalLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/leaderboard?select=player_name,region,score,prestige,created_at,device_id&order=score.desc&limit=100&region=eq.${encodeURIComponent(playerRegion)}`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );
      const data = res.ok ? await res.json() : [];
      setRegionalLeaderboard(Array.isArray(data) ? data : []);
    } catch(e) {
      setRegionalLeaderboard([]);
    }
    setRegionalLoaded(true);
    setRegionalLoading(false);
  };

  // Auto-refresh del leaderboard cada 60 segundos (ref pattern para evitar stale closures)
  const _lbRefresh = useRef(null);
  _lbRefresh.current = { fetchGlobal: fetchGlobalLeaderboard, fetchRegional: fetchRegionalLeaderboard };
  // Auto-refresh leaderboard cada minuto (siempre, sin depender de si se cargó antes)
  useEffect(() => {
    const id = setInterval(() => {
      const r = _lbRefresh.current;
      r.fetchGlobal();
      r.fetchRegional();
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Push ranking a Supabase cada 5 minutos automáticamente
  const _rankingPush = useRef(null);
  _rankingPush.current = { pushScore: pushScoreToSupabase, playerName, playerRegion };
  useEffect(() => {
    const id = setInterval(() => {
      const r = _rankingPush.current;
      if (!r.playerName) return;
      const score = Math.floor(totalEarnedRef.current * (1 + prestigeRef.current * 0.5));
      r.pushScore({ name: r.playerName, region: r.playerRegion, score, money: totalEarnedRef.current, prestige: prestigeRef.current, date: new Date().toLocaleDateString() });
    }, 300000); // cada 5 minutos
    return () => clearInterval(id);
  }, []);

  const fetchCurrentLeaderboard = () => {
    if (rankingView === "mundial") fetchGlobalLeaderboard();
    else fetchRegionalLeaderboard();
  };

  const saveRankingEntry = (curPrestige) => {
    const score = Math.floor(totalEarned * (1 + curPrestige * 0.5));
    const entry = {
      name: playerName,
      region: playerRegion,
      score,
      money: totalEarned,
      prestige: curPrestige,
      date: new Date().toLocaleDateString(),
    };
    // Local
    setLocalRanking(prev => {
      const updated = [...prev, entry].sort((a,b) => b.score - a.score).slice(0, 10);
      try { localStorage.setItem("business_empire_ranking", JSON.stringify(updated)); } catch(e) {}
      return updated;
    });
    // Global
    pushScoreToSupabase(entry);
  };

  const handlePrestige = () => {
    if (totalEarned < nextPrestigeReq) return;
    const newPrestige = prestige + 1;
    saveRankingEntry(newPrestige - 1);
    setPrestige(newPrestige);
    setMoney(getPrestigeStartingMoney(newPrestige));
    setTotalEarned(0); setTotalClicks(0);
    setOwned({}); setUpgrades(UPGRADES.map(u => ({ ...u, bought:false }))); setManagers({});
    // Resetear misiones al prestigiar
    setCompletedProgress([]);
    setChainStep({ chain_industry:0, chain_finance:0, chain_investor:0, chain_empire:0, chain_casino:0 });
    setDailyCompleted([]);
    setDailyProgress({ daily1:0, daily2:0, daily3:0 });
    // Stocks are KEPT on prestige
    sfx('prestige');
    showNotification("✦ " + t.prestigeReset + " " + getPrestigeTitle(newPrestige));
  };

  const handleStart = () => {
    if (!nameInput.trim()) return;
    setPlayerName(nameInput.trim());
    setPlayerRegion(regionInput);
    setLang(langInput);
    setStarted(true);
    setHasSave(true);
    if (!tutorialDone) setTutorialStep(1);
    setShowSaveInfo(true);
  };

  const handleNewGameConfirmed = () => {
    localStorage.removeItem(SAVE_KEY);
    // Reset all game state
    setMoney(0); setTotalEarned(0); setTotalClicks(0);
    setOwned({}); setUpgrades(UPGRADES_DEF.map(u => ({ ...u, bought:false })));
    setManagers({}); setPrestige(0); setUnlockedAch([]);
    setPortfolio({}); setStocks(STOCK_COMPANIES.map(c => ({ ...c, price:c.basePrice, history:[] })));
    setActiveMult(null); setActiveDiscount(null);
    setCompletedProgress({}); setChainStep({}); setDailyCompleted([]); setDailyProgress({ daily1:0, daily2:0, daily3:0 });
    setTutorialDone(false); setTutorialStep(0); setWealthHistory([]);
    setPlayerName(""); setPlayerRegion(""); setNameInput(""); setRegionInput(REGIONS_UNIQUE[0]);
    setStarted(false);
  };

  // ── COMPUTED ──
  const sectors      = ["All", ...Array.from(new Set(STOCK_COMPANIES.map(s => s.sector)))];
  const sectorLabel  = s => ({ All:t.sectorAll||"All", Industry:t.sectorIndustry||"Industry", Technology:t.sectorTechnology||"Technology", Finance:t.sectorFinance||"Finance", "Real Estate":t.sectorRealEstate||"Real Estate", Consumer:t.sectorConsumer||"Consumer", Energy:t.sectorEnergy||"Energy" }[s] || s);
  const visibleStocks = stockSector === "All" ? stocks : stocks.filter(s => s.sector === stockSector);
  const ownedStocks  = stocks.filter(s => (portfolio[s.id]||0) > 0);
  const canPrestige  = totalEarned >= nextPrestigeReq;

  // Misiones reclamables — para el badge en la pestaña y los contadores por sección
  const missionState = { totalEarned, owned, managers, stocks, portfolio, prestige, totalClicks, totalCasinoPlays, totalCasinoWon, totalBjWins };
  const claimableProgress = PROGRESS_MISSIONS.filter(m => !completedProgress.includes(m.id) && m.check(missionState)).length;
  const claimableDaily    = dailyMissions.filter(m => {
    const isDone = dailyCompleted.includes(m.id);
    if (isDone) return false;
    const progress = m.type === "earn" ? Math.min(m.target, totalEarned) :
                     m.type === "buy"  ? Math.min(m.target, dailyProgress.daily2||0) :
                                         Math.min(m.target, dailyProgress.daily3||0);
    return progress >= m.target;
  }).length;
  const claimableChains   = CHAIN_MISSIONS.filter(chain => {
    const curStep = chainStep[chain.id] || 0;
    if (curStep >= chain.steps.length) return false;
    const step = chain.steps[curStep];
    return step && step.check(missionState) >= step.target;
  }).length;
  const totalClaimable = claimableProgress + claimableDaily + claimableChains;

  const catLabel = realEstateUnlocked
    ? { factory:t.catFactory, tech:t.catTech, finance:t.catFinance, realestate:t.catRealEstate||"🏢 Real Estate" }
    : { factory:t.catFactory, tech:t.catTech, finance:t.catFinance };

  const allManagers = realEstateUnlocked
    ? [...MANAGERS_DEF, ...REAL_ESTATE_MANAGERS]
    : MANAGERS_DEF;

  // ── CSS ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:#0c0c1a; font-size:14px; }
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:#080810; }
    ::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:3px; }
    .card { background:#12121e; border:1px solid #222238; border-radius:8px; transition:border-color .15s,background .15s; }
    .card.hl:hover { border-color:#c9a84c; background:#16162a; cursor:pointer; }
    .card.dis { opacity:.4; cursor:not-allowed!important; }
    .tab-btn { background:none; border:none; color:#9090b8; cursor:pointer; padding:7px 9px; font-family:inherit; font-size:10.5px; letter-spacing:0.5px; text-transform:uppercase; border-bottom:2px solid transparent; transition:color .15s,border-color .15s; white-space:nowrap; }
    .tab-btn.active { color:#c9a84c; border-bottom-color:#c9a84c; }
    .tab-btn:hover:not(.active) { color:#d0c8bc; }
    .card-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:8px; }
    .card-grid-sm { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:8px; }
    .pill { background:none; border:1px solid #222238; border-radius:20px; color:#7a7a9a; cursor:pointer; padding:5px 14px; font-family:inherit; font-size:12px; transition:all .15s; margin-right:6px; margin-bottom:6px; }
    .pill.active { border-color:#c9a84c; color:#c9a84c; background:#1a1810; }
    .pill:hover { color:#e8e0d0; }
    .click-btn { position:relative; background:linear-gradient(135deg,#1a1810,#221f12); border:2px solid #c9a84c; border-radius:50%; width:148px; height:148px; cursor:pointer; transition:transform .1s,box-shadow .1s; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-direction:column; box-shadow:0 0 40px rgba(201,168,76,.12); }
    .click-btn:hover { box-shadow:0 0 60px rgba(201,168,76,.28); }
    .click-btn.clicked { transform:scale(.91); box-shadow:0 0 80px rgba(201,168,76,.5); }
    .float-text { position:absolute; font-size:14px; font-weight:600; color:#c9a84c; pointer-events:none; animation:floatUp .9s ease-out forwards; white-space:nowrap; }
    @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-55px)} }
    .si { background:#0c0c18; border:1px solid #222238; border-radius:4px; color:#e8e0d0; font-family:inherit; font-size:13px; padding:5px 8px; width:80px; outline:none; transition:border-color .15s; }
    .si:focus { border-color:#c9a84c; }
    .ti { background:#0c0c18; border:1px solid #222238; border-radius:6px; color:#e8e0d0; font-family:inherit; font-size:15px; padding:11px 14px; outline:none; transition:border-color .15s; width:100%; }
    .ti:focus { border-color:#c9a84c; }
    .sel { background:#0c0c18; border:1px solid #222238; border-radius:6px; color:#e8e0d0; font-family:inherit; font-size:14px; padding:10px 14px; outline:none; width:100%; cursor:pointer; }
    .btn { border:none; border-radius:4px; cursor:pointer; font-family:inherit; font-size:12px; letter-spacing:.5px; padding:6px 11px; font-weight:500; transition:opacity .15s; }
    .btn:hover { opacity:.85; }
    .btn:disabled { opacity:.25!important; cursor:not-allowed; }
    .btn-buy  { background:#1a3a1a; color:#6abf7a; border:1px solid #2a5a2a; }
    .btn-sell { background:#3a1a1a; color:#d06060; border:1px solid #5a2a2a; }
    .btn-max  { background:#1a1810; color:#c9a84c; border:1px solid #2a2510; font-size:11px; }
    .btn-pri  { background:linear-gradient(135deg,#1a1810,#2a2215); border:1px solid #c9a84c; color:#c9a84c; font-size:15px; padding:14px 32px; border-radius:8px; letter-spacing:2px; cursor:pointer; transition:all .2s; font-family:inherit; }
    .btn-pri:hover { background:linear-gradient(135deg,#2a2815,#3a3220); box-shadow:0 0 30px rgba(201,168,76,.3); }
    .notif { position:fixed; top:70px; right:20px; z-index:100; background:#1a1a2e; border:1px solid #c9a84c; border-radius:6px; padding:12px 20px; color:#e8e0d0; font-size:14px; animation:sli .3s ease-out; max-width:300px; }
    @keyframes sli { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
    .badge { background:#1a1810; border:1px solid #2a2510; color:#c9a84c; border-radius:4px; padding:2px 7px; font-size:13px; font-weight:600; min-width:32px; text-align:center; }
    .pb { height:4px; background:#1c1c2e; border-radius:2px; overflow:hidden; }
    .pf { height:100%; background:linear-gradient(90deg,#c9a84c,#e8c86a); transition:width .5s; }
    .sr { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #111122; font-size:13px; }
    .ach { background:#12121e; border:1px solid #222238; border-radius:8px; padding:13px 15px; display:flex; align-items:center; gap:12px; margin-bottom:8px; }
    .ach.ok { border-color:#2a3a1a; background:#0f160f; }
    .ach.no { opacity:.45; }
    .mc { background:#12121e; border:1px solid #222238; border-radius:8px; padding:14px 16px; margin-bottom:8px; }
    .mc.hm { border-color:#1a3a1a; background:#0c160c; }
    .mc.nb { opacity:.38; }
    .pip { width:14px; height:14px; border-radius:3px; display:inline-block; margin-right:3px; }
    .pip.on { background:#c9a84c; }
    .pip.off { background:#1c1c2e; border:1px solid #2a2a3a; }
    .mc2 { display:inline-flex; align-items:flex-end; gap:1px; height:24px; margin-left:8px; }
    .mb { width:3px; border-radius:1px; transition:height .3s; }
    .sb { position:fixed; bottom:16px; right:16px; background:#0f1a0f; border:1px solid #2a4a2a; border-radius:4px; padding:5px 14px; font-size:12px; color:#6abf7a; letter-spacing:1px; animation:fio 2s ease-out forwards; }
    @keyframes fio { 0%{opacity:0} 10%{opacity:1} 80%{opacity:1} 100%{opacity:0} }
    .gold{color:#c9a84c} .green{color:#6abf7a} .red{color:#d06060} .dim{color:#b8b2d0;font-size:12px;line-height:1.4}
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:200; display:flex; align-items:center; justify-content:center; }
    .modal { background:#0d0d18; border:1px solid #2a2a3a; border-radius:12px; padding:28px 32px; width:420px; max-width:90vw; }
    .opt-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #111; }
    .opt-row:last-child { border-bottom:none; }
    .slider { -webkit-appearance:none; width:120px; height:4px; border-radius:2px; background:#1c1c2e; outline:none; cursor:pointer; }
    .slider::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:#c9a84c; cursor:pointer; }
    .toggle { width:40px; height:22px; border-radius:11px; border:none; cursor:pointer; transition:background .2s; position:relative; }
    .toggle::after { content:""; position:absolute; top:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; }
    .toggle.on  { background:#c9a84c; } .toggle.on::after  { left:21px; }
    .toggle.off { background:#2a2a3a; } .toggle.off::after { left:3px; }
    .chart-wrap { position:relative; width:100%; height:200px; }
    .chart-svg { width:100%; height:100%; overflow:visible; }
    .chart-tooltip { position:absolute; background:#1a1a2a; border:1px solid #c9a84c; border-radius:4px; padding:6px 10px; font-size:11px; pointer-events:none; white-space:nowrap; }
    .mcard { background:#10101a; border:1px solid #1c1c2e; border-radius:8px; padding:13px 15px; margin-bottom:8px; }
    .mcard.done { border-color:#1a3a1a; background:#0c160c; }
    .mcard.ready { border-color:#c9a84c; background:#141408; }
    .mpb { height:4px; background:#1c1c2e; border-radius:2px; overflow:hidden; margin-top:8px; }
    .mpf { height:100%; border-radius:2px; transition:width .5s; background:linear-gradient(90deg,#c9a84c,#e8c86a); }
    .active-bonus { display:inline-flex; align-items:center; gap:6px; background:#1a1808; border:1px solid #c9a84c; border-radius:4px; padding:3px 10px; font-size:11px; color:#c9a84c; margin-right:8px; }
    .news-banner { position:fixed; bottom:0; left:0; right:0; z-index:50; background:#0d0d1a; border-top:1px solid #c9a84c; padding:8px 24px; display:flex; align-items:center; gap:12px; animation:slideUp .4s ease-out; }
    @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
    .news-tag { font-size:10px; letter-spacing:2px; color:#c9a84c; white-space:nowrap; }
    .news-text { font-size:13px; color:#e8e0d0; flex:1; }
    .news-impact { font-size:12px; font-weight:600; white-space:nowrap; }
    .ticker-item { padding:10px 14px; border-bottom:1px solid #0e0e18; display:flex; align-items:flex-start; gap:10px; }
    .ticker-item:last-child { border-bottom:none; }
  `;

  // ── START SCREEN ──
  if (!started) {
    const Tl = T[langInput] || T.en;
    return (
      <div style={{ fontFamily:"'Inter',sans-serif", background:"#0c0c1a", color:"#e8e0d0", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{css}</style>
        <div style={{ width:"100%", maxWidth:400, padding:"40px 32px" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:38, color:"#c9a84c", letterSpacing:3 }}>{Tl.startTitle || "EL GRAN CAPITALISTA"}</div>
            <div className="dim" style={{ marginTop:8, fontSize:13, letterSpacing:1 }}>{Tl.startSub || ""}</div>
            <div style={{ marginTop:6, fontSize:11, color:"#5a5070", letterSpacing:2 }}>v{APP_VERSION}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <div className="dim" style={{ marginBottom:6, letterSpacing:1 }}>{Tl.startLang || "Language"}</div>
              <select className="sel" value={langInput} onChange={e => setLangInput(e.target.value)}>
                {Object.entries(LANG_NAMES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <div className="dim" style={{ marginBottom:6, letterSpacing:1 }}>{Tl.startName || "CEO Name"}</div>
              <input className="ti" type="text" maxLength={32} placeholder={Tl.startNamePlaceholder || ""}
                value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStart()} />
            </div>
            <div>
              <div className="dim" style={{ marginBottom:6, letterSpacing:1 }}>{Tl.startRegion || "Region"}</div>
              <select className="sel" value={regionInput} onChange={e => setRegionInput(e.target.value)}>
                {REGIONS_UNIQUE.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ marginTop:6, fontSize:11, color:"#8a6020" }}>{Tl.regionWarning || ""}</div>
            </div>
            <button className="btn-pri" style={{ marginTop:8, width:"100%" }} onClick={handleStart} disabled={!nameInput.trim()}>
              {Tl.startBtn || "START"}
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ── MAIN GAME ──
  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#0c0c1a", color:"#e8e0d0", minHeight:"100vh", display:"flex", flexDirection:"column", userSelect:"none", zoom: uiScale }}>
      <style>{css}</style>
      {notification && <div className="notif">{notification}</div>}
      {showFPS && <div style={{ position:"fixed", top:8, left:"50%", transform:"translateX(-50%)", background:"#0a0a14", border:"1px solid #1c1c2e", borderRadius:4, padding:"2px 8px", fontSize:11, color:"#5aab6a", zIndex:99 }}>{fps} FPS</div>}
      {saveIndicator && <div className="sb">{"✓ " + t.saveIndicator}</div>}

      {/* TOP BAR */}
      <div style={{ background:"#0c0c16", borderBottom:"1px solid #161628", padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:"#c9a84c", letterSpacing:1 }}>{t.title}</div>
            <select className="sel" style={{ width:"auto", padding:"3px 8px", fontSize:11 }} value={lang} onChange={e => setLang(e.target.value)}>
              {Object.entries(LANG_NAMES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="dim" style={{ marginTop:2, letterSpacing:1 }}>
            {"👔 " + playerName + " · 🌍 " + playerRegion}
            {prestige > 0 && <span style={{ color:"#8060ff", marginLeft:8 }}>{prestigeTitle + " P" + prestige}</span>}
            <span style={{ margin:"0 8px", color:"#222" }}>|</span>
            {t.total + ": "}<span className="gold">{fmt(totalEarned)}</span>
            <span style={{ margin:"0 6px", color:"#222" }}>|</span>
            {t.companyValue + ": "}<span style={{ color:"#6090ff" }}>{fmt(portfolioValue)}</span>
          </div>
        </div>
        <div style={{ textAlign:"right", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setShowOptions(true)} style={{ background:"none", border:"1px solid #1c1c2e", borderRadius:6, color:"#666", cursor:"pointer", padding:"6px 10px", fontSize:16, transition:"color .15s,border-color .15s" }}
            onMouseOver={e=>{e.target.style.color="#c9a84c";e.target.style.borderColor="#c9a84c"}}
            onMouseOut={e=>{e.target.style.color="#666";e.target.style.borderColor="#1c1c2e"}}>
            ⚙️
          </button>
          <div>
          <div style={{ fontSize:28, fontWeight:600, letterSpacing:-1 }}>{fmt(money)}</div>
          <div className="dim">
            <span className="green">{"+" + fmt(incomePerSec) + "/s"}</span>
            <span style={{ margin:"0 6px", color:"#222" }}>|</span>
            {"+" + fmt(clickValue) + "/click"}
          </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* LEFT PANEL */}
        <div style={{ width:"clamp(180px, 18vw, 232px)", borderRight:"1px solid #161628", padding:"12px 10px", display:"flex", flexDirection:"column", alignItems:"center", gap:12, overflowY:"auto" }}>

          {/* CEO */}
          {(()=>{ const ceoIdx = CEO_LEVELS.indexOf(ceoLevel); return (
            <div className="card" style={{ width:"100%", padding:"12px" }}>
              {/* Avatar + name + progress */}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:52, height:52, borderRadius:26, border:"2px solid #c9a84c", overflow:"hidden",
                  background:"#0a0a12", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                  <img src={"ceo_" + (ceoIdx+1) + ".png"} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    onError={e => { e.target.style.display="none"; e.target.parentNode.textContent="👔"; }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, color:"#c9a84c" }}>
                    {ceoLevel.name[lang]||ceoLevel.name.en}
                  </div>
                  <div style={{ fontSize:11, color:"#8888aa", marginTop:1 }}>{"×" + ceoLevel.bonus.toFixed(1) + " bonus · Lv " + (ceoIdx+1) + "/10"}</div>
                  {nextCeo && (
                    <>
                      <div className="pb" style={{ marginTop:5 }}><div className="pf" style={{ width:ceoProgress+"%" }} /></div>
                      <div style={{ fontSize:11, color:"#7878a0", marginTop:3 }}>{"→ " + (nextCeo.name[lang]||nextCeo.name.en) + " · " + fmt(nextCeo.minWealth)}</div>
                    </>
                  )}
                </div>
                <button onClick={() => setShowCeoLevels(s => !s)}
                  style={{ background:"none", border:"1px solid #2a2a40", borderRadius:5, color:"#6060a0",
                    cursor:"pointer", padding:"4px 7px", fontSize:13, lineHeight:1 }}>
                  {showCeoLevels ? "▲" : "▼"}
                </button>
              </div>
              {/* Collapsible levels */}
              {showCeoLevels && (
                <div style={{ marginTop:10, borderTop:"1px solid #1a1a2e", paddingTop:8, display:"flex", flexDirection:"column", gap:3 }}>
                  {CEO_LEVELS.map((lvl, i) => {
                    const reached   = totalEarned >= lvl.minWealth;
                    const isCurrent = lvl === ceoLevel;
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:7,
                        background: isCurrent ? "#12102a" : "transparent",
                        borderRadius:5, padding:"3px 6px",
                        border: isCurrent ? "1px solid #4a3a8a" : "1px solid transparent",
                        opacity: reached ? 1 : 0.4 }}>
                        <div style={{ width:8, height:8, borderRadius:4, flexShrink:0,
                          background: isCurrent ? "#c9a84c" : reached ? "#6abf7a" : "#333",
                          boxShadow: isCurrent ? "0 0 6px #c9a84c88" : "none" }} />
                        <span style={{ fontSize:12, color: isCurrent?"#c9a84c":reached?"#8abf8a":"#6868a0", fontWeight:isCurrent?700:400, flex:1 }}>
                          {lvl.name[lang]||lvl.name.en}
                        </span>
                        <span style={{ fontSize:11, color:"#5858a0" }}>{"×" + lvl.bonus.toFixed(1)}</span>
                        <span style={{ fontSize:10, color:"#5858a0" }}>{i===0?"—":fmt(lvl.minWealth)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })()}

          {/* CLICK */}
          <div style={{ position:"relative" }}>
            <button className={"click-btn" + (clickAnim?" clicked":"")} onClick={handleClick}>
              <img src="click_btn.png" alt="" style={{ width:144, height:144, objectFit:"cover", borderRadius:"50%", position:"absolute", inset:0, margin:"auto" }} onError={e=>{e.target.style.display="none";}} />
            </button>
            {floats.map(fl => <div key={fl.id} className="float-text" style={{ left:fl.x-20, top:fl.y-10 }}>{"+" + fmt(fl.value)}</div>)}
          </div>
          <div style={{ textAlign:"center", marginTop:8 }}>
            <div style={{ fontSize:11, color:"#c9a84c", letterSpacing:2 }}>{t.click}</div>
            <div style={{ fontSize:12, color:"#9898b8", marginTop:1 }}>{fmt(clickValue)}</div>
          </div>

          {/* STATS */}
          <div style={{ width:"100%", fontSize:12 }}>
            {[
              [t.incomePerSec,     <span className="green">{"+" + fmt(incomePerSec) + "/s"}</span>],
              [t.perClick,         <span className="gold">{fmt(clickValue)}</span>],
              [t.businesses,       <span className="gold">{totalBizOwned}</span>],
              [t.tabManagers,      <span className="green">{automatedBusinesses + "/" + BUSINESSES.length}</span>],
              [t.tabAchievements,  <span className="gold">{unlockedAch.length + "/" + ACHIEVEMENTS_DEF.length}</span>],
            ].map(([label, val]) => (
              <div key={label} className="sr"><span className="dim">{label}</span><span>{val}</span></div>
            ))}
          </div>

          {/* PRESTIGE */}
          <div style={{ width:"100%", background:"#0d0a1a", border:"1px solid " + (canPrestige?"#8060ff":"#1c1c2e"), borderRadius:8, padding:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              {prestige > 0 && <img src={"./prestige_" + prestige + ".png"} alt="" style={{ width:28, height:28, objectFit:"contain", flexShrink:0 }} onError={e => { e.target.src = "./" + (prestige >= 10 ? "prestige_10.png" : prestige >= 5 ? "prestige_5.png" : "prestige_1.png"); }} />}
              <div style={{ fontSize:11, color:"#9070ff", letterSpacing:2, fontWeight:600 }}>{"✦ " + (t.prestige||"PRESTIGE").toUpperCase() + (prestige > 0 ? " " + prestige : "")}</div>
            </div>
            {prestige > 0 && (
              <div style={{ marginBottom:6 }}>
                <div style={{ fontSize:11, color:"#c0a0ff" }}>{prestigeTitle}</div>
                <div style={{ fontSize:11, color:"#6a50aa", marginTop:2 }}>{"×" + getPrestigeIncomeMultiplier(prestige).toFixed(0) + " " + (t.prestigeGlobalIncome||"ingresos globales")}</div>
              </div>
            )}
            <div style={{ fontSize:12, color:"#8888aa", marginBottom:4 }}>
              {canPrestige ? t.prestigeReady : ((t.prestigeNeed||"Need:") + " " + fmt(nextPrestigeReq))}
            </div>
            <div className="pb" style={{ marginBottom:8 }}>
              <div className="pf" style={{ width: Math.min(100,(totalEarned/nextPrestigeReq)*100) + "%", background:"linear-gradient(90deg,#6040c0,#9060ff)" }} />
            </div>
            <div style={{ fontSize:11, color:"#8080a8", marginBottom:6 }}>
              {(t.prestigeNext||"Next:") + " ×" + getPrestigeIncomeMultiplier(prestige+1).toFixed(0) + " " + (t.prestigeGlobalIncome||"income") + " · " + (t.prestigeStocksKept||"Stocks kept")}
              {prestige >= 2 && (" · " + (t.prestigeCostBiz||"-20% biz cost"))}
              {prestige >= 4 && (" · " + (t.prestigeCostMgr||"-50% mgr cost"))}
            </div>
            {canPrestige && (
              <button onClick={handlePrestige} style={{ width:"100%", background:"linear-gradient(135deg,#1a0a3a,#2a1060)", border:"1px solid #8060ff", borderRadius:6, color:"#c0a0ff", padding:"8px", cursor:"pointer", fontFamily:"inherit", fontSize:11, letterSpacing:1 }}>
                {"✦ " + t.prestigeReset}
              </button>
            )}
            {!canPrestige && prestige === 0 && (
              <div style={{ fontSize:11, color:"#7070a0", textAlign:"center" }}>{(t.prestigeUnlock||"Reach") + " " + fmt(nextPrestigeReq) + " " + (t.prestigeUnlockSuffix||"to unlock")}</div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* TABS */}
          <div style={{ borderBottom:"1px solid #161628", padding:"0 4px", display:"flex", gap:0, overflowX:"auto", scrollbarWidth:"none" }}>
            {[["businesses",t.tabBusinesses],["upgrades",t.tabUpgrades],["managers",t.tabManagers],["missions",t.tabMissions||"Missions"],["stocks",t.tabStocks],["crypto",t.tabCrypto||"Crypto"],["portfolio",t.tabPortfolio],["casino",t.tabCasino||"Casino"],["achievements",t.tabAchievements],["ranking","🏆 Ranking"]].map(([id,label]) => (
              <button key={id} className={"tab-btn" + (activeTab===id?" active":"")} onClick={() => { setActiveTab(id); if(id==="ranking"){ fetchGlobalLeaderboard(); fetchRegionalLeaderboard(); } }}
                style={{ position:"relative" }}>
                {label}
                {id === "missions" && totalClaimable > 0 && (
                  <span style={{ position:"absolute", top:4, right:2, background:"#e05050", color:"#fff",
                    borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                    {totalClaimable > 9 ? "9+" : totalClaimable}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", ...(activeTab==="casino" && { backgroundImage:"url('./casino_felt.png')", backgroundRepeat:"repeat", backgroundSize:"220px 220px" }) }}>

            {/* ── BUSINESSES ── */}
            {activeTab === "businesses" && (
              <div>
                {/* Buy multiplier selector */}
                <div style={{ display:"flex", gap:4, marginBottom:10, background:"#08080f", borderRadius:8, padding:4 }}>
                  {[[1,"×1"],[10,"×10"],[100,"×100"],["max","MAX"]].map(([val,label]) => (
                    <button key={val} onClick={() => setBuyMultiplier(val)}
                      style={{ flex:1, padding:"5px 0", fontSize:11, fontWeight:700, cursor:"pointer",
                        fontFamily:"inherit", borderRadius:6, letterSpacing:.5,
                        background: buyMultiplier===val ? "linear-gradient(135deg,#1a3a1a,#0f2a0f)" : "transparent",
                        border: buyMultiplier===val ? "1px solid #3a7a3a" : "1px solid transparent",
                        color: buyMultiplier===val ? "#6abf7a" : "#4a4a7a" }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Category pills */}
                <div style={{ marginBottom:12 }}>
                  {Object.entries(catLabel).map(([cat,label]) => (
                    <button key={cat} className={"pill" + (bizCatTab===cat?" active":"")} onClick={() => setBizCatTab(cat)}>{label}</button>
                  ))}
                </div>

                {/* Business cards */}
                <div className="card-grid">
                {allBusinesses.filter(b => b.category === bizCatTab).map(biz => {
                  const count       = owned[biz.id] || 0;
                  const mgrLvl      = managers[biz.id] || 0;
                  const milestone   = getBizMilestoneMultiplier(count);
                  const next        = nextMilestone(count);
                  const incUnit     = biz.baseIncome * catMult(biz.category) * ceoLevel.bonus * globalMult * getManagerMult(biz.id) * milestone * prestigeMult;
                  const bizDesc     = (BUSINESS_DESCS[biz.id]||{})[lang] || (BUSINESS_DESCS[biz.id]||{}).en || "";
                  // Bulk cost según multiplicador
                  const maxN        = buyMultiplier === "max" ? Math.max(1, (() => { let n=0,tot=0; while(true){ const nx=getBizCost(biz,count+n,bizCostReduce); if(tot+nx>money)break; tot+=nx; n++; if(n>=10000)break; } return n; })()) : buyMultiplier;
                  const bulkN       = buyMultiplier === "max" ? maxN : buyMultiplier;
                  const bulkCost    = (() => { let t=0; for(let i=0;i<bulkN;i++) t+=getBizCost(biz,count+i,bizCostReduce); return t; })();
                  const canAfford   = money >= bulkCost && bulkN > 0;
                  const cost        = getBizCost(biz, count, bizCostReduce); // precio unitario para payback
                  const paybackSec  = incUnit > 0 ? Math.ceil(cost / incUnit) : null;
                  const fmtPayback  = s => s < 60 ? s + "s" : s < 3600 ? Math.ceil(s/60) + "m" : Math.ceil(s/3600) + "h";
                  return (
                    <div key={biz.id} className={"card hl" + (!canAfford?" dis":"")}
                      style={{ padding:"12px 14px", display:"flex", alignItems:"flex-start", gap:13, marginBottom:8, cursor: canAfford ? "pointer" : "default" }}
                      onClick={() => canAfford && buyBiz(biz, buyMultiplier)}>

                      {/* Image / icon */}
                      <div style={{ width:52, height:52, borderRadius:8, background:"#0a0a12", border:"1px solid #1c1c2e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, overflow:"hidden" }}>
                        <img src={biz.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none";e.target.parentNode.textContent=biz.icon;}} />
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0 }}>
                        {/* Row 1: name + badges */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:600, color: canAfford ? "#e8e0d0" : "#555" }}>{biz.name[lang]||biz.name.en}</span>
                          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                            {mgrLvl > 0 && <span style={{ fontSize:10, color:"#5aab6a" }}>{"⚙️×" + mgrLvl}</span>}
                            {milestone > 1 && <span style={{ fontSize:10, color:"#c9a84c" }}>{"★×" + milestone}</span>}
                            <span className="badge" style={{ minWidth:28, textAlign:"center" }}>{count > 0 ? "x"+count : "—"}</span>
                          </div>
                        </div>

                        {/* Row 2: description */}
                        {bizDesc && (
                          <div style={{ fontSize:11, color:"#8080a8", marginBottom:6, lineHeight:1.4 }}>{bizDesc}</div>
                        )}

                        {/* Row 3: price | income | payback */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:13, fontWeight:600, color:canAfford?"#c9a84c":"#3a3020" }}>
                              {fmt(bulkCost)}
                            </span>
                            {buyMultiplier !== 1 && bulkN > 0 && (
                              <span style={{ fontSize:10, background: canAfford?"rgba(90,171,106,0.15)":"rgba(60,60,60,0.3)", color:canAfford?"#5aab6a":"#444", border:`1px solid ${canAfford?"#2a5a3a":"#333"}`, borderRadius:4, padding:"1px 5px" }}>
                                ×{bulkN}
                              </span>
                            )}
                            {paybackSec && count === 0 && buyMultiplier === 1 && (
                              <span style={{ fontSize:10, color:"#3a3a5a" }}>{"⏱ " + fmtPayback(paybackSec)}</span>
                            )}
                            {next && count > 0 && <span style={{ fontSize:10, color:"#7878a8" }}>{"→ ×2 @ " + next}</span>}
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <span style={{ fontSize:12 }} className="green">
                              {count > 0
                                ? "+" + fmt(incUnit * count) + "/s"
                                : "+" + fmt(incUnit) + "/s"}
                            </span>
                            {count > 0 && mgrLvl > 0 && <span style={{ fontSize:10, color:"#5aab6a", marginLeft:4 }}>⚙️</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* ── UPGRADES ── */}
            {activeTab === "upgrades" && (
              <div>
                <div className="dim" style={{ marginBottom:12, letterSpacing:1.5 }}>{t.upgAvailable}</div>
                <div className="card-grid">
                {upgrades.map(upg => {
                  const canAfford = money >= upg.cost;
                  return (
                    <div key={upg.id} className={"card" + (upg.bought?"":" hl")}
                      style={{ padding:"10px 13px", cursor:upg.bought?"default":"pointer", opacity:upg.bought?1:canAfford?1:0.4, border:upg.bought?"1px solid #1a3a1a":"1px solid #1c1c2e", background:upg.bought?"#0c180c":"#10101a" }}
                      onClick={() => !upg.bought && buyUpgrade(upg)}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:13, color:upg.bought?"#5aab6a":"#e8e0d0" }}>{(upg.bought?"✓ ":"") + (upg.name[lang]||upg.name.en)}</span>
                        <span style={{ fontSize:12, color:upg.bought?"#2a4a2a":canAfford?"#c9a84c":"#444" }}>{upg.bought?t.bought:fmt(upg.cost)}</span>
                      </div>
                      <div className="dim" style={{ marginTop:3 }}>{upg.desc[lang]||upg.desc.en}</div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}


            {/* ── MISSIONS ── */}
            {activeTab === "missions" && (
              <div>
                {/* Active bonuses */}
                {(activeMult || activeDiscount) && (
                  <div style={{ marginBottom:14, display:"flex", flexWrap:"wrap" }}>
                    {activeMult && activeMult.expiresAt > Date.now() && (
                      <span className="active-bonus">
                        {"⚡ x" + activeMult.value + " income · " + Math.max(0,Math.floor((activeMult.expiresAt-Date.now())/1000)) + "s"}
                      </span>
                    )}
                    {activeDiscount && activeDiscount.expiresAt > Date.now() && (
                      <span className="active-bonus">
                        {"🏷️ -" + Math.round((1-activeDiscount.value)*100) + "% cost · " + Math.max(0,Math.floor((activeDiscount.expiresAt-Date.now())/1000)) + "s"}
                      </span>
                    )}
                  </div>
                )}

                {/* Sub-tabs */}
                <div style={{ display:"flex", gap:0, marginBottom:16, borderBottom:"1px solid #161628" }}>
                  {[["progress", t.missionProgress||"Progress", claimableProgress],
                    ["daily",    t.missionDaily||"Daily",       claimableDaily],
                    ["chains",   t.missionChains||"Chains",     claimableChains]
                  ].map(([id,label,count]) => (
                    <button key={id} className={"tab-btn" + (missionTab===id?" active":"")} style={{ fontSize:10, position:"relative" }} onClick={() => setMissionTab(id)}>
                      {label}
                      {count > 0 && (
                        <span style={{ marginLeft:5, background:"#e05050", color:"#fff",
                          borderRadius:10, padding:"1px 5px", fontSize:9, fontWeight:700 }}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* PROGRESS MISSIONS */}
                {missionTab === "progress" && (
                  <div>
                    <div className="dim" style={{ marginBottom:12, letterSpacing:1.5 }}>
                      {completedProgress.length}/{PROGRESS_MISSIONS.length} completed
                    </div>
                    {PROGRESS_MISSIONS.map(m => {
                      const isDone = completedProgress.includes(m.id);
                      const state = { totalEarned, owned, managers, stocks, portfolio, prestige, totalClicks };
                      const isReady = !isDone && m.check(state);
                      return (
                        <div key={m.id} className={"mcard" + (isDone?" done":isReady?" ready":"")}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                              <span style={{ fontSize:22 }}>{m.icon}</span>
                              <div>
                                <div style={{ fontSize:13, fontWeight:500, color:isDone?"#5aab6a":isReady?"#c9a84c":"#e8e0d0" }}>
                                  {isDone?"✓ ":""}{m.name[lang]||m.name.en}
                                </div>
                                <div className="dim" style={{ marginTop:2 }}>{m.desc[lang]||m.desc.en}</div>
                                <div style={{ fontSize:11, color:"#8060ff", marginTop:3 }}>
                                  {t.missionReward||"Reward"}: {m.reward.type==="money" ? fmt(m.reward.amount) : m.reward.type==="mult" ? "x"+m.reward.amount+" income ("+Math.floor(m.reward.duration/60)+"min)" : "-"+Math.round((1-m.reward.amount)*100)+"% cost ("+Math.floor(m.reward.duration/60)+"min)"}
                                </div>
                              </div>
                            </div>
                            {isReady && (
                              <button className="btn btn-buy" style={{ flexShrink:0, fontSize:12, padding:"6px 14px" }}
                                onClick={() => claimProgressMission(m)}>
                                {t.missionClaim||"CLAIM"}
                              </button>
                            )}
                            {isDone && <span style={{ fontSize:11, color:"#2a5a2a", letterSpacing:1 }}>✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* DAILY MISSIONS */}
                {missionTab === "daily" && (
                  <div>
                    <div className="dim" style={{ marginBottom:12, letterSpacing:1.5 }}>
                      {t.missionDaily||"Daily missions"} · {dailyCompleted.length}/3
                    </div>
                    {dailyMissions.map(m => {
                      const isDone = dailyCompleted.includes(m.id);
                      const progress = m.type === "earn" ? Math.min(m.target, totalEarned) :
                                       m.type === "buy"  ? Math.min(m.target, dailyProgress.daily2||0) :
                                                           Math.min(m.target, dailyProgress.daily3||0);
                      const isReady = !isDone && progress >= m.target;
                      const pct = Math.min(100, (progress/m.target)*100);
                      return (
                        <div key={m.id} className={"mcard" + (isDone?" done":isReady?" ready":"")}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ flex:1, marginRight:12 }}>
                              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                <span style={{ fontSize:20 }}>{m.icon}</span>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:500, color:isDone?"#5aab6a":isReady?"#c9a84c":"#e8e0d0" }}>
                                    {isDone?"✓ ":""}{m.name[lang]||m.name.en}
                                  </div>
                                  <div className="dim" style={{ marginTop:2 }}>{m.desc[lang]||m.desc.en}</div>
                                  <div style={{ fontSize:11, color:"#8060ff", marginTop:3 }}>
                                    {t.missionReward||"Reward"}: {m.reward.type==="money" ? fmt(m.reward.amount) : m.reward.type==="mult" ? "x"+m.reward.amount+" income ("+Math.floor(m.reward.duration/60)+"min)" : "-"+Math.round((1-m.reward.amount)*100)+"% cost ("+Math.floor(m.reward.duration/60)+"min)"}
                                  </div>
                                </div>
                              </div>
                              {!isDone && (
                                <div className="mpb">
                                  <div className="mpf" style={{ width:pct+"%" }} />
                                </div>
                              )}
                              {!isDone && (
                                <div className="dim" style={{ marginTop:4 }}>
                                  {m.type === "earn" ? fmt(progress) + " / " + fmt(m.target) : progress + " / " + m.target}
                                </div>
                              )}
                            </div>
                            {isReady && (
                              <button className="btn btn-buy" style={{ flexShrink:0, fontSize:12, padding:"6px 14px" }}
                                onClick={() => claimDaily(m.id, m.reward)}>
                                {t.missionClaim||"CLAIM"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CHAIN MISSIONS */}
                {missionTab === "chains" && (
                  <div className="card-grid-sm">
                    {CHAIN_MISSIONS.map(chain => {
                      const currentStep = chainStep[chain.id] || 0;
                      const isComplete  = currentStep >= chain.steps.length;
                      const step        = isComplete ? null : chain.steps[currentStep];
                      const state       = { totalEarned, owned, managers, stocks, portfolio, prestige, totalCasinoPlays, totalCasinoWon, totalBjWins };
                      const progress    = step ? step.check(state) : 0;
                      const isReady     = step && progress >= step.target;
                      const pct         = step ? Math.min(100,(progress/step.target)*100) : 100;
                      return (
                        <div key={chain.id} className={"mcard" + (isComplete?" done":isReady?" ready":"")}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ flex:1, marginRight:12 }}>
                              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                                <span style={{ fontSize:22 }}>{chain.icon}</span>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:500, color:isComplete?"#5aab6a":isReady?"#c9a84c":"#e8e0d0" }}>
                                    {chain.name[lang]||chain.name.en}
                                  </div>
                                  <div className="dim">{currentStep}/{chain.steps.length} steps</div>
                                </div>
                              </div>
                              {/* Steps overview */}
                              <div style={{ display:"flex", gap:4, marginBottom:8 }}>
                                {chain.steps.map((_,i) => (
                                  <div key={i} style={{ height:4, flex:1, borderRadius:2, background: i<currentStep?"#5aab6a":i===currentStep?"#c9a84c":"#1c1c2e" }} />
                                ))}
                              </div>
                              {step && (
                                <>
                                  <div className="dim" style={{ marginBottom:4 }}>{step.desc[lang]||step.desc.en}</div>
                                  <div className="mpb">
                                    <div className="mpf" style={{ width:pct+"%" }} />
                                  </div>
                                  <div className="dim" style={{ marginTop:4 }}>{Math.min(progress,step.target)} / {step.target}</div>
                                  <div style={{ fontSize:11, color:"#8060ff", marginTop:3 }}>
                                    {t.missionReward||"Reward"}: {step.reward.type==="money" ? fmt(step.reward.amount) : step.reward.type==="mult" ? "x"+step.reward.amount+" income ("+Math.floor(step.reward.duration/60)+"min)" : "-"+Math.round((1-step.reward.amount)*100)+"% cost ("+Math.floor(step.reward.duration/60)+"min)"}
                                  </div>
                                </>
                              )}
                              {isComplete && <div style={{ fontSize:12, color:"#5aab6a" }}>✓ Chain completed!</div>}
                            </div>
                            {isReady && (
                              <button className="btn btn-buy" style={{ flexShrink:0, fontSize:12, padding:"6px 14px" }}
                                onClick={() => claimChainStep(chain.id, currentStep, step.reward)}>
                                {t.missionClaim||"CLAIM"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── MANAGERS ── */}
            {activeTab === "managers" && (
              <div>
                <div style={{ marginBottom:14 }}>
                  <div className="dim" style={{ letterSpacing:1.5, marginBottom:4 }}>{t.managerTitle}</div>
                  <div style={{ fontSize:12, color:"#8080a8", marginBottom:12 }}>{t.managerSub}</div>
                  {Object.entries(catLabel).map(([cat,label]) => (
                    <button key={cat} className={"pill" + (managerCatTab===cat?" active":"")} onClick={() => setManagerCatTab(cat)}>{label}</button>
                  ))}
                </div>
                <div className="card-grid">
                {allManagers.filter(mgr => {
                  const biz = allBusinesses.find(b => b.id === mgr.bizId);
                  return biz && biz.category === managerCatTab;
                }).map(mgr => {
                  const biz        = allBusinesses.find(b => b.id === mgr.bizId);
                  const bizCount   = owned[mgr.bizId] || 0;
                  const mgrLevel   = managers[mgr.bizId] || 0;
                  const isHired    = mgrLevel > 0;
                  const isMax      = mgrLevel >= MAX_MANAGER_LEVEL;
                  const noBiz      = bizCount === 0;
                  const hireCost   = getManagerHireCost(mgr);
                  const upgCost    = isHired && !isMax ? getManagerUpgradeCost(mgr, mgrLevel) : 0;
                  const canHire    = !isHired && !noBiz && money >= hireCost;
                  const upgCostFinal = Math.floor(upgCost * mgrCostReduce);
                  const canUpgrade = isHired && !isMax && money >= upgCostFinal;
                  const mult       = isHired ? getManagerMultiplier(mgrLevel) : 1;
                  const bizIncome  = biz && isHired ? biz.baseIncome * bizCount * catMult(biz.category) * ceoLevel.bonus * globalMult * mult : 0;
                  return (
                    <div key={mgr.bizId} className={"mc" + (isHired?" hm":"") + (noBiz&&!isHired?" nb":"")}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                        <div style={{ width:48, height:48, borderRadius:8, background:isHired?"#0f1f0f":"#0a0a12", border:"1px solid " + (isHired?"#2a5a2a":"#1c1c2e"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                          {mgr.icon}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div>
                              <div style={{ fontSize:13, fontWeight:500, color:isHired?"#5aab6a":"#e8e0d0" }}>{mgr.name[lang]||mgr.name.en}</div>
                              <div className="dim" style={{ marginTop:2 }}>{t.managerAutomates + ": " + (biz?.icon||"") + " " + (biz?.name[lang]||biz?.name.en||"") + " x" + bizCount}</div>
                            </div>
                            {isHired && (
                              <div style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                                {[1,2,3,4,5].map(pip => <span key={pip} className={"pip " + (pip<=mgrLevel?"on":"off")} />)}
                                <span style={{ fontSize:10, color:"#c9a84c", marginLeft:6 }}>{(t.managerLvl||"Lv") + mgrLevel}</span>
                              </div>
                            )}
                          </div>
                          {isHired && (
                            <div style={{ marginTop:5, fontSize:11, display:"flex", gap:12 }}>
                              <span className="green">{"+" + fmt(bizIncome) + "/s"}</span>
                              <span className="gold">{"x" + mult.toFixed(1) + " " + t.managerBonus}</span>
                            </div>
                          )}
                          <div style={{ marginTop:8, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                            {!isHired && (
                              <button className="btn btn-buy" disabled={!canHire}
                                style={{ opacity:noBiz?0.3:canHire?1:0.4, fontSize:11, padding:"5px 14px" }}
                                onClick={() => canHire && hireManager(mgr)}>
                                {t.managerHire + " · " + fmt(hireCost)}
                              </button>
                            )}
                            {isHired && !isMax && (
                              <button className="btn btn-buy" disabled={!canUpgrade}
                                style={{ opacity:canUpgrade?1:0.4, fontSize:11, padding:"5px 14px" }}
                                onClick={() => canUpgrade && upgradeManager(mgr)}>
                                {t.managerUpgrade + " Lv" + mgrLevel + "→" + (mgrLevel+1) + " · " + fmt(upgCostFinal)}
                              </button>
                            )}
                            {isHired && isMax && <span style={{ fontSize:11, color:"#c9a84c", letterSpacing:1 }}>{"⭐ " + t.managerMaxLevel}</span>}
                            {noBiz && !isHired && <span className="dim">{t.managerNoBiz}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* ── STOCKS ── */}
            {activeTab === "stocks" && (
              <div>
                {/* Sub-tabs */}
                <div style={{ display:"flex", gap:0, marginBottom:14, borderBottom:"1px solid #161628" }}>
                  {[["market",t.market||"Market"],["myshares",t.myShares||"My Shares"],["newshistory","📰 " + (t.newsTitle||"News")]].map(([id,label]) => (
                    <button key={id} className={"tab-btn" + (stockTab===id?" active":"")} style={{ fontSize:10 }} onClick={() => setStockTab(id)}>{label}</button>
                  ))}
                </div>

                {/* ── MARKET ── */}
                {stockTab === "market" && (
                  <>
                    {/* Collapsible guide */}
                    <div style={{ marginBottom:12 }}>
                      <button onClick={() => setShowStockGuide(v => !v)}
                        style={{ width:"100%", background:"#0c0c1a", border:"1px solid #2a2a50", borderRadius:8, padding:"10px 14px", cursor:"pointer", fontFamily:"inherit", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:12, color:"#8070c0" }}>{"📖 " + (lang==="es"?"¿Cómo funciona la bolsa?":lang==="fr"?"Comment fonctionne la bourse ?":lang==="de"?"Wie funktioniert die Börse?":lang==="zh"?"股市如何运作？":lang==="ja"?"株式市場の仕組み":lang==="pt"?"Como funciona a bolsa?":lang==="ru"?"Как работает биржа?":"How does the stock market work?")}</span>
                        <span style={{ color:"#8080a8", fontSize:14 }}>{showStockGuide ? "▲" : "▼"}</span>
                      </button>
                      {showStockGuide && (
                        <div style={{ background:"#090912", border:"1px solid #2a2a50", borderTop:"none", borderRadius:"0 0 8px 8px", padding:"14px 16px" }}>
                          {[
                            ["📈", lang==="es"?"Compra acciones de empresas cotizadas en el mercado.":lang==="fr"?"Achetez des actions des entreprises cotées en bourse.":lang==="de"?"Kaufe Aktien von börsennotierten Unternehmen.":lang==="zh"?"购买市场上上市公司的股票。":lang==="ja"?"市場に上場している企業の株を購入しよう。":lang==="pt"?"Compre ações das empresas listadas no mercado.":lang==="ru"?"Покупай акции компаний, торгующихся на рынке.":"Buy shares of companies listed on the market."],
                            ["💰", lang==="es"?"Cada 5 minutos reales cobras dividendos: el 0,02% del valor total de tus acciones.":lang==="fr"?"Toutes les 5 minutes vous recevez des dividendes : 0,02% de la valeur de vos actions.":lang==="de"?"Alle 5 Minuten erhältst du Dividenden: 0,02% des Gesamtwerts deiner Aktien.":lang==="zh"?"每5分钟获得股息：持股总价值的0.02%。":lang==="ja"?"5分ごとに配当金を受け取る：保有株の総価値の0.02%。":lang==="pt"?"A cada 5 minutos você recebe dividendos: 0,02% do valor total das suas ações.":lang==="ru"?"Каждые 5 минут ты получаешь дивиденды: 0,02% от стоимости твоих акций.":"Every 5 real minutes you earn dividends: 0.02% of your total share value."],
                            ["⭐", lang==="es"?"Si compras el 100% de las acciones de una empresa, la adquieres. Badge exclusivo + dividendos extra.":lang==="fr"?"Si vous achetez 100% des actions d'une entreprise, vous l'acquérez. Badge exclusif + dividendes supplémentaires.":lang==="de"?"Kaufst du 100% der Aktien eines Unternehmens, übernimmst du es. Exklusives Abzeichen + Extra-Dividenden.":lang==="zh"?"购买公司100%股份即可收购该公司。专属徽章+额外股息。":lang==="ja"?"100%の株を購入すると企業を買収できる。限定バッジ+追加配当。":lang==="pt"?"Comprando 100% das ações de uma empresa, você a adquire. Badge exclusivo + dividendos extras.":lang==="ru"?"Купив 100% акций компании, ты её приобретаешь. Эксклюзивный значок + дополнительные дивиденды.":"Buy 100% of a company's shares to acquire it. Exclusive badge + extra dividends."],
                            ["📰", lang==="es"?"Las noticias de mercado afectan los precios en tiempo real (±6% a ±35%). ¡Úsalas a tu favor!":lang==="fr"?"Les actualités du marché influencent les prix en temps réel (±6% à ±35%). Utilisez-les à votre avantage !":lang==="de"?"Marktnachrichten beeinflussen die Preise in Echtzeit (±6% bis ±35%). Nutze sie zu deinem Vorteil!":lang==="zh"?"市场新闻实时影响价格（±6%至±35%）。善加利用！":lang==="ja"?"市場ニュースがリアルタイムで価格に影響（±6%〜±35%）。うまく活用しよう！":lang==="pt"?"As notícias do mercado afetam os preços em tempo real (±6% a ±35%). Use-as a seu favor!":lang==="ru"?"Рыночные новости влияют на цены в реальном времени (±6% до ±35%). Используй это!":"Market news affects prices in real time (±6% to ±35%). Use them to your advantage!"],
                          ].map(([icon, text]) => (
                            <div key={icon} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                              <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                              <span style={{ fontSize:12, color:"#7a7090", lineHeight:1.6 }}>{text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sector pills */}
                    <div style={{ marginBottom:12 }}>
                      {sectors.map(sec => (
                        <button key={sec} className={"pill" + (stockSector===sec?" active":"")} onClick={() => setStockSector(sec)}>{sectorLabel(sec)}</button>
                      ))}
                    </div>

                    {/* Stock cards — mismo estilo que cripto */}
                    {visibleStocks.map(stock => {
                      const change       = ((stock.price - stock.prevPrice) / stock.prevPrice) * 100;
                      const ownedS       = portfolio[stock.id] || 0;
                      const pctOwned     = (ownedS / stock.totalShares) * 100;
                      const isFullyOwned = ownedS >= stock.totalShares;
                      const toAcquire    = stock.totalShares - ownedS;
                      const qty          = buyQty[stock.id] || "";
                      const buyCost      = (parseInt(qty)||0) * stock.price;
                      const maxBuyable   = Math.min(Math.floor(money / stock.price), toAcquire);
                      const divPer5min   = ownedS * stock.price * DIVIDEND_RATE;

                      // Sparkline
                      const hist = stock.history?.length > 1 ? stock.history : [stock.price, stock.price];
                      const minH = Math.min(...hist), maxH = Math.max(...hist);
                      const rng  = maxH - minH || 1;
                      const pts  = hist.slice(-20).map((v,i,a) => `${(i/(a.length-1))*80},${20 - ((v-minH)/rng)*18}`).join(" ");

                      return (
                        <div key={stock.id} style={{ background:"#0c0c18", border:"1px solid #1c1c2e", borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                          {/* Header */}
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:36, height:36, borderRadius:"50%", background:"#0a0a14", border:`2px solid ${change>=0?"#2a6a3a":"#6a2a2a"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{stock.icon}</div>
                              <div>
                                <div style={{ fontWeight:600, fontSize:14 }}>{stock.name} {isFullyOwned && <span style={{ fontSize:11, color:"#c9a84c" }}>★</span>}</div>
                                <div style={{ fontSize:11, color:"#8080a8", marginTop:1, letterSpacing:1 }}>{sectorLabel(stock.sector)}</div>
                              </div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:15, fontWeight:700, color:"#e8e0d0" }}>{fmt(stock.price)}</div>
                              <div style={{ fontSize:12, color: change >= 0 ? "#5aab6a" : "#c05050", fontWeight:600, marginTop:2 }}>
                                {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                              </div>
                              {/* Sparkline */}
                              <svg width="80" height="22" style={{ display:"block", marginTop:4 }}>
                                <polyline points={pts} fill="none" stroke={change >= 0 ? "#5aab6a" : "#c05050"} strokeWidth="1.5"/>
                              </svg>
                            </div>
                          </div>

                          {/* Holding info */}
                          {ownedS > 0 && (
                            <div style={{ background:"#080810", border:"1px solid #1c1c30", borderRadius:6, padding:"8px 12px", marginBottom:10, display:"flex", gap:16, fontSize:12, flexWrap:"wrap" }}>
                              <div><span style={{ color:"#8080a8" }}>{t.owned||"Acciones:"} </span><span style={{ color:"#c9a84c", fontWeight:600 }}>{fmtShares(ownedS)}</span></div>
                              <div><span style={{ color:"#8080a8" }}>Valor: </span><span style={{ color:"#6abf7a", fontWeight:600 }}>{fmt(ownedS * stock.price)}</span></div>
                              <div><span style={{ color:"#8080a8" }}>Div/5min: </span><span style={{ color:"#5aab6a", fontWeight:600 }}>{"+"+fmt(divPer5min)}</span></div>
                            </div>
                          )}

                          {/* Progress bar */}
                          {ownedS > 0 && !isFullyOwned && (
                            <div style={{ marginBottom:10 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                                <span style={{ fontSize:10, color:"#6060a0" }}>{pctOwned.toFixed(1)}% {lang==="es"?"adquirido":lang==="fr"?"acquis":lang==="de"?"erworben":lang==="pt"?"adquirido":lang==="ru"?"куплено":"acquired"}</span>
                                <span style={{ fontSize:10, color:"#5050a0" }}>{fmtShares(toAcquire)} {lang==="es"?"restantes":lang==="fr"?"restants":lang==="de"?"verbleibend":lang==="pt"?"restantes":lang==="ru"?"осталось":"left"}</span>
                              </div>
                              <div style={{ height:4, background:"#1a1a2a", borderRadius:2, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:pctOwned+"%", background:"#4060d0", borderRadius:2, transition:"width .3s" }}/>
                              </div>
                            </div>
                          )}

                          {/* Stats row */}
                          <div style={{ display:"flex", gap:0, marginBottom:10, background:"#080810", borderRadius:6, overflow:"hidden" }}>
                            <div style={{ flex:1, padding:"7px 10px", borderRight:"1px solid #161626" }}>
                              <div style={{ fontSize:10, color:"#6868a0", marginBottom:2 }}>{t.toAcquire||"Para adquirir"}</div>
                              <div style={{ fontSize:12, color: isFullyOwned?"#c9a84c":"#8888aa", fontWeight:600 }}>{isFullyOwned ? "★ "+( t.acquired||"OWNED") : fmtShares(toAcquire)}</div>
                            </div>
                            <div style={{ flex:1, padding:"7px 10px", borderRight:"1px solid #161626" }}>
                              <div style={{ fontSize:10, color:"#6868a0", marginBottom:2 }}>% {lang==="es"?"Adquirido":lang==="fr"?"Acquis":lang==="de"?"Erworben":lang==="zh"?"收购":lang==="ja"?"取得":lang==="pt"?"Adquirido":lang==="ru"?"Куплено":"Acquired"}</div>
                              <div style={{ fontSize:12, color: pctOwned>0?(isFullyOwned?"#c9a84c":"#6090ff"):"#3a3a5a", fontWeight:600 }}>{pctOwned.toFixed(1)+"%"}</div>
                            </div>
                            <div style={{ flex:1, padding:"7px 10px" }}>
                              <div style={{ fontSize:10, color:"#6868a0", marginBottom:2 }}>{t.divEstimate||"Div/5min"}</div>
                              <div style={{ fontSize:12, color: divPer5min>0?"#5aab6a":"#3a3a5a", fontWeight:600 }}>{divPer5min>0?"+"+fmt(divPer5min):"—"}</div>
                            </div>
                          </div>

                          {/* Trade controls */}
                          {!isFullyOwned ? (
                            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                              <input type="number" min="1" placeholder="Cantidad" value={qty}
                                onChange={e => setBuyQty(q=>({...q,[stock.id]:e.target.value}))} onClick={e=>e.stopPropagation()}
                                style={{ flex:2, background:"#0a0a14", border:"1px solid #2a2a40", borderRadius:6, color:"#e8e0d0", padding:"6px 10px", fontSize:12, fontFamily:"inherit" }}/>
                              <button onClick={e=>{e.stopPropagation();setBuyQty(q=>({...q,[stock.id]:maxBuyable.toString()}));}}
                                style={{ background:"#0f0f1a", border:"1px solid #2a2a40", borderRadius:6, color:"#8888aa", padding:"6px 8px", fontSize:10, cursor:"pointer" }}>MAX</button>
                              <button disabled={!qty||buyCost>money||parseInt(qty)<=0}
                                onClick={e=>{e.stopPropagation();buyShares(stock,qty);}}
                                style={{ background:"#0f1a0f", border:"1px solid #1a3a1a", borderRadius:6, color:"#5aab6a", padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600, opacity:(!qty||buyCost>money)?0.4:1 }}>BUY</button>
                              <button disabled={ownedS<=0||!qty||parseInt(qty)<=0}
                                onClick={e=>{e.stopPropagation();sellShares(stock,qty);}}
                                style={{ background: ownedS>0&&qty?"#1a0f0f":"#0a0a0a", border:`1px solid ${ownedS>0&&qty?"#3a1a1a":"#1a1a1a"}`, borderRadius:6, color: ownedS>0&&qty?"#c05050":"#333", padding:"6px 14px", fontSize:12, cursor: ownedS>0&&qty?"pointer":"default", fontWeight:600 }}>SELL</button>
                            </div>
                          ) : (
                            <div style={{ textAlign:"center", fontSize:12, color:"#c9a84c", padding:"6px", letterSpacing:1.5, background:"rgba(201,168,76,0.08)", borderRadius:6, border:"1px solid rgba(201,168,76,0.2)" }}>{"★ " + (t.acquiredFull||"COMPANY ACQUIRED")}</div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ── NEWS ── */}
                {stockTab === "newshistory" && (
                  <div>
                    <div className="dim" style={{ letterSpacing:1.5, marginBottom:14 }}>{t.newsTitle||"MARKET NEWS"}</div>
                    {newsTicker.length === 0 ? (
                      <div className="dim" style={{ textAlign:"center", marginTop:40 }}>
                        {lang==="es"?"Sin noticias aún. Vuelve pronto...":lang==="fr"?"Pas encore de nouvelles...":lang==="de"?"Noch keine Nachrichten...":lang==="zh"?"暂无新闻。":lang==="ja"?"まだニュースはありません。":lang==="pt"?"Sem notícias ainda...":lang==="ru"?"Новостей пока нет...":"No news yet. Check back soon..."}
                      </div>
                    ) : (
                      <div className="card" style={{ overflow:"hidden" }}>
                        {newsTicker.map(item => {
                          const affected = item.stockId ? STOCK_COMPANIES.find(s => s.id === item.stockId) : null;
                          return (
                            <div key={item.id} className="ticker-item">
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, color:"#e8e0d0" }}>{item.text[lang]||item.text.en}</div>
                                {affected && (
                                  <div className="dim" style={{ marginTop:3 }}>
                                    {affected.icon} {affected.name}
                                    <span style={{ marginLeft:8, color: item.impact>0?"#5aab6a":"#c05050", fontWeight:600 }}>
                                      {item.impact>0?"▲":"▼"} {Math.abs(item.impact*100).toFixed(0)}%
                                    </span>
                                  </div>
                                )}
                                {!affected && <div className="dim" style={{ marginTop:3 }}>🌐 {lang==="es"?"Impacto macro global":lang==="fr"?"Impact macro global":lang==="de"?"Globaler Makroeinfluss":lang==="zh"?"全球宏观影响":lang==="ja"?"グローバルマクロインパクト":lang==="pt"?"Impacto macro global":lang==="ru"?"Глобальный макроэффект":"Global market impact"}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── MY SHARES ── */}
                {stockTab === "myshares" && (
                  <div>
                    {ownedStocks.length === 0 ? (
                      <div style={{ textAlign:"center", marginTop:60 }}>
                        <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
                        <div className="dim">{t.noShares||"No shares yet. Go to Market to invest."}</div>
                      </div>
                    ) : (
                      <>
                        {/* Portfolio summary — estilo cripto */}
                        <div style={{ background:"linear-gradient(135deg,#0a0a1e,#0e0e20)", border:"1px solid #1c1c3a", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
                          <div style={{ fontSize:10, color:"#6060a0", letterSpacing:2, marginBottom:10 }}>📊 RESUMEN DE CARTERA</div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"#161626", borderRadius:8, overflow:"hidden" }}>
                            {[
                              [lang==="es"?"Valor total":lang==="fr"?"Valeur totale":lang==="de"?"Gesamtwert":lang==="zh"?"总价值":lang==="ja"?"総価値":lang==="pt"?"Valor total":lang==="ru"?"Общая стоимость":"Total value", fmt(portfolioValue), "#6090ff"],
                              [lang==="es"?"Empresas":lang==="fr"?"Entreprises":lang==="de"?"Unternehmen":lang==="zh"?"公司":lang==="ja"?"企業":lang==="pt"?"Empresas":lang==="ru"?"Компании":"Companies", ownedStocks.length, "#c9a84c"],
                              [t.divEstimate||"Div/5min", "+" + fmt(ownedStocks.reduce((s,st)=>(portfolio[st.id]||0)*st.price*DIVIDEND_RATE+s,0)), "#5aab6a"],
                            ].map(([label,val,color]) => (
                              <div key={label} style={{ background:"#0a0a14", padding:"12px 14px" }}>
                                <div style={{ fontSize:10, color:"#6868a0", marginBottom:4, letterSpacing:1 }}>{label}</div>
                                <div style={{ fontSize:15, fontWeight:700, color }}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Owned stock cards — estilo cripto */}
                        {ownedStocks.map(stock => {
                          const shares    = portfolio[stock.id];
                          const value     = shares * stock.price;
                          const change    = ((stock.price - stock.prevPrice) / stock.prevPrice) * 100;
                          const pctOwned  = (shares / stock.totalShares) * 100;
                          const toAcquire = stock.totalShares - shares;
                          const qty       = buyQty[stock.id] || "";
                          const divPer5   = shares * stock.price * DIVIDEND_RATE;
                          const maxBuyable = Math.min(Math.floor(money / stock.price), toAcquire);

                          // Sparkline
                          const hist2 = stock.history?.length > 1 ? stock.history : [stock.price, stock.price];
                          const minH2 = Math.min(...hist2), maxH2 = Math.max(...hist2);
                          const rng2  = maxH2 - minH2 || 1;
                          const pts2  = hist2.slice(-20).map((v,i,a) => `${(i/(a.length-1))*80},${20 - ((v-minH2)/rng2)*18}`).join(" ");

                          return (
                            <div key={stock.id} style={{ background:"#0c0c18", border:"1px solid #1c1c2e", borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                              {/* Header */}
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                  <div style={{ width:36, height:36, borderRadius:"50%", background:"#0a0a14", border:`2px solid ${change>=0?"#2a6a3a":"#6a2a2a"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{stock.icon}</div>
                                  <div>
                                    <div style={{ fontWeight:600, fontSize:14 }}>{stock.name} {pctOwned>=100&&<span style={{ fontSize:11, color:"#c9a84c" }}>★</span>}</div>
                                    <div style={{ fontSize:11, color:"#8080a8", marginTop:1 }}>{sectorLabel(stock.sector)}</div>
                                  </div>
                                </div>
                                <div style={{ textAlign:"right" }}>
                                  <div style={{ fontSize:15, fontWeight:700, color:"#6090ff" }}>{fmt(value)}</div>
                                  <div style={{ fontSize:12, color: change >= 0 ? "#5aab6a" : "#c05050", fontWeight:600, marginTop:2 }}>
                                    {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                                  </div>
                                  <svg width="80" height="22" style={{ display:"block", marginTop:4 }}>
                                    <polyline points={pts2} fill="none" stroke={change >= 0 ? "#5aab6a" : "#c05050"} strokeWidth="1.5"/>
                                  </svg>
                                </div>
                              </div>

                              {/* Info row */}
                              <div style={{ background:"#080810", border:"1px solid #1c1c30", borderRadius:6, padding:"8px 12px", marginBottom:10, display:"flex", gap:16, fontSize:12, flexWrap:"wrap" }}>
                                <div><span style={{ color:"#8080a8" }}>{t.shares||"Acciones:"} </span><span style={{ color:"#c9a84c", fontWeight:600 }}>{fmtShares(shares)}</span></div>
                                <div><span style={{ color:"#8080a8" }}>Div/5min: </span><span style={{ color:"#5aab6a", fontWeight:600 }}>{"+"+fmt(divPer5)}</span></div>
                                <div><span style={{ color:"#8080a8" }}>% </span><span style={{ color: pctOwned>=100?"#c9a84c":"#6090ff", fontWeight:600 }}>{pctOwned.toFixed(1)}%</span></div>
                              </div>

                              {/* Progress bar */}
                              {pctOwned < 100 && (
                                <div style={{ marginBottom:10 }}>
                                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                                    <span style={{ fontSize:10, color:"#6060a0" }}>{pctOwned.toFixed(1)}% {lang==="es"?"adquirido":lang==="fr"?"acquis":lang==="de"?"erworben":lang==="pt"?"adquirido":lang==="ru"?"куплено":"acquired"}</span>
                                    <span style={{ fontSize:10, color:"#5050a0" }}>{fmtShares(toAcquire)} {lang==="es"?"restantes":lang==="fr"?"restants":lang==="de"?"verbleibend":lang==="pt"?"restantes":lang==="ru"?"осталось":"left"}</span>
                                  </div>
                                  <div style={{ height:4, background:"#1a1a2a", borderRadius:2, overflow:"hidden" }}>
                                    <div style={{ height:"100%", width:pctOwned+"%", background:"#4060d0", borderRadius:2, transition:"width .4s" }}/>
                                  </div>
                                </div>
                              )}

                              {/* Controls */}
                              <div style={{ display:"flex", gap:6 }}>
                                <input type="number" min="1" placeholder="Cantidad" value={qty}
                                  onChange={e => setBuyQty(q=>({...q,[stock.id]:e.target.value}))}
                                  style={{ flex:2, background:"#0a0a14", border:"1px solid #2a2a40", borderRadius:6, color:"#e8e0d0", padding:"6px 10px", fontSize:12, fontFamily:"inherit" }}/>
                                {toAcquire > 0 && (
                                  <button onClick={()=>setBuyQty(q=>({...q,[stock.id]:maxBuyable.toString()}))}
                                    style={{ background:"#0f0f1a", border:"1px solid #2a2a40", borderRadius:6, color:"#8888aa", padding:"6px 8px", fontSize:10, cursor:"pointer" }}>MAX</button>
                                )}
                                {toAcquire > 0 && (
                                  <button disabled={!qty||parseInt(qty)<=0||(parseInt(qty)||0)*stock.price>money}
                                    onClick={()=>buyShares(stock,qty)}
                                    style={{ background:"#0f1a0f", border:"1px solid #1a3a1a", borderRadius:6, color:"#5aab6a", padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600, opacity:(!qty||(parseInt(qty)||0)*stock.price>money)?0.4:1 }}>BUY</button>
                                )}
                                <button disabled={!qty||parseInt(qty)<=0}
                                  onClick={()=>sellShares(stock,qty)}
                                  style={{ background: qty&&parseInt(qty)>0?"#1a0f0f":"#0a0a0a", border:`1px solid ${qty&&parseInt(qty)>0?"#3a1a1a":"#1a1a1a"}`, borderRadius:6, color: qty&&parseInt(qty)>0?"#c05050":"#333", padding:"6px 14px", fontSize:12, cursor: qty&&parseInt(qty)>0?"pointer":"default", fontWeight:600 }}>SELL</button>
                                <button onClick={()=>sellShares(stock,shares.toString())}
                                  style={{ background:"#1a0f0f", border:"1px solid #3a1a1a", borderRadius:6, color:"#c05050", padding:"6px 10px", fontSize:11, cursor:"pointer", opacity:.7 }}>{t.sellAll||"ALL"}</button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── CHART ── */}

            {activeTab === "crypto" && (() => {
              const fmt2 = (n) => {
                if (n >= 1000) return fmt(n);
                if (n >= 1)    return n.toFixed(2);
                if (n >= 0.01) return n.toFixed(4);
                return n.toFixed(6);
              };
              const getCryptoQty = (c) => {
                const raw = cryptoInput[c.id] || "";
                const mode = cryptoBuyMode[c.id] || "usd";
                if (mode === "usd") {
                  const dollars = parseFloat(raw);
                  return dollars > 0 ? dollars / c.price : 0;
                }
                return parseFloat(raw) || 0;
              };
              const handleCryptoBuy = (c) => {
                const qty = getCryptoQty(c);
                if (!qty || qty <= 0) return;
                const cost = qty * c.price;
                if (money < cost) return;
                const oldQty = cryptoWallet[c.id] || 0;
                const oldAvg = cryptoAvgBuy[c.id] || c.price;
                const newAvg = oldQty > 0 ? (oldAvg * oldQty + cost) / (oldQty + qty) : c.price;
                setMoney(m => m - cost);
                setCryptoWallet(w => ({ ...w, [c.id]: (w[c.id]||0) + qty }));
                setCryptoAvgBuy(a => ({ ...a, [c.id]: newAvg }));
                sfx('buy');
                setCryptoInput(ci => ({ ...ci, [c.id]: "" }));
              };
              const handleCryptoSell = (c) => {
                const owned = cryptoWallet[c.id] || 0;
                const mode = cryptoBuyMode[c.id] || "usd";
                let qty;
                if (cryptoInput[c.id]) {
                  qty = mode === "usd"
                    ? parseFloat(cryptoInput[c.id]) / c.price
                    : parseFloat(cryptoInput[c.id]);
                } else {
                  qty = owned;
                }
                if (!qty || qty <= 0 || qty > owned) return;
                const gain = qty * c.price;
                setMoney(m => m + gain);
                setTotalEarned(te => te + gain);
                const newQty = (cryptoWallet[c.id]||0) - qty;
                setCryptoWallet(w => {
                  if (newQty <= 0) { const nw = {...w}; delete nw[c.id]; return nw; }
                  return { ...w, [c.id]: newQty };
                });
                if (newQty <= 0) setCryptoAvgBuy(a => { const na = {...a}; delete na[c.id]; return na; });
                sfx('sell');
                setCryptoInput(ci => ({ ...ci, [c.id]: "" }));
              };

              return (
                <div>
                  {/* Evento activo crypto */}
                  {activeCryptoEvent && (
                    <div style={{ background:"linear-gradient(135deg,#1a0a2e,#2a1060)", border:"2px solid #8060ff", borderRadius:10, padding:"12px 16px", marginBottom:14, display:"flex", gap:12, alignItems:"center" }}>
                      <span style={{ fontSize:24 }}>{activeCryptoEvent.event.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color:"#8060ff", letterSpacing:2, marginBottom:2 }}>⚡ CRYPTO EVENT</div>
                        <div style={{ fontSize:13, color:"#e8e0d0", fontWeight:600 }}>{activeCryptoEvent.event.text[lang]||activeCryptoEvent.event.text.en}</div>
                        <div style={{ fontSize:11, color: activeCryptoEvent.event.impact > 0 ? "#5aab6a" : "#c05050", marginTop:3 }}>
                          {activeCryptoEvent.event.impact > 0 ? "▲" : "▼"} {Math.abs(activeCryptoEvent.event.impact*100).toFixed(0)}%
                          {" · "}{Math.max(0, Math.ceil((activeCryptoEvent.endsAt - Date.now()) / 60000))}m
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cards de cryptos */}
                  {cryptos.map(c => {
                    const owned  = cryptoWallet[c.id] || 0;
                    const val    = owned * c.price;
                    const change = c.prevPrice ? ((c.price - c.prevPrice) / c.prevPrice * 100) : 0;
                    const profit = owned > 0 && c.history?.length > 1
                      ? (c.price - c.history[0]) / c.history[0] * 100 : 0;

                    // Mini sparkline
                    const hist = c.history?.length > 1 ? c.history : [c.price, c.price];
                    const minH = Math.min(...hist), maxH = Math.max(...hist);
                    const rng  = maxH - minH || 1;
                    const pts  = hist.map((v,i) => `${(i/(hist.length-1))*80},${20 - ((v-minH)/rng)*18}`).join(" ");

                    return (
                      <div key={c.id} style={{ background:"#0c0c18", border:"1px solid #1c1c2e", borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:"50%", background:"#0a0a14", border:`2px solid ${c.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:c.color, fontWeight:700 }}>{c.icon}</div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:14 }}>{c.name} <span style={{ color:"#8080a8", fontSize:11 }}>{c.symbol}</span></div>
                              <div style={{ fontSize:13, color:"#c9a84c", marginTop:1 }}>${fmt2(c.price)}</div>
                            </div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:12, color: change >= 0 ? "#5aab6a" : "#c05050", fontWeight:600 }}>
                              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                            </div>
                            {/* Sparkline */}
                            <svg width="80" height="22" style={{ display:"block", marginTop:4 }}>
                              <polyline points={pts} fill="none" stroke={change >= 0 ? "#5aab6a" : "#c05050"} strokeWidth="1.5"/>
                            </svg>
                          </div>
                        </div>

                        {owned > 0 && (() => {
                          const avgBuy   = cryptoAvgBuy[c.id] || c.price;
                          const invested = owned * avgBuy;
                          const pnl      = val - invested;
                          const pnlPct   = invested > 0 ? (pnl / invested * 100) : 0;
                          return (
                            <div style={{ background:"#0c0c20", border:"1px solid #2a2a40", borderRadius:6, padding:"8px 12px", marginBottom:10, fontSize:12 }}>
                              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                                <div><span style={{ color:"#b0a8c8" }}>{t.holding||"Holding:"} </span><span style={{ color:"#c9a84c", fontWeight:600 }}>{owned.toFixed(owned < 1 ? 4 : 2)} {c.symbol}</span></div>
                                <div><span style={{ color:"#b0a8c8" }}>{t.valueLabel||"Value:"} </span><span style={{ color:"#6abf7a", fontWeight:600 }}>${fmt2(val)}</span></div>
                              </div>
                              <div style={{ display:"flex", gap:16, marginTop:5, flexWrap:"wrap" }}>
                                <div><span style={{ color:"#b0a8c8" }}>Invertido: </span><span style={{ color:"#e8e0d0" }}>${fmt2(invested)}</span></div>
                                <div><span style={{ color:"#b0a8c8" }}>P&L: </span>
                                  <span style={{ color: pnl >= 0 ? "#6abf7a" : "#d06060", fontWeight:600 }}>
                                    {pnl >= 0 ? "+" : ""}{fmt2(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Mode toggle + input row */}
                        {(() => {
                          const mode = cryptoBuyMode[c.id] || "usd";
                          const rawVal = cryptoInput[c.id] || "";
                          const previewQty = mode === "usd" && rawVal
                            ? (parseFloat(rawVal) / c.price)
                            : null;
                          return (
                            <>
                              {/* Toggle QTY / USD */}
                              <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                                {[["usd","$ Dólares"],["qty","Cantidad"]].map(([m,lbl]) => (
                                  <button key={m} onClick={() => { setCryptoBuyMode(bm=>({...bm,[c.id]:m})); setCryptoInput(ci=>({...ci,[c.id]:""})); }}
                                    style={{ flex:1, background: mode===m?"#1a1a30":"#0a0a14", border:`1px solid ${mode===m?"#4040a0":"#2a2a40"}`, borderRadius:5, color: mode===m?"#8080d0":"#6060a0", padding:"4px 0", fontSize:10, cursor:"pointer", fontWeight: mode===m?700:400 }}>
                                    {lbl}
                                  </button>
                                ))}
                              </div>
                              <div style={{ display:"flex", gap:6 }}>
                                <div style={{ flex:1, position:"relative" }}>
                                  <input type="number" min="0" step="any"
                                    placeholder={mode==="usd" ? "Importe en $" : `Cantidad ${c.symbol}`}
                                    value={rawVal}
                                    onChange={e => setCryptoInput(ci => ({ ...ci, [c.id]: e.target.value }))}
                                    style={{ width:"100%", background:"#0a0a14", border:"1px solid #2a2a40", borderRadius:6, color:"#e8e0d0", padding:"6px 10px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }}
                                  />
                                  {previewQty > 0 && (
                                    <div style={{ position:"absolute", bottom:-14, left:2, fontSize:9, color:"#6060a8" }}>
                                      ≈ {previewQty < 0.0001 ? previewQty.toExponential(3) : previewQty.toFixed(6)} {c.symbol}
                                    </div>
                                  )}
                                </div>
                                <button onClick={() => {
                                  if (mode === "usd") {
                                    setCryptoInput(ci => ({ ...ci, [c.id]: (money * 0.9999).toFixed(2) }));
                                  } else {
                                    setCryptoInput(ci => ({ ...ci, [c.id]: (money / c.price * 0.9999).toFixed(8) }));
                                  }
                                }} style={{ background:"#0f0f1a", border:"1px solid #2a2a40", borderRadius:6, color:"#8888aa", padding:"6px 8px", fontSize:10, cursor:"pointer" }}>MAX</button>
                                <button onClick={() => handleCryptoBuy(c)}
                                  style={{ background:"#0f1a0f", border:"1px solid #1a3a1a", borderRadius:6, color:"#5aab6a", padding:"6px 14px", fontSize:12, cursor:"pointer", fontWeight:600 }}>BUY</button>
                                <button onClick={() => handleCryptoSell(c)} disabled={!owned}
                                  style={{ background: owned ? "#1a0f0f" : "#0a0a0a", border:`1px solid ${owned?"#3a1a1a":"#1a1a1a"}`, borderRadius:6, color: owned ? "#c05050" : "#333", padding:"6px 14px", fontSize:12, cursor: owned ? "pointer" : "default", fontWeight:600 }}>SELL</button>
                              </div>
                              {previewQty > 0 && <div style={{ height:8 }}/>}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {activeTab === "portfolio" && (
              <div>

              {/* Wealth chart */}
              <div style={{ marginBottom:24 }}>
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:11, color:"#c9a84c", letterSpacing:2 }}>{t.chartTitle||"WEALTH HISTORY"}</div>
                  </div>
                  {/* Range filter pills */}
                  <div style={{ display:"flex", gap:4 }}>
                    {["30m","1h","3h","6h","all"].map(r => (
                      <button key={r} onClick={() => setChartRange(r)}
                        style={{ background: chartRange===r ? "#1a1810" : "none", border:"1px solid " + (chartRange===r ? "#c9a84c" : "#222238"), borderRadius:4, color: chartRange===r ? "#c9a84c" : "#555", cursor:"pointer", padding:"3px 9px", fontSize:11, fontFamily:"inherit", transition:"all .15s" }}>
                        {r === "all" ? (t.chartAll||"All") : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                {(() => {
                  const now = Date.now();
                  const rangeMs = { "30m":30*60000, "1h":60*60000, "3h":3*60*60000, "6h":6*60*60000, "all":Infinity };
                  const cutoff = now - rangeMs[chartRange];
                  const filtered = wealthHistory.filter(p => p.t >= cutoff);
                  const startV = filtered.length > 0 ? filtered[0].v : 0;
                  const growth = startV > 0 ? ((totalEarned - startV) / startV * 100) : 0;
                  const peak = filtered.length > 0 ? Math.max(...filtered.map(p => p.v)) : totalEarned;

                  const fmtTime = ts => {
                    const d = new Date(ts);
                    return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
                  };
                  const fmtTimeLabel = ms => {
                    if (ms < 60*60000) return Math.round(ms/60000) + "m";
                    return (ms/3600000).toFixed(1).replace(".0","") + "h";
                  };

                  return (
                    <>
                      {/* Stats row */}
                      <div style={{ display:"flex", gap:0, marginBottom:12, background:"#0a0a14", borderRadius:8, overflow:"hidden", border:"1px solid #1c1c2e" }}>
                        {[
                          [t.chartWealth||"Net Worth", fmt(totalEarned), "#c9a84c"],
                          ["Peak", fmt(peak), "#8060ff"],
                          [t.chartTime||"Growth", (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%", growth >= 0 ? "#6abf7a" : "#d06060"],
                          [t.incomePerSec||"Income/s", "+" + fmt(incomePerSec) + "/s", "#6090ff"],
                        ].map(([label, val, color]) => (
                          <div key={label} style={{ flex:1, padding:"10px 14px", borderRight:"1px solid #1c1c2e" }}>
                            <div style={{ fontSize:11, color:"#7878a0", letterSpacing:1, marginBottom:3 }}>{label}</div>
                            <div style={{ fontSize:14, fontWeight:600, color }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Chart */}
                      {filtered.length < 2 ? (
                        <div className="card" style={{ padding:"32px", textAlign:"center" }}>
                          <div style={{ fontSize:24, marginBottom:8 }}>📈</div>
                          <div className="dim">{t.chartNoData||"Play for 30 seconds to see your first data point."}</div>
                        </div>
                      ) : (() => {
                        const W = 600, H = 200, PAD = { t:15, r:15, b:38, l:70 };
                        const vals  = filtered.map(p => p.v);
                        const times = filtered.map(p => p.t);
                        const minV = Math.min(...vals) * 0.98;
                        const maxV = Math.max(...vals) * 1.02;
                        const rangeV = maxV - minV || 1;
                        const minT = times[0], maxT = times[times.length-1];
                        const rangeT = maxT - minT || 1;
                        const px = ts => PAD.l + ((ts-minT)/rangeT)*(W-PAD.l-PAD.r);
                        const py = v  => PAD.t + (1-((v-minV)/rangeV))*(H-PAD.t-PAD.b);
                        const linePts = filtered.map(p => px(p.t)+","+py(p.v)).join(" ");
                        const areaD = "M"+px(minT)+","+py(vals[0])+" "+
                          filtered.map(p => "L"+px(p.t)+","+py(p.v)).join(" ")+
                          " L"+px(maxT)+","+(H-PAD.b)+" L"+px(minT)+","+(H-PAD.b)+" Z";

                        // Y axis (4 lines)
                        const ySteps = [0, 0.33, 0.66, 1].map(f => minV + f * rangeV);
                        // X axis labels (5 labels)
                        const totalMs = maxT - minT;
                        const xLabels = [0, 0.25, 0.5, 0.75, 1].map(f => {
                          const ts = minT + f * totalMs;
                          const label = totalMs > 2*60*60000 ? fmtTime(ts) : fmtTimeLabel(f * totalMs);
                          return { ts, label };
                        });

                        return (
                          <div className="card" style={{ padding:"14px 14px 8px", overflow:"hidden", position:"relative" }}>
                            <svg viewBox={"0 0 "+W+" "+H} style={{ width:"100%", height:220, overflow:"visible" }}
                              onMouseMove={e => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const scaleX = W / rect.width;
                                const mouseX = (e.clientX - rect.left) * scaleX;
                                const mouseTs = minT + ((mouseX - PAD.l) / (W - PAD.l - PAD.r)) * rangeT;
                                const nearest = filtered.reduce((a, b) => Math.abs(b.t - mouseTs) < Math.abs(a.t - mouseTs) ? b : a);
                                const dotX = px(nearest.t);
                                const dotY = py(nearest.v);
                                const tip = e.currentTarget.parentNode.querySelector(".chart-tip");
                                if (tip) {
                                  tip.style.display = "block";
                                  tip.style.left = Math.min(rect.width - 130, Math.max(0, (dotX / scaleX) - 60)) + "px";
                                  tip.style.top = (dotY / (H / rect.height)) - 50 + "px";
                                  tip.innerHTML = "<div style='color:#c9a84c;font-weight:600'>" + fmt(nearest.v) + "</div><div style='color:#555;font-size:10px'>" + fmtTime(nearest.t) + "</div>";
                                }
                                const cross = e.currentTarget.querySelector(".crosshair");
                                if (cross) { cross.setAttribute("x1", dotX); cross.setAttribute("x2", dotX); cross.setAttribute("y1", PAD.t); cross.setAttribute("y2", H-PAD.b); }
                                const dot2 = e.currentTarget.querySelector(".hover-dot");
                                if (dot2) { dot2.setAttribute("cx", dotX); dot2.setAttribute("cy", dotY); dot2.style.display = "block"; }
                              }}
                              onMouseLeave={e => {
                                const tip = e.currentTarget.parentNode.querySelector(".chart-tip");
                                if (tip) tip.style.display = "none";
                                const cross = e.currentTarget.querySelector(".crosshair");
                                if (cross) { cross.setAttribute("x1", -999); cross.setAttribute("x2", -999); }
                                const dot2 = e.currentTarget.querySelector(".hover-dot");
                                if (dot2) dot2.style.display = "none";
                              }}>
                              <defs>
                                <linearGradient id="wealthGrad2" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.25"/>
                                  <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.02"/>
                                </linearGradient>
                                <clipPath id="chartClip"><rect x={PAD.l} y={PAD.t} width={W-PAD.l-PAD.r} height={H-PAD.t-PAD.b}/></clipPath>
                              </defs>

                              {/* Grid & Y labels */}
                              {ySteps.map((v,i) => (
                                <g key={i}>
                                  <line x1={PAD.l} y1={py(v)} x2={W-PAD.r} y2={py(v)} stroke="#1a1a2a" strokeWidth="1" strokeDasharray="4,4"/>
                                  <text x={PAD.l-8} y={py(v)+4} textAnchor="end" fill="#444" fontSize="10">{fmt(v)}</text>
                                </g>
                              ))}

                              {/* X labels */}
                              {xLabels.map((xl,i) => (
                                <text key={i} x={px(xl.ts)} y={H-PAD.b+16} textAnchor="middle" fill="#444" fontSize="10">{xl.label}</text>
                              ))}

                              {/* Crosshair */}
                              <line className="crosshair" x1={-999} y1={PAD.t} x2={-999} y2={H-PAD.b} stroke="#c9a84c" strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>

                              {/* Area & Line (clipped) */}
                              <g clipPath="url(#chartClip)">
                                <path d={areaD} fill="url(#wealthGrad2)"/>
                                <polyline points={linePts} fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinejoin="round"/>
                              </g>

                              {/* Border box */}
                              <rect x={PAD.l} y={PAD.t} width={W-PAD.l-PAD.r} height={H-PAD.t-PAD.b} fill="none" stroke="#1c1c2e" strokeWidth="1"/>

                              {/* Last point dot */}
                              <circle cx={px(maxT)} cy={py(vals[vals.length-1])} r="4" fill="#c9a84c" stroke="#080810" strokeWidth="2"/>

                              {/* Hover dot */}
                              <circle className="hover-dot" cx={-999} cy={-999} r="5" fill="#c9a84c" stroke="#080810" strokeWidth="2" style={{ display:"none" }}/>
                            </svg>
                            {/* Tooltip */}
                            <div className="chart-tip" style={{ display:"none", position:"absolute", background:"#12121e", border:"1px solid #c9a84c", borderRadius:6, padding:"6px 10px", fontSize:12, pointerEvents:"none", zIndex:10 }}/>
                          </div>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>
                <div className="dim" style={{ marginBottom:12, letterSpacing:1.5 }}>{t.portfolioTitle}</div>
                {Object.entries(catLabel).map(([cat,label]) => {
                  const bizList = allBusinesses.filter(b => b.category===cat && (owned[b.id]||0)>0);
                  if (!bizList.length) return null;
                  const catIncome = bizList.reduce((a,b) => a + b.baseIncome*(owned[b.id]||0)*catMult(b.category)*ceoLevel.bonus*globalMult*getManagerMult(b.id), 0);
                  return (
                    <div key={cat} style={{ marginBottom:18 }}>
                      <div style={{ fontSize:10, color:"#c9a84c", letterSpacing:2, textTransform:"uppercase", marginBottom:7, borderBottom:"1px solid #1c1c2e", paddingBottom:5, display:"flex", justifyContent:"space-between" }}>
                        <span>{label}</span><span className="green">{fmt(catIncome) + "/s"}</span>
                      </div>
                      {bizList.map(biz => {
                        const mgrLvl = managers[biz.id] || 0;
                        const cnt = owned[biz.id] || 0;
                        const ms = getBizMilestoneMultiplier(cnt);
                        return (
                          <div key={biz.id} className="sr">
                            <span>
                              {biz.icon + " " + (biz.name[lang]||biz.name.en)}
                              {mgrLvl>0&&<span style={{ fontSize:10, color:"#5aab6a", marginLeft:6 }}>{"⚙️ Lv"+mgrLvl}</span>}
                              {ms>1&&<span style={{ fontSize:10, color:"#c9a84c", marginLeft:4 }}>{"★×"+ms}</span>}
                            </span>
                            <span><span className="gold" style={{ marginRight:10 }}>{"x"+cnt}</span><span className="green">{fmt(biz.baseIncome*cnt*catMult(biz.category)*ceoLevel.bonus*globalMult*getManagerMult(biz.id)*ms*prestigeMult) + "/s"}</span></span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {stocks.filter(s => (portfolio[s.id]||0) >= s.totalShares).length > 0 && (
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:10, color:"#c9a84c", letterSpacing:2, textTransform:"uppercase", marginBottom:7, borderBottom:"1px solid #1c1c2e", paddingBottom:5 }}>{t.acquiredCompanies}</div>
                    {stocks.filter(s => (portfolio[s.id]||0) >= s.totalShares).map(s => (
                      <div key={s.id} className="sr">
                        <span>{s.icon + " " + s.name}</span>
                        <span className="green">{fmt(s.totalShares * s.price * DIVIDEND_RATE) + "/" + t.every5min}</span>
                      </div>
                    ))}
                  </div>
                )}
                {Object.keys(owned).length===0 && ownedStocks.length===0 && (
                  <div className="dim" style={{ textAlign:"center", marginTop:40 }}>{t.noBusinesses}</div>
                )}
              </div>
            )}

            {/* ── ACHIEVEMENTS ── */}

            {activeTab === "casino" && (() => {
              const todayStr    = new Date().toISOString().slice(0,10);
              const dailyWagered = casinoDailyDate === todayStr ? casinoDailyWagered : 0;
              const dailyLeft    = Math.max(0, CASINO_DAILY_LIMIT - dailyWagered);

              const placeBet = (amount) => {
                if (amount <= 0 || amount > money || amount > dailyLeft) return false;
                setMoney(m => m - amount);
                const today = new Date().toISOString().slice(0,10);
                setCasinoDailyDate(today);
                setCasinoDailyWagered(w => casinoDailyDate === today ? w + amount : amount);
                return true;
              };

              // ── RED NUMBERS ──
              const REDS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
              const numColor = (n) => n === 0 ? "green" : REDS.includes(n) ? "red" : "black";

              // ── ROULETTE SPIN ──
              const spinRoulette = () => {
                if (rouletteSpinning) return;
                if (rouletteBets.length === 0) { setRouletteBets([]); return; }
                const totalBet = rouletteBets.reduce((s,b) => s + b.amount, 0);
                if (totalBet <= 0 || totalBet > money || totalBet > dailyLeft) return;
                placeBet(totalBet);
                setTotalCasinoPlays(p => p + 1);
                setRouletteSpinning(true);
                setRouletteResult(null);

                setTimeout(() => {
                  const num   = Math.floor(Math.random() * 37);
                  const color = numColor(num);
                  let totalGain = 0;

                  rouletteBets.forEach(bet => {
                    let won = false; let mult = 0;
                    if (bet.type === "color") {
                      if (bet.value === color) { won=true; mult = color==="green"?17:1.9; }
                    } else if (bet.type === "number") {
                      if (bet.value === num) { won=true; mult=35; }
                    } else if (bet.type === "parity" && num!==0) {
                      if (bet.value==="even" && num%2===0) { won=true; mult=1.9; }
                      if (bet.value==="odd"  && num%2!==0) { won=true; mult=1.9; }
                    } else if (bet.type === "half" && num!==0) {
                      if (bet.value==="low"  && num>=1  && num<=18) { won=true; mult=1.9; }
                      if (bet.value==="high" && num>=19 && num<=36) { won=true; mult=1.9; }
                    } else if (bet.type === "dozen" && num!==0) {
                      const doz = Math.ceil(num/12);
                      if (bet.value===doz) { won=true; mult=2.8; }
                    } else if (bet.type === "column" && num!==0) {
                      const col = ((num-1)%3)+1;
                      if (bet.value===col) { won=true; mult=2.8; }
                    }
                    if (won) totalGain += bet.amount * mult;
                  });

                  if (totalGain > 0) {
                    setMoney(m => m + totalGain);
                    setTotalEarned(te => te + totalGain);
                    setTotalCasinoWon(w => w + totalGain);
                    sfx('achievement');
                  } else { sfx('sell'); }

                  setRouletteHistory(h => [{number:num, color}, ...h].slice(0,20));
                  setRouletteResult({ number:num, color, totalGain, bets:[...rouletteBets] });
                  setRouletteBets([]);
                  setRouletteSpinning(false);
                }, 2200);
              };

              // ── BLACKJACK LOGIC ──
              const DECK_V = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
              const DECK_S = ["♥","♠","♦","♣"];
              const DECK   = DECK_V.flatMap(v => DECK_S.map(s => v+s));
              const cardVal = (c) => { const v=c.replace(/[♥♠♦♣]/g,""); return v==="A"?11:["J","Q","K"].includes(v)?10:parseInt(v); };
              const handVal = (cards) => {
                let total = cards.reduce((s,c) => s+cardVal(c), 0);
                let aces  = cards.filter(c => c.startsWith("A")).length;
                while (total>21 && aces>0) { total-=10; aces--; }
                return total;
              };
              const draw = () => DECK[Math.floor(Math.random()*DECK.length)];

              const startBJ = () => {
                const bet = parseFloat(casinoBet);
                if (!bet || bet<=0) return;
                if (!placeBet(bet)) return;
                setTotalCasinoPlays(p => p + 1);
                const pCards=[draw(),draw()], dCards=[draw(),draw()];
                sfx('buy');
                if (handVal(pCards)===21) {
                  const gain=bet*2.5; setMoney(m=>m+gain); setTotalEarned(te=>te+gain); setTotalCasinoWon(w=>w+gain); setTotalBjWins(w=>w+1); sfx('achievement');
                  setBjState({playerCards:pCards, dealerCards:dCards, phase:"result", result:"blackjack", gain, bet});
                } else {
                  setBjState({playerCards:pCards, dealerCards:dCards, phase:"playing", result:null, gain:0, bet});
                }
              };
              const bjHit = () => {
                if (!bjState||bjState.phase!=="playing") return;
                const nc=[...bjState.playerCards, draw()]; const v=handVal(nc); sfx('buy');
                if (v>21) { bjStand(nc); }
                else if (v===21) { bjStand(nc); }
                else setBjState(s=>({...s, playerCards:nc}));
              };
              const bjStand = (finalCards) => {
                const pc=finalCards||bjState.playerCards;
                let dc=[...bjState.dealerCards];
                while (handVal(dc)<17) dc.push(draw());
                const pv=handVal(pc), dv=handVal(dc); let result, gain;
                const bet=bjState.bet;
                if (pv>21)              { result="lose"; gain=-bet;   sfx('sell'); }  // jugador bust — pierde siempre
                else if (dv>21||pv>dv)  { result="win";  gain=bet*2;  setMoney(m=>m+gain); setTotalEarned(te=>te+gain); setTotalCasinoWon(w=>w+gain); setTotalBjWins(w=>w+1); sfx('achievement'); }
                else if (pv===dv)       { result="push"; gain=bet;    setMoney(m=>m+gain); sfx('buy'); }
                else                    { result="lose"; gain=-bet;   sfx('sell'); }
                setBjState(s=>({...s, playerCards:pc, dealerCards:dc, phase:"result", result, gain}));
              };

              // ── BET BUILDER helpers ──
              const addBet = () => {
                const amt = parseFloat(roulBetInput);
                if (!amt||amt<=0||amt>money) return;
                const key = roulBetType+"|"+roulBetValue;
                setRouletteBets(bs => {
                  const existing = bs.findIndex(b => b.type===roulBetType && String(b.value)===String(roulBetValue));
                  if (existing>=0) {
                    const copy=[...bs]; copy[existing]={...copy[existing], amount:copy[existing].amount+amt}; return copy;
                  }
                  const labels = {
                    color: { red:t.roulRed||"RED", black:t.roulBlack||"BLACK", green:t.roulGreen||"GREEN (0)" },
                    parity:{ even:t.roulEven||"EVEN", odd:t.roulOdd||"ODD" },
                    half:  { low:t.roulLow||"1-18", high:t.roulHigh||"19-36" },
                    dozen: { 1:"1st 12", 2:"2nd 12", 3:"3rd 12" },
                    column:{ 1:"COL 1", 2:"COL 2", 3:"COL 3" },
                  };
                  const label = roulBetType==="number" ? "№"+roulBetValue : (labels[roulBetType]?.[roulBetValue]||roulBetValue);
                  const mults = { color:{red:1.9,black:1.9,green:17}, parity:{even:1.9,odd:1.9}, half:{low:1.9,high:1.9}, dozen:{1:2.8,2:2.8,3:2.8}, column:{1:2.8,2:2.8,3:2.8}, number:35 };
                  const mult  = roulBetType==="number" ? 35 : mults[roulBetType]?.[roulBetValue]||1.9;
                  return [...bs, {type:roulBetType, value:roulBetValue, amount:amt, label, mult}];
                });
                setRoulBetInput("");
              };

              // Plain helper (lowercase) – NOT a React component, no remount issues
              const betTypeBtn = (id, label) => (
                <button key={id} onClick={()=>{setRoulBetType(id);setRoulBetValue(id==="color"?"red":id==="parity"?"even":id==="half"?"low":1);}}
                  style={{padding:"6px 10px",fontSize:10,letterSpacing:.5,cursor:"pointer",fontFamily:"inherit",fontWeight:600,
                    background:roulBetType===id?"#1a1530":"#0a0a12",
                    border:`2px solid ${roulBetType===id?"#8060ff":"#2a2a40"}`,
                    color:roulBetType===id?"#c0a0ff":"#555",borderRadius:6,transition:"all .1s"}}>
                  {label}
                </button>
              );

              return (
                <div style={{ maxWidth:480, margin:"0 auto" }}>
                  {/* Header */}
                  <div style={{ textAlign:"center", marginBottom:16 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#c9a84c", letterSpacing:2 }}>🎰 CASINO</div>
                    <div style={{ fontSize:11, color:"#8080a8", marginTop:3 }}>
                      {t.casinoDaily||"Daily limit"}: <span style={{ color: dailyLeft > 0 ? "#6abf7a" : "#c05050" }}>{fmt(dailyLeft)}</span> {t.casinoRemaining||"remaining"}
                    </div>
                  </div>

                  {/* Game tabs */}
                  <div style={{ display:"flex", gap:0, marginBottom:16, borderBottom:"1px solid #161628" }}>
                    {[["roulette","🎡 Roulette"],["blackjack","🃏 Blackjack"]].map(([id,label]) => (
                      <button key={id} className={"tab-btn"+(casinoGame===id?" active":"")} style={{fontSize:11}}
                        onClick={()=>{setCasinoGame(id);setRouletteResult(null);setBjState(null);}}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ══ ROULETTE ══ */}
                  {casinoGame === "roulette" && (
                    <div>
                      {/* Wheel + result */}
                      <div style={{textAlign:"center",marginBottom:12,position:"relative"}}>
                        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:100, height:100, borderRadius:"50%",
                          background: rouletteSpinning
                            ? "conic-gradient(#c05050 0%,#111 30%,#c05050 60%,#111 90%,#c05050 100%)"
                            : rouletteResult
                              ? (rouletteResult.color==="red"?"#5a1818":rouletteResult.color==="green"?"#1a4a2a":"#0f0f1f")
                              : "#0c0c18",
                          border:"3px solid #c9a84c", fontSize:28, fontWeight:800, color:"#e8e0d0",
                          boxShadow:"0 0 28px rgba(201,168,76,.25)", transition:"background .4s",
                          animation: rouletteSpinning ? "spin 0.35s linear infinite" : "none" }}>
                          {rouletteSpinning ? "🎡" : rouletteResult ? rouletteResult.number : "?"}
                        </div>
                        {rouletteResult && !rouletteSpinning && (
                          <div style={{marginTop:8}}>
                            <span style={{fontWeight:700, fontSize:15,
                              color:rouletteResult.totalGain>0?"#6abf7a":"#c05050"}}>
                              {rouletteResult.totalGain>0 ? "▲ +" + fmt(rouletteResult.totalGain) : "▼ " + fmt(-rouletteResult.bets.reduce((s,b)=>s+b.amount,0))}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* History strip */}
                      {rouletteHistory.length > 0 && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:"#8080a8",letterSpacing:1,marginBottom:5}}>{t.roulHistory||"Last numbers"}</div>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {rouletteHistory.map((h,i) => (
                              <div key={i} style={{width:26,height:22,borderRadius:4,fontSize:10,fontWeight:700,
                                display:"flex",alignItems:"center",justifyContent:"center",
                                background:h.color==="red"?"#5a1818":h.color==="green"?"#1a4a2a":"#0f0f1f",
                                border:`1px solid ${h.color==="red"?"#c05050":h.color==="green"?"#3a8a4a":"#3a3a5a"}`,
                                color:h.color==="red"?"#e08080":h.color==="green"?"#70b070":"#8888cc"}}>
                                {h.number}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bet type selector */}
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                        {betTypeBtn("color",  t.roulColorBet||"COLOR")}
                        {betTypeBtn("parity", t.roulParityBet||"PAR/IMPAR")}
                        {betTypeBtn("half",   t.roulHalfBet||"MITAD")}
                        {betTypeBtn("dozen",  t.roulDozenBet||"DOCENA")}
                        {betTypeBtn("column", t.roulColBet||"COLUMNA")}
                        {betTypeBtn("number", t.roulNumBet||"NÚMERO")}
                      </div>

                      {/* Value selector */}
                      <div style={{marginBottom:10}}>
                        {roulBetType === "color" && (
                          <div style={{display:"flex",gap:6}}>
                            {[["red","#c05050","#5a1818",t.roulRed||"ROJO"],
                              ["black","#8888cc","#0f0f1a",t.roulBlack||"NEGRO"],
                              ["green","#3a8a4a","#0a1a0a",t.roulGreen||"VERDE (0)"]].map(([v,col,bg,lbl]) => (
                              <button key={v} onClick={()=>setRoulBetValue(v)}
                                style={{flex:1,padding:"8px 4px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:6,
                                  background:roulBetValue===v?bg:"#0a0a12",
                                  border:`2px solid ${roulBetValue===v?col:"#2a2a40"}`,color:col}}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        )}
                        {roulBetType === "parity" && (
                          <div style={{display:"flex",gap:6}}>
                            {[["even",t.roulEven||"PAR"],["odd",t.roulOdd||"IMPAR"]].map(([v,lbl]) => (
                              <button key={v} onClick={()=>setRoulBetValue(v)}
                                style={{flex:1,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:6,
                                  background:roulBetValue===v?"#12122a":"#0a0a12",
                                  border:`2px solid ${roulBetValue===v?"#8888cc":"#2a2a40"}`,color:"#8888cc"}}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        )}
                        {roulBetType === "half" && (
                          <div style={{display:"flex",gap:6}}>
                            {[["low",t.roulLow||"1-18"],["high",t.roulHigh||"19-36"]].map(([v,lbl]) => (
                              <button key={v} onClick={()=>setRoulBetValue(v)}
                                style={{flex:1,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:6,
                                  background:roulBetValue===v?"#12122a":"#0a0a12",
                                  border:`2px solid ${roulBetValue===v?"#8888cc":"#2a2a40"}`,color:"#8888cc"}}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        )}
                        {roulBetType === "dozen" && (
                          <div style={{display:"flex",gap:6}}>
                            {[[1,t.roulD1||"1ª Doc."],[2,t.roulD2||"2ª Doc."],[3,t.roulD3||"3ª Doc."]].map(([v,lbl]) => (
                              <button key={v} onClick={()=>setRoulBetValue(v)}
                                style={{flex:1,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:6,
                                  background:roulBetValue===v?"#12122a":"#0a0a12",
                                  border:`2px solid ${roulBetValue===v?"#c9a84c":"#2a2a40"}`,color:"#c9a84c"}}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        )}
                        {roulBetType === "column" && (
                          <div style={{display:"flex",gap:6}}>
                            {[[1,t.roulC1||"COL 1"],[2,t.roulC2||"COL 2"],[3,t.roulC3||"COL 3"]].map(([v,lbl]) => (
                              <button key={v} onClick={()=>setRoulBetValue(v)}
                                style={{flex:1,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:6,
                                  background:roulBetValue===v?"#12122a":"#0a0a12",
                                  border:`2px solid ${roulBetValue===v?"#c9a84c":"#2a2a40"}`,color:"#c9a84c"}}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        )}
                        {roulBetType === "number" && (
                          <div style={{display:"flex",flexWrap:"wrap",gap:3,maxHeight:140,overflowY:"auto"}}>
                            {Array.from({length:37},(_,i)=>i).map(n => {
                              const col = n===0?"#3a8a4a":REDS.includes(n)?"#8a3030":"#2a2a4a";
                              const sel = roulBetValue===n;
                              return (
                                <button key={n} onClick={()=>setRoulBetValue(n)}
                                  style={{width:30,height:26,borderRadius:4,fontSize:10,fontWeight:700,
                                    background:sel?col:"#0a0a12",
                                    border:`1px solid ${sel?"#c9a84c":col}`,
                                    color:sel?"#fff":"#888",cursor:"pointer",fontFamily:"inherit"}}>
                                  {n}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Bet amount + add */}
                      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
                        <input type="number" placeholder="Apuesta..." value={roulBetInput}
                          onChange={e=>setRoulBetInput(e.target.value)} min="1"
                          style={{flex:1,background:"#0a0a14",border:"1px solid #2a2a40",borderRadius:6,
                            color:"#e8e0d0",padding:"7px 10px",fontSize:13,fontFamily:"inherit"}} />
                        {[1000,10000,100000].map(v=>(
                          <button key={v} onClick={()=>setRoulBetInput(String(Math.min(v,money,dailyLeft)))}
                            style={{background:"#0f0f1a",border:"1px solid #2a2a40",borderRadius:6,
                              color:"#8888aa",padding:"6px 7px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                            {v>=1000000?"1M":v>=1000?(v/1000)+"K":v}
                          </button>
                        ))}
                        <button onClick={addBet} disabled={!roulBetInput||parseFloat(roulBetInput)<=0}
                          style={{background:"#1a1530",border:"1px solid #8060ff",borderRadius:6,
                            color:"#c0a0ff",padding:"7px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:.5}}>
                          {t.roulAddBet||"AÑADIR"}
                        </button>
                      </div>

                      {/* Active bets list */}
                      {rouletteBets.length > 0 && (
                        <div style={{marginBottom:10,background:"#0a0a14",border:"1px solid #1a1a2e",borderRadius:8,padding:"10px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <span style={{fontSize:11,color:"#9090b8",letterSpacing:1}}>{t.roulBetsActive||"APUESTAS"}</span>
                            <button onClick={()=>setRouletteBets([])}
                              style={{fontSize:11,background:"none",border:"1px solid #5a2a2a",borderRadius:4,color:"#d06060",cursor:"pointer",padding:"3px 8px",fontFamily:"inherit"}}>
                              {t.roulClearBets||"LIMPIAR"}
                            </button>
                          </div>
                          {rouletteBets.map((b,i)=>(
                            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#8888aa",marginBottom:3}}>
                              <span style={{color:"#c0a0ff"}}>{b.label}</span>
                              <span>{fmt(b.amount)} <span style={{color:"#7878a8"}}>→ ×{b.mult}</span></span>
                            </div>
                          ))}
                          <div style={{borderTop:"1px solid #1a1a2e",marginTop:6,paddingTop:5,display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:11,color:"#9090b8"}}>{t.total||"Total"}</span>
                            <span style={{fontSize:12,color:"#c9a84c",fontWeight:700}}>{fmt(rouletteBets.reduce((s,b)=>s+b.amount,0))}</span>
                          </div>
                        </div>
                      )}
                      {rouletteBets.length === 0 && (
                        <div style={{textAlign:"center",fontSize:11,color:"#333",marginBottom:10,padding:"8px",border:"1px dashed #1a1a2e",borderRadius:6}}>
                          {t.roulNoBets||"Sin apuestas — añade una arriba"}
                        </div>
                      )}

                      {/* Spin button */}
                      <button onClick={spinRoulette}
                        disabled={rouletteSpinning || rouletteBets.length===0 || dailyLeft<=0}
                        className="btn-pri" style={{width:"100%",padding:"13px",fontSize:14,letterSpacing:1}}>
                        {rouletteSpinning ? ("🎡 " + (t.roulSpinning||"Girando...")) : ("🎡 " + (t.roulSpin||"GIRAR"))}
                      </button>

                      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                    </div>
                  )}

                  {/* ══ BLACKJACK ══ */}
                  {casinoGame === "blackjack" && (
                    <div>
                      {/* Bet input */}
                      {!bjState && (
                        <div style={{marginBottom:14}}>
                          <div style={{fontSize:11,color:"#8080a8",letterSpacing:1,marginBottom:6}}>{t.casinoDaily||"APUESTA"}</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            <input type="number" placeholder="0" value={casinoBet}
                              onChange={e=>setCasinoBet(e.target.value)} min="1"
                              style={{flex:1,background:"#0a0a14",border:"1px solid #2a2a40",borderRadius:6,
                                color:"#e8e0d0",padding:"8px 12px",fontSize:13,fontFamily:"inherit"}} />
                            {[1000,10000,100000,1000000].map(v=>(
                              <button key={v} onClick={()=>setCasinoBet(String(Math.min(v,money,dailyLeft)))}
                                style={{background:"#0f0f1a",border:"1px solid #2a2a40",borderRadius:6,
                                  color:"#8888aa",padding:"6px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                                {v>=1000000?"1M":v>=1000?(v/1000)+"K":v}
                              </button>
                            ))}
                            <button onClick={()=>setCasinoBet(String(Math.floor(Math.min(money,dailyLeft))))}
                              style={{background:"#0f0f1a",border:"1px solid #2a2a40",borderRadius:6,
                                color:"#8888aa",padding:"6px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>MAX</button>
                          </div>
                        </div>
                      )}

                      {!bjState ? (
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:38, marginBottom:10 }}>🃏</div>
                          <div style={{ color:"#666", fontSize:12, marginBottom:18, lineHeight:1.6 }}>
                            {t.bjDesc||"Gana a la banca sin pasarte de 21. Blackjack paga ×2.5"}
                          </div>
                          <button onClick={startBJ}
                            disabled={!casinoBet||parseFloat(casinoBet)<=0||dailyLeft<=0}
                            className="btn-pri" style={{width:"100%",padding:"12px",fontSize:14}}>
                            🃏 {t.bjDeal||"REPARTIR"}
                          </button>
                        </div>
                      ) : (
                        <div>
                          {/* Dealer hand */}
                          <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:11, color:"#8080a8", letterSpacing:1, marginBottom:8 }}>
                              {(t.bjDealer||"BANCA")} {bjState.phase==="result"?" — "+handVal(bjState.dealerCards):""}
                            </div>
                            <div style={{ display:"flex", gap:8 }}>
                              {bjState.dealerCards.map((c,i) => (
                                <CardEl key={i} card={c} hidden={bjState.phase==="playing" && i===1} />
                              ))}
                            </div>
                          </div>

                          {/* Player hand */}
                          <div style={{ marginBottom:16 }}>
                            <div style={{ fontSize:11, color:"#8080a8", letterSpacing:1, marginBottom:8 }}>
                              {(t.bjPlayer||"TÚ")} — {handVal(bjState.playerCards)}
                            </div>
                            <div style={{ display:"flex", gap:8 }}>
                              {bjState.playerCards.map((c,i) => <CardEl key={i} card={c} />)}
                            </div>
                          </div>

                          {/* Result */}
                          {bjState.phase === "result" && (
                            <div style={{ textAlign:"center", padding:"14px", borderRadius:8, marginBottom:14,
                              background:["win","blackjack"].includes(bjState.result)?"#0f1a0f":bjState.result==="push"?"#0f0f1a":"#1a0f0f",
                              border:`1px solid ${["win","blackjack"].includes(bjState.result)?"#3a6a3a":bjState.result==="push"?"#3a3a6a":"#6a3a3a"}` }}>
                              <div style={{ fontSize:18, fontWeight:700,
                                color:["win","blackjack"].includes(bjState.result)?"#6abf7a":bjState.result==="push"?"#8888cc":"#c05050" }}>
                                {bjState.result==="blackjack"?(t.bjBlackjack||"🎉 BLACKJACK!"):
                                 bjState.result==="win"?(t.bjWin||"✓ GANASTE"):
                                 bjState.result==="push"?(t.bjPush||"EMPATE"):
                                 (t.bjBust||"✗ PASADO")}
                              </div>
                              <div style={{ fontSize:13, color:"#8888aa", marginTop:4 }}>
                                {bjState.gain>=0?"+":""}{fmt(bjState.gain)}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {bjState.phase === "playing" ? (
                            <div style={{ display:"flex", gap:8 }}>
                              <button onClick={bjHit} className="btn-pri"
                                style={{flex:1,padding:"11px",fontSize:13,letterSpacing:.5}}>
                                {t.bjHit||"PEDIR"}
                              </button>
                              <button onClick={()=>bjStand()}
                                style={{flex:1,padding:"11px",fontSize:13,background:"#0f0f1a",
                                  border:"1px solid #3a3a6a",borderRadius:6,color:"#8888cc",
                                  cursor:"pointer",fontFamily:"inherit"}}>
                                {t.bjStand||"PLANTARSE"}
                              </button>
                            </div>
                          ) : (
                            <button onClick={()=>{setBjState(null);setCasinoBet("");}} className="btn-pri"
                              style={{width:"100%",padding:"11px",fontSize:13}}>
                              {t.bjPlayAgain||"OTRA PARTIDA"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === "achievements" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div className="dim" style={{ letterSpacing:1.5 }}>{t.achievementsTitle}</div>
                  <div style={{ fontSize:12 }}><span className="gold">{unlockedAch.length}</span><span className="dim">{"/" + ACHIEVEMENTS_DEF.length + " " + t.achievementsUnlocked}</span></div>
                </div>
                <div className="pb" style={{ marginBottom:14 }}>
                  <div className="pf" style={{ width:((unlockedAch.length/ACHIEVEMENTS_DEF.length)*100) + "%" }} />
                </div>
                {ACHIEVEMENTS_DEF.map(ach => {
                  const isUnlocked = unlockedAch.includes(ach.id);
                  return (
                    <div key={ach.id} className={"ach" + (isUnlocked?" ok":" no")}>
                      <div style={{ fontSize:26, flexShrink:0 }}>{ach.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:isUnlocked?"#5aab6a":"#666" }}>{(isUnlocked?"✓ ":"") + (ach.name[lang]||ach.name.en)}</div>
                        <div className="dim" style={{ marginTop:3 }}>{ach.desc[lang]||ach.desc.en}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── RANKING TAB ── */}
            {activeTab === "ranking" && (() => {
                    const isWorldView = rankingView === "mundial";
                    const list        = isWorldView ? globalLeaderboard : regionalLeaderboard;
                    const loading     = isWorldView ? globalLoading : regionalLoading;
                    const loaded      = isWorldView ? globalLoaded : regionalLoaded;
                    return (
                      <div>
                        {/* Botón guardar */}
                        <button onClick={() => { saveRankingEntry(prestige); sfx('achievement'); fetchCurrentLeaderboard(); }}
                          style={{ width:"100%", background:"linear-gradient(135deg,#1a1a30,#2a2a50)", border:"1px solid #4040a0",
                            borderRadius:10, color:"#c0a0ff", cursor:"pointer", padding:"10px 0",
                            fontSize:13, fontFamily:"inherit", fontWeight:700, marginBottom:12,
                            boxShadow:"0 0 14px rgba(120,80,200,0.2)" }}>
                          📸 {lang==="es"?"Guardar partida y subir al ranking":lang==="fr"?"Sauvegarder et soumettre":lang==="de"?"Speichern und einreichen":lang==="pt"?"Salvar e enviar":lang==="ru"?"Сохранить и отправить":"Save & submit to leaderboard"}
                        </button>

                        {/* Toggle mundial / regional */}
                        <div style={{ display:"flex", gap:4, marginBottom:12, background:"#08080f", borderRadius:8, padding:4 }}>
                          {[["mundial", "🌍 " + (lang==="es"?"Mundial":lang==="fr"?"Mondial":lang==="de"?"Weltweit":lang==="pt"?"Mundial":lang==="ru"?"Мировой":"World") + " Top 100"],
                            ["regional", "🗺️ " + playerRegion + " Top 100"]
                          ].map(([v, lbl]) => (
                            <button key={v} onClick={() => { setRankingView(v); if(v==="mundial" && !globalLoaded) fetchGlobalLeaderboard(); if(v==="regional" && !regionalLoaded) fetchRegionalLeaderboard(); }}
                              style={{ flex:1, padding:"6px 0", fontSize:11, fontWeight:700, cursor:"pointer",
                                fontFamily:"inherit", borderRadius:6,
                                background: rankingView===v ? "linear-gradient(135deg,#0f1828,#1a2a40)" : "transparent",
                                border: rankingView===v ? "1px solid #4060c0" : "1px solid transparent",
                                color: rankingView===v ? "#6090e0" : "#4050a0" }}>
                              {lbl}
                            </button>
                          ))}
                        </div>

                        {/* Header info + refresh */}
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                          <div style={{ fontSize:11, color:"#4050a0" }}>
                            {list.length} {lang==="es"?"jugadores":lang==="fr"?"joueurs":lang==="de"?"Spieler":lang==="pt"?"jogadores":lang==="ru"?"игроков":"players"}
                            {" · Score = Dinero × (1 + Prestige × 0.5)"}
                          </div>
                          <button onClick={() => isWorldView ? fetchGlobalLeaderboard() : fetchRegionalLeaderboard()} disabled={loading}
                            style={{ background:"none", border:"1px solid #2a3060", borderRadius:6, color: loading?"#303060":"#5060a0",
                              cursor:"pointer", padding:"4px 10px", fontSize:11, fontFamily:"inherit" }}>
                            {loading ? "⟳ ..." : "⟳ " + (lang==="es"?"Actualizar":lang==="fr"?"Actualiser":lang==="de"?"Aktualisieren":lang==="pt"?"Atualizar":lang==="ru"?"Обновить":"Refresh")}
                          </button>
                        </div>

                        {/* Cargando */}
                        {loading && (
                          <div style={{ textAlign:"center", padding:"40px 0", color:"#5060a0", fontSize:13 }}>
                            <div style={{ fontSize:32, marginBottom:8, animation:"spin 1s linear infinite" }}>⟳</div>
                            {lang==="es"?"Cargando...":"Loading..."}
                          </div>
                        )}

                        {/* Vacío */}
                        {!loading && list.length === 0 && loaded && (
                          <div style={{ textAlign:"center", padding:"40px 0", color:"#5060a0", fontSize:13 }}>
                            <div style={{ fontSize:48, marginBottom:12 }}>{isWorldView ? "🌍" : "🗺️"}</div>
                            <div>{lang==="es"?"Sé el primero en este ranking":lang==="fr"?"Soyez le premier":"Be the first here"}</div>
                            <div style={{ fontSize:11, color:"#404080", marginTop:8 }}>
                              {lang==="es"?"Pulsa el botón de arriba para subir tu puntuación":"Press the button above to submit your score"}
                            </div>
                          </div>
                        )}

                        {/* Lista */}
                        {!loading && list.length > 0 && (
                          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                            {list.map((entry, i) => {
                              const isMe = entry.device_id ? entry.device_id === deviceId : (entry.player_name === playerName && entry.region === playerRegion);
                              return (
                                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px",
                                  background: isMe?"linear-gradient(135deg,#0f1828,#141e38)":i===0?"linear-gradient(135deg,#150f28,#1e1440)":"#0c0c18",
                                  borderRadius:10, border:"1px solid " + (isMe?"#4060c0":i===0?"#5a3090":i===1?"#3a3a60":i===2?"#3a2a40":"#1c1c2e") }}>
                                  <div style={{ fontSize:18, width:26, textAlign:"center", flexShrink:0 }}>
                                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{ fontSize:11, color:"#5858a0" }}>#{i+1}</span>}
                                  </div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:13, fontWeight:700,
                                      color: isMe?"#6090ff":i===0?"#c9a84c":i<=2?"#d0d0e0":"#a0a0c0",
                                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                                      {entry.player_name}
                                      {isMe && <span style={{ fontSize:10, color:"#6090ff", marginLeft:5 }}>← tú</span>}
                                    </div>
                                    <div style={{ fontSize:10, color:"#6060a0", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                                      {entry.prestige > 0 && <img src={"./prestige_" + entry.prestige + ".png"} alt="" style={{ width:13, height:13, objectFit:"contain" }} onError={e => { e.target.src = "./" + (entry.prestige >= 10 ? "prestige_10.png" : entry.prestige >= 5 ? "prestige_5.png" : "prestige_1.png"); }} />}
                                      {"P" + entry.prestige + (isWorldView ? " · " + entry.region : "")}
                                    </div>
                                  </div>
                                  <div style={{ textAlign:"right", flexShrink:0 }}>
                                    <div style={{ fontSize:13, fontWeight:700, color:i===0?"#c9a84c":i===1?"#a8b0c0":i===2?"#b08060":isMe?"#6090ff":"#7878a8" }}>
                                      {fmt(entry.score)}
                                    </div>
                                    <div style={{ fontSize:9, color:"#4848a0", letterSpacing:.5 }}>SCORE</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}

          </div>
        </div>
      </div>

      {/* OPTIONS MODAL */}
      {showOptions && (
        <div className="modal-overlay" onClick={() => setShowOptions(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:"#c9a84c" }}>{t.optTitle||"OPTIONS"}</div>
                <div style={{ fontSize:10, color:"#3a3060", letterSpacing:1, marginTop:2 }}>El Gran Capitalista v{APP_VERSION}</div>
              </div>
              <button onClick={() => setShowOptions(false)} style={{ background:"none", border:"none", color:"#7070a0", cursor:"pointer", fontSize:20 }}>×</button>
            </div>

            {/* Sound toggle */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optSound||"Sound"}</span>
              <button className={"toggle " + (soundEnabled?"on":"off")} onClick={() => setSoundEnabled(s => !s)} />
            </div>

            {/* Volume */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optVolume||"Volume"}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="range" className="slider" min="0" max="1" step="0.05"
                  value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
                  disabled={!soundEnabled} style={{ opacity: soundEnabled ? 1 : 0.4 }} />
                <span style={{ fontSize:12, color:"#c9a84c", width:30 }}>{Math.round(volume*100)}%</span>
              </div>
            </div>


            {/* Music toggle */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optMusic||"Music"}</span>
              <button className={"toggle " + (musicEnabled?"on":"off")} onClick={() => setMusicEnabled(m => !m)} />
            </div>

            {/* Music Volume */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optMusicVol||"Music Volume"}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="range" className="slider" min="0" max="0.6" step="0.02"
                  value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))}
                  disabled={!musicEnabled} style={{ opacity: musicEnabled ? 1 : 0.4 }} />
                <span style={{ fontSize:12, color:"#c9a84c", width:30 }}>{Math.round(musicVolume/0.6*100)}%</span>
              </div>
            </div>

            {/* UI Scale */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optUiScale||"UI Scale"}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="range" className="slider" min="0.8" max="1.3" step="0.05"
                  value={uiScale} onChange={e => setUiScale(parseFloat(e.target.value))} />
                <span style={{ fontSize:12, color:"#c9a84c", width:30 }}>{Math.round(uiScale*100)}%</span>
              </div>
            </div>

            {/* FPS */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optFps||"Show FPS"}</span>
              <button className={"toggle " + (showFPS?"on":"off")} onClick={() => setShowFPS(f => !f)} />
            </div>

            {/* Fullscreen */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optFullscreen||"Fullscreen (F11)"}</span>
              <button className={"toggle " + (isFullscreen?"on":"off")} onClick={toggleFullscreen} />
            </div>

            {/* Language */}
            <div className="opt-row">
              <span style={{ fontSize:13 }}>{t.optLang||"Language"}</span>
              <select className="sel" style={{ width:"auto", padding:"4px 8px", fontSize:12 }}
                value={lang} onChange={e => setLang(e.target.value)}>
                {Object.entries(LANG_NAMES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            {/* Stats summary */}
            <div style={{ margin:"16px 0", padding:"12px", background:"#0a0a12", borderRadius:6, fontSize:11, color:"#8080a8" }}>
              <div style={{ marginBottom:4 }}>👔 {playerName} · 🌍 {playerRegion}</div>
              <div style={{ marginBottom:4 }}>{"Total earned: " + fmt(totalEarned) + " · Prestige: " + prestige}</div>
              <div>{"Achievements: " + unlockedAch.length + "/" + ACHIEVEMENTS_DEF.length}</div>
            </div>

            {/* Reset save */}
            <div className="opt-row" style={{ borderTop:"1px solid #1c1c2e", paddingTop:12 }}>
              <span style={{ fontSize:13, color:"#c05050" }}>{t.optReset||"Reset Save"}</span>
              <button className="btn btn-sell" style={{ fontSize:11, padding:"5px 14px" }}
                onClick={() => {
                  if (window.confirm(t.optResetConfirm||"Are you sure? This cannot be undone.")) {
                    localStorage.removeItem(SAVE_KEY);
                    window.location.reload();
                  }
                }}>
                {t.optReset||"Reset"}
              </button>
            </div>

            {/* Feedback button */}
            <button className="btn" style={{ width:"100%", marginTop:4, padding:"9px", fontSize:12, background:"#0a0a14", border:"1px solid #2a2a40", borderRadius:6, color:"#8888aa", cursor:"pointer", letterSpacing:1 }}
              onClick={() => { setShowOptions(false); setShowFeedback(true); setFeedbackStatus(null); }}>
              {t.optFeedback || "🐛  Bug / Suggestions"}
            </button>
            <button className="btn" style={{ width:"100%", marginTop:8, padding:"10px", fontSize:12, background:"#0f0f1a", border:"1px solid #3a2a4a", color:"#c9a84c", borderRadius:6, cursor:"pointer", letterSpacing:1 }}
              onClick={() => { save(); if (window.electronAPI?.quit) { window.electronAPI.quit(); } else { window.close(); } }}>
              {t.optSaveExit || "💾  Save & Exit"}
            </button>
            <button className="btn-pri" style={{ width:"100%", marginTop:8, padding:"10px", fontSize:12 }}
              onClick={() => { save(); setShowOptions(false); }}>
              {t.optClose||"CLOSE"}
            </button>
          </div>
        </div>
      )}

      {/* ── FEEDBACK MODAL ── */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, color:"#c9a84c" }}>{t.optFeedback||"Bug / Suggestions"}</div>
              <button onClick={() => setShowFeedback(false)} style={{ background:"none", border:"none", color:"#7070a0", cursor:"pointer", fontSize:20 }}>×</button>
            </div>

            {feedbackStatus === "ok" ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:15, color:"#6abf7a", fontWeight:600 }}>{t.feedbackThanks||"Thanks! We'll take a look."}</div>
                <button className="btn-pri" style={{ marginTop:20, padding:"10px 32px" }} onClick={() => setShowFeedback(false)}>OK</button>
              </div>
            ) : feedbackStatus === "err" ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ fontSize:13, color:"#c05050", marginBottom:16 }}>{t.feedbackErr||"Error sending. Please try again."}</div>
                <button className="btn-pri" onClick={() => setFeedbackStatus(null)} style={{ padding:"8px 24px" }}>{t.menuBack||"Back"}</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {/* Tipo */}
                <div>
                  <div style={{ fontSize:11, color:"#8080a8", letterSpacing:1, marginBottom:6 }}>{t.feedbackType||"TYPE"}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["bug","🐛 Bug"],["suggestion","💡 " + (t.feedbackSuggestion||"Suggestion")]].map(([id,label]) => (
                      <button key={id} onClick={() => setFeedbackType(id)}
                        style={{ flex:1, padding:"8px", borderRadius:6, cursor:"pointer", fontSize:12, fontFamily:"inherit",
                          background: feedbackType===id ? "#0f1a0f" : "#0a0a14",
                          border:`1px solid ${feedbackType===id?"#3a6a3a":"#2a2a40"}`,
                          color: feedbackType===id ? "#6abf7a" : "#555" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Descripción */}
                <div>
                  <div style={{ fontSize:11, color:"#8080a8", letterSpacing:1, marginBottom:6 }}>{t.feedbackDesc||"DESCRIPTION"}</div>
                  <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                    placeholder={t.feedbackPlaceholder||"Describe the bug or suggestion..."}
                    style={{ width:"100%", minHeight:100, background:"#0a0a14", border:"1px solid #2a2a40", borderRadius:6, color:"#e8e0d0", padding:"10px 12px", fontSize:12, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" }} />
                </div>
                {/* Email */}
                <div>
                  <div style={{ fontSize:11, color:"#8080a8", letterSpacing:1, marginBottom:6 }}>{t.feedbackEmail||"EMAIL (OPTIONAL)"}</div>
                  <input type="email" value={feedbackEmail} onChange={e => setFeedbackEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ width:"100%", background:"#0a0a14", border:"1px solid #2a2a40", borderRadius:6, color:"#e8e0d0", padding:"8px 12px", fontSize:12, fontFamily:"inherit", boxSizing:"border-box" }} />
                </div>
                <button className="btn-pri" style={{ padding:"11px", fontSize:13 }}
                  disabled={!feedbackText.trim() || feedbackStatus==="sending"}
                  onClick={async () => {
                    if (!feedbackText.trim()) return;
                    setFeedbackStatus("sending");
                    const typeLabel = feedbackType === "bug" ? "Error / Bug" : "Sugerencia";
                    try {
                      const res = await fetch("https://formspree.io/f/xkolwkng", {
                        method:"POST", headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({
                          _subject: `[El Gran Capitalista v${APP_VERSION}] ${typeLabel} — ${playerName}`,
                          Motivo: typeLabel,
                          Mensaje: feedbackText,
                          "Email jugador": feedbackEmail || "No proporcionado",
                          "Nombre CEO": playerName,
                          "Región": playerRegion,
                          "Idioma": lang,
                          "Versión": APP_VERSION,
                          "Prestige": prestige,
                          "Total ganado": fmt(totalEarned),
                          "Plataforma": typeof window !== "undefined" && window.navigator ? window.navigator.platform : "unknown",
                        })
                      });
                      if (res.ok) {
                        setFeedbackStatus("ok");
                        setFeedbackText("");
                        setFeedbackEmail("");
                        setFeedbackType("bug");
                      } else {
                        setFeedbackStatus("err");
                      }
                    } catch(e) { setFeedbackStatus("err"); }
                  }}>
                  {feedbackStatus==="sending" ? "⏳ Sending..." : "📤 " + (t.feedbackSend||"Send")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── OFFLINE EARNINGS POPUP ── */}
      {offlineEarnings && (() => {
        const offH = Math.floor((offlineEarnings.seconds||0) / 3600);
        const offM = Math.floor(((offlineEarnings.seconds||0) % 3600) / 60);
        const offAmt = offlineEarnings.earned || 0;
        return (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"linear-gradient(135deg,#13131f,#1a1a2e)", border:"2px solid #c9a84c", borderRadius:16, padding:"36px 40px", maxWidth:380, width:"90%", textAlign:"center", boxShadow:"0 0 60px rgba(201,168,76,.25)" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>💼</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#c9a84c", marginBottom:4 }}>{t.offlineTitle||"¡Bienvenido de vuelta!"}</div>
            <div style={{ fontSize:14, color:"#b0a8c8", marginBottom:4 }}>{t.offlineSub||"Mientras estabas fuera"}: <span style={{ color:"#c9a84c", fontWeight:700 }}>{offH}h {offM}m</span></div>
            <div style={{ fontSize:32, fontWeight:700, color:"#5aab6a", margin:"16px 0" }}>+{fmt(offAmt)}</div>
            <button onClick={() => { setMoney(m => m + offAmt); setTotalEarned(te => te + offAmt); setOfflineEarnings(null); sfx('achievement'); }}
              style={{ background:"linear-gradient(135deg,#1a3a1a,#2a5a2a)", border:"2px solid #3a8a3a", borderRadius:10, color:"#6abf7a", cursor:"pointer", padding:"12px 32px", fontSize:15, fontFamily:"inherit", fontWeight:700 }}>
              {t.offlineCollect||"Cobrar"}
            </button>
          </div>
        </div>
        );
      })()}

      {/* ── GLOBAL MARKET EVENT BANNER ── */}
      {activeMarketEvent && (
        <div style={{
          position:"fixed", bottom: activeNews ? 52 : 0, left:0, right:0, zIndex:51,
          background: activeMarketEvent.event.type === "crash"
            ? "linear-gradient(90deg,#2a0000,#1a0008,#2a0000)"
            : "linear-gradient(90deg,#002a00,#001a08,#002a00)",
          borderTop:`2px solid ${activeMarketEvent.event.type==="crash"?"#ff3030":"#30ff80"}`,
          padding:"10px 24px", display:"flex", alignItems:"center", gap:14,
          animation:"slideUp .4s ease-out", boxShadow:`0 -4px 30px ${activeMarketEvent.event.type==="crash"?"rgba(255,30,30,.3)":"rgba(30,255,100,.3)"}`
        }}>
          <span style={{ fontSize:28, animation:"pulse 1s infinite" }}>{activeMarketEvent.event.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color: activeMarketEvent.event.type==="crash"?"#ff6060":"#60ff90", letterSpacing:1 }}>
              {activeMarketEvent.event.text[lang]||activeMarketEvent.event.text.en}
            </div>
            <div style={{ fontSize:11, color:"#888", marginTop:2 }}>
              {activeMarketEvent.event.type==="crash"
                ? `📉 Stocks ${(activeMarketEvent.event.stockImpact*100).toFixed(0)}%  🔻 Crypto ${(activeMarketEvent.event.cryptoImpact*100).toFixed(0)}%`
                : `📈 Stocks +${(activeMarketEvent.event.stockImpact*100).toFixed(0)}%  🚀 Crypto +${(activeMarketEvent.event.cryptoImpact*100).toFixed(0)}%`}
              {" · "}{Math.max(0,Math.ceil((activeMarketEvent.endsAt-Date.now())/60000))}m
            </div>
          </div>
        </div>
      )}

      {/* NEWS BANNER */}
      {activeNews && (
        <div className="news-banner">
          <span className="news-tag">📰 {t.newsTitle||"NEWS"}</span>
          <span className="news-text">{activeNews.text[lang]||activeNews.text.en}</span>
          {activeNews.stockId && (
            <span className="news-impact" style={{ color: activeNews.impact > 0 ? "#5aab6a" : "#c05050" }}>
              {activeNews.impact > 0 ? "▲" : "▼"} {Math.abs(activeNews.impact * 100).toFixed(0)}%
            </span>
          )}
          <button onClick={() => setActiveNews(null)} className="news-close">✕</button>
        </div>
      )}
    </div>
  );
}

/**
 * Treasure Vault - Kaplay Game Engine
 * Chat-Controlled Explorer vs. 4 Chests (Snakes & Gold)
 */

// ==========================================
// 1. PROCEDURAL SOUND SYNTHESIZER (Web Audio)
// ==========================================
const Sound = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  playStep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140 + Math.random() * 30, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  },

  playChestOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Wooden squeak / creak
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(380, t + 0.12);
    osc.frequency.linearRampToValueAtTime(260, t + 0.22);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);

    // Latch metallic pop
    const pop = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    pop.type = "square";
    pop.frequency.setValueAtTime(750, t + 0.08);
    popGain.gain.setValueAtTime(0.12, t + 0.08);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    pop.connect(popGain);
    popGain.connect(this.ctx.destination);
    pop.start(t + 0.08);
    pop.stop(t + 0.14);
  },

  playSnakeHiss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Snake noise hiss
    const bufLen = Math.floor(this.ctx.sampleRate * 0.35);
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 3200;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);

    // Strike impact sound
    const strike = this.ctx.createOscillator();
    const strikeGain = this.ctx.createGain();
    strike.type = "sawtooth";
    strike.frequency.setValueAtTime(200, t + 0.04);
    strike.frequency.exponentialRampToValueAtTime(45, t + 0.28);
    strikeGain.gain.setValueAtTime(0.25, t + 0.04);
    strikeGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    strike.connect(strikeGain);
    strikeGain.connect(this.ctx.destination);
    strike.start(t + 0.04);
    strike.stop(t + 0.28);
  },

  playHurt() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.25);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  },

  playGoldFound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Ascending shimmer arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const startT = t + i * 0.07;
      osc.frequency.setValueAtTime(f, startT);
      gain.gain.setValueAtTime(0.18, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.35);
    });
  },

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [293.66, 261.63, 246.94, 196.00];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      const startT = t + i * 0.22;
      osc.frequency.setValueAtTime(f, startT);
      gain.gain.setValueAtTime(0.2, startT);
      gain.gain.exponentialRampToValueAtTime(0.005, startT + 0.38);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.38);
    });
  },

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12, w: 0.0 },
      { f: 523.25, d: 0.12, w: 0.15 },
      { f: 523.25, d: 0.12, w: 0.30 },
      { f: 659.25, d: 0.25, w: 0.45 },
      { f: 783.99, d: 0.25, w: 0.72 },
      { f: 1046.50, d: 0.60, w: 1.00 },
    ];
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const startT = t + n.w;
      osc.frequency.setValueAtTime(n.f, startT);
      gain.gain.setValueAtTime(0.25, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + n.d);
    });
  }
};

// ==========================================
// 2. SVG SPRITE ASSETS (Data URIs)
// ==========================================
function svgToUri(svgString) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString.trim());
}

const SPRITES = {
  hero: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <!-- Shadow -->
      <ellipse cx="24" cy="45" rx="14" ry="3" fill="rgba(0,0,0,0.35)"/>
      <!-- Boots -->
      <rect x="15" y="38" width="7" height="6" rx="2" fill="#4e342e"/>
      <rect x="26" y="38" width="7" height="6" rx="2" fill="#4e342e"/>
      <!-- Pants -->
      <rect x="16" y="29" width="6" height="10" fill="#2c3e50"/>
      <rect x="26" y="29" width="6" height="10" fill="#2c3e50"/>
      <!-- Belt -->
      <rect x="14" y="27" width="20" height="3" fill="#3e2723"/>
      <rect x="22" y="27" width="4" height="3" fill="#f1c40f"/>
      <!-- Explorer Shirt & Vest -->
      <rect x="14" y="17" width="20" height="11" rx="2" fill="#8d6e63"/>
      <rect x="18" y="17" width="12" height="11" fill="#fdfefe"/>
      <!-- Head -->
      <circle cx="24" cy="13" r="7" fill="#ffdbac"/>
      <!-- Eyes -->
      <circle cx="21.5" cy="12" r="1.2" fill="#2c3e50"/>
      <circle cx="26.5" cy="12" r="1.2" fill="#2c3e50"/>
      <circle cx="22" cy="11.5" r="0.4" fill="#ffffff"/>
      <circle cx="27" cy="11.5" r="0.4" fill="#ffffff"/>
      <!-- Smile -->
      <path d="M22 15 Q24 17 26 15" stroke="#b05d4b" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <!-- Adventurer Fedora Hat -->
      <ellipse cx="24" cy="8.5" rx="14" ry="3.5" fill="#6d4c41"/>
      <path d="M15 8.5 C15 2, 33 2, 33 8.5 Z" fill="#8d6e63"/>
      <rect x="15" y="7.5" width="18" height="2" fill="#3e2723"/>
    </svg>
  `),

  chest_closed: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 48" width="54" height="48">
      <ellipse cx="27" cy="45" rx="22" ry="3" fill="rgba(0,0,0,0.35)"/>
      <!-- Chest Base -->
      <rect x="6" y="18" width="42" height="26" rx="2" fill="#5c3826"/>
      <rect x="8" y="20" width="38" height="22" rx="1" fill="#795548"/>
      <!-- Planks -->
      <line x1="8" y1="27" x2="46" y2="27" stroke="#4e342e" stroke-width="1.5"/>
      <line x1="8" y1="35" x2="46" y2="35" stroke="#4e342e" stroke-width="1.5"/>
      <!-- Lid Closed -->
      <path d="M5 18 Q27 8 49 18 Z" fill="#8d6e63"/>
      <path d="M6 18 Q27 10 48 18" stroke="#4e342e" stroke-width="2" fill="none"/>
      <!-- Golden Straps -->
      <rect x="13" y="13" width="5" height="31" fill="#f1c40f"/>
      <rect x="36" y="13" width="5" height="31" fill="#f1c40f"/>
      <!-- Golden Rivets -->
      <circle cx="15.5" cy="17" r="1.2" fill="#fef9e7"/>
      <circle cx="15.5" cy="38" r="1.2" fill="#fef9e7"/>
      <circle cx="38.5" cy="17" r="1.2" fill="#fef9e7"/>
      <circle cx="38.5" cy="38" r="1.2" fill="#fef9e7"/>
      <!-- Lock Pad -->
      <rect x="23" y="17" width="8" height="12" rx="2" fill="#f39c12"/>
      <rect x="25" y="21" width="4" height="6" rx="1" fill="#2c1d11"/>
      <circle cx="27" cy="23.5" r="1" fill="#f1c40f"/>
    </svg>
  `),

  chest_open: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" width="54" height="54">
      <ellipse cx="27" cy="51" rx="22" ry="3" fill="rgba(0,0,0,0.35)"/>
      <!-- Lid Raised Upwards -->
      <path d="M6 18 Q27 2 48 18 L46 6 Q27 -6 8 6 Z" fill="#8d6e63"/>
      <path d="M8 6 Q27 -6 46 6" stroke="#f1c40f" stroke-width="2" fill="none"/>
      <rect x="14" y="5" width="4" height="13" fill="#f1c40f" transform="rotate(-12 16 11)"/>
      <rect x="36" y="5" width="4" height="13" fill="#f1c40f" transform="rotate(12 38 11)"/>
      <!-- Dark Inside Opening -->
      <rect x="7" y="20" width="40" height="9" fill="#1b120c"/>
      <!-- Chest Base -->
      <rect x="6" y="25" width="42" height="25" rx="2" fill="#5c3826"/>
      <rect x="8" y="27" width="38" height="21" rx="1" fill="#795548"/>
      <line x1="8" y1="34" x2="46" y2="34" stroke="#4e342e" stroke-width="1.5"/>
      <line x1="8" y1="42" x2="46" y2="42" stroke="#4e342e" stroke-width="1.5"/>
      <!-- Straps -->
      <rect x="13" y="25" width="5" height="25" fill="#f1c40f"/>
      <rect x="36" y="25" width="5" height="25" fill="#f1c40f"/>
    </svg>
  `),

  snake: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
      <!-- Shadow -->
      <ellipse cx="25" cy="46" rx="16" ry="3" fill="rgba(0,0,0,0.35)"/>
      <!-- Snake Coils -->
      <path d="M12 40 C10 32, 22 30, 26 35 C30 40, 40 37, 38 31 C36 24, 25 24, 18 22 C10 20, 12 12, 20 9 C26 7, 30 5, 27 2" 
            stroke="#1b5e20" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M12 40 C10 32, 22 30, 26 35 C30 40, 40 37, 38 31 C36 24, 25 24, 18 22 C10 20, 12 12, 20 9 C26 7, 30 5, 27 2" 
            stroke="#2ecc71" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <!-- Yellow Belly Scales Pattern -->
      <circle cx="23" cy="35" r="1.8" fill="#f1c40f"/>
      <circle cx="34" cy="33" r="1.8" fill="#f1c40f"/>
      <circle cx="20" cy="23" r="1.8" fill="#f1c40f"/>
      <circle cx="15" cy="15" r="1.8" fill="#f1c40f"/>
      <!-- Cobra Head -->
      <ellipse cx="28" cy="3" rx="7" ry="5" fill="#27ae60"/>
      <!-- Menacing Red Eyes -->
      <circle cx="25.5" cy="2" r="1.5" fill="#e74c3c"/>
      <circle cx="30.5" cy="2" r="1.5" fill="#e74c3c"/>
      <circle cx="25.5" cy="2" r="0.6" fill="#ffffff"/>
      <circle cx="30.5" cy="2" r="0.6" fill="#ffffff"/>
      <!-- Red Forked Tongue -->
      <path d="M35 3 L41 3 L45 0 M41 3 L45 6" stroke="#e74c3c" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>
  `),

  gold: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" width="54" height="54">
      <!-- Glow -->
      <circle cx="27" cy="27" r="25" fill="rgba(241, 196, 15, 0.2)"/>
      <!-- Sparkles -->
      <path d="M9 13 L11 17 L9 21 L7 17 Z" fill="#ffffff"/>
      <path d="M45 11 L47 15 L45 19 L43 15 Z" fill="#ffffff"/>
      <path d="M27 3 L29 7 L27 11 L25 7 Z" fill="#ffffff"/>
      <!-- Gold Coin Piles -->
      <ellipse cx="18" cy="40" rx="9" ry="4.5" fill="#d4ac0d"/>
      <ellipse cx="18" cy="38" rx="9" ry="4.5" fill="#f1c40f"/>
      <ellipse cx="36" cy="41" rx="9" ry="4.5" fill="#d4ac0d"/>
      <ellipse cx="36" cy="39" rx="9" ry="4.5" fill="#f1c40f"/>
      <ellipse cx="27" cy="44" rx="11" ry="5" fill="#b7950b"/>
      <ellipse cx="27" cy="42" rx="11" ry="5" fill="#f1c40f"/>
      <!-- Golden Crown & Jewels -->
      <path d="M20 28 L34 28 L37 17 L30 22 L27 13 L24 22 L17 17 Z" fill="#f1c40f" stroke="#d4ac0d" stroke-width="1.2"/>
      <circle cx="27" cy="24" r="2.2" fill="#e74c3c"/>
      <circle cx="21" cy="25" r="1.8" fill="#3498db"/>
      <circle cx="33" cy="25" r="1.8" fill="#2ecc71"/>
    </svg>
  `),

  pedestal: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 28" width="68" height="28">
      <ellipse cx="34" cy="24" rx="30" ry="4" fill="rgba(0,0,0,0.4)"/>
      <path d="M6 16 L12 24 L56 24 L62 16 Z" fill="#2c3e50"/>
      <ellipse cx="34" cy="14" rx="30" ry="8" fill="#34495e"/>
      <ellipse cx="34" cy="12" rx="28" ry="7" fill="#4a6572"/>
      <!-- Runic gold inlay border -->
      <ellipse cx="34" cy="12" rx="24" ry="5.5" stroke="#f1c40f" stroke-width="1" fill="none" opacity="0.6"/>
    </svg>
  `),

  torch: svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <rect x="10" y="18" width="4" height="16" fill="#5d4037" rx="1"/>
      <polygon points="8,18 16,18 14,14 10,14" fill="#795548"/>
      <!-- Fire flame -->
      <path d="M12 2 C16 7, 18 12, 12 16 C6 12, 8 7, 12 2 Z" fill="#e67e22"/>
      <path d="M12 5 C15 9, 16 12, 12 15 C8 12, 9 9, 12 5 Z" fill="#f1c40f"/>
    </svg>
  `)
};

// ==========================================
// 3. KAPLAY GAME SETUP
// ==========================================
const stageEl = document.getElementById("kaplay-stage");

// Initialize Kaplay
kaplay({
  width: 800,
  height: 600,
  letterbox: true,
  background: [20, 26, 36],
  root: stageEl,
  pixelDensity: 2,
  debug: false
});

// Load all SVG sprites into Kaplay
loadSprite("hero", SPRITES.hero);
loadSprite("chest_closed", SPRITES.chest_closed);
loadSprite("chest_open", SPRITES.chest_open);
loadSprite("snake", SPRITES.snake);
loadSprite("gold", SPRITES.gold);
loadSprite("pedestal", SPRITES.pedestal);
loadSprite("torch", SPRITES.torch);

// ==========================================
// 4. UI CONTROLLER & CHAT LOG
// ==========================================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const UI = {
  heart1: document.getElementById("heart-1"),
  heart2: document.getElementById("heart-2"),
  openedCounter: document.getElementById("opened-counter"),
  toast: document.getElementById("game-toast"),
  modal: document.getElementById("game-modal"),
  modalIcon: document.getElementById("modal-icon"),
  modalTitle: document.getElementById("modal-title"),
  modalDesc: document.getElementById("modal-desc"),
  modalStats: document.getElementById("modal-stats"),
  modalBtn: document.getElementById("modal-action-btn"),
  soundBtn: document.getElementById("sound-btn"),
  restartBtn: document.getElementById("restart-btn"),

  // Chat elements
  chatMessages: document.getElementById("chat-messages"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  quickBtns: document.querySelectorAll(".quick-btn"),

  toastTimer: null,

  updateHearts(count) {
    if (count === 2) {
      this.heart1.className = "heart full";
      this.heart2.className = "heart full";
    } else if (count === 1) {
      this.heart1.className = "heart full";
      this.heart2.className = "heart empty";
    } else {
      this.heart1.className = "heart empty";
      this.heart2.className = "heart empty";
    }
  },

  updateChestCount(opened, total = 4) {
    this.openedCounter.textContent = `${opened} / ${total} Opened`;
  },

  showToast(message, type = "normal", duration = 2500) {
    clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.className = `toast ${type}`;
    this.toastTimer = setTimeout(() => {
      this.toast.className = "toast hidden";
    }, duration);
  },

  showModal({ isWin, title, desc, opened, remainingHearts }) {
    this.modal.classList.remove("hidden");
    const card = this.modal.querySelector(".modal-card");
    if (isWin) {
      card.className = "modal-card";
      this.modalIcon.textContent = "🏆";
      this.modalBtn.textContent = "Play Again (Space / Enter)";
    } else {
      card.className = "modal-card gameover";
      this.modalIcon.textContent = "💀";
      this.modalBtn.textContent = "Try Again (Space / Enter)";
    }
    this.modalTitle.textContent = title;
    this.modalDesc.textContent = desc;
    this.modalStats.innerHTML = `
      Chests Opened: <strong>${opened} / 4</strong> &nbsp;|&nbsp; 
      Remaining Hearts: <strong>${remainingHearts} / 2</strong>
    `;
  },

  hideModal() {
    this.modal.classList.add("hidden");
  },

  addChatMessage(sender, htmlText) {
    if (!this.chatMessages) return;
    const msg = document.createElement("div");
    msg.className = `chat-msg ${sender}`;
    const avatar = sender === "user" ? "👤" : (sender === "hero" ? "🤠" : "ℹ️");
    msg.innerHTML = `
      <span class="chat-msg-avatar">${avatar}</span>
      <div class="chat-msg-bubble">${htmlText}</div>
    `;
    this.chatMessages.appendChild(msg);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  },

  updateQuickButtons(chests) {
    this.quickBtns.forEach(btn => {
      const cmd = btn.getAttribute("data-cmd");
      const match = /chest\s*(?:number)?\s*([1-4])/i.exec(cmd);
      if (match) {
        const id = parseInt(match[1], 10) - 1;
        if (chests && chests[id] && chests[id].opened) {
          btn.classList.add("opened");
          btn.title = `Chest #${id + 1} is already opened (${chests[id].type})`;
        } else {
          btn.classList.remove("opened");
          btn.title = `Move to Chest #${id + 1}`;
        }
      }
    });
  }
};

// Sound toggle
UI.soundBtn.addEventListener("click", () => {
  Sound.muted = !Sound.muted;
  UI.soundBtn.textContent = Sound.muted ? "🔇 Sound: OFF" : "🔊 Sound: ON";
});

// Restart button
UI.restartBtn.addEventListener("click", () => {
  go("game");
});

// Modal button
UI.modalBtn.addEventListener("click", () => {
  go("game");
});

// Global Enter / Space restart listener when modal is showing
window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    if (!UI.modal.classList.contains("hidden")) {
      e.preventDefault();
      go("game");
    }
  }
});

// ==========================================
// 5. CHAT COMMAND CONTROLLER
// ==========================================
// Global active references to current scene objects
let activeChests = [];
let activePlayer = null;
let activeGameState = "playing";

function handleChatCommand(rawInput) {
  const text = rawInput.trim();
  if (!text) return;

  // Add the user's message to chat log
  UI.addChatMessage("user", escapeHtml(text));

  // Restart command
  if (/^(restart|new\s*game|play\s*again|reset)$/i.test(text)) {
    go("game");
    return;
  }

  // If game is not active
  if (activeGameState !== "playing" || !activePlayer) {
    UI.addChatMessage("hero", "The round is finished! Click <strong>New Game</strong> or type <strong>restart</strong> to enter a new vault.");
    return;
  }

  // Parse chest target from input
  // Supports: "chest number 1", "chest 1", "go to chest number 1", "open chest 1", "1", "chest one", etc.
  const wordMap = { one: 1, two: 2, three: 3, four: 4 };
  let chestNum = null;

  // Numerical match (1-4)
  const numMatch = /(?:chest\s*(?:number|#)?\s*|go\s*to\s*(?:the\s*)?chest\s*(?:number|#)?\s*|open\s*chest\s*|^)([1-4])\b/i.exec(text);
  if (numMatch) {
    chestNum = parseInt(numMatch[1], 10);
  } else {
    // English word match (one, two, three, four)
    const wordMatch = /(?:chest\s*(?:number)?\s*|go\s*to\s*(?:the\s*)?chest\s*(?:number)?\s*)(one|two|three|four)\b/i.exec(text);
    if (wordMatch) {
      chestNum = wordMap[wordMatch[1].toLowerCase()];
    }
  }

  if (chestNum && chestNum >= 1 && chestNum <= 4) {
    const chestIdx = chestNum - 1;
    const targetChest = activeChests[chestIdx];
    if (!targetChest) return;

    if (targetChest.opened) {
      const typeDesc = targetChest.type === "snake" ? "a deadly snake 🐍" : "the gold treasure 🏆";
      UI.addChatMessage("hero", `Chest #${chestNum} is already open! It was ${typeDesc}. Choose an unopened chest!`);
      return;
    }

    // Set player navigation destination
    Sound.init();
    // Stop point is just below the chest so the adventurer stands right before it
    activePlayer.destination = targetChest.pos.add(vec2(0, 32));
    activePlayer.targetChest = targetChest;

    UI.addChatMessage("hero", `On my way to <strong>Chest #${chestNum}</strong>! 🚶‍♂️`);
    UI.showToast(`Moving to Chest #${chestNum}...`, "normal", 2000);
  } else if (/^(help|rules|what|info)$/i.test(text)) {
    UI.addChatMessage("hero", "Tell me which chest to explore! Type <strong>chest number 1</strong>, <strong>chest number 2</strong>, <strong>chest number 3</strong>, or <strong>chest number 4</strong>.");
  } else {
    UI.addChatMessage("hero", `I don't know what you mean by "<em>${escapeHtml(text)}</em>". Try typing: <strong>chest number 1</strong>, <strong>chest number 2</strong>, <strong>chest number 3</strong>, or <strong>chest number 4</strong>.`);
  }
}

// Attach Chat Form Submission listener
if (UI.chatForm) {
  UI.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = UI.chatInput.value;
    UI.chatInput.value = "";
    handleChatCommand(val);
    if (UI.chatInput) UI.chatInput.focus();
  });
}

// Attach Quick Command Buttons listener
UI.quickBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const cmd = btn.getAttribute("data-cmd");
    if (cmd) {
      handleChatCommand(cmd);
      if (UI.chatInput) UI.chatInput.focus();
    }
  });
});

// ==========================================
// 6. MAIN GAME SCENE
// ==========================================
scene("game", () => {
  UI.hideModal();
  UI.showToast("Type 'chest number 1' into the chat to move!", "normal", 3500);

  let hearts = 2;
  let openedCount = 0;
  let gameState = "playing"; // "playing", "won", "lost"
  let invulnerableTimer = 0;
  let stepSoundTimer = 0;

  activeGameState = gameState;

  UI.updateHearts(hearts);
  UI.updateChestCount(openedCount);

  // Initialize Chat Log with Welcome message
  if (UI.chatMessages) {
    UI.chatMessages.innerHTML = "";
    UI.addChatMessage("system", "--- New Vault Adventure Started ---");
    UI.addChatMessage("hero", "I'm ready in the vault! Tell me which chest to open: type <strong>chest number 1</strong>, <strong>chest number 2</strong>, etc.");
  }
  if (UI.chatInput) {
    UI.chatInput.value = "";
    UI.chatInput.focus();
  }

  // ----------------------------------------
  // A. Room Dungeon Graphics (Floor & Walls)
  // ----------------------------------------
  // Floor grid pavers
  for (let x = 60; x <= 740; x += 40) {
    for (let y = 60; y <= 540; y += 40) {
      add([
        rect(38, 38, { radius: 2 }),
        pos(x, y),
        anchor("center"),
        color(28, 35, 48),
        z(0)
      ]);
    }
  }

  // Dungeon Wall borders
  add([
    rect(800, 60),
    pos(0, 0),
    color(14, 18, 25),
    outline(2, rgb(48, 54, 61)),
    z(1)
  ]);
  add([
    rect(800, 60),
    pos(0, 540),
    color(14, 18, 25),
    outline(2, rgb(48, 54, 61)),
    z(1)
  ]);
  add([
    rect(60, 600),
    pos(0, 0),
    color(14, 18, 25),
    outline(2, rgb(48, 54, 61)),
    z(1)
  ]);
  add([
    rect(60, 600),
    pos(740, 0),
    color(14, 18, 25),
    outline(2, rgb(48, 54, 61)),
    z(1)
  ]);

  // Wall Torches with glowing flicker
  const torchPositions = [
    vec2(200, 48), vec2(400, 48), vec2(600, 48),
    vec2(200, 548), vec2(400, 548), vec2(600, 548)
  ];
  torchPositions.forEach((tp) => {
    add([
      sprite("torch"),
      pos(tp),
      anchor("center"),
      z(2)
    ]);
    add([
      circle(22),
      pos(tp.x, tp.y - 6),
      anchor("center"),
      color(241, 196, 15),
      opacity(0.12),
      z(2)
    ]);
  });

  // Room Title tag in canvas
  add([
    text("VAULT CHAMBER", { size: 14 }),
    pos(400, 24),
    anchor("center"),
    color(139, 148, 158),
    z(3)
  ]);

  // ----------------------------------------
  // B. The 4 Treasure Chests Setup
  // ----------------------------------------
  const chestCoords = [
    { x: 220, y: 190 }, // Chest #1 (Top-Left)
    { x: 580, y: 190 }, // Chest #2 (Top-Right)
    { x: 220, y: 430 }, // Chest #3 (Bottom-Left)
    { x: 580, y: 430 }  // Chest #4 (Bottom-Right)
  ];

  // Randomly assign one chest to contain GOLD (the other three have SNAKES)
  const goldenIndex = Math.floor(Math.random() * 4);
  const chests = [];

  chestCoords.forEach((coord, idx) => {
    const isGold = (idx === goldenIndex);

    // Stone Pedestal under the chest
    add([
      sprite("pedestal"),
      pos(coord.x, coord.y + 12),
      anchor("center"),
      z(3)
    ]);

    // Chest Object
    const chestObj = add([
      sprite("chest_closed"),
      pos(coord.x, coord.y - 6),
      anchor("center"),
      z(4),
      {
        id: idx,
        type: isGold ? "gold" : "snake",
        opened: false,
        coord: coord
      }
    ]);

    // Clear visible label tag above chest: "CHEST #1", "CHEST #2", etc.
    add([
      text(`CHEST #${idx + 1}`, { size: 12 }),
      pos(coord.x, coord.y - 38),
      anchor("center"),
      color(241, 196, 15),
      z(4)
    ]);

    chests.push(chestObj);
  });

  activeChests = chests;
  UI.updateQuickButtons(activeChests);

  // ----------------------------------------
  // C. The Player Character
  // ----------------------------------------
  const player = add([
    sprite("hero"),
    pos(400, 310),
    anchor("center"),
    z(10),
    {
      speed: 210,
      walkCycle: 0,
      destination: null,
      targetChest: null
    }
  ]);

  activePlayer = player;

  // Player room boundary limits
  const MIN_X = 90;
  const MAX_X = 710;
  const MIN_Y = 95;
  const MAX_Y = 510;

  // ----------------------------------------
  // D. Particle & Effect Helpers
  // ----------------------------------------
  function spawnSparkleBurst(centerPos) {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.2;
      const speed = rand(80, 220);
      const vel = vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);
      const pColor = choose([
        rgb(241, 196, 15),
        rgb(255, 255, 255),
        rgb(243, 156, 18),
        rgb(52, 152, 219)
      ]);

      const particle = add([
        rect(rand(4, 8), rand(4, 8), { radius: 2 }),
        pos(centerPos),
        color(pColor),
        anchor("center"),
        opacity(1),
        z(15)
      ]);

      tween(
        particle.pos,
        particle.pos.add(vel.scale(0.6)),
        0.7,
        (p) => particle.pos = p,
        easings.easeOutQuad
      );

      tween(
        1,
        0,
        0.7,
        (val) => particle.opacity = val,
        easings.easeInQuad
      ).then(() => destroy(particle));
    }
  }

  function spawnFloatingText(message, position, textColor) {
    const floatLabel = add([
      text(message, { size: 14 }),
      pos(position.x, position.y - 20),
      anchor("center"),
      color(textColor),
      opacity(1),
      z(20)
    ]);

    tween(
      floatLabel.pos.y,
      floatLabel.pos.y - 40,
      0.9,
      (y) => floatLabel.pos.y = y,
      easings.easeOutQuad
    );

    tween(
      1,
      0,
      0.9,
      (op) => floatLabel.opacity = op,
      easings.easeInQuad
    ).then(() => destroy(floatLabel));
  }

  // ----------------------------------------
  // E. Chest Opening & Outcome Handler
  // ----------------------------------------
  function openChest(chest) {
    if (chest.opened || gameState !== "playing") return;

    chest.opened = true;
    chest.sprite = "chest_open";
    player.destination = null;
    player.targetChest = null;
    openedCount++;
    UI.updateChestCount(openedCount);
    UI.updateQuickButtons(chests);
    Sound.playChestOpen();

    const spawnY = chest.pos.y;
    const targetY = chest.pos.y - 32;

    if (chest.type === "snake") {
      // Reveal Snake
      const snakeObj = add([
        sprite("snake"),
        pos(chest.pos.x, spawnY),
        anchor("center"),
        scale(0.4),
        z(6)
      ]);

      // Pop snake upward
      tween(
        snakeObj.pos.y,
        targetY,
        0.4,
        (y) => snakeObj.pos.y = y,
        easings.easeOutBack
      );
      tween(
        0.4,
        1,
        0.4,
        (s) => snakeObj.scale = vec2(s, s),
        easings.easeOutBack
      );

      // Snake Audio & Screen Shake
      Sound.playSnakeHiss();
      Sound.playHurt();
      shake(14);

      // Player Damage & Knockback
      hearts--;
      UI.updateHearts(hearts);
      invulnerableTimer = 0.8;

      // Knock player back slightly away from chest
      const knockVec = player.pos.sub(chest.pos).unit().scale(45);
      player.pos = player.pos.add(knockVec);
      player.pos.x = Math.max(MIN_X, Math.min(MAX_X, player.pos.x));
      player.pos.y = Math.max(MIN_Y, Math.min(MAX_Y, player.pos.y));

      spawnFloatingText("-1 HEART! 🐍", chest.pos, rgb(231, 76, 60));

      if (hearts <= 0) {
        // Game Over!
        gameState = "lost";
        activeGameState = "lost";
        Sound.playGameOver();
        UI.showToast("💀 The snake bit you! GAME OVER!", "danger", 3500);
        UI.addChatMessage("hero", `🐍 YIKES! Chest #${chest.id + 1} had a venomous SNAKE! I've lost my last heart... 💀 GAME OVER!`);

        // Collapse player
        tween(
          player.scale.y,
          0.2,
          0.6,
          (s) => player.scale.y = s,
          easings.easeInQuad
        );

        wait(1.2, () => {
          UI.showModal({
            isWin: false,
            title: "GAME OVER",
            desc: "The venomous snakes guarded the vault! You lost all your hearts.",
            opened: openedCount,
            remainingHearts: 0
          });
        });
      } else {
        UI.showToast("⚠️ Ouch! A snake bit you! 1 Heart Left!", "danger", 2500);
        UI.addChatMessage("hero", `🐍 A SNAKE was inside Chest #${chest.id + 1}! It bit me and I lost 1 heart! Only <strong>1 Heart left</strong>! Choose the next chest carefully!`);
      }

    } else if (chest.type === "gold") {
      // Reveal Gold (WINNER!)
      gameState = "won";
      activeGameState = "won";

      const goldObj = add([
        sprite("gold"),
        pos(chest.pos.x, spawnY),
        anchor("center"),
        scale(0.4),
        z(6)
      ]);

      // Pop gold upward
      tween(
        goldObj.pos.y,
        targetY,
        0.5,
        (y) => goldObj.pos.y = y,
        easings.easeOutBack
      );
      tween(
        0.4,
        1.1,
        0.5,
        (s) => goldObj.scale = vec2(s, s),
        easings.easeOutBack
      );

      spawnSparkleBurst(chest.pos);
      Sound.playGoldFound();
      Sound.playVictory();
      shake(8);

      spawnFloatingText("✨ GOLD FOUND! ✨", chest.pos, rgb(241, 196, 15));
      UI.showToast("🏆 YOU FOUND THE GOLD! VICTORY!", "success", 4000);
      UI.addChatMessage("hero", `🏆 WE DID IT! Chest #${chest.id + 1} has the ancient GOLD! 💰✨ WE WIN!`);

      // Player celebratory bounce
      tween(
        player.pos.y,
        player.pos.y - 20,
        0.25,
        (y) => player.pos.y = y,
        easings.easeOutQuad
      ).then(() => {
        tween(
          player.pos.y,
          player.pos.y + 20,
          0.25,
          (y) => player.pos.y = y,
          easings.easeInQuad
        );
      });

      wait(1.3, () => {
        UI.showModal({
          isWin: true,
          title: "VICTORY!",
          desc: "Amazing treasure hunter! You found the hidden gold vault!",
          opened: openedCount,
          remainingHearts: hearts
        });
      });
    }
  }

  // ----------------------------------------
  // F. Frame Update Loop
  // ----------------------------------------
  onUpdate(() => {
    const delta = dt();

    // Invulnerability flashing update
    if (invulnerableTimer > 0) {
      invulnerableTimer -= delta;
      player.opacity = Math.sin(time() * 30) > 0 ? 0.3 : 1;
      player.color = rgb(255, 120, 120);
    } else {
      player.opacity = 1;
      player.color = rgb(255, 255, 255);
    }

    if (gameState !== "playing") return;

    // Chat-driven movement to destination
    if (player.destination) {
      const diff = player.destination.sub(player.pos);
      const dist = diff.len();

      if (dist > 6) {
        const moveDir = diff.unit();
        player.pos = player.pos.add(moveDir.scale(player.speed * delta));

        // Facing direction
        if (moveDir.x < 0) {
          player.flipX = true;
        } else if (moveDir.x > 0) {
          player.flipX = false;
        }

        // Walking bob animation
        player.walkCycle += delta * 14;
        player.pos.y += Math.sin(player.walkCycle) * 0.4;

        // Footstep sound interval
        stepSoundTimer += delta;
        if (stepSoundTimer >= 0.28) {
          stepSoundTimer = 0;
          Sound.playStep();
        }
      } else {
        // Destination reached!
        player.pos = player.destination;
        player.destination = null;
      }
    }

    // Clamp player within room boundaries
    player.pos.x = Math.max(MIN_X, Math.min(MAX_X, player.pos.x));
    player.pos.y = Math.max(MIN_Y, Math.min(MAX_Y, player.pos.y));

    // Approach detection: Check distance to each unopened chest
    chests.forEach((chest) => {
      if (!chest.opened) {
        const dist = player.pos.dist(chest.pos);
        // Approach threshold distance: 62 pixels
        if (dist <= 62) {
          openChest(chest);
        }
      }
    });
  });
});

// Start the game scene
go("game");

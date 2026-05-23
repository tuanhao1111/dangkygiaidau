(function() {
  'use strict';

  // === DOM ELEMENTS ===
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel-card');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submit-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const formEl = document.getElementById('register-form');

  // === LOCAL PLAYER CACHE ===
  let cachedPlayers = [];
  let cachedLocked = false; // trạng thái đã kết thúc đăng ký

  // === MON PHAI TO CLASS DICTIONARY ===
  const heClass = {
    'Tố vấn': 'he-tovan',
    'Thiết y': 'he-thietY',
    'Cửu linh': 'he-culinh',
    'Long ngâm': 'he-longngam',
    'Thần tương': 'he-thantuong',
    'Toái mộng': 'he-toaimong',
    'Huyết Hà' :'he-huyetha'
  };

  // === WEB AUDIO API SYNTHESIZER ===
  class WuxiaSound {
    static init() {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();
    }

    static playBell() {
      this.init();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const t = this.ctx.currentTime;
      
      // Beautiful harmonic series simulating a crystal wuxia chime
      const frequencies = [523.25, 783.99, 1046.50, 1318.51];
      const gains = [0.12, 0.08, 0.05, 0.03];
      const decays = [1.5, 1.2, 0.9, 0.6];
      
      frequencies.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(gains[i], t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decays[i]);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(t);
        osc.stop(t + decays[i]);
      });
    }

    static playDrum() {
      this.init();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const t = this.ctx.currentTime;
      
      // 1. Drum body (low frequency acoustic sweep)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, t);
      
      oscGain.gain.setValueAtTime(0, t);
      oscGain.gain.linearRampToValueAtTime(0.38, t + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.45);

      // 2. Drum strike slap (fast white noise attack burst)
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, t);
      noiseFilter.Q.setValueAtTime(1.5, t);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.06);
    }

    static playClash() {
      this.init();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const t = this.ctx.currentTime;
      
      // 1. Metallic Ring (High-freq beating effect for realistic blade collision)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2600, t);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2612, t); // 12Hz difference creates natural beating ring
      
      ringGain.gain.setValueAtTime(0, t);
      ringGain.gain.linearRampToValueAtTime(0.05, t + 0.005);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      
      osc1.connect(ringGain);
      osc2.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.35);
      osc2.stop(t + 0.35);

      // 2. Friction/Slap Noise (High pass filtered metallic scrape)
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, t);
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + 0.18);
    }

    static playWhoosh() {
      this.init();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const t = this.ctx.currentTime;
      
      const duration = 0.55;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.5, t);
      
      // Sweep center frequency smoothly: 250Hz -> 850Hz -> 180Hz
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(850, t + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(180, t + duration);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.16, t + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(t);
      noise.stop(t + duration);
    }

    static playTick() {
      this.init();
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const t = this.ctx.currentTime;
      
      // A crisp mechanical click using an exponential frequency sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(350, t + 0.035);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  // === BACKGROUND MUSIC CONTROL ===
  let bgmAudio = null;
  let isBgmPlaying = false;

  function initBGM() {
    const bgmBtn = document.getElementById('bgm-toggle-btn');
    if (!bgmBtn) return;
    const statusText = document.getElementById('bgm-status-text');
    
    // Mixkit free loopable classical Chinese acoustic track
    bgmAudio = new Audio('https://assets.mixkit.co/music/preview/mixkit-classical-chinese-monastery-1729.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.22;

    const savedState = localStorage.getItem('dangkygiaidau_bgm_enabled') === 'true';
    if (savedState) {
      const handleFirstClick = () => {
        toggleBGM(true);
        window.removeEventListener('click', handleFirstClick);
      };
      window.addEventListener('click', handleFirstClick);
    }

    bgmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      WuxiaSound.playBell();
      if (WuxiaSound.ctx && WuxiaSound.ctx.state === 'suspended') {
        WuxiaSound.ctx.resume();
      }
      toggleBGM();
    });
  }

  function toggleBGM(forcePlay) {
    const bgmBtn = document.getElementById('bgm-toggle-btn');
    const statusText = document.getElementById('bgm-status-text');
    if (!bgmAudio || !bgmBtn || !statusText) return;

    if (forcePlay || (!isBgmPlaying && forcePlay !== false)) {
      bgmAudio.play().then(() => {
        isBgmPlaying = true;
        statusText.textContent = 'Tắt Nhạc';
        bgmBtn.querySelector('.bgm-icon').textContent = '🎵';
        localStorage.setItem('dangkygiaidau_bgm_enabled', 'true');
      }).catch(err => {
        console.warn("Autoplay block: waiting for user gesture.", err);
      });
    } else {
      bgmAudio.pause();
      isBgmPlaying = false;
      statusText.textContent = 'Bật Nhạc';
      bgmBtn.querySelector('.bgm-icon').textContent = '🎝';
      localStorage.setItem('dangkygiaidau_bgm_enabled', 'false');
    }
  }

  // === GOLD DUST PARTICLES ENGINE ===
  function initGoldParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const maxParticles = 65;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = -(Math.random() * 0.45 + 0.15);
        this.speedX = Math.sin(Math.random() * 10) * 0.15;
        this.opacity = Math.random() * 0.65 + 0.15;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.opacity -= this.fadeSpeed;
        
        if (this.opacity <= 0 || this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset(false);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = '#d4af37';
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.shadowBlur = 0;
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // === TABS CONTROL ===
  tabs.forEach(t => t.addEventListener('click', () => {
    WuxiaSound.playBell();
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    
    t.classList.add('active');
    const targetPanel = document.querySelector(`[data-panel="${t.dataset.tab}"]`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
    
    if (t.dataset.tab === 'list') {
      loadList();
    } else if (t.dataset.tab === 'simulator') {
      if (!cachedPlayers || !cachedPlayers.length) {
        loadList(true);
      }
    }
  }));

  // === HELPERS ===
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function setStatus(msg, type) {
    statusEl.innerHTML = msg;
    statusEl.className = 'status-msg' + (type ? ' ' + type : '');
  }

  function isConfigured() {
    return CONFIG && CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('REPLACE_WITH');
  }

  // === APPLY LOCK STATE TO UI ===
  // Khóa form đăng ký + khóa nút random + đổi nút admin sang "Mở lại"
  function applyLockState(locked) {
    cachedLocked = !!locked;

    const banner = document.getElementById('lock-banner');
    const form = document.getElementById('register-form');
    const submitBtn = document.getElementById('submit-btn');
    const fName = document.getElementById('f-name');
    const fId = document.getElementById('f-id');
    const fHe = document.getElementById('f-he');
    const fDiscord = document.getElementById('f-discord');
    const simBtn = document.getElementById('btn-sim-draft');
    const lockBtn = document.getElementById('btn-lock-registration');
    const lockBtnText = document.getElementById('btn-lock-text');
    const lockBtnIcon = lockBtn ? lockBtn.querySelector('.btn-secondary-icon') : null;

    if (locked) {
      // === KHÓA ĐĂNG KÝ ===
      if (banner) banner.style.display = 'flex';
      if (form) form.classList.add('form-locked');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content">🔒 Đã kết thúc ghi danh</span>`;
      }
      [fName, fId, fHe, fDiscord].forEach(el => { if (el) el.disabled = true; });

      // === KHÓA NÚT RANDOM ===
      if (simBtn) {
        simBtn.disabled = true;
        simBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content">🔒 Đã kết thúc bốc thăm</span>`;
      }

      // === ĐỔI NÚT ADMIN SANG "MỞ LẠI" ===
      if (lockBtn) {
        lockBtn.classList.add('is-unlocked-mode');
        if (lockBtnText) lockBtnText.textContent = 'Mở Lại Ghi Danh';
        if (lockBtnIcon) lockBtnIcon.textContent = '🔓';
      }
    } else {
      // === MỞ KHÓA ===
      if (banner) banner.style.display = 'none';
      if (form) form.classList.remove('form-locked');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content">Ghi Danh Ngay</span>`;
      }
      [fName, fId, fHe, fDiscord].forEach(el => { if (el) el.disabled = false; });

      if (simBtn) {
        simBtn.disabled = false;
        simBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content">☯ Khai Triển Trận Pháp</span>`;
      }

      if (lockBtn) {
        lockBtn.classList.remove('is-unlocked-mode');
        if (lockBtnText) lockBtnText.textContent = 'Kết Thúc Ghi Danh';
        if (lockBtnIcon) lockBtnIcon.textContent = '🔒';
      }
    }
  }

  // === SUBMIT REGISTRATION FORM ===
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Chặn submit nếu đã khóa
      if (cachedLocked) {
        WuxiaSound.playClash();
        setStatus('🔒 Đã kết thúc thời gian ghi danh.', 'error');
        return;
      }

      const name = document.getElementById('f-name').value.trim();
      const id = document.getElementById('f-id').value.trim();
      const he = document.getElementById('f-he').value;
      const discord = document.getElementById('f-discord').value.trim();

      if (!name || !id || !he || !discord) {
        WuxiaSound.playClash();
        setStatus('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'error');
        return;
      }

      if (!isConfigured()) {
        WuxiaSound.playClash();
        setStatus('✕ Chưa cấu hình Google Apps Script URL trong config.js', 'error');
        return;
      }

      submitBtn.disabled = true;
      WuxiaSound.playDrum();
      setStatus('<span class="spinner-mini"></span> Đang gửi ghi danh lên hệ thống...');

      try {
        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('name', name);
        formData.append('id', id);
        formData.append('he', he);
        formData.append('discord', discord);

        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.success) {
          WuxiaSound.playBell();
          setStatus('✓ Ghi danh thành công! Chúc anh hùng may mắn.', 'success');
          formEl.reset();
          loadList(true);
        } else {
          WuxiaSound.playClash();
          setStatus('✗ ' + (data.error || 'Có lỗi xảy ra khi ghi danh.'), 'error');
          // Nếu lỗi do đã khóa, refresh state để khóa UI
          if (data.error && data.error.indexOf('kết thúc') !== -1) {
            loadList(true);
          }
        }
      } catch (e) {
        WuxiaSound.playClash();
        setStatus('✗ Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng hoặc cấu hình.', 'error');
        console.error(e);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // === LOAD REGISTERED LIST ===
  async function loadList(silent) {
    const wrap = document.getElementById('table-wrap');
    const countEl = document.getElementById('reg-count');
    const tabCount = document.getElementById('tab-count');

    if (!isConfigured()) {
      wrap.innerHTML = '<div class="empty-list">✕ Chưa cấu hình Google Apps Script URL trong config.js</div>';
      return;
    }

    if (!silent) {
      wrap.innerHTML = `
        <div class="empty-list">
          <div class="spinner-custom"></div>
          <span>Đang triệu tập danh sách anh hùng võ lâm...</span>
        </div>`;
    }

    try {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=list');
      const data = await res.json();

      if (!data.success) {
        wrap.innerHTML = '<div class="empty-list">✗ Lỗi: ' + escapeHtml(data.error || 'Không thể tải được dữ liệu.') + '</div>';
        return;
      }

      const items = data.items || [];
      cachedPlayers = items;
      countEl.textContent = items.length;
      tabCount.textContent = items.length;

      // Áp dụng trạng thái khóa từ backend
      if (typeof data.locked !== 'undefined') {
        applyLockState(data.locked);
      }

      // Update faction analytics
      updateFactionAnalytics(items);

      if (!items.length) {
        wrap.innerHTML = '<div class="empty-list">Chưa có anh hùng nào ghi danh.<br>Hãy là người đầu tiên tham chiến!</div>';
        return;
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th>Tên anh hùng</th>
              <th>ID nhân vật</th>
              <th>Hệ phái</th>
              <th>ID Discord</th>
            </tr>
          </thead>
          <tbody>`;
          
      items.forEach((it, i) => {
        const cls = heClass[it.he] || 'he-thietY';
        html += `
          <tr style="animation-delay: ${i * 0.04}s;">
            <td class="col-num">${i + 1}</td>
            <td style="font-weight: 500; color: #f5ebe0;">${escapeHtml(it.name)}</td>
            <td style="font-family: monospace; font-size: 0.85rem; letter-spacing: 0.5px;">${escapeHtml(it.id)}</td>
            <td><span class="he-pill ${cls}">${escapeHtml(it.he)}</span></td>
            <td style="color: #a89f91; font-size: 0.85rem;">${escapeHtml(it.discord)}</td>
          </tr>`;
      });
      
      html += '</tbody></table>';
      wrap.innerHTML = html;
    } catch (e) {
      wrap.innerHTML = '<div class="empty-list">✗ Không thể kết nối tới cơ sở dữ liệu serverless.</div>';
      console.error(e);
    }
  }

  // === FACTION ANALYTICS COMPUTATION ===
  function updateFactionAnalytics(items) {
    const card = document.getElementById('analytics-card');
    const grid = document.getElementById('faction-bars-grid');
    if (!card || !grid) return;

    if (!items || !items.length) {
      card.style.display = 'none';
      return;
    }

    card.style.display = 'block';

    const counts = {};
    const factions = ['Tố vấn', 'Thiết y', 'Cửu linh', 'Long ngâm', 'Thần tương', 'Toái mộng', 'Huyết Hà'];
    factions.forEach(f => counts[f] = 0);

    items.forEach(it => {
      if (counts[it.he] !== undefined) {
        counts[it.he]++;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    const total = items.length;

    const factionFillColors = {
      'Tố vấn': '#ff69b4',
      'Thiết y': '#ffd700',
      'Cửu linh': '#ba55d3',
      'Long ngâm': '#2ecc71',
      'Thần tương': '#00bfff',
      'Toái mộng': '#1e90ff',
      'Huyết Hà': '#ff3333'
    };

    let html = '';
    factions.forEach(f => {
      const count = counts[f];
      const percentOfMax = (count / maxCount) * 100;
      const percentOfTotal = Math.round((count / total) * 100) || 0;
      const color = factionFillColors[f] || '#d4af37';
      
      html += `
        <div class="faction-bar-row">
          <div class="faction-bar-info">
            <span class="faction-bar-name">✦ ${f}</span>
            <span class="faction-bar-count">${count} Anh Hùng (${percentOfTotal}%)</span>
          </div>
          <div class="faction-bar-bg">
            <div class="faction-bar-fill" style="width: ${percentOfMax}%; background-color: ${color}; color: ${color};"></div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  // === SEARCH FILTER FUNCTIONALITY ===
  const searchInput = document.getElementById('search-heroes');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#table-wrap tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(q)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      WuxiaSound.playBell();
      loadList();
    });
  }

  // === MOUSE POSITION GLOW EFFECT ===
  function initCardGlow() {
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const attachGlowListeners = () => {
      const cards = document.querySelectorAll('.panel-card, .rules-card, .stat-box, .team-card-front, .team-member');
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.addEventListener('mousemove', handleMouseMove);
      });
    };

    attachGlowListeners();

    tabs.forEach(t => t.addEventListener('click', () => {
      setTimeout(attachGlowListeners, 50);
    }));
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        setTimeout(attachGlowListeners, 800);
      });
    }
  }

  // === INTERACTIVE TEAM DRAFT SIMULATOR ===
  function initDraftSimulator() {
    const simDraftBtn = document.getElementById('btn-sim-draft');
    const simResultWrap = document.getElementById('sim-result-wrap');
    const copyBtn = document.getElementById('btn-copy-teams');
    const exportBtn = document.getElementById('btn-export-png');
    const originalBtnContent = `<span class="btn-glow"></span><span class="btn-content">☯ Khai Triển Trận Pháp</span>`;

    // === LOCK SYSTEM: Khóa chức năng đến giờ mở khóa ===
    function isSimulatorLocked() {
      if (!CONFIG.SIMULATOR_LOCKED) return false;
      const unlockTime = new Date(CONFIG.SIMULATOR_UNLOCK_TIME).getTime();
      return Date.now() < unlockTime;
    }

    function formatCountdown(ms) {
      if (ms <= 0) return '';
      const totalSec = Math.floor(ms / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      const parts = [];
      if (days > 0) parts.push(days + ' ngày');
      if (hours > 0 || days > 0) parts.push(String(hours).padStart(2, '0') + 'h');
      parts.push(String(minutes).padStart(2, '0') + 'm');
      parts.push(String(seconds).padStart(2, '0') + 's');
      return parts.join(' ');
    }

    function formatUnlockDate(date) {
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const d = new Date(date);
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mi} ${dayName} ngày ${dd}/${mm}/${yyyy}`;
    }

    let lockInterval = null;

    function renderLockState() {
      const unlockTime = new Date(CONFIG.SIMULATOR_UNLOCK_TIME).getTime();
      const remaining = unlockTime - Date.now();

      if (remaining <= 0) {
        // Unlocked! Refresh state
        if (lockInterval) { clearInterval(lockInterval); lockInterval = null; }
        if (simDraftBtn) {
          simDraftBtn.disabled = false;
          simDraftBtn.innerHTML = originalBtnContent;
        }
        if (simResultWrap) {
          simResultWrap.innerHTML = `
            <div class="empty-list" style="padding: 3rem 1.5rem;">
              <span class="stat-icon" style="font-size: 2.5rem; margin-bottom: 10px;">☯</span>
              <span>Trận pháp đã mở! Hãy nhấn nút để bắt đầu khai triển!</span>
            </div>`;
        }
        return;
      }

      if (simDraftBtn) {
        simDraftBtn.disabled = true;
        simDraftBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content">🔒 Trận Pháp Đang Phong Ấn</span>`;
      }
      if (simResultWrap) {
        simResultWrap.innerHTML = `
          <div class="lock-screen" style="padding: 3rem 1.5rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem; color: #d4af37; text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);">🔒</div>
            <div style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; color: #f4d03f; letter-spacing: 2px; margin-bottom: 0.5rem;">PHONG ẤN CHƯA GIẢI</div>
            <div style="font-family: 'Lora', serif; font-size: 1rem; color: #e8c9a0; margin-bottom: 2rem; font-style: italic;">Trận pháp giả lập đang được phong ấn. Vui lòng chờ đến thời khắc mở khóa.</div>

            <div style="background: rgba(44, 24, 16, 0.6); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 12px; padding: 1.5rem; max-width: 480px; margin: 0 auto 1.5rem;">
              <div style="font-family: 'Lora', serif; font-size: 0.85rem; color: #b8956a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.5rem;">Thời khắc khai phong</div>
              <div style="font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 600; color: #f4d03f; margin-bottom: 1rem;">${formatUnlockDate(unlockTime)}</div>
              <div style="font-family: 'Lora', serif; font-size: 0.85rem; color: #b8956a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.5rem;">Còn lại</div>
              <div id="lock-countdown" style="font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: #d85a30; letter-spacing: 1px; text-shadow: 0 0 20px rgba(216, 90, 48, 0.3);">${formatCountdown(remaining)}</div>
            </div>

            <div style="font-family: 'Lora', serif; font-size: 0.9rem; color: #8b5a2b; font-style: italic;">⚜ Các anh hùng hãy tiếp tục ghi danh trong khi chờ đợi ⚜</div>
          </div>`;

        // Update countdown every second
        if (lockInterval) clearInterval(lockInterval);
        lockInterval = setInterval(() => {
          const newRemaining = unlockTime - Date.now();
          const el = document.getElementById('lock-countdown');
          if (newRemaining <= 0) {
            renderLockState(); // Will trigger unlock branch
          } else if (el) {
            el.textContent = formatCountdown(newRemaining);
          }
        }, 1000);
      }
    }

    // Apply lock state immediately on init
    if (isSimulatorLocked()) {
      renderLockState();
    }

    const wuxiaTeamNames = [
      'Long Hổ Môn', 'Nhất Mộng Đường', 'Rising Star Điện', 'Vô Song Các', 'Kiếm Vũ Bang',
      'Bắc Minh Thần Các', 'Huyền Vũ Điện', 'Bạch Hổ Đường', 'Thanh Long Hội', 'Chí Tôn Cung',
      'Thần Kiếm Sơn Trang', 'Phi Yến Môn', 'Côn Luân Các', 'Thiếu Lâm Pháp Điện', 'Võ Đang Kiếm Tông',
      'Đường Môn Ám Khí', 'Toái Mộng Các', 'Huyết Hà Tiền Tuyến', 'Tố Vấn Dược Viện', 'Cửu Linh Ma Quán'
    ];

    function shuffle(array) {
      let currentIndex = array.length, randomIndex;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }
      return array;
    }

    // State tracking for interactive bốc thăm
    let isCardFlipped = [];
    let isTeamRolling = [];
    let isTeamCompleted = [];
    let activeRollingTeamIndex = null;

    // Expose click handlers to global window object so inline event handlers work flawlessly
    window.flipCard = async function(tIndex) {
      if (activeRollingTeamIndex !== null) return; // Khóa nếu đang có đội quay gacha
      if (isCardFlipped[tIndex]) return; // Đã lật rồi
      
      isCardFlipped[tIndex] = true;
      const cardEl = document.getElementById(`team-card-${tIndex}`);
      if (!cardEl) return;
      
      // 1. Hiệu ứng lắc thẻ (vận chân khí)
      cardEl.classList.add('preparing-reveal');
      WuxiaSound.playWhoosh();
      
      await new Promise(resolve => setTimeout(resolve, 900));
      
      // 2. Lật thẻ 3D ra mặt trước
      cardEl.classList.remove('preparing-reveal');
      cardEl.classList.add('flipped');
      WuxiaSound.playDrum();
      WuxiaSound.playClash();
    };

    window.rollTeamMembers = async function(tIndex) {
      if (activeRollingTeamIndex !== null) return; // Chỉ quay gacha mỗi lần 1 đội
      if (isTeamRolling[tIndex] || isTeamCompleted[tIndex]) return;
      if (!isCardFlipped[tIndex]) return; // Chưa lật thẻ thì không cho quay
      
      isTeamRolling[tIndex] = true;
      activeRollingTeamIndex = tIndex;
      
      // Khóa tất cả các nút Triệu Tập khác và nút Trận Pháp chính
      document.querySelectorAll('.btn-roll-team').forEach(btn => btn.disabled = true);
      if (simDraftBtn) {
        simDraftBtn.disabled = true;
        simDraftBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content"><span class="spinner-mini"></span> Đang Triệu Tập...</span>`;
      }
      
      const rollBtn = document.getElementById(`btn-roll-team-${tIndex}`);
      if (rollBtn) {
        rollBtn.disabled = true;
        rollBtn.innerHTML = `<span class="spinner-mini"></span> Đang Quay...`;
      }
      
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
      // Quay gacha cho từng thành viên một
      for (let m = 0; m < 3; m++) {
        const slotEl = document.getElementById(`member-slot-${tIndex}-${m}`);
        if (slotEl) {
          slotEl.classList.remove('waiting');
          slotEl.classList.add('rolling');
          
          const realName = slotEl.getAttribute('data-real-name');
          const realId = slotEl.getAttribute('data-real-id');
          const realHe = slotEl.getAttribute('data-real-he');
          const realClass = slotEl.getAttribute('data-real-class');
          const realRevClass = slotEl.getAttribute('data-real-rev-class');
          
          // Nhịp độ quay chậm dần đều 22 bước cực kỳ mượt mà
          const steps = [
            50, 50, 50, 50, 52, 55, 60, 68, 78, 90, 105, 125, 150, 180, 215, 255, 305, 365, 435, 520, 620, 750
          ];
          
          for (let s = 0; s < steps.length; s++) {
            const tempPlayer = cachedPlayers[Math.floor(Math.random() * cachedPlayers.length)];
            
            slotEl.querySelector('.member-name').textContent = tempPlayer.name;
            slotEl.querySelector('.member-id').textContent = 'ID: ' + tempPlayer.id;
            const pillEl = slotEl.querySelector('.he-pill');
            pillEl.className = 'he-pill waiting-pill';
            pillEl.textContent = tempPlayer.he;
            
            WuxiaSound.playTick();
            await delay(steps[s]);
          }
          
          // Dừng và cập nhật thông tin thật, nổ hào quang môn phái
          slotEl.classList.remove('rolling');
          slotEl.classList.add('revealed', realRevClass);
          
          slotEl.querySelector('.member-name').textContent = realName;
          slotEl.querySelector('.member-id').textContent = 'ID: ' + realId;
          const pillEl = slotEl.querySelector('.he-pill');
          pillEl.className = `he-pill ${realClass}`;
          pillEl.textContent = realHe;
          
          WuxiaSound.playClash();
          WuxiaSound.playDrum();
          
          await delay(600);
        }
      }
      
      // Đội hình hoàn tất
      isTeamRolling[tIndex] = false;
      isTeamCompleted[tIndex] = true;
      activeRollingTeamIndex = null;
      
      const cardEl = document.getElementById(`team-card-${tIndex}`);
      if (cardEl) {
        cardEl.classList.add('team-completed');
        WuxiaSound.playBell();
      }
      
      // Ẩn vùng nút bấm thao tác cực kỳ mượt mà
      const actionsEl = document.getElementById(`team-actions-${tIndex}`);
      if (actionsEl) {
        actionsEl.style.opacity = '0';
        actionsEl.style.transform = 'scale(0.9) translateY(10px)';
        setTimeout(() => actionsEl.remove(), 500);
      }
      
      // Kiểm tra xem tất cả các đội đã quay hoàn thành chưa
      const allDone = isTeamCompleted.every(v => v === true);
      if (allDone) {
        // Tự động mở danh sách dự bị (bench)
        const benchEl = document.getElementById('bench-capture-area');
        if (benchEl) {
          benchEl.style.opacity = '1';
          benchEl.style.transform = 'scale(1) translateY(0)';
          benchEl.style.pointerEvents = 'auto';
          WuxiaSound.playBell();
          await delay(600);
        }
        
        // Mở khóa lại nút Trận Pháp chính
        if (simDraftBtn) {
          simDraftBtn.disabled = false;
          simDraftBtn.innerHTML = originalBtnContent;
        }
      } else {
        // Mở khóa lại nút Triệu Tập cho các đội đã lật nhưng chưa được quay
        isTeamCompleted.forEach((completed, idx) => {
          if (!completed && isCardFlipped[idx]) {
            const btn = document.getElementById(`btn-roll-team-${idx}`);
            if (btn) btn.disabled = false;
          }
        });
      }
    };

    // Function to render team cards from state (supports F5 reload)
    function renderSimResults(teams, bench, triggerFlipEffect) {
      if (!teams.length && !bench.length) {
        simResultWrap.innerHTML = `
          <div class="empty-list" style="padding: 3rem 1.5rem;">
            <span class="stat-icon" style="font-size: 2.5rem; margin-bottom: 10px;">☯</span>
            <span>Chưa khai triển trận pháp bốc thăm đội hình. Hãy nhấn nút để bắt đầu!</span>
          </div>`;
        copyBtn.style.display = 'none';
        exportBtn.style.display = 'none';
        return;
      }

      copyBtn.style.display = 'block';
      exportBtn.style.display = 'block';

      // Khởi tạo các mảng theo dõi trạng thái nếu đây là đợt bốc thăm mới hoàn toàn
      if (triggerFlipEffect) {
        isCardFlipped = Array(teams.length).fill(false);
        isTeamRolling = Array(teams.length).fill(false);
        isTeamCompleted = Array(teams.length).fill(false);
        activeRollingTeamIndex = null;
      }

      let html = '';
      if (teams.length > 0) {
        html += `<div class="teams-grid" id="teams-capture-area">`;
        
        teams.forEach((team, tIndex) => {
          const cardCls = triggerFlipEffect ? 'team-card' : 'team-card flipped team-completed';
          html += `
            <div class="${cardCls}" id="team-card-${tIndex}">
              <div class="team-card-inner">
                <!-- Card Back Face -->
                <div class="team-card-back" onclick="window.flipCard(${tIndex})">
                  <div class="card-back-pattern">☯</div>
                  <div class="card-back-text">TRẬN ĐỒ ${tIndex + 1}</div>
                </div>
                <!-- Card Front Face -->
                <div class="team-card-front">
                  <div class="team-header">
                    <span class="team-title">⚔ ${escapeHtml(team.name)}</span>
                    <span class="team-index-badge">Đội ${tIndex + 1}</span>
                  </div>
                  <div class="team-members">`;
                  
          team.members.forEach((member, mIndex) => {
            const cls = heClass[member.he] || 'he-thietY';
            const heClassRev = cls + '-rev';
            if (triggerFlipEffect) {
              html += `
                <div class="team-member waiting" id="member-slot-${tIndex}-${mIndex}" 
                  data-real-name="${escapeHtml(member.name)}" 
                  data-real-id="${escapeHtml(member.id)}" 
                  data-real-he="${escapeHtml(member.he)}" 
                  data-real-class="${cls}"
                  data-real-rev-class="${heClassRev}">
                  <div class="member-info">
                    <span class="member-name">☯ Triệu tập...</span>
                    <span class="member-id">ID: -----</span>
                  </div>
                  <span class="he-pill waiting-pill" style="font-size: 0.65rem; padding: 2px 6px; background: rgba(212,175,55,0.05); color: var(--text-muted); border-color: rgba(212,175,55,0.1);">☱ Chờ</span>
                </div>`;
            } else {
              html += `
                <div class="team-member revealed ${heClassRev}" id="member-slot-${tIndex}-${mIndex}">
                  <div class="member-info">
                    <span class="member-name">${escapeHtml(member.name)}</span>
                    <span class="member-id">ID: ${escapeHtml(member.id)}</span>
                  </div>
                  <span class="he-pill ${cls}" style="font-size: 0.65rem; padding: 2px 6px;">${escapeHtml(member.he)}</span>
                </div>`;
            }
          });
          
          html += `
                  </div>`;
          
          // Chỉ hiển thị nút Triệu Tập Hào Kiệt ở chế độ lật động mới
          if (triggerFlipEffect) {
            html += `
                  <div class="team-actions" id="team-actions-${tIndex}">
                    <button class="btn-roll-team" id="btn-roll-team-${tIndex}" onclick="window.rollTeamMembers(${tIndex})"><span class="btn-roll-icon">☯</span>Triệu Tập Hào Kiệt</button>
                  </div>`;
          }

          html += `
                </div>
              </div>
            </div>`;
        });
        
        html += `</div>`;
      } else {
        html += `
          <div class="empty-list" style="padding: 2.5rem 1rem;">
            <span class="stat-icon" style="font-size: 2.2rem; color: #ff7878;">☩</span>
            <span>Môn phái trị liệu Tố Vấn chiếm đa số vượt trội, không đủ các hệ phái chiến đấu để lập đội 3 người hợp lệ!</span>
          </div>`;
      }

      // Bench rendering
      if (bench.length > 0) {
        const benchStyle = triggerFlipEffect 
          ? 'margin-top: 2rem; opacity: 0; transform: scale(0.96) translateY(15px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); animation: none; pointer-events: none;'
          : 'margin-top: 2rem;';
        html += `
          <div class="bench-container" id="bench-capture-area" style="${benchStyle}">
            <h3 class="bench-title">⛨ DANH SÁCH ANH HÙNG DỰ BỊ (${bench.length})</h3>
            <div class="bench-members">`;
            
        bench.forEach(member => {
          const cls = heClass[member.he] || 'he-thietY';
          html += `
            <div class="bench-member">
              <span style="font-weight: 500; font-size: 0.85rem; color: #f5ebe0;">${escapeHtml(member.name)}</span>
              <span class="he-pill ${cls}" style="font-size: 0.65rem; padding: 1px 6px;">${escapeHtml(member.he)}</span>
            </div>`;
        });
        
        html += `
            </div>
          </div>`;
      }

      simResultWrap.innerHTML = html;

      // Re-trigger Card Glow for dynamic components
      setTimeout(initCardGlow, 50);

      // Nếu là chạy mới hoàn toàn: giữ nguyên trạng thái khóa nút chính Trận Pháp để đợi lật/quay xong
      if (triggerFlipEffect && teams.length > 0) {
        if (simDraftBtn) {
          simDraftBtn.disabled = true;
          simDraftBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content"><span class="spinner-mini"></span> Khai Triển Trận Pháp</span>`;
        }
      } else {
        // Nếu tải từ lịch sử: Lật mở tất cả thẻ ngay lập tức
        document.querySelectorAll('.team-card').forEach(card => {
          card.classList.add('flipped', 'team-completed');
        });
      }
    }

    // === Lưu kết quả random teams lên Google Sheets ===
    async function saveTeamsToSheet(teams, bench) {
      try {
        const formData = new FormData();
        formData.append('action', 'save_teams');
        formData.append('teams', JSON.stringify(teams));
        formData.append('bench', JSON.stringify(bench || []));

        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (data.success) {
          showSheetSaveToast(`✓ Đã lưu kết quả Lượt #${data.sessionNum} lên Google Sheets`, 'success');
          console.log('Saved to sheet:', data);
        } else {
          showSheetSaveToast('⚠ Không lưu được lên Sheets: ' + (data.error || 'Lỗi không xác định'), 'error');
          console.error('Save error:', data.error);
        }
      } catch (e) {
        showSheetSaveToast('⚠ Lỗi kết nối khi lưu lên Sheets', 'error');
        console.error('Save exception:', e);
      }
    }

    function showSheetSaveToast(msg, type) {
      // Remove existing toast
      const existing = document.getElementById('sheet-save-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'sheet-save-toast';
      const bgColor = type === 'success' ? 'rgba(151, 196, 89, 0.15)' : 'rgba(240, 149, 149, 0.15)';
      const borderColor = type === 'success' ? '#97C459' : '#F09595';
      const textColor = type === 'success' ? '#97C459' : '#F09595';

      toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: rgba(26, 15, 10, 0.95); backdrop-filter: blur(10px);
        border: 1px solid ${borderColor}; border-left: 4px solid ${borderColor};
        color: ${textColor}; padding: 14px 20px; border-radius: 10px;
        font-family: 'Lora', serif; font-size: 14px; font-weight: 500;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 99999; max-width: 380px;
        animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      toast.textContent = msg;
      document.body.appendChild(toast);

      // Add animation keyframes if not present
      if (!document.getElementById('toast-anim-style')) {
        const style = document.createElement('style');
        style.id = 'toast-anim-style';
        style.textContent = `
          @keyframes toastSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes toastSlideOut { to { opacity: 0; transform: translateY(20px); } }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    }

    // Click trigger for Drafting
    if (simDraftBtn && simResultWrap) {
      simDraftBtn.addEventListener('click', () => {
        // Chặn nếu đã kết thúc ghi danh + bốc thăm
        if (cachedLocked) {
          return;
        }

        // Lock guard - prevent execution if still locked
        if (isSimulatorLocked()) {
          renderLockState();
          return;
        }

        WuxiaSound.playDrum();

        if (!cachedPlayers || !cachedPlayers.length) {
          simResultWrap.innerHTML = `
            <div class="empty-list" style="padding: 2.5rem 1rem;">
              <span class="stat-icon" style="font-size: 2.2rem; color: #ff7878;">☩</span>
              <span>Không tìm thấy danh sách anh hùng. Vui lòng tải bảng danh sách Phong Thần trước!</span>
            </div>`;
          copyBtn.style.display = 'none';
          exportBtn.style.display = 'none';
          return;
        }

        if (cachedPlayers.length < 3) {
          simResultWrap.innerHTML = `
            <div class="empty-list" style="padding: 2.5rem 1rem;">
              <span class="stat-icon" style="font-size: 2.2rem; color: #ff7878;">☩</span>
              <span>Số lượng anh hùng hiện có (${cachedPlayers.length}) quá ít. Cần tối thiểu 3 người để ghép trận pháp!</span>
            </div>`;
          copyBtn.style.display = 'none';
          exportBtn.style.display = 'none';
          return;
        }

        simDraftBtn.disabled = true;
        simDraftBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-content"><span class="spinner-mini"></span> Đang Vận Trận...</span>`;

        // Shuffling sound playing periodically
        const whooshInterval = setInterval(() => {
          WuxiaSound.playWhoosh();
        }, 400);

        // Rendering epic loading screen
        simResultWrap.innerHTML = `
          <div class="sim-loading-wrap">
            <div class="bagua-spinner">☯</div>
            <div class="sim-loading-title">DỊCH CHUYỂN CÀN KHÔN</div>
            <div class="sim-loading-sub">Trận pháp càn khôn đang xoay chuyển, ghép tổ đội ngẫu nhiên...</div>
            <div class="shuffling-names-container">
              <div class="shuffling-slot" id="slot-1">
                <span class="shuffling-slot-name">Đang triệu tập...</span>
                <span class="he-pill he-thietY shuffling-slot-he">Hệ phái</span>
              </div>
              <div class="shuffling-slot" id="slot-2">
                <span class="shuffling-slot-name">Đang triệu tập...</span>
                <span class="he-pill he-thietY shuffling-slot-he">Hệ phái</span>
              </div>
              <div class="shuffling-slot" id="slot-3">
                <span class="shuffling-slot-name">Đang triệu tập...</span>
                <span class="he-pill he-thietY shuffling-slot-he">Hệ phái</span>
              </div>
            </div>
          </div>
        `;

        const slot1 = document.getElementById('slot-1');
        const slot2 = document.getElementById('slot-2');
        const slot3 = document.getElementById('slot-3');

        const shuffleInterval = setInterval(() => {
          if (!cachedPlayers || cachedPlayers.length < 3) return;

          const randPlayers = [];
          const indices = new Set();
          while (indices.size < Math.min(3, cachedPlayers.length)) {
            indices.add(Math.floor(Math.random() * cachedPlayers.length));
          }

          indices.forEach(idx => randPlayers.push(cachedPlayers[idx]));

          if (randPlayers[0]) {
            const cls = heClass[randPlayers[0].he] || 'he-thietY';
            slot1.innerHTML = `
              <span class="shuffling-slot-name">${escapeHtml(randPlayers[0].name)}</span>
              <span class="he-pill ${cls} shuffling-slot-he">${escapeHtml(randPlayers[0].he)}</span>
            `;
          }
          if (randPlayers[1]) {
            const cls = heClass[randPlayers[1].he] || 'he-thietY';
            slot2.innerHTML = `
              <span class="shuffling-slot-name">${escapeHtml(randPlayers[1].name)}</span>
              <span class="he-pill ${cls} shuffling-slot-he">${escapeHtml(randPlayers[1].he)}</span>
            `;
          }
          if (randPlayers[2]) {
            const cls = heClass[randPlayers[2].he] || 'he-thietY';
            slot3.innerHTML = `
              <span class="shuffling-slot-name">${escapeHtml(randPlayers[2].name)}</span>
              <span class="he-pill ${cls} shuffling-slot-he">${escapeHtml(randPlayers[2].he)}</span>
            `;
          }
        }, 70);

        setTimeout(() => {
          clearInterval(shuffleInterval);
          clearInterval(whooshInterval);

          // Finalize balanced teams algorithm
          // === PRIORITY RULE ===
          // Người đăng ký SỚM = ưu tiên cao (vào team trước)
          // Người đăng ký MUỘN = ưu tiên thấp (bị đẩy xuống bench nếu thiếu chỗ)
          // Trong cùng nhóm ưu tiên: shuffle ngẫu nhiên để vẫn có yếu tố random
          const allPlayers = JSON.parse(JSON.stringify(cachedPlayers));

          // Sort by registration time ASC (sớm nhất lên đầu)
          // Nếu không có ts, giữ thứ tự gốc (stable sort)
          allPlayers.sort((a, b) => {
            const ta = a.ts ? new Date(a.ts).getTime() : 0;
            const tb = b.ts ? new Date(b.ts).getTime() : 0;
            return ta - tb;
          });

          // Tính số team có thể thành lập
          const totalTeamsCount = Math.floor(allPlayers.length / 3);
          const playersNeeded = totalTeamsCount * 3;

          // Tách: người được vào team (ưu tiên cao) vs người bị đẩy xuống bench (đăng ký muộn nhất)
          const eligiblePlayers = allPlayers.slice(0, playersNeeded);
          const lateBench = allPlayers.slice(playersNeeded); // Người đăng ký muộn → tự động vào bench

          // Trong nhóm eligible: tách theo hệ phái, shuffle để random hóa việc ghép đội
          const toVanPlayers = eligiblePlayers.filter(p => p.he === 'Tố vấn');
          const otherPlayers = eligiblePlayers.filter(p => p.he !== 'Tố vấn');

          shuffle(toVanPlayers);
          shuffle(otherPlayers);

          const rawTeams = Array.from({ length: totalTeamsCount }, () => []);
          const bench = [...lateBench]; // Khởi tạo bench với người đăng ký muộn

          // Mỗi team được phép tối đa 1 Tố vấn
          for (let i = 0; i < totalTeamsCount; i++) {
            if (toVanPlayers.length > 0) {
              rawTeams[i].push(toVanPlayers.pop());
            }
          }

          // Tố vấn dư (nếu có) → vào bench
          while (toVanPlayers.length > 0) {
            bench.push(toVanPlayers.pop());
          }

          // Lấp đầy còn lại bằng hệ phái khác
          for (let i = 0; i < totalTeamsCount; i++) {
            while (rawTeams[i].length < 3 && otherPlayers.length > 0) {
              rawTeams[i].push(otherPlayers.pop());
            }
          }

          while (otherPlayers.length > 0) {
            bench.push(otherPlayers.pop());
          }

          const completeTeams = [];
          const shuffledNames = shuffle([...wuxiaTeamNames]);
          
          rawTeams.forEach((t, tIndex) => {
            if (t.length === 3) {
              completeTeams.push({
                name: shuffledNames[tIndex % shuffledNames.length] || `Chiến Đội ${tIndex + 1}`,
                members: t
              });
            } else {
              t.forEach(p => bench.push(p));
            }
          });

          // Save Results locally
          const simResultData = { teams: completeTeams, bench: bench };
          localStorage.setItem('dangkygiaidau_sim_results', JSON.stringify(simResultData));

          // Play massive crash gong sound to start rendering
          WuxiaSound.playDrum();

          // Render with 3D Flip
          renderSimResults(completeTeams, bench, true);

          // === Lưu kết quả lên Google Sheets ===
          if (completeTeams.length > 0 && isConfigured()) {
            saveTeamsToSheet(completeTeams, bench);
          }

          if (completeTeams.length === 0) {
            simDraftBtn.disabled = false;
            simDraftBtn.innerHTML = originalBtnContent;
          }
        }, 2000);
      });
    }

    // BTC Copy Utility
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        WuxiaSound.playBell();
        const simData = JSON.parse(localStorage.getItem('dangkygiaidau_sim_results'));
        if (!simData || !simData.teams) return;

        let text = `☯ TIÊN PHONG TRẬN ĐỒ - THỜI KHẮC DỰNG BẰNG ☯\n`;
        text += `==============================================\n\n`;
        
        simData.teams.forEach((team, i) => {
          text += `⚔ CHIẾN ĐỘI ${i + 1}: ${team.name}\n`;
          team.members.forEach((m, idx) => {
            text += `  - Hào kiệt ${idx + 1}: ${m.name} (ID: ${m.id}) - [${m.he}]\n`;
          });
          text += `\n`;
        });
        
        if (simData.bench && simData.bench.length) {
          text += `⛨ ANH HÙNG DỰ BỊ BÊN THỀM:\n`;
          simData.bench.forEach(m => {
            text += `  - ${m.name} - [${m.he}]\n`;
          });
          text += `\n`;
        }
        
        text += `Giải đấu đồng hành cùng bang Nhất Mộng & Rising Star!\n`;

        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✓ Đã Sao Chép Trận Pháp!';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.error("Lỗi sao chép: ", err);
          alert("Lỗi sao chép trận pháp!");
        });
      });
    }

    // BTC html2canvas PNG export Utility
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        WuxiaSound.playBell();
        
        const captureArea = document.getElementById('sim-result-wrap');
        if (!captureArea) return;
 
        exportBtn.disabled = true;
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '📸 Đang Chụp...';
 
        // Add capturing class to flatten 3D card layout and ensure html2canvas reads it correctly
        captureArea.classList.add('capturing');
 
        // Wait a short time for browser layout reflow/repaint to apply capturing styles
        setTimeout(() => {
          html2canvas(captureArea, {
            backgroundColor: '#0b0705',
            scale: 2, // Double DPI for stunning sharp details
            useCORS: true,
            logging: false
          }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'Tran-Phap-Gia-Lap.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }).catch(err => {
            console.error("Lỗi xuất ảnh: ", err);
            alert("Không thể chụp ảnh trận pháp. Vui lòng thử lại!");
          }).finally(() => {
            // Remove capturing class to restore premium 3D layout & animations
            captureArea.classList.remove('capturing');
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalText;
          });
        }, 50);
      });
    }

    // Load saved historical results immediately on page launch
    const savedResults = localStorage.getItem('dangkygiaidau_sim_results');
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        if (parsed && (parsed.teams || parsed.bench)) {
          renderSimResults(parsed.teams || [], parsed.bench || [], false);
        }
      } catch (err) {
        console.error("History parse fail: ", err);
      }
    }
  }

  // ============================================================
  // === ADMIN LOCK/UNLOCK REGISTRATION ===
  // ============================================================
  function initAdminLock() {
    const lockBtn = document.getElementById('btn-lock-registration');
    const modal = document.getElementById('admin-modal-backdrop');
    const modalTitle = document.getElementById('admin-modal-title');
    const modalDesc = document.getElementById('admin-modal-desc');
    const modalInput = document.getElementById('admin-code-input');
    const modalMsg = document.getElementById('admin-modal-msg');
    const modalCancel = document.getElementById('admin-modal-cancel');
    const modalConfirm = document.getElementById('admin-modal-confirm');

    if (!lockBtn || !modal) return;

    let pendingAction = null; // 'lock' hoặc 'unlock'

    function openModal(action) {
      pendingAction = action;
      modalInput.value = '';
      modalMsg.textContent = '';
      if (action === 'lock') {
        modalTitle.textContent = '🔒 Xác nhận kết thúc ghi danh';
        modalDesc.textContent = 'Sau khi khóa, không ai có thể đăng ký thêm và nút bốc thăm sẽ bị vô hiệu hóa. Nhập code quản trị để xác nhận:';
        modalConfirm.textContent = 'Khóa Ghi Danh';
      } else {
        modalTitle.textContent = '🔓 Mở lại ghi danh';
        modalDesc.textContent = 'Mở lại cổng đăng ký để người chơi tiếp tục ghi danh. Nhập code quản trị để xác nhận:';
        modalConfirm.textContent = 'Mở Lại';
      }
      modal.classList.add('show');
      setTimeout(() => modalInput.focus(), 80);
    }

    function closeModal() {
      modal.classList.remove('show');
      pendingAction = null;
    }

    async function submitCode() {
      const code = modalInput.value.trim();
      if (!code) {
        modalMsg.textContent = 'Vui lòng nhập code admin';
        return;
      }
      if (!isConfigured()) {
        modalMsg.textContent = 'Chưa cấu hình Apps Script URL';
        return;
      }

      modalConfirm.disabled = true;
      modalMsg.style.color = '#d4b896';
      modalMsg.textContent = 'Đang xử lý...';

      try {
        const formData = new FormData();
        formData.append('action', pendingAction === 'lock' ? 'lock_registration' : 'unlock_registration');
        formData.append('code', code);

        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          WuxiaSound.playBell();
          applyLockState(data.locked);
          modalMsg.style.color = '#7fdb7f';
          modalMsg.textContent = data.locked
            ? '✓ Đã khóa ghi danh thành công'
            : '✓ Đã mở lại ghi danh';
          // Reload list để cập nhật mọi nơi
          loadList(true);
          setTimeout(closeModal, 900);
        } else {
          WuxiaSound.playClash();
          modalMsg.style.color = '#ff6b6b';
          modalMsg.textContent = '✗ ' + (data.error || 'Lỗi không xác định');
        }
      } catch (err) {
        modalMsg.style.color = '#ff6b6b';
        modalMsg.textContent = '✗ Lỗi kết nối: ' + err.message;
        console.error('Admin lock error:', err);
      } finally {
        modalConfirm.disabled = false;
      }
    }

    // Click nút khóa/mở khóa → mở modal
    lockBtn.addEventListener('click', () => {
      openModal(cachedLocked ? 'unlock' : 'lock');
    });

    // Modal events
    modalCancel.addEventListener('click', closeModal);
    modalConfirm.addEventListener('click', submitCode);
    modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitCode();
      if (e.key === 'Escape') closeModal();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // === ON LAUNCH INIT ===
  initCardGlow();
  initGoldParticles();
  initBGM();
  initDraftSimulator();
  initAdminLock();

  if (isConfigured()) {
    loadList(true);
  }
})();

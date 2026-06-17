/* ══════════════════════════════
   RUNAWAY BUTTON
══════════════════════════════ */
let missCount = 0;
let caught = false;

const btn     = document.getElementById('runaway-btn');
const missMsg = document.getElementById('miss-msg');

const taunts = [
  "hehe, too slow! 😜",
  "nope, not yet! 😂",
  "almost... 👀",
  "so close!! 🏃",
  "one more try... 🙈",
];

window.addEventListener('load', () => {
  btn.style.left = ((window.innerWidth  - btn.offsetWidth)  / 2) + 'px';
  btn.style.top  = (window.innerHeight * 0.72) + 'px';
});

function randomPos() {
  const margin = 24;
  const bw = btn.offsetWidth  || 130;
  const bh = btn.offsetHeight || 48;
  const curX = parseFloat(btn.style.left) || 0;
  const curY = parseFloat(btn.style.top)  || 0;
  let x, y, tries = 0;
  do {
    x = margin + Math.random() * (window.innerWidth  - bw - margin * 2);
    y = margin + Math.random() * (window.innerHeight - bh - margin * 2);
    tries++;
  } while (tries < 20 && Math.abs(x - curX) < 150 && Math.abs(y - curY) < 100);
  btn.style.transition = 'left 0.2s ease, top 0.2s ease';
  btn.style.left = x + 'px';
  btn.style.top  = y + 'px';
}

function handleClick() {
  if (caught) return;
  missCount++;
  if (missCount >= 5) {
    caught = true;
    btn.style.display = 'none';
    missMsg.style.display = 'none';
    document.getElementById('caught-screen').classList.remove('hidden');
    document.querySelector('.intro-content').style.display = 'none';
    return;
  }
  missMsg.textContent = taunts[Math.min(missCount - 1, taunts.length - 1)];
  randomPos();
}

/* ══════════════════════════════
   SHOW LOVE PAGE
══════════════════════════════ */
function showLovePage() {
  document.getElementById('intro-screen').classList.add('hidden');
  const lp = document.getElementById('love-screen');
  lp.classList.remove('hidden');
  lp.classList.add('active');

  launchSparkles();
  startMusic();
  startCounter();
  initSlideshow();
  initFadeOnScroll();
  setTimeout(triggerFades, 100);
}

/* ══════════════════════════════
   SPARKLES
══════════════════════════════ */
function launchSparkles() {
  const canvas = document.getElementById('sparkle-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.style.display = 'block';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const symbols = ['✦','✧','★','♥','✿','·','❋','✸'];
  const colors  = ['#d4537e','#f4c0d1','#ed93b1','#ffb3c6','#ff85a1','#ffc8dd','#ffffff','#ffcef3'];
  const particles = [];

  for (let i = 0; i < 130; i++) {
    particles.push({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height * 0.6,
      vx:      (Math.random() - 0.5) * 5,
      vy:      Math.random() * -6 - 1,
      alpha:   1,
      size:    Math.random() * 18 + 8,
      symbol:  symbols[Math.floor(Math.random() * symbols.length)],
      color:   colors[Math.floor(Math.random() * colors.length)],
      spin:    (Math.random() - 0.5) * 0.2,
      angle:   Math.random() * Math.PI * 2,
      gravity: Math.random() * 0.15 + 0.05,
      delay:   Math.floor(Math.random() * 30),
    });
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allDone = true;
    particles.forEach(p => {
      if (frame < p.delay) { allDone = false; return; }
      p.vy += p.gravity; p.x += p.vx; p.y += p.vy;
      p.angle += p.spin; p.alpha -= 0.012;
      if (p.alpha > 0) {
        allDone = false;
        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.font = `${p.size}px serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }
    });
    frame++;
    if (!allDone) requestAnimationFrame(draw);
    else {
      canvas.style.display = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(draw);
}

/* ══════════════════════════════
   COUNTER — counts DOWN to date,
   then UP once date has passed
══════════════════════════════ */




function startCounter() {
  updateCounter();
  setInterval(updateCounter, 1000); // update every second
}

function updateCounter() {
  const now  = new Date();
  const diff = TARGET_DATE - now;

  const dayLabel  = document.getElementById('counter-label-days');
  const hourLabel = document.getElementById('counter-label-hours');
  const minLabel  = document.getElementById('counter-label-mins');

  if (diff > 0) {
    // ── COUNTING DOWN ──
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000)  % 24;
    const mins  = Math.floor(diff / 60000)    % 60;
    const secs  = Math.floor(diff / 1000)     % 60;

    document.getElementById('days-count').textContent  = days;
    document.getElementById('hours-count').textContent = String(hours).padStart(2,'0');
    document.getElementById('mins-count').textContent  = String(mins).padStart(2,'0');

    if (dayLabel)  dayLabel.textContent  = days === 1  ? 'Day Left'   : 'Days Left';
    if (hourLabel) hourLabel.textContent = 'Hours Left';
    if (minLabel)  minLabel.textContent  = 'Mins Left';

  } else {
    // ── COUNTING UP (date has passed) ──
    const elapsed = now - TARGET_DATE;
    const days  = Math.floor(elapsed / 86400000);
    const hours = Math.floor(elapsed / 3600000)  % 24;
    const mins  = Math.floor(elapsed / 60000)    % 60;

    document.getElementById('days-count').textContent  = days;
    document.getElementById('hours-count').textContent = String(hours).padStart(2,'0');
    document.getElementById('mins-count').textContent  = String(mins).padStart(2,'0');

    if (dayLabel)  dayLabel.textContent  = days === 1  ? 'Day Together'   : 'Days Together';
    if (hourLabel) hourLabel.textContent = 'Hours';
    if (minLabel)  minLabel.textContent  = 'Minutes';
  }
}

/* ══════════════════════════════
   SLIDESHOW
══════════════════════════════ */
let currentSlide = 0;

function initSlideshow() {
  const track  = document.getElementById('slideshow-track');
  const slides = track.querySelectorAll('.slide');
  const dotsEl = document.getElementById('slide-dots');

  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.onclick   = () => goToSlide(i);
    dotsEl.appendChild(dot);
  });

  setInterval(() => changeSlide(1), 3000);
}

function changeSlide(dir) {
  const track = document.getElementById('slideshow-track');
  const total = track.querySelectorAll('.slide').length;
  currentSlide = (currentSlide + dir + total) % total;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  updateDots();
}

function goToSlide(i) {
  const track = document.getElementById('slideshow-track');
  currentSlide = i;
  track.style.transform = `translateX(-${i * 100}%)`;
  updateDots();
}

function updateDots() {
  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === currentSlide)
  );
}

/* ══════════════════════════════
   FADE IN ON SCROLL
══════════════════════════════ */
function initFadeOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));
}

function triggerFades() {
  document.querySelectorAll('.fade-section').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
}

/* ══════════════════════════════
   MUSIC
══════════════════════════════ */
let musicStarted = false;

function startMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-btn');
  if (!audio) return;

  // Fade in from volume 0
  audio.volume = 0;
  audio.play().then(() => {
    musicStarted = true;
    if (btn) btn.style.display = 'flex';
    // gradually raise volume
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.6);
      audio.volume = vol;
      if (vol >= 0.6) clearInterval(fade);
    }, 150);
  }).catch(() => {
    // autoplay blocked — show button so she can start manually
    if (btn) btn.style.display = 'flex';
  });
}

function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-btn');
  const icon  = document.getElementById('music-icon');
  if (!audio) return;

  if (audio.paused) {
    audio.play();
    if (icon) icon.textContent = '♪';
    if (btn)  btn.classList.remove('paused');
  } else {
    audio.pause();
    if (icon) icon.textContent = '♩';
    if (btn)  btn.classList.add('paused');
  }
}

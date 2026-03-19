/* ═══════════════════════════════════════════════════════
   RESUME JUDGE AI — script.js
   Handles: navbar, drag-drop, upload, API, loading, results
   ═══════════════════════════════════════════════════════ */

'use strict';

const API_URL = 'http://127.0.0.1:5000';

/* ──────────────────────────────────────
   DOM References
────────────────────────────────────── */
const navbar        = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu    = document.getElementById('mobileMenu');

const dropZone        = document.getElementById('dropZone');
const fileInput       = document.getElementById('fileInput');
const dropIdle        = document.getElementById('dropIdle');
const dropDrag        = document.getElementById('dropDrag');
const dropSelected    = document.getElementById('dropSelected');
const selectedFileName = document.getElementById('selectedFileName');
const selectedFileSize = document.getElementById('selectedFileSize');
const clearFileBtn    = document.getElementById('clearFile');

const analyzeBtn    = document.getElementById('analyzeBtn');
const loadingState  = document.getElementById('loadingState');
const resultState   = document.getElementById('resultState');
const uploadCard    = document.querySelector('.rj-upload-card');

const loadingBar      = document.getElementById('loadingBar');
const loadingHeadline = document.getElementById('loadingHeadline');
const loadingStep     = document.getElementById('loadingStep');
const loadingPct      = document.getElementById('loadingPct');

const gradeCircle  = document.getElementById('gradeCircle');
const scoreArc     = document.getElementById('scoreArc');
const scoreNumber  = document.getElementById('scoreNumber');
const scoreLabel   = document.getElementById('scoreLabel');
const scoreSubtitle = document.getElementById('scoreSubtitle');
const categoryBars = document.getElementById('categoryBars');
const skillTags    = document.getElementById('skillTags');
const feedbackItems = document.getElementById('feedbackItems');

/* ──────────────────────────────────────
   State
────────────────────────────────────── */
let selectedFile = null;
let loadingTimer = null;

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
window.addEventListener('scroll', () => {
  if (window.scrollY > 24) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

mobileMenuBtn.addEventListener('click', () => {
  const isOpen = !mobileMenu.classList.contains('rj-mobile-menu--closed');
  mobileMenu.classList.toggle('rj-mobile-menu--closed', isOpen);
  mobileMenuBtn.querySelector('i').className = isOpen
    ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('rj-mobile-menu--closed');
    mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
  });
});

/* ══════════════════════════════════════
   SCROLL ANIMATIONS (Intersection Observer)
══════════════════════════════════════ */
const rjObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    setTimeout(() => el.classList.add('rj-visible'), delay);
    rjObserver.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-rj-animate], .rj-feat-card, .rj-step, .rj-upload-card').forEach(el => {
  rjObserver.observe(el);
});

/* ══════════════════════════════════════
   DRAG & DROP
══════════════════════════════════════ */
let dragCounter = 0;

dropZone.addEventListener('dragenter', e => {
  e.preventDefault(); dragCounter++;
  showDropState('drag');
});
dropZone.addEventListener('dragleave', e => {
  e.preventDefault(); dragCounter--;
  if (dragCounter <= 0) { dragCounter = 0; showDropState(selectedFile ? 'selected' : 'idle'); }
});
dropZone.addEventListener('dragover', e => { e.preventDefault(); });
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dragCounter = 0;
  const file = e.dataTransfer.files?.[0];
  if (file) selectFile(file);
  else showDropState(selectedFile ? 'selected' : 'idle');
});

// Click browse
dropZone.addEventListener('click', e => {
  if (e.target === clearFileBtn || clearFileBtn.contains(e.target)) return;
  if (e.target.closest('label')) return;
  fileInput.click();
});
dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

fileInput.addEventListener('change', () => {
  if (fileInput.files?.[0]) selectFile(fileInput.files[0]);
});

clearFileBtn.addEventListener('click', e => {
  e.stopPropagation();
  clearSelection();
});

function showDropState(state) {
  dropIdle.classList.toggle('rj-hidden', state !== 'idle');
  dropDrag.classList.toggle('rj-hidden', state !== 'drag');
  dropSelected.classList.toggle('rj-hidden', state !== 'selected');
  dropZone.classList.toggle('drag-over', state === 'drag');
}

function selectFile(file) {
  const validTypes = ['application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
    showToast('Please upload a PDF or DOCX file.', 'error'); return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('File must be under 10 MB.', 'error'); return;
  }
  selectedFile = file;
  selectedFileName.textContent = file.name;
  selectedFileSize.textContent = formatBytes(file.size);
  showDropState('selected');
  analyzeBtn.disabled = false;
  analyzeBtn.style.animation = 'none';
  void analyzeBtn.offsetWidth;
  analyzeBtn.style.animation = '';
}

function clearSelection() {
  selectedFile = null;
  fileInput.value = '';
  showDropState('idle');
  analyzeBtn.disabled = true;
}

/* ══════════════════════════════════════
   ANALYZE — Main handler
══════════════════════════════════════ */
analyzeBtn.addEventListener('click', startAnalysis);

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && selectedFile && !analyzeBtn.disabled) startAnalysis();
});

async function startAnalysis() {
  if (!selectedFile) return;

  // Hide upload card, show loading
  uploadCard.style.opacity = '0.5';
  uploadCard.style.pointerEvents = 'none';
  show(loadingState);
  hide(resultState);
  loadingState.scrollIntoView({ behavior: 'smooth', block: 'center' });

  runLoadingAnimation();

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    clearLoadingAnimation();

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    await sleep(400); // brief pause for UX

    hide(loadingState);
    uploadCard.style.opacity = '1';
    uploadCard.style.pointerEvents = '';
    show(resultState);
    renderResult(data);
    resultState.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    clearLoadingAnimation();
    console.warn('[Resume Judge AI] API error, using demo mode:', err.message);

    // Graceful demo fallback
    await sleep(600);
    hide(loadingState);
    uploadCard.style.opacity = '1';
    uploadCard.style.pointerEvents = '';

    const demo = buildDemoData(selectedFile.name);
    show(resultState);
    renderResult(demo);
    resultState.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showToast('Demo mode: API unreachable. Showing sample analysis.', 'info');
  }
}

/* ══════════════════════════════════════
   LOADING ANIMATION
══════════════════════════════════════ */
const LOADING_STEPS = [
  { pct: 8,  headline: 'Reading your resume…',       step: 'Parsing document structure' },
  { pct: 22, headline: 'Extracting content…',         step: 'Identifying sections & headings' },
  { pct: 40, headline: 'Analysing experience…',       step: 'Scoring work history & achievements' },
  { pct: 58, headline: 'Mapping your skills…',        step: 'Cross-referencing skill database' },
  { pct: 73, headline: 'Checking ATS compatibility…', step: 'Running keyword analysis' },
  { pct: 87, headline: 'Generating feedback…',        step: 'Crafting actionable suggestions' },
  { pct: 96, headline: 'Almost done…',                step: 'Compiling your verdict' },
];

let loadingStepIdx = 0;

function runLoadingAnimation() {
  loadingStepIdx = 0;
  advanceLoading();
  loadingTimer = setInterval(advanceLoading, 1400);
}

function advanceLoading() {
  if (loadingStepIdx >= LOADING_STEPS.length) return;
  const s = LOADING_STEPS[loadingStepIdx++];
  loadingBar.style.width = s.pct + '%';
  loadingHeadline.textContent = s.headline;
  loadingStep.textContent = s.step;
  loadingPct.textContent = s.pct + '%';
}

function clearLoadingAnimation() {
  if (loadingTimer) { clearInterval(loadingTimer); loadingTimer = null; }
  loadingBar.style.width = '100%';
  loadingPct.textContent = '100%';
}

/* ══════════════════════════════════════
   RENDER RESULT
══════════════════════════════════════ */
function renderResult(data) {
  const score = clamp(Math.round(data.score ?? 0), 0, 100);

  // Grade
  const grade = scoreToGrade(score);
  gradeCircle.textContent = grade.letter;
  gradeCircle.style.color = grade.color;
  gradeCircle.style.borderColor = grade.color + '55';
  gradeCircle.style.background = grade.color + '18';
  gradeCircle.style.boxShadow = `0 0 24px ${grade.color}44`;

  // Score ring
  animateScoreRing(score);

  // Label
  scoreLabel.textContent = grade.label;
  scoreSubtitle.textContent = grade.subtitle;

  // Category bars
  categoryBars.innerHTML = '';
  const cats = data.categories ?? [];
  const catColors = [
    { fill: 'linear-gradient(90deg,#6366f1,#8b5cf6)', text: '#818cf8' },
    { fill: 'linear-gradient(90deg,#8b5cf6,#c026d3)', text: '#a78bfa' },
    { fill: 'linear-gradient(90deg,#22d3ee,#6366f1)', text: '#67e8f9' },
    { fill: 'linear-gradient(90deg,#34d399,#22d3ee)', text: '#6ee7b7' },
  ];
  cats.forEach((cat, i) => {
    const pct = clamp(cat.score ?? 0, 0, 100);
    const col = catColors[i % catColors.length];
    const bar = document.createElement('div');
    bar.className = 'rj-cat-bar';
    bar.innerHTML = `
      <div class="rj-cat-bar__header">
        <span class="rj-cat-bar__name">${esc(cat.name)}</span>
        <span class="rj-cat-bar__score" style="color:${col.text}">${pct}/100</span>
      </div>
      <div class="rj-cat-bar__track">
        <div class="rj-cat-bar__fill" id="catFill_${i}" style="background:${col.fill};box-shadow:0 0 8px ${col.text}55;"></div>
      </div>
    `;
    categoryBars.appendChild(bar);
    // Animate with delay
    setTimeout(() => {
      const fill = document.getElementById(`catFill_${i}`);
      if (fill) fill.style.width = pct + '%';
    }, 300 + i * 120);
  });

  // Skills
  skillTags.innerHTML = '';
  const skillColorClasses = ['rj-skill-tag--indigo','rj-skill-tag--violet','rj-skill-tag--cyan','rj-skill-tag--emerald'];
  const skillIcons = ['fa-code','fa-database','fa-cloud','fa-terminal','fa-cogs','fa-layer-group','fa-chart-bar','fa-brain'];
  (data.skills ?? []).forEach((skill, i) => {
    const tag = document.createElement('span');
    tag.className = `rj-skill-tag ${skillColorClasses[i % skillColorClasses.length]}`;
    tag.style.animationDelay = `${i * 50}ms`;
    tag.innerHTML = `<i class="fa-solid ${skillIcons[i % skillIcons.length]}"></i>${esc(skill)}`;
    skillTags.appendChild(tag);
  });

  // Feedback
  feedbackItems.innerHTML = '';
  const fbIconMap = {
    positive: { cls: 'rj-feedback-icon--pos',  icon: 'fa-check' },
    warning:  { cls: 'rj-feedback-icon--warn', icon: 'fa-triangle-exclamation' },
    negative: { cls: 'rj-feedback-icon--neg',  icon: 'fa-xmark' },
  };
  (data.feedback ?? []).forEach((item, i) => {
    const t = fbIconMap[item.type] ?? fbIconMap.positive;
    const div = document.createElement('div');
    div.className = 'rj-feedback-item';
    div.style.animationDelay = `${100 + i * 70}ms`;
    div.innerHTML = `
      <div class="rj-feedback-icon ${t.cls}">
        <i class="fa-solid ${t.icon}"></i>
      </div>
      <p class="rj-feedback-text">${esc(item.text)}</p>
    `;
    feedbackItems.appendChild(div);
  });
}

/* ──────────────────────────────────────
   Score ring animation
────────────────────────────────────── */
function animateScoreRing(targetScore) {
  const circumference = 251.2; // 2π × 40
  let current = 0;
  const increment = targetScore / 60;

  const tick = setInterval(() => {
    current = Math.min(current + increment, targetScore);
    const offset = circumference - (current / 100) * circumference;
    scoreArc.style.strokeDashoffset = offset;
    scoreNumber.textContent = Math.round(current);
    if (current >= targetScore) clearInterval(tick);
  }, 25);
}

/* ══════════════════════════════════════
   RESET
══════════════════════════════════════ */
window.resetAnalysis = function () {
  clearSelection();
  hide(loadingState);
  hide(resultState);
  uploadCard.style.opacity = '1';
  uploadCard.style.pointerEvents = '';
  // Reset score ring
  if (scoreArc) { scoreArc.style.strokeDashoffset = '251.2'; scoreNumber.textContent = '0'; }
  document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
};

/* ══════════════════════════════════════
   DEMO DATA (fallback when API is off)
══════════════════════════════════════ */
function buildDemoData(filename) {
  const base = 58 + Math.floor(Math.random() * 30);
  return {
    score: base,
    filename,
    categories: [
      { name: 'Content Quality',  score: Math.min(100, base + rand(-5, 10)) },
      { name: 'Formatting',       score: Math.min(100, base + rand(0, 15))  },
      { name: 'Skills Relevance', score: Math.min(100, base + rand(-10, 8)) },
      { name: 'Impact & Results', score: Math.min(100, base + rand(-15, 5)) },
    ],
    skills: ['Python','React','Node.js','SQL','Docker','TypeScript','AWS','REST APIs','Git','Agile'],
    feedback: [
      { type: 'positive', text: 'Strong technical skill set clearly highlighted — good breadth of modern technologies.' },
      { type: 'positive', text: 'Chronological work history is well-structured and easy to scan.' },
      { type: 'warning',  text: 'Bullet points lack quantified results. Add metrics: "Reduced load time by 40%" instead of "Improved performance".' },
      { type: 'warning',  text: 'Professional summary is too generic. Tailor it to your target role with specific keywords.' },
      { type: 'negative', text: 'No measurable business impact detected. Recruiters want outcomes — not just responsibilities.' },
    ],
  };
}

/* ══════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════ */
function showToast(message, type = 'info') {
  document.getElementById('rjToast')?.remove();

  const styles = {
    info:  { border: 'rgba(99,102,241,0.35)',  bg: 'rgba(99,102,241,0.1)',  color: '#c7d2fe', icon: 'fa-circle-info' },
    error: { border: 'rgba(239,68,68,0.35)',   bg: 'rgba(239,68,68,0.1)',   color: '#fca5a5', icon: 'fa-circle-exclamation' },
  };
  const s = styles[type] ?? styles.info;

  const toast = document.createElement('div');
  toast.id = 'rjToast';
  toast.style.cssText = `
    position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
    display:flex;align-items:center;gap:.75rem;
    padding:.875rem 1.25rem;border-radius:.875rem;
    background:${s.bg};border:1px solid ${s.border};color:${s.color};
    font-family:'Outfit',sans-serif;font-size:.875rem;font-weight:500;
    backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,.5);
    max-width:22rem;animation:rjFadeUp .4s cubic-bezier(.34,1.56,.64,1) both;
  `;
  toast.innerHTML = `<i class="fa-solid ${s.icon}" style="font-size:.875rem;flex-shrink:0;"></i><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity .4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function show(el) { el?.classList.remove('rj-hidden'); }
function hide(el) { el?.classList.add('rj-hidden'); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }

function rand(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function scoreToGrade(score) {
  if (score >= 90) return { letter: 'A+', color: '#34d399', label: 'Outstanding',        subtitle: 'Top 5% of all resumes we\'ve analyzed' };
  if (score >= 80) return { letter: 'A',  color: '#34d399', label: 'Excellent',           subtitle: 'Well above average — strong candidate' };
  if (score >= 70) return { letter: 'B+', color: '#22d3ee', label: 'Above Average',       subtitle: 'A few improvements could make it great' };
  if (score >= 60) return { letter: 'B',  color: '#6366f1', label: 'Solid Foundation',    subtitle: 'Some key areas need attention' };
  if (score >= 50) return { letter: 'C',  color: '#a78bfa', label: 'Needs Work',          subtitle: 'Multiple areas require improvement' };
  return                   { letter: 'D',  color: '#f87171', label: 'Significant Gaps',   subtitle: 'Consider a substantial rewrite' };
}

/* ══════════════════════════════════════
   SMOOTH NAV SCROLL (close mobile menu)
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

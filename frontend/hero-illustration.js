/* ═══════════════════════════════════════════════════════
   components/hero-illustration.js
   Renders a rich inline UI mockup for the hero section
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const el = document.getElementById('heroIllustration');
  if (!el) return;

  /* ── Mini helper ── */
  function h(tag, attrs, ...children) {
    const node = Object.assign(document.createElement(tag), attrs);
    children.forEach(c => typeof c === 'string' ? node.insertAdjacentHTML('beforeend', c) : node.appendChild(c));
    return node;
  }

  /* ── Data ── */
  const cats = [
    { label: 'Content Quality',  pct: 82, col: '#818cf8' },
    { label: 'Formatting',       pct: 91, col: '#a78bfa' },
    { label: 'Skills Relevance', pct: 74, col: '#67e8f9' },
    { label: 'Impact & Results', pct: 63, col: '#6ee7b7' },
  ];
  const skills = ['Python', 'React', 'AWS', 'Docker', 'SQL', 'TypeScript'];
  const feedbacks = [
    { type: 'pos',  text: 'Strong technical breadth.' },
    { type: 'warn', text: 'Quantify your achievements.' },
    { type: 'neg',  text: 'Summary needs tailoring.' },
    { type: 'pos',  text: 'Clean chronological layout.' },
  ];
  const fbColor = { pos: '#34d399', warn: '#fbbf24', neg: '#f87171' };
  const fbIcon  = { pos: '✓',       warn: '!',        neg: '✕' };
  const skillColors = [
    { bg: 'rgba(99,102,241,.15)',  border: 'rgba(99,102,241,.3)',  color: '#818cf8' },
    { bg: 'rgba(139,92,246,.15)', border: 'rgba(139,92,246,.3)',  color: '#a78bfa' },
    { bg: 'rgba(34,211,238,.12)', border: 'rgba(34,211,238,.25)', color: '#67e8f9' },
    { bg: 'rgba(52,211,153,.12)', border: 'rgba(52,211,153,.25)', color: '#6ee7b7' },
    { bg: 'rgba(99,102,241,.15)',  border: 'rgba(99,102,241,.3)',  color: '#818cf8' },
    { bg: 'rgba(139,92,246,.15)', border: 'rgba(139,92,246,.3)',  color: '#a78bfa' },
  ];

  /* ── Root container ── */
  el.style.cssText = 'background:rgba(255,255,255,.025);overflow:hidden;';

  /* ── Window chrome ── */
  const chrome = h('div', {});
  chrome.style.cssText = `
    display:flex;align-items:center;gap:6px;
    padding:12px 16px;
    background:rgba(255,255,255,.02);
    border-bottom:1px solid rgba(255,255,255,.06);
  `;
  chrome.innerHTML = `
    <div style="width:10px;height:10px;border-radius:50%;background:rgba(239,68,68,.5);"></div>
    <div style="width:10px;height:10px;border-radius:50%;background:rgba(251,191,36,.5);"></div>
    <div style="width:10px;height:10px;border-radius:50%;background:rgba(52,211,153,.5);"></div>
    <div style="flex:1;display:flex;justify-content:center;">
      <div style="
        height:20px;width:190px;border-radius:6px;
        background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
        display:flex;align-items:center;justify-content:center;gap:5px;
      ">
        <span style="font-size:9px;color:#334155;">🔒</span>
        <span style="font-size:9px;color:#475569;font-family:'Outfit',sans-serif;">resumejudge.ai/analyze</span>
      </div>
    </div>
  `;
  el.appendChild(chrome);

  /* ── Body ── */
  const body = h('div', {});
  body.style.cssText = 'display:flex;min-height:340px;';

  /* Left panel */
  const left = h('div', {});
  left.style.cssText = `
    flex:1;padding:20px 18px;
    border-right:1px solid rgba(255,255,255,.05);
    overflow:hidden;
  `;

  // Header row
  left.innerHTML += `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
      <div style="
        width:30px;height:30px;border-radius:8px;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 14px rgba(99,102,241,.5);
        font-size:13px;
      ">⚡</div>
      <div>
        <div style="font-family:'Outfit',sans-serif;font-weight:700;font-size:12px;color:#e2e8f0;line-height:1.2;">Resume Judge AI</div>
        <div style="font-size:9px;color:#475569;">Analysis Report</div>
      </div>
      <div style="
        margin-left:auto;padding:2px 8px;border-radius:999px;
        background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.3);
        font-size:9px;font-weight:600;color:#6ee7b7;
        font-family:'Outfit',sans-serif;
        display:flex;align-items:center;gap:4px;
      ">
        <span style="width:5px;height:5px;border-radius:50%;background:#34d399;display:inline-block;"></span>
        Done
      </div>
    </div>
  `;

  // File chip
  left.innerHTML += `
    <div style="
      display:inline-flex;align-items:center;gap:6px;
      padding:6px 10px;border-radius:8px;margin-bottom:14px;
      background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);
    ">
      <span style="font-size:12px;">📄</span>
      <span style="font-size:10px;color:#94a3b8;font-family:'Outfit',sans-serif;font-weight:500;">john_doe_resume.pdf</span>
    </div>
  `;

  // Score ring (mini SVG)
  left.innerHTML += `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <div style="position:relative;width:64px;height:64px;flex-shrink:0;">
        <svg viewBox="0 0 80 80" width="64" height="64" style="transform:rotate(-90deg);">
          <defs>
            <linearGradient id="hiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#22d3ee"/>
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="7"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke="url(#hiGrad)" stroke-width="7"
            stroke-linecap="round"
            stroke-dasharray="201"
            stroke-dashoffset="${201 - 0.78 * 201}"
          />
        </svg>
        <div style="
          position:absolute;inset:0;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
        ">
          <span style="font-family:'Outfit',sans-serif;font-weight:900;font-size:17px;color:#fff;line-height:1;">78</span>
          <span style="font-size:8px;color:#475569;">/100</span>
        </div>
      </div>
      <div style="flex:1;">
        <div style="font-family:'Outfit',sans-serif;font-weight:700;font-size:13px;color:#e2e8f0;margin-bottom:2px;">Solid Resume</div>
        <div style="font-size:10px;color:#64748b;line-height:1.5;">A few targeted improvements<br>could push this to 90+</div>
      </div>
    </div>
  `;

  // Category bars
  cats.forEach(cat => {
    left.innerHTML += `
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <span style="font-size:9px;color:#64748b;font-family:'Outfit',sans-serif;">${cat.label}</span>
          <span style="font-size:9px;font-weight:700;color:${cat.col};font-family:'Outfit',sans-serif;">${cat.pct}</span>
        </div>
        <div style="height:4px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden;">
          <div style="
            height:100%;width:${cat.pct}%;border-radius:999px;
            background:linear-gradient(90deg,${cat.col},${cat.col}99);
            box-shadow:0 0 6px ${cat.col}66;
          "></div>
        </div>
      </div>
    `;
  });

  // Skills
  left.innerHTML += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:10px;">
    ${skills.map((s, i) => {
      const c = skillColors[i % skillColors.length];
      return `<span style="
        display:inline-block;padding:3px 8px;border-radius:6px;
        font-size:9px;font-weight:600;font-family:'Outfit',sans-serif;
        background:${c.bg};border:1px solid ${c.border};color:${c.color};
      ">${s}</span>`;
    }).join('')}
  </div>`;

  body.appendChild(left);

  /* Right panel */
  const right = h('div', {});
  right.style.cssText = 'flex:1;padding:20px 16px;overflow:hidden;';

  right.innerHTML += `
    <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#334155;margin-bottom:10px;font-family:'Outfit',sans-serif;">
      AI Feedback
    </div>
  `;

  feedbacks.forEach((fb, i) => {
    right.innerHTML += `
      <div style="
        display:flex;align-items:flex-start;gap:7px;
        padding:8px;border-radius:8px;margin-bottom:6px;
        background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);
        animation:rjFadeUp .5s cubic-bezier(.34,1.56,.64,1) ${i * 80}ms both;
      ">
        <div style="
          width:18px;height:18px;border-radius:5px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          background:${fbColor[fb.type]}22;font-size:8px;font-weight:700;color:${fbColor[fb.type]};
          margin-top:1px;
        ">${fbIcon[fb.type]}</div>
        <span style="font-size:10px;color:#94a3b8;line-height:1.5;font-family:'Outfit',sans-serif;">${fb.text}</span>
      </div>
    `;
  });

  // Grade badge
  right.innerHTML += `
    <div style="
      margin-top:14px;padding:12px;border-radius:10px;
      background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.08));
      border:1px solid rgba(99,102,241,.2);
      display:flex;align-items:center;gap:10px;
    ">
      <div style="
        width:40px;height:40px;border-radius:10px;flex-shrink:0;
        background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);
        display:flex;align-items:center;justify-content:center;
        font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;color:#818cf8;
      ">B+</div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#c7d2fe;font-family:'Outfit',sans-serif;">Above Average</div>
        <div style="font-size:9px;color:#475569;margin-top:2px;">Top 28% of resumes analyzed</div>
      </div>
    </div>
  `;

  body.appendChild(right);
  el.appendChild(body);

  /* Footer bar */
  const foot = h('div', {});
  foot.style.cssText = `
    padding:10px 18px;
    border-top:1px solid rgba(255,255,255,.04);
    background:rgba(255,255,255,.01);
    display:flex;align-items:center;justify-content:space-between;
  `;
  foot.innerHTML = `
    <span style="font-size:9px;color:#1e293b;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:5px;">
      <span style="width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 5px #34d399;display:inline-block;"></span>
      Analysis complete · 4.1 seconds
    </span>
    <div style="display:flex;gap:6px;">
      <button style="
        padding:3px 10px;border-radius:6px;border:1px solid rgba(99,102,241,.25);
        background:rgba(99,102,241,.1);color:#818cf8;font-size:9px;font-weight:700;
        font-family:'Outfit',sans-serif;cursor:pointer;
      ">Export</button>
      <button style="
        padding:3px 10px;border-radius:6px;border:none;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
        font-size:9px;font-weight:700;font-family:'Outfit',sans-serif;cursor:pointer;
      ">New Analysis</button>
    </div>
  `;
  el.appendChild(foot);

})();

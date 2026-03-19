# Resume Judge AI — Frontend

Premium dark SaaS UI for AI-powered resume analysis. Zero build step — open `index.html` in any browser.

## File Structure

```
frontend/
├── index.html                    ← Full page (navbar, hero, features, steps, upload, results, footer)
├── style.css                     ← Complete design system (tokens, glass, glows, animations)
├── script.js                     ← All interactivity (drag-drop, API, loading, result rendering)
├── assets/                       ← Place any static images or icons here
└── components/
    └── hero-illustration.js      ← Hero section mockup UI (injected via JS)
```

## Quick Start

```bash
# Option 1 — just open the file
open frontend/index.html

# Option 2 — serve locally (recommended for API calls)
python3 -m http.server 8080 --directory frontend/
# → open http://localhost:8080

# Option 3 — Node
npx serve frontend/
```

## Flask API Integration

The frontend posts to:

```
POST http://127.0.0.1:5000/analyze
Content-Type: multipart/form-data
Body:  file = <resume file (PDF/DOCX)>
```

### Expected JSON Response

```json
{
  "score": 78,
  "categories": [
    { "name": "Content Quality",  "score": 82 },
    { "name": "Formatting",       "score": 91 },
    { "name": "Skills Relevance", "score": 74 },
    { "name": "Impact & Results", "score": 63 }
  ],
  "skills": ["Python", "React", "AWS", "Docker", "SQL", "TypeScript"],
  "feedback": [
    { "type": "positive", "text": "Strong technical skill breadth detected." },
    { "type": "warning",  "text": "Add quantified achievements (numbers/metrics)." },
    { "type": "negative", "text": "Summary is too generic — tailor to target role." }
  ]
}
```

`feedback[].type` values: `"positive"` | `"warning"` | `"negative"`

## Demo Mode

If the Flask server isn't running, the frontend automatically falls back to **demo mode** with randomised sample data — the UI always looks great without a backend.

## Design System

| Token           | Value                                    |
|-----------------|------------------------------------------|
| Background      | `#060810`                                |
| Glass surface   | `rgba(255,255,255,0.04)`                 |
| Indigo          | `#6366f1`                                |
| Violet          | `#8b5cf6`                                |
| Cyan            | `#22d3ee`                                |
| Emerald         | `#34d399`                                |
| Display font    | Instrument Serif (Google Fonts)          |
| UI font         | Outfit 300/400/500/700/800 (Google Fonts)|

## Features

- **Sticky navbar** — transparent → frosted glass on scroll
- **Drag & drop upload** — drag-over states, file validation (PDF/DOCX, ≤10 MB)
- **Animated loading** — scanner ring, step-by-step progress bar
- **Animated results** — score ring counter, staggered category bars, skill tags, typed feedback
- **Scroll animations** — IntersectionObserver fade-up for all sections
- **Responsive** — mobile-first, works on all screen sizes
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation

// Vice Sunset Studio — editor wiring.
// Pick a panel, tap a photo to drop it in, drag on the cover to reposition,
// zoom with the slider, edit the words, pick a grade and a size, export PNG.
import { drawCover, layoutFor, SIZES } from './cover.js';
import { shotConfig } from './shots.js';

export const SAMPLES = [
  { name: 'Boulevard', url: 'samples/boulevard.jpg' },
  { name: 'Pier', url: 'samples/pier.jpg' },
  { name: 'Supercar', url: 'samples/supercar.jpg' },
  { name: 'Convertible', url: 'samples/convertible.jpg' },
  { name: 'Neon Walk', url: 'samples/neon.jpg' },
  { name: 'Harbour', url: 'samples/harbour.jpg' },
];

const canvas = document.getElementById('cover');
const strip = document.getElementById('strip');
const status = document.getElementById('status');
const zoom = document.getElementById('zoom');
const selectedLabel = document.getElementById('selected-label');

const state = {
  title: 'PALM HEAT',
  kicker: 'VICE COAST',
  tagline: 'LIVE FAST. STAY GOLDEN.',
  grade: 'sunset',
  size: 'landscape',
  selected: 0,
  showSelection: true,
  panels: Array.from({ length: 5 }, () => ({ img: null, zoom: 1, panX: 0, panY: 0 })),
};

const library = []; // {name, url, img}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, state);
  selectedLabel.textContent = state.selected >= 0
    ? `Panel ${state.selected + 1} of 5 selected — tap a photo, drag to move it`
    : 'No panel selected';
  if (state.panels[state.selected]) zoom.value = String(state.panels[state.selected].zoom || 1);
}

function setSize(key) {
  state.size = key;
  canvas.width = SIZES[key].w;
  canvas.height = SIZES[key].h;
  document.querySelectorAll('[data-size]').forEach((b) =>
    b.classList.toggle('active', b.dataset.size === key));
  redraw();
}

function assignToSelected(entry) {
  const slot = state.panels[state.selected];
  if (!slot) return;
  slot.img = entry.img;
  status.textContent = `${entry.name} placed in panel ${state.selected + 1}.`;
  // Advance to the next empty panel so filling the poster takes five taps.
  const next = state.panels.findIndex((p, i) => i > state.selected && !p.img);
  if (next >= 0) state.selected = next;
  redraw();
}

function addToStrip(entry) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'thumb';
  btn.title = entry.name;
  const img = document.createElement('img');
  img.src = entry.url;
  img.alt = entry.name;
  const cap = document.createElement('span');
  cap.textContent = entry.name;
  btn.append(img, cap);
  btn.addEventListener('click', () => assignToSelected(entry));
  strip.append(btn);
}

async function loadSamples() {
  for (const s of SAMPLES) {
    try {
      const img = await loadImage(s.url);
      const entry = { ...s, img };
      library.push(entry);
      addToStrip(entry);
    } catch { /* a missing sample simply does not appear */ }
  }
}

document.getElementById('upload').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    const entry = { name: file.name.replace(/\.[^.]+$/, ''), url, img };
    library.push(entry);
    addToStrip(entry);
    assignToSelected(entry);
  }
  e.target.value = '';
});

// Drag on the canvas: pick the panel under the pointer and pan its photo.
let drag = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const { panels } = layoutFor(canvas.width, canvas.height);
  const hit = panels.findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
  if (hit >= 0) state.selected = hit;
  drag = { x: p.x, y: p.y };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const p = canvasPoint(e);
  const slot = state.panels[state.selected];
  if (slot && slot.img) {
    const { panels } = layoutFor(canvas.width, canvas.height);
    const r = panels[state.selected];
    slot.panX = Math.max(-1, Math.min(1, slot.panX + (p.x - drag.x) / (r.w * 0.4)));
    slot.panY = Math.max(-1, Math.min(1, slot.panY + (p.y - drag.y) / (r.h * 0.4)));
  }
  drag = p;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

zoom.addEventListener('input', () => {
  const slot = state.panels[state.selected];
  if (slot) { slot.zoom = Number(zoom.value); redraw(); }
});

for (const id of ['title', 'kicker', 'tagline']) {
  document.getElementById(id).addEventListener('input', (e) => {
    state[id] = e.target.value;
    redraw();
  });
}
document.querySelectorAll('[data-grade]').forEach((b) =>
  b.addEventListener('click', () => {
    state.grade = b.dataset.grade;
    document.querySelectorAll('[data-grade]').forEach((x) =>
      x.classList.toggle('active', x === b));
    redraw();
  }));
document.querySelectorAll('[data-size]').forEach((b) =>
  b.addEventListener('click', () => setSize(b.dataset.size)));

document.getElementById('fill').addEventListener('click', () => {
  library.slice(0, 5).forEach((entry, i) => { state.panels[i].img = entry.img; });
  status.textContent = 'Filled all five panels with the sample photos.';
  redraw();
});
document.getElementById('shuffle').addEventListener('click', () => {
  if (!library.length) return;
  const start = Math.floor(Math.random() * library.length);
  state.panels.forEach((slot, i) => {
    slot.img = library[(start + i) % library.length].img;
    slot.panX = 0; slot.panY = 0;
  });
  status.textContent = 'Shuffled the samples across the panels.';
  redraw();
});

// Keyboard: 1-5 select a panel, arrows nudge its photo, +/- zoom it.
window.addEventListener('keydown', (e) => {
  if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return;
  const slot = state.panels[state.selected];
  if (/^[1-5]$/.test(e.key)) { state.selected = Number(e.key) - 1; redraw(); return; }
  if (!slot) return;
  const step = e.shiftKey ? 0.12 : 0.04;
  if (e.key === 'ArrowLeft') slot.panX = Math.max(-1, slot.panX - step);
  else if (e.key === 'ArrowRight') slot.panX = Math.min(1, slot.panX + step);
  else if (e.key === 'ArrowUp') slot.panY = Math.max(-1, slot.panY - step);
  else if (e.key === 'ArrowDown') slot.panY = Math.min(1, slot.panY + step);
  else if (e.key === '+' || e.key === '=') slot.zoom = Math.min(3, (slot.zoom || 1) + 0.08);
  else if (e.key === '-') slot.zoom = Math.max(1, (slot.zoom || 1) - 0.08);
  else return;
  e.preventDefault();
  redraw();
});

document.getElementById('clear-panel').addEventListener('click', () => {
  const slot = state.panels[state.selected];
  if (slot) { slot.img = null; slot.panX = 0; slot.panY = 0; slot.zoom = 1; redraw(); }
});

document.getElementById('export').addEventListener('click', () => {
  const wasShowing = state.showSelection;
  state.showSelection = false;
  drawCover(canvas, state);
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-sunset-cover-${canvas.width}x${canvas.height}.png`;
    a.click();
    status.textContent = `Saved vice-sunset-cover-${canvas.width}x${canvas.height}.png`;
    state.showSelection = wasShowing;
    redraw();
  }, 'image/png');
});

async function init() {
  await loadSamples();
  const shot = shotConfig(new URLSearchParams(location.search));
  if (shot) {
    if (shot.title) state.title = shot.title;
    if (shot.kicker) state.kicker = shot.kicker;
    if (shot.tagline) state.tagline = shot.tagline;
    if (shot.grade) state.grade = shot.grade;
    for (const id of ['title', 'kicker', 'tagline']) {
      const el = document.getElementById(id);
      if (el) el.value = state[id];
    }
    document.querySelectorAll('[data-grade]').forEach((x) =>
      x.classList.toggle('active', x.dataset.grade === state.grade));
    const picks = shot.panels && shot.panels.length ? shot.panels : SAMPLES.map((s) => s.name.toLowerCase());
    picks.slice(0, 5).forEach((name, i) => {
      // Match loosely: ?panels=neon finds the sample named "Neon Walk".
      const key = String(name).toLowerCase().replace(/[^a-z]/g, '');
      const entry = library.find((e) => e.name.toLowerCase().replace(/[^a-z]/g, '').startsWith(key));
      if (entry) state.panels[i].img = entry.img;
    });
    if (shot.heroZoom) state.panels[0].zoom = shot.heroZoom;
    setSize(shot.size || 'landscape');
    if (shot.mode === 'cover') {
      document.body.classList.add('shot-cover');
      state.showSelection = false;
    }
    redraw();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
    return;
  }
  // Friendly default scene: samples already in the panels.
  library.slice(0, 5).forEach((entry, i) => { state.panels[i].img = entry.img; });
  setSize('landscape');
}

init();

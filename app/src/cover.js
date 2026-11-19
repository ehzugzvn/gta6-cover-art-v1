// Vice Sunset Studio — cover renderer.
// Draws a 5-panel poster (one big hero panel on the left, a 2x2 grid on the
// right) with thick white borders, a colour grade over every photo, and a
// sunset-gradient title band across the bottom carrying a kicker badge, a
// giant gradient title and a tagline. Everything is drawn with canvas paths,
// fills, outlines and gradients — no logos, no borrowed artwork, no fonts.

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  landscape: { w: 1920, h: 1080, label: 'Landscape 1920 × 1080' },
};

export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.38) contrast(1.08) brightness(1.06) sepia(0.22) hue-rotate(-8deg)',
    tint: ['rgba(255,138,61,0.20)', 'rgba(255,61,127,0.24)'],
    band: ['#2e0a44', '#8a1c5c', '#e84855'],
  },
  neon: {
    label: 'Neon',
    filter: 'saturate(1.55) contrast(1.16) brightness(1.02) hue-rotate(10deg)',
    tint: ['rgba(0,229,255,0.16)', 'rgba(255,0,170,0.22)'],
    band: ['#071a3a', '#0e4d64', '#7a1e6e'],
  },
  pop: {
    label: 'Clean Pop',
    filter: 'saturate(1.28) contrast(1.05) brightness(1.12)',
    tint: ['rgba(255,235,160,0.10)', 'rgba(120,200,255,0.12)'],
    band: ['#123a6e', '#1c6e9e', '#e85d75'],
  },
};

/** The five panel rectangles for a canvas of w x h, plus the title band. */
export function layoutFor(w, h) {
  const gutter = Math.max(6, Math.round(w * 0.009));
  const bandH = Math.round(h * 0.235);
  const panelBottom = h - bandH + gutter; // panels tuck one gutter under the band
  const panelH = panelBottom - gutter;
  const heroW = Math.round((w - gutter * 3) * 0.55);
  const gridX = gutter * 2 + heroW;
  const gridW = w - gridX - gutter;
  const cellW = Math.round((gridW - gutter) / 2);
  const cellH = Math.round((panelH - gutter) / 2);
  const panels = [
    { x: gutter, y: gutter, w: heroW, h: panelH },
    { x: gridX, y: gutter, w: cellW, h: cellH },
    { x: gridX + cellW + gutter, y: gutter, w: gridW - cellW - gutter, h: cellH },
    { x: gridX, y: gutter + cellH + gutter, w: cellW, h: panelH - cellH - gutter },
    { x: gridX + cellW + gutter, y: gutter + cellH + gutter, w: gridW - cellW - gutter, h: panelH - cellH - gutter },
  ];
  return { gutter, panels, band: { x: 0, y: h - bandH, w, h: bandH } };
}

/** Draws one photo into a panel rect, honouring zoom and pan, with the grade applied. */
function drawPanelPhoto(ctx, slot, rect, grade) {
  const img = slot.img;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!img) {
    const ph = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    ph.addColorStop(0, '#3a2a5e');
    ph.addColorStop(1, '#c94b6d');
    ctx.fillStyle = ph;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `700 ${Math.max(14, rect.w * 0.07)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }
  const base = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight);
  const scale = base * (slot.zoom || 1);
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const cx = rect.x + rect.w / 2 + (slot.panX || 0) * rect.w * 0.4;
  const cy = rect.y + rect.h / 2 + (slot.panY || 0) * rect.h * 0.4;
  ctx.filter = grade.filter;
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.filter = 'none';
  const tint = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  tint.addColorStop(0, grade.tint[0]);
  tint.addColorStop(1, grade.tint[1]);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/** Fits `text` in the condensed display face, shrinking until it fits maxW. */
function fitFont(ctx, text, maxW, startSize) {
  let size = startSize;
  const face = '"Arial Narrow", Impact, "Franklin Gothic Medium", sans-serif';
  while (size > 14) {
    ctx.font = `${size}px ${face}`;
    if (ctx.measureText(text).width <= maxW) break;
    size -= 3;
  }
  return size;
}

/** The sunset band: gradient slab, kicker badge, gradient title, tagline. */
function drawBand(ctx, state, band, grade) {
  const grad = ctx.createLinearGradient(band.x, band.y, band.x + band.w, band.y + band.h);
  grad.addColorStop(0, grade.band[0]);
  grad.addColorStop(0.55, grade.band[1]);
  grad.addColorStop(1, grade.band[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  // Retro sun: a pale disc rising behind the title, cut by the band's edges.
  ctx.save();
  ctx.beginPath();
  ctx.rect(band.x, band.y, band.w, band.h);
  ctx.clip();
  const sunR = band.h * 0.85;
  const sun = ctx.createLinearGradient(0, band.y - sunR, 0, band.y + sunR);
  sun.addColorStop(0, 'rgba(255,233,90,0.5)');
  sun.addColorStop(1, 'rgba(255,61,127,0.05)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(band.x + band.w / 2, band.y + band.h * 0.62, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // thin gold rule along the top of the band
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(band.x, band.y, band.w, Math.max(3, band.h * 0.022));

  const cx = band.x + band.w / 2;
  const title = (state.title || '').trim().toUpperCase();
  const kicker = (state.kicker || '').trim().toUpperCase();
  const tagline = (state.tagline || '').trim().toUpperCase();

  // Kicker badge: a small white pill above the title.
  let titleTop = band.y + band.h * 0.16;
  if (kicker) {
    ctx.font = `700 ${Math.round(band.h * 0.105)}px system-ui, sans-serif`;
    const kw = ctx.measureText(kicker).width + band.h * 0.22;
    const kh = band.h * 0.19;
    const kx = cx - kw / 2;
    const ky = band.y + band.h * 0.09;
    ctx.beginPath();
    ctx.roundRect(kx, ky, kw, kh, kh / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#2e0a44';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kicker, cx, ky + kh / 2 + 1);
    titleTop = ky + kh + band.h * 0.03;
  }

  if (title) {
    const size = fitFont(ctx, title, band.w * 0.92, band.h * 0.46);
    ctx.font = `${size}px "Arial Narrow", Impact, "Franklin Gothic Medium", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(size * 0.02)}px`; } catch { /* older engines */ }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const ty = titleTop + size * 0.92;
    ctx.shadowColor = 'rgba(20,2,30,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.06;
    ctx.lineWidth = size * 0.22;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1d0b2e';
    ctx.strokeText(title, cx, ty);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const fill = ctx.createLinearGradient(0, ty - size, 0, ty);
    fill.addColorStop(0, '#ffe95a');
    fill.addColorStop(0.55, '#ff8a3d');
    fill.addColorStop(1, '#ff3d7f');
    ctx.fillStyle = fill;
    ctx.fillText(title, cx, ty);
    try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }

    if (tagline) {
      ctx.font = `600 ${Math.round(band.h * 0.095)}px system-ui, sans-serif`;
      try { ctx.letterSpacing = `${Math.round(band.h * 0.03)}px`; } catch { /* ignore */ }
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(20,2,30,0.6)';
      ctx.shadowBlur = 6;
      // Keep the tagline inside the band even when the title runs at full size.
      ctx.fillText(tagline, cx, Math.min(ty + band.h * 0.17, band.y + band.h * 0.94));
      ctx.shadowBlur = 0;
      try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
    }
  }
}

/** Draws the whole cover described by `state` onto `canvas` at its own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const { panels, band } = layoutFor(w, h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  panels.forEach((rect, i) => drawPanelPhoto(ctx, state.panels[i], rect, grade));
  // A soft vignette over the photo area deepens the poster feel.
  const vig = ctx.createRadialGradient(w / 2, band.y / 2, Math.min(w, h) * 0.42, w / 2, band.y / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(24,4,36,0)');
  vig.addColorStop(1, 'rgba(24,4,36,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, band.y + 4);
  if (state.selected >= 0 && state.showSelection) {
    const r = panels[state.selected];
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(4, w * 0.005);
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
  }
  drawBand(ctx, state, band, grade);
}

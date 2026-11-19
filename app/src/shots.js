// Fixed scenes for screenshots, driven by the query string:
//   ?shot=cover&size=landscape&grade=sunset&title=PALM%20HEAT
//     &panels=convertible,supercar,neon,pier,harbour
//   ?shot=editor&...  (same setup, but the editor stays visible)
// Returns null when there is no ?shot= parameter, so normal use is untouched.
export function shotConfig(query) {
  const mode = query.get('shot');
  if (!mode) return null;
  const panels = (query.get('panels') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const zoomRaw = Number(query.get('zoom'));
  return {
    mode,
    title: query.get('title'),
    kicker: query.get('kicker'),
    tagline: query.get('tagline'),
    grade: query.get('grade'),
    size: query.get('size'),
    panels,
    // Optional hero zoom (1..3) so a screenshot can push in on panel 1.
    heroZoom: Number.isFinite(zoomRaw) && zoomRaw >= 1 && zoomRaw <= 3 ? zoomRaw : null,
  };
}

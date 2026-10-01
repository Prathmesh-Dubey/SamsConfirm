// 3D spinning Earth for the Markets hero (desktop only).
// Uses cobe (MIT, ~5 KB WebGL globe). If it cannot load, the static SVG globe stays visible.
const wrap = document.querySelector(".s2-mk-globe");
const canvas = wrap && wrap.querySelector(".s2-mk-earth");
const desktop = window.matchMedia("(min-width: 981px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// SAMS is UK registered; one hub per launch region.
const LONDON = [51.507, -0.128];
const HUBS = [
  [25.205, 55.271],   // Dubai — Middle East
  [29.760, -95.370],  // Houston — Americas
  [-23.551, -46.633], // São Paulo — Americas
  [1.352, 103.820],   // Singapore — Asia Pacific
  [6.524, 3.379],     // Lagos — Africa
];

let started = false;

async function start() {
  if (started || !canvas || !desktop.matches) return;
  started = true;

  let createGlobe;
  try {
    ({ default: createGlobe } = await import("https://cdn.jsdelivr.net/npm/cobe@2.0.1/+esm"));
  } catch (err) {
    return; // keep the SVG fallback
  }

  let phi = 4.45; // opens facing Europe, Africa and the Middle East
  let dragX = null;
  let dragOffset = 0;
  let size = canvas.offsetWidth;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // cobe 2.x draws only when update() is called (no built-in loop), so we drive it.
  const globe = createGlobe(canvas, {
    devicePixelRatio: dpr,
    width: size,
    height: size,
    phi,
    theta: 0.28,
    dark: 0,
    diffuse: 1.2,
    scale: 1,
    mapSamples: 60000,
    mapBrightness: 8,
    baseColor: [0.45, 0.72, 1],      // sky-blue Earth
    markerColor: [0.04, 0.14, 0.32], // dark-blue pins, same tone as the continents
    glowColor: [0.55, 0.78, 1],
    markers: [{ location: LONDON, size: 0.07 }, ...HUBS.map((location) => ({ location, size: 0.05 }))],
  });

  // Only animate while the hero is on screen.
  let inView = true;
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(wrap);

  let resized = false;
  function frame() {
    if (inView) {
      if (dragX === null && !reducedMotion) phi += 0.0035;
      const state = { phi: phi + dragOffset };
      if (resized) { state.width = size; state.height = size; resized = false; }
      globe.update(state);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  canvas.addEventListener("pointerdown", (e) => {
    dragX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragX !== null) dragOffset = (e.clientX - dragX) / 160;
  });
  const endDrag = () => {
    if (dragX === null) return;
    phi += dragOffset;
    dragOffset = 0;
    dragX = null;
    canvas.classList.remove("is-dragging");
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    if (canvas.offsetWidth && canvas.offsetWidth !== size) { size = canvas.offsetWidth; resized = true; }
  });

  wrap.classList.add("is-3d");
  window.addEventListener("pagehide", () => globe.destroy(), { once: true });
}

start();
desktop.addEventListener("change", start);

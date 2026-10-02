document.addEventListener("DOMContentLoaded", function () {

  /* ---------------------------------------------------------------- */
  /* Navbar: scroll shrink + mobile toggle                              */
  /* ---------------------------------------------------------------- */
  (function nav() {
    const nav = document.getElementById("s2Nav");
    const toggle = document.getElementById("s2NavToggle");
    const mobile = document.getElementById("s2NavMobile");
    if (!nav) return;

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener("click", () => {
        const open = mobile.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      mobile.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          mobile.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        })
      );
    }

    /* Language dropdown */
    const langBtn = document.getElementById("s2LangBtn");
    const langMenu = document.getElementById("s2LangMenu");
    if (langBtn && langMenu) {
      const setLang = (open) => {
        langMenu.hidden = !open;
        langBtn.setAttribute("aria-expanded", String(open));
      };
      langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setLang(langMenu.hidden);
      });
      document.addEventListener("click", (e) => {
        if (!langMenu.hidden && !langMenu.contains(e.target)) setLang(false);
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !langMenu.hidden) {
          setLang(false);
          langBtn.focus();
        }
      });
    }
  })();

  /* ---------------------------------------------------------------- */
  /* Back to top                                                        */
  /* ---------------------------------------------------------------- */
  (function backToTop() {
    const btn = document.getElementById("s2Top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => btn.classList.toggle("is-visible", window.scrollY > 700),
      { passive: true }
    );
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  })();

  /* ---------------------------------------------------------------- */
  /* Scroll reveal                                                      */
  /* ---------------------------------------------------------------- */
  (function reveal() {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    els.forEach((el) => io.observe(el));
  })();

  /* ---------------------------------------------------------------- */
  /* Animated counters                                                  */
  /* ---------------------------------------------------------------- */
  (function counters() {
    const els = Array.from(document.querySelectorAll("[data-count-to]"));
    if (!els.length) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = (el) => {
      const target = Number(el.dataset.countTo);
      const suffix = el.dataset.suffix || "";
      if (prefersReducedMotion || !Number.isFinite(target)) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => io.observe(el));
  })();

  /* ---------------------------------------------------------------- */
  /* Certification carousel                                             */
  /* ---------------------------------------------------------------- */
  (function ccCarousel() {
    const track = document.getElementById("ccTrack2");
    const dotsWrap = document.getElementById("ccDots2");
    const prevBtn = document.getElementById("ccPrev2");
    const nextBtn = document.getElementById("ccNext2");
    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.querySelectorAll(".s2-cc__card"));
    const total = cards.length;
    let current = 0;

    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to certification " + (i + 1));
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function markActive(i) {
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
    }

    function goTo(i) {
      current = (i + total) % total;
      cards[current].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      markActive(current);
    }

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    let settleTimer = null;
    track.addEventListener(
      "scroll",
      () => {
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          let closest = 0;
          let closestDist = Infinity;
          cards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - track.scrollLeft);
            if (dist < closestDist) {
              closestDist = dist;
              closest = i;
            }
          });
          current = closest;
          markActive(current);
        }, 120);
      },
      { passive: true }
    );

    markActive(0);
  })();

  /* ---------------------------------------------------------------- */
  /* 360 / 3D zoom viewer modal (Technical Overview + Product page)    */
  /* ---------------------------------------------------------------- */
  (function tov360() {
    const openBtn = document.getElementById("tov360Btn2");
    const modal = document.getElementById("tov360Modal2");
    const backdrop = document.getElementById("tov360Backdrop2");
    const closeBtn = document.getElementById("tov360Close2");
    const modalModel = document.getElementById("tov360Model2");
    if (!openBtn || !modal || !backdrop || !closeBtn) return;

    let lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      if (modalModel) modalModel.cameraOrbit = "0deg 75deg 105%";
      closeBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  })();

  /* ---------------------------------------------------------------- */
  /* Global reach: a real rotating orthographic-projection globe        */
  /* ---------------------------------------------------------------- */
  (function reachGlobe() {
    const svgEl = document.getElementById("s2Globe");
    const landG = document.getElementById("s2GlobeLand");
    const gratG = document.getElementById("s2GlobeGrat");
    const routesG = document.getElementById("s2GlobeRoutes");
    const markersG = document.getElementById("s2GlobeMarkers");
    if (!svgEl || !landG || !gratG || !routesG || !markersG) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const CX = 160, CY = 160, R = 134;
    const LAT0 = 14; // fixed viewing tilt, degrees
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Coarse land/sea bitmap: rows = latitude bands (+80 to -80), cols = longitude bands (-180 to +180)
    const WORLD_ROWS = [
      [],
      [[6, 8], [34, 38]],
      [[4, 9], [17, 19], [30, 38]],
      [[3, 10], [16, 21], [26, 38]],
      [[3, 10], [16, 22], [24, 38]],
      [[3, 9], [17, 21], [23, 37]],
      [[3, 8], [17, 22], [23, 36]],
      [[4, 7], [16, 24], [26, 35]],
      [[4, 6], [16, 25], [27, 32], [33, 36]],
      [[4, 8], [17, 26], [30, 36]],
      [[4, 9], [17, 26], [30, 35]],
      [[4, 9], [18, 25], [31, 35]],
      [[4, 8], [18, 24], [33, 38]],
      [[4, 8], [19, 23], [32, 38]],
      [[5, 7], [20, 23], [33, 37]],
      [[5, 6], [21, 22], [34, 37]],
      [[5, 6]],
      [],
      [],
      [],
    ];
    const ROWS = WORLD_ROWS.length, COLS = 40;

    const LAND_POINTS = [];
    WORLD_ROWS.forEach((ranges, row) => {
      const lat = 80 - (row * 160) / (ROWS - 1);
      ranges.forEach(([start, end]) => {
        for (let col = start; col <= end; col++) {
          const lon = -180 + (col * 360) / (COLS - 1);
          LAND_POINTS.push({ lat, lon });
        }
      });
    });

    const CITIES = {
      hub: { lat: 51.5, lon: -0.1 }, // London
      me: { lat: 25.2, lon: 55.3 }, // Dubai
      am: { lat: 40.7, lon: -74.0 }, // New York
      apac: { lat: 1.35, lon: 103.8 }, // Singapore
      af: { lat: -26.2, lon: 28.0 }, // Johannesburg
    };

    const MERIDIANS = [0, 30, 60, 90, 120, 150, 180, -30, -60, -90, -120, -150];
    const PARALLELS = [-60, -30, 0, 30, 60];

    function project(lat, lon, lon0) {
      const φ = (lat * Math.PI) / 180;
      const φ0 = (LAT0 * Math.PI) / 180;
      const Δλ = ((lon - lon0) * Math.PI) / 180;
      const c = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(Δλ);
      const x = R * Math.cos(φ) * Math.sin(Δλ);
      const y = R * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(Δλ));
      return { x: CX + x, y: CY - y, c };
    }

    // Pre-build land dots + graticule paths once; update attrs each frame.
    const landEls = LAND_POINTS.map((p) => {
      const el = document.createElementNS(svgNS, "circle");
      el.setAttribute("r", "1.6");
      landG.appendChild(el);
      return { p, el };
    });

    const meridianEls = MERIDIANS.map((lon) => {
      const el = document.createElementNS(svgNS, "path");
      gratG.appendChild(el);
      return { lon, el, steps: 24 };
    });
    const parallelEls = PARALLELS.map((lat) => {
      const el = document.createElementNS(svgNS, "path");
      gratG.appendChild(el);
      return { lat, el, steps: 48 };
    });

    const routeKeys = ["me", "am", "apac", "af"];
    const routeEls = routeKeys.map((key) => {
      const el = document.createElementNS(svgNS, "path");
      routesG.appendChild(el);
      return { key, el };
    });

    const markerEls = Object.keys(CITIES).map((key) => {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "s2-globe__marker" + (key === "hub" ? " s2-globe__marker--hub" : ""));
      const pulse = document.createElementNS(svgNS, "circle");
      pulse.setAttribute("class", "s2-globe__pulse");
      pulse.setAttribute("r", key === "hub" ? "5" : "4");
      const dot = document.createElementNS(svgNS, "circle");
      dot.setAttribute("class", "s2-globe__dot");
      dot.setAttribute("r", key === "hub" ? "4.4" : "3.2");
      g.appendChild(pulse);
      g.appendChild(dot);
      markersG.appendChild(g);
      return { key, g, pulse };
    });

    function render(lon0) {
      landEls.forEach(({ p, el }) => {
        const { x, y, c } = project(p.lat, p.lon, lon0);
        if (c < -0.04) {
          el.setAttribute("opacity", "0");
          return;
        }
        const depth = Math.max(c, 0.08);
        el.setAttribute("cx", x.toFixed(1));
        el.setAttribute("cy", y.toFixed(1));
        el.setAttribute("opacity", (0.25 + depth * 0.75).toFixed(2));
        el.setAttribute("r", (0.9 + depth * 0.9).toFixed(2));
      });

      meridianEls.forEach(({ lon, el, steps }) => {
        let d = "";
        for (let i = 0; i <= steps; i++) {
          const lat = -90 + (i * 180) / steps;
          const { x, y } = project(lat, lon, lon0);
          d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
        }
        el.setAttribute("d", d);
      });
      parallelEls.forEach(({ lat, el, steps }) => {
        let d = "";
        for (let i = 0; i <= steps; i++) {
          const lon = -180 + (i * 360) / steps;
          const { x, y } = project(lat, lon, lon0);
          d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
        }
        el.setAttribute("d", d);
      });

      const pos = {};
      markerEls.forEach(({ key, g, pulse }) => {
        const city = CITIES[key];
        const { x, y, c } = project(city.lat, city.lon, lon0);
        pos[key] = { x, y, c };
        const visible = c > 0.05;
        g.setAttribute("opacity", visible ? "1" : "0");
        g.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
        pulse.style.animationPlayState = visible ? "running" : "paused";
      });

      const hub = pos.hub;
      routeEls.forEach(({ key, el }) => {
        const target = pos[key];
        if (!hub || !target || hub.c <= 0.05 || target.c <= 0.05) {
          el.setAttribute("opacity", "0");
          return;
        }
        const mx = (hub.x + target.x) / 2;
        const my = (hub.y + target.y) / 2;
        const dx = mx - CX, dy = my - CY;
        const dist = Math.hypot(dx, dy) || 1;
        const bulge = 1 + 14 / dist;
        const qx = CX + dx * bulge;
        const qy = CY + dy * bulge;
        el.setAttribute("d", "M" + hub.x.toFixed(1) + "," + hub.y.toFixed(1) + " Q" + qx.toFixed(1) + "," + qy.toFixed(1) + " " + target.x.toFixed(1) + "," + target.y.toFixed(1));
        el.setAttribute("opacity", "0.7");
      });
    }

    let lon0 = 20;
    render(lon0);

    if (prefersReduced) return;

    const DEG_PER_SEC = 7;
    let last = performance.now();
    let running = true;

    function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      lon0 = (lon0 + DEG_PER_SEC * dt) % 360;
      render(lon0);
      if (running) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    const section = document.getElementById("reach");
    if (section && "IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const wasRunning = running;
            running = entry.isIntersecting;
            if (running && !wasRunning) {
              last = performance.now();
              requestAnimationFrame(tick);
            }
          });
        },
        { threshold: 0.1 }
      ).observe(section);
    }
  })();

  /* ---------------------------------------------------------------- */
  /* Reach: region tabs                                                 */
  /* ---------------------------------------------------------------- */
  (function reach() {
    const regionButtons = Array.from(document.querySelectorAll(".s2-region"));
    const panels = Array.from(document.querySelectorAll("[data-region-panel]"));
    if (!regionButtons.length) return;

    regionButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.region;
        regionButtons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", String(b === btn));
        });
        panels.forEach((p) => (p.hidden = p.dataset.regionPanel !== target));
      });
    });
  })();

});

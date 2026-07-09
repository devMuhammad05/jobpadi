// ── Theme toggle ──────────────────────────────────────────────
function toggleTheme() {
  var root = document.documentElement;
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  syncThemeUI();
}

function syncThemeUI() {
  var dark = document.documentElement.classList.contains('dark');
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  });
  document.querySelectorAll('[data-icon-sun]').forEach(function (e) { e.classList.toggle('hidden', !dark); });
  document.querySelectorAll('[data-icon-moon]').forEach(function (e) { e.classList.toggle('hidden', dark); });
}

// ── Mobile menu ───────────────────────────────────────────────
function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.querySelectorAll('[data-icon-menu]').forEach(function (e) { e.classList.toggle('hidden', open); });
    document.querySelectorAll('[data-icon-close]').forEach(function (e) { e.classList.toggle('hidden', !open); });
  }

  toggle.addEventListener('click', function () {
    setOpen(menu.classList.contains('hidden'));
  });

  // Close after tapping a link
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  // Close if the viewport grows to desktop so state can't get stuck
  window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
    if (e.matches) setOpen(false);
  });
}

// ── Parallax ──────────────────────────────────────────────────
// Drives a `--py` custom property on [data-parallax] elements so the
// offset composes with each element's own transform (fade-in, float,
// centring) instead of overwriting it. rAF-throttled, opt-out on
// reduced-motion.
function setupParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var els = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  var vh = window.innerHeight;
  var ticking = false;

  function update() {
    ticking = false;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      // Skip work when the element is well outside the viewport.
      if (rect.bottom < -vh || rect.top > vh * 2) continue;
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
      var offset = (rect.top + rect.height / 2) - vh / 2; // centre vs viewport centre
      el.style.setProperty('--py', (-offset * speed).toFixed(1) + 'px');
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; update(); });
  update();
}

// ── Pinned horizontal scroll (Testimonials) ───────────────────
// While the tall [data-hscroll] section is pinned, vertical scroll
// progress (0→1) drives the track's horizontal translation, so cards
// slide left and later ones are revealed. Section height is sized to
// the horizontal overflow for a ~1:1 scroll feel. Falls back to a
// static wrapping grid on reduced-motion (.hscroll-off).
function setupHorizontalScroll() {
  var section = document.querySelector('[data-hscroll]');
  if (!section) return;
  var pin = section.querySelector('[data-hscroll-pin]');
  var track = section.querySelector('[data-hscroll-track]');
  if (!pin || !track) return;
  var bar = section.querySelector('[data-hscroll-bar]');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var maxShift = 0;
  var ticking = false;

  function enabled() { return !reduce.matches; }

  function measure() {
    section.classList.toggle('hscroll-off', !enabled());
    if (!enabled()) {
      section.style.height = '';
      track.style.transform = '';
      if (bar) bar.style.width = '';
      return;
    }
    // Horizontal distance the track must travel = its overflow past the pin.
    maxShift = Math.max(track.scrollWidth - track.clientWidth, 0);
    // Give the section that much extra vertical scroll room beyond one viewport.
    section.style.height = (window.innerHeight + maxShift) + 'px';
    update();
  }

  function update() {
    ticking = false;
    if (!enabled()) return;
    var rect = section.getBoundingClientRect();
    var scrollable = section.offsetHeight - window.innerHeight;
    var progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
    track.style.transform = 'translate3d(' + (-progress * maxShift).toFixed(1) + 'px,0,0)';
    if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  reduce.addEventListener('change', measure);
  // Web fonts can change card widths after first paint; re-measure on load.
  window.addEventListener('load', measure);
  measure();
}

// ── Init ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();
syncThemeUI();
setupMobileMenu();
setupParallax();
setupHorizontalScroll();

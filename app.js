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

// ── Init ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();
syncThemeUI();
setupMobileMenu();
setupParallax();

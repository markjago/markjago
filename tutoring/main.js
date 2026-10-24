/* ============================================================
   Attic Philosophy Tutoring — main.js
   Vanilla JS: sticky nav state, mobile menu, form thank-you.
   ============================================================ */

(function () {
  'use strict';

  // -------- Nav scroll state + hero parallax --------
  const nav = document.getElementById('nav');
  const heroBg = document.getElementById('heroBg');
  const wmSections = document.querySelectorAll('[data-wm-parallax]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;

      // Sticky nav state
      if (y > 24) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');

      if (prefersReduced) return;

      // Hero parallax — translate bg upward at ~30% scroll speed.
      if (heroBg) {
        const py = Math.min(y, 900) * 0.30;
        heroBg.style.setProperty('--py', py + 'px');
      }

      // Section watermark parallax — translate centred watermark
      // relative to the section's own centre, so it drifts slowly as
      // the section moves through the viewport.
      wmSections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        // Skip if section is well outside viewport
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        // Distance from viewport centre to section centre (positive = section below centre)
        const distance = (rect.top + rect.height / 2) - vh / 2;
        // Translate watermark in the OPPOSITE direction so it appears to
        // lag behind the page — drifts up as you scroll down.
        const py = -distance * 0.15;
        sec.style.setProperty('--wm-py', py + 'px');
      });
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // -------- Mobile menu toggle --------
  const menuBtn = document.getElementById('navMenuBtn');
  const navLinks = document.getElementById('navLinks');

  function setMenu(open) {
    nav.classList.toggle('nav--menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  menuBtn.addEventListener('click', () => {
    const open = !nav.classList.contains('nav--menu-open');
    setMenu(open);
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setMenu(false));
  });

  // Close the mobile menu with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--menu-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // -------- Contact form (Web3Forms) --------
  const form = document.getElementById('contactForm');
  if (form) {
    const wrap = document.getElementById('contactWrap');
    const thanks = document.getElementById('contactThanks');
    const errorMsg = document.getElementById('contactError');
    const submitBtn = document.getElementById('contactSubmit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMsg.hidden = true;
      submitBtn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Send failed');
        wrap.classList.add('is-sent');
        thanks.setAttribute('tabindex', '-1');
        thanks.focus();
      } catch (err) {
        // Fallback address is assembled here so it is not in the page source.
        const fb = document.getElementById('contactFallback');
        if (fb && !fb.firstChild) {
          const addr = ['mark.jago', 'gmail.com'].join('@');
          const link = document.createElement('a');
          link.href = 'mailto:' + addr + '?subject=Tuition%20enquiry';
          link.textContent = addr;
          fb.append(', or email me at ', link);
        }
        errorMsg.hidden = false;
        submitBtn.disabled = false;
      }
    });
  }

})();

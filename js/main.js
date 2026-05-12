/**
 * DataDive Solutions — main.js
 *
 * Modules:
 *  1. faqAccordion   — Toggle FAQ items open/closed
 *  2. scrollReveal   — Animate elements into view on scroll
 *  3. navHighlight   — Mark active nav link on scroll (optional enhancement)
 *
 * All modules are initialised in the DOMContentLoaded callback at the bottom.
 */

'use strict';

/* ── 1. FAQ ACCORDION ─────────────────────────────────────── */

/**
 * Initialises the FAQ accordion behaviour.
 * Clicking a question opens it and closes any other open item.
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-q');

    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isAlreadyOpen = item.classList.contains('open');

      // Close all items
      faqItems.forEach((i) => i.classList.remove('open'));

      // If it wasn't open, open it now
      if (!isAlreadyOpen) {
        item.classList.add('open');
      }
    });
  });
}


/* ── 2. SCROLL REVEAL ─────────────────────────────────────── */

/**
 * Uses IntersectionObserver to add the `.visible` class to elements
 * that carry the `.reveal` class as they enter the viewport.
 *
 * The CSS handles the actual transition (see styles.css → .reveal / .reveal.visible).
 */
function initScrollReveal() {
  const REVEAL_SELECTOR = '.step, .service-card, .pkg, .testimonial, .trust-card';
  const REVEAL_CLASS     = 'reveal';
  const VISIBLE_CLASS    = 'visible';
  const THRESHOLD        = 0.1;

  const targets = document.querySelectorAll(REVEAL_SELECTOR);

  if (!targets.length) return;

  // Add the base class so CSS can handle the initial hidden state
  targets.forEach((el) => el.classList.add(REVEAL_CLASS));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(VISIBLE_CLASS);
          // Stop observing once visible — no need to re-trigger
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: THRESHOLD }
  );

  targets.forEach((el) => observer.observe(el));
}


/* ── 3. NAV HIGHLIGHT ─────────────────────────────────────── */

/**
 * Adds an `aria-current="page"` attribute (and optional CSS hook) to the
 * nav link whose section is currently in view.
 *
 * Relies on nav links using href="#section-id" anchors.
 */
function initNavHighlight() {
  const NAV_LINKS_SELECTOR = '.nav-links a[href^="#"]';
  const ACTIVE_CLASS        = 'nav-link--active';

  const navLinks = document.querySelectorAll(NAV_LINKS_SELECTOR);

  if (!navLinks.length) return;

  // Build a map of { sectionEl → navLink }
  const sectionMap = new Map();

  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href').slice(1);
    const section  = document.getElementById(targetId);
    if (section) sectionMap.set(section, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = sectionMap.get(entry.target);
        if (!link) return;

        if (entry.isIntersecting) {
          // Remove active from all, then set on the visible one
          navLinks.forEach((l) => {
            l.classList.remove(ACTIVE_CLASS);
            l.removeAttribute('aria-current');
          });
          link.classList.add(ACTIVE_CLASS);
          link.setAttribute('aria-current', 'page');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sectionMap.forEach((_, section) => observer.observe(section));
}


/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initScrollReveal();
  initNavHighlight();
});
class AplotionEngine {
  constructor() {
    this.raf = null;
    this.motions = [];
    this.scrollY = 0;
    this.ticking = false;

    this.prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.easing = {
      apple: (t) => 1 - Math.pow(1 - t, 3),
      soft: (t) => t * t * (3 - 2 * t),
      smooth: (t) => t * t * (3 - 2 * t),
      bounce: (t) =>
        t < 0.5
          ? (1 - Math.cos(Math.PI * t)) / 2
          : (1 + Math.cos(Math.PI * (t - 1))) / 2,
    };

    this.init();
  }

  init() {
    this.setupScroll();
    this.setupReveal();
    this.setupRAF();
    this.setupParallax();
    this.setupHover();
  }

  /* -----------------------------
   SCROLL ENGINE
  ----------------------------- */
  setupScroll() {
    window.addEventListener("scroll", () => {
      this.scrollY = window.scrollY;
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateScroll();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }

  updateScroll() {
    for (let fn of this.motions) fn(this.scrollY);
  }

  addScrollMotion(fn) {
    this.motions.push(fn);
  }

  /* -----------------------------
   REVEAL SYSTEM
  ----------------------------- */
  setupReveal() {
    if (this.prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll("[aplotion]").forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(40px) scale(0.98)";
      el.style.transition = "all 0.9s cubic-bezier(0.2,0.8,0.2,1)";
      el.style.transitionDelay = i * 0.03 + "s";
      observer.observe(el);
    });
  }

  reveal(el) {
    el.style.opacity = "1";
    el.style.transform = "translateY(0) scale(1)";
  }

  /* -----------------------------
   RAF ENGINE
  ----------------------------- */
  setupRAF() {
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /* -----------------------------
   SPRING PHYSICS
  ----------------------------- */
  spring(current, target, stiffness = 0.1, damping = 0.8) {
    let velocity = 0;

    return function step() {
      velocity += (target - current) * stiffness;
      velocity *= damping;
      current += velocity;
      return current;
    };
  }

  /* -----------------------------
   PARALLAX SYSTEM
  ----------------------------- */
  setupParallax() {
    const items = document.querySelectorAll("[aplotion-parallax]");

    this.addScrollMotion((y) => {
      items.forEach((el) => {
        const speed = parseFloat(el.dataset.speed || 0.2);
        el.style.transform = `translateY(${y * speed}px)`;
      });
    });
  }

  parallax(selector, speed = 0.2) {
    const el = document.querySelector(selector);
    if (!el) return;

    this.addScrollMotion((y) => {
      el.style.transform = `translateY(${y * speed}px)`;
    });
  }

  /* -----------------------------
   SMOOTH SCROLL
  ----------------------------- */
  smoothScroll() {
    document.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;

        e.preventDefault();

        window.scrollTo({
          top: target.offsetTop,
          behavior: "smooth",
        });
      });
    });
  }

  /* -----------------------------
   HOVER SYSTEM
  ----------------------------- */
  setupHover() {
    document.querySelectorAll("[aplotion-hover]").forEach((el) => {
      el.style.transition = "transform 0.25s cubic-bezier(0.2,0.8,0.2,1)";

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.04)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });
    });
  }

  hover(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.05)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });
    });
  }

  /* -----------------------------
   FADE SYSTEM
  ----------------------------- */
  fadeIn(el, delay = 0) {
    if (!el || this.prefersReducedMotion) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `all 0.8s cubic-bezier(0.2,0.8,0.2,1) ${delay}s`;

    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }

  fadeOut(el) {
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
  }

  /* -----------------------------
   SCALE SYSTEM
  ----------------------------- */
  scale(el, value = 1.05) {
    if (!el) return;

    el.addEventListener("mouseenter", () => {
      el.style.transform = `scale(${value})`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "scale(1)";
    });
  }

  /* -----------------------------
   DRAG SYSTEM (LIGHTWEIGHT)
  ----------------------------- */
  drag(el) {
    const node = document.querySelector(el);
    if (!node) return;

    let isDown = false;
    let startX, startY;

    node.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      isDown = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      node.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }

  /* -----------------------------
   TIMELINE SYSTEM
  ----------------------------- */
  timeline() {
    const steps = [];

    return {
      to: (el, props, duration = 600) => {
        steps.push({ el, props, duration });
        return this.timeline();
      },
      play: async () => {
        for (let step of steps) {
          await this.animate(step.el, step.props, step.duration);
        }
      },
    };
  }

  animate(el, props, duration) {
    return new Promise((resolve) => {
      const start = performance.now();
      const initial = {};

      for (let key in props) {
        initial[key] = parseFloat(getComputedStyle(el)[key]) || 0;
      }

      const frame = (t) => {
        const progress = Math.min((t - start) / duration, 1);
        const eased = this.easing.apple(progress);

        for (let key in props) {
          const from = initial[key];
          const to = props[key];
          el.style[key] = from + (to - from) * eased + "px";
        }

        if (progress < 1) requestAnimationFrame(frame);
        else resolve();
      };

      requestAnimationFrame(frame);
    });
  }

  /* -----------------------------
   GLASS EFFECT HELPERS
  ----------------------------- */
  glass(el) {
    const node = document.querySelector(el);
    if (!node) return;

    node.style.backdropFilter = "blur(20px)";
    node.style.background = "rgba(255,255,255,0.06)";
    node.style.border = "1px solid rgba(255,255,255,0.1)";
  }

  /* -----------------------------
   UTIL
  ----------------------------- */
  destroy() {
    cancelAnimationFrame(this.raf);
    this.motions = [];
  }
}

window.AplotionEngine = AplotionEngine;
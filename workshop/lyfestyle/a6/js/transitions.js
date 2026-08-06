(function initA6Transitions() {
  const body = document.body;
  if (!body) return;
  const CROSS_BRAND_WELCOME_KEY = 'cross-brand-welcome';
  const ARRIVAL_WELCOME_MS = 4200;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowPower = navigator.connection && navigator.connection.saveData;
  const isTouchDevice = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isTabletOrMobile = window.matchMedia && window.matchMedia('(max-width: 1024px)').matches;

  const supportsAnimations = !reduceMotion && !isLowPower;
  const PLAIN_TRANSITION_MS = isTouchDevice ? 120 : 220;

  const initCrazyMotion = () => {
    if (!supportsAnimations || isTouchDevice || isTabletOrMobile) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    const revealSelector = [
      '.hero .container > *',
      '.section .container > *',
      '.card',
      '.stat-box',
      '.product-wrap > *',
      '.form > *',
      '.cart-wrap > *',
      '.cart-table tr',
      '.checkout-pref > *',
      '.cart-summary > *',
      '#product-detail > *',
      '#product-grid > *',
      '#featured-products > *'
    ].join(',');

    const applyRevealTargets = (root = document) => {
      const targets = root.querySelectorAll(revealSelector);
      let localIndex = 0;
      const isShopPage = /\/a6\/shop(\.html)?$/i.test(window.location.pathname);

      targets.forEach((element) => {
        if (element.closest('nav')) return;
        if (isShopPage && element.closest('#product-grid')) {
          element.classList.add('is-visible');
          return;
        }
        if (element.dataset.a6RevealBound === 'true') return;

        element.dataset.a6RevealBound = 'true';
        element.classList.add('a6-reveal');
        element.style.transitionDelay = `${Math.min(localIndex * 40, 420)}ms`;
        revealObserver.observe(element);
        localIndex += 1;
      });
    };

    const bindInteractiveTargets = (root = document) => {
      root.querySelectorAll('.btn').forEach((button) => {
        if (button.dataset.a6MagneticBound === 'true') return;
        button.dataset.a6MagneticBound = 'true';

        button.addEventListener('mousemove', (event) => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
          button.style.transform = `translate(${x * 8}px, ${y * 7}px) scale(1.045)`;
        });

        button.addEventListener('mouseleave', () => {
          button.style.transform = '';
        });
      });

      root.querySelectorAll('.card').forEach((card) => {
        if (card.dataset.a6TiltBound === 'true') return;
        card.dataset.a6TiltBound = 'true';

        card.addEventListener('mousemove', (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          const rotateY = (x - 0.5) * 12;
          const rotateX = (0.5 - y) * 10;
          card.style.transform = `translateY(-9px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    };

    applyRevealTargets(document);
    bindInteractiveTargets(document);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          applyRevealTargets(node);
          bindInteractiveTargets(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  };

  const bindPlainPageTransitions = () => {
    if (!supportsAnimations) {
      body.classList.add('a6-page-ready');
      return;
    }

    body.classList.add('a6-page-entering');
    window.setTimeout(() => {
      body.classList.remove('a6-page-entering');
      body.classList.add('a6-page-ready');
    }, 350);

    const shouldIntercept = (anchor, event) => {
      if (!anchor || event.defaultPrevented) return false;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      if (anchor.target && anchor.target.toLowerCase() === '_blank') return false;
      if (anchor.hasAttribute('download')) return false;

      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;

      const isSwitchLink = href === '../index.html';
      if (isSwitchLink) return false;

      let destination;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return false;
      }

      if (destination.origin !== window.location.origin) return false;

      const sameDocumentNavigation =
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash;

      return !sameDocumentNavigation;
    };

    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a');
      if (!shouldIntercept(anchor, event)) return;

      event.preventDefault();
      body.classList.remove('a6-page-entering');
      body.classList.add('a6-page-leaving');

      window.setTimeout(() => {
        window.location.href = anchor.href;
      }, PLAIN_TRANSITION_MS);
    }, true);

    window.addEventListener('pageshow', () => {
      body.classList.remove('a6-page-leaving');
      body.classList.remove('a6-page-entering');
      body.classList.add('a6-page-ready');
    });
  };

  const bindHeaderSimplicityTransition = () => {

    const selector = 'nav .nav-links a[href="../index.html"], nav ul a[href="../index.html"], .nav-dropdown a[href="../index.html"]';
    document.querySelectorAll(selector).forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        if (event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const targetUrl = anchor.href;
        if (!targetUrl) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        sessionStorage.setItem(CROSS_BRAND_WELCOME_KEY, 'SIMPLICITY CREATIONS');

        window.setTimeout(() => {
          window.location.href = targetUrl;
        }, 40);
      });
    });
  };

  const initMobileNav = () => {
    const nav = document.querySelector('nav');
    const navInner = nav?.querySelector('.nav-inner');
    const navLinks = navInner?.querySelector('.nav-links');
    if (!nav || !navInner || !navLinks) return;
    if (navInner.querySelector('.hamburger-menu')) return;

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.type = 'button';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.innerHTML = '<span></span><span></span><span></span>';

    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';

    Array.from(navLinks.children).forEach((node) => {
      const clone = node.cloneNode(true);
      if (clone.matches && clone.matches('#mode-toggle')) {
        clone.id = 'mode-toggle-mobile';
      }
      dropdown.appendChild(clone);
    });

    navInner.appendChild(hamburger);
    nav.appendChild(dropdown);

    const closeMenu = () => {
      hamburger.classList.remove('active');
      dropdown.classList.remove('active');
    };

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      dropdown.classList.toggle('active');
    });

    dropdown.querySelectorAll('a').forEach((anchor) => {
      anchor.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.classList.contains('active')) return;
      const clickedInsideNav = nav.contains(event.target);
      if (!clickedInsideNav) closeMenu();
    });

    const desktopToggle = document.getElementById('mode-toggle');
    const mobileToggle = document.getElementById('mode-toggle-mobile');
    if (desktopToggle && mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        desktopToggle.click();
        closeMenu();
      });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) closeMenu();
    });
  };

  const isA6HomePage = () => {
    const path = window.location.pathname.toLowerCase();
    return /\/a6\/(index\.html)?$/.test(path) || path.endsWith('/a6/');
  };

  const showArrivalWelcomeIfNeeded = () => {
    const pendingWelcome = sessionStorage.getItem(CROSS_BRAND_WELCOME_KEY);
    if (!pendingWelcome) return;
    if (!isA6HomePage() || pendingWelcome !== 'A6 AUDIO') return;

    const overlay = document.createElement('div');
    overlay.className = 'a6-intro-overlay a6-arrival-overlay';
    overlay.innerHTML = `
      <div class="a6-intro-screen"></div>
      <div class="a6-intro-copy">
        <p>WELCOME TO</p>
        <h2>A6 AUDIO</h2>
      </div>
    `;

    document.body.appendChild(overlay);

    window.requestAnimationFrame(() => {
      overlay.classList.add('show-copy');
    });

    window.setTimeout(() => {
      overlay.remove();
      sessionStorage.removeItem(CROSS_BRAND_WELCOME_KEY);
    }, ARRIVAL_WELCOME_MS);
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    bindPlainPageTransitions();
    bindHeaderSimplicityTransition();
    showArrivalWelcomeIfNeeded();
    initCrazyMotion();
  });
})();

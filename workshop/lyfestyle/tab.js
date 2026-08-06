/*!
 * -------------------------------------------------------------
 * Drop-in usage: just add this one line before </body>
 *
 *   <script src="js/tab.js"></script>
 * 
 * Optional: override any default before this file loads with:
 *
 *   <script>
 *     window.TAB_JS_CONFIG = {
 *       links: [ { label:'HOME', href:'index.html', icon:'home' }, ... ],
 *       idleDelay: 5000
 *     };
 *   </script>
 *   <script src="js/tab.js"></script>
 * -------------------------------------------------------------
 */
(function () {
  'use strict';
  var DEFAULTS = {
    logo: 'images/logos/logo.png.png',
    logoAlt: 'Simplicity Creations',
    homeHref: 'index.html',
    cartHref: 'cart.html',
    idleDelay: 4500,           /* ms of inactivity before the bar fades away   */
    transitionDuration: 620,   /* ms the flash-sweep plays before navigating   */
    mobileBreakpoint: 900,     /* px — below this, hamburger/dropdown is used  */
    links: [
      { label: 'HOME',                 href: 'index.html',                icon: 'home'    },
      { label: 'SHOP',                 href: 'shop.html',                 icon: 'shop'    },
      { label: 'OUR WORK',             href: 'our-work.html',             icon: 'work'    },
      { label: 'STORES',               href: 'locations.html',            icon: 'stores'  },
      { label: 'INSTALLATION SUPPORT', href: 'installation-support.html', icon: 'support' },
      { label: 'ABOUT US',             href: 'index.html#about-us',       icon: 'about'   }
    ]
  };

  var config = mergeConfig(DEFAULTS, window.TAB_JS_CONFIG || {});

  function mergeConfig(base, override) {
    var out = {}, k;
    for (k in base) out[k] = base[k];
    for (k in override) out[k] = override[k];
    return out;
  }

  /* ======================================================
     2. ICONS — hand-drawn line SVGs, no external dependency
  ====================================================== */
  var ICONS = {
    home:    '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>',
    shop:    '<path d="M6 8h12l1 12.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    work:    '<path d="m9.4 11.6-5 5a2 2 0 0 0 2.9 2.9l5-5"/><path d="M13.8 5.9a3.6 3.6 0 0 0 4.9 4.9l-1.9 1.9-4.9-4.9 1.9-1.9Z"/><path d="M11 8.8 15.2 13"/>',
    stores:  '<path d="M12 21.2s7-7.3 7-12.3a7 7 0 1 0-14 0c0 5 7 12.3 7 12.3Z"/><circle cx="12" cy="8.9" r="2.6"/>',
    support: '<path d="M4.5 13.5v-1.7a7.5 7.5 0 0 1 15 0v1.7"/><rect x="3" y="13" width="4" height="6.2" rx="1.4"/><rect x="17" y="13" width="4" height="6.2" rx="1.4"/><path d="M20 19.2v.6a2.8 2.8 0 0 1-2.8 2.8H14.7"/>',
    about:   '<circle cx="12" cy="12" r="9"/><line x1="12" y1="10.7" x2="12" y2="16.3"/><circle cx="12" cy="7.6" r="1" fill="currentColor" stroke="none"/>',
    cart:    '<path d="M6 8h12l1 12.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    sun:     '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2.5" x2="12" y2="5.3"/><line x1="12" y1="18.7" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5.3" y2="12"/><line x1="18.7" y1="12" x2="21.5" y2="12"/><line x1="4.9" y1="4.9" x2="6.9" y2="6.9"/><line x1="17.1" y1="17.1" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.9" y2="17.1"/><line x1="17.1" y1="6.9" x2="19.1" y2="4.9"/>',
    moon:    '<path d="M20 14.4A8.5 8.5 0 1 1 9.6 4a7 7 0 0 0 10.4 10.4Z"/>'
  };

  function svgIcon(name, extraClass) {
    var d = ICONS[name] || '';
    return '<svg class="tabjs-svg' + (extraClass ? ' ' + extraClass : '') +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* ======================================================
     3. STYLES — fully self-contained, namespaced under tabjs-
  ====================================================== */
  function injectStyles() {
    if (document.getElementById('tabjs-styles')) return;
    var css = '' +
    '#tabjs-nav{--tabjs-bg:rgba(5,5,5,.68);--tabjs-border:rgba(255,255,255,.1);--tabjs-text:#fff;' +
    '--tabjs-dim:rgba(255,255,255,.55);--tabjs-accent:#8a2be2;--tabjs-accent2:#00a8cc;' +
    '--tabjs-panel:rgba(5,5,5,.97);position:fixed;top:0;left:0;right:0;height:92px;z-index:3000;' +
    'display:flex;align-items:center;justify-content:space-between;padding:0 6%;' +
    'background:var(--tabjs-bg);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);' +
    'border-bottom:1px solid var(--tabjs-border);font-family:"Inter",system-ui,-apple-system,sans-serif;' +
    'transition:transform .55s cubic-bezier(.22,1,.36,1),opacity .5s ease,box-shadow .4s ease;}' +

    'body.light-mode #tabjs-nav{--tabjs-bg:rgba(245,245,245,.82);--tabjs-border:rgba(0,0,0,.12);' +
    '--tabjs-text:#161616;--tabjs-dim:rgba(0,0,0,.55);--tabjs-panel:rgba(250,250,250,.98);}' +

    '#tabjs-nav.tabjs-idle{transform:translateY(-115%);opacity:0;pointer-events:none;}' +
    '#tabjs-nav.tabjs-scrolled{box-shadow:0 12px 30px rgba(0,0,0,.35);}' +

    '.tabjs-logo-link{display:flex;align-items:center;flex-shrink:0;}' +
    '.tabjs-logo{height:50px;width:auto;display:block;}' +

    '.tabjs-links-desktop{list-style:none;display:flex;align-items:center;gap:6px;margin:0;padding:0;}' +
    '.tabjs-link{position:relative;display:flex;align-items:center;gap:8px;color:var(--tabjs-text);' +
    'text-decoration:none;font-weight:700;font-size:.72rem;letter-spacing:1.4px;text-transform:uppercase;' +
    'padding:10px 14px;border-radius:10px;transition:color .25s ease,background .25s ease;}' +
    '.tabjs-link .tabjs-svg{width:16px;height:16px;flex-shrink:0;opacity:.85;transition:opacity .25s ease,transform .3s ease;}' +
    '.tabjs-link:hover{color:var(--tabjs-accent2);background:rgba(138,43,226,.08);}' +
    '.tabjs-link:hover .tabjs-svg{opacity:1;transform:translateY(-1px);}' +
    '.tabjs-link.tabjs-active{color:#fff;background:linear-gradient(120deg,rgba(138,43,226,.28),rgba(0,168,204,.16));}' +
    'body.light-mode .tabjs-link.tabjs-active{color:#111;}' +
    '.tabjs-link.tabjs-active::after{content:"";position:absolute;left:14px;right:14px;bottom:4px;height:2px;' +
    'border-radius:2px;background:linear-gradient(90deg,var(--tabjs-accent),var(--tabjs-accent2));}' +

    '.tabjs-cart-link{position:relative;display:flex;align-items:center;justify-content:center;' +
    'width:38px;height:38px;border-radius:10px;color:var(--tabjs-text);text-decoration:none;transition:background .25s ease,color .25s ease;}' +
    '.tabjs-cart-link:hover{color:var(--tabjs-accent2);background:rgba(138,43,226,.08);}' +
    '.tabjs-cart-link .tabjs-svg{width:19px;height:19px;}' +
    '.tabjs-cart-count{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;' +
    'border-radius:8px;background:var(--tabjs-accent);color:#fff;font-size:.62rem;font-weight:900;' +
    'display:flex;align-items:center;justify-content:center;transform:scale(0);transition:transform .25s cubic-bezier(.34,1.56,.64,1);}' +
    '.tabjs-cart-count.tabjs-visible{transform:scale(1);}' +

    '.tabjs-theme-toggle{display:flex;align-items:center;justify-content:center;width:38px;height:38px;' +
    'border-radius:10px;border:1px solid var(--tabjs-border);background:transparent;color:var(--tabjs-text);' +
    'cursor:pointer;transition:background .25s ease,border-color .25s ease,transform .3s ease;}' +
    '.tabjs-theme-toggle:hover{border-color:var(--tabjs-accent);transform:rotate(-8deg);}' +
    '.tabjs-theme-toggle .tabjs-svg{width:17px;height:17px;}' +
    '.tabjs-icon-moon{display:none;}' +
    'body.light-mode .tabjs-icon-sun{display:none;}' +
    'body.light-mode .tabjs-icon-moon{display:block;}' +

    '.tabjs-right{display:flex;align-items:center;gap:10px;}' +

    '.tabjs-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;' +
    'width:34px;height:34px;background:none;border:none;cursor:pointer;z-index:3002;padding:0;}' +
    '.tabjs-hamburger span{display:block;width:24px;height:2px;background:var(--tabjs-text);border-radius:2px;' +
    'transition:transform .3s ease,opacity .3s ease;}' +
    '.tabjs-hamburger.tabjs-active span:nth-child(1){transform:translateY(7px) rotate(45deg);}' +
    '.tabjs-hamburger.tabjs-active span:nth-child(2){opacity:0;}' +
    '.tabjs-hamburger.tabjs-active span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}' +

    '.tabjs-dropdown{display:none;position:fixed;top:0;right:0;bottom:0;width:min(84vw,360px);' +
    'background:var(--tabjs-panel);backdrop-filter:blur(20px);border-left:1px solid var(--tabjs-border);' +
    'padding:110px 26px 40px;flex-direction:column;gap:4px;z-index:3001;' +
    'transform:translateX(100%);transition:transform .45s cubic-bezier(.22,1,.36,1);overflow-y:auto;}' +
    '.tabjs-dropdown.tabjs-open{display:flex;transform:translateX(0);}' +
    '.tabjs-dropdown .tabjs-link{width:100%;padding:14px 12px;font-size:.78rem;}' +
    '.tabjs-dropdown .tabjs-divider{height:1px;background:var(--tabjs-border);margin:12px 0;}' +
    '.tabjs-dropdown .tabjs-row{display:flex;align-items:center;gap:14px;}' +
    '.tabjs-dropdown .tabjs-cart-link,.tabjs-dropdown .tabjs-theme-toggle{width:auto;height:auto;' +
    'padding:12px;border:1px solid var(--tabjs-border);border-radius:10px;flex:1;justify-content:flex-start;gap:10px;}' +
    '.tabjs-dropdown .tabjs-cart-link .tabjs-cart-count{position:static;transform:scale(1);margin-left:auto;}' +
    '.tabjs-dropdown .tabjs-cart-count{transform:scale(1);}' +

    '#tabjs-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:2999;}' +
    '#tabjs-backdrop.tabjs-open{display:block;}' +

    '@media (max-width:' + config.mobileBreakpoint + 'px){' +
      '#tabjs-nav{height:74px;padding:0 18px;}' +
      '.tabjs-logo{height:36px;}' +
      '.tabjs-links-desktop{display:none;}' +
      '.tabjs-hamburger{display:flex;}' +
      '.tabjs-right .tabjs-cart-link,.tabjs-right .tabjs-theme-toggle{width:34px;height:34px;}' +
    '}' +

    /* flash-sweep transition overlay */
    '#tabjs-transition{position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden;}' +
    '#tabjs-transition .tabjs-veil{position:absolute;inset:0;background:#020202;opacity:0;transition:opacity .5s ease;}' +
    'body.light-mode #tabjs-transition .tabjs-veil{background:#f5f5f5;}' +
    '#tabjs-transition .tabjs-bar{position:absolute;top:0;bottom:0;width:38%;opacity:0;' +
    'background:linear-gradient(100deg,transparent 0%,rgba(0,168,204,.0) 20%,rgba(0,168,204,.85) 42%,' +
    '#fff 50%,rgba(138,43,226,.9) 58%,transparent 80%,transparent 100%);filter:blur(1px);' +
    'transform:translateX(-160%) skewX(-14deg);}' +
    '#tabjs-transition.tabjs-active .tabjs-veil{opacity:.92;}' +
    '#tabjs-transition.tabjs-active .tabjs-bar{opacity:1;animation:tabjsSweep ' + config.transitionDuration + 'ms cubic-bezier(.65,0,.2,1) forwards;}' +
    '@keyframes tabjsSweep{0%{transform:translateX(-160%) skewX(-14deg);}55%{transform:translateX(60%) skewX(-14deg);}' +
    '100%{transform:translateX(260%) skewX(-14deg);}}' +
    'body.tabjs-leaving{filter:brightness(.55) blur(3px);transition:filter ' + Math.max(config.transitionDuration - 120, 200) + 'ms ease;}';

    var style = document.createElement('style');
    style.id = 'tabjs-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ======================================================
     4. MARKUP
  ====================================================== */
  function buildLinkHTML(link, isDropdown) {
    var active = isLinkActive(link) ? ' tabjs-active' : '';
    return '<a href="' + link.href + '" class="tabjs-link' + active + '" data-tabjs-link>' +
      svgIcon(link.icon) +
      '<span class="tabjs-label">' + link.label + '</span>' +
    '</a>';
  }

  function themeToggleHTML(idSuffix) {
    return '<button type="button" class="tabjs-theme-toggle" id="tabjs-theme-toggle' + idSuffix +
      '" aria-label="Toggle dark mode">' +
      svgIcon('sun', 'tabjs-icon-sun') + svgIcon('moon', 'tabjs-icon-moon') +
    '</button>';
  }

  function cartLinkHTML(isDropdown) {
    var count = '<span class="tabjs-cart-count" data-tabjs-cart-count>0</span>';
    if (isDropdown) {
      return '<a href="' + config.cartHref + '" class="tabjs-cart-link" data-tabjs-link>' +
        svgIcon('cart') + '<span class="tabjs-label">CART</span>' + count + '</a>';
    }
    return '<a href="' + config.cartHref + '" class="tabjs-cart-link" data-tabjs-link aria-label="View cart">' +
      svgIcon('cart') + count + '</a>';
  }

  function buildNav() {
    var desktopLinks = config.links.map(function (l) { return buildLinkHTML(l, false); }).join('');
    var dropdownLinks = config.links.map(function (l) { return buildLinkHTML(l, true); }).join('');

    var nav = document.createElement('nav');
    nav.id = 'tabjs-nav';
    nav.innerHTML =
      '<a href="' + config.homeHref + '" class="tabjs-logo-link" data-tabjs-link>' +
        '<img src="' + config.logo + '" alt="' + config.logoAlt + '" class="tabjs-logo">' +
      '</a>' +
      '<ul class="tabjs-links-desktop">' + desktopLinks + '</ul>' +
      '<div class="tabjs-right">' +
        cartLinkHTML(false) +
        themeToggleHTML('') +
        '<button type="button" class="tabjs-hamburger" aria-label="Open navigation menu" aria-expanded="false">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>';

    var backdrop = document.createElement('button');
    backdrop.id = 'tabjs-backdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Close menu');

    var dropdown = document.createElement('div');
    dropdown.className = 'tabjs-dropdown';
    dropdown.innerHTML =
      dropdownLinks +
      '<div class="tabjs-divider"></div>' +
      '<div class="tabjs-row">' + cartLinkHTML(true) + themeToggleHTML('-mobile') + '</div>';

    var transition = document.createElement('div');
    transition.id = 'tabjs-transition';
    transition.setAttribute('aria-hidden', 'true');
    transition.innerHTML = '<div class="tabjs-veil"></div><div class="tabjs-bar"></div>';

    /* remove any pre-existing hand-written nav so tab.js is the single source of truth */
    var existingNav = document.querySelector('body > nav');
    if (existingNav) existingNav.parentNode.removeChild(existingNav);

    document.body.insertBefore(nav, document.body.firstChild);
    document.body.appendChild(backdrop);
    document.body.appendChild(dropdown);
    document.body.appendChild(transition);

    return { nav: nav, dropdown: dropdown, backdrop: backdrop, transition: transition };
  }

  /* ======================================================
     5. ACTIVE TAB DETECTION
  ====================================================== */
  function currentFile() {
    var p = window.location.pathname.split('/').pop();
    return p || 'index.html';
  }

  function isLinkActive(link) {
    var parts = link.href.split('#');
    var file = parts[0] || 'index.html';
    var hash = parts[1] || '';
    var curFile = currentFile();
    var curHash = window.location.hash.replace('#', '');

    if (hash) return curFile === file && curHash === hash;
    if (file === 'index.html') return (curFile === 'index.html' || curFile === '') && !curHash;
    return curFile === file;
  }

  /* ======================================================
     6. THEME (shares localStorage keys with the rest of the site)
  ====================================================== */
  var THEME_KEY = 'darkMode';
  var SHARED_THEME_KEY = 'site-theme';

  function applyStoredTheme() {
    var shared = localStorage.getItem(SHARED_THEME_KEY);
    var legacy = localStorage.getItem(THEME_KEY);
    var isDark = shared ? shared === 'dark' : (legacy ? JSON.parse(legacy) : false);
    document.body.classList.toggle('light-mode', !isDark);
  }

  function toggleTheme() {
    document.body.classList.toggle('light-mode');
    var isDark = !document.body.classList.contains('light-mode');
    localStorage.setItem(THEME_KEY, JSON.stringify(isDark));
    localStorage.setItem(SHARED_THEME_KEY, isDark ? 'dark' : 'light');
  }

  /* ======================================================
     7. CART BADGE
  ====================================================== */
  function refreshCartCount() {
    var n = 0;
    try {
      var cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (Array.isArray(cart)) {
        for (var i = 0; i < cart.length; i++) n += Number(cart[i].qty) || 1;
      }
    } catch (e) { n = 0; }

    var badges = document.querySelectorAll('[data-tabjs-cart-count], #cart-count, .cart-count-badge');
    for (var j = 0; j < badges.length; j++) {
      badges[j].textContent = n;
      badges[j].classList.toggle('tabjs-visible', n > 0);
    }
  }

  function patchLocalStorageForCart() {
    if (localStorage.__tabjsPatched) return;
    var originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);
      if (key === 'cart') refreshCartCount();
    };
    localStorage.__tabjsPatched = true;
  }

  /* ======================================================
     8. IDLE FADE
  ====================================================== */
  var idleTimer = null;
  var navPaused = false;

  function scheduleIdle(nav) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (navPaused) return;
      nav.classList.add('tabjs-idle');
    }, config.idleDelay);
  }

  function wake(nav) {
    nav.classList.remove('tabjs-idle');
    scheduleIdle(nav);
  }

  function bindIdleFade(nav) {
    var activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    activityEvents.forEach(function (evt) {
      window.addEventListener(evt, function () { wake(nav); }, { passive: true });
    });

    nav.addEventListener('mouseenter', function () { navPaused = true; wake(nav); });
    nav.addEventListener('mouseleave', function () { navPaused = false; scheduleIdle(nav); });
    nav.addEventListener('focusin', function () { navPaused = true; wake(nav); });
    nav.addEventListener('focusout', function () { navPaused = false; scheduleIdle(nav); });

    window.addEventListener('scroll', function () {
      nav.classList.toggle('tabjs-scrolled', window.scrollY > 20);
      wake(nav);
    }, { passive: true });

    scheduleIdle(nav);
  }

  /* ======================================================
     9. MOBILE MENU
  ====================================================== */
  function bindMobileMenu(refs) {
    var hamburger = refs.nav.querySelector('.tabjs-hamburger');

    function openMenu() {
      hamburger.classList.add('tabjs-active');
      hamburger.setAttribute('aria-expanded', 'true');
      refs.dropdown.classList.add('tabjs-open');
      refs.backdrop.classList.add('tabjs-open');
      navPaused = true;
      wake(refs.nav);
    }

    function closeMenu() {
      hamburger.classList.remove('tabjs-active');
      hamburger.setAttribute('aria-expanded', 'false');
      refs.dropdown.classList.remove('tabjs-open');
      refs.backdrop.classList.remove('tabjs-open');
      navPaused = false;
      scheduleIdle(refs.nav);
    }

    hamburger.addEventListener('click', function () {
      refs.dropdown.classList.contains('tabjs-open') ? closeMenu() : openMenu();
    });
    refs.backdrop.addEventListener('click', closeMenu);

    window.addEventListener('resize', function () {
      if (window.innerWidth > config.mobileBreakpoint) closeMenu();
    });

    return closeMenu;
  }

  /* ======================================================
     10. FLASH-SWEEP TRANSITION + LINK ROUTING
  ====================================================== */
  function isExternal(href) {
    return /^([a-z]+:)?\/\//i.test(href) || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0;
  }

  function playTransition(transitionEl, href) {
    transitionEl.classList.add('tabjs-active');
    document.body.classList.add('tabjs-leaving');
    setTimeout(function () {
      window.location.href = href;
    }, config.transitionDuration);
  }

  function bindLinks(refs, closeMenu) {
    var links = document.querySelectorAll('[data-tabjs-link]');
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || isExternal(href) || a.target === '_blank') return;

        e.preventDefault();
        closeMenu();

        var parts = href.split('#');
        var file = parts[0] || 'index.html';
        var hash = parts[1];
        var samePage = file === currentFile() || (file === '' && currentFile() === 'index.html');

        if (samePage && hash) {
          var target = document.getElementById(hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', '#' + hash);
            return;
          }
        }
        playTransition(refs.transition, href);
      });
    });
  }

  /* ======================================================
     11. INIT
  ====================================================== */
  function init() {
    injectStyles();
    var refs = buildNav();
    var closeMenu = bindMobileMenu(refs);
    bindLinks(refs, closeMenu);
    bindIdleFade(refs.nav);

    applyStoredTheme();
    document.querySelectorAll('.tabjs-theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    patchLocalStorageForCart();
    refreshCartCount();
    window.addEventListener('storage', function (e) {
      if (e.key === 'cart') refreshCartCount();
    });
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
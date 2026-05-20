(() => {
    console.clear();

    const G = 'color: #0f0; font-family: monospace; font-size: 14px;';
    const B = 'color: #0f0; font-family: monospace; font-size: 20px; font-weight: bold;';
    const C = 'color: #0ff; font-family: monospace; font-weight: bold;';

    console.log(`%c
    ╔══════════════════════════════════════╗
    ║     █▀▀█ █▀▀▄ █▀▀ █▀▀▄ █▀▀█ █▀▀█    ║
    ║     █░░█ █░░█ █▀▀ █░░█ █░░█ █▄▄▀    ║
    ║     ▀▀▀▀ ▀▀▀░ ▀░░ ▀░░▀ ▀▀▀▀ ▀░▀▀    ║
    ║                                      ║
    ║     █▀▀█ █▀▀ █▀▀█ █▀▀▀ █▀▀▀ █▀▀█    ║
    ║     █░░█ █▀▀ █▄▄▀ █░▀█ █░▀█ █▄▄▀    ║
    ║     ▀▀▀▀ ▀░░ ▀░▀▀ ▀▀▀▀ ▀▀▀▀ ▀░▀▀    ║
    ╚══════════════════════════════════════╝%c`, B, '');

    console.log(`%c
    ┌──────────────────────────────────────┐
    │  🔍  PDF SNIFFER v2.0  -  ACTIVE     │
    │  📡  Monitoring ALL PDF loads...      │
    │  ⏳  Running until tab is closed      │
    └──────────────────────────────────────┘%c`, G, '');

    console.log(`%c    ⚡ Waiting for PDFs... ⚡%c\n`, 'color: #ff0; font-family: monospace;', '');

    const logPDF = (url) => {
        console.log(`%c
    ╔══════════════════════════════════════════════╗
    ║           📄  PDF DETECTED  📄               ║
    ╠══════════════════════════════════════════════╣
    ║  ${url}%c`, C, '');
        const pad = url.length < 46 ? ' '.repeat(46 - url.length) : '';
        console.log(`%c    ║${pad}║
    ╚══════════════════════════════════════════════╝%c`, C, '');
    };

    // Method 1: Hook fetch
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        if (url.toLowerCase().includes('.pdf')) logPDF(url);
        return origFetch.apply(this, args);
    };

    // Method 2: Hook XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url.toLowerCase().includes('.pdf')) logPDF(url);
        return origOpen.apply(this, arguments);
    };

    // Method 3: Intercept all link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link && link.href.toLowerCase().includes('.pdf')) {
            logPDF(link.href);
        }
    }, true);

    // Method 4: Intercept iframe loads
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IFRAME' && node.src?.toLowerCase().includes('.pdf')) {
                    logPDF(node.src);
                }
                if (node.tagName === 'OBJECT' && node.data?.toLowerCase().includes('.pdf')) {
                    logPDF(node.data);
                }
                if (node.tagName === 'EMBED' && node.src?.toLowerCase().includes('.pdf')) {
                    logPDF(node.src);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Method 5: Check current page URL
    if (window.location.href.toLowerCase().includes('.pdf')) {
        logPDF(window.location.href);
    }

    // Method 6: Monitor window.location changes (for SPAs)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            if (currentUrl.toLowerCase().includes('.pdf')) {
                logPDF(currentUrl);
            }
        }
    }).observe(document, { subtree: true, childList: true });

    // Method 7: Hook pushState and replaceState
    const origPush = history.pushState;
    history.pushState = function(...args) {
        const url = args[2];
        if (url && url.toString().toLowerCase().includes('.pdf')) logPDF(url.toString());
        return origPush.apply(this, args);
    };
    const origReplace = history.replaceState;
    history.replaceState = function(...args) {
        const url = args[2];
        if (url && url.toString().toLowerCase().includes('.pdf')) logPDF(url.toString());
        return origReplace.apply(this, args);
    };

    // Method 8: Hook window.open
    const origOpen2 = window.open;
    window.open = function(url, ...args) {
        if (url && url.toString().toLowerCase().includes('.pdf')) logPDF(url.toString());
        return origOpen2.call(this, url, ...args);
    };

})();
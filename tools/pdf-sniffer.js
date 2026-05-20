(() => {
    // --- BLOCK EXTERNAL NOISE ---
    const block = ['log', 'info', 'warn', 'error'];
    block.forEach(m => {
        const orig = console[m];
        console[m] = function(...args) {
            const stack = new Error().stack || '';
            if (!stack.includes('pdf-sniffer')) return;
            orig.apply(console, args);
        };
    });

    console.clear();

    // --- STYLING ---
    const R = 'color: #f00; font-family: monospace; font-weight: bold;';
    const W = 'color: #fff; font-family: monospace;';
    const G = 'color: #0f0; font-family: monospace;';
    const C = 'color: #0ff; font-family: monospace; font-weight: bold;';

    // --- INTRO ---
    console.log(`%c${'||'.repeat(40)}`, R);
    console.log(`%c${'||'.repeat(40)}`, R);
    console.log(`%c  ${' '.repeat(10)}PDF SNIFFER v3.0 - RED TEAM EDITION`, 'color: #fff; background: #f00; font-family: monospace; font-size: 16px; padding: 4px;');
    console.log(`%c${'||'.repeat(40)}`, R);
    console.log(`%c  Detecting host...`, R);
    console.log(`%c  Checking IP and Firewall...`, R);
    console.log(`%c${'||'.repeat(40)}`, R);
    console.log(`%c${'//'.repeat(40)}`, R);
    console.log(`%c  Attempting to inject JavaScript into website...`, R);
    console.log(`%c  Configuring Client IP to server...`, R);
    console.log(`%c  Masking IP...`, R);
    console.log(`%c${'//'.repeat(40)}`, R);
    console.log(`%c${'--'.repeat(40)}`, R);
    console.log(`%c  Removed Console access from all JavaScript`, 'color: #0f0; font-family: monospace; font-weight: bold;');
    console.log(`%c  Sniffing all PDF files`, 'color: #0f0; font-family: monospace; font-weight: bold;');
    console.log(`%c${'='.repeat(40)}`, R);
    console.log(`%c  BIN: ACTIVE`, 'color: #fff; background: #0f0; font-family: monospace; padding: 2px 6px;');
    console.log(`%c${'='.repeat(40)}\n`, R);

    // --- PDF DETECTION ---
    const logPDF = (url) => {
        console.log(`%c\n${'═'.repeat(50)}`, C);
        console.log(`%c  📄  PDF DETECTED`, 'color: #fff; background: #f00; font-family: monospace; font-size: 16px; padding: 4px;');
        console.log(`%c  ${url}`, C);
        console.log(`%c${'═'.repeat(50)}\n`, C);
    };

    // --- MAIN SNIFFER LOGIC (CARIBBEANS.AI SPECIFIC) ---
    const checkURL = (url) => {
        if (!url) return;
        const urlStr = url.toString();
        if (urlStr.includes('.pdf') || urlStr.includes('?file=')) {
            logPDF(urlStr);
        }
    };

    // Method 1: Fetch
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        checkURL(typeof args[0] === 'string' ? args[0] : args[0]?.url);
        return origFetch.apply(this, args);
    };

    // Method 2: XHR
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        checkURL(url);
        return origOpen.apply(this, arguments);
    };

    // Method 3: Observer for iframes/embeds (CRITICAL FOR THIS SITE)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IFRAME') checkURL(node.src);
                if (node.tagName === 'EMBED') checkURL(node.src);
                if (node.tagName === 'OBJECT') checkURL(node.data);
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Method 4: Check current page on load
    window.addEventListener('load', () => {
        checkURL(window.location.href);
        // Also scan for existing iframes
        document.querySelectorAll('iframe, embed, object').forEach(el => {
            checkURL(el.src || el.data);
        });
    });

    console.log('%c  [SNIFFER] All hooks active. Waiting for PDF links or viewer loads...', G);
})();
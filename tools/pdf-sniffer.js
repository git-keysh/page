(() => {
    console.clear();
    
    const style = 'color: #0f0; font-family: monospace; font-size: 14px;';
    const style2 = 'color: #0f0; font-family: monospace; font-size: 20px; font-weight: bold;';
    
    console.log(`%c
    ╔══════════════════════════════════════╗
    ║     █▀▀█ █▀▀▄ █▀▀ █▀▀▄ █▀▀█ █▀▀█    ║
    ║     █░░█ █░░█ █▀▀ █░░█ █░░█ █▄▄▀    ║
    ║     ▀▀▀▀ ▀▀▀░ ▀░░ ▀░░▀ ▀▀▀▀ ▀░▀▀    ║
    ║                                      ║
    ║     █▀▀█ █▀▀ █▀▀█ █▀▀▀ █▀▀▀ █▀▀█    ║
    ║     █░░█ █▀▀ █▄▄▀ █░▀█ █░▀█ █▄▄▀    ║
    ║     ▀▀▀▀ ▀░░ ▀░▀▀ ▀▀▀▀ ▀▀▀▀ ▀░▀▀    ║
    ╚══════════════════════════════════════╝%c`, style2, '');
    
    console.log(`%c
    ┌──────────────────────────────────────┐
    │  🔍  PDF SNIFFER v1.0  -  ACTIVE     │
    │  📡  Monitoring network requests...   │
    │  ⏳  Running until tab is closed      │
    └──────────────────────────────────────┘%c`, style, '');
    
    console.log(`%c    ⚡ Waiting for PDFs... ⚡%c\n`, 'color: #ff0; font-family: monospace;', '');

    // Hook into fetch
    const origFetch = window.fetch;
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        if (url.toLowerCase().includes('.pdf')) {
            console.log(`%c
    ╔══════════════════════════════════════════════╗
    ║           📄  PDF DETECTED  📄               ║
    ╠══════════════════════════════════════════════╣
    ║  ${url}%c`, 'color: #0ff; font-family: monospace; font-weight: bold;', '');
            const padded = url.length < 46 ? ' '.repeat(46 - url.length) : '';
            console.log(`%c    ║${padded}║
    ╚══════════════════════════════════════════════╝%c`, 'color: #0ff; font-family: monospace; font-weight: bold;', '');
        }
        return origFetch.apply(this, args);
    };

    // Hook into XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url.toLowerCase().includes('.pdf')) {
            console.log(`%c
    ╔══════════════════════════════════════════════╗
    ║           📄  PDF DETECTED  📄               ║
    ╠══════════════════════════════════════════════╣
    ║  ${url}%c`, 'color: #0ff; font-family: monospace; font-weight: bold;', '');
            const padded = url.length < 46 ? ' '.repeat(46 - url.length) : '';
            console.log(`%c    ║${padded}║
    ╚══════════════════════════════════════════════╝%c`, 'color: #0ff; font-family: monospace; font-weight: bold;', '');
        }
        return origOpen.apply(this, arguments);
    };
})();
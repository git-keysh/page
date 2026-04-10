(function() {
    const path = window.location.pathname;
    if (path.endsWith("index.html")) {
        history.replaceState(null, '', '/');
    } else if (path.endsWith(".html")) {
        const clean = path.replace('.html', '');
        history.replaceState(null, '', clean);
    }
})();
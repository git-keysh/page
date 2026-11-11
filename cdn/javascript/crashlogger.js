/*!
 * Crash Logger v1.0.0
 * Captures runtime errors and probable crash causes, and streams them to Discord.
 * made by keyshaun.dev  |  https://keyshaun.pages.dev
 */
(async () => {
  'use strict';

  const w = window;
  if (w.__crashLogger) {
    console.info('[CrashLogger] already running on this page.');
    return;
  }

  /* ------------------------------------------------------------------ *
   *  Config
   * ------------------------------------------------------------------ */
  const AUTHOR = { name: 'keyshaun.dev', url: 'https://keyshaun.pages.dev' };

  // Webhook is stored as AES-256-GCM ciphertext. The key is split in three parts.
  const VAULT = {
    iv: 'ATQhuhqsGZC+vSau',
    ct: 'RKTVxI1JNRGpcg6P01PWu8vqVEMNdzjMikxACkoIVscsyn0LYg65CCwCiTtyhyTWRhikOJZTtJdi348yrAwsW3VEmBOVZD+dg38b8zUlPhqh1BZ55x0zRxVA6GxFpiEr1Nrb8EBdJLEN4IFNAan8N8WYGoSsnRmirFZUIhwY13suflUpYdfxNog=',
    k: ['c8q//w3ZCVn2DnR', 'ySvWtl8UPzu04mp', 'tLaAmNoeOXZMo='],
  };

  const CFG = {
    flushMs: 3000,        // batch window before sending
    sendGapMs: 700,       // pause between webhook messages (limit is 5 per 2s)
    summaryMs: 60000,     // how often repeated errors are summarised
    maxEvents: 150,       // hard cap of distinct events per page session
    maxQueue: 120,
    messageChars: 5600,   // Discord caps a message at 6000 embed characters
    stackChars: 3800,     // per stack embed (cap is 4096)
    stackEmbeds: 3,
    stallMs: 2500,        // main-thread stall threshold (fallback watchdog)
    heapRatio: 0.85,      // JS heap warning threshold
    captureWarnings: true // include console.warn
  };

  const COLOR = { error: 0xe5484d, warn: 0xf5a524, info: 0x3e63dd };

  /* ------------------------------------------------------------------ *
   *  Native references (taken before anything is patched)
   * ------------------------------------------------------------------ */
  const N = {
    fetch: w.fetch ? w.fetch.bind(w) : null,
    setTimeout: w.setTimeout.bind(w),
    setInterval: w.setInterval.bind(w),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    xhrOpen: w.XMLHttpRequest && w.XMLHttpRequest.prototype.open,
    xhrSend: w.XMLHttpRequest && w.XMLHttpRequest.prototype.send,
    consoleError: console.error,
    consoleWarn: console.warn,
  };

  /* ------------------------------------------------------------------ *
   *  Unlock webhook
   * ------------------------------------------------------------------ */
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  let HOOK;
  try {
    const key = await crypto.subtle.importKey('raw', b64(VAULT.k.join('')), 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(VAULT.iv) }, key, b64(VAULT.ct));
    HOOK = new TextDecoder().decode(plain);
  } catch (e) {
    N.warn('[CrashLogger] Could not unlock the webhook. This needs a secure (https) page.', e);
    return;
  }

  /* ------------------------------------------------------------------ *
   *  Helpers
   * ------------------------------------------------------------------ */
  const cut = (s, n) => {
    s = String(s == null ? '' : s);
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  };
  const tick = (s) => String(s).replace(/`/g, "'");
  const fence = (s) => '```\n' + String(s).replace(/```/g, "'''") + '\n```';
  const mb = (n) => Math.round(n / 1048576);

  const cleanUrl = (u) => {
    try {
      const x = new URL(u, location.href);
      const base = x.origin === 'null' ? x.href.split(/[?#]/)[0] : x.origin + x.pathname;
      return cut(base + (x.search ? '?…' : ''), 220);
    } catch (_) {
      return cut(u, 220);
    }
  };
  // Query strings and hashes can hold tokens, so they never leave the page.
  const cleanStack = (s) => String(s || '').replace(/(https?:\/\/[^\s)?#]+)[?#][^\s)]*/g, '$1');

  let unloading = false;
  const sleep = (ms) => (unloading ? Promise.resolve() : new Promise((r) => N.setTimeout(r, ms)));

  /* ------------------------------------------------------------------ *
   *  Identity: webhook name = site host, avatar = site icon
   * ------------------------------------------------------------------ */
  const HOST = location.hostname.replace(/^www\./i, '') || 'local-file';
  const LOCAL =
    !location.hostname ||
    /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0$)|\.local$/.test(location.hostname);
  let USERNAME = /discord|clyde/i.test(HOST) ? undefined : HOST.slice(0, 80); // Discord rejects those words

  const AVATAR = (() => {
    if (LOCAL) return undefined;
    const links = [...document.querySelectorAll('link[rel*="icon"]')];
    const raster = /\.(png|jpe?g|webp|gif)([?#]|$)/i; // Discord can't render .ico or .svg
    const apple = links.find((l) => /apple-touch-icon/i.test(l.rel) && /^https?:/i.test(l.href));
    const png = links.find((l) => /^https?:/i.test(l.href) && raster.test(l.href));
    const pick = apple || png;
    return pick
      ? pick.href
      : 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(location.hostname) + '&sz=128';
  })();

  const PAGE = cleanUrl(location.href);
  const PAGE_LINK = /^https?:$/.test(location.protocol) ? location.origin + location.pathname : undefined;

  const browser = () => {
    const ua = navigator.userAgent;
    const tests = [['Edge', /Edg\/([\d]+)/], ['Opera', /OPR\/([\d]+)/], ['Firefox', /Firefox\/([\d]+)/],
      ['Chrome', /Chrome\/([\d]+)/], ['Safari', /Version\/([\d]+).*Safari/]];
    let name = 'Browser';
    for (const [n, re] of tests) {
      const m = ua.match(re);
      if (m) { name = `${n} ${m[1]}`; break; }
    }
    const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS'
      : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
    return os ? `${name} · ${os}` : name;
  };

  const env = () => {
    const m = performance.memory;
    const c = navigator.connection;
    return [
      browser(),
      navigator.onLine ? 'online' : 'offline',
      `${w.innerWidth}×${w.innerHeight}`,
      m ? `heap ${mb(m.usedJSHeapSize)}/${mb(m.jsHeapSizeLimit)} MB` : null,
      c && c.effectiveType ? c.effectiveType : null,
      document.visibilityState,
    ].filter(Boolean).join(' · ');
  };

  /* ------------------------------------------------------------------ *
   *  Probable-cause analysis
   * ------------------------------------------------------------------ */
  const DIAG = [
    [/Maximum call stack size exceeded/i, 'Runaway recursion: a function keeps calling itself, or two functions call each other.'],
    [/out of memory|Invalid (array|string) length|Array buffer allocation failed|Allocation failed/i, 'Memory exhaustion: an oversized array, string or buffer, a leak, or an unbounded loop growing data.'],
    [/^Script error\.?$/i, 'Cross-origin script whose details the browser hides. The script needs crossorigin="anonymous" and an Access-Control-Allow-Origin header.'],
    [/Cannot read propert(y|ies) of (undefined|null)|undefined is not an object|null is not an object|Cannot destructure/i, 'A value was undefined or null when used: data not loaded yet, an API returned an unexpected shape, or a selector matched nothing.'],
    [/is not a function|is not iterable|is not a constructor/i, 'Wrong type: a function or iterable was expected. Common with a failed import, a typo, or an unexpected API response.'],
    [/is not defined/i, 'Undefined variable: a script failed to load or ran out of order, a typo, or a scoping problem.'],
    [/Assignment to constant|Cannot assign to read only|Cannot set propert/i, 'Writing to a constant, frozen object or read-only property.'],
    [/Failed to fetch|NetworkError|Load failed|Network request failed|net::ERR/i, 'The request never completed: offline, DNS or TLS failure, a CORS rejection, an ad blocker, or the server is down.'],
    [/ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Importing a module script failed/i, 'Stale deploy: the page references a bundle that no longer exists on the server. Check cache headers and redeploy order.'],
    [/Unexpected token (<|'<')|JSON\.parse|is not valid JSON|Unexpected end of JSON/i, 'Expected JSON but received HTML or an empty body: wrong URL, an error page, a login redirect, or a truncated response.'],
    [/QuotaExceededError|exceeded the quota/i, 'Browser storage is full (localStorage, IndexedDB or Cache Storage).'],
    [/Content Security Policy|violates the following/i, 'Blocked by the site CSP: a script, style, frame or connection source is not allowed by the policy.'],
    [/Mixed Content/i, 'An http:// resource was requested from an https:// page and got blocked.'],
    [/Access-Control-Allow-Origin|CORS/i, 'CORS: the server did not allow this origin to read the response.'],
    [/SecurityError|Blocked a frame|Permission denied to access/i, 'Cross-origin access blocked by the browser security model.'],
    [/NotAllowedError|play\(\) failed|user gesture/i, 'The browser blocked the action because it needs a user gesture or a permission.'],
    [/hydrat/i, 'Server-rendered HTML differs from the client render (hydration mismatch).'],
    [/ResizeObserver loop/i, 'Benign browser notice caused by layout changes inside a ResizeObserver callback. Usually safe to ignore.'],
    [/Extension context invalidated|(chrome|moz|safari-web)-extension:/i, 'Caused by a browser extension, not by the site.'],
    [/Illegal invocation/i, 'A native method was called with the wrong `this` (for example a detached fetch or console method).'],
    [/Invalid or unexpected token|Unexpected (identifier|token|end of input)|SyntaxError/i, 'Syntax error in a script, or a script URL returned HTML instead of JavaScript.'],
    [/WebSocket/i, 'WebSocket problem: the server closed it, a proxy is blocking it, or the URL or protocol is wrong.'],
    [/AbortError/i, 'An operation was cancelled (navigation, component unmount, or an AbortController).'],
    [/timeout|timed out/i, 'An operation took too long: a slow or stalled server, or a blocked request.'],
  ];

  const httpWhy = (s) =>
    s === 401 || s === 403 ? 'Not authorised: expired session, missing token, or insufficient permissions.'
    : s === 404 ? 'Not found: wrong URL, deleted resource, or a bad deploy.'
    : s === 429 ? 'Rate limited: the page is sending requests faster than the server allows.'
    : s >= 500 ? 'Server-side failure: the backend threw or is overloaded. Check the server logs.'
    : 'The server rejected the request as invalid.';

  const diagnose = (ev) => {
    if (ev.reasons) return ev.reasons;
    const hay = `${ev.message}\n${ev.stack || ''}`;
    const out = [];
    try {
      if (ev.file && new URL(ev.file, location.href).hostname !== location.hostname) {
        out.push(`Thrown by a script hosted on ${new URL(ev.file, location.href).hostname}, not by the site itself.`);
      }
    } catch (_) {}
    for (const [re, why] of DIAG) if (re.test(hay) && !out.includes(why)) out.push(why);
    return out.length ? out.slice(0, 3) : ['No known pattern matched. Check the stack trace and location.'];
  };

  /* ------------------------------------------------------------------ *
   *  Embed construction
   * ------------------------------------------------------------------ */
  const esize = (e) =>
    (e.title ? e.title.length : 0) + (e.description ? e.description.length : 0) +
    (e.footer ? e.footer.text.length : 0) + (e.author ? e.author.name.length : 0) +
    (e.fields || []).reduce((n, f) => n + f.name.length + f.value.length, 0);

  const chunkLines = (text, size, max) => {
    const out = [];
    let cur = '';
    for (const line of String(text).split('\n')) {
      const l = line.length > size ? line.slice(0, size - 1) + '…' : line;
      if (cur && cur.length + l.length + 1 > size) {
        out.push(cur);
        cur = '';
        if (out.length >= max) return out;
      }
      cur += (cur ? '\n' : '') + l;
    }
    if (cur && out.length < max) out.push(cur);
    return out;
  };

  const buildEmbeds = (ev) => {
    const color = COLOR[ev.level] || COLOR.info;
    const fields = [];

    if (ev.source) fields.push({ name: 'Location', value: '`' + tick(cut(ev.source, 400)) + '`', inline: false });
    fields.push({ name: 'Page', value: '`' + tick(PAGE) + '`', inline: false });
    for (const x of ev.extra || []) fields.push({ name: x.name, value: cut(x.value, 1000), inline: x.inline !== false });
    if (!ev.noDiag) {
      fields.push({
        name: 'Likely cause',
        value: cut(diagnose(ev).map((r) => '• ' + r).join('\n'), 1024),
        inline: false,
      });
    }
    fields.push({ name: 'Environment', value: cut(env(), 1024), inline: false });

    const main = {
      author: { name: 'Crash Logger by keyshaun.dev', url: AUTHOR.url },
      title: cut(ev.kind, 250),
      description: ev.md ? cut(ev.description, 3800) : fence(cut(ev.message, 1800)),
      color,
      fields,
      timestamp: new Date(ev.ts).toISOString(),
    };
    if (PAGE_LINK) main.url = PAGE_LINK;

    const embeds = [main];
    if (ev.stack) {
      const parts = chunkLines(cleanStack(ev.stack), CFG.stackChars, CFG.stackEmbeds);
      parts.forEach((p, i) =>
        embeds.push({
          title: parts.length > 1 ? `Stack trace (${i + 1}/${parts.length})` : 'Stack trace',
          description: fence(p),
          color,
        })
      );
    }
    embeds[embeds.length - 1].footer = { text: 'made by keyshaun.dev' };
    return embeds;
  };

  const pack = (embeds) => {
    const messages = [];
    let cur = [];
    let size = 0;
    for (const e of embeds) {
      const s = esize(e);
      if (cur.length && (cur.length >= 10 || size + s > CFG.messageChars)) {
        messages.push(cur);
        cur = [];
        size = 0;
      }
      cur.push(e);
      size += s;
    }
    if (cur.length) messages.push(cur);
    return messages;
  };

  /* ------------------------------------------------------------------ *
   *  Delivery: queue, batching, rate-limit handling
   * ------------------------------------------------------------------ */
  const queue = [];
  const seen = new Map();
  let total = 0, dropped = 0, timer = null, flushing = false, stopped = false, capNotified = false, warned = false;

  const warnOnce = (msg) => {
    if (warned) return;
    warned = true;
    N.warn('[CrashLogger] ' + msg);
  };

  const post = async (embeds) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const body = JSON.stringify({ username: USERNAME, avatar_url: AVATAR, embeds, allowed_mentions: { parse: [] } });
      let r;
      try {
        r = await N.fetch(HOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: unloading || document.visibilityState === 'hidden',
        });
      } catch (_) {
        warnOnce('Could not reach the webhook (blocked by the page CSP, an ad blocker, or offline).');
        return false;
      }
      if (r.ok) {
        if (r.headers.get('x-ratelimit-remaining') === '0') {
          await sleep(Math.ceil(parseFloat(r.headers.get('x-ratelimit-reset-after') || '1') * 1000));
        }
        return true;
      }
      if (r.status === 429) {
        let wait = 1500;
        try { wait = Math.ceil(((await r.json()).retry_after || 1) * 1000) + 100; } catch (_) {}
        await sleep(wait);
        continue;
      }
      if (r.status === 400 && USERNAME) { USERNAME = undefined; continue; } // username rejected, retry with default
      warnOnce(`The webhook rejected a message (HTTP ${r.status}).`);
      return false;
    }
    return false;
  };

  const flush = async () => {
    if (flushing) return;
    flushing = true;
    try {
      while (queue.length) {
        if (dropped) {
          queue.push({ kind: 'Events Dropped', level: 'warn', noDiag: true, md: true, ts: Date.now(),
            description: `${dropped} further event(s) were dropped to stay within Discord rate limits.` });
          dropped = 0;
        }
        const batch = queue.splice(0, queue.length);
        const groups = pack(batch.flatMap(buildEmbeds));
        for (const g of groups) {
          await post(g);
          await sleep(CFG.sendGapMs);
        }
      }
    } finally {
      flushing = false;
    }
  };

  const schedule = () => {
    if (timer || stopped) return;
    timer = N.setTimeout(() => { timer = null; flush(); }, CFG.flushMs);
  };

  const enqueue = (ev) => {
    if (stopped) return;
    if (total >= CFG.maxEvents) {
      if (!capNotified) {
        capNotified = true;
        queue.push({ kind: 'Event Cap Reached', level: 'warn', noDiag: true, md: true, ts: Date.now(),
          description: `This page hit the ${CFG.maxEvents}-event limit for one session. Further events are counted but not sent. Reload the page to reset.` });
        schedule();
      }
      return;
    }
    if (queue.length >= CFG.maxQueue) { dropped++; return; }
    total++;
    queue.push(ev);
    schedule();
  };

  // De-duplicate: the first occurrence is sent, repeats are counted and summarised.
  const report = (ev) => {
    if (stopped) return;
    ev.ts = Date.now();
    const key = [ev.kind, cut(ev.message, 160), ev.source || ''].join('|');
    const hit = seen.get(key);
    if (hit) { hit.count++; return; }
    seen.set(key, { count: 1, reported: 1, ev });
    if (seen.size > 500) seen.delete(seen.keys().next().value);
    enqueue(ev);
  };

  const summarise = () => {
    const rows = [];
    for (const s of seen.values()) {
      if (s.count > s.reported) {
        rows.push({ n: s.count - s.reported, s });
        s.reported = s.count;
      }
    }
    if (!rows.length) return;
    rows.sort((a, b) => b.n - a.n);
    const lines = rows.slice(0, 15).map((r) => `**×${r.n}** ${r.s.ev.kind}: \`${tick(cut(r.s.ev.message.replace(/\s+/g, ' '), 70))}\``);
    enqueue({ kind: 'Repeated Errors', level: 'warn', noDiag: true, md: true, ts: Date.now(),
      description: 'New occurrences since the last summary:\n' + lines.join('\n') });
  };

  /* ------------------------------------------------------------------ *
   *  Collectors
   * ------------------------------------------------------------------ */
  const cleanups = [];
  const listen = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  const loc = (f, l, c) => (f ? `${cleanUrl(f)}${l ? ':' + l : ''}${c ? ':' + c : ''}` : '');

  // 1. Uncaught errors and failed resource loads
  listen(w, 'error', (e) => {
    const t = e.target;
    if (t && t !== w && (t.src || t.href)) {
      const tag = (t.tagName || 'resource').toLowerCase();
      const src = t.currentSrc || t.src || t.href;
      report({
        kind: 'Resource Failed to Load', level: 'warn', message: `<${tag}> ${cleanUrl(src)}`, source: cleanUrl(src),
        reasons: [
          tag === 'script' ? 'A script failed to load, so anything depending on it will throw errors afterwards.'
            : tag === 'link' ? 'A stylesheet or linked file failed to load.'
            : 'A file failed to load.',
          'Typical causes: 404, an ad blocker, a CORS or CSP block, or the host is unreachable.',
        ],
      });
      return;
    }
    const err = e.error;
    report({
      kind: err && err.name ? `Uncaught ${err.name}` : 'Uncaught Error',
      level: 'error',
      message: e.message || String(err),
      stack: err && err.stack,
      file: e.filename,
      source: loc(e.filename, e.lineno, e.colno),
    });
  }, true);

  // 2. Unhandled promise rejections
  listen(w, 'unhandledrejection', (e) => {
    const r = e.reason;
    report({
      kind: 'Unhandled Promise Rejection', level: 'error',
      message: r && r.message ? `${r.name || 'Error'}: ${r.message}` : String(r),
      stack: r && r.stack,
    });
  });

  // 3. CSP violations
  listen(document, 'securitypolicyviolation', (e) => {
    if (/discord\.com/i.test(e.blockedURI)) {
      warnOnce('This page\'s Content Security Policy blocks connections to Discord, so reports cannot be delivered here.');
    }
    report({
      kind: 'CSP Violation', level: 'warn',
      message: `Blocked ${e.effectiveDirective || e.violatedDirective}: ${cleanUrl(e.blockedURI || 'inline')}`,
      source: loc(e.sourceFile, e.lineNumber, e.columnNumber),
      reasons: ['The site Content Security Policy refused this resource. Add the source to the matching directive, or remove the request.'],
    });
  });

  // 4. console.error / console.warn
  let busy = false;
  const fmtArg = (a) => {
    if (a instanceof Error) return `${a.name}: ${a.message}`;
    if (typeof a === 'string') return a;
    try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch (_) { return Object.prototype.toString.call(a); }
  };
  const origConsole = { error: console.error, warn: console.warn };
  ['error', 'warn'].forEach((level) => {
    if (level === 'warn' && !CFG.captureWarnings) return;
    console[level] = function (...args) {
      if (!busy) {
        busy = true;
        try {
          const withStack = args.find((a) => a instanceof Error);
          let stack = withStack && withStack.stack;
          if (!stack) {
            const lines = String(new Error().stack || '').split('\n');
            if (lines[0] === 'Error') lines.shift();
            lines.shift(); // this wrapper
            stack = lines.join('\n');
          }
          report({ kind: `console.${level}`, level: level === 'error' ? 'error' : 'warn', message: args.map(fmtArg).join(' '), stack });
        } catch (_) {} finally { busy = false; }
      }
      return origConsole[level].apply(this, args);
    };
  });

  // 5. fetch failures
  const isOwn = (u) => String(u).indexOf('/api/webhooks/') !== -1;
  const realFetch = w.fetch;
  if (realFetch) {
    w.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) || String(input);
      const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      const t0 = performance.now();
      try {
        const res = await realFetch.apply(this, arguments);
        if (!res.ok && !isOwn(url)) {
          report({
            kind: `HTTP ${res.status}`, level: res.status >= 500 ? 'error' : 'warn', message: `${method} ${cleanUrl(url)}`,
            extra: [{ name: 'Status', value: `${res.status} ${res.statusText}` }, { name: 'Duration', value: `${Math.round(performance.now() - t0)} ms` }],
            reasons: [httpWhy(res.status)],
          });
        }
        return res;
      } catch (e) {
        if (!isOwn(url) && !(e && e.name === 'AbortError')) {
          report({
            kind: 'Network Request Failed', level: 'error', message: `${method} ${cleanUrl(url)}`, stack: e && e.stack,
            extra: [{ name: 'Error', value: String(e && e.message) }, { name: 'Duration', value: `${Math.round(performance.now() - t0)} ms` }],
          });
        }
        throw e;
      }
    };
  }

  // 6. XMLHttpRequest failures
  if (N.xhrOpen && N.xhrSend) {
    const XP = w.XMLHttpRequest.prototype;
    XP.open = function (m, u) {
      this.__cl = { m: String(m).toUpperCase(), u };
      return N.xhrOpen.apply(this, arguments);
    };
    XP.send = function () {
      const x = this;
      let aborted = false;
      x.addEventListener('abort', () => { aborted = true; });
      x.addEventListener('loadend', () => {
        const i = x.__cl || {};
        if (aborted || isOwn(i.u)) return;
        if (x.status === 0) {
          report({ kind: 'XHR Failed', level: 'error', message: `${i.m} ${cleanUrl(i.u)}`,
            reasons: ['The request did not complete: network error, timeout, CORS rejection, or an ad blocker.'] });
        } else if (x.status >= 400) {
          report({ kind: `XHR ${x.status}`, level: x.status >= 500 ? 'error' : 'warn', message: `${i.m} ${cleanUrl(i.u)}`,
            extra: [{ name: 'Status', value: `${x.status} ${x.statusText}` }], reasons: [httpWhy(x.status)] });
        }
      });
      return N.xhrSend.apply(this, arguments);
    };
  }

  // 7. Main-thread stalls
  const supportsLongTask = 'PerformanceObserver' in w && (PerformanceObserver.supportedEntryTypes || []).includes('longtask');
  let po = null;
  if (supportsLongTask) {
    try {
      po = new PerformanceObserver((list) => {
        for (const en of list.getEntries()) {
          if (en.duration < 1000) continue;
          const b = en.duration < 2000 ? '1 to 2 s' : en.duration < 5000 ? '2 to 5 s' : 'over 5 s';
          report({
            kind: 'Main Thread Blocked', level: 'warn', message: `A single task froze the page (${b})`,
            extra: [{ name: 'Duration', value: `${Math.round(en.duration)} ms` }],
            reasons: ['Heavy synchronous work: a long loop, a huge JSON parse, or an expensive render or layout. Move it to a Worker or split it into chunks.'],
          });
        }
      });
      po.observe({ type: 'longtask', buffered: false });
    } catch (_) { po = null; }
  }
  let beat = performance.now();
  const watchdog = N.setInterval(() => {
    const now = performance.now();
    const drift = now - beat - 500;
    beat = now;
    if (!supportsLongTask && drift >= CFG.stallMs && document.visibilityState === 'visible') {
      report({
        kind: 'Main Thread Blocked', level: 'warn', message: 'The page stopped responding for several seconds',
        extra: [{ name: 'Duration', value: `${Math.round(drift)} ms` }],
        reasons: ['Heavy synchronous work or an infinite loop is blocking the main thread.'],
      });
    }
  }, 500);

  // 8. Memory pressure (Chromium)
  const heapTimer = N.setInterval(() => {
    const m = performance.memory;
    if (!m || !m.jsHeapSizeLimit) return;
    const ratio = m.usedJSHeapSize / m.jsHeapSizeLimit;
    if (ratio >= CFG.heapRatio) {
      report({
        kind: 'High Memory Usage', level: 'warn', message: `JS heap is above ${Math.round(CFG.heapRatio * 100)}% of its limit`,
        extra: [{ name: 'Heap', value: `${mb(m.usedJSHeapSize)} / ${mb(m.jsHeapSizeLimit)} MB (${Math.round(ratio * 100)}%)` }],
        reasons: ['A tab crash is likely if this keeps climbing: a memory leak, detached DOM nodes, growing caches or event listeners, or oversized data in memory.'],
      });
    }
  }, 5000);

  // 9. Connectivity and lifecycle
  listen(w, 'offline', () =>
    report({ kind: 'Connection Lost', level: 'warn', message: 'The browser went offline', reasons: ['Network connectivity dropped. Requests made now will fail.'] }));
  listen(w, 'freeze', () => {
    unloading = true;
    report({ kind: 'Tab Frozen', level: 'info', message: 'The browser froze this tab', reasons: ['Background tab was suspended by the browser to save resources.'] });
    flush();
  });
  listen(w, 'resume', () => { unloading = false; });
  listen(w, 'pagehide', () => { unloading = true; summarise(); flush(); });
  listen(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  const summaryTimer = N.setInterval(summarise, CFG.summaryMs);

  /* ------------------------------------------------------------------ *
   *  Public handle
   * ------------------------------------------------------------------ */
  w.__crashLogger = {
    version: '1.0.0',
    flush: () => { summarise(); return flush(); },
    test: () => {
      enqueue({ kind: 'Test Event', level: 'info', noDiag: true, md: true, ts: Date.now(),
        description: 'Delivery check. If you can read this, the logger is working.' });
      return flush();
    },
    stop: () => {
      stopped = true;
      cleanups.forEach((f) => f());
      clearInterval(watchdog); clearInterval(heapTimer); clearInterval(summaryTimer);
      if (po) po.disconnect();
      console.error = N.consoleError; console.warn = N.consoleWarn;
      if (realFetch) w.fetch = realFetch;
      if (N.xhrOpen) { w.XMLHttpRequest.prototype.open = N.xhrOpen; w.XMLHttpRequest.prototype.send = N.xhrSend; }
      delete w.__crashLogger;
      N.info('[CrashLogger] stopped.');
    },
  };

  enqueue({
    kind: 'Crash Logger Attached', level: 'info', noDiag: true, md: true, ts: Date.now(),
    description: `Now monitoring **${HOST}**.\nUncaught errors, promise rejections, failed requests, blocked resources, CSP violations, stalls and memory pressure will appear here.\n\n[keyshaun.dev](${AUTHOR.url})`,
  });

  N.info('%cCrash Logger%c active on ' + HOST + '  |  made by keyshaun.dev  ' + AUTHOR.url,
    'background:#3e63dd;color:#fff;padding:2px 8px;border-radius:4px;font-weight:600', 'color:inherit');
})();
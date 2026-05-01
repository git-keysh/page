// Discord Webhook Logger - CORS-safe, no prompts, fully working

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
            if (loadTime > 0 && loadTime < 60000) {
                performanceInfo.pageLoadTimeMs = loadTime;
                performanceInfo.domInteractive = timing.domInteractive - timing.navigationStart;
                performanceInfo.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
            }
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
        
        // Get IP and location via ipapi.co (CORS-friendly)
        let ipString = "Unknown IP";
        let locationString = "Unknown location";
        let city = "Unknown";
        let region = "Unknown";
        let country = "Unknown";
        let latitude = null;
        let longitude = null;
        
        try {
            const ipResponse = await fetch('https://ipapi.co/json/', {
                mode: 'cors',
                cache: 'no-cache'
            });
            
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                
                if (ipData.ip) ipString = ipData.ip;
                if (ipData.city) city = ipData.city;
                if (ipData.region) region = ipData.region;
                if (ipData.country_name) country = ipData.country_name;
                if (ipData.latitude) latitude = ipData.latitude;
                if (ipData.longitude) longitude = ipData.longitude;
                
                const locationParts = [];
                if (city && city !== "Unknown" && city !== "unknown") locationParts.push(city);
                if (region && region !== "Unknown" && region !== "unknown") locationParts.push(region);
                if (country && country !== "Unknown" && country !== "unknown") locationParts.push(country);
                locationString = locationParts.length > 0 ? locationParts.join(", ") : (ipData.country || "Unknown");
                
                console.log("IP Data loaded:", ipString, locationString);
            } else {
                console.warn("ipapi.co returned:", ipResponse.status);
            }
        } catch (e) {
            console.warn("IP API error (normal if offline/local file):", e.message);
        }
        
        // Fallback: try ipify just for IP if ipapi failed
        if (ipString === "Unknown IP") {
            try {
                const backupResponse = await fetch('https://api.ipify.org?format=json');
                if (backupResponse.ok) {
                    const backupData = await backupResponse.json();
                    if (backupData.ip) ipString = backupData.ip;
                }
            } catch (e) {
                console.warn("IP fallback failed:", e.message);
            }
        }
        
        // Build all info object (no geoplugin to avoid CORS)
        const allInfo = {
            timestamp: new Date().toISOString(),
            visitor: {
                ip: ipString,
                location: locationString,
                coordinates: (latitude && longitude) ? `${latitude}, ${longitude}` : "Not available"
            },
            browser: clientInfo,
            screen: screenInfo,
            time: timeInfo,
            page: pageInfo,
            performance: performanceInfo,
            connection: connectionInfo
        };
        
        // Format location for the main message
        const finalLocation = locationString !== "Unknown location" ? locationString : (ipString !== "Unknown IP" ? `IP ${ipString}` : "unknown origin");
        
        // Create the message content with proper formatting
        const messageContent = `Seems like a fellow is interested, they are from **${finalLocation}**\n-# \`${ipString}\``;
        
        // Format all info as readable text (limit size to avoid Discord length limits)
        const allInfoText = JSON.stringify(allInfo, null, 2);
        const truncatedInfo = allInfoText.length > 1900 ? allInfoText.substring(0, 1900) + "\n... (truncated)" : allInfoText;
        
        // Create Discord embed - simplified to avoid 400 errors
        const embed = {
            title: "🌐 New Visitor Detected",
            color: 0x5865F2,
            timestamp: new Date().toISOString(),
            fields: [
                {
                    name: "📍 Location",
                    value: finalLocation,
                    inline: true
                },
                {
                    name: "🖥️ IP Address",
                    value: `\`${ipString}\``,
                    inline: true
                },
                {
                    name: "📱 Browser & OS",
                    value: `${clientInfo.platform || "Unknown"} | ${clientInfo.language}`,
                    inline: false
                },
                {
                    name: "📐 Screen",
                    value: `${screenInfo.screenWidth}x${screenInfo.screenHeight} (${screenInfo.devicePixelRatio}x)`,
                    inline: true
                },
                {
                    name: "⏰ Timezone",
                    value: timeInfo.timezone,
                    inline: true
                },
                {
                    name: "🔗 Page",
                    value: pageInfo.url.length > 80 ? pageInfo.url.substring(0, 80) + "..." : pageInfo.url,
                    inline: false
                },
                {
                    name: "📦 All Data",
                    value: "```json\n" + truncatedInfo + "\n```",
                    inline: false
                }
            ],
            footer: {
                text: "Silent tracker • No prompts"
            }
        };
        
        // Prepare payload - ensure content is within Discord's limits
        const payload = {
            content: messageContent.substring(0, 2000),
            embeds: [embed],
            username: "Visitor Logger",
            avatar_url: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png"
        };
        
        // Send to Discord
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log("✅ Log sent to Discord successfully");
                // Optional: show a tiny visual indicator (can be removed)
                const indicator = document.createElement('div');
                indicator.textContent = '✓';
                indicator.style.cssText = 'position:fixed;bottom:5px;right:5px;font-size:10px;color:#4ade80;background:#1a1a2e;padding:2px 6px;border-radius:10px;z-index:99999;opacity:0.5;font-family:monospace;';
                document.body.appendChild(indicator);
                setTimeout(() => indicator.remove(), 2000);
            } else {
                const errorText = await response.text();
                console.error("Discord webhook error:", response.status, errorText);
                
                // Try without embed if embed caused the error
                if (response.status === 400) {
                    console.log("Retrying without embed...");
                    const simplePayload = {
                        content: messageContent + "\n\n```json\n" + truncatedInfo.substring(0, 1500) + "\n```",
                        username: "Visitor Logger"
                    };
                    const retryResponse = await fetch(WEBHOOK_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(simplePayload)
                    });
                    if (retryResponse.ok) {
                        console.log("✅ Sent without embed");
                    } else {
                        console.error("Retry also failed:", await retryResponse.text());
                    }
                }
            }
        } catch (error) {
            console.error("Network error sending to Discord:", error);
        }
    }
    
    // Run when page is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", sendLog);
    } else {
        sendLog();
    }
})();
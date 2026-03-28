export async function collectAndSendData() {
  function getPlugins() {
    try {
      return Array.from(navigator.plugins).map(p => p.name);
    } catch(e) {
      return [];
    }
  }
  
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Keyshaun.dev", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Keyshaun.dev", 4, 17);
      return canvas.toDataURL().substring(0, 100);
    } catch(e) {
      return "Not available";
    }
  }
  
  function getWebGLVendor() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
      return "Not available";
    } catch(e) {
      return "Not available";
    }
  }
  
  function getFonts() {
    const fonts = ["Arial", "Verdana", "Times New Roman", "Courier New", "Georgia", "Comic Sans MS", "Impact", "Helvetica", "Tahoma", "Trebuchet MS"];
    const available = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    fonts.forEach(font => {
      ctx.font = `72px '${font}', monospace`;
      const width = ctx.measureText("abcdefghijklmnopqrstuvwxyz").width;
      ctx.font = "72px monospace";
      const baseWidth = ctx.measureText("abcdefghijklmnopqrstuvwxyz").width;
      if (width !== baseWidth) {
        available.push(font);
      }
    });
    return available;
  }
  
  async function getBatteryInfo() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return {
          level: Math.floor(battery.level * 100),
          charging: battery.charging
        };
      }
      return null;
    } catch(e) {
      return null;
    }
  }
  
  async function getIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch(e) {
      return null;
    }
  }
  
  async function getGeolocation() {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
              const data = await response.json();
              resolve({
                city: data.address.city || data.address.town || data.address.village,
                region: data.address.state,
                country: data.address.country,
                zip: data.address.postcode,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            } catch(e) {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            }
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  }
  
  function getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) return "Windows";
    if (userAgent.indexOf("Mac") !== -1) return "macOS";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
    if (userAgent.indexOf("Android") !== -1) return "Android";
    if (userAgent.indexOf("iOS") !== -1) return "iOS";
    return "Unknown";
  }
  
  function getDevice() {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) return "Mobile";
    if (/Tablet|iPad/i.test(userAgent)) return "Tablet";
    return "Desktop";
  }
  
  function getBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Edg") !== -1) return "Edge";
    if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
    if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
    if (userAgent.indexOf("Safari") !== -1) return "Safari";
    if (userAgent.indexOf("Opera") !== -1) return "Opera";
    return "Unknown";
  }
  
  const userData = {
    ip: await getIP(),
    geolocation: await getGeolocation(),
    os: getOS(),
    device: getDevice(),
    browser: getBrowser(),
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || "Direct",
    platform: navigator.platform,
    cpuCores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : null,
    touchSupport: 'ontouchstart' in window,
    plugins: getPlugins(),
    canvasFingerprint: getCanvasFingerprint(),
    webglVendor: getWebGLVendor(),
    fonts: getFonts(),
    batteryInfo: await getBatteryInfo()
  };
  
  try {
    const response = await fetch('/api/botector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch(e) {
    console.error('Failed to send analytics data');
    return null;
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      collectAndSendData();
    });
  } else {
    collectAndSendData();
  }
}
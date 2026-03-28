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
  
  const userData = {
    ip: await getIP()
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
    console.error('Failed to send IP data');
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
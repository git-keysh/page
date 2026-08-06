function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const dropdown = document.querySelector('.nav-dropdown');
  if (!hamburger || !dropdown) return;

  hamburger.classList.toggle('active');
  dropdown.classList.toggle('active');
}

function closeMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const dropdown = document.querySelector('.nav-dropdown');
  if (!hamburger || !dropdown) return;

  hamburger.classList.remove('active');
  dropdown.classList.remove('active');
}

function initA6Nav() {
  const dropdownLinks = document.querySelectorAll('.nav-dropdown a');
  const dropdown = document.querySelector('.nav-dropdown');
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileToggle = document.getElementById('mode-toggle-mobile');
  const desktopToggle = document.getElementById('mode-toggle');

  if (!dropdownLinks.length) return;

  dropdownLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  if (mobileToggle && desktopToggle) {
    mobileToggle.addEventListener('click', () => {
      desktopToggle.click();
    });
  }

  document.addEventListener('click', (event) => {
    if (!dropdown || !hamburger) return;
    if (!dropdown.classList.contains('active')) return;
    if (dropdown.contains(event.target) || hamburger.contains(event.target)) return;
    closeMobileMenu();
  });

  dropdownLinks.forEach((link) => {
    const isCurrent =
      link.href === window.location.href ||
      (window.location.pathname.includes('index.html') && link.href.includes('index.html'));
    link.classList.toggle('active', isCurrent);
  });
}

function initA6ContactForm() {
  const form = document.getElementById('a6-contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('a6-name').value.trim();
    const vehicle = document.getElementById('a6-vehicle').value.trim();
    const phone = document.getElementById('a6-phone').value.trim();
    const details = document.getElementById('a6-details').value.trim();
    const cleanedPhone = phone.replace(/\D/g, '');

    if (cleanedPhone.length < 7 || cleanedPhone.length > 11) {
      window.alert('Phone number must be between 7 and 11 digits.');
      const phoneInput = document.getElementById('a6-phone');
      if (phoneInput) {
        phoneInput.focus();
      }
      return;
    }

    const lines = [
      'Hello A6 Audio, I would like to book an installation.',
      `Name: ${name}`,
      `Vehicle: ${vehicle}`,
      `Phone: ${cleanedPhone}`,
      `Details: ${details || 'N/A'}`
    ];

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/18687168237?text=${message}`, '_blank');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initA6Nav();
  initA6ContactForm();
});

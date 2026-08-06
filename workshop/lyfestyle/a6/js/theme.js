(function initA6Theme() {
  const root = document.body;
  if (!root) return;

  const storageKey = 'a6-theme';
  const sharedThemeKey = 'site-theme';
  const savedTheme = localStorage.getItem(storageKey);
  const sharedTheme = localStorage.getItem(sharedThemeKey);
  const initialTheme = sharedTheme || savedTheme || 'light';
  const darkMode = initialTheme === 'dark';

  if (darkMode) {
    root.classList.add('dark-mode');
  }

  localStorage.setItem(storageKey, darkMode ? 'dark' : 'light');
  localStorage.setItem(sharedThemeKey, darkMode ? 'dark' : 'light');

  const syncToggleLabel = () => {
    const isDark = root.classList.contains('dark-mode');
    const label = isDark ? 'LIGHT MODE' : 'DARK MODE';
    const controls = document.querySelectorAll('#mode-toggle, #mode-toggle-mobile');

    controls.forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      button.textContent = label;
      button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  };

  const toggleTheme = () => {
    root.classList.add('theme-animating');
    root.classList.toggle('dark-mode');
    const currentTheme = root.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem(storageKey, currentTheme);
    localStorage.setItem(sharedThemeKey, currentTheme);
    syncToggleLabel();
    window.setTimeout(() => {
      root.classList.remove('theme-animating');
    }, 760);
  };

  document.querySelectorAll('#mode-toggle, #mode-toggle-mobile').forEach((button) => {
    button.addEventListener('click', toggleTheme);
  });

  syncToggleLabel();
})();

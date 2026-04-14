// layout.js

(function(){
  "use strict";

  const selectionScreen = document.getElementById('selectionScreen');
  const layoutContainer = document.getElementById('layoutContainer');
  const changeBtn = document.getElementById('changeLayoutBtn');

  let currentLayoutNumber = null;

  function removeInjectedStyles() {
    const styles = document.querySelectorAll('style[data-layout-style]');
    styles.forEach(style => style.remove());
  }

  function showSelection() {
    if (layoutContainer) {
      layoutContainer.classList.add('hidden');
      layoutContainer.innerHTML = '';
    }
    selectionScreen.classList.remove('hidden');
    currentLayoutNumber = null;
    removeInjectedStyles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadLayout(layoutNum) {
    try {
      const url = `layouts/${layoutNum}-layout.html`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Layout not found');
      const html = await response.text();

      removeInjectedStyles();

      selectionScreen.classList.add('hidden');
      layoutContainer.innerHTML = html;
      layoutContainer.classList.remove('hidden');

      const styleBlocks = layoutContainer.querySelectorAll('style');
      styleBlocks.forEach(style => {
        style.setAttribute('data-layout-style', 'true');
      });

      currentLayoutNumber = layoutNum;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const imgs = layoutContainer.querySelectorAll('img');
      imgs.forEach(img => {
        img.loading = 'lazy';
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease';
        img.onload = () => { img.style.opacity = '1'; };
        if (img.complete) img.style.opacity = '1';
      });

    } catch (error) {
      console.warn(error);
      alert('Could not load layout. Please try again.');
    }
  }

  document.querySelectorAll('.layout-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const layout = card.dataset.layout;
      if (layout) loadLayout(layout);
    });
  });

  changeBtn.addEventListener('click', () => {
    showSelection();
  });

  if (window.location.hash === '#selection') {
    showSelection();
  }
})();
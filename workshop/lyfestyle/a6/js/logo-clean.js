function removeLightBackgroundFromLogo(imageElement) {
  if (!imageElement || imageElement.dataset.cleaned === 'true') return;

  const process = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;

      if (!canvas.width || !canvas.height) return;

      const context = canvas.getContext('2d');
      context.drawImage(imageElement, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        if (r > 220 && g > 220 && b > 220) {
          pixels[i + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      imageElement.src = canvas.toDataURL('image/png');
      imageElement.dataset.cleaned = 'true';
    } catch (error) {
      imageElement.dataset.cleaned = 'true';
    }
  };

  if (imageElement.complete) {
    process();
  } else {
    imageElement.addEventListener('load', process, { once: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const logoImages = document.querySelectorAll('img[data-remove-bg="true"]');
  logoImages.forEach(removeLightBackgroundFromLogo);
});

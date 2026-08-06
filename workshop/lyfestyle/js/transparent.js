(function() {
    function removeWhiteBackground(img) {
        if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
            return;
        }
        if (img.dataset.bgProcessed === 'true') {
            return;
        }
        if (img.src.includes('.svg') || img.src.includes('placeholder')) {
            img.dataset.bgProcessed = 'true';
            return;
        }
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = img.naturalWidth || img.width;
            var h = img.naturalHeight || img.height;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            var imageData = ctx.getImageData(0, 0, w, h);
            var data = imageData.data;
            var len = data.length;
            var pixelsModified = 0;
            var tolerance = 25;
            for (var i = 0; i < len; i += 4) {
                var r = data[i];
                var g = data[i + 1];
                var b = data[i + 2];
                var a = data[i + 3];
                if (a < 5) continue;
                var isWhite = (r > 250 && g > 250 && b > 250);
                var isLight = (r > 235 && g > 235 && b > 235);
                var isNearWhite = (r > 245 - tolerance && g > 245 - tolerance && b > 245 - tolerance);
                if (isWhite || isLight || isNearWhite) {
                    data[i + 3] = 0;
                    pixelsModified++;
                }
            }
            if (pixelsModified > 0) {
                ctx.putImageData(imageData, 0, 0);
                var newSrc = canvas.toDataURL('image/png');
                img.dataset.bgProcessed = 'true';
                if (!img.dataset.originalSrc) {
                    img.dataset.originalSrc = img.src;
                }
                img.src = newSrc;
            } else {
                img.dataset.bgProcessed = 'true';
            }
        } catch (e) {
            img.dataset.bgProcessed = 'true';
        }
    }

    function processAllImages() {
        var images = document.querySelectorAll('.product-card img, .image-box img, .product-grid img, #main-img, .thumb img, .rpc-image img, .product-image-section img, .gallery-container img');
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            if (img.dataset.bgProcessed === 'true') continue;
            if (img.complete && img.naturalWidth > 0) {
                removeWhiteBackground(img);
            } else {
                img.addEventListener('load', function() {
                    removeWhiteBackground(this);
                }, { once: true });
            }
        }
    }

    function processImagesWithDelay(delay) {
        setTimeout(processAllImages, delay || 100);
    }

    var isReady = false;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            isReady = true;
            processImagesWithDelay(100);
        });
    } else {
        isReady = true;
        processImagesWithDelay(100);
    }

    var observer = new MutationObserver(function() {
        var images = document.querySelectorAll('img:not([data-bg-processed])');
        if (images.length > 0) {
            processImagesWithDelay(50);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    var dynamicContent = document.getElementById('dynamic-content');
    if (dynamicContent) {
        var contentObserver = new MutationObserver(function() {
            processImagesWithDelay(50);
        });
        contentObserver.observe(dynamicContent, { childList: true, subtree: true });
    }

    var shopGrid = document.getElementById('product-grid');
    if (shopGrid) {
        var gridObserver = new MutationObserver(function() {
            processImagesWithDelay(50);
        });
        gridObserver.observe(shopGrid, { childList: true, subtree: true });
    }

    window.removeWhiteBackgroundFromImages = processAllImages;
    window.processProductImages = processImagesWithDelay;
})();
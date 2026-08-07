(function() {
    function removeWhiteBackground(img) {
        // Skip if already processed or invalid
        if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
            return;
        }
        if (img.dataset.bgProcessed === 'true') {
            return;
        }
        // Skip SVGs, placeholders, and logos
        if (img.src.includes('.svg') || img.src.includes('placeholder') || img.src.includes('logo')) {
            img.dataset.bgProcessed = 'true';
            return;
        }
        
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = img.naturalWidth || img.width;
            var h = img.naturalHeight || img.height;
            
            // Skip very small images
            if (w < 50 || h < 50) {
                img.dataset.bgProcessed = 'true';
                return;
            }
            
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            
            var imageData = ctx.getImageData(0, 0, w, h);
            var data = imageData.data;
            var len = data.length;
            
            // First, detect if image has a solid white/black background
            var edgePixels = [];
            var edgeCount = 0;
            var bgColor = null;
            var isSolidBg = false;
            
            // Sample edges (top, bottom, left, right rows)
            var samplePoints = [];
            // Top row
            for (var x = 0; x < w; x += Math.max(1, Math.floor(w / 20))) {
                samplePoints.push({x: x, y: 0});
            }
            // Bottom row
            for (var x = 0; x < w; x += Math.max(1, Math.floor(w / 20))) {
                samplePoints.push({x: x, y: h - 1});
            }
            // Left column
            for (var y = 0; y < h; y += Math.max(1, Math.floor(h / 20))) {
                samplePoints.push({x: 0, y: y});
            }
            // Right column
            for (var y = 0; y < h; y += Math.max(1, Math.floor(h / 20))) {
                samplePoints.push({x: w - 1, y: y});
            }
            
            var whiteCount = 0;
            var blackCount = 0;
            var totalSamples = samplePoints.length;
            
            for (var s = 0; s < samplePoints.length; s++) {
                var px = samplePoints[s].x;
                var py = samplePoints[s].y;
                var idx = (py * w + px) * 4;
                var r = data[idx];
                var g = data[idx + 1];
                var b = data[idx + 2];
                var a = data[idx + 3];
                
                // Only consider opaque pixels
                if (a < 10) continue;
                
                // Check if it's white (very light)
                if (r > 240 && g > 240 && b > 240) {
                    whiteCount++;
                }
                // Check if it's black (very dark)
                else if (r < 20 && g < 20 && b < 20) {
                    blackCount++;
                }
            }
            
            // Determine if we should process this image
            var shouldProcess = false;
            var isWhiteBg = false;
            var isBlackBg = false;
            
            // If more than 40% of edge pixels are white, it's a white background
            if (whiteCount / totalSamples > 0.4) {
                shouldProcess = true;
                isWhiteBg = true;
            }
            // If more than 40% of edge pixels are black, it's a black background
            else if (blackCount / totalSamples > 0.4) {
                shouldProcess = true;
                isBlackBg = true;
            }
            
            // If no solid background detected, skip processing
            if (!shouldProcess) {
                img.dataset.bgProcessed = 'true';
                return;
            }
            
            // Now process the image - only remove pixels matching the background color
            var pixelsModified = 0;
            var tolerance = 30;
            
            for (var i = 0; i < len; i += 4) {
                var r = data[i];
                var g = data[i + 1];
                var b = data[i + 2];
                var a = data[i + 3];
                
                // Skip already transparent pixels
                if (a < 10) continue;
                
                var isBgPixel = false;
                
                if (isWhiteBg) {
                    // Check if pixel is white/light
                    isBgPixel = (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance);
                } else if (isBlackBg) {
                    // Check if pixel is black/dark
                    isBgPixel = (r < tolerance && g < tolerance && b < tolerance);
                }
                
                if (isBgPixel) {
                    data[i + 3] = 0;
                    pixelsModified++;
                }
            }
            
            // Only update if we actually modified pixels
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
            // Silent fail - mark as processed to avoid retrying
            img.dataset.bgProcessed = 'true';
        }
    }

    function processAllImages() {
        // Only target product images specifically
        var images = document.querySelectorAll('.product-card img, .image-box img, .product-grid img, #main-img, .thumb img, .rpc-image img, .product-image-section img, .gallery-container img');
        
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            if (img.dataset.bgProcessed === 'true') continue;
            
            // Skip images that are clearly logos or icons
            if (img.alt && (img.alt.toLowerCase().includes('logo') || img.alt.toLowerCase().includes('icon'))) {
                img.dataset.bgProcessed = 'true';
                continue;
            }
            
            // Skip images with specific classes that shouldn't be processed
            if (img.closest('.nav-logo') || img.closest('.logo-container') || img.closest('.social-icons')) {
                img.dataset.bgProcessed = 'true';
                continue;
            }
            
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

    // Initial processing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            processImagesWithDelay(200);
        });
    } else {
        processImagesWithDelay(200);
    }

    // Observer for dynamically added images
    var observer = new MutationObserver(function() {
        var images = document.querySelectorAll('.product-card img, .image-box img, .product-grid img:not([data-bg-processed])');
        if (images.length > 0) {
            processImagesWithDelay(100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Observer for product grid changes
    var shopGrid = document.getElementById('product-grid');
    if (shopGrid) {
        var gridObserver = new MutationObserver(function() {
            processImagesWithDelay(100);
        });
        gridObserver.observe(shopGrid, { childList: true, subtree: true });
    }

    // Expose functions globally
    window.removeWhiteBackgroundFromImages = processAllImages;
    window.processProductImages = processImagesWithDelay;
})();
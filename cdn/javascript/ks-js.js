(()=>{
    const splitOverlay = document.getElementById('split-overlay');
    const mainContent = document.getElementById('main-content');
    const video = document.getElementById('main-video');
    const videoFrame = document.querySelector('.video-frame');
    const bgAudio = document.getElementById('bg-audio');
    const topRow = document.querySelector('.top-row');
    const navRow = document.querySelector('.nav-row');
    const bottomContent = document.querySelector('.bottom-content');
    let videoPlayedOnce = false;

    if(video){
        video.muted = false;
        video.volume = 1;
        
        video.addEventListener('play', ()=>{
            if(!videoPlayedOnce){
                videoPlayedOnce = true;
            }
        });
        
        video.addEventListener('ended', ()=>{
            if(bgAudio){
                bgAudio.muted = false;
                bgAudio.volume = 0.5;
                bgAudio.play().catch(()=>{});
            }
            if(video){
                video.muted = true;
                video.loop = true;
                video.play().catch(()=>{});
            }
            if(topRow) topRow.classList.add('show');
            if(navRow) navRow.classList.add('show');
            if(bottomContent) bottomContent.classList.add('show');
        });
        
        video.play().catch(()=>{
            const retry = ()=>{
                video.play().catch(()=>{});
                document.body.removeEventListener('click', retry);
                document.body.removeEventListener('touchstart', retry);
            };
            document.body.addEventListener('click', retry);
            document.body.addEventListener('touchstart', retry);
        });
    }

    if(bgAudio){
        bgAudio.muted = true;
        bgAudio.loop = true;
    }

    setTimeout(()=>{
        if(splitOverlay){
            splitOverlay.classList.add('reveal');
        }
        setTimeout(()=>{
            if(splitOverlay){
                splitOverlay.style.display = 'none';
            }
            if(mainContent){
                mainContent.classList.add('visible');
            }
            if(videoFrame){
                videoFrame.classList.add('zoom-in');
            }
        }, 1000);
    }, 300);

    window.toggleMenu = function(){
        const menu = document.getElementById('nav-menu');
        if(menu) menu.classList.toggle('active');
    };

    const gestureZone = document.getElementById('gesture-zone');
    if(gestureZone){
        gestureZone.onclick = ()=> toggleMenu();
    }

    const closeBtn = document.getElementById('close-menu');
    if(closeBtn){
        closeBtn.onclick = ()=> toggleMenu();
    }

    let touchStart = 0;
    document.addEventListener('touchstart', (e)=>{
        touchStart = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e)=>{
        const touchEnd = e.changedTouches[0].clientY;
        const gesture = document.getElementById('gesture-zone');
        if(Math.abs(touchEnd - touchStart) < 10 && gesture && gesture.contains(e.target)){
            toggleMenu();
        }
    });
})();
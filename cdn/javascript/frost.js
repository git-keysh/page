document.addEventListener("DOMContentLoaded",async function(){
    let profileImg = document.getElementById("profile-img");
    let nameText = document.getElementById("name-text");
    let promptText = document.getElementById("prompt-text");
    let stage1 = document.getElementById("stage1");
    let videoContainer = document.getElementById("video-container");
    let currentVideo = null;
    let isPlaying = false;
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let hasVisited = localStorage.getItem("hasVisitedKeyshaun") === "true";
    let permissionGranted = false;
    let dustElements = null;
    let dustCanvas = null;
    let ctx = null;
    let particles = [];
    let dustActive = false;
    
    function createDustElements(){
        if(document.querySelector(".dust-left")) return;
        
        const leftDust = document.createElement("div");
        leftDust.className = "dust-left";
        const rightDust = document.createElement("div");
        rightDust.className = "dust-right";
        document.body.appendChild(leftDust);
        document.body.appendChild(rightDust);
        
        dustCanvas = document.createElement("canvas");
        dustCanvas.id = "dust-canvas";
        document.body.appendChild(dustCanvas);
        ctx = dustCanvas.getContext("2d");
        
        function resizeCanvas(){
            dustCanvas.width = window.innerWidth;
            dustCanvas.height = window.innerHeight;
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        
        dustElements = { left: leftDust, right: rightDust };
        
        setTimeout(() => {
            leftDust.classList.add("active");
            rightDust.classList.add("active");
            dustActive = true;
            animateDust();
        }, 3000);
    }
    
    function animateDust(){
        if(!dustActive) return;
        
        if(ctx){
            ctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
            
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                
                if(p.life <= 0){
                    particles.splice(i,1);
                } else {
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, p.color);
                    gradient.addColorStop(1, "transparent");
                    ctx.fillStyle = gradient;
                    ctx.globalAlpha = p.life * 0.8;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        requestAnimationFrame(animateDust);
    }
    
    function addDustParticle(x, y, isLeft){
        const color = isLeft ? "rgba(255, 20, 147, 0.8)" : "rgba(0, 255, 127, 0.8)";
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            size: Math.random() * 15 + 5,
            life: 1,
            color: color
        });
    }
    
    function handleMouseMove(e){
        if(!dustActive) return;
        
        const x = e.clientX;
        const y = e.clientY;
        const screenWidth = window.innerWidth;
        
        const isLeft = x < screenWidth / 2;
        
        for(let i = 0; i < 5; i++){
            addDustParticle(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, isLeft);
        }
        
        if(dustElements){
            if(isLeft){
                dustElements.left.style.transform = `translateX(${Math.min(30, (screenWidth/2 - x) / 20)}px)`;
            } else {
                dustElements.right.style.transform = `translateX(${Math.max(-30, (screenWidth/2 - x) / 20)}px)`;
            }
        }
    }
    
    function handleTouchMove(e){
        e.preventDefault();
        const touch = e.touches[0];
        if(touch){
            handleMouseMove(touch);
        }
    }
    
    function combineDust(){
        if(!dustElements) return;
        
        dustElements.left.style.transition = "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        dustElements.right.style.transition = "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
        
        dustElements.left.style.transform = "translateX(100%)";
        dustElements.right.style.transform = "translateX(-100%)";
        dustElements.left.style.opacity = "0";
        dustElements.right.style.opacity = "0";
        
        for(let i = 0; i < 100; i++){
            setTimeout(() => {
                addDustParticle(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    Math.random() > 0.5
                );
            }, i * 20);
        }
        
        setTimeout(() => {
            if(dustElements.left) dustElements.left.remove();
            if(dustElements.right) dustElements.right.remove();
            if(dustCanvas) dustCanvas.remove();
            dustActive = false;
        }, 2000);
    }
    
    if(window.checkAutoplayPermission){
        await window.checkAutoplayPermission();
        permissionGranted = localStorage.getItem("autoplayPermission") === "granted";
    }
    
    setTimeout(function(){
        profileImg.classList.add("fade-in");
        setTimeout(function(){
            profileImg.classList.add("shrink-up");
            setTimeout(function(){
                nameText.classList.add("slide-down");
                setTimeout(function(){
                    if(!hasVisited){
                        promptText.classList.add("show");
                    }
                },750)
            },300)
        },1200)
    },500);
    
    function fadeOutStage1(callback){
        stage1.style.transition = "opacity 0.8s cubic-bezier(0.4,0,0.2,1)";
        stage1.style.opacity = "0";
        setTimeout(callback, 800);
    }
    
    async function playVideo(videoSrc, callback, rotateForMobile = false){
        videoContainer.style.display = "flex";
        videoContainer.style.opacity = "0";
        videoContainer.style.transition = "opacity 0.5s ease";
        
        setTimeout(function(){
            videoContainer.style.opacity = "1";
        }, 50);
        
        let video = document.createElement("video");
        video.src = videoSrc;
        video.playsInline = true;
        video.webkitPlaysInline = true;
        video.loop = false;
        video.controls = false;
        video.style.position = "absolute";
        video.style.top = "50%";
        video.style.left = "50%";
        
        if(permissionGranted){
            video.muted = false;
        } else {
            video.muted = true;
        }
        
        videoContainer.innerHTML = "";
        videoContainer.appendChild(video);
        currentVideo = video;
        
        if(isMobile && rotateForMobile){
            if(window.setMobileVideoRotation){
                window.setMobileVideoRotation(true);
            }
            video.style.width = "auto";
            video.style.height = "100%";
            video.style.transform = "translate(-50%, -50%) rotate(90deg)";
            video.style.objectFit = "cover";
        } else if(isMobile){
            if(window.setMobileVideoRotation){
                window.setMobileVideoRotation(false);
            }
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.transform = "translate(-50%, -50%)";
            video.style.objectFit = "cover";
        } else {
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.transform = "translate(-50%, -50%)";
            video.style.objectFit = "cover";
        }
        
        video.style.minWidth = "100%";
        video.style.minHeight = "100%";
        
        try {
            await video.play();
            console.log("Playing:", videoSrc);
            
            if(videoSrc.includes("itvrt.mp4")){
                createDustElements();
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("touchmove", handleTouchMove, { passive: false });
                
                setTimeout(() => {
                    combineDust();
                }, 8000);
            }
        } catch(error) {
            console.log("Play failed:", error);
            video.muted = true;
            try {
                await video.play();
                console.log("Playing muted:", videoSrc);
            } catch(e2) {
                console.log("Cannot play even muted");
            }
        }
        
        video.addEventListener("ended", function(){
            videoContainer.style.transition = "opacity 0.5s ease";
            videoContainer.style.opacity = "0";
            setTimeout(function(){
                videoContainer.style.display = "none";
                videoContainer.innerHTML = "";
                if(callback) callback();
            }, 500);
        });
    }
    
    function startMobileFlow(){
        fadeOutStage1(function(){
            playVideo("cdn/assets/rotation.mp4", function(){
                setTimeout(function(){
                    playVideo("cdn/assets/itvrt.mp4", function(){
                        setTimeout(function(){
                            window.location.href = "home.html";
                        }, 2000);
                    }, true);
                }, 500);
            });
        });
    }
    
    function startDesktopFlow(){
        fadeOutStage1(function(){
            playVideo("cdn/assets/itvrt.mp4", function(){
                setTimeout(function(){
                    window.location.href = "home.html";
                }, 2000);
            });
        });
    }
    
    function startExperience(){
        if(isPlaying) return;
        isPlaying = true;
        
        if(!hasVisited){
            localStorage.setItem("hasVisitedKeyshaun", "true");
        }
        
        if(isMobile){
            startMobileFlow();
        } else {
            startDesktopFlow();
        }
    }
    
    if(hasVisited){
        promptText.style.display = "none";
        setTimeout(function(){
            startExperience();
        }, 1000);
    }
    
    document.body.addEventListener("click", function(){
        if(!hasVisited && !isPlaying){
            startExperience();
        }
    });
    
    document.body.addEventListener("touchstart", function(){
        if(!hasVisited && !isPlaying){
            startExperience();
        }
    });
});
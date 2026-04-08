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
        video.style.transform = "translate(-50%, -50%)";
        
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
        } else if(isMobile){
            if(window.setMobileVideoRotation){
                window.setMobileVideoRotation(false);
            }
        }
        
        if(isMobile){
            video.style.maxWidth = "100%";
            video.style.maxHeight = "100%";
            video.style.width = "auto";
            video.style.height = "auto";
            video.style.objectFit = "contain";
        } else {
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "contain";
        }
        
        try {
            await video.play();
            console.log("Playing:", videoSrc);
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
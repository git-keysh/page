document.addEventListener("DOMContentLoaded",function(){
    let profileImg = document.getElementById("profile-img");
    let nameText = document.getElementById("name-text");
    let promptText = document.getElementById("prompt-text");
    let stage1 = document.getElementById("stage1");
    let videoContainer = document.getElementById("video-container");
    let currentVideo = null;
    let isPlaying = false;
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let hasVisited = localStorage.getItem("hasVisitedKeyshaun") === "true";
    let audioUnlocked = false;
    
    function unlockAudioContext(){
        if(audioUnlocked) return;
        let silentVideo = document.createElement("video");
        silentVideo.muted = false;
        silentVideo.volume = 0.1;
        silentVideo.play().then(function(){
            silentVideo.pause();
            silentVideo.currentTime = 0;
            audioUnlocked = true;
            console.log("Audio unlocked");
        }).catch(function(e){
            console.log("Audio unlock failed:", e);
        });
    }
    
    document.body.addEventListener("click", unlockAudioContext);
    document.body.addEventListener("touchstart", unlockAudioContext);
    
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
    
    function playVideo(videoSrc, callback, rotateForMobile = false){
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
        video.muted = false;
        video.autoplay = true;
        video.loop = false;
        video.controls = false;
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "contain";
        
        if(rotateForMobile && isMobile){
            video.style.transform = "rotate(90deg)";
            video.style.transformOrigin = "center center";
        }
        
        videoContainer.innerHTML = "";
        videoContainer.appendChild(video);
        currentVideo = video;
        
        function attemptPlay(){
            let playPromise = video.play();
            if(playPromise !== undefined){
                playPromise.then(function(){
                    console.log("Playing:", videoSrc);
                }).catch(function(error){
                    console.log("Autoplay failed, retrying:", error);
                    setTimeout(attemptPlay, 500);
                });
            }
        }
        
        attemptPlay();
        
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
            unlockAudioContext();
            startExperience();
        }
    });
    
    document.body.addEventListener("touchstart", function(){
        if(!hasVisited && !isPlaying){
            unlockAudioContext();
            startExperience();
        }
    });
});
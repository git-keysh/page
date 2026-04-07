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
    
    // Animation sequence for stage 1
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
    
    // Function to fade out stage 1
    function fadeOutStage1(callback){
        stage1.style.transition = "opacity 0.8s cubic-bezier(0.4,0,0.2,1)";
        stage1.style.opacity = "0";
        setTimeout(callback, 800);
    }
    
    // Function to play video full screen with unmuted audio
    function playVideo(videoSrc, callback, rotateLeft = false){
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

        if(rotateLeft && isMobile){
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    video.style.transform = "rotate(-90deg) scale(1.4)";
    video.style.transformOrigin = "center center";
        } else {
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
}
        
        videoContainer.appendChild(video);
        currentVideo = video;
        
        let playPromise = video.play();
        if(playPromise !== undefined){
            playPromise.catch(function(error){
                console.log("Autoplay prevented, retrying with user interaction");
                document.body.addEventListener("click", function retryPlay(){
                    video.play().catch(function(){});
                    document.body.removeEventListener("click", retryPlay);
                }, {once: true});
            });
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
    
    // Function to handle mobile rotation flow
    function startMobileFlow(){
        fadeOutStage1(function(){
            playVideo("cdn/assets/rotation.mp4", function(){
                setTimeout(function(){
                    playVideo("cdn/assets/itvrt.mp4", function(){
                        setTimeout(function(){
                            window.location.href = "home.html";
                        }, 300);
                    }, true);
                }, 500);
            });
        });
    }
    
    // Function to handle desktop flow
    function startDesktopFlow(){
        fadeOutStage1(function(){
            playVideo("cdn/assets/itvrt.mp4", function(){
                setTimeout(function(){
                    window.location.href = "home.html";
                }, 100);
            });
        });
    }
    
    // Main logic for starting the experience
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
    
    // Second visit: auto-start after 1 second
    if(hasVisited){
        promptText.style.display = "none";
        setTimeout(function(){
            startExperience();
        }, 1000);
    }
    
    // First visit: wait for click
    document.body.addEventListener("click", function(){
        if(!hasVisited && !isPlaying){
            startExperience();
        }
    });
});
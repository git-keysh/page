(function(){
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if(!isMobile) return;
    
    function fixMobileVideo(videoElement, isRotated = false){
        if(!videoElement) return;
        
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const screenRatio = screenWidth / screenHeight;
        
        let videoWidth = 848;
        let videoHeight = 478;
        
        if(isRotated){
            videoWidth = 478;
            videoHeight = 848;
        }
        
        const videoRatio = videoWidth / videoHeight;
        
        let scaleWidth, scaleHeight;
        
        if(videoRatio > screenRatio){
            scaleWidth = screenWidth;
            scaleHeight = screenWidth / videoRatio;
        } else {
            scaleHeight = screenHeight;
            scaleWidth = screenHeight * videoRatio;
        }
        
        videoElement.style.position = "absolute";
        videoElement.style.top = "50%";
        videoElement.style.left = "50%";
        videoElement.style.transform = "translate(-50%, -50%)";
        videoElement.style.width = scaleWidth + "px";
        videoElement.style.height = scaleHeight + "px";
        videoElement.style.maxWidth = "none";
        videoElement.style.maxHeight = "none";
        videoElement.style.objectFit = "contain";
        
        if(isRotated){
            videoElement.style.transform = "translate(-50%, -50%) rotate(90deg)";
        }
    }
    
    function observeVideoContainer(){
        const container = document.getElementById("video-container");
        if(!container) return;
        
        const observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
                if(mutation.addedNodes.length){
                    mutation.addedNodes.forEach(function(node){
                        if(node.nodeName === "VIDEO"){
                            const isRotated = node.src.includes("itvrt") && 
                                            (localStorage.getItem("lastRotated") === "true");
                            fixMobileVideo(node, isRotated);
                            
                            node.addEventListener("loadedmetadata", function(){
                                fixMobileVideo(node, isRotated);
                            });
                        }
                    });
                }
            });
        });
        
        observer.observe(container, { childList: true, subtree: true });
    }
    
    window.setMobileVideoRotation = function(shouldRotate){
        localStorage.setItem("lastRotated", shouldRotate);
        
        const video = document.querySelector("#video-container video");
        if(video){
            fixMobileVideo(video, shouldRotate);
        }
    };
    
    window.addEventListener("resize", function(){
        const video = document.querySelector("#video-container video");
        if(video && video.style.display !== "none"){
            const isRotated = localStorage.getItem("lastRotated") === "true";
            fixMobileVideo(video, isRotated);
        }
    });
    
    observeVideoContainer();
    
    console.log("Mobile video fixer loaded");
})();
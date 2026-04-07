(function(){
    let videosToPreload = ["cdn/assets/rotation.mp4", "cdn/assets/itvrt.mp4"];
    
    videosToPreload.forEach(function(src){
        let video = document.createElement("video");
        video.preload = "auto";
        video.muted = false;
        video.src = src;
        video.load();
    });
    
    function unlockAudio(){
        let testVideo = document.createElement("video");
        testVideo.muted = false;
        testVideo.volume = 0.5;
        let playPromise = testVideo.play();
        if(playPromise !== undefined){
            playPromise.then(function(){
                testVideo.pause();
                testVideo.currentTime = 0;
                console.log("Audio permission granted");
            }).catch(function(e){
                console.log("Audio still locked:", e);
            });
        }
        document.body.removeEventListener("click", unlockAudio);
        document.body.removeEventListener("touchstart", unlockAudio);
        document.body.removeEventListener("touchend", unlockAudio);
    }
    
    document.body.addEventListener("click", unlockAudio);
    document.body.addEventListener("touchstart", unlockAudio);
    document.body.addEventListener("touchend", unlockAudio);
    
    console.log("Permission handler ready - waiting for user interaction");
})();
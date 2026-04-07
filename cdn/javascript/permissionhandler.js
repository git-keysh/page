// Permission handler to ensure unmuted audio on all browsers
(function(){
    // Preload videos to establish audio context
    let videosToPreload = [];
    
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        videosToPreload = ["cdn/assets/rotation.mp4", "cdn/assets/itvrt.mp4"];
    } else {
        videosToPreload = ["cdn/assets/itvrt.mp4"];
    }
    
    // Preload videos
    videosToPreload.forEach(function(src){
        let video = document.createElement("video");
        video.preload = "auto";
        video.muted = false;
        video.src = src;
        video.load();
    });
    
    // Function to unlock audio on user interaction
    function unlockAudio(){
        let testVideo = document.createElement("video");
        testVideo.muted = false;
        testVideo.volume = 0.5;
        let playPromise = testVideo.play();
        if(playPromise !== undefined){
            playPromise.then(function(){
                testVideo.pause();
                testVideo.currentTime = 0;
            }).catch(function(){
                // Audio will be unlocked on actual play
            });
        }
        document.body.removeEventListener("click", unlockAudio);
        document.body.removeEventListener("touchstart", unlockAudio);
    }
    
    // Add event listeners to unlock audio on first user interaction
    document.body.addEventListener("click", unlockAudio);
    document.body.addEventListener("touchstart", unlockAudio);
    
    console.log("Permission handler ready - audio will be unmuted on playback");
})();
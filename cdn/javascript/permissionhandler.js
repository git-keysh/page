(function(){
    let audioUnlocked = false;
    
    function unlockMedia(){
        if(audioUnlocked) return;
        
        let silentVideo = document.createElement("video");
        silentVideo.muted = false;
        silentVideo.volume = 0.1;
        silentVideo.play().then(() => {
            silentVideo.pause();
            silentVideo.currentTime = 0;
            audioUnlocked = true;
            console.log("Media permissions unlocked");
        }).catch(() => {});
        
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.resume().then(() => {
            console.log("AudioContext resumed");
        }).catch(() => {});
        
        document.body.removeEventListener("click", unlockMedia);
        document.body.removeEventListener("touchstart", unlockMedia);
    }
    
    document.body.addEventListener("click", unlockMedia);
    document.body.addEventListener("touchstart", unlockMedia);
    
    window.forceUnlockMedia = function(){
        unlockMedia();
    };
    
    console.log("Permission handler ready - waiting for user click");
})();
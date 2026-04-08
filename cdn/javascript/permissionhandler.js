(function(){
    let hasPermission = localStorage.getItem("autoplayPermission") === "granted";
    
    async function requestAutoplayPermission(){
        try {
            const testVideo = document.createElement("video");
            testVideo.muted = false;
            testVideo.src = "cdn/assets/itvrt.mp4";
            testVideo.load();
            
            const playPromise = testVideo.play();
            
            if(playPromise !== undefined){
                await playPromise;
                testVideo.pause();
                testVideo.currentTime = 0;
                localStorage.setItem("autoplayPermission", "granted");
                console.log("Autoplay permission GRANTED");
                return true;
            }
        } catch(e) {
            console.log("Autoplay permission DENIED:", e);
            localStorage.setItem("autoplayPermission", "denied");
            return false;
        }
        return false;
    }
    
    async function showPermissionPrompt(){
        const overlay = document.createElement("div");
        overlay.id = "permission-overlay";
        overlay.style.cssText = `
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.95);
            z-index:20000;
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            font-family:'SF Pro Display',sans-serif;
            text-align:center;
            padding:2rem;
        `;
        
        overlay.innerHTML = `
            <div style="background:#111;border:1px solid #333;border-radius:20px;padding:2rem;max-width:400px;">
                <div style="font-size:3rem;margin-bottom:1rem;">🔊</div>
                <h2 style="color:#fff;margin-bottom:1rem;font-size:1.5rem;">Allow Audio & Video</h2>
                <p style="color:#aaa;margin-bottom:2rem;line-height:1.5;">This experience includes sound. Please allow autoplay to continue.</p>
                <button id="allow-autoplay" style="background:#fff;color:#000;border:none;padding:12px 30px;border-radius:30px;font-size:1rem;font-weight:600;cursor:pointer;margin-bottom:1rem;">Allow & Continue</button>
                <button id="continue-muted" style="background:transparent;color:#666;border:none;font-size:0.8rem;cursor:pointer;">Continue without sound</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        return new Promise((resolve) => {
            document.getElementById("allow-autoplay").onclick = async () => {
                const granted = await requestAutoplayPermission();
                overlay.remove();
                resolve(granted);
            };
            
            document.getElementById("continue-muted").onclick = () => {
                localStorage.setItem("autoplayPermission", "muted");
                overlay.remove();
                resolve(false);
            };
        });
    }
    
    window.checkAutoplayPermission = async function(){
        if(hasPermission === "granted"){
            console.log("Permission already granted");
            return true;
        }
        
        if(hasPermission === "denied" || hasPermission === "muted"){
            console.log("Permission previously denied or muted");
            return false;
        }
        
        return await showPermissionPrompt();
    };
    
    window.forcePlayVideo = async function(videoElement){
        if(!videoElement) return false;
        
        try {
            videoElement.muted = false;
            await videoElement.play();
            return true;
        } catch(e) {
            console.log("Force play failed:", e);
            
            if(hasPermission === "granted"){
                try {
                    videoElement.muted = true;
                    await videoElement.play();
                    return true;
                } catch(e2) {
                    return false;
                }
            }
            return false;
        }
    };
    
    console.log("Permission handler ready");
})();
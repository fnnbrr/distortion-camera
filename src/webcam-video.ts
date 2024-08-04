export async function requestWebcam(videoElement: HTMLVideoElement) {
    if (navigator.mediaDevices === undefined) {
        console.error(`Cannot access navigator.mediaDevices. Make sure you're using HTTPS.`);
        return;
    }
    
    const constraints: MediaStreamConstraints = {
        video: { 
            width: 1280,
            height: 720,
            facingMode: "user"
        }
    };
    
    const videoDevices: MediaDeviceInfo[] = [];
    
    try {
        await navigator.mediaDevices.getUserMedia(constraints);
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        devices.forEach((device) => {
            if (device.kind === "videoinput") {
                videoDevices.push(device);
            }
        });
        
        if (videoDevices.length === 0) {
            console.error(`No video input devices available`);
            return;
        }
        
        videoElement.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.play()
            .catch(err => console.error(`Error playing video: ${err}`));
    } catch (e) {
        console.error(`Error accessing webcam: ${e}`)
    }
}
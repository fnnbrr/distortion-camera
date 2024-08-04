export function requestWebcam(videoElement: HTMLVideoElement) {
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
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play()
                .catch(err => console.error(`Error playing video: ${err}`));
        })
        .catch(err => console.error(`Error accessing webcam: ${err}`));
}
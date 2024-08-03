export function requestWebcam(videoElement: HTMLVideoElement) {
    if (navigator.mediaDevices === undefined) {
        console.error(`Cannot access navigator.mediaDevices. Make sure you're using HTTPS.`);
        return;
    }
    
    navigator.mediaDevices.getUserMedia({video: true})
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play()
                .catch(err => console.error(`Error playing video: ${err}`));
        })
        .catch(err => console.error(`Error accessing webcam: ${err}`));
}
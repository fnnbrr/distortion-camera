const constraints: MediaStreamConstraints = {
    video: {
        width: 1280,
        height: 720,
        facingMode: "user"
    }
};

const videoDevices: MediaDeviceInfo[] = [];
let videoDeviceIndex = 0;

let stream: MediaStream;
let video: HTMLVideoElement;

export async function requestVideoInput(videoElement: HTMLVideoElement) {
    if (navigator.mediaDevices === undefined) {
        console.error(`Cannot access navigator.mediaDevices. Make sure you're using HTTPS.`);
        return;
    }
    
    video = videoElement;
    
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
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play()
            .catch(err => console.error(`Error playing video: ${err}`));
    } catch (e) {
        console.error(`Error accessing webcam: ${e}`)
    }
}

export async function nextVideoInput() {
    if (videoDevices.length < 2) return;
    
    stream.getTracks().forEach(track => track.stop());

    videoDeviceIndex += 1;
    videoDeviceIndex %= videoDevices.length;
    (constraints.video as MediaTrackConstraints).deviceId = { exact: videoDevices[videoDeviceIndex].deviceId };
    
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.play()
        .catch(err => console.error(`Error playing video: ${err}`));
}
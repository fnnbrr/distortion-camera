import './style.css'
import {VideoInput} from "./video-input.ts";
import {DistortionMesh} from "./distortion-mesh.ts";
import cameraSwitchIcon from "./assets/camera-switch-svgrepo-com.svg";
import deleteIcon from "./assets/delete-svgrepo-com.svg";

main();

async function main() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <video id="video" playsInline poster="${cameraSwitchIcon}"></video>
    <button id="reset-button"><img src="${deleteIcon}"></button>
    <button id="photo-button">take photo</button>
    <button id="swap-camera-button"><img src="${cameraSwitchIcon}"></button>
    `
    
    const parent = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
    const video = document.querySelector<HTMLVideoElement>('#video') as HTMLVideoElement;
    const resetButton = document.querySelector<HTMLButtonElement>('#reset-button') as HTMLButtonElement;
    const photoButton = document.querySelector<HTMLButtonElement>('#photo-button') as HTMLButtonElement;
    const swapCameraButton = document.querySelector<HTMLButtonElement>('#swap-camera-button') as HTMLButtonElement;
    
    const videoInput = new VideoInput(video);
    const distortionMesh = new DistortionMesh(video, parent);
    
    resetButton.addEventListener("click", () => distortionMesh.resetVertices());
    photoButton.addEventListener("click", () => distortionMesh.takePhoto());
    
    try {
        await videoInput.startNextVideoDevice();
        
        if (videoInput.hasMultipleVideoDevices()) {
            swapCameraButton.addEventListener("click", () => videoInput.startNextVideoDevice());
        }
        else {
            swapCameraButton.remove();
        }
    }
    catch (e) {
        console.log(e);
    }
}
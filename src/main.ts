import './style.css'
import {VideoInput} from "./video-input.ts";
import {DistortionMesh} from "./distortion-mesh.ts";
import cameraIcon from "./assets/photo-camera-svgrepo-com.svg";
import cameraSwitchIcon from "./assets/camera-switch-svgrepo-com.svg";
import deleteIcon from "./assets/delete-svgrepo-com.svg";

main();

async function main() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <video id="video" playsInline poster="${cameraIcon}"></video>
    <canvas id="canvas"></canvas>
    <button id="reset-button"><img src="${deleteIcon}"></button>
    <button id="photo-button">take photo</button>
    <button id="swap-camera-button"><img src="${cameraSwitchIcon}"></button>
    `
    
    const parent = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
    const video = document.querySelector<HTMLVideoElement>('#video') as HTMLVideoElement;
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas') as HTMLCanvasElement;
    const resetButton = document.querySelector<HTMLButtonElement>('#reset-button') as HTMLButtonElement;
    const photoButton = document.querySelector<HTMLButtonElement>('#photo-button') as HTMLButtonElement;
    const swapCameraButton = document.querySelector<HTMLButtonElement>('#swap-camera-button') as HTMLButtonElement;
    
    const videoInput = new VideoInput(video);
    const distortionMesh = new DistortionMesh(video, parent, canvas);
    
    resetButton.addEventListener("click", () => distortionMesh.resetVertices());
    photoButton.addEventListener("click", () => distortionMesh.takePhoto());
    
    try {
        distortionMesh.updateMirroring(await videoInput.startNextVideoDevice());
        
        if (videoInput.hasMultipleVideoDevices()) {
            swapCameraButton.addEventListener("click", async () => {
                distortionMesh.updateMirroring(await videoInput.startNextVideoDevice());
            });
        }
        else {
            swapCameraButton.remove();
        }
    }
    catch (e) {
        console.log(e);
    }
}
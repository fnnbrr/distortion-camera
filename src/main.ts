import './style.css'
import {nextVideoInput, requestVideoInput} from "./webcam-video.ts";
import {DistortionMesh} from "./distortionMesh.ts";
import viteLogo from "./assets/vite.svg"

main();

function main(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <video id="video" playsInline poster="${viteLogo}"></video>
    <button id="reset-button">reset</button>
    <button id="photo-button">take photo</button>
    <button id="swap-camera-button">swap camera</button>
    `
    
    const parent = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
    const video = document.querySelector<HTMLVideoElement>('#video') as HTMLVideoElement;
    const resetButton = document.querySelector<HTMLButtonElement>('#reset-button') as HTMLButtonElement;
    const photoButton = document.querySelector<HTMLButtonElement>('#photo-button') as HTMLButtonElement;
    const swapCameraButton = document.querySelector<HTMLButtonElement>('#swap-camera-button') as HTMLButtonElement;
    
    requestVideoInput(video);

    const distortionMesh = new DistortionMesh(video, parent);
    
    resetButton.addEventListener("click", () => distortionMesh.resetVertices());
    photoButton.addEventListener("click", () => distortionMesh.takePhoto());
    swapCameraButton.addEventListener("click", () => nextVideoInput());
}
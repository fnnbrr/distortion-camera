import './style.css'
import {requestWebcam} from "./webcam-video.ts";
import {DistortionMesh} from "./distortionMesh.ts";
import viteLogo from "../public/vite.svg";

main();

function main(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <video id="video" playsInline poster="${viteLogo}"></video>
    <button id="reset-button">reset</button>
    <button id="photo-button">take photo</button>
    `
    
    const parent = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
    const video = document.querySelector<HTMLVideoElement>('#video') as HTMLVideoElement;
    const resetButton = document.querySelector<HTMLButtonElement>('#reset-button') as HTMLButtonElement;
    const photoButton = document.querySelector<HTMLButtonElement>('#photo-button') as HTMLButtonElement;
    
    requestWebcam(video);

    const distortionMesh = new DistortionMesh(video, parent);
    
    resetButton.addEventListener("click", () => distortionMesh.resetVertices());
    photoButton.addEventListener("click", () => distortionMesh.takePhoto());
}
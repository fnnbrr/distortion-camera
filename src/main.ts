import './style.css'
import {requestWebcam} from "./webcam-video.ts";
import {DistortionMesh} from "./distortionMesh.ts";

main();

function main(): void {
    const videoElement = document.querySelector<HTMLVideoElement>('#video');
    const parent = document.querySelector<HTMLDivElement>('#app');
    if (videoElement === null || parent === null) {
        console.error(`Could not find required HTML elements with querySelector`);
        return;
    }
    
    requestWebcam(videoElement);

    const distortionMesh = new DistortionMesh(videoElement, parent);
    console.log(distortionMesh.isDragging);  // TODO: remove
}
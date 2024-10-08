import './style.css'
import {VideoInput} from "./video-input.ts";
import {VideoPlaneRenderer} from "./video-plane-renderer.ts";
import {VideoRendererSizer} from "./video-renderer-sizer.ts";
import cameraIcon from "./assets/images/photo-camera-svgrepo-com.svg";
import cameraSwitchIcon from "./assets/images/camera-switch-svgrepo-com.svg";
import deleteIcon from "./assets/images/delete-svgrepo-com.svg";
import {PlaneDistortionController} from "./plane-distortion-controller.ts";
import {DragInputHandler} from "./drag-input-handler.ts";
import {FullscreenController} from "./fullscreen-controller.ts";

main();

async function main() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <video id="video" playsInline poster="${cameraIcon}"></video>
    <canvas id="canvas"></canvas>
    <button id="reset-button"><img src="${deleteIcon}"></button>
    <button id="photo-button"><img src="${cameraIcon}"></button>
    <button id="swap-camera-button"><img src="${cameraSwitchIcon}"></button>
    <button id="fullscreen-button"><img id="fullscreen-image"></button>
    <div id="tutorial-tooltip" class="show-tooltip">drag the screen to distort your image!</div>
    `
    
    const parent = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
    const video = document.querySelector<HTMLVideoElement>('#video') as HTMLVideoElement;
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas') as HTMLCanvasElement;
    const resetButton = document.querySelector<HTMLButtonElement>('#reset-button') as HTMLButtonElement;
    const photoButton = document.querySelector<HTMLButtonElement>('#photo-button') as HTMLButtonElement;
    const swapCameraButton = document.querySelector<HTMLButtonElement>('#swap-camera-button') as HTMLButtonElement;
    const fullscreenButton = document.querySelector<HTMLButtonElement>('#fullscreen-button') as HTMLButtonElement;
    const fullscreenImage = document.querySelector<HTMLImageElement>('#fullscreen-image') as HTMLImageElement;
    const tutorialTooltip = document.querySelector<HTMLDivElement>('#tutorial-tooltip') as HTMLDivElement;
    
    const videoInput = new VideoInput(video);
    const distortionMesh = new VideoPlaneRenderer(video, parent, canvas);
    const planeDistortionController = new PlaneDistortionController(parent, distortionMesh.planeVertexPositions);
    const dragInputHandler = new DragInputHandler(canvas, planeDistortionController);
    const videoRendererResizer = new VideoRendererSizer(distortionMesh.renderer, video, distortionMesh.videoTexture);
    const fullscreenController = new FullscreenController(fullscreenButton, fullscreenImage, parent);
    
    resetButton.addEventListener("click", () => planeDistortionController.resetVertices());
    photoButton.addEventListener("mousedown", () => distortionMesh.takePhoto());
    planeDistortionController.addEventListener("ondrag", () => {
        tutorialTooltip.classList.remove("show-tooltip");
        tutorialTooltip.classList.add("hide-tooltip");
    });
    
    try {
        await videoInput.startNextVideoDevice();
        videoRendererResizer.updateMirroring(videoInput.shouldMirror);
        
        if (videoInput.hasMultipleVideoDevices()) {
            swapCameraButton.addEventListener("click", async () => {
                await videoInput.startNextVideoDevice();
                videoRendererResizer.updateMirroring(videoInput.shouldMirror);
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
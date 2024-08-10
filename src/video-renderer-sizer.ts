import * as THREE from "three";

export class VideoRendererSizer {
    private renderer: THREE.Renderer;
    
    private videoElement: HTMLVideoElement;
    private videoTexture: THREE.VideoTexture;
    
    constructor(renderer: THREE.Renderer, videoElement: HTMLVideoElement, videoTexture: THREE.VideoTexture) {
        this.renderer = renderer;
        this.videoElement = videoElement;
        this.videoTexture = videoTexture;
        
        this.videoTexture.wrapS = THREE.RepeatWrapping;  // Allows setting the repeat x scale to -1 to mirror horizontally
        
        this.resize = this.resize.bind(this);
        window.addEventListener("resize", this.resize);
        this.videoElement.addEventListener("resize", this.resize);
        
        this.resize();
    }
    
    updateMirroring(shouldMirror: boolean) {
        this.videoTexture.repeat.x = shouldMirror ? -1 : 1;

        this.resize();
    }
    
    resize() {
        const parentRect = this.renderer.domElement.parentElement?.getBoundingClientRect() as DOMRect;
        this.renderer.setSize(parentRect.width, parentRect.height);

        const videoAspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
        const rendererAspectRatio = parentRect.width / parentRect.height;

        const xRepeatSign = Math.sign(this.videoTexture.repeat.x);

        if (videoAspectRatio > rendererAspectRatio) {
            this.videoTexture.repeat.x = xRepeatSign * (rendererAspectRatio / videoAspectRatio);
            this.videoTexture.offset.x = (1 - this.videoTexture.repeat.x) / 2;

            this.videoTexture.repeat.y = 1;
            this.videoTexture.offset.y = 0;

        }
        else {
            this.videoTexture.repeat.x = xRepeatSign;
            this.videoTexture.offset.x = 0;

            this.videoTexture.repeat.y = videoAspectRatio / rendererAspectRatio;
            this.videoTexture.offset.y = (1 - this.videoTexture.repeat.y) / 2;
        }
    }
}
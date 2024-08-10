import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {AudioListenerManager} from "./audio-listener-manager.ts";

export class VideoPlaneRenderer {
    parent: HTMLElement;
    
    planeVertexPositions: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
    
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    videoTexture: THREE.VideoTexture;
    videoElement: HTMLVideoElement;

    private cameraFlashTween: TWEEN.Tween = new TWEEN.Tween({});
    private readonly overlayMaterial: THREE.Material;
    
    constructor(videoElement: HTMLVideoElement, parent: HTMLElement, outputCanvas: HTMLCanvasElement) {
        this.parent = parent;
        
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(0, 1, 1, 0);
        this.camera.position.z = 1;

        this.videoElement = videoElement;
        const plane = new THREE.PlaneGeometry(1, 1, 64, 64);
        this.videoTexture = new THREE.VideoTexture(this.videoElement);
        this.videoTexture.colorSpace = THREE.SRGBColorSpace;  // Necessary to preserve correct colors
        const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: this.videoTexture }));
        this.scene.add(mesh);
        
        this.overlayMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1), opacity: 0, transparent: true });
        const overlayMesh = new THREE.Mesh(plane, this.overlayMaterial);
        this.scene.add(overlayMesh);
        
        this.scene.add(AudioListenerManager.instance);

        this.planeVertexPositions = plane.getAttribute("position") as THREE.BufferAttribute;
        
        // Provides initial vertex offsets to center the vertex positions on (0.5, 0.5)
        for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
            let x = this.planeVertexPositions.getX(i) + 0.5;
            let y = this.planeVertexPositions.getY(i) + 0.5;

            this.planeVertexPositions.setXY(i, x, y);
        }

        this.planeVertexPositions.needsUpdate = true;

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: outputCanvas});
        
        this.animate(0);
    }

    animate = (time: number) => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);

        if (this.cameraFlashTween.isPlaying()) {
            this.cameraFlashTween.update(time);
        }
    }
    
    async takePhoto() {
        const link = document.createElement('a');
        link.download = 'distortion-camera-photo.png';
        this.renderer.render(this.scene, this.camera);  // Need to render before taking screenshot: https://stackoverflow.com/a/30647502
        link.href = this.renderer.domElement.toDataURL("image/png");
        
        if (this.cameraFlashTween.isPlaying()) {
            this.cameraFlashTween.stop();
        }

        const interpolation= { value: 1.0 };

        this.cameraFlashTween = new TWEEN.Tween(interpolation)
            .to({ value: 0.0 }, 1250)
            .easing(TWEEN.Easing.Exponential.Out)
            .onUpdate(() => {
                this.overlayMaterial.opacity = interpolation.value;
            })
            .start();

        // Wait so user can see the full flash then be prompted to download
        await new Promise(resolve => setTimeout(resolve, 500));
        
        link.click();
        link.remove();
    }
}
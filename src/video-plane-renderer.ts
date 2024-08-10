import * as THREE from "three";

export class VideoPlaneRenderer {
    parent: HTMLElement;
    
    planeVertexPositions: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
    
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    videoTexture: THREE.VideoTexture;
    videoElement: HTMLVideoElement;
    
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

        this.planeVertexPositions = plane.getAttribute("position") as THREE.BufferAttribute;
        
        // Provides initial vertex offsets to center the vertex positions on (0.5, 0.5)
        for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
            let x = this.planeVertexPositions.getX(i) + 0.5;
            let y = this.planeVertexPositions.getY(i) + 0.5;

            this.planeVertexPositions.setXY(i, x, y);
        }

        this.planeVertexPositions.needsUpdate = true;

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: outputCanvas});
        
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
    
    takePhoto() {
        const link = document.createElement('a');
        link.download = 'distortion-camera-photo.png';
        this.renderer.render(this.scene, this.camera);  // Need to render before taking screenshot: https://stackoverflow.com/a/30647502
        link.href = this.renderer.domElement.toDataURL("image/png");
        link.click();
        link.remove();
    }
}
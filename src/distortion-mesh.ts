import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';

export class DistortionMesh {
    parent: HTMLElement;
    
    isDragging: boolean = false;
    dragPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    dragDelta: THREE.Vector2 = new THREE.Vector2(0, 0);
    
    dragStopTweens: TWEEN.Tween[] = [];
    
    planeVertexPositions: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
    planeVertexPositionsOriginal: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
    resetTween: TWEEN.Tween = new TWEEN.Tween({});

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
        this.videoTexture.wrapS = THREE.RepeatWrapping;  // Allows setting the repeat x scale to -1 to mirror horizontally
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
        this.planeVertexPositionsOriginal = this.planeVertexPositions.clone();

        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: outputCanvas});
        
        this.resize = this.resize.bind(this);
        window.addEventListener("resize", this.resize);
        this.videoElement.addEventListener("resize", this.resize);
        this.resize();
        
        // Necessary bindings to preserve reference to this
        this.startDragMouse = this.startDragMouse.bind(this);
        this.onDragMouse = this.onDragMouse.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.startDragTouch = this.startDragTouch.bind(this);
        this.onDragTouch = this.onDragTouch.bind(this);

        this.renderer.domElement.addEventListener("mousedown", this.startDragMouse);
        this.renderer.domElement.addEventListener("mousemove", this.onDragMouse);
        this.renderer.domElement.addEventListener("mouseup", this.stopDrag);
        this.renderer.domElement.addEventListener("mouseleave", this.stopDrag);
        
        // TODO: add multitouch support?
        this.renderer.domElement.addEventListener("touchstart", this.startDragTouch);
        this.renderer.domElement.addEventListener("touchmove", this.onDragTouch);
        this.renderer.domElement.addEventListener("touchend", this.stopDrag);
        this.renderer.domElement.addEventListener("touchcancel", this.stopDrag);

        this.animate(0);
    }

    animate = (time: number) => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
        
        if (this.resetTween.isPlaying()) {
            this.resetTween.update(time);
        }

        for (let i = this.dragStopTweens.length - 1; i >= 0; i--) {
            if (this.dragStopTweens[i].isPlaying()) {
                this.dragStopTweens[i].update(time);
            }
            else {
                this.dragStopTweens.splice(i, 1);
            }
        }
    }
    
    startDragMouse(event: MouseEvent) {
        this.startDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    startDragTouch(event: TouchEvent) {
        this.startDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }

    startDrag(eventViewportPosition: THREE.Vector2) {
        this.isDragging = true;
        this.recalculateDragPosition(eventViewportPosition);
        this.dragDelta = new THREE.Vector2(0, 0);
        
        if (this.resetTween.isPlaying()) {
            this.resetTween.stop();
        }
    }

    onDragMouse(event: MouseEvent) {
        this.onDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    onDragTouch(event: TouchEvent) {
        this.onDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }

    onDrag(eventViewportPosition: THREE.Vector2) {
        if (!this.isDragging) return;

        const prevDrawPosition = this.dragPosition.clone();
        this.recalculateDragPosition(eventViewportPosition);

        this.dragDelta = this.dragPosition.clone().sub(prevDrawPosition);

        this.applyDragToVertices(this.dragPosition, this.dragDelta);
    }

    stopDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        this.animateDragStop();
    }

    recalculateDragPosition(eventViewportPosition: THREE.Vector2) {
        this.dragPosition.x = (eventViewportPosition.x - this.parent.offsetLeft) / this.parent.clientWidth;
        this.dragPosition.y = 1.0 - (eventViewportPosition.y - this.parent.offsetTop) / this.parent.clientHeight;
    }

    applyDragToVertices(dragPosition: THREE.Vector2, dragDelta: THREE.Vector2) {
        for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
            const vertexPosition: THREE.Vector2 = new THREE.Vector2(this.planeVertexPositions.getX(i),
                this.planeVertexPositions.getY(i));

            if (this.isBoundaryVertex(vertexPosition)) continue;

            const intensity = this.getDragIntensity(dragPosition, vertexPosition);
            
            if (intensity < 0.01) continue;

            let x = this.planeVertexPositions.getX(i) + (intensity * dragDelta.x);
            let y = this.planeVertexPositions.getY(i) + (intensity * dragDelta.y);

            this.planeVertexPositions.setXY(i, x, y);
        }

        this.planeVertexPositions.needsUpdate = true;
    }

    getDragIntensity(dragPosition: THREE.Vector2, vertexPosition: THREE.Vector2): number {
        const distance = dragPosition.distanceTo(vertexPosition);

        const intensity = THREE.MathUtils.inverseLerp(0.25, 0.0, distance);

        return Math.pow(THREE.MathUtils.clamp(intensity, 0, 1), 2);
    }

    isBoundaryVertex(vertexPosition: THREE.Vector2): boolean {
        return vertexPosition.x === 0 || vertexPosition.x === 1 || vertexPosition.y === 0 || vertexPosition.y === 1
    }
    
    animateDragStop() {
        const interpolation= { value: 5.0 };
        const dragPosition = this.dragPosition.clone();
        const dragDelta = this.dragDelta.clone();
        
        this.dragStopTweens.push(
            new TWEEN.Tween(interpolation)
                .to({ value: 0.0 }, 750)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(() => {
                    this.applyDragToVertices(dragPosition, dragDelta.clone().multiplyScalar(interpolation.value));
                })
                .start()
        );
    }
    
    resetVertices() {
        this.dragStopTweens.forEach(tween => tween.stop());
        
        const planeVertexPositionsDistorted: THREE.BufferAttribute = this.planeVertexPositions.clone();
        
        const interpolation= { value: 0.0 };

        this.resetTween = new TWEEN.Tween(interpolation)
            .to({ value: 1.0 }, 1250)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(() => {
                for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
                    let x = this.planeVertexPositions.getX(i) + 0.5;
                    let y = this.planeVertexPositions.getY(i) + 0.5;
                    
                    x = THREE.MathUtils.lerp(planeVertexPositionsDistorted.getX(i), this.planeVertexPositionsOriginal.getX(i), interpolation.value);
                    y = THREE.MathUtils.lerp(planeVertexPositionsDistorted.getY(i), this.planeVertexPositionsOriginal.getY(i), interpolation.value);

                    this.planeVertexPositions.setXY(i, x, y);
                }

                this.planeVertexPositions.needsUpdate = true;
            })
            .start();
    }
    
    updateMirroring(capabilities: MediaTrackCapabilities) {
        if (capabilities.facingMode?.includes("environment")) {
            this.videoTexture.repeat.x = 1;
        }
        else {
            this.videoTexture.repeat.x = -1;
        }
        
        this.resize();
    }
    
    takePhoto() {
        const link = document.createElement('a');
        link.download = 'distortion-camera-photo.png';
        this.renderer.render(this.scene, this.camera);  // Need to render before taking screenshot: https://stackoverflow.com/a/30647502
        link.href = this.renderer.domElement.toDataURL("image/png");
        link.click();
        link.remove();
    }

    resize() {
        this.renderer.setSize(this.parent.clientWidth, this.parent.clientHeight);
        
        const videoAspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
        const rendererAspectRatio = this.parent.clientWidth / this.parent.clientHeight;
        
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
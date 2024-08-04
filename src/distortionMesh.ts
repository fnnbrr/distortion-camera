import * as THREE from "three";

export class DistortionMesh {
    parent: HTMLElement;
    isDragging: boolean = false;
    dragPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    planeVertexPositions: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
    planeVertexPositionsOriginal: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);
    
    constructor(videoElement: HTMLVideoElement, parent: HTMLElement) {
        this.parent = parent;
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0);
        camera.position.z = 1;

        const scene = new THREE.Scene();

        const plane = new THREE.PlaneGeometry(1, 1, 64, 64);
        this.planeVertexPositions = plane.getAttribute("position") as THREE.BufferAttribute;
        const videoTexture = new THREE.VideoTexture(videoElement);
        const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: videoTexture }));
        scene.add(mesh);

        // Provides initial vertex offsets to center the vertex positions on (0.5, 0.5)
        for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
            let x = this.planeVertexPositions.getX(i) + 0.5;
            let y = this.planeVertexPositions.getY(i) + 0.5;

            this.planeVertexPositions.setXY(i, x, y);
        }

        this.planeVertexPositions.needsUpdate = true;
        this.planeVertexPositionsOriginal = this.planeVertexPositions.clone();

        const renderer = new THREE.WebGLRenderer({antialias: true});

        renderer.setSize(parent.clientWidth, parent.clientHeight);
        parent.appendChild(renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        animate();
        
        // Necessary bindings to preserve reference to this
        this.startDragMouse = this.startDragMouse.bind(this);
        this.onDragMouse = this.onDragMouse.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.startDragTouch = this.startDragTouch.bind(this);
        this.onDragTouch = this.onDragTouch.bind(this);
        
        renderer.domElement.addEventListener("mousedown", this.startDragMouse);
        renderer.domElement.addEventListener("mousemove", this.onDragMouse);
        renderer.domElement.addEventListener("mouseup", this.stopDrag);
        
        // TODO: add multitouch support?
        renderer.domElement.addEventListener("touchstart", this.startDragTouch);
        renderer.domElement.addEventListener("touchmove", this.onDragTouch);
        renderer.domElement.addEventListener("touchend", this.stopDrag);
        renderer.domElement.addEventListener("touchcancel", this.stopDrag);
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

        let dragDelta: THREE.Vector2 = this.dragPosition.clone().sub(prevDrawPosition);

        for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
            const vertexPosition: THREE.Vector2 = new THREE.Vector2(this.planeVertexPositions.getX(i),
                this.planeVertexPositions.getY(i));

            if (this.isBoundaryVertex(vertexPosition)) continue;

            const intensity = this.getDragIntensity(vertexPosition);

            let x = this.planeVertexPositions.getX(i) + (intensity * dragDelta.x);
            let y = this.planeVertexPositions.getY(i) + (intensity * dragDelta.y);

            this.planeVertexPositions.setXY(i, x, y);
        }

        this.planeVertexPositions.needsUpdate = true;
    }

    stopDrag() {
        this.isDragging = false;
    }

    recalculateDragPosition(eventViewportPosition: THREE.Vector2) {
        this.dragPosition.x = (eventViewportPosition.x - this.parent.offsetLeft) / this.parent.clientWidth;
        this.dragPosition.y = 1.0 - (eventViewportPosition.y - this.parent.offsetTop) / this.parent.clientHeight;
    }

    getDragIntensity(vertexPosition: THREE.Vector2): number {
        const distance = this.dragPosition.distanceTo(vertexPosition);

        const intensity = THREE.MathUtils.inverseLerp(0.25, 0.0, distance);

        return Math.pow(THREE.MathUtils.clamp(intensity, 0, 1), 2);
    }

    isBoundaryVertex(vertexPosition: THREE.Vector2): boolean {
        return vertexPosition.x === 0 || vertexPosition.x === 1 || vertexPosition.y === 0 || vertexPosition.y === 1
    }
}
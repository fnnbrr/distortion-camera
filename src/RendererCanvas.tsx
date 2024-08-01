import React, { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RendererCanvasProps {
    videoRef: RefObject<HTMLVideoElement>;
    drawCanvasRef: RefObject<HTMLCanvasElement>;
}

export default function RendererCanvas({ videoRef, drawCanvasRef }: RendererCanvasProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    let isDragging: boolean = false;
    let dragPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    let planeVertexPositions: THREE.BufferAttribute = new THREE.BufferAttribute(new Float32Array(0), 3);

    useEffect(() => {
        const renderer = createThreeRenderer();
        
        if (parentRef.current !== null) {
            parentRef.current.appendChild(renderer.domElement);
        }
        
        return () => {
            if (parentRef.current !== null) {
                parentRef.current.removeChild(renderer.domElement);
            }
        }
    }, []);
    
    function createThreeRenderer() : THREE.WebGLRenderer {
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0);
        camera.position.z = 1;

        const scene = new THREE.Scene();

        // TODO: if videoRef is null then just show a placeholder texture
        // if (videoRef.current === null || drawCanvasRef.current === null) return new THREE.WebGLRenderer();

        // const videoTexture = new THREE.VideoTexture(videoRef.current);
        const videoTexture = new THREE.TextureLoader().load(require("./assets/Checkerboard.png"));
        // const drawCanvasTexture = new THREE.CanvasTexture(drawCanvasRef.current)

        const plane = new THREE.PlaneGeometry(1, 1, 10, 10);
        planeVertexPositions = plane.getAttribute("position") as THREE.BufferAttribute;
        
        // Provides initial vertex offsets to center the vertex positions on (0.5, 0.5)
        for ( let i = 0; i < planeVertexPositions.count; i ++ ) {
            let x = planeVertexPositions.getX(i) + 0.5;
            let y = planeVertexPositions.getY(i) + 0.5;

            planeVertexPositions.setXY(i, x, y);
        }
        
        planeVertexPositions.needsUpdate = true;
        
        // const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: videoTexture }));
        const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ wireframe: true }));
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        
        if (parentRef.current !== null) {
            renderer.setSize(parentRef.current.clientWidth, parentRef.current.clientHeight);
        }

        const animate = () => {
            requestAnimationFrame(animate);
            // videoTexture.needsUpdate = true;
            // drawCanvasTexture.needsUpdate = true;
            renderer.render(scene, camera);
        }

        animate();

        renderer.domElement.addEventListener("mousedown", startDragMouse);
        renderer.domElement.addEventListener("mousemove", onDragMouse);
        renderer.domElement.addEventListener("mouseup", stopDrag);

        // TODO: add multitouch support?
        renderer.domElement.addEventListener("touchstart", startDragTouch);
        renderer.domElement.addEventListener("touchmove", onDragTouch);
        renderer.domElement.addEventListener("touchend", stopDrag);
        renderer.domElement.addEventListener("touchcancel", stopDrag);

        return renderer;
    }

    function startDragMouse(event: MouseEvent) {
        startDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    function startDragTouch(event: TouchEvent) {
        startDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }
    
    function startDrag(eventViewportPosition: THREE.Vector2) {
        isDragging = true;
        recalculateDragPosition(eventViewportPosition);
    }

    function onDragMouse(event: MouseEvent) {
        onDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    function onDragTouch(event: TouchEvent) {
        onDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }

    function onDrag(eventViewportPosition: THREE.Vector2) {
        if (!isDragging) return;
        
        const prevDrawPosition = dragPosition.clone();
        recalculateDragPosition(eventViewportPosition);
        
        let dragDelta: THREE.Vector2 = dragPosition.clone().sub(prevDrawPosition);
        
        for ( let i = 0; i < planeVertexPositions.count; i ++ ) {
            const vertexPosition: THREE.Vector2 = new THREE.Vector2(planeVertexPositions.getX(i), planeVertexPositions.getY(i));
            
            if (isBoundaryVertex(vertexPosition)) continue;
            
            const intensity = getDragIntensity(vertexPosition);

            let x = planeVertexPositions.getX(i) + (intensity * dragDelta.x);
            let y = planeVertexPositions.getY(i) + (intensity * dragDelta.y);

            planeVertexPositions.setXY(i, x, y);
        }
        
        planeVertexPositions.needsUpdate = true;
    }

    function stopDrag() {
        isDragging = false;
    }

    function recalculateDragPosition(eventViewportPosition: THREE.Vector2) {
        if (parentRef.current === null) return;

        dragPosition.x = (eventViewportPosition.x - parentRef.current.offsetLeft) / parentRef.current.clientWidth;
        dragPosition.y = 1.0 - (eventViewportPosition.y - parentRef.current.offsetTop) / parentRef.current.clientHeight;
    }
    
    function getDragIntensity(vertexPosition: THREE.Vector2): number {
        const distance = dragPosition.distanceTo(vertexPosition);
        
        // TODO: can map to a curve to have a more focused drag point
        const intensity = THREE.MathUtils.inverseLerp(0.25, 0.0, distance);
        
        return THREE.MathUtils.clamp(intensity, 0, 1);
    }
    
    function isBoundaryVertex(vertexPosition: THREE.Vector2): boolean {
        return vertexPosition.x === 0 || vertexPosition.x == 1 || vertexPosition.y === 0 || vertexPosition.y == 1
    }

    return (
        <div
            ref={parentRef}
            style={{width: "100%", height: "100%"}}
        ></div>
    );
}
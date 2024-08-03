import React, { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './App.css';

interface RendererCanvasProps {
    videoRef: RefObject<HTMLVideoElement>;
}

export default function RendererCanvas({ videoRef }: RendererCanvasProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    let planeVertexPositions = useRef<THREE.BufferAttribute>(new THREE.BufferAttribute(new Float32Array(0), 3));
    let planeVertexPositionsOriginal = useRef<THREE.BufferAttribute>(new THREE.BufferAttribute(new Float32Array(0), 3));
    
    useEffect(() => {
        let isDragging: boolean = false;
        let dragPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
        
        const renderer = createThreeRenderer();
        
        if (parentRef.current !== null) {
            parentRef.current.appendChild(renderer.domElement);
        }
        
        return () => {
            renderer.domElement.remove();
        }

        function createThreeRenderer() : THREE.WebGLRenderer {
            const camera = new THREE.OrthographicCamera(0, 1, 1, 0);
            camera.position.z = 1;

            const scene = new THREE.Scene();

            // TODO: if videoRef is null then just show a placeholder texture
            if (videoRef.current === null) return new THREE.WebGLRenderer();

            const videoTexture = new THREE.VideoTexture(videoRef.current);
            // const videoTexture = new THREE.TextureLoader().load(require("./assets/Checkerboard.png"));
            // const drawCanvasTexture = new THREE.CanvasTexture(drawCanvasRef.current)

            const plane = new THREE.PlaneGeometry(1, 1, 64, 64);
            planeVertexPositions.current = plane.getAttribute("position") as THREE.BufferAttribute;

            // Provides initial vertex offsets to center the vertex positions on (0.5, 0.5)
            for ( let i = 0; i < planeVertexPositions.current.count; i ++ ) {
                let x = planeVertexPositions.current.getX(i) + 0.5;
                let y = planeVertexPositions.current.getY(i) + 0.5;

                planeVertexPositions.current.setXY(i, x, y);
            }
            
            planeVertexPositions.current.needsUpdate = true;
            planeVertexPositionsOriginal.current = planeVertexPositions.current.clone();
            
            const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: videoTexture }));
            // const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ wireframe: true }));
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

            for ( let i = 0; i < planeVertexPositions.current.count; i ++ ) {
                const vertexPosition: THREE.Vector2 = new THREE.Vector2(planeVertexPositions.current.getX(i), 
                    planeVertexPositions.current.getY(i));

                if (isBoundaryVertex(vertexPosition)) continue;

                const intensity = getDragIntensity(vertexPosition);

                let x = planeVertexPositions.current.getX(i) + (intensity * dragDelta.x);
                let y = planeVertexPositions.current.getY(i) + (intensity * dragDelta.y);

                planeVertexPositions.current.setXY(i, x, y);
            }

            planeVertexPositions.current.needsUpdate = true;
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
            
            const intensity = THREE.MathUtils.inverseLerp(0.25, 0.0, distance);

            return Math.pow(THREE.MathUtils.clamp(intensity, 0, 1), 2);
        }

        function isBoundaryVertex(vertexPosition: THREE.Vector2): boolean {
            return vertexPosition.x === 0 || vertexPosition.x === 1 || vertexPosition.y === 0 || vertexPosition.y === 1
        }
    }, [videoRef]);

    function reset() {
        // TODO: spring vertices back to rest positions
        planeVertexPositions.current.copy(planeVertexPositionsOriginal.current);
        planeVertexPositions.current.needsUpdate = true;
    }
    
    function takePhoto() {
        // TODO: save photo
    }
    
    return (
        <div
            ref={parentRef}
            style={{width: "100%", height: "100%"}}>
            <button onClick={reset} className={"reset-button"}>reset</button>
            <button onClick={takePhoto} className={"photo-button"}>take photo</button>
        </div>
    );
}
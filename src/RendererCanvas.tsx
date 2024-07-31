import React, { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RendererCanvasProps {
    videoRef: RefObject<HTMLVideoElement>;
    drawCanvasRef: RefObject<HTMLCanvasElement>;
}

export default function RendererCanvas({ videoRef, drawCanvasRef }: RendererCanvasProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);
    const dragPosition = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
    const planeVertexPositions = useRef<THREE.BufferAttribute>(new THREE.BufferAttribute(new Float32Array(0), 3));

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
        const camera = new THREE.OrthographicCamera();
        camera.position.z = 1;

        const scene = new THREE.Scene();

        // TODO: if videoRef is null then just show a placeholder texture
        // if (videoRef.current === null || drawCanvasRef.current === null) return new THREE.WebGLRenderer();

        // const videoTexture = new THREE.VideoTexture(videoRef.current);
        const videoTexture = new THREE.TextureLoader().load(require("./assets/Checkerboard.png"));
        // const drawCanvasTexture = new THREE.CanvasTexture(drawCanvasRef.current)

        const plane = new THREE.PlaneGeometry(2, 2, 10, 10);
        planeVertexPositions.current = plane.getAttribute("position") as THREE.BufferAttribute;
        
        for ( let i = 0; i < planeVertexPositions.current.count; i ++ ) {
            let x = planeVertexPositions.current.getX(i) + 0.1*(Math.random()-0.5);
            let y = planeVertexPositions.current.getY(i) + 0.1*(Math.random()-0.5);
            // let z = positionAttribute.getZ(i) + 0.1*(Math.random()-0.5);
            // positionAttribute.setXYZ(i, x, y, z);
            planeVertexPositions.current.setXY(i, x, y);
        }
        
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
        isDragging.current = true;
        recalculateDrawPosition(eventViewportPosition);
    }

    function onDragMouse(event: MouseEvent) {
        onDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    function onDragTouch(event: TouchEvent) {
        onDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }

    function onDrag(eventViewportPosition: THREE.Vector2) {
        if (!isDragging.current) return;
        
        const prevDrawPosition = dragPosition.current.clone();
        recalculateDrawPosition(eventViewportPosition);
        
        let dragDelta: THREE.Vector2 = dragPosition.current.clone().sub(prevDrawPosition);
        
        // TODO: modify vertices in radius with falloff, excluding vertices along edges
        // (will need mouse position in same coordinate space as vertex positions)
        for ( let i = 0; i < planeVertexPositions.current.count; i ++ ) {
            let x = planeVertexPositions.current.getX(i) + 0.001 * dragDelta.x;
            let y = planeVertexPositions.current.getY(i) - 0.001 * dragDelta.y;
            
            planeVertexPositions.current.setXY(i, x, y);
        }
        
        planeVertexPositions.current.needsUpdate = true;
    }

    function stopDrag() {
        isDragging.current = false;
    }

    function recalculateDrawPosition(eventViewportPosition: THREE.Vector2) {
        if (parentRef.current === null) return;

        dragPosition.current.x = eventViewportPosition.x - parentRef.current.offsetLeft;
        dragPosition.current.y = eventViewportPosition.y - parentRef.current.offsetTop;
    }

    return (
        <div
            ref={parentRef}
            style={{width: "100%", height: "100%"}}
        ></div>
    );
}
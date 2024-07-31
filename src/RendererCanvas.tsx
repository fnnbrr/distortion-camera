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

        renderer.domElement.addEventListener("mousedown", startDrag);
        renderer.domElement.addEventListener("mousemove", onDrag);
        renderer.domElement.addEventListener("mouseup", stopDrag);

        return renderer;
    }

    function startDrag(event: MouseEvent) {
        isDragging.current = true;
        recalculateDrawPosition(event);
    }

    function onDrag(event: MouseEvent) {
        if (!isDragging.current) return;
        
        const prevDrawPosition = dragPosition.current.clone();
        recalculateDrawPosition(event);
        
        let dragDelta: THREE.Vector2 = dragPosition.current.clone().sub(prevDrawPosition);
        
        // TODO: modify vertices
        for ( let i = 0; i < planeVertexPositions.current.count; i ++ ) {
            
            let x = planeVertexPositions.current.getX(i) + 0.001 * dragDelta.x;
            let y = planeVertexPositions.current.getY(i) - 0.001 * dragDelta.y;
            // let z = positionAttribute.getZ(i) + 0.1*(Math.random()-0.5);
            // positionAttribute.setXYZ(i, x, y, z);
            planeVertexPositions.current.setXY(i, x, y);
        }
        
        planeVertexPositions.current.needsUpdate = true;
    }

    function stopDrag() {
        isDragging.current = false;
    }

    function recalculateDrawPosition(event: MouseEvent) {
        if (parentRef.current === null) return;

        dragPosition.current.x = event.clientX - parentRef.current.offsetLeft;
        dragPosition.current.y = event.clientY - parentRef.current.offsetTop;
    }

    return (
        <div
            ref={parentRef}
            style={{width: "100%", height: "100%"}}
        ></div>
    );
}
import React, { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertex, fragment } from "./assets/DistortionShader.glsl";

interface RendererCanvasProps {
    videoRef: RefObject<HTMLVideoElement>;
    drawCanvasRef: RefObject<HTMLCanvasElement>;
}

export default function RendererCanvas({ videoRef, drawCanvasRef }: RendererCanvasProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderer = createThreeRenderer();

        return () => {
            if (parentRef.current !== null) {
                parentRef.current.removeChild(renderer.domElement);
            }
        }
    }, []);
    
    function createThreeRenderer() : THREE.WebGLRenderer {
        const camera = new THREE.OrthographicCamera(0, 1, 1, 0);
        camera.position.z = 2;

        const scene = new THREE.Scene();

        if (videoRef.current === null || drawCanvasRef.current === null) return new THREE.WebGLRenderer();

        // const videoTexture = new THREE.VideoTexture(videoRef.current);
        const videoTexture = new THREE.TextureLoader().load(require("./assets/Checkerboard.png"));
        const drawCanvasTexture = new THREE.CanvasTexture(drawCanvasRef.current)

        const plane = new THREE.PlaneGeometry(1, 1);
        const distortionMaterial = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: videoTexture },
                distortionMap: { value: drawCanvasTexture },
                controlPoints: { value: [
                        new THREE.Vector2(0, 0),
                        new THREE.Vector2(0, 0.5),
                        new THREE.Vector2(0, 1),
                        new THREE.Vector2(0.5, 0),
                        new THREE.Vector2(0.5, 0.5),
                        new THREE.Vector2(0.5, 1),
                        new THREE.Vector2(1, 0),
                        new THREE.Vector2(1, 0.5),
                        new THREE.Vector2(1, 1)
                    ]},
                dimensionX: { value: 3 },
                dimensionY: { value: 3 }
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });
        const mesh = new THREE.Mesh(plane, distortionMaterial);
        mesh.position.x = 0.5;
        mesh.position.y = 0.5;
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        
        if (parentRef.current !== null) {
            renderer.setSize(parentRef.current.clientWidth, parentRef.current.clientHeight);
            parentRef.current.appendChild(renderer.domElement);
        }

        const animate = () => {
            requestAnimationFrame(animate);
            // videoTexture.needsUpdate = true;
            drawCanvasTexture.needsUpdate = true;
            renderer.render(scene, camera);
        }

        animate();

        return renderer;
    }

    return (
        <div
            ref={parentRef}
            style={{width: "100%", height: "100%"}}
        ></div>
    );
}
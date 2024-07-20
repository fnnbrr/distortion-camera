import React, { RefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { vertex, fragment } from "./assets/DistortionShader.glsl";

interface RendererCanvasProps {
    videoRef: RefObject<HTMLVideoElement>;
    drawCanvasRef: RefObject<HTMLCanvasElement>;
}

export default function RendererCanvas({ videoRef }: RendererCanvasProps) {
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
        let camera = new THREE.OrthographicCamera();
        camera.position.z = 2;

        let scene = new THREE.Scene();

        if (videoRef.current === null) return new THREE.WebGLRenderer();

        let texture = new THREE.VideoTexture(videoRef.current);
        texture.colorSpace = THREE.SRGBColorSpace;

        const plane = new THREE.PlaneGeometry(1, 1);
        const distortionMaterial = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                distortionMap: { value: texture }  // TODO: replace with texture from drawing canvas
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });
        const mesh = new THREE.Mesh(plane, distortionMaterial);
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        parentRef.current?.appendChild(renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
            texture.needsUpdate = true;
            renderer.render(scene, camera);
        }

        animate();

        return renderer;
    }

    return (
        <div ref={parentRef}></div>
    );
}
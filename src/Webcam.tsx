import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Webcam() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const stream = accessWebcam();
        
        const renderer = createThreeRenderer();
        
        return () => {
            if (stream !== undefined) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (parentRef.current !== null) {
                parentRef.current.removeChild(renderer.domElement);
            }
        }
    })
    
    function accessWebcam() {
        
        let returnedStream = new MediaStream();
        
        navigator.mediaDevices.getUserMedia({video: true})
            .then(stream => {
                returnedStream = stream;
                if (videoRef.current !== null && videoRef.current.srcObject === null) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play()
                        .catch(err => console.error(`Error playing video: ${err}`));
                }
            })
            .catch(err => console.error(`Error accessing webcam: ${err}`));
        
        return returnedStream;
    }
    
    function createThreeRenderer() : THREE.WebGLRenderer {
        let camera = new THREE.OrthographicCamera();
        camera.position.z = 2;
        
        let scene = new THREE.Scene();
        
        if (videoRef.current === null) return new THREE.WebGLRenderer();
        
        let texture = new THREE.VideoTexture(videoRef.current);
        texture.colorSpace = THREE.SRGBColorSpace;
        
        const plane = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({map: texture});
        const mesh = new THREE.Mesh(plane, material);
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
        <div ref={parentRef} className="App">
            <video ref={videoRef} style={{display: "none"}} playsInline></video>
        </div>
    );
}
import './style.css'
import * as THREE from 'three';
import {requestWebcam} from "./webcam-video.ts";

main();

function main(): void {
    const videoElement = document.querySelector<HTMLVideoElement>('#video');
    const parent = document.querySelector<HTMLDivElement>('#app');
    if (videoElement === null || parent === null) {
        console.error(`Could not find required HTML elements with querySelector`);
        return;
    }
    
    requestWebcam(videoElement);

    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
    camera.position.z = 1;

    const scene = new THREE.Scene();
    
    const plane = new THREE.PlaneGeometry(1, 1, 64, 64);
    const videoTexture = new THREE.VideoTexture(videoElement);
    const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: videoTexture }));
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    parent.appendChild(renderer.domElement);
        
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}
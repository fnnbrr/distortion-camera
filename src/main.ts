import './style.css'
import * as THREE from 'three';

const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
camera.position.z = 1;

const scene = new THREE.Scene();

const plane = new THREE.PlaneGeometry(1, 1, 64, 64);
const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ wireframe: true }));
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({antialias: true});

const parent = document.querySelector<HTMLDivElement>('#app');

if (parent !== null) {
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    parent.appendChild(renderer.domElement);
}

const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
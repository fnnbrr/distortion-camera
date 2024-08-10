import * as THREE from "three";

export class AudioListenerManager {
    static readonly instance: THREE.AudioListener = new THREE.AudioListener();
}
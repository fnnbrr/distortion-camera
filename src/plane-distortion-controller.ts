import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import {AudioListenerManager} from "./audio-listener-manager.ts";
import dragStopSfx from "./assets/audio/161122__reelworldstudio__cartoon-boing.mp3";
import resetSfx from "./assets/audio/542195__breviceps__cartoon-wobble.mp3";

export class PlaneDistortionController extends EventTarget {
    parent: HTMLElement;
    
    isDragging: boolean = false;
    onDragEvent: CustomEvent = new CustomEvent("ondrag");
    dragPosition: THREE.Vector2 = new THREE.Vector2(0, 0);
    dragDelta: THREE.Vector2 = new THREE.Vector2(0, 0);

    dragStopTweens: TWEEN.Tween[] = [];
    private readonly dragStopAudio: THREE.Audio;

    planeVertexPositions: THREE.BufferAttribute;
    planeVertexPositionsOriginal: THREE.BufferAttribute;
    resetTween: TWEEN.Tween = new TWEEN.Tween({});
    private readonly resetAudio: THREE.Audio;
    
    constructor(parent: HTMLElement, planeVertexPositions: THREE.BufferAttribute) {
        super();
        
        this.parent = parent;
        this.planeVertexPositions = planeVertexPositions;
        this.planeVertexPositionsOriginal = planeVertexPositions.clone();

        this.updateTweens(0);

        const dragStopAudio = new THREE.Audio(AudioListenerManager.instance);
        this.dragStopAudio = dragStopAudio;

        new THREE.AudioLoader().load(dragStopSfx, buffer => {
            dragStopAudio.setBuffer(buffer);
            dragStopAudio.setLoop(false);
            dragStopAudio.setVolume(1.0);
        });
        
        const resetAudio = new THREE.Audio(AudioListenerManager.instance);
        this.resetAudio = resetAudio;

        new THREE.AudioLoader().load(resetSfx, buffer => {
            resetAudio.setBuffer(buffer);
            resetAudio.setLoop(false);
            resetAudio.setVolume(1.0);
        });
    }

    updateTweens = (time: number) => {
        requestAnimationFrame(this.updateTweens);

        if (this.resetTween.isPlaying()) {
            this.resetTween.update(time);
        }

        for (let i = this.dragStopTweens.length - 1; i >= 0; i--) {
            if (this.dragStopTweens[i].isPlaying()) {
                this.dragStopTweens[i].update(time);
            }
            else {
                this.dragStopTweens.splice(i, 1);
            }
        }
    }

    startDrag(eventViewportPosition: THREE.Vector2) {
        this.isDragging = true;
        this.recalculateDragPosition(eventViewportPosition);
        this.dragDelta = new THREE.Vector2(0, 0);

        if (this.resetTween.isPlaying()) {
            this.resetTween.stop();
        }
    }

    onDrag(eventViewportPosition: THREE.Vector2) {
        if (!this.isDragging) return;

        this.dispatchEvent(this.onDragEvent);
        
        const prevDrawPosition = this.dragPosition.clone();
        this.recalculateDragPosition(eventViewportPosition);

        this.dragDelta = this.dragPosition.clone().sub(prevDrawPosition);

        this.applyDragToVertices(this.dragPosition, this.dragDelta);
    }

    recalculateDragPosition(eventViewportPosition: THREE.Vector2) {
        this.dragPosition.x = (eventViewportPosition.x - this.parent.offsetLeft) / this.parent.clientWidth;
        this.dragPosition.y = 1.0 - (eventViewportPosition.y - this.parent.offsetTop) / this.parent.clientHeight;
    }

    applyDragToVertices(dragPosition: THREE.Vector2, dragDelta: THREE.Vector2) {
        for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
            const vertexPosition: THREE.Vector2 = new THREE.Vector2(this.planeVertexPositions.getX(i),
                this.planeVertexPositions.getY(i));

            if (this.isBoundaryVertex(vertexPosition)) continue;

            const intensity = this.getDragIntensity(dragPosition, vertexPosition);

            if (intensity < 0.01) continue;

            let x = this.planeVertexPositions.getX(i) + (intensity * dragDelta.x);
            let y = this.planeVertexPositions.getY(i) + (intensity * dragDelta.y);

            this.planeVertexPositions.setXY(i, x, y);
        }

        this.planeVertexPositions.needsUpdate = true;
    }

    getDragIntensity(dragPosition: THREE.Vector2, vertexPosition: THREE.Vector2): number {
        const distance = dragPosition.distanceTo(vertexPosition);

        const intensity = THREE.MathUtils.inverseLerp(0.25, 0.0, distance);

        return Math.pow(THREE.MathUtils.clamp(intensity, 0, 1), 2);
    }

    isBoundaryVertex(vertexPosition: THREE.Vector2): boolean {
        return vertexPosition.x === 0 || vertexPosition.x === 1 || vertexPosition.y === 0 || vertexPosition.y === 1
    }

    stopDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;

        if (this.dragStopAudio.isPlaying) {
            this.dragStopAudio.stop();
        }
        this.dragStopAudio.play();

        this.animateDragStop();
    }

    animateDragStop() {
        const interpolation= { value: 5.0 };
        const dragPosition = this.dragPosition.clone();
        const dragDelta = this.dragDelta.clone();

        this.dragStopTweens.push(
            new TWEEN.Tween(interpolation)
                .to({ value: 0.0 }, 750)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(() => {
                    this.applyDragToVertices(dragPosition, dragDelta.clone().multiplyScalar(interpolation.value));
                })
                .start()
        );
    }

    resetVertices() {
        this.dragStopTweens.forEach(tween => tween.stop());

        const planeVertexPositionsDistorted: THREE.BufferAttribute = this.planeVertexPositions.clone();

        const interpolation= { value: 0.0 };

        this.resetTween = new TWEEN.Tween(interpolation)
            .to({ value: 1.0 }, 1250)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(() => {
                for ( let i = 0; i < this.planeVertexPositions.count; i ++ ) {
                    let x = this.planeVertexPositions.getX(i) + 0.5;
                    let y = this.planeVertexPositions.getY(i) + 0.5;

                    x = THREE.MathUtils.lerp(planeVertexPositionsDistorted.getX(i), this.planeVertexPositionsOriginal.getX(i), interpolation.value);
                    y = THREE.MathUtils.lerp(planeVertexPositionsDistorted.getY(i), this.planeVertexPositionsOriginal.getY(i), interpolation.value);

                    this.planeVertexPositions.setXY(i, x, y);
                }

                this.planeVertexPositions.needsUpdate = true;
            })
            .start();
        
        this.resetAudio.play();
    }
}
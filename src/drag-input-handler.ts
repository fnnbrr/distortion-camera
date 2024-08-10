import * as THREE from "three";
import {PlaneDistortionController} from "./plane-distortion-controller.ts";

export class DragInputHandler {
    private planeDragController: PlaneDistortionController;
    
    constructor(element: HTMLElement, planeDragController: PlaneDistortionController) {
        this.planeDragController = planeDragController;
        
        // Necessary bindings to preserve reference to this
        this.startDragMouse = this.startDragMouse.bind(this);
        this.onDragMouse = this.onDragMouse.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.startDragTouch = this.startDragTouch.bind(this);
        this.onDragTouch = this.onDragTouch.bind(this);

        element.addEventListener("mousedown", this.startDragMouse);
        element.addEventListener("mousemove", this.onDragMouse);
        element.addEventListener("mouseup", this.stopDrag);
        element.addEventListener("mouseleave", this.stopDrag);

        // TODO: add multitouch support?
        element.addEventListener("touchstart", this.startDragTouch);
        element.addEventListener("touchmove", this.onDragTouch);
        element.addEventListener("touchend", this.stopDrag);
        element.addEventListener("touchcancel", this.stopDrag);
    }

    startDragMouse(event: MouseEvent) {
        this.planeDragController.startDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    startDragTouch(event: TouchEvent) {
        this.planeDragController.startDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }

    onDragMouse(event: MouseEvent) {
        this.planeDragController.onDrag(new THREE.Vector2(event.clientX, event.clientY));
    }

    onDragTouch(event: TouchEvent) {
        this.planeDragController.onDrag(new THREE.Vector2(event.touches[0].clientX, event.touches[0].clientY));
    }

    stopDrag() {
        this.planeDragController.stopDrag();
    }
}
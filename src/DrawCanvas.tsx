import React, {RefObject} from "react";
import "./DrawCanvas.css";

interface DrawCanvasProps {
    outDrawCanvasRef: RefObject<HTMLCanvasElement>;
}

export default function DrawCanvas({ outDrawCanvasRef }: DrawCanvasProps) {
    return (
        <canvas ref={outDrawCanvasRef} className={"draw-canvas"}></canvas>
    );
}
import React, { RefObject, useEffect, useRef } from "react";
import "./DrawCanvas.css";
import { Vector2 } from "three";

interface DrawCanvasProps {
    outDrawCanvasRef: RefObject<HTMLCanvasElement>;
}

export default function DrawCanvas({ outDrawCanvasRef }: DrawCanvasProps) {
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawing = useRef<boolean>(false);
    const drawPosition = useRef<Vector2>(new Vector2(0, 0));
    
    useEffect(() => {
        const canvas = outDrawCanvasRef.current;
        if (canvas === null) return;
        
        context.current = canvas.getContext("2d");
        if (context.current === null) return;

        context.current.fillStyle = "#7F7F7F";
        context.current.fillRect(0, 0, 100, 100);

        context.current.lineWidth = 5;
        context.current.lineCap = "round";
        context.current.strokeStyle = "black";
        
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
    }, []);
    
    function startDrawing(event: MouseEvent) {
        isDrawing.current = true;
        recalculateDrawPosition(event);
    }

    function draw(event: MouseEvent) {
        if (!isDrawing.current) return;
        if (context.current === null) return;
        
        context.current.moveTo(drawPosition.current.x, drawPosition.current.y);
        
        recalculateDrawPosition(event);
        
        context.current.lineTo(drawPosition.current.x, drawPosition.current.y);
        context.current.stroke();
    }

    function stopDrawing() {
        isDrawing.current = false;
    }
    
    function recalculateDrawPosition(event: MouseEvent) {
        if (outDrawCanvasRef.current === null) return;
        
        drawPosition.current.x = event.clientX - outDrawCanvasRef.current.offsetLeft;
        drawPosition.current.y = event.clientY - outDrawCanvasRef.current.offsetTop;
    }
    
    return (
        <canvas ref={outDrawCanvasRef}
                className={"draw-canvas"}
                height={100}
                width={100}
        ></canvas>
    );
}
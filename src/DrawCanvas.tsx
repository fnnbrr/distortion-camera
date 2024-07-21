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
        
        canvas.style.opacity = "0";
        
        context.current = canvas.getContext("2d");
        if (context.current === null) return;

        const parentRect = canvas.parentElement?.getBoundingClientRect();
        if (parentRect !== undefined) {
            canvas.width = parentRect.width;
            canvas.height = parentRect.height;
        }
        
        context.current.fillStyle = "#7F7F7F";
        context.current.fillRect(0, 0, canvas.width, canvas.height);

        context.current.lineWidth = 50;
        context.current.lineCap = "round";
        
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        
        document.addEventListener("keydown", onKeyDown);
    }, []);
    
    function startDrawing(event: MouseEvent) {
        isDrawing.current = true;
        recalculateDrawPosition(event);
    }

    function draw(event: MouseEvent) {
        if (!isDrawing.current) return;
        if (context.current === null) return;
        
        context.current?.beginPath();
        context.current.moveTo(drawPosition.current.x, drawPosition.current.y);
        
        const prevDrawPosition = drawPosition.current.clone();
        recalculateDrawPosition(event);

        context.current.strokeStyle = getStrokeStyleForMove(prevDrawPosition, drawPosition.current);
        
        context.current.lineTo(drawPosition.current.x, drawPosition.current.y);
        context.current.stroke();
    }

    function stopDrawing() {
        isDrawing.current = false;
    }
    
    function onKeyDown(event: KeyboardEvent) {
        if (event.key !== 'Space' && event.code !== 'Space') return;

        const canvas = outDrawCanvasRef.current;
        if (canvas === null) return;
        
        if (canvas.style.opacity === "0") {
            canvas.style.opacity = "1";
        }
        else {
            canvas.style.opacity = "0";
        }
    }
    
    function recalculateDrawPosition(event: MouseEvent) {
        if (outDrawCanvasRef.current === null) return;
        
        drawPosition.current.x = event.clientX - outDrawCanvasRef.current.offsetLeft;
        drawPosition.current.y = event.clientY - outDrawCanvasRef.current.offsetTop;
    }
    
    function getStrokeStyleForMove(prevPosition: Vector2, curPosition: Vector2): string | CanvasGradient | CanvasPattern {
        const positionDelta = curPosition.clone().sub(prevPosition);
        positionDelta.x *= -1;  // To convert from canvas space
        positionDelta.multiplyScalar(100);  // TODO: calculate scalar from frame time, canvas size, etc.
        positionDelta.addScalar(255);  // To convert to [0, 255] RGB color space and make all values non-negative
        positionDelta.multiplyScalar(0.5);  // To compress all values within [0, 255]. Will be reversed in shader
        
        return `rgb(${positionDelta.x} ${positionDelta.y} 0)`;
    }
    
    return (
        <canvas ref={outDrawCanvasRef}
                className={"draw-canvas"}
        ></canvas>
    );
}
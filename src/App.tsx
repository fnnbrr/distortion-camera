import React, { useRef } from 'react';
import './App.css';
import WebcamVideo from "./WebcamVideo";
import DrawCanvas from "./DrawCanvas";
import RendererCanvas from "./RendererCanvas";

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    
    return (
        <div className="App">
            <WebcamVideo outVideoRef={videoRef} />
            <DrawCanvas outDrawCanvasRef={drawCanvasRef} />
            <RendererCanvas videoRef={videoRef} drawCanvasRef={drawCanvasRef} />
        </div>
    );
}
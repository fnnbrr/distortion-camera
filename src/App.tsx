import React, { useRef } from 'react';
import './App.css';
import WebcamVideo from "./WebcamVideo";
import RendererCanvas from "./RendererCanvas";

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const resetButtonRef = useRef<HTMLButtonElement>(null);
    
    return (
        <div className="App">
            <WebcamVideo ref={videoRef} />
            <RendererCanvas videoRef={videoRef} resetButtonRef={resetButtonRef} />
            <button ref={resetButtonRef}>reset</button>
        </div>
    );
}
import React, { useRef } from 'react';
import './App.css';
import WebcamVideo from "./WebcamVideo";
import RendererCanvas from "./RendererCanvas";

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    return (
        <div className="App">
            <WebcamVideo ref={videoRef} />
            <RendererCanvas videoRef={videoRef} />
        </div>
    );
}
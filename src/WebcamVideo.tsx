import React, { RefObject, useEffect } from 'react';

interface WebcamVideoProps {
    outVideoRef: RefObject<HTMLVideoElement>;
}

export default function WebcamVideo({ outVideoRef }: WebcamVideoProps) {
    useEffect(() => {
        if (navigator.mediaDevices === undefined) {
            console.error(`Cannot access navigator.mediaDevices. Make sure you're using HTTPS.`);
            return;
        }
        
        let mediaStream: MediaStream = new MediaStream();
        
        navigator.mediaDevices.getUserMedia({video: true})
            .then(stream => {
                mediaStream = stream;
                if (outVideoRef.current !== null && outVideoRef.current.srcObject === null) {
                    outVideoRef.current.srcObject = mediaStream;
                    outVideoRef.current.play()
                        .catch(err => console.error(`Error playing video: ${err}`));
                }
            })
            .catch(err => console.error(`Error accessing webcam: ${err}`));
        
        return () => {
            mediaStream.getTracks().forEach(track => track.stop());
        }
    }, []);
    
    return (
        <video ref={outVideoRef} style={{display: "none"}} playsInline></video>
    );
}
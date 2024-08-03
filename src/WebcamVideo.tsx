import React, {
    ForwardedRef,
    forwardRef,
    MutableRefObject,
    useEffect
} from 'react';

interface WebcamVideoProps {
    
}

const WebcamVideo = forwardRef<HTMLVideoElement, WebcamVideoProps>((props: WebcamVideoProps, ref: ForwardedRef<HTMLVideoElement>) => {
    useEffect(() => {
        if (navigator.mediaDevices === undefined) {
            console.error(`Cannot access navigator.mediaDevices. Make sure you're using HTTPS.`);
            return;
        }
        
        const videoRef = ref as MutableRefObject<HTMLVideoElement>;
        
        if (videoRef === null) return;
        
        let mediaStream: MediaStream = new MediaStream();
        
        navigator.mediaDevices.getUserMedia({video: true})
            .then(stream => {
                mediaStream = stream;
                if (videoRef.current !== null && videoRef.current.srcObject === null) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play()
                        .catch(err => console.error(`Error playing video: ${err}`));
                }
            })
            .catch(err => console.error(`Error accessing webcam: ${err}`));
        
        return () => {
            mediaStream.getTracks().forEach(track => track.stop());
        }
    }, [ref]);
    
    return (
        <video ref={ref} style={{display: "none"}} playsInline></video>
    );
});

export default WebcamVideo;
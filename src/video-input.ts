export class VideoInput {
    #constraints: MediaStreamConstraints = {
        video: {
            width: 1280,
            height: 720,
            facingMode: "user"
        }
    };

    #hasQueriedVideoDevices: boolean = false;
    #videoDevices: MediaDeviceInfo[] = [];
    #videoDeviceIndex: number = 0;

    #video: HTMLVideoElement;
    #stream: MediaStream = new MediaStream();
    
    constructor(videoElement: HTMLVideoElement) {
        this.#video = videoElement;

        if (navigator.mediaDevices === undefined) {
            console.error(`Cannot access navigator.mediaDevices. Make sure you're using HTTPS.`);
            return;
        }
    }
    
    async startNextVideoDevice() {
        try {
            // Clean up previous stream
            this.#stream.getTracks().forEach(track => track.stop());
            
            if (this.#hasQueriedVideoDevices && this.#videoDevices.length > 1) {
                this.#updateConstraintsForNextDevice();
            }
            
            this.#stream = await navigator.mediaDevices.getUserMedia(this.#constraints);
            this.#video.srcObject = this.#stream;
            this.#video.play()
                .catch(err => console.error(`Error playing video: ${err}`));

            if (!this.#hasQueriedVideoDevices) {
                await this.#queryVideoDevices();
            }
        } catch (e) {
            console.error(`Error accessing video device: ${e}`);
        }
    }
    
    hasMultipleVideoDevices(): boolean {
        if (!this.#hasQueriedVideoDevices) {
            console.log(`Hasn't queried video devices yet`);
            return false;
        }
        
        return this.#videoDevices.length > 1;
    }
    
    async #queryVideoDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        devices.forEach((device) => {
            if (device.kind === "videoinput") {
                this.#videoDevices.push(device);
            }
        });
        
        this.#hasQueriedVideoDevices = true;
    }
    
    #updateConstraintsForNextDevice() {
        this.#videoDeviceIndex += 1;
        this.#videoDeviceIndex %= this.#videoDevices.length;
        (this.#constraints.video as MediaTrackConstraints).deviceId = {
            exact: this.#videoDevices[this.#videoDeviceIndex].deviceId };
    }
}
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
    
    shouldMirror: boolean = true;
    
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
            await this.#video.play();

            if (!this.#hasQueriedVideoDevices) {
                await this.#queryVideoDevices();
            }

            const deviceCapabilities = this.#stream.getTracks()[0].getCapabilities()
            this.shouldMirror = this.calculateShouldMirror(deviceCapabilities);
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
    
    // Helpful: https://stackoverflow.com/questions/65485170/getusermedia-detect-front-camera
    private calculateShouldMirror(deviceCapabilities: MediaTrackCapabilities) {
        // First check capabilities if provided
        if (deviceCapabilities.facingMode !== undefined) {
            if (deviceCapabilities.facingMode.includes("user") ||
                deviceCapabilities.facingMode.includes("left") ||
                deviceCapabilities.facingMode.includes("right")) {
                return true;
            }
            else if (deviceCapabilities.facingMode.includes("environment")) {
                return false;
            }
        }
        
        // Label will likely contain "front" or "back" on Android
        const currentDevice = this.#videoDevices[this.#videoDeviceIndex];
        if (currentDevice.label.includes("front")) {
            return true;
        }
        else if (currentDevice.label.includes("back")) {
            return false;
        }
        
        // 0 index means user-facing camera on iOS
        if (this.#videoDeviceIndex === 0) {
            return true;
        }
        
        // Default to false for all other cameras
        return false;
    }
}
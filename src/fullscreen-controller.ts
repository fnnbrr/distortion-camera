import fullscreenIcon from "./assets/fullscreen-svgrepo-com.svg";
import fullscreenExitIcon from "./assets/fullscreen-exit-svgrepo-com.svg";

export class FullscreenController {
    private buttonImage: HTMLImageElement;
    private fullscreenElement: HTMLElement;
    
    constructor(button: HTMLButtonElement, buttonImage: HTMLImageElement, fullscreenElement: HTMLElement) {
        this.buttonImage = buttonImage;
        this.fullscreenElement = fullscreenElement;

        this.buttonImage.src = fullscreenIcon;
        
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        button.addEventListener("click", this.toggleFullscreen);
    }
    
    private async toggleFullscreen() {
        if (!document.fullscreenElement) {
            try {
                await this.fullscreenElement.requestFullscreen();
                this.buttonImage.src = fullscreenExitIcon;
            } catch (e) {
                console.error(`Error requesting fullscreen: ${e}`)
            }
        } else {
            try {
                await document.exitFullscreen();
                this.buttonImage.src = fullscreenIcon;
            } catch (e) {
                console.error(`Error exiting fullscreen: ${e}`)
            }
            
        }
    }
}
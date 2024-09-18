import { CropperData } from "../components/ImageCropper";
import { ChatData } from "../interfaces/ChatData";
import { ImageData } from "../interfaces/ImageData";
import { SAMPChatGUIOutput } from "../interfaces/SAMPChatGUI";

let lastChatImages: [SAMPChatGUIOutput | null, HTMLImageElement | null, SAMPChatGUIOutput | null, HTMLImageElement | null] | null = null;
let abortController: AbortController | undefined;

declare const process: any;

export async function render(canvas: HTMLCanvasElement, image: HTMLImageElement | null, imageData: ImageData, cropperData: CropperData, chatData: ChatData, renderChat: boolean) {
    if(abortController) {
        abortController.abort("New render started.");
    }

    abortController = new AbortController();

    const chatIsUsed = (chatData.top.text.length || chatData.bottom.text.length);
    const chatNeedsRender = !lastChatImages || renderChat;

    if(chatIsUsed && chatNeedsRender) {
        function handleLine(line: string) {
            let color = "FFFFFF";

            if(line[0] === '[' && line[9] === ']') {
                line = line.substring(11);
            }

            if((line.startsWith("> ") || line.startsWith("* ")) && !line.startsWith("* [Vehicle alarm]") && !/\\*\s\(([A-Z][a-z]+_[A-Z][a-z]+)\):\s(.+)/.test(line)) {
                if(!chatData.includeAutomatedActions) {
                    if(line.includes("started the engine") || line.includes("stopped the engine") || line.endsWith("checks the time.") || line.endsWith("takes their gun and badge from a locker.")) {
                        return null;
                    }
                }

                line = '*' + line.substring(1);
                color = "C2A4DA";
            }
            else if(line.startsWith("**[CH")) {
                if(!chatData.includeRadio) {
                    return null;
                }

                //color = "B5AF8F";
                color = "FFEC8B";
            }
            else if (line.startsWith("(Radio)")) {
                color = "BFC0C2";
            }
            else if (line.includes(" says [low]: ") || /([A-Za-z]+\s[A-Za-z]+)\s+says(.*)\\[low\\](.*?):\s+(.*)/.test(line)) {
                if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
                    color = "FFFFFF";
                }
                else {
                    color = "C8C8C8";
                }
            }
            else if (line.includes(" says (phone): ") || line.includes(" says (phone - low): ") || /([A-Za-z]+\s[A-Za-z]+)\s+says(.*)\\((phone|phone - low)\\)(.*?):\s+(.*)/.test(line)) {
                if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
                    color = "FFFFFF";
                }
                else {
                    color = "FFFF00";
                }
            }
            else if (line.includes(" says: ") || /([A-Za-z]+\s[A-Za-z]+)\s+(says|shouts|screams)\s+to\s+([A-Za-z]+\s[A-Za-z]+):\s+(.*)/.test(line)|| /([A-Za-z]+\s[A-Za-z]+)\s+(says|shouts|screams)(.*):\s+(.*)/.test(line)) {
                if(line.includes("[MIC]")) {
                    color = "9DFF96";
                }
                else if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
                    color = "FFFFFF";
                }
                else {
                    color = "E6E6E6";
                }
            }
            else if (line.includes(" whispers: ") || /([A-Za-z]+\s[A-Za-z]+)\s+whispers(.*):\s+(.*)/.test(line)) {
                color = "FFFF00";
            }
            else if (line.includes("shouts: ") || line.includes("screams: ")) {
                color = "FFFFFF";
            }
            else if(line.startsWith("[Company Advertisement]") || line.startsWith("[Advertisement]")) {
                if(!chatData.includeBroadcasts) {
                    return null;
                }
                
                color = "33AA33";
            }
            else if(line.startsWith("[SAN]")) {
                if(!chatData.includeBroadcasts) {
                    return null;
                }
                
                color = "FFEC8B";
            }
            else if(line.startsWith("[Government Announcement]")) {
                if(!chatData.includeBroadcasts) {
                    return null;
                }
                
                color = "6495ED";
            }
            else if(line.startsWith("** [") && line.endsWith("**")) {
                if(!chatData.includeRadio) {
                    return null;
                }

                color = "FF8282";
            }
            else if(line === "_______Vehicle Weapon Package:_______") {
                color = "33AA33";
            }
            else if(/^\[\s([0-9]+).\s/.test(line)) {
                color = "F0F8FF";
            }
            else if(line.includes("You will spawn now with")) {
                color = "33AA33";
            }
            else if(line.startsWith("[Drugs] You've taken") || line.startsWith("You've taken")) {
                color = "FFFF00";
            }
            else if(line.trim().length === 0) {
            }
            else {
                console.log("Ignoring: " + line);

                return null;
            }

            return {
                message: line,
                color
            }
        }

        const response = await fetch((window.location.hostname === "localhost")?("http://localhost:8080"):("https://gui.sampscreens.com"), {
        //const response = await fetch("http://localhost:8080", {
            method: "POST",
            signal: abortController.signal,
            headers: {
                "Accept": "image/png"
            },
            body: JSON.stringify({
                offset: chatData.offset,
                fontSize: chatData.fontSize,
                width: Math.min(imageData.width, 3840),
                height: Math.min(imageData.height, 2160),

                top: chatData.top.text.split('\n').map(handleLine).filter(Boolean),
                bottom: chatData.bottom.text.split('\n').map(handleLine).filter(Boolean)
            })
        });

        abortController = undefined;

        const urlCreator = window.URL || window.webkitURL;
        const result = await response.blob();

        const customContentLength = response.headers.get("X-Content-Length");

        if(!customContentLength) {
            throw new Error("Did not receive a custom content length.");
        }

        const [ topImageDataLength, topImageLength, bottomImageDataLength, _bottomImageLength ] = customContentLength.split(',').map((value) => parseInt(value));

        const topImageBlob = result.slice((topImageDataLength + 1), topImageLength);
        const bottomImageBlob = result.slice(topImageDataLength + 1 + topImageLength + 1 + bottomImageDataLength + 1);

        const [ topImageData, topImage, bottomImageData, bottomImage ]: [ PromiseSettledResult<string>, PromiseSettledResult<HTMLImageElement>, PromiseSettledResult<string>, PromiseSettledResult<HTMLImageElement>] = await Promise.allSettled([
            result.slice(0, topImageDataLength).text(),

            (topImageBlob.size > 0)?(
                new Promise<HTMLImageElement>((resolve, reject) => {
                    const chatImage = new Image();
        
                    chatImage.src = urlCreator.createObjectURL(topImageBlob);
                
                    chatImage.onload = () => {
                        resolve(chatImage);
                    };

                    chatImage.onerror = (error) => {
                        console.error(error);

                        reject();
                    };
                })
            ):(Promise.reject()),

            result.slice(topImageDataLength + '\n'.length + topImageLength + '\n'.length, -bottomImageBlob.size).text(),

            (bottomImageBlob.size > 0)?(
                new Promise<HTMLImageElement>((resolve, reject) => {
                    const chatImage = new Image();
        
                    chatImage.src = urlCreator.createObjectURL(bottomImageBlob);
                
                    chatImage.onload = () => {
                        resolve(chatImage);
                    };

                    chatImage.onerror = (error) => {
                        console.error(error);

                        reject();
                    };
                })
            ):(Promise.reject()),
        ]);
    
        lastChatImages = [
            (topImageData.status === "fulfilled")?(JSON.parse(topImageData.value || "null")):(null),
            (topImage.status === "fulfilled")?(topImage.value):(null),

            (bottomImageData.status === "fulfilled")?(JSON.parse(bottomImageData.value || "null")):(null),
            (bottomImage.status === "fulfilled")?(bottomImage.value):(null)
        ];
    }

    const offsetTop = (lastChatImages && lastChatImages[1] && chatData.top.outside && chatData.top.text.length)?(lastChatImages[1].height):(0);
    const offsetForBottomChat = offsetTop + imageData.height;
    const totalHeight = offsetForBottomChat + ((lastChatImages && lastChatImages[3] && chatData.bottom.outside && chatData.bottom.text.length)?(lastChatImages[3].height):(0));

    canvas.width = imageData.width;
    canvas.height = totalHeight;

    canvas.style.aspectRatio = (canvas.width / canvas.height).toString();

    if(canvas.parentElement) { // well... duh
        //canvas.parentElement.style.aspectRatio = (canvas.width / canvas.height).toString();
        //canvas.style.width = `${canvas.width}px`;
        
        canvas.style.maxWidth = `${canvas.width}px`;
        canvas.style.maxHeight = `${canvas.height}px`;
    }

    const context = canvas.getContext("2d");

    if(!context) {
        throw Error("No context");
    }

    context.save();

    const drawImage = () => {
        const filters: string[] = Object.entries(imageData.options).map(([ key, value ]) => {
            if(!value.enabled) {
                return "";
            }

            return `${key}(${value.value})`;
        });

        context.save();

        context.filter = filters.filter(Boolean).join(' ');

        context.drawImage(image!,
            cropperData.x, cropperData.y, cropperData.width * cropperData.scaleX, cropperData.height * cropperData.scaleY,
            0, offsetTop, imageData.width, imageData.height);

        context.restore();
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    if(image) {
        drawImage();
    }

    if(lastChatImages) {
        console.log(lastChatImages);

        const [ topImageData, topImage, bottomImageData, bottomImage ] = lastChatImages;

        if(topImage && chatData.top.text.length) {
            if(chatData.top.useBackground) {
                context.fillStyle = chatData.top.background;

                if(chatData.top.useMask && topImageData) {
                    const padding = chatData.top.maskWidth;
                    
                    for(let mask of topImageData.masks) {
                        context.fillRect(mask.left - padding, mask.top - padding, mask.width + padding + padding, mask.height + padding + padding);
                    }
                }
                else {
                    context.fillRect(0, 0, topImage.width, topImage.height);
                }
            }

            context.drawImage(topImage, 0, 0, topImage.width, topImage.height, 0, 0, topImage.width, topImage.height);
        }
        
        if(bottomImage && chatData.bottom.text.length) {
            const top = totalHeight - bottomImage.height;

            if(chatData.bottom.useBackground) {
                context.fillStyle = chatData.bottom.background;

                if(chatData.bottom.useMask && bottomImageData) {
                    const padding = chatData.bottom.maskWidth;
                    
                    for(let mask of bottomImageData.masks) {
                        context.fillRect(mask.left - padding, top + mask.top - padding, mask.width + padding + padding, mask.height + padding + padding);
                    }
                }
                else {
                   context.fillRect(0, top, bottomImage.width, bottomImage.height);
                }
            }

            context.drawImage(bottomImage,
                0, 0, bottomImage.width, bottomImage.height,
                0, top, bottomImage.width, bottomImage.height
            );
        }
    }

    context.restore();
}

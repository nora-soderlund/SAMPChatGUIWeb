import { CropperData } from "../components/ImageCropper";
import { ChatData } from "../interfaces/ChatData";
import { ImageData } from "../interfaces/ImageData";

let lastChatData: ChatData | null = null;
let lastChatImage: HTMLImageElement | null = null;
let abortController: AbortController | undefined;

declare const process: any;

export async function render(canvas: HTMLCanvasElement, image: HTMLImageElement | null, imageData: ImageData, cropperData: CropperData, chatData: ChatData) {
    if(canvas.width !== imageData.width || canvas.height !== imageData.height) {
        canvas.width = imageData.width;
        canvas.height = imageData.height;

        lastChatImage = null;
        lastChatData = null;
    }

    const context = canvas.getContext("2d");

    if(!context) {
        throw Error("No context");
    }

    if(abortController) {
        abortController.abort("New render started.");
    }

    abortController = new AbortController();

    const chatIsUsed = (chatData.top.length || chatData.bottom.length);
    const chatNeedsRender = (!lastChatImage || lastChatData?.top.length != chatData.top.length || lastChatData?.bottom.length != chatData.bottom.length || lastChatData?.fontSize != chatData.fontSize)
        || (lastChatData.includeRadio !== chatData.includeRadio) || (lastChatData.includeAutomatedActions !== chatData.includeAutomatedActions);

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
            0, 0, canvas.width, canvas.height);

        context.restore();
    }

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
                if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
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
            body: JSON.stringify({
                offset: chatData.offset,
                fontSize: chatData.fontSize,
                width: Math.min(imageData.width, 3840),
                height: Math.min(imageData.height, 2160),

                top: chatData.top.split('\n').map(handleLine).filter(Boolean),
                bottom: chatData.bottom.split('\n').map(handleLine).filter(Boolean)
            })
        });

        abortController = undefined;

        context.save();
    
        const urlCreator = window.URL || window.webkitURL;
        const result = await response.blob();
    
        const chatImage = new Image();
    
        chatImage.src = urlCreator.createObjectURL(result);
    
        chatImage.onload = function() {
            context.clearRect(0, 0, canvas.width, canvas.height);

            if(image) {
                drawImage();
            }
        
            lastChatImage = chatImage;
            lastChatData = {
                ...chatData
            };

            context.drawImage(lastChatImage, 0, 0, lastChatImage.width, lastChatImage.height, 0, 0, lastChatImage.width, lastChatImage.height);

            context.restore();
        };
    }
    else {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if(image) {
            drawImage();
        }

        if(lastChatImage) {
            context.drawImage(lastChatImage, 0, 0, lastChatImage.width, lastChatImage.height, 0, 0, lastChatImage.width, lastChatImage.height);
        }

        context.restore();
    }
}

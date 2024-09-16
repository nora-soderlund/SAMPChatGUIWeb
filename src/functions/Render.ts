import { ChatData, ImageData } from "../App";
import { CropperData } from "../components/ImageCropper";

let lastChatData: ChatData | null = null;
let lastChatImage: HTMLImageElement | null = null;
let abortController: AbortController | undefined;

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
        abortController.abort();
    }

    abortController = new AbortController();

    const chatIsUsed = (chatData.top.length || chatData.bottom.length);
    const chatNeedsRender = (!lastChatImage || lastChatData?.top.length != chatData.top.length || lastChatData?.bottom.length != chatData.bottom.length || lastChatData?.fontSize != chatData.fontSize);

    const drawImage = () => {
        context.drawImage(image!,
            cropperData.x, cropperData.y, cropperData.width * cropperData.scaleX, cropperData.height * cropperData.scaleY,
            0, 0, canvas.width, canvas.height);
    }

    if(chatIsUsed && chatNeedsRender) {
        function handleLine(line: string) {
            let color = "FFFFFF";

            if(line[0] === '[' && line[9] === ']') {
                line = line.substring(11);
            }

            if(line.startsWith("* ")) {
                color = "C2A4DA";
            }
            else if(line.startsWith("**[CH")) {
                color = "B5AF8F";
            }
            else if(line.startsWith("** HQ")) {
                color = "8D8DFF";
            }
            else if(line.startsWith("[Advertisement]") || line.startsWith("[Company Advertisement]")) {
                color = "33AA33";
            }
            else if (line.startsWith("(Radio)")) {
                color = "BFC0C2";
            }

            return {
                message: line,
                color
            }
        }

        const response = await fetch("http://localhost:8080", {
            method: "POST",
            signal: abortController.signal,
            body: JSON.stringify({
                fontSize: chatData.fontSize,
                top: chatData.top.split('\n').map(handleLine),
                bottom: chatData.bottom.split('\n').map(handleLine)
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

import { ChatData, ImageData } from "../App";

let lastChatTopLength = 0;
let lastChatBottomLength = 0;
let lastChatImage: HTMLImageElement | null = null;
let abortController: AbortController | undefined;

export async function render(canvas: HTMLCanvasElement, image: HTMLImageElement | null, imageData: ImageData, chatData: ChatData) {
    if(canvas.width !== imageData.width || canvas.height !== imageData.height) {
        canvas.width = imageData.width;
        canvas.height = imageData.height;

        lastChatImage = null;
        lastChatTopLength = 0;
        lastChatBottomLength = 0;
    }

    const context = canvas.getContext("2d");

    if(!context) {
        throw Error("No context");
    }

    if(abortController) {
        abortController.abort();
    }

    abortController = new AbortController();


    if(chatData.top.length && chatData.bottom.length && (!lastChatImage || lastChatTopLength != chatData.top.length || lastChatBottomLength != chatData.bottom.length)) {
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

        const response = await fetch("http://206.168.212.227:8080", {
            method: "POST",
            signal: abortController.signal,
            body: JSON.stringify({
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
                context.drawImage(image,
                    imageData.left / imageData.scale, imageData.top / imageData.scale, canvas.width / imageData.scale, canvas.height / imageData.scale,
                    0, 0, canvas.width, canvas.height);
            }
        
            lastChatImage = chatImage;
            lastChatTopLength = chatData.top.length;
            lastChatBottomLength = chatData.bottom.length;

            context.drawImage(lastChatImage, 0, 0, lastChatImage.width, lastChatImage.height, 0, 0, lastChatImage.width, lastChatImage.height);

            context.restore();
        };
    }
    else {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if(image) {
            context.drawImage(image,
                imageData.left / imageData.scale, imageData.top / imageData.scale, canvas.width / imageData.scale, canvas.height / imageData.scale,
                0, 0, canvas.width, canvas.height);
        }

        if(lastChatImage && lastChatTopLength == chatData.top.length && lastChatBottomLength == chatData.bottom.length) {
            context.drawImage(lastChatImage, 0, 0, lastChatImage.width, lastChatImage.height, 0, 0, lastChatImage.width, lastChatImage.height);
        }

        context.restore();
    }
}

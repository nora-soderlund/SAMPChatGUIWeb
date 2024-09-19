import { CropperData } from "../components/ImageCropper";
import { ChatData } from "../interfaces/ChatData";
import { ImageData } from "../interfaces/ImageData";
import { SAMPChatGUIOutput } from "../interfaces/SAMPChatGUI";
import parseChatLines from "./ParseChatLines";

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

                top: parseChatLines(chatData, chatData.top.text),
                bottom: parseChatLines(chatData, chatData.bottom.text)
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

        const topImageBlob = result.slice((topImageDataLength + 1), topImageDataLength + 1 + topImageLength);
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
                        if(mask.width === 0) {
                            continue;
                        }

                        context.fillRect(mask.left - padding, mask.top - padding, mask.width + padding + padding, mask.height + padding + padding);
                    }
                }
                else {
                    context.fillRect(0, 0, topImage.width, topImage.height);
                }
            }

            context.drawImage(topImage,
                0, 0, topImage.width, topImage.height,
                0, 0, topImage.width, topImage.height
            );
        }
        
        if(bottomImage && chatData.bottom.text.length) {
            const top = totalHeight - bottomImage.height;

            if(chatData.bottom.useBackground) {
                context.fillStyle = chatData.bottom.background;

                if(chatData.bottom.useMask && bottomImageData) {
                    const padding = chatData.bottom.maskWidth;
                    
                    for(let mask of bottomImageData.masks) {
                        if(mask.width === 0) {
                            continue;
                        }

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

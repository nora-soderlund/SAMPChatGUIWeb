import { useEffect, useRef, useState } from "react";
import { LocalFile } from "../App";
import { render } from "../functions/Render";
import { ImageData } from "../interfaces/ImageData";
import { CropperData } from "./ImageCropper";
import { ChatData } from "../interfaces/ChatData";
import { getChatLinesFromTime } from "../functions/ParseChatLines";

type ChatlogConfiguration = {
    seconds: number;
    lines: number;
    include: boolean;
}

export type ChatPreviewProps = {
    image: LocalFile<HTMLImageElement>;
    chatlog: LocalFile<string>;
    imageData: ImageData;
    cropperData: CropperData;
    chatData: ChatData;
    onFinish: (chatData: ChatData) => void;
};

export default function ChatPreview({ image, imageData, cropperData, chatData: initialChatData, chatlog, onFinish }: ChatPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [ chatData, setChatData ] = useState<ChatData>(initialChatData);
    
    const [ top, setTop ] = useState<ChatlogConfiguration>({
        lines: 10,
        seconds: 90,
        include: true
    });

    const [ bottom, setBottom ] = useState<ChatlogConfiguration>({
        lines: 5,
        seconds: 30,
        include: false
    });

    useEffect(() => {
        if(canvasRef.current) {
            render(canvasRef.current, image.value, imageData, cropperData, chatData, true);
        }
    }, [canvasRef, image, chatlog, chatData]);

    useEffect(() => {
      if(chatlog && image) {
        const bottomFrom = new Date(image.lastModified);
        bottomFrom.setSeconds(bottomFrom.getSeconds() + bottom.seconds);

        setChatData({
          ...chatData,
          top: {
            ...chatData.top,
            text: getChatLinesFromTime(chatData, chatlog.value, image.lastModified, top.lines, top.seconds).trim()
          },
          bottom: {
            ...chatData.bottom,
            text: (bottom.include)?(getChatLinesFromTime(chatData, chatlog.value, bottomFrom, bottom.lines, bottom.seconds, image.lastModified).trim()):("")
          }
        });
      }
    }, [chatlog, image, top, bottom]);

    return (
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, .6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
            <div className="modal" style={{
                padding: 10,
                borderRadius: 10
            }}>
                <div className="header">
                    <p>Chatlog selection</p>
                    <p><small>You can select how many lines within how many seconds should be extracted to the image from the chatlog.</small></p>
                </div>

                <div className="content">
                    <p>Configure the top chat with lines from before the screenshot was taken:</p>

                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10
                        }}>
                        <div style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "row"
                        }}>
                            <p style={{ margin: "auto 10px" }}>Lines:</p>

                            <input type="number" value={top.lines} style={{ flex: 1 }} onChange={(event) => setTop({
                                ...top,
                                lines: parseInt(event.target.value)
                            })}/>
                        </div>

                        <div style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "row"
                        }}>
                            <p style={{ margin: "auto 10px" }}>Seconds:</p>

                            <input type="number" value={top.seconds} style={{ flex: 1 }} onChange={(event) => setTop({
                                ...top,
                                seconds: parseInt(event.target.value)
                            })}/>
                        </div>
                    </div>

                    <br/>

                    <div>
                        <canvas ref={canvasRef}/>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 20,
                        padding: 10,
                        justifyContent: "space-between"
                    }}>
                        <p style={{ margin: 0 }}>Configure the bottom chat with lines from after the screenshot was taken:</p>

                        <div>
                            <input id="bottom-include" type="checkbox" checked={bottom.include} onChange={() => setBottom({
                                ...bottom,
                                include: !bottom.include
                            })}/>

                            <label htmlFor="bottom-include">Include bottom text</label>
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10
                        }}>
                        <div style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "row"
                        }}>
                            <p style={{ margin: "auto 10px" }}>Lines:</p>

                            <input disabled={!bottom.include} type="number" value={bottom.lines} style={{ flex: 1 }} onChange={(event) => setBottom({
                                ...bottom,
                                lines: parseInt(event.target.value)
                            })}/>
                        </div>

                        <div style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "row"
                        }}>
                            <p style={{ margin: "auto 10px" }}>Seconds:</p>

                            <input disabled={!bottom.include} type="number" value={bottom.seconds} style={{ flex: 1 }} onChange={(event) => setBottom({
                                ...bottom,
                                seconds: parseInt(event.target.value)
                            })}/>
                        </div>
                    </div>

                    <br/>

                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "flex-end"
                    }}>
                        <button onClick={() => onFinish(chatData)}>
                            Use selected chatlog
                        </button>

                        <button className="secondary" onClick={() => onFinish(initialChatData)}>
                            Do not use chatlog
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import { render } from "./functions/Render";
import ScreenEditor from "./components/ScreenEditor";
import ScreenEditorEx from "./components/ScreenEditorEx";
import ScreenCropperEx from "./components/ScreenCropperEx";

export type ChatData = {
  top: string;
  bottom: string;

  fontSize: number;
};

export type ImageData = {
  left: number;
  top: number;

  width: number;
  height: number;

  scale: number;  
};

const defaultImageData: ImageData = {
  width: 800,
  height: 600,

  left: 0,
  top: 0,

  scale: 1
};

const defaultChatData: ChatData = {
  top: "* Ray Maverick waves.",
  bottom: "",

  fontSize: 18
};

export default function App() {
  const imageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [chatData, setChatData] = useState<ChatData>(defaultChatData);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageData, setImageData] = useState<ImageData>(defaultImageData);
  
  useEffect(() => {
    const mouseup = (event: WheelEvent) => {
      if(!event.shiftKey) {
        return;
      }

      setImageData({
        ...imageData,
        scale: Math.max(imageData.scale + (event.deltaY / 10000), 0.01)
      })
    };

    document.addEventListener("wheel", mouseup);

    return () => {
      document.removeEventListener("wheel", mouseup);
    };
  }, [imageData]);

  /*useEffect(() => {
    if(!canvasRef.current) {
      return;
    }

    render(canvasRef.current!, image, imageData, chat);
  }, [canvasRef.current, chat, image, imageData]);*/

  useEffect(() => {
    if(!canvasRef.current) {
      return;
    }

    render(canvasRef.current!, null, imageData, chatData);
  }, [canvasRef.current, chatData, imageData]);

  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const image = new Image();

            image.onload = () => {
              setImage(image);
              setImageData({
                ...imageData,
                left: (image.width - imageData.width) / 2,
                top: (image.height - imageData.height) / 2,
              });
            };

            image.src = e.target!.result as string;
        };

        reader.readAsDataURL(file);
    }
  }, [imageData]);

  return (
    <div id="app">
      <div style={{
        display: "flex",
        height: "100%"
      }}>
        <div style={{
          overflowY: "scroll",
          width: "20%",
          display: "flex",
          flexDirection: "column",
          padding: 10,
          boxSizing: "border-box",
          gap: 20
        }}>
          {(!image)?(
            <div style={{
              border: "1px solid #283142",
              background: "#1c2238",
              borderRadius: 10,
              padding: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              boxSizing: "border-box",
              cursor: "pointer"
            }} onClick={() => imageRef.current?.click()}>
              <p style={{
                textAlign: "center"
              }}>
                <b>Choose an image or drag & drop it here</b><br/>
                Any image format that your browser supports is supported, no size limit
              </p>

              <input ref={imageRef} type="file" accept="image/*" onChange={handleImageChange} style={{
                display: "none"
              }}/>
            </div>
          ):(
            <div>
              <div className="modal">
                <div className="header">
                  <p>Image Offset</p>
                </div>

                <div className="content" style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}>
                  {(image) && (
                    <ScreenEditorEx image={image} imageData={imageData} initialPosition={[ imageData.left, imageData.top ]} initialScale={imageData.scale} onChange={(position, scale) => {
                      setImageData({
                        ...imageData,
                        left: position[0],
                        top: position[1],
                        scale
                      })
                    }}/>
                  )}
                </div>
              </div>
              
              <div className="modal">
                <div className="header">
                  <p>Image Cropping</p>
                </div>

                <div className="content" style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}>
                  {(image) && (
                    <ScreenCropperEx image={image} imageData={imageData} initialPosition={[ imageData.left, imageData.top ]} initialScale={imageData.scale} onChange={(position, scale) => {
                      setImageData({
                        ...imageData,
                        left: position[0],
                        top: position[1],
                        scale
                      })
                    }}/>
                  )}
                </div>
              </div>

              <div className="modal">
                <div className="header">
                  <p>Filter</p>
                </div>

                <div className="content" style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    overflowX: "scroll"
                  }}>
                    <div style={{
                      flexBasis: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "rgba(0, 0, 0, .2)"
                    }}>
                      <img src={image.src} style={{
                        aspectRatio: image.width / image.height,
                        height: 60
                      }}/>

                      <small style={{ padding: 5 }}>Normal</small>
                    </div>

                    <div style={{
                      flexBasis: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "rgba(0, 0, 0, .2)"
                    }}>
                      <img src={image.src} style={{
                        height: 60,
                        aspectRatio: image.width / image.height,
                        filter: "grayscale(1)"
                      }}/>

                      <small style={{ padding: 5 }}>Grayscale</small>
                    </div>

                    <div style={{
                      flexBasis: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "rgba(0, 0, 0, .2)"
                    }}>
                      <img src={image.src} style={{
                        height: 60,
                        aspectRatio: image.width / image.height,
                        filter: "sepia(1)"
                      }}/>

                      <small style={{ padding: 5 }}>Sepia</small>
                    </div>

                    <div style={{
                      flexBasis: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "rgba(0, 0, 0, .2)"
                    }}>
                      <img src={image.src} style={{
                        height: 60,
                        aspectRatio: image.width / image.height,
                        filter: "saturate(2)"
                      }}/>

                      <small style={{ padding: 5 }}>Saturate</small>
                    </div>

                    <div style={{
                      flexBasis: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "rgba(0, 0, 0, .2)"
                    }}>
                      <img src={image.src} style={{
                        height: 60,
                        aspectRatio: image.width / image.height,
                        filter: "contrast(2)"
                      }}/>

                      <small style={{ padding: 5 }}>Contrast</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal">
            <div className="header">
              <p>Top chat</p>
            </div>
            
            <div className="content">
              <textarea value={chatData.top} onChange={(event) => setChatData({ ...chatData, top: event.target.value })} style={{
                width: "100%",
                height: 160,
                background: "none",
                resize: "none",
                margin: 0,
                color: "#FFF"
              }}/>
            </div>
          </div>

          <div className="modal">
            <div className="header">
              <p>Bottom chat</p>
            </div>
            
            <div className="content">
              <textarea value={chatData.bottom} onChange={(event) => setChatData({ ...chatData, bottom: event.target.value })} style={{
                width: "100%",
                height: 160,
                background: "none",
                resize: "none",
                margin: 0,
                color: "#FFF"
              }}/>
            </div>
          </div>

          <div className="modal">
            <div className="header">
              <p>Resolution</p>
            </div>
            
            <div className="content" style={{
              display: "flex",
              flexDirection: "row",
              gap: 10
            }}>
              <input type="number" value={imageData.width} style={{ flex: 1 }} onChange={(event) => setImageData({
                ...imageData,
                width: parseInt(event.target.value)
              })}/>

              <p>x</p>
              
              <input type="number" value={imageData.height} style={{ flex: 1 }} onChange={(event) => setImageData({
                ...imageData,
                height: parseInt(event.target.value)
              })}/>
            </div>
          </div>

          <div className="modal">
            <div className="header">
              <p>Font size</p>
            </div>
            
            <div className="content">
              <input type="number" value={chatData.fontSize} style={{ flex: 1 }} onChange={(event) => setChatData({
                ...chatData,
                fontSize: parseInt(event.target.value)
              })}/>
            </div>
          </div>
        </div>

        <div className="modal" style={{
          flex: 1,
          margin: 10
        }}>
          <div className="content" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10
            }}>
              <div style={{
                background: "rgba(0, 0, 0, .1)",
                width: imageData.width,
                height: imageData.height,
                overflow: "hidden",
                position: "relative"
              }}>
                {(image) && (
                  <ScreenEditor image={image} imageData={imageData} initialPosition={[ imageData.left, imageData.top ]} initialScale={imageData.scale} onChange={(position, scale) => {
                    setImageData({
                      ...imageData,
                      left: position[0],
                      top: position[1],
                      scale
                    })
                  }}/>
                )}

                <canvas ref={canvasRef} style={{
                  width: imageData.width,
                  height: imageData.height,
                  pointerEvents: "none",
                  userSelect: "none",
                  position: "absolute",
                  left: 0,
                  top: 0
                }}/>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                justifyContent: "flex-end"
              }}>
                <button style={{ width: 160 }}>Copy to clipboard</button>
                <button className="secondary" style={{ width: 160 }}>Save to disk</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

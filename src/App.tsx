import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import { render } from "./functions/Render";
import ScreenEditor from "./components/ScreenEditor";

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
  scale: 2
};

const defaultResolutions = [
  {
    width: 800,
    height: 600
  },
  {
    width: 1280,
    height: 720
  },
  {
    width: 1920,
    height: 1080
  }
];

export default function App() {
  const imageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [chat, setChat] = useState("* Ray Maverick waves.");
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

    render(canvasRef.current!, null, imageData, chat);
  }, [canvasRef.current, chat, imageData]);

  const handleChatChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setChat(event.target.value);
  }, []);

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
          width: "20%",
          display: "flex",
          flexDirection: "column",
          padding: 10,
          boxSizing: "border-box",
          gap: 20
        }}>
          {(!image)?(
            <div style={{
              border: "3px dashed rgba(255, 255, 255, .5)",
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
            <div className="modal">
              <div className="header">
                <p>Image placement</p>
              </div>

              <div className="content">
                <div style={{
                  background: "rgba(0, 0, 0, .2)",
                  aspectRatio: image.width / image.height,
                  width: "100%",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <img src={image.src} style={{
                    width: "100%",
                    height: "100%",
                    userSelect: "none"
                  }}/>

                  <div style={{
                    position: "absolute",
                    left: `${(imageData.left / image.width) * 100}%`,
                    top: `${(imageData.top / image.height) * 100}%`,
                    width: `${(imageData.width / image.width) * (imageData.scale * 100)}%`,
                    aspectRatio: imageData.width / imageData.height,
                    background: "rgba(255, 255, 255, .1)",
                    border: "1px solid white",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}/>
                </div>
              </div>
            </div>
          )}

          <div className="modal">
            <div className="header">
              <p>Top chat</p>
            </div>
            
            <div className="content">
              <textarea value={chat} onChange={handleChatChange} style={{
                width: "100%",
                height: 200,
                background: "none",
                resize: "none",
                margin: 0,
                padding: 0,
                border: "none",
                color: "#FFF"
              }}/>
            </div>
          </div>

          <div className="modal">
            <div className="header">
              <p>Resolution</p>
            </div>
            
            <div className="content">
              <div style={{
                width: "100%",
                overflowX: "scroll",
                overflowY: "visible"
              }}>
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 10
                }}>
                  {defaultResolutions.map((resolution) => (
                    <div key={resolution.width + resolution.height} style={{
                      height: 100,
                      width: 140,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}>
                      <div style={{
                        width: "100%",
                        maxHeight: "100%",
                        aspectRatio: resolution.width / resolution.height,
                        border: `2px dashed ${(imageData.width === resolution.width && imageData.height === resolution.height)?("#FFF"):("rgba(255, 255, 255, .2)")}`,
                        boxSizing: "border-box",
                        borderRadius: 10,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer"
                      }} onClick={() => {
                        setImageData({
                          ...imageData,
                          width: resolution.width,
                          height: resolution.height
                        });
                      }}>
                        <p>{resolution.width}x{resolution.height}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal" style={{
          flex: 1,
          margin: 10
        }}>
          <div className="header">
            <p>Result</p>
          </div>

          <div className="content" style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
          }}>
            <div>
              <div style={{
                  width: imageData.width,
                  height: imageData.height,
                  overflow: "hidden",
                  position: "relative"
              }}>
                {(image) && (
                  <ScreenEditor image={image} initialPosition={[ imageData.left, imageData.top ]} initialScale={imageData.scale} onChange={(position, scale) => {
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

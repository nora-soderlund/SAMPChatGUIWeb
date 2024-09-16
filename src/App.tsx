import { ChangeEvent, DragEvent, DragEventHandler, useCallback, useEffect, useRef, useState } from "react";

import { render } from "./functions/Render";
import ImageCropper, { CropperData } from "./components/ImageCropper";

export type ChatData = {
  top: string;
  bottom: string;

  fontSize: number;

  includeRadio: boolean;
  includeAutomatedActions: boolean;
};

type ImageDataOption = {
  enabled: boolean;
  value: number;
  maxValue: number;
};

export type ImageData = {
  width: number;
  height: number;

  options: {
    brightness: ImageDataOption;
    grayscale: ImageDataOption;
    sepia: ImageDataOption;
    saturate: ImageDataOption;
    contrast: ImageDataOption;
  };
};

const defaultImageData: ImageData = {
  width: 800,
  height: 600,

  options: {
    brightness: {
      enabled: false,
      value: 1,
      maxValue: 2
    },
    
    grayscale: {
      enabled: false,
      value: 1,
      maxValue: 2
    },

    sepia: {
      enabled: false,
      value: 1,
      maxValue: 1
    },

    saturate: {
      enabled: false,
      value: 2,
      maxValue: 4
    },

    contrast: {
      enabled: false,
      value: 1.5,
      maxValue: 3
    }
  }
};

const defaultChatData: ChatData = {
  top: "* Ray Maverick waves.",
  bottom: "",

  fontSize: 18,

  includeRadio: true,
  includeAutomatedActions: false
};

const defaultCropperData: CropperData = {
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  scaleX: 1,
  scaleY: 1
};


type OptionProps = {
  text: string;
  option: keyof ImageData["options"];
  image: HTMLImageElement;
  imageData: ImageData;
  setImageData: (value: ImageData) => void;
};

function Option({ text, option, image, imageData, setImageData }: OptionProps) {
  return (
    <div style={{
      flexBasis: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "rgba(0, 0, 0, .2)",
      opacity: (imageData.options[option].enabled)?(1):(0.5),
      position: "relative"
    }}>
      <img src={image!.src} style={{
        width: "100%",
        aspectRatio: image!.width / image!.height,
        filter: `${option}(${defaultImageData.options[option].value})`
      }}/>

      <small style={{ padding: 5 }}>{text}</small>

      {(imageData.options[option].enabled)?(
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, .2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}>
          <input type="range" min={0} max={imageData.options[option].maxValue} value={imageData.options[option].value} step={0.01} onChange={(event) =>  setImageData({
            ...imageData,
            options: {
              ...imageData.options,
              [option]: {
                ...imageData.options[option],
                value: parseFloat(event.target.value)
              }
            }
          })}/>

          <p style={{
            cursor: "pointer"
          }} onClick={() => setImageData({
            ...imageData,
            options: {
              ...imageData.options,
              [option]: {
                ...imageData.options[option],
                enabled: false
              }
            }
          })}>
            Remove
          </p>
        </div>
      ):(
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          cursor: "pointer"
        }} onClick={() => setImageData({
          ...imageData,
          options: {
            ...imageData.options,
            [option]: {
              ...imageData.options[option],
              enabled: true
            }
          }
        })}/>
      )}
    </div>
  );
}

export default function App() {
  const imageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [chatData, setChatData] = useState<ChatData>(defaultChatData);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageData, setImageData] = useState<ImageData>(defaultImageData);
  const [cropperData, setCropperData] = useState<CropperData>(defaultCropperData);

  /*useEffect(() => {
    if(!canvasRef.current) {
      return;
    }

    render(canvasRef.current!, image, imageData, chat);
  }, [canvasRef.current, chat, image, imageData]);*/

  useEffect(() => {
    if(!previewRef.current) {
      return;
    }

    const timeout = setTimeout(() => {
      render(previewRef.current!, image, imageData, cropperData, chatData);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [previewRef.current, image, chatData, cropperData, imageData]);

  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const image = new Image();

            image.onload = () => {
              setImage(image);
            };

            image.src = e.target!.result as string;
        };

        reader.readAsDataURL(file);
    }
  }, [imageData]);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();

    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for(let item of event.dataTransfer.items) {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();

          if(file) {
            const reader = new FileReader();
    
            reader.onload = (e) => {
                const image = new Image();
    
                image.onload = () => {
                  setImage(image);
                };
    
                image.src = e.target!.result as string;
            };
    
            reader.readAsDataURL(file);

            return;
          }
        }
      }
    }

    for(let file of event.dataTransfer.files) {
      const reader = new FileReader();

      reader.onload = (e) => {
          const image = new Image();

          image.onload = () => {
            setImage(image);
          };

          image.src = e.target!.result as string;
      };

      reader.readAsDataURL(file);

      return;
    }
  }, []);

  return (
    <div id="app">
      <div style={{
        display: "flex",
        height: "100%"
      }}>
        <div style={{
          overflowY: "scroll",
          width: "20vw",
          display: "flex",
          flexDirection: "column",
          padding: 10,
          boxSizing: "border-box",
          gap: 20
        }}>
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
          }}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => imageRef.current?.click()}
          >
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

          <div className="modal">
            <div className="header">
              <p>Filtering</p>
            </div>
            
            <div className="content">
              <fieldset>
                <input id="radio" type="checkbox" checked={chatData.includeRadio} onClick={() => setChatData({
                  ...chatData,
                  includeRadio: !chatData.includeRadio
                })}/>

                <label htmlFor="radio">Include radio</label>
              </fieldset>
              
              <fieldset>
                <input id="radio" type="checkbox" checked={chatData.includeAutomatedActions} onClick={() => setChatData({
                  ...chatData,
                  includeAutomatedActions: !chatData.includeAutomatedActions
                })}/>

                <label htmlFor="radio">Include automated actions</label>
              </fieldset>
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
              {(image)?(
                <div style={{
                  background: "rgba(0, 0, 0, .1)",
                  width: "90%",
                  aspectRatio: image.width / image.height,
                  position: "relative"
                }}>
                  <ImageCropper image={image} imageData={imageData} cropperData={cropperData} onChange={setCropperData}/>

                  <canvas ref={canvasRef} style={{
                    width: imageData.width,
                    height: imageData.height,
                    pointerEvents: "none",
                    userSelect: "none",
                    position: "absolute",
                    left: 0,
                    top: "100%"
                  }}/>
                </div>
              ):(
                <div style={{
                  background: "rgba(0, 0, 0, .1)",
                  width: imageData.width,
                  height: imageData.height,
                  overflow: "hidden",
                  position: "relative"
                }}>
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
              )}
            </div>

            <div style={{
              width: "90%"
            }}>
              <p style={{
                maxWidth: 600,
                marginRight: "auto"
              }}>
                <small>
                  This application is provided to the community of LS-RP since the previously used tool was abruptly brought down by its creator. This tool was put together on short notice and is continuously being worked on.
                </small>
              </p>
            </div>
          </div>
        </div>

        
        <div style={{
          overflowY: "scroll",
          width: "20vw",
          padding: 10,
          boxSizing: "border-box",
          direction: "rtl"
        }}>
          <div style={{
          display: "flex",
          flexDirection: "column",
            direction: "ltr",
            gap: 20,
          }}>
          {(image) && (
            <>
              <div className="modal">
                <div className="header">
                  <p>Preview</p>
                </div>

                <div className="content">
                  <div style={{
                    background: "rgba(0, 0, 0, .1)",
                    width: "100%",
                    aspectRatio: imageData.width / imageData.height,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <canvas ref={previewRef} style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      left: 0,
                      top: 0
                    }}/>
                  </div>
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
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}>
                    <Option image={image} imageData={imageData} setImageData={setImageData} text="Brightness" option="brightness"/>
                    <Option image={image} imageData={imageData} setImageData={setImageData} text="Grayscale" option="grayscale"/>
                    <Option image={image} imageData={imageData} setImageData={setImageData} text="Sepia" option="sepia"/>
                    <Option image={image} imageData={imageData} setImageData={setImageData} text="Saturate" option="saturate"/>
                    <Option image={image} imageData={imageData} setImageData={setImageData} text="Contrast" option="contrast"/>
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                justifyContent: "flex-end"
              }}>
                <button style={{ width: 160 }} onClick={() => {
                  if(!previewRef.current) {
                    return;
                  }

                  try {
                    previewRef.current.toBlob(blob => blob && navigator.clipboard.write([
                      new ClipboardItem({
                        'image/png': blob
                      })
                    ]));

                    alert("Copied to your clipboard.");
                  }
                  catch(error) {
                    console.error(error);

                    alert("Failed to copy to the clipboard.");
                  }
                }}>
                  Copy to clipboard
                </button>

                <button className="secondary" style={{ width: 160 }} onClick={() => {
                  if(!previewRef.current) {
                    return;
                  }
                  
                  const downloadLink = document.createElement('a');
                  downloadLink.setAttribute('download', `Screenshot ${new Date().toISOString()}.png`);

                  previewRef.current.toBlob(blob => {
                    if(blob) {
                      const url = URL.createObjectURL(blob);
                      downloadLink.setAttribute('href', url);
                      downloadLink.click();
                    }
                });
                }}>
                  Save to disk
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

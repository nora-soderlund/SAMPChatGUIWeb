import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";

import { render } from "./functions/Render";
import ImageCropper, { CropperData } from "./components/ImageCropper";
import { loadLocalStorageData, saveLocalStorageData } from "./functions/LocalStorage";
import { ImageData, defaultImageData } from "./interfaces/ImageData";
import { ChatData, defaultChatData } from "./interfaces/ChatData";
import Option from "./components/Option";
import Chat from "./components/Chat";

const defaultCropperData: CropperData = {
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  scaleX: 1,
  scaleY: 1
};

export default function App() {
  const imageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [chatData, setChatData] = useState<ChatData>(defaultChatData);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageData, setImageData] = useState<ImageData>(defaultImageData);
  const [cropperData, setCropperData] = useState<CropperData>(defaultCropperData);

  useEffect(() => {
    const localStorageData = loadLocalStorageData();

    if(localStorageData) {
      setImageData(localStorageData.imageData);
      setChatData(localStorageData.chatData);
    }
  }, []);

  useEffect(() => {
    if(!previewRef.current) {
      return;
    }

    let timeout: number | null = setTimeout(() => {
      timeout = null;

      render(previewRef.current!, image, imageData, cropperData, chatData, false);
      
      saveLocalStorageData({
        imageData,
        chatData
      })
    }, 300);

    return () => {
      if(timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [previewRef.current, image, cropperData]);

  useEffect(() => {
    if(!previewRef.current) {
      return;
    }

    let timeout: number | null = setTimeout(() => {
      timeout = null;

      render(previewRef.current!, image, imageData, cropperData, chatData, true);
      
      saveLocalStorageData({
        imageData,
        chatData
      })
    }, 300);

    return () => {
      if(timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [previewRef.current, chatData, imageData]);

  useEffect(() => {
    if(image) {
      let fontSize = 18;

      if(image.width < 1024) {
        fontSize = 14;
      } else if(image.width == 1024) {
        fontSize = 16;
      } else {
        fontSize = 18;
      }

      setChatData({
        ...chatData,
        fontSize
      });
    }
  }, [ image ]);

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

          <hr/>

          <Chat id="top" title="Top chat" chatSection={chatData.top} onChange={(chatSection) =>
            setChatData({
              ...chatData,
              top: chatSection
            })}/>

          <hr/>

          <Chat id="bottom" title="Bottom chat" chatSection={chatData.bottom} onChange={(chatSection) =>
            setChatData({
              ...chatData,
              bottom: chatSection
            })}/>

          <hr/>

          <div className="modal">
            <div className="header">
              <p>Filtering</p>
            </div>
            
            <div className="content">
              <fieldset>
                <input id="includeRadio" type="checkbox" checked={chatData.includeRadio} onChange={() => setChatData({
                  ...chatData,
                  includeRadio: !chatData.includeRadio
                })}/>

                <label htmlFor="includeRadio">Include radio</label>
              </fieldset>
              
              <fieldset>
                <input id="includeAutomatedActions" type="checkbox" checked={chatData.includeAutomatedActions} onChange={() => setChatData({
                  ...chatData,
                  includeAutomatedActions: !chatData.includeAutomatedActions
                })}/>

                <label htmlFor="includeAutomatedActions">Include automated actions</label>
              </fieldset>
              
              <fieldset>
                <input id="includeBroadcasts" type="checkbox" checked={chatData.includeBroadcasts} onChange={() => setChatData({
                  ...chatData,
                  includeBroadcasts: !chatData.includeBroadcasts
                })}/>

                <label htmlFor="includeBroadcasts">Include broadcasts (ads, news, government)</label>
              </fieldset>
            </div>
          </div>

          <hr/>

          <div className="modal">
            <div className="header">
              <p>Resolution</p>
              <p><small>How big your result image should be, default is 800 by 600.</small></p>
            </div>
            
            <div className="content" style={{
              display: "flex",
              flexDirection: "row",
              gap: 10
            }}>
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "row"
              }}>
                <p style={{ margin: "auto 10px" }}>Width:</p>

                <input type="number" value={imageData.width} style={{ flex: 1 }} onChange={(event) => setImageData({
                  ...imageData,
                  width: parseInt(event.target.value)
                })}/>
              </div>

              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "row"
              }}>
                <p style={{ margin: "auto 10px" }}>Height:</p>

                <input type="number" value={imageData.height} style={{ flex: 1 }} onChange={(event) => setImageData({
                  ...imageData,
                  height: parseInt(event.target.value)
                })}/>
              </div>
            </div>
          </div>

          <div className="modal">
            <div className="header">
              <p>Offsets</p>
              <p><small>How far away the text should be from the edges, default is 30 by 10 in SAMP.</small></p>
            </div>
            
            <div className="content" style={{
              display: "flex",
              flexDirection: "row",
              gap: 10
            }}>
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "row"
              }}>
                <p style={{ margin: "auto 10px" }}>Left:</p>

                <input type="number" value={chatData.offset.left} style={{ flex: 1 }} onChange={(event) => setChatData({
                  ...chatData,
                  offset: {
                    ...chatData.offset,
                    left: parseInt(event.target.value)
                  }
                })}/>
              </div>

              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "row"
              }}>
                <p style={{ margin: "auto 10px" }}>Top:</p>

                <input type="number" value={chatData.offset.top} style={{ flex: 1 }} onChange={(event) => setChatData({
                  ...chatData,
                  offset: {
                    ...chatData.offset,
                    top: parseInt(event.target.value)
                  }
                })}/>
              </div>
            </div>
          </div>

          <div className="modal">
            <div className="header">
              <p>Font size</p>
              <p><small>Font sizes varies by resolution. For 800x600, the recommended font size is 14.</small></p>
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
              <p>Character name</p>
              <p><small>Your character name can be used to make /low's by you whiter than others.</small></p>
            </div>
            
            <div className="content">
              <input type="text" placeholder="John Doe" value={chatData.characterName} style={{ flex: 1 }} onChange={(event) => setChatData({
                ...chatData,
                characterName: event.target.value
              })}/>

            </div>
          </div>
        </div>

        <div className="modal" style={{
          flex: 1,
          margin: 10,
          position: "relative"
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
          </div>

          <div style={{
            position: "absolute",
            left: 0,
            bottom: 0
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

        
        <div style={{
          overflowY: "scroll",
          flex: 1,
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
          <div className="modal">
            <div className="header">
              <p>Preview</p>
            </div>

            <div className="content" style={{
              display: "flex",
              justifyContent: "center",
            }}>
              <div style={{
                background: "rgba(0, 0, 0, .1)",
                width: "100%",
                maxWidth: imageData.width,
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

          {(image) && (
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
                  flexWrap: "wrap",
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
          )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

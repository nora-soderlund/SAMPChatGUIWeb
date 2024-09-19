import { ChatData } from "../interfaces/ChatData";
import { ImageData } from "../interfaces/ImageData";
import Option from "./Option";

export type PreviewAreaProps = {
    previewRef: React.RefObject<HTMLCanvasElement>;
    chatData: ChatData;
    image: HTMLImageElement | null;
    imageData: ImageData;
    setImageData: (imageData: ImageData) => void;
};

export default function PreviewArea({ previewRef, chatData, image, imageData, setImageData }: PreviewAreaProps) {
    return (
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
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{
                overflow: "hidden",
                position: "relative",
                width: "90%",
                display: "flex",
                justifyContent: "center"
              }}>
                <canvas ref={previewRef} style={{
                  background: "rgba(0, 0, 0, .1)",
                  width: "100%",
                }}/>
              </div>
              
              {(chatData.top.text.startsWith('\n')) && (
                <p><small>Your top text starts with a new line, remove the empty line to get rid of the empty space on the top.</small></p>
              )}
              
              {(chatData.top.text.endsWith('\n')) && (
                <p><small>Your top text end with a new line, remove the empty line to get rid of the empty space on the bottom.</small></p>
              )}
              
              {(chatData.bottom.text.startsWith('\n')) && (
                <p><small>Your bottom text starts with a new line, remove the empty line to get rid of the empty space on the top.</small></p>
              )}
              
              {(chatData.bottom.text.endsWith('\n')) && (
                <p><small>Your bottom text ends with a new line, remove the empty line to get rid of the empty space on the bottom.</small></p>
              )}
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
    );
}

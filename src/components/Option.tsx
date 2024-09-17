import { ImageData, defaultImageData } from "../interfaces/ImageData";

export type OptionProps = {
    text: string;
    option: keyof ImageData["options"];
    image: HTMLImageElement;
    imageData: ImageData;
    setImageData: (value: ImageData) => void;
  };
  
export default function Option({ text, option, image, imageData, setImageData }: OptionProps) {
    return (
      <div style={{
        width: 400,
        maxWidth: "40%",
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

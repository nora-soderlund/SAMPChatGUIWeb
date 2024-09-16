import { MouseEventHandler, WheelEvent, useCallback, useEffect, useRef, useState } from "react";
import { ScreenEditorProps } from "./ScreenEditor";
import Cropper from "cropperjs";
import { ImageData } from "../App";

export type CropperData = {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
}

export type ImageCropperProps = {
    image: HTMLImageElement;
    imageData: ImageData;
    cropperData: CropperData;
    onChange: (cropperData: CropperData) => void;
};

export default function ImageCropper({ image, imageData, cropperData, onChange }: ImageCropperProps) {
    const containerRef = useRef<HTMLImageElement>(null);
    
    const [cropper, setCropper] = useState<Cropper | null>(null);
    const [cropActive, setCropActive] = useState(false);

    useEffect(() => {
        if(!cropper || cropActive) {
            return;
        }

        cropper.setData(cropperData);
    }, [cropper, cropperData]);

    useEffect(() => {
        if(containerRef.current) {
            const cropper = new Cropper(containerRef.current, {
                aspectRatio: imageData.width / imageData.height,
                
                ready() {
                    setCropper(cropper);
                },
                crop(event) {
                  console.log(event.detail.x);
                  console.log(event.detail.y);
                  console.log(event.detail.width);
                  console.log(event.detail.height);
                  console.log(event.detail.rotate);
                  console.log(event.detail.scaleX);
                  console.log(event.detail.scaleY);
                },
                cropstart() {
                    setCropActive(true);
                },
                cropend() {
                    onChange(cropper.getData());
                    
                    setCropActive(false);
                }
            });
        }
    }, [containerRef]);

    return (
        <div 
        style={{
            width: "100%",
            background: "rgba(0, 0, 0, .2)"
        }}>
            <img
                ref={containerRef}
                src={image.src}
                style={{
                    display: "block",
                    maxWidth: "100%"
                }}/>
        </div>
    );
}

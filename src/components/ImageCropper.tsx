import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import { ImageData } from "../interfaces/ImageData";

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

    useEffect(() => {
        if(!cropper) {
            return;
        }

        cropper.setData(cropperData);
    }, [cropperData]);
    
    useEffect(() => {
        if(!cropper) {
            return;
        }

        cropper.setAspectRatio(imageData.width / imageData.height);
        onChange(cropper.getData());
    }, [imageData.width, imageData.height]);

    useEffect(() => {
        cropper?.reset();
        cropper?.destroy();

        if(containerRef.current) {
            const cropper = new Cropper(containerRef.current, {
                aspectRatio: imageData.width / imageData.height,
                
                ready() {
                    setCropper(cropper);
                    
                    onChange(cropper.getData());
                },
                zoom() {
                    onChange(cropper.getData());
                },
                cropend() {
                    onChange(cropper.getData());
                }
            });
        }
    }, [containerRef, image]);

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

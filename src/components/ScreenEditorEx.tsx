import { MouseEventHandler, WheelEvent, useCallback, useEffect, useRef, useState } from "react";
import { ScreenEditorProps } from "./ScreenEditor";

export default function ScreenEditorEx({ image, imageData, initialPosition, initialScale: scale, onChange }: ScreenEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [ position, setPosition ] = useState(initialPosition);

    const [ mouseDown, setMouseDown ] = useState(false);
    const [ mousePosition, setMousePosition ] = useState<[ number, number ] | null>(null);

    useEffect(() => {
        setPosition(initialPosition);
    }, [ initialPosition, ]);

    useEffect(() => {
        if(mouseDown) {
            const mouseup = () => {
                onChange(position, scale);

                setMouseDown(false);
            };

            document.addEventListener("mouseup", mouseup);

            return () => {
                document.removeEventListener("mouseup", mouseup);
            };
        }
    }, [mouseDown, position, scale]);

    useEffect(() => {
        if(mouseDown && containerRef.current) {
            const mousemove = (event: MouseEvent) => {
                if(!mouseDown || !mousePosition || !containerRef.current) {
                    return;
                }

                const box = containerRef.current.getBoundingClientRect();

                const difference = [
                    (((event.pageX - mousePosition[0]) / box.width) * image.width) * scale,
                    (((event.pageY - mousePosition[1]) / box.width) * image.width) * scale
                ];
        
                setPosition([
                    position[0] + difference[0],
                    position[1] + difference[1],
                ]);
                setMousePosition([ event.pageX, event.pageY ]);
            };

            document.addEventListener("mousemove", mousemove);

            return () => {
                document.removeEventListener("mousemove", mousemove);
            };
        }
    }, [containerRef.current, mouseDown, mousePosition, position, scale]);

    const handleMouseDown = useCallback<MouseEventHandler>((event) => {
        setMousePosition([ event.pageX, event.pageY ]);
        setMouseDown(true);
    }, []);

    return (
        <div 
        ref={containerRef}
        style={{
            width: "100%",
            aspectRatio: image.width / image.height,
            background: "rgba(0, 0, 0, .2)",
            position: "relative"
        }}>
            <img
                src={image.src}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    userSelect: "none"
                }}/>

            <div
            style={{
                background: "rgba(255, 255, 255, .1)",
                border: "1px solid white",
                width: `${(imageData.width / image.width) / scale * 100}%`,
                aspectRatio: imageData.width / imageData.height,
                position: "absolute",
                left: `${(position[0] / image.width) / scale * 100}%`,
                top: `${(position[1] / image.height) / scale * 100}%`,
                cursor: "pointer"
            }}
            onMouseDown={handleMouseDown}/>
        </div>
    );
}

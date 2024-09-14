import { MouseEventHandler, WheelEvent, useCallback, useEffect, useState } from "react";

type ScreenEditorProps = {
    image: HTMLImageElement;

    initialPosition: [ number, number ];
    initialScale: number;

    onChange: (position: [number, number], scale: number) => void;
};

export default function ScreenEditor({ image, initialPosition, initialScale, onChange }: ScreenEditorProps) {
    const [ position, setPosition ] = useState(initialPosition);
    const [ scale, setScale ] = useState(initialScale);

    const [ mouseDown, setMouseDown ] = useState(false);
    const [ mouseScale, setMouseScale ] = useState(false);
    const [ mousePosition, setMousePosition ] = useState<[ number, number ] | null>(null);

    useEffect(() => {
        setPosition(initialPosition);
        setScale(initialScale);
    }, [ initialPosition, initialScale ]);

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

    const handleMouseDown = useCallback<MouseEventHandler>((event) => {
        setMousePosition([ event.pageX, event.pageY ]);
        setMouseDown(true);

        setMouseScale(event.shiftKey);
    }, []);

    const handleMouseMove = useCallback<MouseEventHandler<HTMLDivElement>>((event) => {
        if(!mouseDown || !mousePosition) {
            return;
        }

        const difference = [Math.floor(event.pageX - mousePosition[0]), Math.floor(event.pageY - mousePosition[1])];

        if(mouseScale) {
            setMousePosition([ event.pageX, event.pageY ]);

            const rect = (event.target as HTMLDivElement).getBoundingClientRect();

            var deltaScale = (difference[1] / rect.height);

            setScale(scale + deltaScale)

            return;
        }
        else {
            setPosition([ position[0] - difference[0], position[1] - difference[1] ]);
            setMousePosition([ event.pageX, event.pageY ]);
        }
    }, [ mouseDown, mousePosition, position, scale, mouseScale ]);

    const handleWheel = useCallback((event: WheelEvent) => {
        var deltaScale = (event.deltaY > 0) ? (-0.1) : (0.1);

        onChange(position, scale + deltaScale);
    }, [ position, scale ]);

    return (
        <div 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            style={{
                cursor: "move",
                position: "absolute",
                left: -position[0],
                top: -position[1],
                width: image.width * scale,
                height: image.height * scale,
                display: "flex"
            }}>
            <img
                src={image.src}
                style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    userSelect: "none"
                }}/>
        </div>
    );
}

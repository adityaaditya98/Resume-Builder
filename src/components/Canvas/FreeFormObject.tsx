import { useRef, useState } from 'react';
import { useStore, type CanvasElement } from '../../store/useStore';
import { Rnd } from 'react-rnd';

interface FreeFormObjectProps {
    element: CanvasElement;
    isSelected: boolean;
}

export const FreeFormObject = ({ element, isSelected }: FreeFormObjectProps) => {
    const { updateElement, setSelectedIds, toggleSelection } = useStore();
    const elementRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleDragStop = (_e: unknown, d: { x: number, y: number }) => {
        updateElement(element.id, { x: d.x, y: d.y });
    };

    const handleResizeStop = (_e: unknown, _direction: unknown, ref: HTMLElement, _delta: unknown, position: { x: number, y: number }) => {
        updateElement(element.id, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            ...position
        });
    };

    return (
        <Rnd
            size={{ width: element.width, height: element.height }}
            position={{ x: element.x, y: element.y }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            onMouseDown={(e: MouseEvent) => {
                e.stopPropagation();
                if (!isSelected) {
                    if (e.shiftKey) {
                        toggleSelection(element.id);
                    } else {
                        setSelectedIds([element.id]);
                    }
                }
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            bounds="parent"
            style={{
                zIndex: isSelected ? 1000 : 10,
                pointerEvents: 'auto'
            }}
            disableDragging={element.locked}
            enableResizing={!element.locked && isSelected}
        >
            <div
                ref={elementRef}
                className={`w-full h-full relative group ${isSelected ? 'ring-2 ring-blue-500' : isHovered ? 'ring-1 ring-blue-300' : ''}`}
                style={{
                    opacity: element.opacity,
                    transform: `rotate(${element.rotation}deg)`,
                }}
            >
                {/* Content Rendering based on type */}
                {element.type === 'text' && (
                    <div
                        style={{
                            fontSize: element.fontSize,
                            color: element.fill,
                            fontWeight: element.fontWeight,
                            fontFamily: element.fontFamily,
                            textAlign: element.textAlign,
                            width: '100%',
                            height: '100%',
                            // display: 'flex', // Removed to fix textAlign
                            // alignItems: 'center', // Removed to fix textAlign
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {element.content}
                    </div>
                )}

                {element.type === 'shape' && (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: element.fill,
                            borderRadius: element.content === 'circle' ? '50%' : 0
                        }}
                    />
                )}

                {element.type === 'image' && (
                    <img
                        src={element.content}
                        alt=""
                        className="w-full h-full object-cover pointer-events-none"
                    />
                )}
            </div>
        </Rnd>
    );
};

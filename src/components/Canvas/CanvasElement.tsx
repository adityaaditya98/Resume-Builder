import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';
import type { CanvasElement } from '../../store/useStore';

interface CanvasElementProps {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: (id: string, e: React.MouseEvent) => void;
}

// Import icons for renderer
import {
    Heart, Star, User, Mail, Phone, Globe, MapPin, Camera, Image as ImageIcon,
    Music, Video, Folder, File, Bell, Calendar, Clock, Lock, Unlock,
    Search, Menu, Home, Settings, Trash2, Edit, Plus, Minus, Check, X,
    ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft,
    Facebook, Instagram, Twitter, Linkedin, Github, Youtube,
    Briefcase, GraduationCap, FileText
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
    'heart': Heart, 'star': Star, 'user': User, 'mail': Mail, 'phone': Phone,
    'globe': Globe, 'map-pin': MapPin, 'camera': Camera, 'image': ImageIcon,
    'music': Music, 'video': Video, 'folder': Folder, 'file': File,
    'bell': Bell, 'calendar': Calendar, 'clock': Clock,
    'lock': Lock, 'unlock': Unlock, 'search': Search, 'menu': Menu,
    'home': Home, 'settings': Settings, 'trash-2': Trash2, 'edit': Edit,
    'plus': Plus, 'minus': Minus, 'check': Check, 'x': X,
    'arrow-right': ArrowRight, 'arrow-left': ArrowLeft,
    'arrow-up': ArrowUp, 'arrow-down': ArrowDown,
    'chevron-right': ChevronRight, 'chevron-left': ChevronLeft,
    'facebook': Facebook, 'instagram': Instagram, 'twitter': Twitter,
    'linkedin': Linkedin, 'github': Github, 'youtube': Youtube,
    'briefcase': Briefcase, 'graduation-cap': GraduationCap, 'file-text': FileText
};

export const CanvasElementView = ({ element, isSelected, onSelect }: CanvasElementProps) => {
    const { updateElement, removeElement } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    const style: React.CSSProperties = {
        transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
        width: element.width,
        height: isEditing ? 'auto' : element.height,
        minHeight: element.height,
        opacity: element.opacity,
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!isEditing) {
            onSelect(element.id, e);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (element.type === 'text') {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (textRef.current && element.type === 'text') {
            const newContent = textRef.current.innerText;

            if (!newContent.trim()) {
                removeElement(element.id);
            } else {
                const newHeight = textRef.current.scrollHeight;
                updateElement(element.id, {
                    content: newContent,
                    height: newHeight
                });
            }
        }
    };

    useEffect(() => {
        if (isEditing && textRef.current) {
            textRef.current.focus();
            const range = document.createRange();
            range.selectNodeContents(textRef.current);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [isEditing]);

    // Icon Renderer
    const renderIcon = () => {
        const IconComponent = ICON_MAP[element.content.toLowerCase()];
        if (!IconComponent) return null;
        return <IconComponent className="w-full h-full" style={{ color: element.fill }} />;
    };

    return (
        <div
            id={element.id}
            className={clsx(
                "absolute top-0 left-0 cursor-move group select-none",
                isSelected ? "z-10" : "z-0",
                isEditing && "cursor-text z-50"
            )}
            style={style}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
            {/* Visual Content */}
            {/* Visual Content */}
            <div
                className={clsx("w-full h-full overflow-hidden", element.animation && `animate-${element.animation}`)}
                style={{
                    transform: `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`
                }}
            >
                {element.type === 'shape' && (
                    <div className="w-full h-full flex items-center justify-center">
                        {element.content === 'rect' && (
                            <div
                                className="w-full h-full"
                                style={{
                                    backgroundColor: element.fill,
                                    borderWidth: `${element.borderWidth || 0}px`,
                                    borderColor: element.borderColor || 'transparent',
                                    borderStyle: element.borderStyle || 'solid',
                                    boxShadow: element.shadowBlur ? `${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur}px ${element.shadowColor || '#000'}` : 'none'
                                }}
                            />
                        )}
                        {element.content === 'circle' && (
                            <div
                                className="w-full h-full rounded-full"
                                style={{
                                    backgroundColor: element.fill,
                                    borderWidth: `${element.borderWidth || 0}px`,
                                    borderColor: element.borderColor || 'transparent',
                                    borderStyle: element.borderStyle || 'solid',
                                    boxShadow: element.shadowBlur ? `${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur}px ${element.shadowColor || '#000'}` : 'none'
                                }}
                            />
                        )}
                        {/* SVGs use filter: drop-shadow for better shape adherence */}
                        {(element.content === 'triangle' || element.content === 'star' || element.content === 'arrow') && element.type === 'shape' && (
                            <div className="w-full h-full" style={{
                                filter: element.shadowBlur ? `drop-shadow(${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur}px ${element.shadowColor || '#000'})` : 'none'
                            }}>
                                {element.content === 'triangle' && (
                                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                        <path
                                            d="M50 0 L100 100 L0 100 Z"
                                            fill={element.fill}
                                            stroke={element.borderColor || 'transparent'}
                                            strokeWidth={element.borderWidth || 0}
                                        />
                                    </svg>
                                )}
                                {element.content === 'star' && (
                                    <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="none">
                                        <path
                                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                            fill={element.fill}
                                            stroke={element.borderColor || 'transparent'}
                                            strokeWidth={element.borderWidth ? element.borderWidth / 4 : 0}
                                        />
                                    </svg>
                                )}
                                {element.content === 'arrow' && (
                                    <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="none">
                                        <path
                                            d="M5 12h14M12 5l7 7-7 7"
                                            stroke={element.fill}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                        />
                                    </svg>
                                )}
                            </div>
                        )}
                        {element.content === 'line' && (
                            <div className="w-full h-1" style={{
                                backgroundColor: element.fill,
                                boxShadow: element.shadowBlur ? `${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur}px ${element.shadowColor || '#000'}` : 'none'
                            }} />
                        )}
                    </div>
                )}

                {element.type === 'image' && (
                    <img
                        src={element.content}
                        alt="element"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                            borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
                            filter: clsx(
                                element.filter || 'none',
                                element.shadowBlur ? `drop-shadow(${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur}px ${element.shadowColor || '#000'})` : ''
                            ),
                            borderWidth: `${element.borderWidth || 0}px`,
                            borderColor: element.borderColor || 'transparent',
                            borderStyle: element.borderStyle || 'solid'
                        }}
                    />
                )}

                {element.type === 'icon' && renderIcon()}

                {element.type === 'text' && (
                    <div
                        ref={textRef}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        onBlur={handleBlur}
                        className="w-full h-full outline-none"
                        style={{
                            fontSize: `${element.fontSize}px`,
                            color: element.fill,
                            textAlign: element.textAlign,
                            fontWeight: element.fontWeight,
                            fontFamily: element.fontFamily,
                            lineHeight: element.lineHeight || 1.4,
                            letterSpacing: `${element.letterSpacing || 0}em`,
                            textShadow: element.shadowBlur ? `${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur}px ${element.shadowColor || '#000'}` : 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        {element.content}
                    </div>
                )}
            </div>

            {/* Hover border (Canva style) */}
            {!isSelected && !isEditing && (
                <div className="absolute inset-0 border border-blue-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
            )}

            {/* Lock Indicator */}
            {element.locked && (
                <div className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm border border-gray-200 z-50">
                    <Lock size={12} className="text-gray-500" />
                </div>
            )}
        </div>
    );
};

import { useStore } from '../../store/useStore';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Copy, Trash2, ArrowUp, ArrowDown, Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';

export const Toolbar = () => {
    const { elements, selectedIds, updateElements, removeElements, duplicate, bringForward, sendBackward, group, ungroup } = useStore();

    // Get all selected elements
    const selectedElements = elements.filter(el => selectedIds.has(el.id));

    if (selectedElements.length === 0) {
        return <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4" />;
    }

    // Determine common type (or mixed)
    const allText = selectedElements.length > 0 && selectedElements.every(el => el.type === 'text');
    const allShape = selectedElements.length > 0 && selectedElements.every(el => el.type === 'shape' || el.type === 'icon');
    const allImage = selectedElements.length > 0 && selectedElements.every(el => el.type === 'image');

    // Derived states
    const showBorder = allShape || allImage;

    // Representative element for values (take first one)
    const first = selectedElements[0];

    // Helper to update all
    const handleUpdate = (updates: any) => {
        const ids = Array.from(selectedIds);
        updateElements(ids, updates);
    };

    return (
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4 overflow-x-auto shadow-sm z-40">
            {allText && (
                <>
                    {/* Font Family (Mock) */}
                    <div className="w-24">
                        <select
                            className="w-full text-xs border-gray-300 rounded hover:bg-gray-50 cursor-pointer outline-none py-1"
                            value={first.fontFamily || 'Inter, sans-serif'}
                            onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Times New Roman', serif">Times</option>
                            <option value="'Courier New', monospace">Courier</option>
                            <option value="Georgia, serif">Georgia</option>
                        </select >
                    </div >

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    {/* Font Size */}
                    <div className="flex items-center gap-2">
                        <Type size={16} className="text-gray-500" />
                        <input
                            type="number"
                            value={first.fontSize || 16}
                            onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) })}
                            className="w-16 p-1 text-sm border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    {/* Color */}
                    <div className="flex items-center gap-2 relative group">
                        <div
                            className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                            style={{ backgroundColor: first.fill }}
                        >
                            <input
                                type="color"
                                value={first.fill}
                                onChange={(e) => handleUpdate({ fill: e.target.value })}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    {/* Styling */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleUpdate({ fontWeight: first.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={clsx(
                                "p-1.5 rounded hover:bg-gray-100 transition-colors",
                                first.fontWeight === 'bold' && "bg-gray-200 text-black"
                            )}
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 cursor-not-allowed"
                            title="Italic (Coming Soon)"
                        >
                            <Italic size={18} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    {/* Alignment */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleUpdate({ textAlign: 'left' })}
                            className={clsx(
                                "p-1.5 rounded hover:bg-gray-100 transition-colors",
                                first.textAlign === 'left' && "bg-gray-200"
                            )}
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            onClick={() => handleUpdate({ textAlign: 'center' })}
                            className={clsx(
                                "p-1.5 rounded hover:bg-gray-100 transition-colors",
                                first.textAlign === 'center' && "bg-gray-200"
                            )}
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            onClick={() => handleUpdate({ textAlign: 'right' })}
                            className={clsx(
                                "p-1.5 rounded hover:bg-gray-100 transition-colors",
                                first.textAlign === 'right' && "bg-gray-200"
                            )}
                        >
                            <AlignRight size={18} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    {/* Spacing & Effects */}
                    <div className="flex items-center gap-2">
                        {/* Spacing Popover Trigger (Mock simplified as immediate controls for now to save space/time, or just a small input) */}
                        <div className="flex flex-col gap-0.5 items-center group relative">
                            <span className="text-[10px] text-gray-500 font-medium">Spacing</span>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-3 hidden group-hover:block w-48 z-50">
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Letter Spacing</span>
                                            <span>{Math.round((first.letterSpacing || 0) * 100)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-0.1"
                                            max="0.5"
                                            step="0.01"
                                            value={first.letterSpacing || 0}
                                            onChange={(e) => handleUpdate({ letterSpacing: parseFloat(e.target.value) })}
                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Line Height</span>
                                            <span>{first.lineHeight || 1.5}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2.5"
                                            step="0.1"
                                            value={first.lineHeight || 1.5}
                                            onChange={(e) => handleUpdate({ lineHeight: parseFloat(e.target.value) })}
                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Type size={16} className="text-gray-600" />
                        </div>

                        {/* Effects Popover Trigger - using same hover pattern for simplicity */}
                        <div className="flex flex-col gap-0.5 items-center group relative">
                            <span className="text-[10px] text-gray-500 font-medium">Effects</span>
                            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-4 hidden group-hover:block w-64 z-50">
                                <h4 className="font-bold text-sm mb-3 text-gray-800">Effects</h4>

                                {/* Shadow section */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-gray-600">Shadow</label>
                                        <input
                                            type="checkbox"
                                            checked={!!first.shadowBlur}
                                            onChange={(e) => handleUpdate({
                                                shadowBlur: e.target.checked ? 4 : 0,
                                                shadowColor: first.shadowColor || '#00000080',
                                                shadowOffsetX: first.shadowOffsetX || 2,
                                                shadowOffsetY: first.shadowOffsetY || 2
                                            })}
                                        />
                                    </div>
                                    {!!first.shadowBlur && (
                                        <div className="space-y-2 pl-2 border-l-2 border-gray-100">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Blur</span>
                                                <input type="range" min="0" max="20" value={first.shadowBlur} onChange={(e) => handleUpdate({ shadowBlur: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none" />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Offset X</span>
                                                <input type="range" min="-10" max="10" value={first.shadowOffsetX || 0} onChange={(e) => handleUpdate({ shadowOffsetX: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none" />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Offset Y</span>
                                                <input type="range" min="-10" max="10" value={first.shadowOffsetY || 0} onChange={(e) => handleUpdate({ shadowOffsetY: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none" />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Color</span>
                                                <input type="color" value={first.shadowColor || '#000000'} onChange={(e) => handleUpdate({ shadowColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-gray-200" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stroke section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-gray-600">Outline</label>
                                        <input
                                            type="checkbox"
                                            checked={!!first.strokeWidth}
                                            onChange={(e) => handleUpdate({
                                                strokeWidth: e.target.checked ? 1 : 0,
                                                strokeColor: first.strokeColor || '#000000'
                                            })}
                                        />
                                    </div>
                                    {!!first.strokeWidth && (
                                        <div className="space-y-2 pl-2 border-l-2 border-gray-100">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Width</span>
                                                <input type="range" min="1" max="10" value={first.strokeWidth} onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-200 rounded-lg appearance-none" />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Color</span>
                                                <input type="color" value={first.strokeColor || '#000000'} onChange={(e) => handleUpdate({ strokeColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-gray-200" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-gray-400 border-dashed" />
                        </div>
                    </div>
                </>
            )}

            {
                allShape && (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600">Fill Color</span>
                            <div className="relative group">
                                <div
                                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer shadow-sm"
                                    style={{ backgroundColor: first.fill }}
                                >
                                    <input
                                        type="color"
                                        value={first.fill}
                                        onChange={(e) => handleUpdate({ fill: e.target.value })}
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {
                allImage && (
                    <>
                        {/* Image Filters */}
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors">
                                    Filters
                                </button>
                                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-3 hidden group-hover:block w-48 z-50">
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleUpdate({ filter: 'none' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            None
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ filter: 'grayscale(100%)' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            Grayscale
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ filter: 'sepia(100%)' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            Sepia
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ filter: 'blur(4px)' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            Blur
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ filter: 'invert(100%)' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            Invert
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ filter: 'brightness(1.5)' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            Brighten
                                        </button>
                                        <button
                                            onClick={() => handleUpdate({ filter: 'contrast(200%)' })}
                                            className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm"
                                        >
                                            High Contrast
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {
                showBorder && (
                    <>
                        <div className="h-6 w-px bg-gray-300 mx-2" />
                        {/* Border Controls */}
                        <div className="relative group flex items-center">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors">
                                <div className="w-4 h-4 border-2 border-current rounded-sm" />
                                <span>Border</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-4 hidden group-hover:block w-64 z-50">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-2">Style</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            {['solid', 'dashed', 'dotted'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleUpdate({ borderStyle: s as any, borderWidth: first.borderWidth || 2 })}
                                                    className={clsx(
                                                        "flex-1 py-1.5 text-xs font-medium rounded capitalize",
                                                        first.borderStyle === s ? "bg-white shadow text-blue-600" : "text-gray-600 hover:bg-gray-200"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-2">Width: {first.borderWidth || 0}px</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="20"
                                            value={first.borderWidth || 0}
                                            onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-2">Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={first.borderColor || '#000000'}
                                                onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                            />
                                            <span className="text-xs text-gray-500 uppercase">{first.borderColor || '#000'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

            {/* Animations (Common) */}
            <div className="relative group flex items-center">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700 transition-colors">
                    {first.animation ? 'Animating' : 'Animate'}
                </button>
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-3 hidden group-hover:block w-48 z-50">
                    <div className="space-y-1">
                        <button onClick={() => handleUpdate({ animation: '' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">None</button>
                        <button onClick={() => handleUpdate({ animation: 'fadeIn' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Fade</button>
                        <button onClick={() => handleUpdate({ animation: 'popIn' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Pop</button>
                        <button onClick={() => handleUpdate({ animation: 'slideInLeft' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Slide Left</button>
                        <button onClick={() => handleUpdate({ animation: 'slideInRight' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Slide Right</button>
                        <button onClick={() => handleUpdate({ animation: 'slideInBottom' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Rise</button>
                        <button onClick={() => handleUpdate({ animation: 'breathe' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Breathe</button>
                        <button onClick={() => handleUpdate({ animation: 'rotateIn' })} className="w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm">Tumble</button>
                    </div>
                </div>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            {/* Common opacity for all types */}
            <div className="ml-auto flex items-center gap-2 border-l border-gray-300 pl-4">
                <span className="text-xs text-gray-500 font-medium">Opacity</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={first.opacity}
                    onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
                    className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-8">{Math.round(first.opacity * 100)}%</span>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            {/* Position / Layering */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => bringForward()}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                    title="Bring Forward (Ctrl + ])"
                >
                    <ArrowUp size={18} />
                </button>
                <button
                    onClick={() => sendBackward()}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                    title="Send Backward (Ctrl + [)"
                >
                    <ArrowDown size={18} />
                </button>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            {/* Actions */}
            <div className="flex items-center gap-1 ml-4 border-l border-gray-300 pl-4">
                <button
                    onClick={() => {
                        const isLocked = first?.locked;
                        handleUpdate({ locked: !isLocked });
                    }}
                    className={clsx(
                        "p-1.5 rounded hover:bg-gray-100 transition-colors",
                        first?.locked ? "text-red-500 bg-red-50" : "text-gray-600",
                        !first && "opacity-0 pointer-events-none"
                    )}
                    title={first?.locked ? "Unlock" : "Lock"}
                >
                    {first?.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>

                <div className="w-px h-4 bg-gray-300 mx-1" />

                <button
                    onClick={() => duplicate()}
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
                    title="Duplicate (Ctrl + D)"
                >
                    <Copy size={16} />
                </button>
                <button
                    onClick={() => {
                        const ids = Array.from(selectedIds);
                        if (ids.length > 0) removeElements(ids);
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete (Del)"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

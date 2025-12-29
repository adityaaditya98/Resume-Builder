import { useRef, useEffect, useState } from 'react';
// import { Canvas } from '../Canvas/Canvas';
import { DocumentCanvas } from '../LayoutBuilder/DocumentCanvas';
import { ZoomControls } from '../Canvas/ZoomControls';
import { useStore } from '../../store/useStore';
import { Grid, HelpCircle, Maximize } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';

export const Workspace = () => {
    const { zoom, setZoom, tool } = useStore();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [spacePressed, setSpacePressed] = useState(false);

    const resumeId = useLayoutStore(state => state.resume.id);
    const layoutVersion = useLayoutStore(state => state.resume.settings.columns); // Proxy for layout change

    // Initial Scroll Center & Reset on Template Change
    useEffect(() => {
        if (scrollContainerRef.current) {
            // If it's a layout change, we reset to top
            scrollContainerRef.current.scrollTop = 0;

            // Optional: Center horizontally if needed, but usually top is priority for Resume
            // const { clientWidth, scrollWidth } = scrollContainerRef.current;
            // scrollContainerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
    }, [resumeId, layoutVersion]);

    // Handle Spacebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault(); // Prevent scrolling
                setSpacePressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setSpacePressed(false);
                setIsPanning(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Handle Keyboard Shortcuts (Copy/Paste/Del, etc)
    useEffect(() => {
        const handleShortcuts = (e: KeyboardEvent) => {
            // Respect text editing inputs
            const activeElement = document.activeElement;
            const isInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement?.getAttribute('contenteditable') === 'true';

            if (isInput) return;

            // Only allow Canvas shortcuts if NOT in Layout mode
            // Layout mode might have its own shortcuts later (e.g., delete block)
            if (useStore.getState().activeTab === 'layout') return;

            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && e.key === 'c') {
                e.preventDefault();
                useStore.getState().copy();
            } else if (isCtrl && e.key === 'd') {
                e.preventDefault();
                useStore.getState().duplicate();
            } else if (isCtrl && e.key === '[') {
                e.preventDefault();
                useStore.getState().sendBackward();
            } else if (isCtrl && e.key === ']') {
                e.preventDefault();
                useStore.getState().bringForward();
            } else if (isCtrl && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
                e.preventDefault();
                useStore.getState().ungroup();
            } else if (isCtrl && (e.key === 'g' || e.key === 'G')) {
                e.preventDefault();
                useStore.getState().group();
            } else if (isCtrl && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                if (e.shiftKey) {
                    useStore.getState().redo();
                } else {
                    useStore.getState().undo();
                }
            } else if (isCtrl && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                useStore.getState().redo();
            } else if ((e.key === 'Delete' || e.key === 'Backspace')) {
                e.preventDefault();
                const selectedIds = Array.from(useStore.getState().selectedIds);
                if (selectedIds.length > 0) {
                    useStore.getState().removeElements(selectedIds);
                }
            } else if (isCtrl && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                useStore.getState().setSelectedIds(useStore.getState().elements.map(el => el.id));
            } else if (isCtrl && e.key === '0') {
                e.preventDefault();
                setZoom(0.5);
                // Reset scroll to center
                setZoom(1);
            } else if (!isInput && (e.key === 't' || e.key === 'T')) {
                e.preventDefault();
                useStore.getState().addElement({
                    id: crypto.randomUUID(),
                    type: 'text',
                    content: 'Add a heading',
                    x: 100,
                    y: 100,
                    width: 400,
                    height: 50,
                    rotation: 0,
                    opacity: 1,
                    fontSize: 24,
                    fill: '#000000',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    fontFamily: 'Inter, sans-serif'
                });
            } else if (!isInput && (e.key === 'r' || e.key === 'R')) {
                e.preventDefault();
                useStore.getState().addElement({
                    id: crypto.randomUUID(),
                    type: 'shape',
                    shapeType: 'rectangle',
                    content: '',
                    x: 150,
                    y: 150,
                    width: 100,
                    height: 100,
                    rotation: 0,
                    opacity: 1,
                    fill: '#00c4cc'
                } as any);
            } else if (!isInput && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                useStore.getState().addElement({
                    id: crypto.randomUUID(),
                    type: 'shape',
                    shapeType: 'circle',
                    content: '',
                    x: 200,
                    y: 200,
                    width: 100,
                    height: 100,
                    rotation: 0,
                    opacity: 1,
                    fill: '#00c4cc'
                } as any);
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                const { selectedIds, elements } = useStore.getState();
                if (selectedIds.size > 0) {
                    e.preventDefault();
                    const step = e.shiftKey ? 10 : 1;

                    const idsToMove = Array.from(selectedIds);


                    // Optimization: Use updateElements for batch update
                    // We need to calculate new position for each
                    // Actually useStore.updateElements takes ids and ONE update object.
                    // Diff elements might need diff updates if we want to move them all by +1? 
                    // No, if we update x: +1, we can't pass {x: oldX + 1} for all.
                    // But we can iterate.

                    // Check locks
                    const unlockedIds = idsToMove.filter(id => {
                        const el = elements.find(e => e.id === id);
                        return el && !el.locked;
                    });

                    if (unlockedIds.length === 0) return;

                    // We must iterate because each element has its own X/Y
                    unlockedIds.forEach(id => {
                        const el = elements.find(e => e.id === id);
                        if (!el) return;
                        let { x, y } = el;
                        if (e.key === 'ArrowUp') y -= step;
                        if (e.key === 'ArrowDown') y += step;
                        if (e.key === 'ArrowLeft') x -= step;
                        if (e.key === 'ArrowRight') x += step;

                        useStore.getState().updateElement(id, { x, y }, false); // Don't save history on every pixel?
                        // Or should we? If holding down, history spam.
                        // Debounce history? For now, let's behave like drag (false).
                        // BUT we need a way to commit history on KeyUp?
                        // Workspace doesn't track KeyUp for history commit easily without state.
                        // Let's pass true for single taps, might spam if held.
                        // Complication: Nudging usually creates history spam.
                        // Decision: Pass true. Users tap keys.
                    });
                }
            }
        };

        window.addEventListener('keydown', handleShortcuts);
        return () => window.removeEventListener('keydown', handleShortcuts);
    });

    // Handle Paste (System + Internal)
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            // Respect text editing inputs (browser handles paste there)
            const activeElement = document.activeElement;
            const isInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement?.getAttribute('contenteditable') === 'true';
            if (isInput) return;

            e.preventDefault();

            // 1. Try Internal Clipboard first
            const { clipboard, paste, addElement } = useStore.getState();
            if (clipboard && clipboard.length > 0) {
                paste();
                return;
            }

            // 2. Try System Clipboard
            if (e.clipboardData) {
                // Check for Files (Images)
                const items = Array.from(e.clipboardData.items);
                const imageItem = items.find(item => item.type.startsWith('image'));

                if (imageItem) {
                    const file = imageItem.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            if (event.target?.result) {
                                const newElement = {
                                    id: crypto.randomUUID(),
                                    type: 'image' as const,
                                    content: event.target.result as string,
                                    x: 100,
                                    y: 100,
                                    width: 300,
                                    height: 300,
                                    rotation: 0,
                                    opacity: 1,
                                    fill: '#ffffff'
                                };
                                addElement(newElement);
                            }
                        };
                        reader.readAsDataURL(file);
                        return;
                    }
                }

                // Check for Text
                const text = e.clipboardData.getData('text');
                if (text && text.trim()) {
                    const newElement = {
                        id: crypto.randomUUID(),
                        type: 'text' as const,
                        content: text,
                        x: 100,
                        y: 100,
                        width: 400,
                        height: 50,
                        rotation: 0,
                        opacity: 1,
                        fontSize: 16,
                        fill: '#000000',
                        fontWeight: 'normal',
                        textAlign: 'left' as const,
                        fontFamily: 'Inter, sans-serif'
                    };
                    addElement(newElement);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Handle Wheel Zoom
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
                setZoom(parseFloat(newZoom.toFixed(1)));
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [zoom, setZoom]);

    // Auto-save Effect
    useEffect(() => {
        // Mark as unsaved immediately on change
        useStore.getState().setSaveStatus('unsaved');

        const timer = setTimeout(() => {
            useStore.getState().setSaveStatus('saving');
            useStore.getState().saveDesign(useStore.getState().designTitle);

            // Add a small delay to show "Saving..." state before switching to "Saved"
            setTimeout(() => {
                useStore.getState().setSaveStatus('saved');
            }, 500);
        }, 2000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useStore.getState().elements, useStore.getState().designTitle]);
    // Note: We access state directly in dependency array to ensure deep comparison if needed, 
    // but here we rely on the generic 'elements' reference change which happens on every update.

    const handleMouseDown = (e: React.MouseEvent) => {
        // Enable panning if tool is hand OR space is pressed
        // And middle mouse button (button 1) always pans
        if (tool === 'hand' || spacePressed || e.button === 1) {
            setIsPanning(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;

        if (scrollContainerRef.current) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;

            scrollContainerRef.current.scrollLeft -= deltaX;
            scrollContainerRef.current.scrollTop -= deltaY;

            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    // Determine cursor style
    const cursorStyle = (tool === 'hand' || spacePressed)
        ? (isPanning ? 'cursor-grabbing' : 'cursor-grab')
        : 'cursor-default';

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Scrollable Canvas Area */}
            <div
                ref={scrollContainerRef}
                className={`flex-1 bg-[#f1f2f6] relative overflow-auto flex items-start justify-center ${cursorStyle}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="min-w-fit min-h-fit p-[5vh] flex items-start justify-center">
                    {/* Always render DocumentCanvas for resume builder mode.
                        In a full canva clone, we might toggle between <Canvas> (freeform) and <DocumentCanvas> (structured).
                        For this specific App, we want the resume to be visible always.
                     */}
                    <DocumentCanvas />
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-10 bg-white border-t border-gray-200 flex items-center justify-between px-4 z-20 shrink-0">
                {/* Left: Page Info */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                        <span>Page 1 of 1</span>
                    </div>
                </div>

                {/* Right: Zoom & Tools */}
                <div className="flex items-center gap-4">
                    <ZoomControls />

                    <div className="w-px h-4 bg-gray-300" />

                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Grid View">
                        <Grid size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Keyboard Shortcuts">
                        <HelpCircle size={16} />
                    </button>
                    <button
                        onClick={() => {
                            // Fullscreen toggle (basic implementation)
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen();
                            } else {
                                document.exitFullscreen();
                            }
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

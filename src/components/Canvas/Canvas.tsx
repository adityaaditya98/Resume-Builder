import { useRef, useState } from 'react';
import Moveable from 'react-moveable';
import { useStore } from '../../store/useStore';
import type { CanvasElement } from '../../store/useStore';
import { CanvasElementView } from './CanvasElement';
import { ContextMenu } from './ContextMenu';
import { v4 as uuidv4 } from 'uuid';

export const Canvas = () => {
    const { elements, selectedIds, setSelectedIds, clearSelection, updateElement, addElement, zoom, canvasWidth, canvasHeight } = useStore();
    const targetRef = useRef<HTMLDivElement>(null);

    const [dragSelection, setDragSelection] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type') as 'text' | 'shape' | 'image' | 'icon';
        const content = e.dataTransfer.getData('content');

        if (!type) return;

        // Calculate drop position relative to canvas
        const canvasRect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - canvasRect.left) / zoom;
        const y = (e.clientY - canvasRect.top) / zoom;

        // Determine default dimensions
        let width = 100;
        let height = 100;
        if (type === 'text') {
            width = 200;
            height = 50;
        } else if (type === 'icon') {
            width = 50;
            height = 50;
        }

        const newElement: CanvasElement = {
            id: uuidv4(),
            type,
            content: content || (type === 'text' ? 'Heading' : 'star'),
            x: x - (width / 2),
            y: y - (height / 2),
            width,
            height,
            rotation: 0,
            opacity: 1,
            fill: type === 'shape' ? '#00c4cc' : (type === 'icon' ? '#333333' : '#000000'),
        };

        addElement(newElement);
        setSelectedIds([newElement.id]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start drag selection if clicking directly on bg
        if (e.target === targetRef.current || e.target === document.getElementById('canvas-content')) {
            const canvasRect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - canvasRect.left) / zoom;
            const y = (e.clientY - canvasRect.top) / zoom;
            setDragSelection({ startX: x, startY: y, currentX: x, currentY: y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragSelection) {
            const canvasRect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - canvasRect.left) / zoom;
            const y = (e.clientY - canvasRect.top) / zoom;
            setDragSelection({ ...dragSelection, currentX: x, currentY: y });
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (dragSelection) {
            // Calculate selection
            const startX = Math.min(dragSelection.startX, dragSelection.currentX);
            const startY = Math.min(dragSelection.startY, dragSelection.currentY);
            const endX = Math.max(dragSelection.startX, dragSelection.currentX);
            const endY = Math.max(dragSelection.startY, dragSelection.currentY);
            const width = endX - startX;
            const height = endY - startY;

            // If it was just a click (or tiny movement), clear selection
            if (width < 5 && height < 5) {
                if (!e.shiftKey) clearSelection();
            } else {
                // Find intersecting elements
                const initialSelected = elements.filter(el => {
                    return (
                        el.x < endX &&
                        el.x + el.width > startX &&
                        el.y < endY &&
                        el.y + el.height > startY
                    );
                });

                // Expand selection to include full groups
                const finalSelectedIds = new Set<string>();
                const groupsProcessed = new Set<string>();

                initialSelected.forEach(el => {
                    if (el.groupId) {
                        if (!groupsProcessed.has(el.groupId)) {
                            // Add all elements of this group
                            elements.filter(e => e.groupId === el.groupId).forEach(groupEl => {
                                finalSelectedIds.add(groupEl.id);
                            });
                            groupsProcessed.add(el.groupId);
                        }
                    } else {
                        finalSelectedIds.add(el.id);
                    }
                });

                const ids = Array.from(finalSelectedIds);
                if (e.shiftKey) {
                    // Add to current selection
                    const newSet = new Set([...Array.from(selectedIds), ...ids]);
                    setSelectedIds(Array.from(newSet));
                } else {
                    setSelectedIds(ids);
                }
            }
            setDragSelection(null);
        }
    };

    const handleElementSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        let idsToSelect = [id];

        // Check for group
        const element = elements.find(el => el.id === id);
        if (element && element.groupId) {
            const groupIds = elements.filter(el => el.groupId === element.groupId).map(el => el.id);
            idsToSelect = groupIds;
        }

        if (e.shiftKey) {
            // Toggle all in group
            // If any is not selected, select all. If all selected, deselect all.
            const allSelected = idsToSelect.every(sid => selectedIds.has(sid));

            const newSet = new Set(selectedIds);
            if (allSelected) {
                idsToSelect.forEach(sid => newSet.delete(sid));
            } else {
                idsToSelect.forEach(sid => newSet.add(sid));
            }
            setSelectedIds(Array.from(newSet));

        } else {
            // Single select (replace)
            // Optimization: checking if already selected to avoid flicker or unnecessary updates is good, 
            // but for groups we want to ensure we select the WHOLE group if we just clicked one member.

            // If we clicked a member of a group that is already fully selected, do nothing (to allow drag start)
            const allAlreadySelected = idsToSelect.every(sid => selectedIds.has(sid));
            if (!allAlreadySelected || selectedIds.size !== idsToSelect.length) {
                setSelectedIds(idsToSelect);
            }
        }
    };

    // Delete handler removed (handled in Workspace.tsx)

    // Get selected DOM elements for Moveable (exclude locked)
    const selectedTargets = elements
        .filter(el => selectedIds.has(el.id) && !el.locked)
        .map(el => document.getElementById(el.id))
        .filter((el): el is HTMLElement => el !== null);

    // Get unselected DOM elements for Snapping Guidelines
    const elementGuidelines = elements
        .filter(el => !selectedIds.has(el.id))
        .map(el => document.getElementById(el.id))
        .filter((el): el is HTMLElement => el !== null);

    return (
        <>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                />
            )}
            <div
                id="canvas-content"
                className="bg-white shadow-2xl relative overflow-hidden transition-transform duration-200 origin-center"
                style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    transform: `scale(${zoom})`
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onMouseDown={(e) => {
                    handleMouseDown(e);
                    // Close context menu on left click
                    if (e.button !== 2) setContextMenu(null);
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => {
                    e.preventDefault();

                    // UX: Auto-select element on right click if not already selected
                    const target = e.target as HTMLElement;
                    // Find the canvas element wrapper (it has a UUID id, not equal to 'canvas-content')
                    const elementNode = target.closest('[id]');

                    if (elementNode && elementNode.id !== 'canvas-content') {
                        const id = elementNode.id;
                        // Access store directly to check selection
                        const { selectedIds, setSelectedIds } = useStore.getState();

                        // If right-clicked item is NOT in the current selection, select it (exclusive)
                        if (!selectedIds.has(id)) {
                            setSelectedIds([id]);
                        }
                    }

                    setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                ref={targetRef}
            >
                {/* Grid/Background could go here */}

                {elements.map((el) => (
                    <CanvasElementView
                        key={el.id}
                        element={el}
                        isSelected={selectedIds.has(el.id)}
                        onSelect={(id, e) => handleElementSelect(id, e)}
                    />
                ))}

                {dragSelection && (
                    <div
                        className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-50"
                        style={{
                            left: Math.min(dragSelection.startX, dragSelection.currentX),
                            top: Math.min(dragSelection.startY, dragSelection.currentY),
                            width: Math.abs(dragSelection.currentX - dragSelection.startX),
                            height: Math.abs(dragSelection.currentY - dragSelection.startY),
                        }}
                    />
                )}

                {selectedTargets.length > 0 && (
                    <Moveable
                        target={selectedTargets.length === 1 ? selectedTargets[0] : selectedTargets}
                        container={targetRef.current}
                        draggable={true}
                        resizable={true}
                        rotatable={true}
                        snappable={true}

                        // Keep Ratio Logic:
                        // If selected items are Image/Icon/Text, keep ratio by default.
                        // Holding Shift toggles this behavior (Moveable handles Shift toggle if keepRatio is set).
                        keepRatio={
                            elements.filter(el => selectedIds.has(el.id))
                                .every(el => el.type === 'image' || el.type === 'icon' || el.type === 'text')
                        }

                        snapThreshold={5}
                        isDisplaySnapDigit={true}
                        elementGuidelines={elementGuidelines}
                        snapDirections={{ "top": true, "left": true, "bottom": true, "right": true, "center": true, "middle": true }}
                        verticalGuidelines={[0, canvasWidth / 2, canvasWidth]}
                        horizontalGuidelines={[0, canvasHeight / 2, canvasHeight]}
                        bounds={{ "left": 0, "top": 0, "right": 0, "bottom": 0, "position": "css" }}
                        onDragStart={() => {
                            // updateElement(selectedId, {}, true); // History save on start
                        }}
                        onDrag={({ target, transform, left, top }) => {
                            target!.style.transform = transform;
                            // Single element update
                            const id = target!.id;
                            updateElement(id, { x: left, y: top }, false);
                        }}
                        onDragGroup={({ events }) => {
                            events.forEach(({ target, transform, left, top }) => {
                                target.style.transform = transform;
                                updateElement(target.id, { x: left, y: top }, false);
                            });
                        }}
                        onResizeStart={() => {
                            // updateElement(selectedId, {}, true);
                        }}
                        onResize={({ target, width, height, drag }) => {
                            target!.style.width = `${width}px`;
                            target!.style.height = `${height}px`;
                            target!.style.transform = drag.transform;
                            const id = target!.id;
                            updateElement(id, { width, height, x: drag.beforeTranslate[0], y: drag.beforeTranslate[1] }, false);
                        }}
                        onResizeGroup={({ events }) => {
                            events.forEach(({ target, width, height, drag }) => {
                                target.style.width = `${width}px`;
                                target.style.height = `${height}px`;
                                target.style.transform = drag.transform;
                                updateElement(target.id, { width, height, x: drag.beforeTranslate[0], y: drag.beforeTranslate[1] }, false);
                            });
                        }}
                        onRotateStart={() => {
                            // updateElement(selectedId, {}, true);
                        }}
                        onRotate={({ target, transform, rotate }) => {
                            target!.style.transform = transform;
                            const id = target!.id;
                            updateElement(id, { rotation: rotate }, false);
                        }}
                        onRotateGroup={({ events }) => {
                            events.forEach(({ target, transform, rotate }) => {
                                target.style.transform = transform;
                                updateElement(target.id, { rotation: rotate }, false);
                            });
                        }}
                        onDragEnd={({ target }) => {
                            const id = target.id;
                            const el = elements.find(e => e.id === id);
                            if (el) updateElement(id, { x: el.x, y: el.y }, true);
                        }}
                        onDragGroupEnd={({ targets }) => {
                            targets.forEach(target => {
                                const id = target.id;
                                const el = elements.find(e => e.id === id);
                                if (el) updateElement(id, { x: el.x, y: el.y }, true);
                            });
                        }}
                        onResizeEnd={({ target }) => {
                            const id = target.id;
                            const el = elements.find(e => e.id === id);
                            if (el) updateElement(id, { width: el.width, height: el.height, x: el.x, y: el.y }, true);
                        }}
                        onResizeGroupEnd={({ targets }) => {
                            targets.forEach(target => {
                                const id = target.id;
                                const el = elements.find(e => e.id === id);
                                if (el) updateElement(id, { width: el.width, height: el.height, x: el.x, y: el.y }, true);
                            });
                        }}
                        onRotateEnd={({ target }) => {
                            const id = target.id;
                            const el = elements.find(e => e.id === id);
                            if (el) updateElement(id, { rotation: el.rotation }, true);
                        }}
                        onRotateGroupEnd={({ targets }) => {
                            targets.forEach(target => {
                                const id = target.id;
                                const el = elements.find(e => e.id === id);
                                if (el) updateElement(id, { rotation: el.rotation }, true);
                            });
                        }}
                        // Customizing the appearance of handles to look like Canva
                        renderDirections={["nw", "ne", "sw", "se"]}
                        edge={false}
                        zoom={zoom}
                        origin={false}
                        padding={{ "left": 0, "top": 0, "right": 0, "bottom": 0 }}
                    />
                )}
            </div>
        </>
    );
};

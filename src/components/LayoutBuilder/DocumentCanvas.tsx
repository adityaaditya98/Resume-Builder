import { useRef, useEffect } from 'react';
import { useLayoutStore } from '../../store/useLayoutStore';

import { DndContext, closestCorners, type DragEndEvent, useDroppable, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionRenderer } from '../Sections/SectionRenderer';
import type { SectionData } from '../../store/ResumeTypes';
import { HeightRegistryProvider, useHeightRegistry } from './HeightRegistry';
import { usePagination } from '../../hooks/usePagination';
import { Page } from './Page';

const SortableSection = ({ id, data }: { id: string, data: SectionData }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const { setHeight } = useHeightRegistry();
    const elementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!elementRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setHeight(id, entry.contentRect.height + 32); // + margin/padding estimate
            }
        });

        observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, [id, setHeight]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    // Combined ref for both dnd-kit and resize observer
    const setRefs = (node: HTMLDivElement | null) => {
        setNodeRef(node);
        elementRef.current = node;
    };

    return (
        <div ref={setRefs} style={style} {...attributes} {...listeners} className="group relative hover:ring-2 ring-blue-500 ring-offset-2 rounded transition-shadow mb-4">
            <SectionRenderer sectionId={id} data={data} />
        </div>
    );
};

// ... DroppableColumn remains same ...

// ... PageRenderer remains same ...

// In handleDragEnd:
// Check if dropped on empty container (DroppableColumn)


// Droppable Column
const DroppableColumn = ({ id, width, sectionIds }: { id: string, width: number, sectionIds: string[] }) => {
    const { setNodeRef } = useDroppable({ id });
    const sections = useLayoutStore(state => state.resume.sections);

    // Filter visible sections first
    const visibleSectionIds = sectionIds.filter(secId => sections[secId] && sections[secId].isVisible);

    return (
        <div ref={setNodeRef} style={{ width: `${width}%` }} className="flex flex-col min-h-full p-4 border-r border-dashed border-gray-200 last:border-r-0">
            <SortableContext items={visibleSectionIds} strategy={verticalListSortingStrategy}>
                {visibleSectionIds.map(secId => (
                    <SortableSection key={secId} id={secId} data={sections[secId]} />
                ))}
            </SortableContext>
            {visibleSectionIds.length === 0 && <div className="h-32 flex items-center justify-center text-gray-300 border-2 border-dashed rounded">Drop Here</div>}
        </div>
    );
};

const PageRenderer = ({ pageIndex, columns, totalPages }: { pageIndex: number, columns: string[][], totalPages: number }) => {
    const settings = useLayoutStore(state => state.resume.settings);
    const styles = useLayoutStore(state => state.resume.styles);

    return (
        <Page pageIndex={pageIndex} totalPages={totalPages}>
            <div className="flex w-full h-full">
                {/* Left Column */}
                <div
                    style={{
                        width: `${settings.columns === 2 ? settings.columnRatio : 100}%`,
                        backgroundColor: styles.sidebarBackgroundColor || 'transparent'
                    }}
                    className="min-h-full transition-colors duration-300"
                >
                    <DroppableColumn
                        id={`col-0-page-${pageIndex}`}
                        width={100}
                        sectionIds={columns[0]}
                    />
                </div>

                {/* Right Column (if 2 cols) */}
                {columns.length > 1 && (
                    <div
                        style={{
                            width: `${100 - settings.columnRatio}%`,
                            // Right column usually inherits page background
                        }}
                        className="min-h-full"
                    >
                        <DroppableColumn
                            id={`col-1-page-${pageIndex}`}
                            width={100}
                            sectionIds={columns[1] || []}
                        />
                    </div>
                )}
            </div>
        </Page>
    );
};


const DocumentCanvasContent = () => {
    const components = useLayoutStore(state => state.resume.sections); // Use full sections map
    const columns = useLayoutStore(state => state.resume.layout.columns);
    const moveSection = useLayoutStore(state => state.moveSection);

    const { heights } = useHeightRegistry();
    const pages = usePagination(columns, heights, components);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Parse Target Droppable ID: `col-{colIdx}-page-{pageIdx}`
        const overId = over.id as string;

        let targetColIndex = -1;
        // let targetPageIndex = -1; // Unused

        // Check if dropped on empty container (DroppableColumn)
        if (overId.startsWith('col-')) {
            const parts = overId.split('-');
            // col-0-page-1 => parts = ['col', '0', 'page', '1']
            targetColIndex = parseInt(parts[1]);
            // targetPageIndex was unused
        }
        // Or dropped on a Sortable item (Section)
        else {
            // We need to find which page/column this item belongs to.
            // We can scan our `pages` structure calculated by usePagination.
            pages.forEach((page) => {
                page.forEach((col, cIdx) => {
                    if (col.includes(overId)) {
                        targetColIndex = cIdx;
                        // targetPageIndex = pIdx; // Unused
                    }
                });
            });
        }

        // Find Source Global Index (Existing Logic)
        let sourceColIndex = -1;
        let sourceIndex = -1;
        columns.forEach((col, cIdx) => {
            const idx = col.indexOf(active.id as string);
            if (idx !== -1) {
                sourceColIndex = cIdx;
                sourceIndex = idx;
            }
        });

        // Determine Target Global Index
        // If we know the target Page + Column, we can calculate the offset.
        // BUT: Simply knowing the page isn't enough because usePagination is derived.
        // Strategy: 
        // 1. If we drop on an Item: use standard array logic (indexOf). 
        //    (Note: dnd-kit might return the item ID as 'over.id')
        // 2. If we drop on a Container: we need to append to that specific page's slice?
        //    Actually, dropping on 'page 2 container' essentially means appending to the global list 
        //    at the point where page 2 ends? Or page 1 starts?

        // SIMPLIFICATION:
        // For V1, the core goal is Drag & Drop works.
        // Since `columns` is the source of truth, standard reordering logic generally works 
        // IF dnd-kit sees all items in a single context.
        // We are using multiple `SortableContext`s (one per column per page).
        // This is tricky.

        // LET'S TRY: Standard layout store move.
        // We find the target item in the GLOBAL store columns.
        let targetIndex = -1;

        // If dropped on an item
        if (!overId.startsWith('col-')) {
            columns.forEach((col, cIdx) => {
                const idx = col.indexOf(overId);
                if (idx !== -1) {
                    targetColIndex = cIdx;
                    targetIndex = idx;
                }
            });
        } else {
            // Dropped on empty column on a specific page.
            // Target Index = Last Item of Global Column? 
            // Or specifically items belonging to that page?
            // If I drop on Page 0 Col 0, I want it at the end of Page 0 content?
            // Complex. For now, let's assume appending to the COLUMN (end of global list) 
            // if dropped on container, or index of item if dropped on item.

            // Re-read targetColIndex from container ID logic above
            // If targetIndex is still -1, it means we dropped on empty space.
            if (targetColIndex !== -1 && columns[targetColIndex]) {
                targetIndex = columns[targetColIndex].length;
            }
        }

        if (sourceColIndex !== -1 && targetColIndex !== -1 && sourceIndex !== -1 && targetIndex !== -1) {
            moveSection(sourceColIndex, targetColIndex, active.id as string, targetIndex);
        }
    };


    return (
        <div className="flex-1 bg-gray-100/50 overflow-auto p-8 flex flex-col items-center">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                {pages.map((pageColumns, pageIndex) => (
                    <PageRenderer key={pageIndex} pageIndex={pageIndex} columns={pageColumns} totalPages={pages.length} />
                ))}
            </DndContext>
        </div>
    );
}



export const DocumentCanvas = () => {
    return (
        <HeightRegistryProvider>
            <DocumentCanvasContent />
        </HeightRegistryProvider>
    );
};

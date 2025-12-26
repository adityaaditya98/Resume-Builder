import { useLayoutStore } from '../../store/useLayoutStore';
import { useStore } from '../../store/useStore';
import { DndContext, closestCorners, type DragEndEvent, useDroppable, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionRenderer } from '../Sections/SectionRenderer';
import type { SectionData } from '../../store/ResumeTypes';

const SortableSection = ({ id, data }: { id: string, data: SectionData }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group relative hover:ring-2 ring-blue-500 ring-offset-2 rounded transition-shadow mb-4">
            <SectionRenderer sectionId={id} data={data} />
        </div>
    );
};

// Droppable Column
const DroppableColumn = ({ id, width, sectionIds }: { id: string, width: number, sectionIds: string[] }) => {
    const { setNodeRef } = useDroppable({ id });
    const sections = useLayoutStore(state => state.resume.sections);

    return (
        <div ref={setNodeRef} style={{ width: `${width}%` }} className="flex flex-col min-h-full p-4 border-r border-dashed border-gray-200 last:border-r-0">
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                {sectionIds.map(secId => (
                    sections[secId] && <SortableSection key={secId} id={secId} data={sections[secId]} />
                ))}
            </SortableContext>
            {sectionIds.length === 0 && <div className="h-32 flex items-center justify-center text-gray-300 border-2 border-dashed rounded">Drop Here</div>}
        </div>
    );
};

export const DocumentCanvas = () => {
    // Granular selectors to avoid infinite loops
    const columns = useLayoutStore(state => state.resume.layout.columns);
    const settings = useLayoutStore(state => state.resume.settings);
    const moveSection = useLayoutStore(state => state.moveSection);

    const styles = useLayoutStore(state => state.resume.styles);
    const canvasWidth = useStore(state => state.canvasWidth);
    const canvasHeight = useStore(state => state.canvasHeight);

    const style = {
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transformOrigin: '0 0',
        backgroundColor: styles.pageBackgroundColor || '#ffffff'
    };

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

        // Find source column and index
        let sourceColIndex = -1;
        let targetColIndex = -1;
        let targetIndex = -1;

        // Helper to find position
        columns.forEach((col, colIdx) => {
            const idx = col.indexOf(active.id as string);
            if (idx !== -1) {
                sourceColIndex = colIdx;
            }
        });

        // Find target
        // If dropping on a container (empty column)
        if (over.id === 'col-0') {
            targetColIndex = 0;
            targetIndex = columns[0].length;
        } else if (over.id === 'col-1') {
            targetColIndex = 1;
            targetIndex = columns[1].length;
        } else {
            // Dropping on another item
            columns.forEach((col, colIdx) => {
                const idx = col.indexOf(over.id as string);
                if (idx !== -1) {
                    targetColIndex = colIdx;
                    targetIndex = idx;
                }
            });
        }

        if (sourceColIndex !== -1 && targetColIndex !== -1) {
            moveSection(sourceColIndex, targetColIndex, active.id as string, targetIndex);
        }
    };

    return (
        <div className="flex-1 bg-gray-100/50 overflow-auto p-8 flex items-start justify-center">
            <div
                className="shadow-2xl transition-all duration-300 relative flex"
                style={style}
            >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >                    {/* Left Column */}
                    <div
                        style={{
                            width: `${settings.columns === 2 ? settings.columnRatio : 100}%`,
                            backgroundColor: styles.sidebarBackgroundColor || 'transparent'
                        }}
                        className="min-h-full transition-colors duration-300"
                    >
                        <DroppableColumn
                            id="col-0"
                            width={100} // Width handled by wrapper
                            sectionIds={columns[0]}
                        />
                    </div>

                    {/* Right Column (if 2 cols) */}
                    {columns.length > 1 && (
                        <div
                            style={{
                                width: `${100 - settings.columnRatio}%`,
                                // Right column usually inherits page background, but could be customizable later
                            }}
                            className="min-h-full"
                        >
                            <DroppableColumn
                                id="col-1"
                                width={100} // Width handled by wrapper
                                sectionIds={columns[1]}
                            />
                        </div>
                    )}
                </DndContext>
            </div>
        </div>
    );
};

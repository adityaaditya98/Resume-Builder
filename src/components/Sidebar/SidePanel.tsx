import { useStore } from '../../store/useStore';
import { RESUME_TEMPLATES } from '../../data/resumeTemplates';

import { Upload, FileText, Trash2, Columns, Square, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useRef } from 'react';
import { useLayoutStore } from '../../store/useLayoutStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SidebarSectionItem = ({ section, toggleVisibility, deleteSection }: { section: any, toggleVisibility: any, deleteSection: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3 group hover:border-gray-500 transition-colors relative"
        >
            <div {...attributes} {...listeners} className="cursor-grab touch-none">
                <GripVertical size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
                <span className="text-sm text-gray-200 font-medium">{section.title}</span>
                <span className="text-[10px] text-gray-500 block capitalize">{section.variant}</span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => toggleVisibility(section.id)}
                    className={`p-1 rounded ${section.isVisible ? 'text-blue-400 hover:bg-blue-900/30' : 'text-gray-600 hover:text-gray-400'}`}
                    title="Toggle Visibility"
                >
                    {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                    onClick={() => deleteSection(section.id)}
                    className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-900/20"
                    title="Delete Section"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

export const SidePanel = () => {
    const { activeTab, loadDesign, deleteDesign, uploadedImages, addUploadedImage, savedDesigns } = useStore();

    // Layout Store Hooks (Granular Selectors)
    const columns = useLayoutStore(state => state.resume.settings.columns);
    const columnRatio = useLayoutStore(state => state.resume.settings.columnRatio);
    const styles = useLayoutStore(state => state.resume.styles);
    const sections = useLayoutStore(state => state.resume.sections);

    // Actions
    const toggleVisibility = useLayoutStore(state => state.toggleSectionVisibility);
    const updateSettings = useLayoutStore(state => state.updateSettings);
    const moveSection = useLayoutStore(state => state.moveSection);
    const layoutColumns = useLayoutStore(state => state.resume.layout.columns);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Find source and target columns/indices logic
        // We need to find where active ID is and where over ID is.
        let sourceCol = -1;
        let targetCol = -1, targetIdx = -1;

        layoutColumns.forEach((col, cIdx) => {
            const sIdx = col.indexOf(active.id as string);
            if (sIdx !== -1) { sourceCol = cIdx; }

            const tIdx = col.indexOf(over.id as string);
            if (tIdx !== -1) { targetCol = cIdx; targetIdx = tIdx; }
        });

        if (sourceCol !== -1 && targetCol !== -1) {
            moveSection(sourceCol, targetCol, active.id as string, targetIdx);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1024;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/webp', 0.8);
                    addUploadedImage(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragStart = (e: React.DragEvent, type: 'text' | 'shape' | 'image' | 'icon', content: string) => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('content', content);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'layout':
                // Derive ordered sections from layout columns
                // Flatten columns to get order
                const orderedSectionIds = columns === 1
                    ? useLayoutStore.getState().resume.layout.columns[0]
                    : [...useLayoutStore.getState().resume.layout.columns[0], ...useLayoutStore.getState().resume.layout.columns[1] || []];

                // Filter out any IDs that might not exist in sections (stale data safety)
                const displaySections = orderedSectionIds
                    .map(id => sections[id])
                    .filter(Boolean);

                // Add any sections that exist in store but not in layout (orphaned? shouldn't happen but key for 'Add' logic if it adds to store first?)
                // Actually addSection adds to column 0. So we should be good.

                return (
                    <div className="flex flex-col gap-6">
                        {/* Layout Controls */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Page Layout</h3>
                            <div className="flex flex-col gap-3">
                                {/* Columns Toggle */}
                                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                    <span className="text-sm">Columns</span>
                                    <div className="flex bg-gray-900 rounded p-1">
                                        <button
                                            onClick={() => updateSettings({ columns: 1 })}
                                            className={`p-1 rounded ${columns === 1 ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                        >
                                            <Square size={16} />
                                        </button>
                                        <button
                                            onClick={() => updateSettings({ columns: 2 })}
                                            className={`p-1 rounded ${columns === 2 ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                        >
                                            <Columns size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Ratio Slider (only if 2 cols) */}
                                {columns === 2 && (
                                    <div className="p-2 bg-gray-800 rounded">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Left Width</span>
                                            <span>{columnRatio}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="20"
                                            max="80"
                                            value={columnRatio}
                                            onChange={(e) => updateSettings({ columnRatio: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Global Styles */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Global Styles</h3>
                            <div className="flex flex-col gap-3">
                                {/* Font Family */}
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Typography</label>
                                    <select
                                        value={styles.fontFamily}
                                        onChange={(e) => updateSettings({ fontFamily: e.target.value } as any)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Inter">Modern (Inter)</option>
                                        <option value="Merriweather">Serif (Merriweather)</option>
                                        <option value="Roboto">Clean (Roboto)</option>
                                    </select>
                                </div>

                                {/* Accent Color */}
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Accent Color</label>
                                    <div className="flex gap-2">
                                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#1f2937'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => useLayoutStore.getState().updateStyles({ accentColor: color })}
                                                className={`w-6 h-6 rounded-full border-2 ${styles.accentColor === color ? 'border-white' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sections</h3>
                                <div className="relative group">
                                    <button className="text-xs text-blue-400 font-medium hover:text-blue-300 flex items-center gap-1">
                                        <span className="text-lg leading-none">+</span> Add
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded shadow-xl overflow-hidden invisible group-hover:visible z-50">
                                        {['Experience', 'Education', 'Projects', 'Skills', 'Languages', 'Custom'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => useLayoutStore.getState().addSection(type.toLowerCase() as any, type)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={orderedSectionIds} strategy={verticalListSortingStrategy}>
                                    <div className="flex flex-col gap-2">
                                        {displaySections.map(section => (
                                            <SidebarSectionItem
                                                key={section.id}
                                                section={section}
                                                toggleVisibility={toggleVisibility}
                                                deleteSection={useLayoutStore.getState().deleteSection}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                );
            case 'templates':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {RESUME_TEMPLATES.map((template) => (
                            <div
                                key={template.id}
                                className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 cursor-pointer aspect-[3/4]"
                                onClick={() => {
                                    useLayoutStore.getState().updateSettings(template.settings);
                                    useLayoutStore.getState().updateStyles(template.styles);
                                }}
                            >
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <span className="text-white text-xs font-medium truncate w-full">{template.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'uploads':
                return (
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Upload size={20} />
                            Upload Image
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            {uploadedImages.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-move border border-gray-700 hover:border-gray-500"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'image', img)}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        {uploadedImages.length === 0 && (
                            <div className="text-center text-gray-500 py-8 text-sm">
                                <p>No images uploaded yet.</p>
                            </div>
                        )}
                    </div>
                );
            case 'projects':
                return (
                    <div className="flex flex-col gap-4">
                        {savedDesigns.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No saved designs yet.</p>
                                <p className="text-xs mt-1">Save your work to see it here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {savedDesigns.map((design) => (
                                    <div
                                        key={design.id}
                                        className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all cursor-pointer aspect-[3/4]"
                                        onClick={() => loadDesign(design.id)}
                                    >
                                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                            {design.thumbnail ? (
                                                <img src={design.thumbnail} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-2">
                                                    <div className="w-12 h-16 bg-white mx-auto mb-2 shadow-sm rounded-sm"></div>
                                                    <span className="text-[10px] text-gray-500">{new Date(design.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
                                            <p className="text-white text-xs font-medium truncate">{design.name}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteDesign(design.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete Design"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="p-4 text-center text-gray-500">
                        <p>No content for {activeTab} yet.</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-80 bg-[#1e1e1e] h-full flex flex-col text-white shadow-xl z-40 transition-all duration-300 border-r border-gray-800">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {renderContent()}
            </div>
        </div>
    );
};

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface CanvasElement {
    id: string;
    type: 'text' | 'image' | 'shape' | 'icon';
    content: string; // text content or image url or shape type
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    fill: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    borderRadius?: number;
    lineHeight?: number;
    letterSpacing?: number;
    strokeWidth?: number;
    strokeColor?: string;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    filter?: string;
    groupId?: string;
    locked?: boolean;
    animation?: string;
    flipX?: boolean;
    flipY?: boolean;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    pageIndex?: number; // Hybrid Canvas: which page this element belongs to
}

interface EditorState {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    designTitle: string;
    setDesignTitle: (title: string) => void;
    canvasWidth: number;
    canvasHeight: number;
    setCanvasSize: (width: number, height: number) => void;
    elements: CanvasElement[];
    addElement: (element: CanvasElement) => void;
    updateElement: (id: string, updates: Partial<CanvasElement>, saveHistory?: boolean) => void;
    updateElements: (ids: string[], updates: Partial<CanvasElement>, saveHistory?: boolean) => void;
    removeElement: (id: string) => void;
    removeElements: (ids: string[]) => void;

    selectedIds: Set<string>;
    setSelectedIds: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    clearSelection: () => void;

    zoom: number;
    setZoom: (zoom: number) => void;
    setElements: (elements: CanvasElement[]) => void;

    // History
    past: CanvasElement[][];
    future: CanvasElement[][];
    undo: () => void;
    redo: () => void;
    // Persistence
    savedDesigns: Design[];
    saveDesign: (name: string) => void;
    loadDesign: (id: string) => void;
    deleteDesign: (id: string) => void;

    saveStatus: 'saved' | 'saving' | 'unsaved';
    setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;

    // Uploads
    uploadedImages: string[];
    addUploadedImage: (image: string) => void;

    // Tool State
    tool: 'select' | 'hand';
    setTool: (tool: 'select' | 'hand') => void;

    // Clipboard & Layering
    clipboard: CanvasElement[] | null;
    copy: () => void;
    paste: () => void;
    duplicate: () => void;
    group: () => void;
    ungroup: () => void;
    bringToFront: () => void;
    sendToBack: () => void;
    bringForward: () => void;
    sendBackward: () => void;
}

export interface Design {
    id: string;
    name: string;
    elements: CanvasElement[];
    thumbnail?: string; // Optional for now
    updatedAt: number;
}

const STORAGE_KEY = 'canva-clone-designs';
const UPLOADS_KEY = 'canva-clone-uploads';

export const useStore = create<EditorState>((set, get) => ({
    activeTab: 'templates',
    setActiveTab: (tab) => set({ activeTab: tab }),
    elements: [],
    designTitle: 'Untitled Design',
    setDesignTitle: (title) => set({ designTitle: title }),

    canvasWidth: 794,
    canvasHeight: 1123,
    setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

    savedDesigns: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),

    // Auto-save state
    saveStatus: 'saved',
    setSaveStatus: (status) => set({ saveStatus: status }),
    uploadedImages: JSON.parse(localStorage.getItem(UPLOADS_KEY) || '[]'),

    // History State
    past: [],
    future: [],

    undo: () => set((state) => {
        if (state.past.length === 0) return state;

        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);

        return {
            elements: previous,
            past: newPast,
            future: [state.elements, ...state.future],
            selectedIds: new Set()
        };
    }),

    redo: () => set((state) => {
        if (state.future.length === 0) return state;

        const next = state.future[0];
        const newFuture = state.future.slice(1);

        return {
            elements: next,
            past: [...state.past, state.elements],
            future: newFuture,
            selectedIds: new Set()
        };
    }),

    addElement: (element) => set((state) => ({
        past: [...state.past, state.elements].slice(-20),
        elements: [...state.elements, element],
        future: []
    })),

    updateElement: (id, updates, saveHistory = true) => set((state) => ({
        past: saveHistory ? [...state.past, state.elements].slice(-20) : state.past,
        elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
        future: saveHistory ? [] : state.future
    })),

    updateElements: (ids, updates, saveHistory = true) => set((state) => ({
        past: saveHistory ? [...state.past, state.elements].slice(-20) : state.past,
        elements: state.elements.map((el) => (ids.includes(el.id) ? { ...el, ...updates } : el)),
        future: saveHistory ? [] : state.future
    })),

    removeElement: (id) => set((state) => {
        const element = state.elements.find(el => el.id === id);
        if (element?.locked) return state;

        return {
            past: [...state.past, state.elements].slice(-20),
            elements: state.elements.filter((el) => el.id !== id),
            selectedIds: new Set(Array.from(state.selectedIds).filter(sid => sid !== id)),
            future: []
        };
    }),

    removeElements: (ids) => set((state) => {
        // Only remove unlocked elements
        const unlockedIds = ids.filter(id => {
            const el = state.elements.find(e => e.id === id);
            return el && !el.locked;
        });

        if (unlockedIds.length === 0) return state;

        return {
            past: [...state.past, state.elements].slice(-20),
            elements: state.elements.filter((el) => !unlockedIds.includes(el.id)),
            selectedIds: new Set(Array.from(state.selectedIds).filter(sid => !unlockedIds.includes(sid))),
            future: []
        };
    }),

    selectedIds: new Set<string>(),
    setSelectedIds: (ids) => set({ selectedIds: new Set(ids) }),
    toggleSelection: (id) => set((state) => {
        const newIds = new Set(state.selectedIds);
        if (newIds.has(id)) {
            newIds.delete(id);
        } else {
            newIds.add(id);
        }
        return { selectedIds: newIds };
    }),
    clearSelection: () => set({ selectedIds: new Set() }),

    zoom: 1,
    setZoom: (zoom) => set({ zoom }),

    setElements: (elements) => set((state) => ({
        past: [...state.past, state.elements],
        elements,
        future: []
    })),

    // Persistence Actions
    saveDesign: (name) => {
        const { elements, savedDesigns } = get();
        const existingDesignIndex = savedDesigns.findIndex(d => d.name === name);

        let newDesigns;
        if (existingDesignIndex >= 0) {
            // Update existing
            newDesigns = [...savedDesigns];
            newDesigns[existingDesignIndex] = {
                ...newDesigns[existingDesignIndex],
                elements,
                updatedAt: Date.now()
            };
        } else {
            // Create new
            const newDesign: Design = {
                id: uuidv4(),
                name: name || 'Untitled Design',
                elements,
                updatedAt: Date.now()
            };
            newDesigns = [...savedDesigns, newDesign];
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDesigns));
        set({ savedDesigns: newDesigns });
    },

    loadDesign: (id) => {
        const { savedDesigns } = get();
        const design = savedDesigns.find(d => d.id === id);
        if (design) {
            set((state) => ({
                elements: design.elements,
                past: [...state.past, state.elements],
                future: [],
                selectedIds: new Set(),
                designTitle: design.name
            }));
        }
    },

    deleteDesign: (id) => {
        const { savedDesigns } = get();
        const newDesigns = savedDesigns.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDesigns));
        set({ savedDesigns: newDesigns });
    },

    // Uploads Actions
    addUploadedImage: (image) => {
        const { uploadedImages } = get();
        const newUploads = [image, ...uploadedImages];
        localStorage.setItem(UPLOADS_KEY, JSON.stringify(newUploads));
        set({ uploadedImages: newUploads });
    },

    // Tool State
    tool: 'select',
    setTool: (tool) => set({ tool }),

    // Clipboard & Layering
    clipboard: [],
    copy: () => {
        const { elements, selectedIds } = get();
        const selected = elements.filter(el => selectedIds.has(el.id));
        if (selected.length > 0) {
            set({ clipboard: selected });
        }
    },
    paste: () => {
        const { clipboard, addElement } = get();
        if (clipboard && clipboard.length > 0) {
            clipboard.forEach(item => {
                const newElement = {
                    ...item,
                    id: uuidv4(),
                    x: item.x + 20,
                    y: item.y + 20
                };
                addElement(newElement);
            });
        }
    },
    duplicate: () => {
        const { elements, selectedIds, addElement, setSelectedIds } = get();
        const selected = elements.filter(el => selectedIds.has(el.id));
        const newIds: string[] = [];

        selected.forEach(item => {
            const newId = uuidv4();
            const newElement = {
                ...item,
                id: newId,
                x: item.x + 20,
                y: item.y + 20
            };
            addElement(newElement);
            newIds.push(newId);
        });

        // Select the new copies
        setSelectedIds(newIds);
    },

    group: () => {
        const { elements, selectedIds, updateElements } = get();
        if (selectedIds.size < 2) return;

        // Check if any selected element is locked
        const hasLocked = Array.from(selectedIds).some(id => {
            const el = elements.find(e => e.id === id);
            return el && el.locked;
        });

        if (hasLocked) return;

        const newGroupId = uuidv4();
        // Update all selected elements with the new groupId
        updateElements(Array.from(selectedIds), { groupId: newGroupId });
    },

    ungroup: () => {
        const { elements, selectedIds, updateElements } = get();
        if (selectedIds.size === 0) return;

        // Filter elements that are in the selection AND have a groupId
        const idsToUngroup = elements
            .filter(el => selectedIds.has(el.id) && el.groupId)
            .map(el => el.id);

        if (idsToUngroup.length > 0) {
            // we can't pass undefined to partial update if the type doesn't allow it explicitly yet?
            // Actually Partial<CanvasElement> allows undefined if the interface has logic for it, but usually we prefer null or deleting key.
            // Let's check interface update below.
            updateElements(idsToUngroup, { groupId: undefined });
        }
    },

    bringToFront: () => {
        const { elements, selectedIds, setElements } = get();
        if (selectedIds.size === 0) return;

        // Sort elements to keep relative order of selected items? 
        // Simplest strategy: Move all selected to end, keeping their relative order.
        const newElements = [...elements];
        const selected = newElements.filter(el => selectedIds.has(el.id) && !el.locked);
        const unselected = newElements.filter(el => !selectedIds.has(el.id) || (selectedIds.has(el.id) && el.locked));

        setElements([...unselected, ...selected]);
    },
    sendToBack: () => {
        const { elements, selectedIds, setElements } = get();
        if (selectedIds.size === 0) return;

        const newElements = [...elements];
        const selected = newElements.filter(el => selectedIds.has(el.id) && !el.locked);
        // Include unselected elements OR selected-but-locked elements
        const unselected = newElements.filter(el => !selectedIds.has(el.id) || (selectedIds.has(el.id) && el.locked));

        setElements([...selected, ...unselected]);
    },
    bringForward: () => {
        const { elements, selectedIds, setElements } = get();
        if (selectedIds.size === 0) return;

        const newElements = [...elements];
        // Complex logic for multiple items. Simple approach: Move the whole group one step forward relative to the top-most unselected item they overlap?
        // Or just iterate: for each selected item, swap with next if not selected.
        // Iterating efficiently is tricky. Let's do a simple pass:
        // Find the rightmost (highest index) selected item that can move. 
        // Actually, Canva just moves the selected layer up one slot in the stack. 

        // Let's iterate from top (end) to bottom (start). 
        for (let i = newElements.length - 2; i >= 0; i--) {
            // Check locked status
            if (newElements[i].locked) continue;

            if (selectedIds.has(newElements[i].id) && !selectedIds.has(newElements[i + 1].id)) {
                // Swap
                const temp = newElements[i + 1];
                newElements[i + 1] = newElements[i];
                newElements[i] = temp;
            }
        }
        setElements(newElements);
    },
    sendBackward: () => {
        const { elements, selectedIds, setElements } = get();
        if (selectedIds.size === 0) return;

        const newElements = [...elements];
        // Iterate from bottom (start) to up.
        for (let i = 1; i < newElements.length; i++) {
            // Check locked status
            if (newElements[i].locked) continue;

            if (selectedIds.has(newElements[i].id) && !selectedIds.has(newElements[i - 1].id)) {
                // Swap
                const temp = newElements[i - 1];
                newElements[i - 1] = newElements[i];
                newElements[i] = temp;
            }
        }
        setElements(newElements);
    }
}));

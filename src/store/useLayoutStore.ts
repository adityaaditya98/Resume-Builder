import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeConfig, SectionType, SectionData } from './ResumeTypes';
import { v4 as uuidv4 } from 'uuid';

// MOCK INITIAL DATA (Simulating Backend Response)
const INITIAL_RESUME: ResumeConfig = {
    id: 'demo-1',
    name: 'Modern Developer',
    settings: {
        pageSize: 'A4',
        margins: 20,
        columns: 2,
        columnRatio: 35 // 35% Left Column
    },
    styles: {
        fontFamily: 'Inter',
        accentColor: '#3b82f6',
        baseFontSize: 14,
        lineHeight: 1.5
    },
    layout: {
        columns: [
            ['header', 'skills', 'summary', 'languages'], // Left Column IDs
            ['experience', 'education', 'projects']       // Right Column IDs
        ]
    },
    sections: {
        'header': {
            id: 'header', type: 'header', title: 'Profile', isVisible: true, variant: 'compact',
            items: [{ id: 'h1', isVisible: true, data: { name: 'Alex Brown', role: 'Senior Frontend Engineer' } }]
        },
        'summary': {
            id: 'summary', type: 'summary', title: 'About Me', isVisible: true, variant: 'expanded',
            items: [{ id: 's1', isVisible: true, data: { text: 'Passionate developer with 5 years of experience in React and Node.js.' } }]
        },
        'skills': {
            id: 'skills', type: 'skills', title: 'Skills', isVisible: true, variant: 'tags',
            items: [
                { id: 'sk1', isVisible: true, data: { name: 'React' } },
                { id: 'sk2', isVisible: true, data: { name: 'TypeScript' } },
                { id: 'sk3', isVisible: true, data: { name: 'Node.js' } }
            ]
        },
        'languages': { id: 'languages', type: 'custom', title: 'Languages', isVisible: true, variant: 'list', items: [] },
        'experience': {
            id: 'experience', type: 'experience', title: 'Work Experience', isVisible: true, variant: 'expanded',
            items: [
                { id: 'exp1', isVisible: true, data: { role: 'Senior Dev', company: 'TechCorp', date: '2020-Present' } }
            ]
        },
        'education': {
            id: 'education', type: 'education', title: 'Education', isVisible: true, variant: 'compact',
            items: []
        },
        'projects': {
            id: 'projects', type: 'projects', title: 'Projects', isVisible: true, variant: 'grid',
            items: []
        },
    }
};

// History Entry with Metadata
interface HistoryEntry {
    resume: ResumeConfig;
    action: string;
    timestamp: number;
}

type LayoutJson = ResumeConfig['layout'];
type ResumeSettings = ResumeConfig['settings'];

interface LayoutState {
    resume: ResumeConfig;
    previousLayout: LayoutJson | null;

    // Actions
    updateSettings: (newSettings: Partial<ResumeSettings>) => void;
    setResume: (resume: ResumeConfig) => void;
    updateStyles: (styles: Partial<ResumeConfig['styles']>) => void;
    applyTemplateLayout: (structure: 'single' | 'sidebar' | 'columns') => void;

    // Layout Actions
    moveSection: (sourceColIndex: number, targetColIndex: number, sectionId: string, index: number) => void;
    toggleSectionVisibility: (sectionId: string) => void;
    addSection: (type: SectionType, title: string) => void;
    deleteSection: (sectionId: string) => void;

    // Content Actions
    updateSectionData: (sectionId: string, itemId: string, data: any) => void;
    addSectionItem: (sectionId: string, data: any) => void;
    removeSectionItem: (sectionId: string, itemId: string) => void;
    updateSectionVariants: (variants: Record<string, string>) => void;
    // History
    past: HistoryEntry[];
    future: HistoryEntry[];
    undo: () => void;
    redo: () => void;
    // Explicit Version Restore
    restoreVersion: (entry: HistoryEntry) => void;
}

const MAX_HISTORY = 50;

// Helper to validate and clean resume data
const validateAndClean = (resume: ResumeConfig): ResumeConfig => {
    if (!resume || !resume.sections || !resume.layout) return resume;

    const sections = resume.sections;
    const cleanLayout = { ...resume.layout };

    // 1. Remove zombie IDs from columns
    cleanLayout.columns = cleanLayout.columns.map(col =>
        col.filter(id => sections[id] !== undefined)
    );

    // 2. Ensure all visible sections are in a column (?)
    // Actually, sections can be hidden/removed from layout but exist in data (unlikely in this model, but possible).
    // For now, we trust the columns -> sections link.

    return { ...resume, layout: cleanLayout };
};

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => {
            const createHistoryEntry = (resume: ResumeConfig, action: string): HistoryEntry => ({
                resume: JSON.parse(JSON.stringify(resume)), // Deep copy for snapshot
                action,
                timestamp: Date.now()
            });

            return {
                resume: INITIAL_RESUME,
                previousLayout: null,
                past: [],
                future: [],

                undo: () => set((state) => {
                    const { past, future, resume } = state;
                    if (past.length === 0) return {};

                    const previousEntry = past[past.length - 1];
                    const newPast = past.slice(0, past.length - 1);
                    const currentEntry = createHistoryEntry(resume, 'Undo');

                    return {
                        resume: previousEntry.resume,
                        past: newPast,
                        future: [currentEntry, ...future]
                    };
                }),

                redo: () => set((state) => {
                    const { past, future, resume } = state;
                    if (future.length === 0) return {};

                    const nextEntry = future[0];
                    const newFuture = future.slice(1);
                    const currentEntry = createHistoryEntry(resume, 'Redo');

                    return {
                        resume: nextEntry.resume,
                        past: [...past, currentEntry],
                        future: newFuture
                    };
                }),

                restoreVersion: (entry) => set((state) => {
                    // When restoring a specific version, we treat it like a new "Restore" action
                    // so we can undo it.
                    const currentEntry = createHistoryEntry(state.resume, `Restored to ${new Date(entry.timestamp).toLocaleTimeString()}`);
                    return {
                        resume: entry.resume,
                        past: [...state.past, currentEntry],
                        future: []
                    };
                }),

                updateSettings: (newSettings) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, 'Update Settings')].slice(-MAX_HISTORY);

                    const currentColumns = state.resume.settings.columns;
                    const nextColumns = newSettings.columns;

                    let newLayout = { ...state.resume.layout };
                    let prevLayout = state.previousLayout;

                    if (currentColumns === 2 && nextColumns === 1) {
                        prevLayout = JSON.parse(JSON.stringify(newLayout));
                        const col0 = [...newLayout.columns[0]];
                        const col1 = [...newLayout.columns[1]];
                        newLayout.columns = [[...col0, ...col1]];
                    }
                    else if (currentColumns === 1 && nextColumns === 2) {
                        if (prevLayout && prevLayout.columns.length === 2) {
                            newLayout = prevLayout;
                            const currentIds = new Set(state.resume.layout.columns[0]);
                            const restoredIds = new Set([...newLayout.columns[0], ...newLayout.columns[1]]);
                            const brandNewIds = [...currentIds].filter(id => !restoredIds.has(id));
                            newLayout.columns[0] = newLayout.columns[0].filter(id => currentIds.has(id));
                            newLayout.columns[1] = newLayout.columns[1].filter(id => currentIds.has(id));
                            if (brandNewIds.length > 0) {
                                newLayout.columns[1] = [...newLayout.columns[1], ...brandNewIds];
                            }
                        } else {
                            const allSections = state.resume.sections;
                            const currentIds = newLayout.columns[0];
                            const col0Ids: string[] = [];
                            const col1Ids: string[] = [];
                            currentIds.forEach(id => {
                                const section = allSections[id];
                                if (!section) return;
                                if (['header', 'skills', 'languages', 'custom'].includes(section.type)) {
                                    col0Ids.push(id);
                                } else {
                                    col1Ids.push(id);
                                }
                            });
                            newLayout.columns = [col0Ids, col1Ids];
                        }
                    }

                    if (nextColumns === 1 && newLayout.columns.length !== 1) {
                        newLayout.columns = [newLayout.columns.flat()];
                    }

                    return {
                        past,
                        future: [],
                        previousLayout: prevLayout,
                        resume: {
                            ...state.resume,
                            settings: { ...state.resume.settings, ...newSettings },
                            layout: newLayout
                        }
                    };
                }),

                setResume: (resume) => set((state) => ({
                    resume: validateAndClean(resume),
                    past: [...state.past, createHistoryEntry(state.resume, 'Load Resume')].slice(-MAX_HISTORY),
                    future: []
                })),

                updateStyles: (newStyles) => set((state) => ({
                    past: [...state.past, createHistoryEntry(state.resume, 'Update Styles')].slice(-MAX_HISTORY),
                    future: [],
                    resume: { ...state.resume, styles: { ...state.resume.styles, ...newStyles } }
                })),

                applyTemplateLayout: (structure) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, 'Change Template Layout')].slice(-MAX_HISTORY);
                    let newColumns: string[][] = [];
                    const sections = state.resume.sections;

                    if (structure === 'single') {
                        const flattened = state.resume.layout.columns.flat();
                        const uniqueIds = Array.from(new Set(flattened)).filter(id => sections[id]);
                        newColumns = [uniqueIds];
                    } else if (structure === 'sidebar') {
                        const col0: string[] = [];
                        const col1: string[] = [];
                        const flattened = state.resume.layout.columns.flat();
                        const uniqueIds = Array.from(new Set(flattened)).filter(id => sections[id]);
                        uniqueIds.forEach(id => {
                            const section = sections[id];
                            if (['header', 'skills', 'languages', 'custom'].includes(section.type)) {
                                col0.push(id);
                            } else {
                                col1.push(id);
                            }
                        });
                        newColumns = [col0, col1];
                    } else {
                        newColumns = [state.resume.layout.columns.flat()];
                    }

                    return {
                        past,
                        future: [],
                        resume: {
                            ...state.resume,
                            layout: { ...state.resume.layout, columns: newColumns },
                            settings: {
                                ...state.resume.settings,
                                columns: structure === 'sidebar' ? 2 : 1
                            }
                        }
                    };
                }),

                moveSection: (sourceColIndex, targetColIndex, sectionId, targetIndex) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, 'Move Section')].slice(-MAX_HISTORY);
                    const newColumns = [...state.resume.layout.columns];
                    const sourceCol = newColumns[sourceColIndex].filter(id => id !== sectionId);
                    newColumns[sourceColIndex] = sourceCol;
                    const targetCol = [...newColumns[targetColIndex]];
                    targetCol.splice(targetIndex, 0, sectionId);
                    newColumns[targetColIndex] = targetCol;
                    return {
                        past,
                        future: [],
                        resume: { ...state.resume, layout: { ...state.resume.layout, columns: newColumns } }
                    };
                }),

                toggleSectionVisibility: (sectionId) => set((state) => ({
                    past: [...state.past, createHistoryEntry(state.resume, 'Toggle Visibility')].slice(-MAX_HISTORY),
                    future: [],
                    resume: {
                        ...state.resume,
                        sections: {
                            ...state.resume.sections,
                            [sectionId]: {
                                ...state.resume.sections[sectionId],
                                isVisible: !state.resume.sections[sectionId].isVisible
                            }
                        }
                    }
                })),

                addSection: (type: SectionType, title: string) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, `Add ${title}`)].slice(-MAX_HISTORY);
                    const id = uuidv4();
                    const existingCount = Object.values(state.resume.sections).filter(s => s.type === type).length;
                    const finalTitle = existingCount > 0 ? `${title} ${existingCount + 1}` : title;
                    const newSection: SectionData = {
                        id, type, title: finalTitle, isVisible: true, variant: type === 'skills' ? 'tags' : 'expanded', items: []
                    };
                    const newColumns = [...state.resume.layout.columns];
                    newColumns[0] = [...newColumns[0], id];
                    return {
                        past,
                        future: [],
                        resume: {
                            ...state.resume,
                            layout: { ...state.resume.layout, columns: newColumns },
                            sections: { ...state.resume.sections, [id]: newSection }
                        }
                    };
                }),

                deleteSection: (sectionId: string) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, 'Delete Section')].slice(-MAX_HISTORY);
                    const newSections = { ...state.resume.sections };
                    delete newSections[sectionId];
                    const newColumns = state.resume.layout.columns.map(col => col.filter(id => id !== sectionId));
                    return {
                        past,
                        future: [],
                        resume: {
                            ...state.resume,
                            layout: { ...state.resume.layout, columns: newColumns },
                            sections: newSections
                        }
                    };
                }),

                updateSectionData: (sectionId, itemId, data) => set((state) => ({
                    past: [...state.past, createHistoryEntry(state.resume, 'Edit Content')].slice(-MAX_HISTORY),
                    future: [],
                    resume: {
                        ...state.resume,
                        sections: {
                            ...state.resume.sections,
                            [sectionId]: {
                                ...state.resume.sections[sectionId],
                                items: state.resume.sections[sectionId].items.map(item =>
                                    item.id === itemId ? { ...item, data: { ...item.data, ...data } } : item
                                )
                            }
                        }
                    }
                })),

                addSectionItem: (sectionId, data) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, 'Add Item')].slice(-MAX_HISTORY);
                    const section = state.resume.sections[sectionId];
                    let defaultData = data;
                    if (section) {
                        if (section.type === 'skills' || section.type === 'languages' || section.type === 'custom') {
                            defaultData = { name: 'New Item', ...data };
                        } else if (section.type === 'experience' || section.type === 'projects') {
                            defaultData = { role: 'Title/Role', company: 'Company/Project', date: 'Date', description: 'Description...', ...data };
                        } else if (section.type === 'education') {
                            defaultData = { school: 'School Name', degree: 'Degree', year: 'Year', ...data };
                        }
                    }
                    return {
                        past,
                        future: [],
                        resume: {
                            ...state.resume,
                            sections: {
                                ...state.resume.sections,
                                [sectionId]: {
                                    ...state.resume.sections[sectionId],
                                    items: [...state.resume.sections[sectionId].items, { id: uuidv4(), isVisible: true, data: defaultData }]
                                }
                            }
                        }
                    };
                }),

                removeSectionItem: (sectionId, itemId) => set((state) => ({
                    past: [...state.past, createHistoryEntry(state.resume, 'Remove Item')].slice(-MAX_HISTORY),
                    future: [],
                    resume: {
                        ...state.resume,
                        sections: {
                            ...state.resume.sections,
                            [sectionId]: {
                                ...state.resume.sections[sectionId],
                                items: state.resume.sections[sectionId].items.filter(item => item.id !== itemId)
                            }
                        }
                    }
                })),

                updateSectionVariants: (variants) => set((state) => {
                    const past = [...state.past, createHistoryEntry(state.resume, 'Layout Variant')].slice(-MAX_HISTORY);
                    const newSections = { ...state.resume.sections };
                    Object.entries(variants).forEach(([id, variant]) => {
                        if (newSections[id]) {
                            newSections[id] = { ...newSections[id], variant: variant as any };
                        }
                    });
                    return { past, future: [], resume: { ...state.resume, sections: newSections } };
                })
            };
        },
        {
            name: 'resume-storage',
            partialize: (state) => ({
                resume: state.resume,
                past: state.past // Persist Undo History!
            }),
        }
    )
);

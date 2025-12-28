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

interface LayoutState {
    resume: ResumeConfig;
    previousLayout: ResumeConfig['layout'] | null; // Cache for restoring 2-col layout


    // Actions
    updateSettings: (settings: Partial<ResumeConfig['settings']>) => void;
    setResume: (resume: ResumeConfig) => void;
    updateStyles: (styles: Partial<ResumeConfig['styles']>) => void;

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
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            resume: INITIAL_RESUME,
            previousLayout: null,

            updateSettings: (newSettings) => set((state) => {
                const currentColumns = state.resume.settings.columns;
                const nextColumns = newSettings.columns;

                let newLayout = { ...state.resume.layout };
                let prevLayout = state.previousLayout;

                // Case 1: Switching from 2 to 1 (Collapse)
                if (currentColumns === 2 && nextColumns === 1) {
                    // Save current layout before collapsing
                    prevLayout = JSON.parse(JSON.stringify(newLayout));

                    const col0 = [...newLayout.columns[0]];
                    const col1 = [...newLayout.columns[1]];
                    // Merge into single column
                    newLayout.columns = [[...col0, ...col1]];
                }
                // Case 2: Switching from 1 to 2 (Restore)
                else if (currentColumns === 1 && nextColumns === 2) {
                    if (prevLayout && prevLayout.columns.length === 2) {
                        // Restore from cache if available
                        newLayout = prevLayout;

                        // Validate restoration: Ensure no IDs are lost or duplicated if items were added/removed in 1-col mode
                        const currentIds = new Set(state.resume.layout.columns[0]);
                        const restoredIds = new Set([...newLayout.columns[0], ...newLayout.columns[1]]);

                        // Find new items added while in 1-col mode
                        const brandNewIds = [...currentIds].filter(id => !restoredIds.has(id));

                        // Find items deleted while in 1-col mode
                        newLayout.columns[0] = newLayout.columns[0].filter(id => currentIds.has(id));
                        newLayout.columns[1] = newLayout.columns[1].filter(id => currentIds.has(id));

                        // Append new items to main column (Col 1)
                        if (brandNewIds.length > 0) {
                            newLayout.columns[1] = [...newLayout.columns[1], ...brandNewIds];
                        }

                    } else {
                        // Fallback Heuristic if no cache (Legacy behavior)
                        const allSections = state.resume.sections;
                        const currentIds = newLayout.columns[0];

                        const col0Ids: string[] = []; // Sidebar
                        const col1Ids: string[] = []; // Main

                        currentIds.forEach(id => {
                            const section = allSections[id];
                            if (!section) return; // Cleanup zombie IDs

                            // Heuristic: Keep typically small/sidebar items in Col 0, move heavy content to Col 1
                            if (['header', 'skills', 'languages', 'custom'].includes(section.type)) {
                                col0Ids.push(id);
                            } else {
                                col1Ids.push(id);
                            }
                        });

                        newLayout.columns = [col0Ids, col1Ids];
                    }
                }

                // Safety Check: Ensure columns array structure matches settings
                if (nextColumns === 1 && newLayout.columns.length !== 1) {
                    newLayout.columns = [newLayout.columns.flat()];
                }

                return {
                    previousLayout: prevLayout,
                    resume: {
                        ...state.resume,
                        settings: { ...state.resume.settings, ...newSettings },
                        layout: newLayout
                    }
                };
            }),

            updateStyles: (newStyles) => set((state) => ({
                resume: { ...state.resume, styles: { ...state.resume.styles, ...newStyles } }
            })),

            moveSection: (sourceColIndex, targetColIndex, sectionId, targetIndex) => set((state) => {
                const newColumns = [...state.resume.layout.columns];

                // Remove from source
                const sourceCol = newColumns[sourceColIndex].filter(id => id !== sectionId);
                newColumns[sourceColIndex] = sourceCol;

                // Insert into target
                const targetCol = [...newColumns[targetColIndex]];
                targetCol.splice(targetIndex, 0, sectionId);
                newColumns[targetColIndex] = targetCol;

                return { resume: { ...state.resume, layout: { ...state.resume.layout, columns: newColumns } } };
            }),

            toggleSectionVisibility: (sectionId) => set((state) => ({
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
                const id = uuidv4();

                // Auto-increment title logic
                const existingCount = Object.values(state.resume.sections).filter(s => s.type === type).length;
                const finalTitle = existingCount > 0 ? `${title} ${existingCount + 1}` : title;

                const newSection: SectionData = {
                    id,
                    type,
                    title: finalTitle,
                    isVisible: true,
                    variant: type === 'skills' ? 'tags' : 'expanded',
                    items: []
                };

                // Add to first column by default
                const newColumns = [...state.resume.layout.columns];
                newColumns[0] = [...newColumns[0], id];

                return {
                    resume: {
                        ...state.resume,
                        layout: { ...state.resume.layout, columns: newColumns },
                        sections: { ...state.resume.sections, [id]: newSection }
                    }
                };
            }),

            deleteSection: (sectionId: string) => set((state) => {
                const newSections = { ...state.resume.sections };
                delete newSections[sectionId];

                const newColumns = state.resume.layout.columns.map(col =>
                    col.filter(id => id !== sectionId)
                );

                return {
                    resume: {
                        ...state.resume,
                        layout: { ...state.resume.layout, columns: newColumns },
                        sections: newSections
                    }
                };
            }),

            updateSectionData: (sectionId, itemId, data) => set((state) => ({
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
                const section = state.resume.sections[sectionId];
                let defaultData = data;

                // Smart defaults based on type if data is generic
                if (section) {
                    if (section.type === 'skills' || section.type === 'languages' || section.type === 'custom') {
                        defaultData = { name: 'New Item', ...data };
                    } else if (section.type === 'experience' || section.type === 'projects') {
                        defaultData = {
                            role: 'Title/Role',
                            company: 'Company/Project',
                            date: 'Date',
                            description: 'Description...',
                            ...data
                        };
                    } else if (section.type === 'education') {
                        defaultData = {
                            school: 'School Name',
                            degree: 'Degree',
                            year: 'Year',
                            ...data
                        };
                    }
                }

                return {
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
                const newSections = { ...state.resume.sections };
                Object.entries(variants).forEach(([id, variant]) => {
                    if (newSections[id]) {
                        newSections[id] = { ...newSections[id], variant: variant as any };
                    }
                });
                return { resume: { ...state.resume, sections: newSections } };
            })
        }),
        {
            name: 'resume-storage', // unique name
            partialize: (state) => ({ resume: state.resume }), // persist only resume data
        }
    )
);

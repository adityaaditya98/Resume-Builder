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

    // Actions
    updateSettings: (settings: Partial<ResumeConfig['settings']>) => void;
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
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            resume: INITIAL_RESUME,

            updateSettings: (newSettings) => set((state) => {
                const currentColumns = state.resume.settings.columns;
                const nextColumns = newSettings.columns;

                let newLayout = { ...state.resume.layout };

                // Reflow if switching from 2 to 1
                if (currentColumns === 2 && nextColumns === 1) {
                    const col0 = [...newLayout.columns[0]];
                    const col1 = [...newLayout.columns[1]];
                    newLayout.columns = [[...col0, ...col1]];
                }
                // Restore 2 columns if switching 1 to 2 (Smart Reflow)
                else if (currentColumns === 1 && nextColumns === 2) {
                    const allSections = state.resume.sections;
                    const currentIds = newLayout.columns[0];

                    const col0Ids: string[] = []; // Sidebar
                    const col1Ids: string[] = []; // Main

                    currentIds.forEach(id => {
                        const section = allSections[id];
                        if (!section) return;

                        // Heuristic: Keep typically small/sidebar items in Col 0, move heavy content to Col 1
                        if (['header', 'skills', 'languages', 'custom'].includes(section.type)) {
                            col0Ids.push(id);
                        } else {
                            col1Ids.push(id);
                        }
                    });

                    newLayout.columns = [col0Ids, col1Ids];
                }

                return {
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
                const newSection: SectionData = {
                    id,
                    type,
                    title,
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

            addSectionItem: (sectionId, data) => set((state) => ({
                resume: {
                    ...state.resume,
                    sections: {
                        ...state.resume.sections,
                        [sectionId]: {
                            ...state.resume.sections[sectionId],
                            items: [...state.resume.sections[sectionId].items, { id: uuidv4(), isVisible: true, data }]
                        }
                    }
                }
            })),

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
            }))
        }),
        {
            name: 'resume-storage', // unique name
            partialize: (state) => ({ resume: state.resume }), // persist only resume data
        }
    )
);

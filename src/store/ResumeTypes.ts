export type PageSize = 'A4' | 'Letter';
export type SortVariant = 'compact' | 'expanded' | 'grid' | 'minimal' | 'classic' | 'tags' | 'list' | 'sidebar';

export interface ResumeSettings {
    pageSize: PageSize;
    margins: number; // in mm
    columns: number; // 1 or 2
    columnRatio: number; // Percentage for first column (e.g. 30 for 30/70)
}

export interface ResumeStyles {
    fontFamily: string;
    accentColor: string;
    baseFontSize: number;
    lineHeight: number;
    sidebarBackgroundColor?: string;
    pageBackgroundColor?: string;
}

export type SectionType =
    | 'header'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'languages'
    | 'custom';

export interface SectionItem {
    id: string;
    isVisible: boolean;
    data: Record<string, any>; // Flexible data for content (e.g. role, company)
}

export interface SectionData {
    id: string;
    type: SectionType;
    title: string;
    isVisible: boolean;
    variant: SortVariant;
    items: SectionItem[]; // Nested items (e.g. multiple jobs)
}

export interface ResumeLayout {
    columns: string[][]; // Array of Component IDs for each column
}

export interface ResumeConfig {
    id: string;
    name: string;
    settings: ResumeSettings;
    styles: ResumeStyles;
    layout: ResumeLayout;
    sections: Record<string, SectionData>; // Normalized Data Store
}

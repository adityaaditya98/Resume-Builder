
import type { ResumeSettings, ResumeStyles } from '../store/ResumeTypes';

// --- DATA STRUCTURES (Simulating JSON Files) ---

interface ThemeJson {
    id: string;
    name: string;
    description: string;
    styles: Partial<ResumeStyles>;
    sectionVariants: Record<string, string>;
}

interface LayoutJson {
    id: string;
    name: string;
    settings: Partial<ResumeSettings>;
}

export interface ResumeTemplate {
    id: string;
    name: string;
    thumbnail: string;
    layout: LayoutJson;
    theme: ThemeJson;

    // Flattened for consumption by the store (facade)
    settings: Partial<ResumeSettings>;
    styles: Partial<ResumeStyles>;
    sectionVariants: Record<string, string>;
}

// --- LAYOUTS (Structure & Sections) ---

const LAYOUTS: Record<string, LayoutJson> = {
    SINGLE_COL: {
        id: 'single-col',
        name: 'Single Column',
        settings: {
            columns: 1,
            margins: 25,
            pageSize: 'A4'
        }
    },
    DOUBLE_COL_SIDEBAR: {
        id: 'double-col-sidebar',
        name: 'Sidebar Layout',
        settings: {
            columns: 2,
            columnRatio: 35, // 35% sidebar
            margins: 20,
            pageSize: 'A4'
        }
    },
    DOUBLE_COL_NARROW: {
        id: 'double-col-narrow',
        name: 'Narrow Sidebar',
        settings: {
            columns: 2,
            columnRatio: 25,
            margins: 20,
            pageSize: 'A4'
        }
    },
    COMPACT_SINGLE: {
        id: 'compact-single',
        name: 'Compact Single',
        settings: {
            columns: 1,
            margins: 15,
            pageSize: 'A4'
        }
    }
};

// --- THEMES (Fonts, Spacing, Typography, Visual Identity) ---

const THEMES: Record<string, ThemeJson> = {
    CLASSIC: {
        id: 'theme-classic',
        name: 'Classic Serif',
        description: 'Traditional, elegant, time-tested.',
        styles: {
            fontFamily: 'Merriweather',
            headingFontFamily: 'Merriweather',
            accentColor: '#2c3e50',
            baseFontSize: 11,
            lineHeight: 1.6,
            pageBackgroundColor: '#ffffff',
            sidebarBackgroundColor: '#ffffff',
            sectionTitleAlign: 'center',
            sectionTitleStyle: 'background',
            sectionTitleCase: 'uppercase'
        },
        sectionVariants: {
            header: 'classic',
            experience: 'classic',
            skills: 'list',
            summary: 'classic'
        }
    },
    MODERN: {
        id: 'theme-modern',
        name: 'Modern Sans',
        description: 'Clean, bold, and forward-looking.',
        styles: {
            fontFamily: 'Open Sans',
            headingFontFamily: 'Montserrat',
            accentColor: '#2563eb', // Blue
            baseFontSize: 10.5,
            lineHeight: 1.5,
            pageBackgroundColor: '#ffffff',
            sidebarBackgroundColor: '#f1f5f9', // Slate-100 sidebar
            sectionTitleAlign: 'left',
            sectionTitleStyle: 'simple',
            sectionTitleCase: 'capitalize'
        },
        sectionVariants: {
            header: 'sidebar',
            experience: 'modern',
            skills: 'tags',
            summary: 'modern'
        }
    },
    MINIMAL: {
        id: 'theme-minimal',
        name: 'Minimalist',
        description: 'Less is more. Whitespace focused.',
        styles: {
            fontFamily: 'Inter',
            headingFontFamily: 'Inter',
            accentColor: '#18181b', // Zinc-900
            baseFontSize: 10,
            lineHeight: 1.6,
            pageBackgroundColor: '#ffffff',
            sidebarBackgroundColor: '#ffffff',
            sectionTitleAlign: 'left',
            sectionTitleStyle: 'underline',
            sectionTitleCase: 'uppercase'
        },
        sectionVariants: {
            header: 'simple',
            experience: 'compact',
            skills: 'list',
            summary: 'simple'
        }
    },
    CREATIVE: {
        id: 'theme-creative',
        name: 'Creative',
        description: 'Stand out with bold choices.',
        styles: {
            fontFamily: 'Lato',
            headingFontFamily: 'Playfair Display',
            accentColor: '#7c3aed', // Violet
            baseFontSize: 11,
            lineHeight: 1.5,
            pageBackgroundColor: '#ffffff',
            sidebarBackgroundColor: '#ffffff',
            sectionTitleAlign: 'center',
            sectionTitleStyle: 'box', // Boxed headers
            sectionTitleCase: 'uppercase'
        },
        sectionVariants: {
            header: 'centered',
            experience: 'modern',
            skills: 'grid',
            summary: 'centered'
        }
    },
    PROFESSIONAL: {
        id: 'theme-professional',
        name: 'Professional',
        description: 'Corporate and authoritative.',
        styles: {
            fontFamily: 'Calibri', // or fallback
            headingFontFamily: 'Roboto',
            accentColor: '#0f172a', // Slate-900
            baseFontSize: 10.5,
            lineHeight: 1.45,
            pageBackgroundColor: '#ffffff',
            sidebarBackgroundColor: '#ffffff',
            sectionTitleAlign: 'left',
            sectionTitleStyle: 'left-border',
            sectionTitleCase: 'uppercase'
        },
        sectionVariants: {
            header: 'simple',
            experience: 'classic',
            skills: 'list',
            summary: 'simple'
        }
    },
    TECHNICAL: {
        id: 'theme-technical',
        name: 'Technical',
        description: 'Data-driven and structured.',
        styles: {
            fontFamily: 'Roboto',
            headingFontFamily: 'Roboto',
            accentColor: '#059669', // Emerald
            baseFontSize: 10,
            lineHeight: 1.4,
            pageBackgroundColor: '#ffffff',
            sidebarBackgroundColor: '#ffffff',
            sectionTitleAlign: 'left',
            sectionTitleStyle: 'simple',
            sectionTitleCase: 'uppercase'
        },
        sectionVariants: {
            header: 'compact',
            experience: 'modern',
            skills: 'grid',
            summary: 'simple'
        }
    },
    EXECUTIVE: {
        id: 'theme-executive',
        name: 'Executive',
        description: 'High-level impact.',
        styles: {
            fontFamily: 'Georgia', // fallback to Serif
            headingFontFamily: 'Merriweather',
            accentColor: '#78350f', // Amber-900
            baseFontSize: 11,
            lineHeight: 1.6,
            pageBackgroundColor: '#fffbf0', // Very subtle cream
            sidebarBackgroundColor: '#fffbf0',
            sectionTitleAlign: 'center',
            sectionTitleStyle: 'background',
            sectionTitleCase: 'uppercase'
        },
        sectionVariants: {
            header: 'centered',
            experience: 'classic',
            skills: 'grid',
            summary: 'expanded'
        }
    }
};

// --- TEMPLATE COMPOSITION (Combining Layouts + Themes) ---

export const RESUME_TEMPLATES: ResumeTemplate[] = [
    {
        id: 'modern',
        name: 'Modern One',
        thumbnail: 'https://cdn.zety.com/images/zety/templates/primo/thumbnail-700x990.png', // Placeholder
        layout: LAYOUTS.DOUBLE_COL_SIDEBAR,
        theme: THEMES.MODERN,
        // Computed/Flattened for Store
        settings: { ...LAYOUTS.DOUBLE_COL_SIDEBAR.settings },
        styles: { ...THEMES.MODERN.styles },
        sectionVariants: { ...THEMES.MODERN.sectionVariants }
    },
    {
        id: 'classic',
        name: 'Classic Pro',
        thumbnail: 'https://d.novoresume.com/images/doc/functional-resume-template.png',
        layout: LAYOUTS.SINGLE_COL,
        theme: THEMES.CLASSIC,
        settings: { ...LAYOUTS.SINGLE_COL.settings },
        styles: { ...THEMES.CLASSIC.styles },
        sectionVariants: { ...THEMES.CLASSIC.sectionVariants }
    },
    {
        id: 'compact',
        name: 'Compact',
        thumbnail: 'https://d.novoresume.com/images/doc/combined-resume-template.png',
        layout: LAYOUTS.COMPACT_SINGLE,
        theme: THEMES.TECHNICAL,
        settings: { ...LAYOUTS.COMPACT_SINGLE.settings },
        styles: { ...THEMES.TECHNICAL.styles },
        sectionVariants: { ...THEMES.TECHNICAL.sectionVariants }
    },
    {
        id: 'creative',
        name: 'Creative Studio',
        thumbnail: 'https://s3.resume.io/uploads/local_template_image/image/488/persistent-resource/stockholm-resume-templates.jpg',
        layout: LAYOUTS.DOUBLE_COL_NARROW,
        theme: THEMES.CREATIVE,
        settings: { ...LAYOUTS.DOUBLE_COL_NARROW.settings },
        styles: { ...THEMES.CREATIVE.styles },
        sectionVariants: { ...THEMES.CREATIVE.sectionVariants }
    },
    {
        id: 'professional',
        name: 'Corporate',
        thumbnail: 'https://d.novoresume.com/images/doc/basic-resume-template.png',
        layout: LAYOUTS.SINGLE_COL,
        theme: THEMES.PROFESSIONAL,
        settings: { ...LAYOUTS.SINGLE_COL.settings },
        styles: { ...THEMES.PROFESSIONAL.styles },
        sectionVariants: { ...THEMES.PROFESSIONAL.sectionVariants }
    },
    {
        id: 'minimal',
        name: 'Clean Minimal',
        thumbnail: 'https://d.novoresume.com/images/doc/simple-resume-template.png',
        layout: LAYOUTS.SINGLE_COL,
        theme: THEMES.MINIMAL,
        settings: { ...LAYOUTS.SINGLE_COL.settings },
        styles: { ...THEMES.MINIMAL.styles },
        sectionVariants: { ...THEMES.MINIMAL.sectionVariants }
    },
    {
        id: 'executive',
        name: 'Executive',
        thumbnail: 'https://d.novoresume.com/images/doc/executive-resume-template.png',
        layout: LAYOUTS.SINGLE_COL,
        theme: THEMES.EXECUTIVE,
        settings: { ...LAYOUTS.SINGLE_COL.settings },
        styles: { ...THEMES.EXECUTIVE.styles },
        sectionVariants: { ...THEMES.EXECUTIVE.sectionVariants }
    }
];

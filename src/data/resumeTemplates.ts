
import type { ResumeSettings, ResumeStyles } from '../store/ResumeTypes';

export interface ResumeTemplate {
    id: string;
    name: string;
    thumbnail: string;
    settings: Partial<ResumeSettings>;
    styles: Partial<ResumeStyles>;
    sectionVariants?: Record<string, string>;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
    {
        id: 'classic',
        name: 'Classic Professional',
        thumbnail: 'https://d.novoresume.com/images/doc/functional-resume-template.png',
        settings: {
            columns: 1,
            margins: 25
        },
        styles: {
            fontFamily: 'Merriweather',
            accentColor: '#2c3e50',
            sidebarBackgroundColor: '#ffffff',
            pageBackgroundColor: '#ffffff'
        },
        sectionVariants: {
            header: 'classic'
        }
    },
    {
        id: 'primo',
        name: 'Primo Modern',
        thumbnail: 'https://cdn.zety.com/images/zety/templates/primo/thumbnail-700x990.png',
        settings: {
            columns: 2,
            columnRatio: 35, // 35% Left Sidebar
            margins: 20
        },
        styles: {
            fontFamily: 'Inter',
            accentColor: '#ffc107', // Amber/Gold accent
            sidebarBackgroundColor: '#2c3e50', // Dark Sidebar
            pageBackgroundColor: '#ffffff'
        },
        sectionVariants: {
            header: 'sidebar'
        }
    },
    {
        id: 'executive',
        name: 'Executive Leadership',
        thumbnail: 'https://d.novoresume.com/images/doc/executive-resume-template.png',
        settings: {
            columns: 1,
            margins: 30
        },
        styles: {
            fontFamily: 'Merriweather', // Serif for authority
            accentColor: '#1a365d', // Navy Blue
            sidebarBackgroundColor: '#ffffff',
            pageBackgroundColor: '#ffffff'
        },
        sectionVariants: {
            header: 'classic',
            summary: 'expanded'
        }
    },
    {
        id: 'student',
        name: 'Entry Level / Student',
        thumbnail: 'https://d.novoresume.com/images/doc/college-student-resume-template.png',
        settings: {
            columns: 2,
            columnRatio: 30, // Narrower sidebar
            margins: 20
        },
        styles: {
            fontFamily: 'Roboto', // Clean, readable
            accentColor: '#10b981', // Fresh Green
            sidebarBackgroundColor: '#f0fdf4', // Very light green tint sidebar
            pageBackgroundColor: '#ffffff'
        },
        sectionVariants: {
            header: 'sidebar',
            education: 'expanded', // Highlight education
            skills: 'tags'
        }
    }
];

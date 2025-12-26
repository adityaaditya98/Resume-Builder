
import type { ResumeSettings, ResumeStyles } from '../store/ResumeTypes';

export interface ResumeTemplate {
    id: string;
    name: string;
    thumbnail: string;
    settings: Partial<ResumeSettings>;
    styles: Partial<ResumeStyles>;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
    {
        id: 'primo',
        name: 'Primo',
        thumbnail: 'https://cdn-images.zety.com/pages/zety_in_resume_with_photo_4.jpg',
        settings: {
            columns: 2,
            columnRatio: 35,
            margins: 20
        },
        styles: {
            fontFamily: 'Montserrat',
            accentColor: '#007cc2',
            sidebarBackgroundColor: '#313C4E',
            pageBackgroundColor: '#ffffff'
        }
    },
    {
        id: 'modern',
        name: 'Modern Creative',
        thumbnail: 'https://cdn-images.zety.com/pages/creative_resume_templates_08.jpg',
        settings: {
            columns: 2,
            columnRatio: 30,
            margins: 15
        },
        styles: {
            fontFamily: 'Inter',
            accentColor: '#ff6b6b',
            sidebarBackgroundColor: '#f0f0f0',
            pageBackgroundColor: '#ffffff'
        }
    },
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
        }
    }
];

import type { CanvasElement } from "../store/useStore";
// import { v4 as uuidv4 } from 'uuid';

export interface Template {
    id: string;
    name: string;
    thumbnail: string;
    elements: CanvasElement[];
}

// Helper to generate IDs for static template data
// In a real app, these would be generated when the template is instantiated
// const id = () => uuidv4();


export const TEMPLATES: Template[] = [


];


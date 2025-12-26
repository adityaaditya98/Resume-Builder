
export interface ElementItem {
    id: string;
    label: string;
    type: 'shape'; // Expandable later
    shapeType: string; // 'rect', 'circle', 'triangle', 'star', etc.
    icon: string; // Using a simple string for now, could be a component
}

export const SHAPES: ElementItem[] = [
    { id: 'rect', label: 'Square', type: 'shape', shapeType: 'rect', icon: 'square' },
    { id: 'circle', label: 'Circle', type: 'shape', shapeType: 'circle', icon: 'circle' },
    { id: 'triangle', label: 'Triangle', type: 'shape', shapeType: 'triangle', icon: 'triangle' },
    { id: 'star', label: 'Star', type: 'shape', shapeType: 'star', icon: 'star' },
    { id: 'arrow', label: 'Arrow', type: 'shape', shapeType: 'arrow', icon: 'arrow-right' },
    { id: 'line', label: 'Line', type: 'shape', shapeType: 'line', icon: 'minus' },
];

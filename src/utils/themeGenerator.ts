

const PALETTES = [
    { accent: '#3b82f6', background: '#ffffff', text: '#1f2937' }, // Blue
    { accent: '#ef4444', background: '#fff1f2', text: '#881337' }, // Red/Rose
    { accent: '#10b981', background: '#ecfdf5', text: '#065f46' }, // Emerald
    { accent: '#f59e0b', background: '#fffbeb', text: '#92400e' }, // Amber
    { accent: '#8b5cf6', background: '#f5f3ff', text: '#5b21b6' }, // Violet
    { accent: '#ec4899', background: '#fdf2f8', text: '#9d174d' }, // Pink
    { accent: '#14b8a6', background: '#f0fdfa', text: '#134e4a' }, // Teal
    { accent: '#6366f1', background: '#eef2ff', text: '#3730a3' }, // Indigo
    { accent: '#2c3e50', background: '#f8fafc', text: '#0f172a' }, // Slate
];

const FONTS = [
    'Inter, sans-serif',
    'Merriweather, serif',
    'Roboto, sans-serif',
    'Playfair Display, serif',
    'Lora, serif',
    'Open Sans, sans-serif'
];

export const generateRandomTheme = () => {
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const font = FONTS[Math.floor(Math.random() * FONTS.length)];

    return {
        accentColor: palette.accent,
        pageBackgroundColor: palette.background, // Careful, might want to keep white for resume? 
        // Let's stick to white paper mostly, but maybe subtle tint?
        // Actually for a resume, background is usually white. 
        // Let's override background to white for safety unless user wants full color.
        // But palette.background makes it "themed". Let's use it.
        fontFamily: font
    };
};

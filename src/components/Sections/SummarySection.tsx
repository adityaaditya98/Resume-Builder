import { useLayoutStore } from '../../store/useLayoutStore';
import type { SectionData } from '../../store/ResumeTypes';

export const SummarySection = ({ section }: { section: SectionData }) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const { accentColor, sectionTitleAlign = 'left', sectionTitleStyle = 'simple', sectionTitleCase = 'uppercase', headingFontFamily } = useLayoutStore(state => state.resume.styles);
    const item = section.items[0];

    // Ensure we have an item to edit
    if (!item) return null;

    const handleUpdate = (text: string) => {
        updateSectionData(section.id, item.id, { text });
    };

    const getTitleStyle = () => {
        const baseStyle: React.CSSProperties = {
            color: accentColor,
            fontFamily: headingFontFamily,
            textAlign: sectionTitleAlign,
            textTransform: sectionTitleCase,
        };

        if (sectionTitleStyle === 'background') {
            baseStyle.backgroundColor = accentColor;
            baseStyle.color = '#fff';
            baseStyle.padding = '4px 8px';
            baseStyle.borderRadius = '2px';
            baseStyle.display = 'inline-block';
        } else if (sectionTitleStyle === 'underline') {
            baseStyle.borderBottom = `2px solid ${accentColor}`;
            baseStyle.paddingBottom = '4px';
            baseStyle.width = '100%';
        } else if (sectionTitleStyle === 'left-border') {
            baseStyle.borderLeft = `4px solid ${accentColor}`;
            baseStyle.paddingLeft = '8px';
        } else if (sectionTitleStyle === 'box') {
            baseStyle.border = `2px solid ${accentColor}`;
            baseStyle.padding = '4px 8px';
            baseStyle.display = 'inline-block';
        }

        return baseStyle;
    }

    return (
        <div className={`p-4 group/section transition-colors hover:bg-gray-50/50 rounded-lg ${section.variant === 'compact' ? 'py-2' : ''}`}>
            {/* Header */}
            <div className={`flex items-center justify-between ${section.variant === 'compact' ? 'mb-2' : 'mb-3'} pb-1`}>
                <h3
                    className={`font-bold tracking-wider ${section.variant === 'compact' ? 'text-xs' : 'text-sm'}`}
                    style={getTitleStyle()}
                >
                    {section.title}
                </h3>
            </div>

            {/* Content */}
            <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleUpdate(e.currentTarget.innerText)}
                className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap outline-none ${section.variant === 'expanded' ? 'text-base' : ''}`}
                style={{ textAlign: section.variant === 'centered' ? 'center' : 'left' }}
            >
                {item.data.text || 'Professional summary...'}
            </div>
        </div>
    );
};

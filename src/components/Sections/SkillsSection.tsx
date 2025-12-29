import { Trash2, Plus } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import type { SectionData } from '../../store/ResumeTypes';


export const SkillsSection = ({ section }: { section: SectionData }) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);
    const { accentColor, sectionTitleAlign = 'left', sectionTitleStyle = 'simple', sectionTitleCase = 'uppercase', headingFontFamily } = useLayoutStore(state => state.resume.styles);
    //     const mode = useStore(state => state.activeTab);

    // Determine variant (default to 'tags' if undefined)
    const variant = section.variant || 'tags';

    const handleAddItem = () => {
        addSectionItem(section.id, { name: 'New Skill' });
    };

    const handleUpdate = (itemId: string, name: string) => {
        updateSectionData(section.id, itemId, { name });
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
            <div className={`flex items-center justify-between ${section.variant === 'compact' ? 'mb-2' : 'mb-3'} pb-1`}>
                <h3
                    className={`font-bold tracking-wider ${section.variant === 'compact' ? 'text-xs' : 'text-sm'}`}
                    style={getTitleStyle()}
                >
                    {section.title}
                </h3>
                <button
                    onClick={handleAddItem}
                    className="opacity-0 group-hover/section:opacity-100 p-1 text-green-600 hover:bg-green-50 rounded transition-opacity"
                    title="Add Skill"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className={`
                ${variant === 'tags' ? 'flex flex-wrap gap-2' : ''}
                ${variant === 'list' ? 'flex flex-col gap-1' : ''}
                ${variant === 'grid' ? 'grid grid-cols-2 gap-2' : ''}
            `}>
                {section.items.map(item => (
                    <div
                        key={item.id}
                        className={`group/item relative flex items-center ${variant === 'tags' ? 'bg-gray-100 rounded px-2 py-1' : ''
                            } ${variant === 'grid' ? 'bg-gray-50/50 rounded px-2 py-1 border border-gray-100' : ''}`}
                    >
                        {variant !== 'tags' && variant !== 'grid' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 flex-shrink-0" style={{ backgroundColor: accentColor }}></span>
                        )}
                        <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleUpdate(item.id, e.currentTarget.innerText)}
                            className={`text-sm text-gray-700 outline-none w-full`}
                        >
                            {item.data.name}
                        </span>

                        {/* Delete Button (visible on hover) */}
                        <button
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className={`absolute ${variant === 'tags' || variant === 'grid'
                                ? '-top-2 -right-2 bg-white shadow-sm border border-gray-200'
                                : 'right-0 top-1/2 -translate-y-1/2'
                                } p-0.5 rounded-full text-red-400 opacity-0 group-hover/item:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all z-10`}
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                ))}

                {section.items.length === 0 && (
                    <div className="text-gray-400 text-xs italic py-2">No skills added yet.</div>
                )}
            </div>
        </div>
    );
};

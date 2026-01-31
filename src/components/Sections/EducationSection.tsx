import { Trash2, Plus } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import type { SectionData } from '../../store/ResumeTypes';

export const EducationSection = ({ section }: { section: SectionData }) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);
    const { accentColor, sectionTitleAlign = 'left', sectionTitleStyle = 'simple', sectionTitleCase = 'uppercase', headingFontFamily } = useLayoutStore(state => state.resume.styles);

    const handleAddItem = () => {
        addSectionItem(section.id, {
            school: 'University Name',
            degree: 'Bachelor of Science',
            year: '2020 - 2024',
            grade: ''
        });
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
                <button
                    onClick={handleAddItem}
                    className="opacity-0 group-hover/section:opacity-100 p-1 text-green-600 hover:bg-green-50 rounded transition-opacity"
                    title="Add Education"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className={`flex flex-col ${section.variant === 'compact' ? 'gap-1' : 'gap-3'}`}>
                {section.items.map(item => (
                    <div key={item.id} className="group/item relative hover:bg-gray-50/50 transition-colors rounded p-1 -mx-1">
                        {section.variant === 'compact' ? (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                                <h4
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => updateSectionData(section.id, item.id, { degree: e.currentTarget.innerText })}
                                    className="font-bold text-gray-800 text-xs outline-none"
                                    style={{ fontFamily: headingFontFamily }}
                                >
                                    {item.data.degree as string}
                                </h4>
                                <span className="text-xs text-gray-400">@</span>
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => updateSectionData(section.id, item.id, { school: e.currentTarget.innerText })}
                                    className="text-xs text-gray-700 font-medium outline-none"
                                >
                                    {item.data.school as string}
                                </div>
                                <span className="flex-1 text-right text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                    {item.data.year as string}
                                </span>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => updateSectionData(section.id, item.id, { degree: e.currentTarget.innerText })}
                                        className={`font-bold text-gray-800 ${section.variant === 'modern' ? 'text-sm' : 'text-sm'} outline-none`}
                                        style={{ fontFamily: headingFontFamily }}
                                    >
                                        {item.data.degree as string}
                                    </h4>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => updateSectionData(section.id, item.id, { school: e.currentTarget.innerText })}
                                        className="text-xs text-gray-600 font-medium outline-none"
                                    >
                                        {item.data.school as string}
                                    </div>
                                </div>
                                <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => updateSectionData(section.id, item.id, { year: e.currentTarget.innerText })}
                                    className="text-xs text-gray-500 font-medium whitespace-nowrap outline-none"
                                >
                                    {item.data.year as string}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="absolute -right-2 top-0 p-1 rounded text-red-400 opacity-0 group-hover/item:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}

                {section.items.length === 0 && (
                    <div className="text-gray-400 text-xs italic py-2">No education added yet.</div>
                )}
            </div>
        </div>
    );
};

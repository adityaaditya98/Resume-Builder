import { Trash2, Plus } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import type { SectionData } from '../../store/ResumeTypes';

export const EducationSection = ({ section }: { section: SectionData }) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);
    const accentColor = useLayoutStore(state => state.resume.styles.accentColor);

    const handleAddItem = () => {
        addSectionItem(section.id, {
            school: 'University Name',
            degree: 'Bachelor of Science',
            year: '2020 - 2024',
            grade: ''
        });
    };

    return (
        <div className="p-4 group/section transition-colors hover:bg-gray-50/50 rounded-lg">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-1">
                <h3
                    className="font-bold text-gray-800 uppercase text-sm tracking-wider"
                    style={{ color: accentColor }}
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

            <div className="flex flex-col gap-3">
                {section.items.map(item => (
                    <div key={item.id} className="group/item relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => updateSectionData(section.id, item.id, { degree: e.currentTarget.innerText })}
                                    className="font-bold text-gray-800 text-sm outline-none"
                                >
                                    {item.data.degree}
                                </h4>
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => updateSectionData(section.id, item.id, { school: e.currentTarget.innerText })}
                                    className="text-xs text-gray-600 font-medium outline-none"
                                >
                                    {item.data.school}
                                </div>
                            </div>
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateSectionData(section.id, item.id, { year: e.currentTarget.innerText })}
                                className="text-xs text-gray-500 font-medium whitespace-nowrap outline-none"
                            >
                                {item.data.year}
                            </span>
                        </div>

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

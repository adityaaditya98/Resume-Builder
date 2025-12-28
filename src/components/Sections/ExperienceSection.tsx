import { Trash2, Plus } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import type { SectionData } from '../../store/ResumeTypes';

export const ExperienceSection = ({ section }: { section: SectionData }) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);
    const accentColor = useLayoutStore(state => state.resume.styles.accentColor);

    const handleAddItem = () => {
        addSectionItem(section.id, {
            role: 'Job Title',
            company: 'Company Name',
            date: '2023 - Present',
            description: 'Key responsibility or achievement.'
        });
    };

    return (
        <div className="p-4 group/section transition-colors hover:bg-gray-50/50 rounded-lg">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-1">
                <h3
                    className="font-bold text-gray-800 uppercase text-sm tracking-wider"
                    style={{ color: accentColor }}
                >
                    {section.title}
                </h3>
                <button
                    onClick={handleAddItem}
                    className="opacity-0 group-hover/section:opacity-100 p-1 text-green-600 hover:bg-green-50 rounded transition-opacity"
                    title="Add Entry"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {section.items.map(item => (
                    <div key={item.id} className="group/item relative pl-2 hover:border-l-2 hover:border-gray-300 transition-all">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateSectionData(section.id, item.id, { role: e.currentTarget.innerText })}
                                className="font-bold text-gray-800 text-sm outline-none"
                            >
                                {item.data.role}
                            </h4>
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateSectionData(section.id, item.id, { date: e.currentTarget.innerText })}
                                className="text-xs text-gray-500 font-medium whitespace-nowrap outline-none"
                            >
                                {item.data.date}
                            </span>
                        </div>

                        <div className="text-xs text-gray-600 font-medium mb-2">
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateSectionData(section.id, item.id, { company: e.currentTarget.innerText })}
                                className="outline-none"
                            >
                                {item.data.company}
                            </span>
                        </div>

                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionData(section.id, item.id, { description: e.currentTarget.innerText })}
                            className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap outline-none"
                        >
                            {item.data.description}
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
                    <div className="text-gray-400 text-xs italic py-2">No entries added yet.</div>
                )}
            </div>
        </div>
    );
};

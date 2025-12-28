import { Trash2, Plus } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import type { SectionData } from '../../store/ResumeTypes';
import { useStore } from '../../store/useStore';

export const SkillsSection = ({ section }: { section: SectionData }) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);
    const accentColor = useLayoutStore(state => state.resume.styles.accentColor);
    //     const mode = useStore(state => state.activeTab);

    // Determine variant (default to 'tags' if undefined)
    const variant = section.variant || 'tags';

    const handleAddItem = () => {
        addSectionItem(section.id, { name: 'New Skill' });
    };

    const handleUpdate = (itemId: string, name: string) => {
        updateSectionData(section.id, itemId, { name });
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
                    title="Add Skill"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className={`flex flex-wrap ${variant === 'tags' ? 'gap-2' : 'flex-col gap-1'}`}>
                {section.items.map(item => (
                    <div
                        key={item.id}
                        className={`group/item relative flex items-center ${variant === 'tags'
                            ? 'bg-gray-100 rounded px-2 py-1'
                            : ''
                            }`}
                    >
                        <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => handleUpdate(item.id, e.currentTarget.innerText)}
                            className={`text-sm text-gray-700 outline-none min-w-[30px] ${variant === 'list' ? 'w-full' : ''
                                }`}
                        >
                            {item.data.name}
                        </span>

                        {/* Delete Button (visible on hover) */}
                        <button
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className={`absolute ${variant === 'tags'
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

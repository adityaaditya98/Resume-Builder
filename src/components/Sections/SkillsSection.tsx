import type { SectionData } from '../../store/ResumeTypes';
import { EditableText } from '../UI/EditableText';
import { useLayoutStore } from '../../store/useLayoutStore';
import { X } from 'lucide-react';

export const SkillsSection = ({ section }: { section: SectionData }) => {
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);

    const handleAdd = () => {
        addSectionItem(section.id, { name: 'New Skill' });
    };

    return (
        <div className="mb-6 group/section">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 mb-3 pb-1">
                {section.title}
            </h2>

            {section.variant === 'tags' ? (
                <div className="flex flex-wrap gap-2">
                    {section.items.map(item => (
                        <div key={item.id} className="relative group/item bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm font-medium text-gray-700">
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="name"
                                value={item.data.name}
                                className="min-w-[20px]"
                            />
                            <button
                                onClick={() => removeSectionItem(section.id, item.id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 w-3 h-3 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                                <X size={8} />
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAdd} className="px-2 py-1 text-xs border border-dashed border-gray-300 rounded text-gray-400 hover:text-blue-500 hover:border-blue-500">
                        +
                    </button>
                </div>
            ) : (
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {section.items.map(item => (
                        <li key={item.id} className="group/item flex items-center justify-between text-sm text-gray-700 relative pl-4">
                            <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="name"
                                value={item.data.name}
                            />
                            <button
                                onClick={() => removeSectionItem(section.id, item.id)}
                                className="bg-red-500 text-white rounded p-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        </li>
                    ))}
                    <li className="col-span-2 mt-2">
                        <button onClick={handleAdd} className="text-xs text-blue-500 hover:underline">+ Add Skill</button>
                    </li>
                </ul>
            )}
        </div>
    );
};

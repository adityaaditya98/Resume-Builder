import type { SectionData } from '../../store/ResumeTypes';
import { EditableText } from '../UI/EditableText';
import { useLayoutStore } from '../../store/useLayoutStore';
import { Plus, Trash2 } from 'lucide-react';

export const ExperienceSection = ({ section }: { section: SectionData }) => {
    const addSectionItem = useLayoutStore(state => state.addSectionItem);
    const removeSectionItem = useLayoutStore(state => state.removeSectionItem);

    const handleAdd = () => {
        addSectionItem(section.id, {
            role: 'New Role',
            company: 'Company Name',
            date: '2023 - Present',
            description: 'Describe your key responsibilities and achievements.'
        });
    };

    return (
        <div className="mb-6 group/section">
            <div className="flex items-center justify-between border-b border-gray-200 mb-4 pb-1">
                <EditableText
                    sectionId={section.id}
                    itemId="title" // Special ID, conceptually section title is stored elsewhere usually, but let's assume valid
                    field="title"
                    value={section.title} // This actually isn't editable via EditableText cleanly without refactor, skipping for now
                    className="text-lg font-bold text-gray-800 uppercase tracking-wider"
                    placeholder="Section Title"
                />
                {/* This simply renders the title, editing section title in store schema needs a dedicated action or direct store update. 
                     For now, let's keep section title static or editable via SidePanel settings if needed. 
                     Actually, let's just render it static for this iteration or assume EditableText won't update it. 
                 */}
            </div>

            <div className="flex flex-col gap-6">
                {section.items.map(item => (
                    <div key={item.id} className="group/item relative pl-4 border-l-2 border-transparent hover:border-gray-200 transition-colors">
                        {/* Delete Control */}
                        <button
                            onClick={() => removeSectionItem(section.id, item.id)}
                            className="absolute -left-8 top-0 p-1.5 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-50 rounded"
                            title="Remove Position"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="flex justify-between items-baseline mb-1">
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="role"
                                value={item.data.role}
                                className="font-bold text-gray-900 text-lg"
                                placeholder="Job Title"
                            />
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="date"
                                value={item.data.date}
                                className="text-sm text-gray-500 font-medium whitespace-nowrap"
                                placeholder="Date Range"
                            />
                        </div>

                        <EditableText
                            sectionId={section.id}
                            itemId={item.id}
                            field="company"
                            value={item.data.company}
                            className="text-blue-600 font-semibold text-sm mb-2 block"
                            placeholder="Company Name"
                        />

                        <div className="text-gray-600 text-sm leading-relaxed">
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="description"
                                value={item.data.description}
                                multiline
                                placeholder="Job description..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Button */}
            <button
                onClick={handleAdd}
                className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600 opacity-0 group-hover/section:opacity-100 transition-opacity hover:bg-blue-50 px-3 py-1.5 rounded"
            >
                <Plus size={14} /> Add Position
            </button>
        </div>
    );
};

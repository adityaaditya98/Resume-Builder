import type { SectionData } from '../../store/ResumeTypes';
import { HeaderSection } from './HeaderSection';
import { ExperienceSection } from './ExperienceSection';
import { SkillsSection } from './SkillsSection';
import { EducationSection } from './EducationSection';

const SectionPlaceholder = ({ section }: { section: SectionData }) => (
    <div className="p-4 border border-dashed border-gray-200 m-2 rounded bg-gray-50/50">
        <h3 className="font-bold text-gray-400 uppercase text-xs">{section.title}</h3>
        <p className="text-xs text-gray-400">Type: {section.type} (Generic Placeholder)</p>
    </div>
);

export const SectionRenderer = ({ sectionId, data }: { sectionId: string, data: SectionData }) => {
    // Safety check: Logic in store might sometimes reference a section that hasn't fully hydrated or was deleted
    if (!data) {
        console.warn(`SectionRenderer: Missing data for sectionId ${sectionId}`);
        return null;
    }

    if (!data.isVisible) return null;

    try {
        switch (data.type) {
            case 'header': return <HeaderSection section={data} />;
            case 'experience': return <ExperienceSection section={data} />;
            case 'education': return <EducationSection section={data} />;
            case 'projects': return <ExperienceSection section={data} />;  // Re-use Experience for now
            case 'skills': return <SkillsSection section={data} />;
            case 'languages': return <SkillsSection section={data} />;     // Re-use Skills for now
            case 'custom': return <SkillsSection section={data} />;        // Re-use Skills (List) for now
            case 'summary': return (
                <div className="p-4 group/section transition-colors hover:bg-gray-50/50 rounded-lg">
                    <h3 className="font-bold text-gray-800 border-b border-gray-300 mb-2 uppercase text-sm tracking-wider">{data.title}</h3>
                    <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap outline-none"
                    >
                        {data.items[0]?.data?.text || 'Summary description...'}
                    </p>
                </div>
            );
            default: return <SectionPlaceholder section={data} />;
        }
    } catch (error) {
        console.error(`Error rendering section ${data.id}:`, error);
        return <div className="p-4 text-red-500 text-xs">Error loading section</div>;
    }
};

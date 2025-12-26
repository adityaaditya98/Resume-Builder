import type { SectionData } from '../../store/ResumeTypes';
import { HeaderSection } from './HeaderSection';
import { ExperienceSection } from './ExperienceSection';
import { SkillsSection } from './SkillsSection';

const SectionPlaceholder = ({ section }: { section: SectionData }) => (
    <div className="p-4 border border-dashed border-gray-200 m-2 rounded bg-gray-50/50">
        <h3 className="font-bold text-gray-400 uppercase text-xs">{section.title}</h3>
        <p className="text-xs text-gray-400">Type: {section.type} (Coming Soon)</p>
    </div>
);

export const SectionRenderer = ({ data }: { sectionId: string, data: SectionData }) => {
    if (!data.isVisible) return null;

    switch (data.type) {
        case 'header': return <HeaderSection section={data} />;
        case 'experience': return <ExperienceSection section={data} />;
        case 'education': return <ExperienceSection section={data} />; // Re-use experience for now
        case 'projects': return <ExperienceSection section={data} />;  // Re-use experience for now
        case 'skills': return <SkillsSection section={data} />;
        case 'languages': return <SkillsSection section={data} />;     // Re-use skills for now
        default: return <SectionPlaceholder section={data} />;
    }
};

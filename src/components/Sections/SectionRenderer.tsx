import { memo } from 'react';
import type { SectionData } from '../../store/ResumeTypes';
import { HeaderSection } from './HeaderSection';
import { ExperienceSection } from './ExperienceSection';
import { SkillsSection } from './SkillsSection';
import { EducationSection } from './EducationSection';
import { SummarySection } from './SummarySection';

const SectionPlaceholder = ({ section }: { section: SectionData }) => (
    <div className="p-4 border border-dashed border-gray-200 m-2 rounded bg-gray-50/50">
        <h3 className="font-bold text-gray-400 uppercase text-xs">{section.title}</h3>
        <p className="text-xs text-gray-400">Type: {section.type} (Generic Placeholder)</p>
    </div>
);

// Optimize: Only re-render if data actually changes
export const SectionRenderer = memo(({ sectionId, data }: { sectionId: string, data: SectionData }) => {
    // Safety check: Logic in store might sometimes reference a section that hasn't fully hydrated or was deleted
    if (!data) {
        console.warn(`SectionRenderer: Missing data for sectionId ${sectionId}`);
        return null;
    }

    if (!data.isVisible) return null;

    switch (data.type) {
        case 'header': return <HeaderSection section={data} />;
        case 'experience': return <ExperienceSection section={data} />;
        case 'education': return <EducationSection section={data} />;
        case 'projects': return <ExperienceSection section={data} />;  // Re-use Experience for now
        case 'skills': return <SkillsSection section={data} />;
        case 'languages': return <SkillsSection section={data} />;     // Re-use Skills for now
        case 'custom': return <SkillsSection section={data} />;        // Re-use Skills (List) for now
        case 'summary': return <SummarySection section={data} />;
        default: return <SectionPlaceholder section={data} />;
    }
}, (prev, next) => {
    // Custom comparison to avoid deep check if reference is same
    // BUT since we create new objects on update, ref equality is usually enough check for "did it change".
    // HOWEVER, Drag & Drop often creates new refs for parent containers but data might be same.
    // Let's use deep comparison because sections are complex objects but not huge.
    return JSON.stringify(prev.data) === JSON.stringify(next.data);
});

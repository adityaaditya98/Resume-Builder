import type { SectionData } from '../../store/ResumeTypes';
import { EditableText } from '../UI/EditableText';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

export const HeaderSection = ({ section }: { section: SectionData }) => {
    const item = section.items[0]; // Header usually has 1 user item
    if (!item) return null;

    const { variant } = section;

    // Contact Item Helper
    const ContactItem = ({ icon: Icon, field, placeholder }: any) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
            {Icon && <Icon size={14} />}
            <EditableText
                sectionId={section.id}
                itemId={item.id}
                field={field}
                value={item.data[field] || ''}
                placeholder={placeholder}
            />
        </div>
    );

    if (variant === 'sidebar') {
        return (
            <div className="flex flex-col items-center text-center text-white mb-8">
                {/* Avatar Placeholder */}
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white/20 mb-4 overflow-hidden shadow-lg relative cursor-pointer group">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:bg-black/20 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 text-xs font-medium text-white">Upload</span>
                    </div>
                </div>

                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="name"
                    value={item.data.name || ''}
                    className="text-2xl font-bold tracking-tight mb-1"
                    placeholder="Your Name"
                />
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="role"
                    value={item.data.role || ''}
                    className="text-sm font-medium tracking-wide opacity-80 mb-6 uppercase"
                    placeholder="Role"
                />

                <div className="w-full flex flex-col gap-3 text-sm opacity-90 text-left px-2">
                    <ContactItem icon={Mail} field="email" placeholder="Email" />
                    <ContactItem icon={Phone} field="phone" placeholder="Phone" />
                    <ContactItem icon={MapPin} field="location" placeholder="Location" />
                    <ContactItem icon={Linkedin} field="linkedin" placeholder="LinkedIn" />
                    <ContactItem icon={Globe} field="website" placeholder="Website" />
                </div>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="border-b-2 border-black pb-6 mb-6">
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="name"
                    value={item.data.name || ''}
                    className="text-4xl font-bold uppercase tracking-tight text-gray-900"
                    placeholder="Your Name"
                />
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="role"
                    value={item.data.role || ''}
                    className="text-lg text-gray-600 font-medium mt-1"
                    placeholder="current role"
                />
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <ContactItem field="email" placeholder="email@example.com" />
                    <ContactItem field="phone" placeholder="+1 234 567 890" />
                    <ContactItem field="location" placeholder="City, Country" />
                </div>
            </div>
        );
    }

    if (variant === 'classic') {
        return (
            <div className="flex flex-col items-center text-center border-b border-gray-300 pb-6 mb-6">
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="name"
                    value={item.data.name || ''}
                    className="text-3xl font-serif text-gray-800"
                    placeholder="Your Name"
                />
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="role"
                    value={item.data.role || ''}
                    className="text-sm font-bold uppercase tracking-widest text-blue-800 mt-2 mb-4"
                    placeholder="CURRENT ROLE"
                />
                <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-xs uppercase tracking-wide">
                    <ContactItem field="email" placeholder="EMAIL" />
                    <span>|</span>
                    <ContactItem field="phone" placeholder="PHONE" />
                    <span>|</span>
                    <ContactItem field="location" placeholder="LOCATION" />
                </div>
            </div>
        );
    }

    // Modern (Default)
    return (
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
            <div>
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="name"
                    value={item.data.name || ''}
                    className="text-4xl font-extrabold text-slate-800 leading-tight"
                    placeholder="Your Name"
                />
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="role"
                    value={item.data.role || ''}
                    className="text-xl text-blue-600 font-medium mt-1"
                    placeholder="Current Role"
                />
                <div className="mt-4 max-w-lg text-sm text-gray-500 leading-relaxed">
                    <EditableText
                        sectionId={section.id}
                        itemId={item.id}
                        field="bio"
                        value={item.data.bio || ''}
                        placeholder="Brief professional summary or objective..."
                        multiline
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2 text-right items-end mt-2">
                <ContactItem icon={Mail} field="email" placeholder="Email" />
                <ContactItem icon={Phone} field="phone" placeholder="Phone" />
                <ContactItem icon={MapPin} field="location" placeholder="Location" />
                <ContactItem icon={Linkedin} field="linkedin" placeholder="LinkedIn" />
                <ContactItem icon={Globe} field="website" placeholder="Website" />
            </div>
        </div>
    );
};

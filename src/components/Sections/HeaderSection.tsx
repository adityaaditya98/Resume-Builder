import type { SectionData } from '../../store/ResumeTypes';
import { EditableText } from '../UI/EditableText';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';

export const HeaderSection = ({ section }: { section: SectionData }) => {
    const item = section.items[0]; // Header usually has 1 user item
    if (!item) return null;

    const { variant } = section;

    const accentColor = useLayoutStore(state => state.resume.styles.accentColor);

    interface ContactItemProps {
        icon?: any;
        field: string;
        placeholder: string;
        className?: string;
    }

    // Contact Item Helper
    const ContactItem = ({ icon: Icon, field, placeholder, className }: ContactItemProps) => (
        <div className={`flex items-center gap-1.5 text-sm ${className || 'text-gray-600'}`}>
            {Icon && <Icon size={14} style={{ color: accentColor }} />}
            <EditableText
                sectionId={section.id}
                itemId={item.id}
                field={field}
                value={item.data[field] || ''}
                placeholder={placeholder}
            />
        </div>
    );

    // Helper for Avatar
    const Avatar = ({ className }: { className?: string }) => (
        <div className={`relative shrink-0 overflow-hidden bg-gray-200 shadow-sm border border-gray-100 group cursor-pointer ${className}`}>
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:bg-black/10 transition-colors">
                <span className="opacity-0 group-hover:opacity-100 text-[10px] font-medium text-white">Edit</span>
            </div>
            {/* If we had a real image URL in item.data.image, we'd show it here. For now, it's a placeholder. */}
            {item.data.image ? (
                <img src={item.data.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <svg className="w-1/2 h-1/2 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                </div>
            )}
        </div>
    );

    if (variant === 'sidebar') {
        return (
            <div className="flex flex-col items-center text-center text-white mb-8">
                <Avatar className="w-32 h-32 rounded-full border-4 border-white/20 mb-4" />

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
                    <ContactItem icon={Mail} field="email" placeholder="Email" className="text-white/90" />
                    <ContactItem icon={Phone} field="phone" placeholder="Phone" className="text-white/90" />
                    <ContactItem icon={MapPin} field="location" placeholder="Location" className="text-white/90" />
                    <ContactItem icon={Linkedin} field="linkedin" placeholder="LinkedIn" className="text-white/90" />
                    <ContactItem icon={Globe} field="website" placeholder="Website" className="text-white/90" />
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="border-b border-gray-300 pb-2 mb-4">
                <div className="flex items-center gap-4 mb-2">
                    <Avatar className="w-12 h-12 rounded bg-gray-100" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-4">
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="name"
                                value={item.data.name || ''}
                                className="text-2xl font-bold uppercase text-gray-900"
                                placeholder="Your Name"
                            />
                            <EditableText
                                sectionId={section.id}
                                itemId={item.id}
                                field="role"
                                value={item.data.role || ''}
                                className="text-sm font-bold uppercase text-gray-500 flex-1"
                                placeholder="Role"
                                style={{ color: accentColor }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 font-medium">
                    <ContactItem field="email" placeholder="email@example.com" />
                    <span className="text-gray-300">|</span>
                    <ContactItem field="phone" placeholder="+1 234 567 890" />
                    <span className="text-gray-300">|</span>
                    <ContactItem field="location" placeholder="City, Country" />
                    <span className="text-gray-300">|</span>
                    <ContactItem field="linkedin" placeholder="LinkedIn" />
                </div>
            </div>
        );
    }

    if (variant === 'simple') {
        return (
            <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-6">
                    <Avatar className="w-24 h-24 rounded-lg bg-gray-100" />
                    <div className="flex-1">
                        <EditableText
                            sectionId={section.id}
                            itemId={item.id}
                            field="name"
                            value={item.data.name || ''}
                            className="text-3xl font-bold text-gray-900 mb-1"
                            placeholder="Your Name"
                        />
                        <EditableText
                            sectionId={section.id}
                            itemId={item.id}
                            field="role"
                            value={item.data.role || ''}
                            className="text-lg text-gray-600 mb-3"
                            placeholder="Role"
                        />
                        <div className="flex flex-col gap-1 text-sm text-gray-500">
                            <ContactItem field="email" placeholder="Email" />
                            <ContactItem field="phone" placeholder="Phone" />
                            <ContactItem field="location" placeholder="Location" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'centered') {
        return (
            <div className="flex flex-col items-center text-center pb-6 mb-6">
                <Avatar className="w-28 h-28 rounded-full border-4 border-gray-50 mb-4 shadow" />

                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="name"
                    value={item.data.name || ''}
                    className="text-4xl font-bold text-gray-800 mb-2"
                    placeholder="Your Name"
                    style={{ color: accentColor }}
                />
                <div className="w-24 h-1 bg-gray-200 mb-4"></div>

                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="role"
                    value={item.data.role || ''}
                    className="text-lg font-medium text-gray-600 uppercase tracking-widest mb-4"
                    placeholder="CURRENT ROLE"
                />

                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                    <ContactItem icon={Mail} field="email" placeholder="Email" />
                    <ContactItem icon={Phone} field="phone" placeholder="Phone" />
                    <ContactItem icon={MapPin} field="location" placeholder="Location" />
                </div>
            </div>
        );
    }

    if (variant === 'classic') {
        return (
            <div className="flex flex-col items-center text-center border-b border-gray-300 pb-6 mb-6">
                {/* Optional Avatar for Classic - unobtrusive */}
                <div className="mb-4 hidden group-hover/section:block empty:hidden">
                    <Avatar className="w-20 h-20 rounded-full border border-gray-300" />
                </div>

                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="name"
                    value={item.data.name || ''}
                    className="text-3xl text-gray-800"
                    placeholder="Your Name"
                />
                <EditableText
                    sectionId={section.id}
                    itemId={item.id}
                    field="role"
                    value={item.data.role || ''}
                    className="text-sm font-bold uppercase tracking-widest mt-2 mb-4"
                    placeholder="CURRENT ROLE"
                    style={{ color: accentColor }}
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
            <div className="flex gap-6">
                <Avatar className="w-24 h-24 rounded-lg shadow-sm" />
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
                        className="text-xl font-medium mt-1"
                        placeholder="Current Role"
                        style={{ color: accentColor }}
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

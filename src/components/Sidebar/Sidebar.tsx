import { LayoutTemplate, Upload, FolderOpen, Columns } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

const TABS = [
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'layout', icon: Columns, label: 'Layout' },
    { id: 'uploads', icon: Upload, label: 'Uploads' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
];

export const Sidebar = () => {
    const { activeTab, setActiveTab } = useStore();

    return (
        <div className="w-[72px] bg-[#0e1318] flex flex-col items-center py-4 gap-4 h-full text-gray-400 z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                        "flex flex-col items-center gap-1 p-2 w-full transition-colors relative group mx-2 rounded-lg",
                        activeTab === tab.id ? "text-white bg-gray-800/50" : "hover:text-gray-100 hover:bg-gray-800/30"
                    )}
                >
                    <div className={clsx(
                        "absolute left-1 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-white transition-all duration-300",
                        activeTab === tab.id ? "opacity-100" : "opacity-0"
                    )} />
                    <tab.icon size={24} />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

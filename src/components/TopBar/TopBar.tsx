import { ArrowLeft, Download } from 'lucide-react';
import { useState } from 'react';

export const TopBar = () => {
    const [designTitle, setDesignTitle] = useState('Untitled Design');

    return (
        <div className="h-14 bg-gradient-to-r from-[#00c4cc] to-[#3d2b9d] px-4 flex items-center justify-between text-white shrink-0 shadow-lg relative z-50">
            {/* Left Section - Navigation & Title */}
            <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Home</span>
                </button>

                <div className="h-6 w-px bg-white/20"></div>

                <div className="flex items-center gap-2 text-sm text-white/80">
                    <span className="font-medium hover:text-white cursor-pointer px-2 py-1 hover:bg-white/10 rounded transition-colors">File</span>
                </div>
            </div>

            {/* Center Section - Title */}
            <div className="font-semibold text-sm tracking-wide flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
                <input
                    type="text"
                    value={designTitle}
                    onChange={(e) => setDesignTitle(e.target.value)}
                    className="bg-transparent text-white border-none focus:ring-0 text-center font-semibold placeholder-white/70 w-40"
                    placeholder="Untitled Design"
                />
            </div>

            {/* Right Section - User & Actions */}
            <div className="flex items-center gap-3">
                <button
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm backdrop-blur-sm border border-white/20"
                >
                    <Download size={16} />
                    <span>Download</span>
                </button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 border-2 border-white cursor-pointer hover:scale-105 transition-transform shadow-md"></div>
            </div>
        </div>
    );
};

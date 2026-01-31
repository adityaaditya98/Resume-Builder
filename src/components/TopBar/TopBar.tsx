import { Download, File, Undo, Redo, Save, Upload, RotateCcw } from 'lucide-react';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useExport } from '../../hooks/useExport';
import { useRef } from 'react';

export const TopBar = () => {
    const { undo, redo, past, future } = useLayoutStore();
    const resume = useLayoutStore(state => state.resume);
    const setResume = useLayoutStore(state => state.setResume);
    const { exportToPDF, isExporting } = useExport(); // Added: Get from hook
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${resume.name || 'resume'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.id && json.sections) {
                    setResume(json);
                } else {
                    alert('Invalid resume file format');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Error loading file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-14 bg-[#1e1e2e] border-b border-gray-800 flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md text-gray-300 transition-colors text-sm font-medium">
                        <File size={16} />
                        <span>File</span>
                    </button>
                    <div className="h-4 w-px bg-gray-700" />
                    <button
                        onClick={undo}
                        disabled={past.length === 0}
                        className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 disabled:opacity-50 transition-colors"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={16} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={future.length === 0}
                        className="p-1.5 hover:bg-white/10 rounded-md text-gray-300 disabled:opacity-50 transition-colors"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={16} />
                    </button>

                    <div className="h-4 w-px bg-gray-700 mx-2" />

                    {/* Persistence Controls */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md text-gray-300 transition-colors text-sm font-medium"
                        title="Load JSON"
                    >
                        <Upload size={16} />
                        {/* <span>Load</span> */}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLoad}
                        accept=".json"
                        className="hidden"
                    />

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md text-gray-300 transition-colors text-sm font-medium"
                        title="Save JSON"
                    >
                        <Save size={16} />
                        {/* <span>Save</span> */}
                    </button>
                </div>
            </div>

            {/* Title / Status */}


            <div className="flex items-center gap-3">
                <button
                    onClick={() => exportToPDF(resume.name || 'resume')}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-lg shadow-blue-500/20 font-medium text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isExporting ? <RotateCcw className="animate-spin" size={16} /> : <Download size={16} />}
                    <span>Export</span>
                </button>
            </div>
        </div>
    );
};

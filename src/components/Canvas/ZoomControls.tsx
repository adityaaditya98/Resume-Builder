import { Minus, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ZoomControls = () => {
    const { zoom, setZoom } = useStore();

    const handleZoomIn = () => {
        setZoom(Math.min(zoom + 0.1, 3));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(zoom - 0.1, 0.1));
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoom(parseFloat(e.target.value));
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Zoom Out"
            >
                <Minus size={16} className="text-gray-600" />
            </button>

            <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={handleRangeChange}
                className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />

            <span className="text-xs font-medium text-gray-600 w-12 text-center">
                {Math.round(zoom * 100)}%
            </span>

            <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Zoom In"
            >
                <Plus size={16} className="text-gray-600" />
            </button>
        </div>
    );
};

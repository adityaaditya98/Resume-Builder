import { Copy, Trash2, ArrowUp, ArrowDown, Layers, Clipboard } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
}

export const ContextMenu = ({ x, y, onClose }: ContextMenuProps) => {
    const {
        selectedIds,
        copy,
        paste,
        duplicate,
        removeElements,
        bringForward,
        sendBackward,
        group,
        ungroup
    } = useStore();

    const hasSelection = selectedIds.size > 0;

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-56 transform -translate-y-0"
            style={{ left: x, top: y }}
            onMouseLeave={onClose}
        >
            {hasSelection ? (
                <>
                    <button
                        onClick={() => handleAction(duplicate)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                        <Copy size={14} />
                        <span>Duplicate</span>
                        <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
                    </button>
                    <button
                        onClick={() => handleAction(() => copy())}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                        <Copy size={14} />
                        <span>Copy</span>
                        <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
                    </button>

                    <div className="h-px bg-gray-100 my-1" />

                    <button
                        onClick={() => handleAction(bringForward)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                        <ArrowUp size={14} />
                        <span>Bring Forward</span>
                        <span className="ml-auto text-xs text-gray-400">Ctrl+]</span>
                    </button>
                    <button
                        onClick={() => handleAction(sendBackward)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                        <ArrowDown size={14} />
                        <span>Send Backward</span>
                        <span className="ml-auto text-xs text-gray-400">Ctrl+[</span>
                    </button>

                    <div className="h-px bg-gray-100 my-1" />

                    <button
                        onClick={() => handleAction(selectedIds.size > 1 ? group : ungroup)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                    >
                        <Layers size={14} />
                        <span>{selectedIds.size > 1 ? 'Group' : 'Ungroup'}</span>
                        <span className="ml-auto text-xs text-gray-400">Ctrl+G</span>
                    </button>

                    <div className="h-px bg-gray-100 my-1" />

                    <button
                        onClick={() => handleAction(() => removeElements(Array.from(selectedIds)))}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                    >
                        <Trash2 size={14} />
                        <span>Delete</span>
                        <span className="ml-auto text-xs text-red-400">Del</span>
                    </button>
                </>
            ) : (
                <button
                    onClick={() => handleAction(paste)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                >
                    <Clipboard size={14} />
                    <span>Paste</span>
                    <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
                </button>
            )}
        </div>
    );
};

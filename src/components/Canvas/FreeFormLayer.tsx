import { useStore } from '../../store/useStore';
import { FreeFormObject } from './FreeFormObject';

interface FreeFormLayerProps {
    pageIndex: number;
}

export const FreeFormLayer = ({ pageIndex }: FreeFormLayerProps) => {
    const elements = useStore(state => state.elements);
    const selectedIds = useStore(state => state.selectedIds);

    // Filter elements belonging to this page
    // If an element doesn't have pageIndex defined (legacy), defaulting to page 0 makes sense or ignoring it.
    // Let's assume undefined = page 0 for now to support existing elements if any.
    const pageElements = elements.filter(el => (el.pageIndex ?? 0) === pageIndex);

    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 50 }} // Above text but below potential modals
        >
            {pageElements.map(el => (
                <FreeFormObject
                    key={el.id}
                    element={el}
                    isSelected={selectedIds.has(el.id)}
                />
            ))}
        </div>
    );
};

import type { ReactNode } from 'react';
import { useLayoutStore } from '../../store/useLayoutStore';

const A4_WIDTH_PX = 794; // A4 @ 96 DPI
const A4_HEIGHT_PX = 1123;

export const Page = ({ children, pageIndex, totalPages }: { children: ReactNode, pageIndex: number, totalPages: number }) => {
    const styles = useLayoutStore(state => state.resume.styles);

    // NOTE: Scale support temporarily removed until Store is updated

    const style = {
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        backgroundColor: styles.pageBackgroundColor || '#ffffff',
        transformOrigin: 'top center',
        marginBottom: '40px', // Spacing between pages
    };

    return (
        <div
            className="shadow-2xl relative flex overflow-hidden ring-1 ring-black/5"
            style={style}
            data-page={pageIndex}
        >
            {children}

            {/* Page Number Indicator */}
            <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 pointer-events-none font-medium">
                Page {pageIndex + 1} of {totalPages}
            </div>
        </div>
    );
};

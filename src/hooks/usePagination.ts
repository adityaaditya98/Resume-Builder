import { useMemo } from 'react';

const A4_HEIGHT_PX = 1123; // A4 @ 96 DPI
const PAGE_MARGIN_Y = 100; // Top + Bottom padding
const CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_MARGIN_Y;

export const usePagination = (
    columns: string[][],
    heights: Record<string, number>,
    sections: Record<string, any>
) => {
    return useMemo(() => {
        // We will return an array of pages.
        // Each page is an array of columns.
        // Each column is an array of section IDs.
        // structure: Page[][ColumnIndex][SectionID]

        const pages: string[][][] = [];

        // Safety: Ensure columns is valid
        const validColumns = (columns && columns.length > 0) ? columns : [[]]; // Default to 1 empty column

        // Initialize first page
        let currentPageIndex = 0;
        pages[currentPageIndex] = validColumns.map(() => []); // Create empty columns for page 0

        // Iterate through each column structure from the store
        validColumns.forEach((columnSections, colIdx) => {
            // For each column, we fill pages vertically
            // WARNING: Independent columns logic. 
            // In a newspaper layout, text flows Col 1 -> Col 2 -> Next Page.
            // In a resume, columns are usually strictly parallel (Left Sidebar / Main Content).
            // So Page 2 also has a Left Sidebar and Main Content.

            let currentPageForCol = 0;
            let currentHeight = 0;

            columnSections.forEach(sectionId => {
                // Skip hidden sections
                if (sections[sectionId] && !sections[sectionId].isVisible) return;

                const height = heights[sectionId] || 80; // Estimate 80px if unknown

                // If adding this section exceeds content height...
                if (currentHeight + height > CONTENT_HEIGHT && currentHeight > 0) {
                    // Overflow! Move to next page
                    currentPageForCol++;
                    currentHeight = 0;
                }

                // Ensure page exists
                if (!pages[currentPageForCol]) {
                    pages[currentPageForCol] = validColumns.map(() => []);
                }

                // Add to page
                pages[currentPageForCol][colIdx].push(sectionId);
                currentHeight += height;
            });
        });

        return pages;
    }, [columns, heights, sections]);
};

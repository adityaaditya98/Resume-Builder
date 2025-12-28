import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useStore } from '../store/useStore';

export const useExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const { clearSelection } = useStore();

    const _prepareCanvas = async () => {
        // Clear selection to remove blue outlines/resize handles
        clearSelection();
        // Wait for render cycle
        await new Promise(resolve => setTimeout(resolve, 100));
    };

    const exportToImage = useCallback(async (fileName: string = 'design', format: 'png' | 'jpeg' = 'png') => {
        const element = document.getElementById('canvas-content');
        if (!element) return;

        setIsExporting(true);
        await _prepareCanvas();

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // 2x resolution for good quality but manageable size
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
            });

            const link = document.createElement('a');
            link.download = `${fileName}.${format}`;
            link.href = canvas.toDataURL(`image/${format}`, 0.9);
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
        } finally {
            setIsExporting(false);
        }
    }, [clearSelection]);

    const exportToPDF = useCallback(async (fileName: string = 'design') => {
        // Find all pages
        const pages = Array.from(document.querySelectorAll('[data-page]')) as HTMLElement[];
        if (pages.length === 0) {
            console.error('No pages found to export');
            return;
        }

        setIsExporting(true);
        await _prepareCanvas();

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i];

                // Add new page for subsequent elements
                if (i > 0) {
                    pdf.addPage();
                }

                const canvas = await html2canvas(pageElement, {
                    scale: 2, // 2x is sufficient for most print needs (approx 192dpi)
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG for better compression/speed
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        } finally {
            setIsExporting(false);
        }
    }, [clearSelection]);

    return { exportToImage, exportToPDF, isExporting };
};

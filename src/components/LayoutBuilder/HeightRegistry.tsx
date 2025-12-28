import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface HeightRegistryContextType {
    heights: Record<string, number>;
    setHeight: (id: string, height: number) => void;
}

const HeightRegistryContext = createContext<HeightRegistryContextType | null>(null);

export const HeightRegistryProvider = ({ children }: { children: ReactNode }) => {
    const [heights, setHeights] = useState<Record<string, number>>({});

    const setHeight = useCallback((id: string, height: number) => {
        setHeights(prev => {
            if (prev[id] === height) return prev; // Avoid unnecessary re-renders
            return { ...prev, [id]: height };
        });
    }, []);

    return (
        <HeightRegistryContext.Provider value={{ heights, setHeight }}>
            {children}
        </HeightRegistryContext.Provider>
    );
};

export const useHeightRegistry = () => {
    const context = useContext(HeightRegistryContext);
    if (!context) {
        throw new Error('useHeightRegistry must be used within a HeightRegistryProvider');
    }
    return context;
};

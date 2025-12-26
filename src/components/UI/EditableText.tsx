import { useState, useEffect, useRef } from 'react';
import { useLayoutStore } from '../../store/useLayoutStore';
import clsx from 'clsx';

interface EditableTextProps {
    sectionId: string;
    itemId: string;
    field: string; // Key in the data object (e.g., 'role', 'company')
    value: string;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
}

export const EditableText = ({ sectionId, itemId, field, value, className, placeholder, multiline }: EditableTextProps) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const [localValue, setLocalValue] = useState(value);
    const elementRef = useRef<HTMLElement>(null);

    // Sync from store if external change happens (e.g. undo/redo or layout switch)
    useEffect(() => {
        setLocalValue(value);
        if (elementRef.current && elementRef.current.innerText !== value) {
            elementRef.current.innerText = value;
        }
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            updateSectionData(sectionId, itemId, { [field]: localValue });
        }
    };

    const handleInput = (e: React.FormEvent<HTMLElement>) => {
        setLocalValue(e.currentTarget.innerText);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            elementRef.current?.blur();
        }
    };

    // const Tag = multiline ? 'p' : 'h1'; // Conceptual logic only

    return (
        <div
            ref={elementRef as any}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={clsx(
                'outline-none focus:bg-blue-50/50 focus:ring-2 ring-blue-200 rounded px-1 -mx-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text',
                className
            )}
            data-placeholder={placeholder}
        >
            {value}
        </div>
    );
};

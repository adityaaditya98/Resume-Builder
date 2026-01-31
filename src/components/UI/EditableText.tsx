import { useState, useLayoutEffect, useRef } from 'react';
import { useLayoutStore } from '../../store/useLayoutStore';
import { MagicWriter } from '../AI/MagicWriter';
import clsx from 'clsx';

interface EditableTextProps {
    sectionId: string;
    itemId: string;
    field: string; // Key in the data object (e.g., 'role', 'company')
    value: string;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    style?: React.CSSProperties;
}

export const EditableText = ({ sectionId, itemId, field, value, className, placeholder, multiline, style }: EditableTextProps) => {
    const updateSectionData = useLayoutStore(state => state.updateSectionData);
    const [localValue, setLocalValue] = useState(value);
    const elementRef = useRef<HTMLDivElement>(null);
    // Sync from store if external change happens (e.g. undo/redo or layout switch)
    // We explicitly disable the exhaustive-deps rule here because we ONLY want to run this 
    // when 'value' (prop) changes, not when 'localValue' changes (which would revert user typing).
    useLayoutEffect(() => {
        if (value !== localValue) {
            setLocalValue(value);
        }
        if (elementRef.current && elementRef.current.innerText !== value) {
            elementRef.current.innerText = value;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            updateSectionData(sectionId, itemId, { [field]: localValue });
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
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
        <div className={clsx("relative group", className)} style={style}>
            <div
                ref={elementRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBlur}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="outline-none focus:bg-blue-50/50 focus:ring-2 ring-blue-200 rounded px-1 -mx-1 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 cursor-text w-full break-words whitespace-pre-wrap"
                data-placeholder={placeholder}
            >
                {/* Initial render only, subsequent updates handled by ref/state to avoid cursor jumps in React contentEditable */}
                {value}
            </div>

            {/* AI Magic Writer Trigger */}
            <div className="absolute top-0 right-0 h-full flex items-center -mr-8 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                <MagicWriter
                    currentText={localValue}
                    onUpdate={(newText) => {
                        setLocalValue(newText);
                        if (elementRef.current) elementRef.current.innerText = newText;
                        updateSectionData(sectionId, itemId, { [field]: newText });
                    }}
                />
            </div>
        </div>
    );
};

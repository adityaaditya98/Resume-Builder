import { useState, useEffect } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateText, checkLocalAI } from '../../services/ai';

interface MagicWriterProps {
    currentText: string;
    onUpdate: (newText: string) => void;
}

export const MagicWriter = ({ currentText, onUpdate }: MagicWriterProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAvailability = () => {
        checkLocalAI().then(available => {
            setIsAvailable(available);
            if (available) {
                setError(null);
            } else {
                // specific user request: "if ai is not working i should get popup"
                // We might not want to spam this on load, but let's add a small toast or log.
                // Actually, user said "if ai is not working i should get popup". 
                // Doing it on interaction is safer to avoid annoyance, but let's keep the error state clear.
            }
        });
    };

    useEffect(() => {
        checkAvailability();
    }, []);

    const handleAction = async (action: string) => {
        setIsLoading(true);
        setError(null);
        try {
            let prompt = '';
            switch (action) {
                case 'grammar':
                    prompt = `Fix the grammar and spelling of the following text, keeping the same meaning and tone: "${currentText}"`;
                    break;
                case 'professional':
                    prompt = `Rewrite the following text to sound more professional and concise for a resume: "${currentText}"`;
                    break;
                case 'expand':
                    prompt = `Expand on the following text to provide more detail and impact for a resume: "${currentText}"`;
                    break;
                case 'shorten':
                    prompt = `Shorten the following text to be more concise for a resume: "${currentText}"`;
                    break;
            }

            const result = await generateText(prompt);
            onUpdate(result.replace(/^"/, '').replace(/"$/, '').trim()); // Cleanup quotes
            setIsOpen(false);
        } catch (err) {
            console.error(err);
            const errorMessage = 'Connection failed. Please ensure Ollama is running locally.';
            setError(errorMessage);
            alert(errorMessage); // Popup notification as requested
            setIsAvailable(false); // Assume down if failed
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAvailable && !isLoading) {
        // Optional: Hide if not available or show tooltip
        //  return null; 
    }

    return (
        <div className="absolute top-0 right-0 transform translate-x-full ml-2 z-50">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center"
                    title="Magic Writer (AI)"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                            <Sparkles size={12} className="text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">Magic Writer</span>
                        </div>

                        {error && (
                            <div className="p-2 text-xs text-red-500 bg-red-50">
                                {error}
                            </div>
                        )}

                        <div className="p-1">
                            <button onClick={() => handleAction('grammar')} className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded text-gray-700 flex items-center gap-2">
                                <span>Fix Grammar</span>
                            </button>
                            <button onClick={() => handleAction('professional')} className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded text-gray-700 flex items-center gap-2">
                                <span>Make Professional</span>
                            </button>
                            <button onClick={() => handleAction('expand')} className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded text-gray-700 flex items-center gap-2">
                                <span>Expand</span>
                            </button>
                            <button onClick={() => handleAction('shorten')} className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 rounded text-gray-700 flex items-center gap-2">
                                <span>Shorten</span>
                            </button>
                        </div>

                        {!isAvailable && (
                            <div className="p-2 text-[10px] text-gray-400 text-center border-t border-gray-100 flex flex-col gap-2">
                                <span>Local AI not detected. <br />Ensure Ollama is running.</span>
                                <button
                                    onClick={checkAvailability}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 font-medium transition-colors"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

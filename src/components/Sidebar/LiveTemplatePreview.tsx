import type { ResumeTemplate } from '../../data/resumeTemplates';

export const LiveTemplatePreview = ({ template }: { template: ResumeTemplate }) => {
    const { styles, settings } = template;
    const { columns, columnRatio = 30 } = settings;
    const {
        fontFamily,
        baseFontSize = 10,
        accentColor,
        pageBackgroundColor,
        sidebarBackgroundColor,
        sectionTitleAlign = 'left',
        sectionTitleStyle = 'simple',
        sectionTitleCase = 'uppercase',
    } = styles;

    const scale = 0.25; // 25% scale

    // Scaled style helper
    const getTitleStyle = () => {
        const base: React.CSSProperties = {
            color: accentColor,
            textAlign: sectionTitleAlign,
            textTransform: sectionTitleCase,
            fontFamily,
            fontSize: `${(baseFontSize + 2) * scale}px`,
            fontWeight: 'bold',
            marginBottom: '4px'
        };

        if (sectionTitleStyle === 'background') {
            base.backgroundColor = accentColor;
            base.color = '#fff';
            base.padding = '1px 3px';
        } else if (sectionTitleStyle === 'underline') {
            base.borderBottom = `1px solid ${accentColor}`;
            base.width = '100%';
        } else if (sectionTitleStyle === 'left-border') {
            base.borderLeft = `2px solid ${accentColor}`;
            base.paddingLeft = '3px';
        } else if (sectionTitleStyle === 'box') {
            base.border = `1px solid ${accentColor}`;
            base.padding = '1px 3px';
            base.display = 'inline-block';
        }
        return base;
    };

    const SkeletonSection = ({ title, lines = 2 }: { title: string, lines?: number }) => (
        <div className="mb-2" style={{ fontFamily }}>
            <div style={getTitleStyle()}>{title}</div>
            <div className="space-y-0.5">
                {Array.from({ length: lines }).map((_, i) => (
                    <div key={i} className="h-0.5 bg-gray-300 rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                ))}
            </div>
        </div>
    );

    return (
        <div
            className="relative bg-white shadow-sm overflow-hidden select-none"
            style={{
                width: '100%',
                paddingBottom: '141.4%',
                backgroundColor: pageBackgroundColor
            }}
        >
            <div className="absolute inset-0 flex">
                {columns === 1 ? (
                    <div className="w-full h-full p-2 flex flex-col gap-1">
                        <div className="mb-2 text-center" style={{ fontFamily }}>
                            <div className="h-2 w-1/2 bg-gray-800 mx-auto mb-1" style={{ backgroundColor: accentColor }}></div>
                            <div className="h-1 w-1/3 bg-gray-400 mx-auto"></div>
                        </div>
                        <SkeletonSection title="Summary" lines={3} />
                        <SkeletonSection title="Experience" lines={5} />
                        <SkeletonSection title="Education" lines={2} />
                    </div>
                ) : (
                    <>
                        <div
                            className="h-full p-2 flex flex-col gap-2"
                            style={{
                                width: `${columnRatio}%`,
                                backgroundColor: sidebarBackgroundColor || 'transparent'
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-300 mx-auto mb-1"></div>
                            <div className="h-1 w-3/4 bg-gray-400 mx-auto"></div>

                            <div className="mt-2">
                                <SkeletonSection title="Contact" lines={2} />
                                <SkeletonSection title="Skills" lines={4} />
                            </div>
                        </div>

                        <div className="h-full p-2 flex-1 flex flex-col gap-2">
                            <div className="h-3 w-3/4 bg-gray-800 mb-2"></div>
                            <SkeletonSection title="Experience" lines={6} />
                            <SkeletonSection title="Projects" lines={3} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

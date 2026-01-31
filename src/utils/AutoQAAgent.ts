import { useLayoutStore } from '../store/useLayoutStore';

export type BugSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface BugReport {
    id: string;
    severity: BugSeverity;
    module: string;
    scenario: string;
    steps: string[];
    expected: string;
    actual: string;
    rootCause: string;
    fix: string;
}

export class AutoQAAgent {
    private bugs: BugReport[] = [];
    private layoutStore = useLayoutStore.getState();

    // Reporting Helper
    private report(bug: Omit<BugReport, 'id'>) {
        const id = `BUG-${this.bugs.length + 1}`.padStart(6, '0');
        const report = { id, ...bug };
        this.bugs.push(report);
        console.error(`[QA AGENT] Found Bug ${id}:`, report);
    }

    public getBugs() {
        return this.bugs;
    }

    public async runFullDismissal() {
        console.log('🤖 AutoQA Agent: Starting full system audit...');
        this.bugs = [];

        try {
            await this.testDataIntegrity();
            await this.testTemplateSwitching();
            await this.testPaginationOverflow(); // The big one
            await this.testUndoRedo();
        } catch (e) {
            console.error('QA Agent crashed:', e);
        }

        console.log(`🤖 Audit Complete. Found ${this.bugs.length} bugs.`);
        return this.bugs;
    }

    // SCENARIO 1: Data Integrity & Layout Sync
    private async testDataIntegrity() {
        console.log('Test: Data Integrity');
        const initialName = this.layoutStore.resume.name;

        // Action: Rename
        useLayoutStore.getState().setResume({ ...this.layoutStore.resume, name: 'QA Test Resume' });

        // Verify
        if (useLayoutStore.getState().resume.name !== 'QA Test Resume') {
            this.report({
                severity: 'Critical',
                module: 'State Management',
                scenario: 'Basic State Update',
                steps: ['updateResume({ name: "QA Test Resume" })'],
                expected: 'Name should be "QA Test Resume"',
                actual: `Name is "${useLayoutStore.getState().resume.name}"`,
                rootCause: 'Store update failed or was immutable',
                fix: 'Check zustand set logic'
            });
        }

        // Cleanup
        useLayoutStore.getState().setResume({ ...this.layoutStore.resume, name: initialName });
    }

    // SCENARIO 2: Pagination Overflow Logic
    private async testPaginationOverflow() {
        console.log('Test: Pagination Overflow');

        // We know the current implementation DOES NOT split sections.
        // If we add a section that is 1500px tall (bigger than A4 1123px), it should fail or handle it gracefully.

        useLayoutStore.getState().addSection('custom', 'Huge Block');

        // Mock the height registry? 
        // We can't easily mock the internal height registry from here without exposing it.
        // However, we can analyze the logic we know exists in `usePagination`.

        // LOGIC CHECK:
        // Current usePagination.ts:
        // if (currentHeight + height > CONTENT_HEIGHT) { currentPage++ }
        // It moves the section to next page.
        // Validation: What if height > CONTENT_HEIGHT?
        // It will be placed on new page, but it will overflow that page too.

        this.report({
            severity: 'High',
            module: 'Pagination Engine',
            scenario: 'Large Section Overflow',
            steps: ['Add section with height > 1100px'],
            expected: 'Section should split across pages OR warn user',
            actual: 'Section moves to next page and visually overflows indefinitely',
            rootCause: 'usePagination.ts does not implement intra-section splitting',
            fix: 'Implement sub-item splitting for Experience/Education or generic text splitting'
        });
    }

    // SCENARIO 3: Template Switching & Identity
    private async testTemplateSwitching() {
        console.log('Test: Template Switching');

        // Switch to Sidebar
        useLayoutStore.getState().applyTemplateLayout('sidebar');
        const columns = useLayoutStore.getState().resume.layout.columns;

        if (columns.length !== 2) {
            this.report({
                severity: 'Critical',
                module: 'Layout Engine',
                scenario: 'Switch to Sidebar Layout',
                steps: ['applyTemplateLayout("sidebar")'],
                expected: 'Columns length should be 2',
                actual: `Columns length is ${columns.length}`,
                rootCause: 'applyTemplateLayout logic failed to create 2 columns',
                fix: 'Check StructureToColumns mapping and set logic'
            });
        }

        // Validation: Verify Sidebar Content Distribution
        // "header" should be in col 0
        const headerLocation = columns[0].includes('header');
        if (!headerLocation) {
            this.report({
                severity: 'Medium',
                module: 'Layout Engine',
                scenario: 'Content Reflow',
                steps: ['applyTemplateLayout("sidebar")'],
                expected: 'Header section should be in Column 0 (Sidebar)',
                actual: 'Header is not in Column 0',
                rootCause: 'Reflow logic did not identify "header" correctly or ID mismatch',
                fix: 'Ensure section.type check matches "header"'
            });
        }
    }

    // SCENARIO 4: Undo/Redo
    private async testUndoRedo() {
        console.log('Test: Undo/Redo');
        const initialPast = useLayoutStore.getState().past.length;

        // Action: Change something
        useLayoutStore.getState().addSection('custom', 'Undo Check');

        if (useLayoutStore.getState().past.length <= initialPast) {
            this.report({
                severity: 'High',
                module: 'History Engine',
                scenario: 'Action Tracking',
                steps: ['addSection()'],
                expected: 'Past history stack should increase by 1',
                actual: 'History stack size unchanged',
                rootCause: 'Action did not push to history state',
                fix: 'Add past: [...state.past, state.resume] to addSection'
            });
        }
    }
}

// Expose on window for easy access
(window as any).QA_Agent = new AutoQAAgent();

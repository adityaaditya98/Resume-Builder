import { Sidebar } from '../Sidebar/Sidebar';
import { SidePanel } from '../Sidebar/SidePanel';
import { TopBar } from '../TopBar/TopBar';
import { Workspace } from '../Workspace/Workspace';
import { Toolbar } from '../Toolbar/Toolbar';

export const EditorLayout = () => {
    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-black">
            <TopBar />
            <Toolbar />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <SidePanel />
                <Workspace />
            </div>
        </div>
    );
};

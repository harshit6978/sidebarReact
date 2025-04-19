import { LayoutDashboard, Home, StickyNote, Layers, Flag, Calendar, LifeBuoy, Settings } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar"
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expanse from "./pages/Expanse";

function App() {

  return (
    <>
      <div className="flex">
        <Sidebar>
          <SidebarItem icon={<Home size={20} />} text="Dashboard" to="/" />
          {/* <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/dashboard" active /> */}
          <SidebarItem icon={<StickyNote size={20} />} text="Expanse" to="/expanse" />
          <SidebarItem icon={<Calendar size={20} />} text="Calendar" to="/calendar" />
          <SidebarItem icon={<Layers size={20} />} text="Tasks" to="/tasks" />
          <SidebarItem icon={<Flag size={20} />} text="Reporting" to="/reporting" />
          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20} />} text="Settings" to="/settings" />
          <SidebarItem icon={<LifeBuoy size={20} />} text="Help" to="/help" />
        </Sidebar>
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expanse" element={<Expanse />} />
            {/* other routes */}
          </Routes>
          </div>
      </div>
    </>
  )
}

export default App

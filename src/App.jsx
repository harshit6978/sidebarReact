import { LayoutDashboard, Home, StickyNote, Layers, Flag, Calendar, LifeBuoy, Settings } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expanse from "./pages/Expanse";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Login from "./auth/Login";
import Register from "./auth/Register";

function App() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setAuthChecked(true);
      // navigate(user ? "/d" : "/");
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  if (!authChecked) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className="flex">
      {isLoggedIn && (
        <Sidebar>
          <SidebarItem icon={<Home size={20} />} text="Dashboard" to="/d" />
          <SidebarItem icon={<StickyNote size={20} />} text="Expanse" to="/expanse" />
          <SidebarItem icon={<Calendar size={20} />} text="Calendar" to="/calendar" />
          <SidebarItem icon={<Layers size={20} />} text="Tasks" to="/tasks" />
          <SidebarItem icon={<Flag size={20} />} text="Reporting" to="/reporting" />
          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20} />} text="Settings" to="/settings" />
          <SidebarItem icon={<LifeBuoy size={20} />} text="Help" to="/help" />
        </Sidebar>
      )}


      <div className="flex-1 p-4">
        <Routes>
          {!isLoggedIn &&
            <> <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          }
          {isLoggedIn && (
            <>
              <Route path="/d" element={<Dashboard />} />
              <Route path="/expanse" element={<Expanse />} />
              {/* You can add other authenticated routes here */}
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;

import { Navigate, Outlet, useLocation } from "react-router";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import useAuthStore from "./store/useAuthStore";
import { useEffect, useState } from "react";
import { cn } from "./lib/utils";
import AdminAccess from "./components/AdminAccess";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { isAuthenticated, checkIsAdmin, restoreAuth, isRestoring } = useAuthStore();

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  if (isRestoring) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  const isAdmin = checkIsAdmin()
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if(!isAdmin){
    return <AdminAccess />
  }
  if(isAdmin && location.pathname === '/'){
    return <Navigate to={'/dashboard'} />
  }
  return (
    <div className="h-screen flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div
        className={cn(
          "flex-1 flex flex-col max-w-[--breakpoint-2xl]",
          sidebarOpen ? "md:ml-64" : "md:ml-20",
        )}
      >
        <Header />
        <main className="mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;

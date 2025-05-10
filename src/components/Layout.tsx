
import { Outlet } from "react-router-dom";
import BottomNavbar from "./BottomNavbar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 pt-6 relative">
        <div className="text-center text-xs text-muted-foreground mb-2">
          Prayer Times for Espoo, Finland
        </div>
        <Outlet />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Layout;

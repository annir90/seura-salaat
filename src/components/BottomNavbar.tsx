
import { NavLink } from "react-router-dom";
import { Home, Compass, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavbar = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Qibla", path: "/qibla" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container max-w-md mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-prayer-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;

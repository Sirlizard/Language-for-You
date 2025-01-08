import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, Upload } from "lucide-react";

export const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-white border-b mb-8">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Button 
              variant={isActive("/") ? "default" : "ghost"}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/submit-job">
              <Button 
                variant={isActive("/submit-job") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Submit Job
              </Button>
            </Link>
            <Link to="/profile">
              <Button 
                variant={isActive("/profile") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
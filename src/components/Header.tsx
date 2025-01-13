import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, Upload, Briefcase, Clock, History, Crown, MessageSquare } from "lucide-react";

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
            <Link to="/view-jobs">
              <Button 
                variant={isActive("/view-jobs") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                View Jobs
              </Button>
            </Link>
            <Link to="/working-jobs">
              <Button 
                variant={isActive("/working-jobs") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Working Jobs
              </Button>
            </Link>
            <Link to="/history">
              <Button 
                variant={isActive("/history") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
            <Link to="/premium-translation">
              <Button 
                variant={isActive("/premium-translation") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Premium Translation
              </Button>
            </Link>
            <Link to="/ai-helper">
              <Button 
                variant={isActive("/ai-helper") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                AI Helper
              </Button>
            </Link>
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
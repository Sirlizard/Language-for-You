import { Card } from "@/components/ui/card";
import { FileUp, Star, Clock } from "lucide-react";

export function Dashboard() {
  return (
    <div className="p-8 font-cambria animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Welcome back</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <FileUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold">4.8</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Projects</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <p className="font-medium">Project Update</p>
                  <p className="text-sm text-muted-foreground">Translation completed for Project #{i}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Top Localizers</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Localizer #{i}</p>
                    <p className="text-sm text-muted-foreground">98% satisfaction rate</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span>4.9</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
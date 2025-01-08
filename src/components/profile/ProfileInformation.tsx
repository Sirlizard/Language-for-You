import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { ProfileData } from "./types";

interface ProfileInformationProps {
  profile: ProfileData | null;
  onProfileUpdate: () => void;
}

export const ProfileInformation = ({ profile, onProfileUpdate }: ProfileInformationProps) => {
  const [newUsername, setNewUsername] = useState(profile?.username || "");
  const { toast } = useToast();

  const updateUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Username updated successfully",
      });
      
      onProfileUpdate();
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex gap-2">
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username"
            />
            <Button onClick={updateUsername}>Save</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rating</Label>
          <p className="text-2xl font-bold">{profile?.rating || 0}</p>
        </div>
      </CardContent>
    </Card>
  );
};
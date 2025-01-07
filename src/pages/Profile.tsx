import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

type ProfileData = {
  username: string | null;
  languages: string[] | null;
  rating: number | null;
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, languages, rating")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setNewUsername(data.username || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

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
      
      fetchProfile();
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: "Failed to update username",
        variant: "destructive",
      });
    }
  };

  const addLanguage = async () => {
    if (!newLanguage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentLanguages = profile?.languages || [];
      if (currentLanguages.includes(newLanguage)) {
        toast({
          title: "Error",
          description: "Language already added",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          languages: [...currentLanguages, newLanguage],
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Language added successfully",
      });
      
      setNewLanguage("");
      fetchProfile();
    } catch (error) {
      console.error("Error adding language:", error);
      toast({
        title: "Error",
        description: "Failed to add language",
        variant: "destructive",
      });
    }
  };

  const removeLanguage = async (language: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentLanguages = profile?.languages || [];
      const updatedLanguages = currentLanguages.filter(lang => lang !== language);

      const { error } = await supabase
        .from("profiles")
        .update({
          languages: updatedLanguages,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Language removed successfully",
      });
      
      fetchProfile();
    } catch (error) {
      console.error("Error removing language:", error);
      toast({
        title: "Error",
        description: "Failed to remove language",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gray-100 p-4 rounded-full">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-cambria font-bold">Profile</h1>
          <p className="text-gray-500">Manage your profile settings</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language"
              />
              <Button onClick={addLanguage}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.languages?.map((language) => (
                <Badge
                  key={language}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeLanguage(language)}
                >
                  {language} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
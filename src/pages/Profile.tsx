import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInformation } from "@/components/profile/ProfileInformation";
import { LanguageManager } from "@/components/profile/LanguageManager";
import type { ProfileData } from "@/components/profile/types";

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProfileHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInformation profile={profile} onProfileUpdate={fetchProfile} />
        <LanguageManager profile={profile} onProfileUpdate={fetchProfile} />
      </div>
    </div>
  );
};

export default Profile;
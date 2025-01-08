import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileData } from "./types";

interface ProfileHeaderProps {
  profile: ProfileData | null;
  onProfileUpdate: () => void;
}

export const ProfileHeader = ({ profile, onProfileUpdate }: ProfileHeaderProps) => {
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload to storage
      const filePath = `${user.id}/${crypto.randomUUID()}`;
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
      
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="relative group">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          Change
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <h1 className="text-2xl font-cambria font-bold">
          Hello, {profile?.username || 'User'}
        </h1>
        <p className="text-gray-500">Manage your profile settings</p>
      </div>
    </div>
  );
};
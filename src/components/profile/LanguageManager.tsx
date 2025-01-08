import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfileData } from "./types";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];

interface LanguageManagerProps {
  profile: ProfileData | null;
  onProfileUpdate: () => void;
}

export const LanguageManager = ({ profile, onProfileUpdate }: LanguageManagerProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const { toast } = useToast();

  const addLanguage = async (language: string) => {
    if (!language) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentLanguages = profile?.languages || [];
      if (currentLanguages.includes(language)) {
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
          languages: [...currentLanguages, language],
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Language added successfully",
      });
      
      setSelectedLanguage("");
      onProfileUpdate();
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
      
      onProfileUpdate();
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
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => addLanguage(selectedLanguage)}>Add</Button>
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
  );
};
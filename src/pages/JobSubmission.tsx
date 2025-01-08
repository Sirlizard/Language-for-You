import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp, DollarSign, MessageSquare, Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const languages = [
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

const getRandomPrice = (language: string) => {
  const basePrice = Math.floor(Math.random() * 900) + 100;
  return basePrice.toFixed(2);
};

export default function JobSubmission() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [price, setPrice] = useState<string>("0.00");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    setPrice(getRandomPrice(value));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('shared_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('shared_files')
        .insert({
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          file_size: file.size,
          notes: note,
          uploader_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Job submitted successfully",
      });

      navigate("/");
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to submit job",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-8 font-cambria animate-fade-in">
        <h1 className="text-4xl font-bold mb-8">Submit a Job</h1>
        
        <Card className="max-w-2xl mx-auto p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Target Language
              </Label>
              <Select onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedLanguage && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Estimated Price
                </Label>
                <div className="text-2xl font-bold">${price}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Additional Notes
              </Label>
              <Textarea
                placeholder="Add any specific requirements or notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Upload File
              </Label>
              <Button disabled={!selectedLanguage || uploading} className="w-full">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={!selectedLanguage || uploading}
                />
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

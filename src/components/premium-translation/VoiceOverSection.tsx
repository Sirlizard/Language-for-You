import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./FileUpload";
import { LanguageSelector } from "./LanguageSelector";
import { PriceDisplay } from "./PriceDisplay";
import { Download } from "lucide-react";

export const VoiceOverSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceFileId, setVoiceFileId] = useState<string | null>(null);
  const { toast } = useToast();
  const price = Math.floor(Math.random() * 1000);

  const downloadFile = async (fileId: string, prefix: string) => {
    try {
      const { data: fileData } = await supabase
        .from("shared_files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (!fileData) throw new Error("File not found");

      const { data, error: downloadError } = await supabase.storage
        .from("shared_files")
        .download(fileData.file_path);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${prefix}_${fileData.filename}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleVoiceOver = async () => {
    if (!file || !voiceLanguage) {
      toast({
        title: "Missing information",
        description: "Please select a file and language for voice-over",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', voiceLanguage);

      const { data, error } = await supabase.functions.invoke('voice-over', {
        body: { ...formData, userId: user.id }
      });

      if (error) throw error;

      setVoiceFileId(data.fileId);
      toast({
        title: "Success",
        description: "Voice-over generated successfully",
      });

      // Reset form
      setFile(null);
      setVoiceLanguage("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate voice-over",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <FileUpload onFileChange={setFile} />

      <LanguageSelector
        label="Voice Language"
        value={voiceLanguage}
        onChange={setVoiceLanguage}
      />

      <PriceDisplay price={price} />

      <Button
        onClick={handleVoiceOver}
        disabled={!file || !voiceLanguage || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Generate Voice Over"}
      </Button>

      {voiceFileId && (
        <Button
          onClick={() => downloadFile(voiceFileId, 'voice_over')}
          variant="outline"
          className="w-full"
        >
          <Download className="mr-2" />
          Download Audio File
        </Button>
      )}
    </div>
  );
};
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/premium-translation/FileUpload";
import { LanguageSelector } from "@/components/premium-translation/LanguageSelector";
import { PriceDisplay } from "@/components/premium-translation/PriceDisplay";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PremiumTranslation = () => {
  // Translation states
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [translatedFileId, setTranslatedFileId] = useState<string | null>(null);
  
  // Voice-over states
  const [voiceOverFile, setVoiceOverFile] = useState<File | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<string>("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
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

  const handleTranslation = async () => {
    if (!file || !sourceLanguage || !targetLanguage) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload original file
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("shared_files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create file record
      const { data: fileData, error: fileError } = await supabase
        .from("shared_files")
        .insert({
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          file_size: file.size,
          uploader_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Create premium translation job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          file_id: fileData.id,
          language: targetLanguage,
          payment_amount: price,
          status: "pending_translation",
          is_premium_translation: true,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      console.log("Created job:", jobData);

      // Call translation function
      const { error: translationError } = await supabase.functions.invoke(
        "translate-file",
        {
          body: { jobId: jobData.id },
        }
      );

      if (translationError) throw translationError;

      // Get the translated file ID
      const { data: updatedJob } = await supabase
        .from("jobs")
        .select("returned_file_id")
        .eq("id", jobData.id)
        .single();

      if (updatedJob?.returned_file_id) {
        setTranslatedFileId(updatedJob.returned_file_id);
      }

      toast({
        title: "Success",
        description: "Translation job created and processed successfully",
      });

      // Reset form
      setFile(null);
      setSourceLanguage("");
      setTargetLanguage("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process translation job",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceOver = async () => {
    if (!voiceOverFile || !voiceLanguage) {
      toast({
        title: "Missing information",
        description: "Please select a file and language for voice-over",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingVoice(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append('file', voiceOverFile);
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
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate voice-over",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
        <div className="space-y-8">
          {/* Translation Section */}
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-6">Premium Translation</h1>
            <p className="mb-8 text-gray-600">
              This feature is for a simple AI translation meant for only premium users.
            </p>

            <div className="max-w-2xl space-y-6">
              <FileUpload onFileChange={setFile} />

              <div className="grid grid-cols-2 gap-4">
                <LanguageSelector
                  label="Source Language"
                  value={sourceLanguage}
                  onChange={setSourceLanguage}
                />
                <LanguageSelector
                  label="Target Language"
                  value={targetLanguage}
                  onChange={setTargetLanguage}
                />
              </div>

              <PriceDisplay price={price} />

              <Button
                onClick={handleTranslation}
                disabled={!file || !sourceLanguage || !targetLanguage || isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Translate File"}
              </Button>

              {translatedFileId && (
                <Button
                  onClick={() => downloadFile(translatedFileId, 'translated')}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2" />
                  Download Translated File
                </Button>
              )}
            </div>
          </Card>

          <Separator />

          {/* Voice Over Section */}
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-6">Premium Voice Over</h1>
            <p className="mb-8 text-gray-600">
              Convert your text into natural-sounding speech in multiple languages.
            </p>

            <div className="max-w-2xl space-y-6">
              <FileUpload onFileChange={setVoiceOverFile} />

              <LanguageSelector
                label="Voice Language"
                value={voiceLanguage}
                onChange={setVoiceLanguage}
              />

              <PriceDisplay price={price} />

              <Button
                onClick={handleVoiceOver}
                disabled={!voiceOverFile || !voiceLanguage || isProcessingVoice}
                className="w-full"
              >
                {isProcessingVoice ? "Processing..." : "Generate Voice Over"}
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumTranslation;
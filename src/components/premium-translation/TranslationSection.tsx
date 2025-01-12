import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./FileUpload";
import { LanguageSelector } from "./LanguageSelector";
import { PriceDisplay } from "./PriceDisplay";
import { Download } from "lucide-react";

export const TranslationSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [translatedFileId, setTranslatedFileId] = useState<string | null>(null);
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
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("shared_files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          file_id: fileData.id,
          language: targetLanguage,
          payment_amount: price,
          status: "open", // Changed from "pending_translation" to "open"
          is_premium_translation: true,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      const { error: translationError } = await supabase.functions.invoke(
        "translate-file",
        {
          body: { jobId: jobData.id },
        }
      );

      if (translationError) throw translationError;

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

  return (
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
  );
};
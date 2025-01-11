import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/premium-translation/FileUpload";
import { LanguageSelector } from "@/components/premium-translation/LanguageSelector";
import { PriceDisplay } from "@/components/premium-translation/PriceDisplay";

const PremiumTranslation = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const price = Math.floor(Math.random() * 1000);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6">
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
        </div>
      </div>
    </div>
  );
};

export default PremiumTranslation;
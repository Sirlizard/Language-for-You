import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
}

export const FileUpload = ({ onFileChange }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "text/plain" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        onFileChange(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .docx file",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <Label htmlFor="file">Upload File (txt or docx)</Label>
      <input
        id="file"
        type="file"
        accept=".txt,.docx"
        onChange={handleFileChange}
        className="mt-1 block w-full"
      />
    </div>
  );
};